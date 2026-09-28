#include "ReviewRepository.h"
#include "RowMappers.h"
#include "NotFoundException.h"

namespace velorent {

ReviewRepository::ReviewRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Review ReviewRepository::findById(int reviewId) {
    std::string sql = "SELECT * FROM reviews WHERE review_id = ?";
    ResultSet rs = db.executeQuery(sql, {reviewId});
    if (rs.empty()) {
        throw NotFoundException("Review with ID " + std::to_string(reviewId) + " not found.");
    }
    return RowMappers::mapReview(rs[0]);
}

Review ReviewRepository::findByRental(int rentalId) {
    std::string sql = "SELECT * FROM reviews WHERE rental_id = ?";
    ResultSet rs = db.executeQuery(sql, {rentalId});
    if (rs.empty()) {
        throw NotFoundException("Review for rental ID " + std::to_string(rentalId) + " not found.");
    }
    return RowMappers::mapReview(rs[0]);
}

std::vector<Review> ReviewRepository::findByVehicle(int vehicleId) {
    std::string sql = "SELECT * FROM reviews WHERE vehicle_id = ? ORDER BY review_id DESC";
    ResultSet rs = db.executeQuery(sql, {vehicleId});
    std::vector<Review> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapReview(row));
    }
    return list;
}

std::vector<Review> ReviewRepository::findByCustomer(int customerId) {
    std::string sql = "SELECT * FROM reviews WHERE customer_id = ? ORDER BY review_id DESC";
    ResultSet rs = db.executeQuery(sql, {customerId});
    std::vector<Review> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapReview(row));
    }
    return list;
}

int ReviewRepository::save(Review& review) {
    std::string sql = "INSERT INTO reviews (rental_id, customer_id, vehicle_id, rating, comment) VALUES (?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        review.getRentalId(),
        review.getCustomerId(),
        review.getVehicleId(),
        review.getRating(),
        review.getComment()
    });
    return static_cast<int>(newId);
}

} // namespace velorent
