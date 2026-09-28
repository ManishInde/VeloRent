#pragma once
#include "Review.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class ReviewRepository {
private:
    DatabaseManager& db;

public:
    explicit ReviewRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Review findById(int reviewId);
    Review findByRental(int rentalId);
    std::vector<Review> findByVehicle(int vehicleId);
    std::vector<Review> findByCustomer(int customerId);

    int save(Review& review);
};

} // namespace velorent
