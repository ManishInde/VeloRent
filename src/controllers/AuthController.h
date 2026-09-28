#pragma once
#include "AuthService.h"
#include "AuthMiddleware.h"
#include "httplib.h"

namespace velorent {

class AuthController {
private:
    AuthService& authService;
    AuthMiddleware& authMiddleware;

public:
    AuthController(AuthService& aService, AuthMiddleware& aMiddleware);

    void registerRoutes(httplib::Server& svr);

    void handleLogin(const httplib::Request& req, httplib::Response& res);
    void handleLogout(const httplib::Request& req, httplib::Response& res);
    void handleGetCurrentUser(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
