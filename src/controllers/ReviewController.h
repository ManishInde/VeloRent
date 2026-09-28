#pragma once
#include "httplib.h"
#include "ReviewService.h"
#include "ReviewRepository.h"
#include "AuthMiddleware.h"

namespace velorent {

class ReviewController {
private:
    ReviewService& reviewService;
    ReviewRepository& reviewRepo;
    AuthMiddleware& authMiddleware;

public:
    ReviewController(ReviewService& reviewService, ReviewRepository& reviewRepo, AuthMiddleware& authMiddleware);

    void submitReview(const httplib::Request& req, httplib::Response& res);
    void getVehicleReviews(const httplib::Request& req, httplib::Response& res);
    void getCustomerReviews(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
