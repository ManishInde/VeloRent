#pragma once
#include "Review.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

struct ReviewDetail {
    int id{0};
    int rentalId{0};
    int customerId{0};
    int vehicleId{0};
    int rating{0};
    std::string comment;
    std::string createdAt;
    std::string vehicleBrand;
    std::string vehicleModel;
    std::string vehicleRegistration;
    std::string vehicleCategory;
    std::string customerName;
    std::string customerEmail;
};

class ReviewRepository {
private:
    DatabaseManager& db;

public:
    explicit ReviewRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Review findById(int reviewId);
    Review findByRental(int rentalId);
    std::vector<Review> findByVehicle(int vehicleId);
    std::vector<Review> findByCustomer(int customerId);
    std::vector<ReviewDetail> findAllDetailed(int vehicleId = 0, int rating = 0, const std::string& search = "");

    int save(Review& review);
};

} // namespace velorent
