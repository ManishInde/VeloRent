#include "TokenManager.h"
#include "EnumUtils.h"
#include "json.hpp"
#include <chrono>
#include <sstream>
#include <iomanip>
#include <random>

namespace velorent {

// Base64URL encoding/decoding helpers
std::string TokenManager::base64UrlEncode(const std::string& input) {
    static const char charSet[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    std::string res;
    size_t i = 0;
    size_t len = input.length();
    while (i < len) {
        uint32_t b1 = static_cast<uint8_t>(input[i++]);
        res += charSet[b1 >> 2];
        b1 = (b1 & 0x03) << 4;
        if (i >= len) {
            res += charSet[b1];
            break;
        }
        uint32_t b2 = static_cast<uint8_t>(input[i++]);
        b1 |= (b2 >> 4);
        res += charSet[b1];
        b1 = (b2 & 0x0f) << 2;
        if (i >= len) {
            res += charSet[b1];
            break;
        }
        uint32_t b3 = static_cast<uint8_t>(input[i++]);
        b1 |= (b3 >> 6);
        res += charSet[b1];
        res += charSet[b3 & 0x3f];
    }
    return res;
}

std::string TokenManager::base64UrlDecode(const std::string& input) {
    std::string s = input;
    // Replace URL characters back
    for (char& c : s) {
        if (c == '-') c = '+';
        else if (c == '_') c = '/';
    }
    while (s.length() % 4 != 0) s += '=';

    static const std::string b64Chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    size_t i = 0;
    while (i < s.length()) {
        if (s[i] == '=') break;
        size_t pos1 = b64Chars.find(s[i++]);
        if (pos1 == std::string::npos) break;

        if (s[i] == '=') break;
        size_t pos2 = b64Chars.find(s[i++]);
        if (pos2 == std::string::npos) break;

        out += static_cast<char>((pos1 << 2) | (pos2 >> 4));

        if (i >= s.length() || s[i] == '=') break;
        size_t pos3 = b64Chars.find(s[i++]);
        if (pos3 == std::string::npos) break;

        out += static_cast<char>(((pos2 & 0x0f) << 4) | (pos3 >> 2));

        if (i >= s.length() || s[i] == '=') break;
        size_t pos4 = b64Chars.find(s[i++]);
        if (pos4 == std::string::npos) break;

        out += static_cast<char>(((pos3 & 0x03) << 6) | pos4);
    }
    return out;
}

// Pure C++ HMAC-SHA256 implementation
static std::vector<uint8_t> sha256Bytes(const std::string& input) {
    // SHA-256 implementation
    uint32_t h[8] = {
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    };

    static const uint32_t k[64] = {
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef4a3f7, 0xc67178f2
    };

    std::vector<uint8_t> msg(input.begin(), input.end());
    uint64_t bitLen = msg.size() * 8;
    msg.push_back(0x80);
    while ((msg.size() % 64) != 56) {
        msg.push_back(0x00);
    }
    for (int i = 7; i >= 0; --i) {
        msg.push_back(static_cast<uint8_t>((bitLen >> (i * 8)) & 0xff));
    }

    auto rightRotate = [](uint32_t val, uint32_t bits) -> uint32_t {
        return (val >> bits) | (val << (32 - bits));
    };

    for (size_t chunk = 0; chunk < msg.size(); chunk += 64) {
        uint32_t w[64];
        for (int i = 0; i < 16; ++i) {
            w[i] = (static_cast<uint32_t>(msg[chunk + i * 4]) << 24) |
                   (static_cast<uint32_t>(msg[chunk + i * 4 + 1]) << 16) |
                   (static_cast<uint32_t>(msg[chunk + i * 4 + 2]) << 8) |
                   (static_cast<uint32_t>(msg[chunk + i * 4 + 3]));
        }
        for (int i = 16; i < 64; ++i) {
            uint32_t s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >> 3);
            uint32_t s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16] + s0 + w[i - 7] + s1;
        }

        uint32_t a = h[0], b = h[1], c = h[2], d = h[3];
        uint32_t e = h[4], f = h[5], g = h[6], hVal = h[7];

        for (int i = 0; i < 64; ++i) {
            uint32_t S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            uint32_t ch = (e & f) ^ ((~e) & g);
            uint32_t temp1 = hVal + S1 + ch + k[i] + w[i];
            uint32_t S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            uint32_t maj = (a & b) ^ (a & c) ^ (b & c);
            uint32_t temp2 = S0 + maj;

            hVal = g;
            g = f;
            f = e;
            e = d + temp1;
            d = c;
            c = b;
            b = a;
            a = temp1 + temp2;
        }

        h[0] += a; h[1] += b; h[2] += c; h[3] += d;
        h[4] += e; h[5] += f; h[6] += g; h[7] += hVal;
    }

    std::vector<uint8_t> result(32);
    for (int i = 0; i < 8; ++i) {
        result[i * 4]     = static_cast<uint8_t>((h[i] >> 24) & 0xff);
        result[i * 4 + 1] = static_cast<uint8_t>((h[i] >> 16) & 0xff);
        result[i * 4 + 2] = static_cast<uint8_t>((h[i] >> 8) & 0xff);
        result[i * 4 + 3] = static_cast<uint8_t>(h[i] & 0xff);
    }
    return result;
}

std::string TokenManager::hmacSha256(const std::string& data, const std::string& key) {
    const size_t blockSize = 64;
    std::vector<uint8_t> keyBytes;
    if (key.length() > blockSize) {
        keyBytes = sha256Bytes(key);
    } else {
        keyBytes.assign(key.begin(), key.end());
    }
    while (keyBytes.size() < blockSize) {
        keyBytes.push_back(0);
    }

    std::string oKeyPad(blockSize, 0);
    std::string iKeyPad(blockSize, 0);
    for (size_t i = 0; i < blockSize; ++i) {
        oKeyPad[i] = static_cast<char>(keyBytes[i] ^ 0x5c);
        iKeyPad[i] = static_cast<char>(keyBytes[i] ^ 0x36);
    }

    std::string innerData = iKeyPad + data;
    std::vector<uint8_t> innerHashBytes = sha256Bytes(innerData);
    std::string innerHash(innerHashBytes.begin(), innerHashBytes.end());

    std::string outerData = oKeyPad + innerHash;
    std::vector<uint8_t> outerHashBytes = sha256Bytes(outerData);

    return std::string(outerHashBytes.begin(), outerHashBytes.end());
}

TokenManager::TokenManager(const std::string& secret, int ttlSeconds)
    : secretKey(secret), defaultTtlSeconds(ttlSeconds)
{
}

std::string TokenManager::generateToken(const User& user, int customTtlSeconds) {
    int ttl = (customTtlSeconds > 0) ? customTtlSeconds : defaultTtlSeconds;

    auto now = std::chrono::system_clock::now();
    long long iat = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    long long exp = iat + ttl;

    // Unique JTI token identifier
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<uint64_t> dis;
    std::ostringstream ss;
    ss << "jti_" << user.getId() << "_" << iat << "_" << dis(gen);
    std::string jti = ss.str();

    // 1. Header
    nlohmann::json header = {
        {"alg", "HS256"},
        {"typ", "JWT"}
    };

    // 2. Payload
    nlohmann::json payload = {
        {"sub", user.getId()},
        {"email", user.getEmail()},
        {"role", EnumUtils::toString(user.getRole())},
        {"status", EnumUtils::toString(user.getStatus())},
        {"iat", iat},
        {"exp", exp},
        {"jti", jti}
    };

    std::string headerB64 = base64UrlEncode(header.dump());
    std::string payloadB64 = base64UrlEncode(payload.dump());
    std::string signingInput = headerB64 + "." + payloadB64;

    // 3. Signature
    std::string sigRaw = hmacSha256(signingInput, secretKey);
    std::string sigB64 = base64UrlEncode(sigRaw);

    return signingInput + "." + sigB64;
}

bool TokenManager::validateToken(const std::string& token, AuthContext& outContext) {
    outContext = AuthContext(); // Reset context

    if (token.empty()) return false;

    // Split token into 3 parts: Header.Payload.Signature
    size_t firstDot = token.find('.');
    if (firstDot == std::string::npos) return false;

    size_t secondDot = token.find('.', firstDot + 1);
    if (secondDot == std::string::npos) return false;

    std::string headerB64 = token.substr(0, firstDot);
    std::string payloadB64 = token.substr(firstDot + 1, secondDot - firstDot - 1);
    std::string sigB64 = token.substr(secondDot + 1);

    // Verify HMAC-SHA256 Signature
    std::string signingInput = headerB64 + "." + payloadB64;
    std::string expectedSigRaw = hmacSha256(signingInput, secretKey);
    std::string expectedSigB64 = base64UrlEncode(expectedSigRaw);

    if (sigB64 != expectedSigB64) {
        return false; // Signature mismatch!
    }

    // Parse payload
    try {
        std::string payloadJsonStr = base64UrlDecode(payloadB64);
        nlohmann::json payload = nlohmann::json::parse(payloadJsonStr);

        auto now = std::chrono::system_clock::now();
        long long currentTime = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();

        long long exp = payload.value("exp", 0LL);
        if (currentTime >= exp) {
            return false; // Token expired!
        }

        std::string jti = payload.value("jti", "");
        if (!jti.empty() && isRevoked(jti)) {
            return false; // Token revoked!
        }

        outContext.userId = payload.value("sub", 0);
        outContext.email = payload.value("email", "");
        outContext.role = EnumUtils::stringToUserRole(payload.value("role", "CUSTOMER"));
        outContext.status = EnumUtils::stringToAccountStatus(payload.value("status", "ACTIVE"));
        outContext.authenticated = (outContext.userId > 0 && outContext.status == AccountStatus::ACTIVE);
        outContext.tokenId = jti;
        outContext.issuedAt = payload.value("iat", 0LL);
        outContext.expiresAt = exp;

        return outContext.authenticated;
    } catch (...) {
        return false;
    }
}

void TokenManager::revokeToken(const std::string& tokenId) {
    if (tokenId.empty()) return;
    std::lock_guard<std::mutex> lock(revocationMutex);
    revokedTokens.insert(tokenId);
}

bool TokenManager::isRevoked(const std::string& tokenId) {
    if (tokenId.empty()) return false;
    std::lock_guard<std::mutex> lock(revocationMutex);
    return revokedTokens.find(tokenId) != revokedTokens.end();
}

} // namespace velorent
