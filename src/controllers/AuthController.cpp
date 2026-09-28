#include "AuthController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"
#include "json.hpp"

namespace velorent {

AuthController::AuthController(AuthService& aService, AuthMiddleware& aMiddleware)
    : authService(aService), authMiddleware(aMiddleware)
{
}

void AuthController::registerRoutes(httplib::Server& svr) {
    svr.Post("/api/auth/login", [this](const httplib::Request& req, httplib::Response& res) {
        handleLogin(req, res);
    });

    svr.Post("/api/auth/logout", [this](const httplib::Request& req, httplib::Response& res) {
        handleLogout(req, res);
    });

    svr.Get("/api/auth/me", [this](const httplib::Request& req, httplib::Response& res) {
        handleGetCurrentUser(req, res);
    });
}

void AuthController::handleLogin(const httplib::Request& req, httplib::Response& res) {
    try {
        nlohmann::json body = nlohmann::json::parse(req.body);
        std::string email = body.value("email", "");
        std::string password = body.value("password", "");

        if (email.empty() || password.empty()) {
            HttpResponse::error(res, 400, "BAD_REQUEST", "Email and password are required.");
            return;
        }

        LoginResult result = authService.login(email, password);
        if (!result.success) {
            std::string errCode = (result.statusCode == 429) ? "TOO_MANY_REQUESTS" : "INVALID_CREDENTIALS";
            HttpResponse::error(res, result.statusCode, errCode, result.errorMessage);
            return;
        }

        nlohmann::json userObj;
        if (result.user) {
            userObj = {
                {"id", result.user->getId()},
                {"fullName", result.user->getFullName()},
                {"email", result.user->getEmail()},
                {"phone", result.user->getPhone()},
                {"role", result.user->getRoleName()},
                {"status", EnumUtils::toString(result.user->getStatus())}
            };
        }

        nlohmann::json data = {
            {"token", result.token},
            {"expiresIn", result.expiresInSeconds},
            {"user", userObj}
        };

        HttpResponse::success(res, data, 200);
    } catch (const nlohmann::json::exception&) {
        HttpResponse::error(res, 400, "BAD_REQUEST", "Invalid JSON payload.");
    } catch (...) {
        throw;
    }
}

void AuthController::handleLogout(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        std::string authHeader = req.get_header_value("Authorization");
        std::string token = authHeader.substr(7); // Remove "Bearer "
        authService.logout(token);

        nlohmann::json data = {
            {"message", "Successfully logged out. Please discard your authentication token."}
        };
        HttpResponse::success(res, data, 200);
    } catch (...) {
        throw;
    }
}

void AuthController::handleGetCurrentUser(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        std::shared_ptr<User> user = authService.getCurrentUser(auth.userId);
        if (!user) {
            HttpResponse::notFound(res, "User identity not found.");
            return;
        }

        nlohmann::json userObj = {
            {"id", user->getId()},
            {"fullName", user->getFullName()},
            {"email", user->getEmail()},
            {"phone", user->getPhone()},
            {"role", user->getRoleName()},
            {"status", EnumUtils::toString(user->getStatus())},
            {"createdAt", user->getCreatedAt()}
        };

        HttpResponse::success(res, userObj, 200);
    } catch (...) {
        throw;
    }
}

} // namespace velorent
