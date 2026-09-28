#pragma once
#include "httplib.h"
#include "LoyaltyService.h"
#include "LoyaltyEngine.h"
#include "AuthMiddleware.h"

namespace velorent {

class LoyaltyController {
private:
    LoyaltyService& loyaltyService;
    LoyaltyEngine& loyaltyEngine;
    AuthMiddleware& authMiddleware;

public:
    LoyaltyController(LoyaltyService& loyaltyService, LoyaltyEngine& loyaltyEngine, AuthMiddleware& authMiddleware);

    void getLoyaltyAccount(const httplib::Request& req, httplib::Response& res);
    void redeemPoints(const httplib::Request& req, httplib::Response& res);
    void earnPoints(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
