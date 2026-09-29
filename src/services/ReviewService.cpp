#include "ReviewService.h"
#include "ValidationException.h"
#include "BusinessRuleException.h"
#include "NotFoundException.h"
#include "ForbiddenException.h"
#include "DatabaseException.h"
#include "Logger.h"
#include "EnumUtils.h"

namespace velorent {

ReviewService::ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo, BookingRepository& bRepo, VehicleRepository* vRepo)
    : reviewRepo(rRepo), rentalRepo(renRepo), bookingRepo(&bRepo), vehicleRepo(vRepo), defaultBookingRepo(nullptr)
{
}

ReviewService::ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo)
    : reviewRepo(rRepo), rentalRepo(renRepo), bookingRepo(nullptr), vehicleRepo(nullptr)
{
    defaultBookingRepo = std::make_unique<BookingRepository>();
    bookingRepo = defaultBookingRepo.get();
}

int ReviewService::submitReview(Review& review) {
    Logger::info("ReviewService: Submitting review for Rental ID " + std::to_string(review.getRentalId()));

    // 1. Basic validation (rating must be between 1 and 5)
    validateReview(review);

    // 2. Business Rule: One review per completed rental (prevent duplicate review)
    try {
        reviewRepo.findByRental(review.getRentalId());
        throw BusinessRuleException("A review already exists for this rental.");
    } catch (const NotFoundException&) {
        // Expected: no existing review for this rental
    }

    // 3. Load rental from authoritative repository
    Rental rental = rentalRepo.findById(review.getRentalId());

    // 4. Business Rule: Customer should only be allowed to review a COMPLETED rental
    if (rental.getStatus() != RentalStatus::COMPLETED) {
        throw BusinessRuleException("Reviews can only be submitted for COMPLETED rentals.");
    }

    // 5. Load associated booking to get authoritative customer and vehicle relations
    if (!bookingRepo) {
        throw DatabaseException("Booking repository not available in ReviewService.");
    }
    Booking booking = bookingRepo->findById(rental.getBookingId());

    // 6. Enforce ownership: review author must match the booking's customer
    if (review.getCustomerId() > 0 && review.getCustomerId() != booking.getCustomerId()) {
        throw ForbiddenException("Customer ID " + std::to_string(review.getCustomerId()) +
                                 " is not authorized to review Rental ID " + std::to_string(review.getRentalId()) + ".");
    }

    // 7. Derive authoritative vehicle_id from the booking
    int authoritativeVehicleId = booking.getVehicleId();
    if (authoritativeVehicleId <= 0) {
        throw ValidationException("Invalid vehicle association for Rental ID " + std::to_string(review.getRentalId()) + ".");
    }

    // If client supplied a vehicleId, ensure it matches the authoritative vehicle
    if (review.getVehicleId() > 0 && review.getVehicleId() != authoritativeVehicleId) {
        throw ValidationException("Specified vehicle ID " + std::to_string(review.getVehicleId()) +
                                  " does not match rented vehicle ID " + std::to_string(authoritativeVehicleId) + ".");
    }

    // 8. Verify the vehicle actually exists in the fleet
    if (vehicleRepo) {
        auto v = vehicleRepo->findById(authoritativeVehicleId);
        if (!v) {
            throw NotFoundException("Vehicle ID " + std::to_string(authoritativeVehicleId) + " associated with rental not found.");
        }
    }

    // 9. Assign authoritative relationship IDs
    review.setCustomerId(booking.getCustomerId());
    review.setVehicleId(authoritativeVehicleId);

    // 10. Persist review with foreign key integrity guaranteed
    try {
        int id = reviewRepo.save(review);
        Logger::info("ReviewService: Review submitted successfully with ID " + std::to_string(id));
        return id;
    } catch (const DatabaseException& ex) {
        std::string msg = ex.what();
        if (msg.find("Duplicate entry") != std::string::npos || msg.find("1062") != std::string::npos || msg.find("uq_review_rental") != std::string::npos) {
            throw BusinessRuleException("A review already exists for this rental.");
        }
        throw;
    }
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

std::vector<ReviewDetail> ReviewService::getAllReviewsDetailed(int vehicleId, int rating, const std::string& search) {
    return reviewRepo.findAllDetailed(vehicleId, rating, search);
}

void ReviewService::validateReview(const Review& review) {
    if (review.getRating() < 1 || review.getRating() > 5) {
        throw ValidationException("Review rating must be between 1 and 5.");
    }
}

} // namespace velorent
