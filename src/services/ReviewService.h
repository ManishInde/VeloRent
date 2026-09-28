#pragma once
#include "ReviewRepository.h"
#include "RentalRepository.h"
#include "BookingRepository.h"
#include "VehicleRepository.h"
#include "Review.h"
#include <vector>
#include <memory>

namespace velorent {

class ReviewService {
private:
    ReviewRepository& reviewRepo;
    RentalRepository& rentalRepo;
    BookingRepository* bookingRepo;
    VehicleRepository* vehicleRepo;
    std::unique_ptr<BookingRepository> defaultBookingRepo;

public:
    ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo, BookingRepository& bRepo, VehicleRepository* vRepo = nullptr);
    ReviewService(ReviewRepository& rRepo, RentalRepository& renRepo);

    int submitReview(Review& review);
    Review getReviewById(int reviewId);
    Review getReviewByRental(int rentalId);
    std::vector<Review> getVehicleReviews(int vehicleId);
    std::vector<Review> getCustomerReviews(int customerId);

    void validateReview(const Review& review);
};

} // namespace velorent
