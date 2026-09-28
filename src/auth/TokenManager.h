#pragma once
#include "User.h"
#include "AuthContext.h"
#include <string>
#include <set>
#include <mutex>

namespace velorent {

/**
 * @brief Manages HMAC-SHA256 JWT creation, verification, expiration, and revocation.
 */
class TokenManager {
private:
    std::string secretKey;
    int defaultTtlSeconds;
    std::set<std::string> revokedTokens;
    std::mutex revocationMutex;

    static std::string base64UrlEncode(const std::string& input);
    static std::string base64UrlDecode(const std::string& input);
    static std::string hmacSha256(const std::string& data, const std::string& key);

public:
    explicit TokenManager(const std::string& secret = "velorent_jwt_default_secret_2026",
                          int ttlSeconds = 86400);

    void setSecretKey(const std::string& secret) { secretKey = secret; }
    void setDefaultTtl(int seconds) { defaultTtlSeconds = seconds; }

    /**
     * @brief Generate signed JWT token for user.
     */
    std::string generateToken(const User& user, int customTtlSeconds = 0);

    /**
     * @brief Validate signed JWT token and populate AuthContext.
     * @return true if token is valid, signature matches, not expired, and not revoked.
     */
    bool validateToken(const std::string& token, AuthContext& outContext);

    /**
     * @brief Revoke token (for server-side logout tracking).
     */
    void revokeToken(const std::string& tokenId);

    /**
     * @brief Check if token is revoked.
     */
    bool isRevoked(const std::string& tokenId);
};

} // namespace velorent
