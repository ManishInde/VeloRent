#include "AuthService.h"
#include "PasswordHasher.h"
#include "NotFoundException.h"
#include "Logger.h"

namespace velorent {

AuthService::AuthService(UserRepository& uRepo,
                         TokenManager& tMgr,
                         int maxAttempts,
                         int lockoutSecs)
    : userRepo(uRepo), tokenManager(tMgr),
      maxFailedAttempts(maxAttempts), lockoutDurationSeconds(lockoutSecs)
{
}

bool AuthService::isLockedOut(const std::string& email) {
    std::lock_guard<std::mutex> lock(trackerMutex);
    auto it = attemptTracker.find(email);
    if (it == attemptTracker.end()) return false;

    auto now = std::chrono::steady_clock::now();
    if (it->second.failedCount >= maxFailedAttempts) {
        if (now < it->second.lockUntil) {
            return true;
        } else {
            // Lockout period expired; reset
            it->second.failedCount = 0;
            return false;
        }
    }
    return false;
}

void AuthService::recordFailedAttempt(const std::string& email) {
    std::lock_guard<std::mutex> lock(trackerMutex);
    auto& rec = attemptTracker[email];
    rec.failedCount++;
    if (rec.failedCount >= maxFailedAttempts) {
        rec.lockUntil = std::chrono::steady_clock::now() + std::chrono::seconds(lockoutDurationSeconds);
        Logger::info("Account/IP locked out for email: " + email + " due to repeated failed logins.");
    }
}

void AuthService::resetAttempts(const std::string& email) {
    std::lock_guard<std::mutex> lock(trackerMutex);
    attemptTracker.erase(email);
}

LoginResult AuthService::login(const std::string& email, const std::string& password) {
    LoginResult res;

    if (email.empty() || password.empty()) {
        res.success = false;
        res.statusCode = 400;
        res.errorMessage = "Email and password are required.";
        return res;
    }

    if (isLockedOut(email)) {
        res.success = false;
        res.statusCode = 429; // Too Many Requests / Lockout
        res.errorMessage = "Account temporarily locked due to excessive failed login attempts. Please try again later.";
        return res;
    }

    try {
        std::shared_ptr<User> user = userRepo.findByEmail(email);

        if (!user || !user->isActive()) {
            recordFailedAttempt(email);
            res.success = false;
            res.statusCode = 401;
            res.errorMessage = "Invalid email or password.";
            return res;
        }

        bool match = PasswordHasher::verifyPassword(password, user->getPasswordHash());
        if (!match) {
            recordFailedAttempt(email);
            res.success = false;
            res.statusCode = 401;
            res.errorMessage = "Invalid email or password.";
            return res;
        }

        // Login successful: reset failed attempt counter
        resetAttempts(email);

        int ttlSeconds = 86400; // 24 hours
        std::string token = tokenManager.generateToken(*user, ttlSeconds);

        res.success = true;
        res.statusCode = 200;
        res.token = token;
        res.expiresInSeconds = ttlSeconds;
        res.user = user;
        return res;

    } catch (const NotFoundException&) {
        // User not found: record attempt & return generic 401
        recordFailedAttempt(email);
        res.success = false;
        res.statusCode = 401;
        res.errorMessage = "Invalid email or password.";
        return res;
    } catch (const std::exception& ex) {
        res.success = false;
        res.statusCode = 500;
        res.errorMessage = "Authentication failed due to internal error: " + std::string(ex.what());
        return res;
    }
}

bool AuthService::logout(const std::string& token) {
    AuthContext ctx;
    if (tokenManager.validateToken(token, ctx)) {
        tokenManager.revokeToken(ctx.tokenId);
        return true;
    }
    return false;
}

std::shared_ptr<User> AuthService::getCurrentUser(int userId) {
    if (userId <= 0) return nullptr;
    try {
        return userRepo.findById(userId);
    } catch (...) {
        return nullptr;
    }
}

} // namespace velorent
