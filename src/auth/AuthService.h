#pragma once
#include "UserRepository.h"
#include "TokenManager.h"
#include "User.h"
#include <string>
#include <memory>
#include <map>
#include <mutex>
#include <chrono>

namespace velorent {

struct LoginResult {
    bool success = false;
    std::string token = "";
    int expiresInSeconds = 0;
    std::shared_ptr<User> user = nullptr;
    std::string errorMessage = "";
    int statusCode = 200;
};

class AuthService {
private:
    UserRepository& userRepo;
    TokenManager& tokenManager;

    // Login attempt rate limiting structure
    struct LoginAttemptRecord {
        int failedCount = 0;
        std::chrono::steady_clock::time_point lockUntil;
    };
    std::map<std::string, LoginAttemptRecord> attemptTracker;
    std::mutex trackerMutex;
    int maxFailedAttempts;
    int lockoutDurationSeconds;

    bool isLockedOut(const std::string& email);
    void recordFailedAttempt(const std::string& email);
    void resetAttempts(const std::string& email);

public:
    AuthService(UserRepository& uRepo,
                TokenManager& tMgr,
                int maxAttempts = 5,
                int lockoutSecs = 900);

    /**
     * @brief Authenticate user by email & password.
     * @return LoginResult containing JWT token and user info on success.
     */
    LoginResult login(const std::string& email, const std::string& password);

    /**
     * @brief Revoke token on user logout.
     */
    bool logout(const std::string& token);

    /**
     * @brief Retrieve user details by ID for authenticated identity.
     */
    std::shared_ptr<User> getCurrentUser(int userId);
};

} // namespace velorent
