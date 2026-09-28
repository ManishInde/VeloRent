#pragma once
#include "ReviewRepository.h"
#include "RentalRepository.h"
#include "Review.h"
#include <vector>

namespace velorent {

class ReviewService {
private:
    ReviewRepository& reviewRepo;
    RentalRepository& rentalRepo;

public:
    ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo);

    int submitReview(Review& review);
    Review getReviewById(int reviewId);
    Review getReviewByRental(int rentalId);
    std::vector<Review> getVehicleReviews(int vehicleId);
    std::vector<Review> getCustomerReviews(int customerId);

    void validateReview(const Review& review);
};

} // namespace velorent
