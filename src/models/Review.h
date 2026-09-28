#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a customer review and rating for a rental/vehicle.
 */
class Review : public IEntity {
private:
    int id;
    int rentalId;
    int customerId;
    int vehicleId;
    int rating; // 1 to 5
    std::string comment;
    std::string createdAt;

public:
    Review(int id,
           int rentalId,
           int customerId,
           int vehicleId,
           int rating,
           const std::string& comment = "",
           const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    int getRentalId() const { return rentalId; }
    int getCustomerId() const { return customerId; }
    int getVehicleId() const { return vehicleId; }
    int getRating() const { return rating; }
    const std::string& getComment() const { return comment; }
    const std::string& getCreatedAt() const { return createdAt; }

    void setRating(int r);
    void setComment(const std::string& c) { comment = c; }
    void setVehicleId(int vId) { vehicleId = vId; }
    void setCustomerId(int cId) { customerId = cId; }
};

} // namespace velorent
