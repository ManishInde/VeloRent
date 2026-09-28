#include "ReviewController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"

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

} // namespace velorent
