#include "PaymentController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"

namespace velorent {

PaymentController::PaymentController(PaymentService& paymentService, AuthMiddleware& authMiddleware)
    : paymentService(paymentService), authMiddleware(authMiddleware) {}

void PaymentController::processPayment(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        auto body = nlohmann::json::parse(req.body);
        int rentalId = body.at("rentalId").get<int>();
        double amount = body.at("amount").get<double>();
        std::string methodStr = body.value("method", "CARD");
        std::string typeStr = body.value("type", "RENTAL_FEE");

        PaymentMethod method = EnumUtils::stringToPaymentMethod(methodStr);
        PaymentType type = EnumUtils::stringToPaymentType(typeStr);

        int paymentId = paymentService.processPayment(rentalId, amount, method, type);
        Payment payment = paymentService.getPaymentById(paymentId);
        HttpResponse::success(res, JsonUtils::toJson(payment), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void PaymentController::getPaymentsByRental(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int rentalId = std::stoi(req.matches[1]);
        auto payments = paymentService.getPaymentsByRental(rentalId);
        HttpResponse::collection(res, JsonUtils::toJson(payments));
    } catch (...) {
        throw;
    }
}

void PaymentController::getCustomerPayments(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int customerId = std::stoi(req.matches[1]);
        if (auth.role == UserRole::CUSTOMER && auth.userId != customerId) {
            HttpResponse::error(res, 403, "FORBIDDEN", "You can only view your own payment records.");
            return;
        }

        auto payments = paymentService.getPaymentsByCustomer(customerId);
        HttpResponse::collection(res, JsonUtils::toJson(payments));
    } catch (...) {
        throw;
    }
}

} // namespace velorent
