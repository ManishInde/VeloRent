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

std::vector<ReviewDetail> ReviewRepository::findAllDetailed(int vehicleId, int rating, const std::string& search) {
    std::string sql = "SELECT r.review_id, r.rental_id, r.customer_id, r.vehicle_id, r.rating, "
                      "r.comment, DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, "
                      "v.brand AS vehicle_brand, v.model AS vehicle_model, v.registration_no AS vehicle_registration, "
                      "COALESCE(vc.category_name, 'Standard') AS vehicle_category, "
                      "u.full_name AS customer_name, u.email AS customer_email "
                      "FROM reviews r "
                      "JOIN vehicles v ON r.vehicle_id = v.vehicle_id "
                      "LEFT JOIN vehicle_categories vc ON v.category_id = vc.category_id "
                      "JOIN users u ON r.customer_id = u.user_id "
                      "WHERE 1=1 ";
    std::vector<DbValue> params;

    if (vehicleId > 0) {
        sql += " AND r.vehicle_id = ? ";
        params.push_back(vehicleId);
    }
    if (rating >= 1 && rating <= 5) {
        sql += " AND r.rating = ? ";
        params.push_back(rating);
    }
    if (!search.empty()) {
        sql += " AND (v.brand LIKE ? OR v.model LIKE ? OR u.full_name LIKE ? OR r.comment LIKE ?) ";
        std::string likeTerm = "%" + search + "%";
        params.push_back(likeTerm);
        params.push_back(likeTerm);
        params.push_back(likeTerm);
        params.push_back(likeTerm);
    }
    sql += " ORDER BY r.review_id DESC";

    ResultSet rs = db.executeQuery(sql, params);
    std::vector<ReviewDetail> list;
    for (const auto& row : rs) {
        ReviewDetail d;
        d.id = row.getInt("review_id");
        d.rentalId = row.getInt("rental_id");
        d.customerId = row.getInt("customer_id");
        d.vehicleId = row.getInt("vehicle_id");
        d.rating = row.getInt("rating");
        d.comment = row.getString("comment");
        d.createdAt = row.getString("created_at");
        d.vehicleBrand = row.getString("vehicle_brand");
        d.vehicleModel = row.getString("vehicle_model");
        d.vehicleRegistration = row.getString("vehicle_registration");
        d.vehicleCategory = row.getString("vehicle_category");
        d.customerName = row.getString("customer_name");
        d.customerEmail = row.getString("customer_email");
        list.push_back(d);
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
