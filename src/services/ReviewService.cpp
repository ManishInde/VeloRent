#include "ReviewService.h"
#include "ValidationException.h"
#include "BusinessRuleException.h"
#include "Logger.h"
#include "EnumUtils.h"

namespace velorent {

ReviewService::ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo)
    : reviewRepo(rRepo), rentalRepo(renRepo)
{
}

int ReviewService::submitReview(Review& review) {
    Logger::info("ReviewService: Submitting review for Rental ID " + std::to_string(review.getRentalId()));

    // Business Rule: Customer should only be allowed to review a COMPLETED rental
    auto rental = rentalRepo.findById(review.getRentalId());
    if (rental.getStatus() != RentalStatus::COMPLETED) {
        throw BusinessRuleException("Reviews can only be submitted for COMPLETED rentals.");
    }

    validateReview(review);

    int id = reviewRepo.save(review);
    Logger::info("ReviewService: Review submitted successfully with ID " + std::to_string(id));
    return id;
}

Review ReviewService::getReviewById(int reviewId) {
    return reviewRepo.findById(reviewId);
}

Review ReviewService::getReviewByRental(int rentalId) {
    return reviewRepo.findByRental(rentalId);
}

std::vector<Review> ReviewService::getVehicleReviews(int vehicleId) {
    return reviewRepo.findByVehicle(vehicleId);
}

std::vector<Review> ReviewService::getCustomerReviews(int customerId) {
    return reviewRepo.findByCustomer(customerId);
}

void ReviewService::validateReview(const Review& review) {
    if (review.getRating() < 1 || review.getRating() > 5) {
        throw ValidationException("Review rating must be between 1 and 5.");
    }
}

} // namespace velorent
