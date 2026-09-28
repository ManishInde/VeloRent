#include "AuthMiddleware.h"

namespace velorent {

AuthMiddleware::AuthMiddleware(TokenManager& tMgr)
    : tokenManager(tMgr)
{
}

AuthContext AuthMiddleware::extractAuthContext(const httplib::Request& req) const {
    AuthContext ctx;
    if (!req.has_header("Authorization")) {
        return ctx;
    }

    std::string authHeader = req.get_header_value("Authorization");
    std::string prefix = "Bearer ";
    if (authHeader.length() <= prefix.length() || authHeader.find(prefix) != 0) {
        return ctx;
    }

    std::string token = authHeader.substr(prefix.length());
    tokenManager.validateToken(token, ctx);
    return ctx;
}

void AuthMiddleware::requireAuthenticated(const AuthContext& auth) {
    if (!auth.isAuthenticated()) {
        throw UnauthorizedException("Authentication required. Please provide a valid Bearer token.");
    }
}

void AuthMiddleware::requireRole(const AuthContext& auth, UserRole role) {
    requireAuthenticated(auth);
    if (!auth.hasRole(role)) {
        throw ForbiddenException("You do not have permission to perform this action.");
    }
}

void AuthMiddleware::requireAnyRole(const AuthContext& auth, std::initializer_list<UserRole> roles) {
    requireAuthenticated(auth);
    if (!auth.hasAnyRole(roles)) {
        throw ForbiddenException("You do not have permission to perform this action.");
    }
}

void AuthMiddleware::checkOwnership(const AuthContext& auth, int targetCustomerId) {
    requireAuthenticated(auth);

    // ADMIN has global access
    if (auth.role == UserRole::ADMIN) {
        return;
    }

    // CUSTOMER can only access their own resources
    if (auth.role == UserRole::CUSTOMER) {
        if (auth.userId != targetCustomerId) {
            throw ForbiddenException("Access denied: You do not have permission to access another customer's resource.");
        }
        return;
    }

    // FLEET_MANAGER and MAINTENANCE_STAFF permissions depend on action; default allow if not CUSTOMER restriction
    return;
}

} // namespace velorent
