#pragma once
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Context object representing authenticated identity of the current HTTP request.
 */
struct AuthContext {
    int userId = 0;
    std::string email = "";
    UserRole role = UserRole::CUSTOMER;
    AccountStatus status = AccountStatus::INACTIVE;
    bool authenticated = false;
    std::string tokenId = "";
    long long issuedAt = 0;
    long long expiresAt = 0;

    /**
     * @brief Helper to check if user has active authenticated identity.
     */
    bool isAuthenticated() const {
        return authenticated && userId > 0 && status == AccountStatus::ACTIVE;
    }

    /**
     * @brief Helper to check if context matches specified role.
     */
    bool hasRole(UserRole targetRole) const {
        return isAuthenticated() && role == targetRole;
    }

    /**
     * @brief Helper to check if context matches any specified role.
     */
    bool hasAnyRole(const std::initializer_list<UserRole>& roles) const {
        if (!isAuthenticated()) return false;
        for (auto r : roles) {
            if (role == r) return true;
        }
        return false;
    }
};

} // namespace velorent
