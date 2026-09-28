#include "LoyaltyController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"

namespace velorent {

LoyaltyController::LoyaltyController(LoyaltyService& loyaltyService, LoyaltyEngine& loyaltyEngine, AuthMiddleware& authMiddleware)
    : loyaltyService(loyaltyService), loyaltyEngine(loyaltyEngine), authMiddleware(authMiddleware) {}

void LoyaltyController::getLoyaltyAccount(const httplib::Request& req, httplib::Response& res) {
    try {
        int customerId = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, customerId);

        auto account = loyaltyService.getAccountByCustomer(customerId);
        if (account.getId() == 0) {
            HttpResponse::notFound(res, "Loyalty account for Customer ID " + std::to_string(customerId) + " not found.");
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(account));
    } catch (...) {
        throw;
    }
}

void LoyaltyController::redeemPoints(const httplib::Request& req, httplib::Response& res) {
    try {
        int customerId = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, customerId);

        auto body = nlohmann::json::parse(req.body);
        int points = body.at("points").get<int>();
        double rentalSubtotal = body.at("rentalSubtotal").get<double>();

        auto account = loyaltyService.getAccountByCustomer(customerId);
        if (account.getId() == 0) {
            HttpResponse::notFound(res, "Loyalty account for Customer ID " + std::to_string(customerId) + " not found.");
            return;
        }

        bool valid = loyaltyEngine.validateRedemption(account, points, rentalSubtotal);
        if (!valid) {
            HttpResponse::badRequest(res, "Loyalty points redemption request is invalid.");
            return;
        }

        double discountINR = loyaltyEngine.calculateRedemptionValueINR(points);
        bool canRedeem = loyaltyService.canRedeemPoints(customerId, points);
        if (!canRedeem) {
            HttpResponse::badRequest(res, "Insufficient loyalty points balance.");
            return;
        }

        account.deductPoints(points);
        nlohmann::json data = JsonUtils::toJson(account);
        data["pointsRedeemed"] = points;
        data["discountINR"] = discountINR;
        HttpResponse::success(res, data);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void LoyaltyController::earnPoints(const httplib::Request& req, httplib::Response& res) {
    try {
        int customerId = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, customerId);

        auto body = nlohmann::json::parse(req.body);
        double amountSpentINR = body.at("amountSpentINR").get<double>();

        int ptsEarned = loyaltyEngine.calculatePointsEarned(amountSpentINR);
        auto account = loyaltyService.getAccountByCustomer(customerId);
        if (account.getId() == 0) {
            HttpResponse::notFound(res, "Loyalty account for Customer ID " + std::to_string(customerId) + " not found.");
            return;
        }

        account.addPoints(ptsEarned);
        auto eval = loyaltyEngine.evaluateTier(account.getTotalPointsEarned(), account.getTier());
        if (eval.tierUpgraded) {
            account.setTier(eval.newTier);
        }

        nlohmann::json data = JsonUtils::toJson(account);
        data["pointsEarned"] = ptsEarned;
        data["tierMessage"] = eval.message;
        HttpResponse::success(res, data);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

} // namespace velorent
