#include "ReviewController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "BusinessRuleException.h"
#include "DatabaseException.h"
#include "NotFoundException.h"

namespace velorent {

ReviewController::ReviewController(ReviewService& reviewService, ReviewRepository& reviewRepo, AuthMiddleware& authMiddleware)
    : reviewService(reviewService), reviewRepo(reviewRepo), authMiddleware(authMiddleware) {}

void ReviewController::submitReview(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        auto body = nlohmann::json::parse(req.body);
        int rentalId = body.at("rentalId").get<int>();
        int rating = body.at("rating").get<int>();
        std::string comment = body.value("comment", "");
        int vehicleId = body.value("vehicleId", 0);

        Review rev(0, rentalId, auth.userId, vehicleId, rating, comment);
        int newId = reviewService.submitReview(rev);
        Review review = reviewService.getReviewById(newId);
        HttpResponse::success(res, JsonUtils::toJson(review), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (const BusinessRuleException& ex) {
        HttpResponse::conflict(res, ex.what());
    } catch (const DatabaseException& ex) {
        std::string msg = ex.what();
        if (msg.find("Duplicate entry") != std::string::npos || msg.find("1062") != std::string::npos || msg.find("uq_review_rental") != std::string::npos) {
            HttpResponse::conflict(res, "A review already exists for this rental.");
        } else {
            throw;
        }
    } catch (...) {
        throw;
    }
}

void ReviewController::getVehicleReviews(const httplib::Request& req, httplib::Response& res) {
    try {
        int vehicleId = std::stoi(req.matches[1]);
        auto reviews = reviewService.getVehicleReviews(vehicleId);
        HttpResponse::collection(res, JsonUtils::toJson(reviews));
    } catch (...) {
        throw;
    }
}

void ReviewController::getCustomerReviews(const httplib::Request& req, httplib::Response& res) {
    try {
        int customerId = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, customerId);

        auto reviews = reviewService.getCustomerReviews(customerId);
        HttpResponse::collection(res, JsonUtils::toJson(reviews));
    } catch (...) {
        throw;
    }
}

void ReviewController::getAllReviews(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        int vehicleId = 0;
        int rating = 0;
        std::string search = "";

        if (req.has_param("vehicleId")) {
            try {
                vehicleId = std::stoi(req.get_param_value("vehicleId"));
            } catch (...) {}
        }
        if (req.has_param("rating")) {
            try {
                rating = std::stoi(req.get_param_value("rating"));
            } catch (...) {}
        }
        if (req.has_param("search")) {
            search = req.get_param_value("search");
        }

        auto detailed = reviewService.getAllReviewsDetailed(vehicleId, rating, search);

        nlohmann::json items = nlohmann::json::array();
        for (const auto& d : detailed) {
            nlohmann::json obj;
            obj["id"] = d.id;
            obj["rating"] = d.rating;
            obj["comment"] = d.comment;
            obj["rentalId"] = d.rentalId;
            obj["vehicle"] = {
                {"id", d.vehicleId},
                {"brand", d.vehicleBrand},
                {"model", d.vehicleModel},
                {"type", d.vehicleCategory},
                {"registrationNumber", d.vehicleRegistration}
            };
            obj["customer"] = {
                {"id", d.customerId},
                {"name", d.customerName},
                {"email", d.customerEmail}
            };
            obj["createdAt"] = d.createdAt;
            items.push_back(obj);
        }

        HttpResponse::collection(res, items);
    } catch (...) {
        throw;
    }
}

void ReviewController::getRentalReview(const httplib::Request& req, httplib::Response& res) {
    try {
        int rentalId = std::stoi(req.matches[1]);
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        try {
            Review review = reviewService.getReviewByRental(rentalId);
            HttpResponse::success(res, JsonUtils::toJson(review));
        } catch (const NotFoundException&) {
            HttpResponse::notFound(res, "No review found for rental ID " + std::to_string(rentalId));
        }
    } catch (...) {
        throw;
    }
}

} // namespace velorent
