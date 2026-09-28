#include "RentalController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"

namespace velorent {

RentalController::RentalController(RentalService& rentalService, AuthMiddleware& authMiddleware)
    : rentalService(rentalService), authMiddleware(authMiddleware) {}

void RentalController::startRental(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int bookingId = std::stoi(req.matches[1]);
        int startOdometer = 0;
        if (!req.body.empty()) {
            try {
                auto body = nlohmann::json::parse(req.body);
                if (body.contains("startOdometerKm")) {
                    startOdometer = body["startOdometerKm"].get<int>();
                }
            } catch (...) {}
        }

        int rentalId = rentalService.startRental(bookingId, startOdometer, auth.userId);
        Rental rental = rentalService.getRentalById(rentalId);
        HttpResponse::success(res, JsonUtils::toJson(rental), 201);
    } catch (...) {
        throw;
    }
}

void RentalController::getRentalById(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int id = std::stoi(req.matches[1]);
        Rental rental = rentalService.getRentalById(id);
        if (rental.getId() == 0) {
            HttpResponse::notFound(res, "Rental with ID " + std::to_string(id) + " not found.");
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(rental));
    } catch (...) {
        throw;
    }
}

void RentalController::returnRental(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int id = std::stoi(req.matches[1]);
        auto body = nlohmann::json::parse(req.body);
        int returnOdometer = body.at("returnOdometerKm").get<int>();

        bool ok = rentalService.returnVehicle(id, returnOdometer, auth.userId);
        if (!ok) {
            HttpResponse::notFound(res, "Rental with ID " + std::to_string(id) + " not found or cannot be returned.");
            return;
        }

        Rental rental = rentalService.getRentalById(id);
        HttpResponse::success(res, JsonUtils::toJson(rental));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

} // namespace velorent
