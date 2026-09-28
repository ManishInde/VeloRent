#include "BookingController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"

namespace velorent {

BookingController::BookingController(BookingService& bookingService, AuthMiddleware& authMiddleware)
    : bookingService(bookingService), authMiddleware(authMiddleware) {}

void BookingController::createBooking(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        auto body = nlohmann::json::parse(req.body);
        int customerId = body.value("customerId", 0);

        // Derive/enforce customer identity for CUSTOMER role
        if (auth.role == UserRole::CUSTOMER) {
            customerId = auth.userId;
        } else if (customerId <= 0) {
            customerId = auth.userId;
        }

        int vehicleId = body.at("vehicleId").get<int>();
        std::string startDate = body.at("startDate").get<std::string>();
        std::string endDate = body.at("endDate").get<std::string>();

        int bookingId = bookingService.createBooking(customerId, vehicleId, startDate, endDate);
        Booking booking = bookingService.getBookingById(bookingId);
        HttpResponse::success(res, JsonUtils::toJson(booking), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void BookingController::getBookingById(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int id = std::stoi(req.matches[1]);
        Booking booking = bookingService.getBookingById(id);
        if (booking.getId() == 0) {
            HttpResponse::notFound(res, "Booking with ID " + std::to_string(id) + " not found.");
            return;
        }

        AuthMiddleware::checkOwnership(auth, booking.getCustomerId());

        HttpResponse::success(res, JsonUtils::toJson(booking));
    } catch (...) {
        throw;
    }
}

void BookingController::cancelBooking(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        int id = std::stoi(req.matches[1]);
        Booking booking = bookingService.getBookingById(id);
        if (booking.getId() == 0) {
            HttpResponse::notFound(res, "Booking with ID " + std::to_string(id) + " not found.");
            return;
        }

        AuthMiddleware::checkOwnership(auth, booking.getCustomerId());

        int cancelledBy = auth.userId;
        std::string reason = "Cancelled via REST API";
        if (!req.body.empty()) {
            try {
                auto body = nlohmann::json::parse(req.body);
                if (body.contains("reason")) reason = body["reason"].get<std::string>();
            } catch (...) {}
        }

        bool ok = bookingService.cancelBooking(id, cancelledBy, reason);
        if (!ok) {
            HttpResponse::notFound(res, "Booking with ID " + std::to_string(id) + " not found or cannot be cancelled.");
            return;
        }
        Booking updated = bookingService.getBookingById(id);
        HttpResponse::success(res, JsonUtils::toJson(updated));
    } catch (...) {
        throw;
    }
}

} // namespace velorent
