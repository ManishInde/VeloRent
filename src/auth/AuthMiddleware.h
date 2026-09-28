#pragma once
#include "TokenManager.h"
#include "AuthContext.h"
#include "httplib.h"
#include "UnauthorizedException.h"
#include "ForbiddenException.h"
#include <initializer_list>
#include <vector>

namespace velorent {

/**
 * @brief Middleware component for extracting request identity and enforcing RBAC & ownership rules.
 */
class AuthMiddleware {
private:
    TokenManager& tokenManager;

public:
    explicit AuthMiddleware(TokenManager& tMgr);

    /**
     * @brief Extract AuthContext from HTTP request 'Authorization: Bearer <token>' header.
     */
    AuthContext extractAuthContext(const httplib::Request& req) const;

    /**
     * @brief Enforce that request is authenticated. Throws UnauthorizedException (401) if not.
     */
    static void requireAuthenticated(const AuthContext& auth);

    /**
     * @brief Enforce that request has specific role. Throws ForbiddenException (403) if not.
     */
    static void requireRole(const AuthContext& auth, UserRole role);

    /**
     * @brief Enforce that request has any of specified roles. Throws ForbiddenException (403) if not.
     */
    static void requireAnyRole(const AuthContext& auth, std::initializer_list<UserRole> roles);

    /**
     * @brief Enforce resource ownership.
     * If auth user is CUSTOMER: targetCustomerId MUST equal auth.userId.
     * ADMIN can access globally. FLEET_MANAGER/MAINTENANCE_STAFF can access if relevant.
     * Throws ForbiddenException (403) if unauthorized.
     */
    static void checkOwnership(const AuthContext& auth, int targetCustomerId);
};

} // namespace velorent
