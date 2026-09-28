#include "CustomerController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "PasswordHasher.h"

namespace velorent {

CustomerController::CustomerController(CustomerService& customerService,
                                         BookingRepository& bookingRepo,
                                         RentalRepository& rentalRepo,
                                         PaymentRepository& paymentRepo,
                                         LoyaltyRepository& loyaltyRepo,
                                         CustomerRiskEngine& riskEngine,
                                         AuthMiddleware& authMiddleware)
    : customerService(customerService), bookingRepo(bookingRepo),
      rentalRepo(rentalRepo), paymentRepo(paymentRepo),
      loyaltyRepo(loyaltyRepo), riskEngine(riskEngine),
      authMiddleware(authMiddleware) {}

void CustomerController::registerCustomer(const httplib::Request& req, httplib::Response& res) {
    try {
        auto body = nlohmann::json::parse(req.body);
        std::string fullName = body.at("fullName").get<std::string>();
        std::string email = body.at("email").get<std::string>();
        std::string pass = body.at("password").get<std::string>();
        std::string phone = body.at("phone").get<std::string>();
        std::string license = body.at("drivingLicenseNumber").get<std::string>();
        std::string expiry = body.value("licenseExpiry", "2030-01-01");

        // Hash plaintext password using Bcrypt
        std::string hashedPass = PasswordHasher::hashPassword(pass);

        Customer newCust(0, fullName, email, hashedPass, phone, license, expiry);
        int newId = customerService.registerCustomer(newCust);
        auto customer = customerService.getCustomerById(newId);
        HttpResponse::success(res, JsonUtils::toJson(*customer), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON payload error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void CustomerController::getCustomerById(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, id);

        auto customer = customerService.getCustomerById(id);
        if (!customer) {
            HttpResponse::notFound(res, "Customer with ID " + std::to_string(id) + " not found.");
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(*customer));
    } catch (...) {
        throw;
    }
}

void CustomerController::getCustomerBookings(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, id);

        auto bookings = customerService.getBookingHistory(id);
        HttpResponse::collection(res, JsonUtils::toJson(bookings));
    } catch (...) {
        throw;
    }
}

void CustomerController::getCustomerRentals(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, id);

        auto rentals = customerService.getRentalHistory(id);
        HttpResponse::collection(res, JsonUtils::toJson(rentals));
    } catch (...) {
        throw;
    }
}

void CustomerController::getCustomerLoyalty(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, id);

        auto loyalty = loyaltyRepo.findAccountByCustomer(id);
        if (loyalty.getId() == 0) {
            LoyaltyAccount defaultAcc(0, id, 0, 0, LoyaltyTier::BRONZE, "");
            HttpResponse::success(res, JsonUtils::toJson(defaultAcc));
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(loyalty));
    } catch (...) {
        throw;
    }
}

void CustomerController::getCustomerRisk(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, id);

        auto customer = customerService.getCustomerById(id);
        if (!customer) {
            HttpResponse::notFound(res, "Customer with ID " + std::to_string(id) + " not found.");
            return;
        }

        auto bookings = customerService.getBookingHistory(id);
        auto rentals = customerService.getRentalHistory(id);
        auto payments = paymentRepo.findByCustomer(id);

        auto riskResult = riskEngine.evaluateCustomerRisk(*customer, bookings, rentals, {}, payments);
        nlohmann::json data = JsonUtils::toJson(riskResult);
        data["customerId"] = id;
        HttpResponse::success(res, data);
    } catch (...) {
        throw;
    }
}

} // namespace velorent
