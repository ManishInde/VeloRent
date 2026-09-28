#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a customer's reservation for a vehicle.
 * OOP Concepts: Encapsulation, Composition (refers to Customer & Vehicle by ID).
 */
class Booking : public IEntity {
private:
    int id;
    int customerId;
    int vehicleId;
    std::string startDate;
    std::string endDate;
    BookingStatus status;
    double quotedPrice;
    std::string createdAt;

public:
    Booking(int id,
            int customerId,
            int vehicleId,
            const std::string& startDate,
            const std::string& endDate,
            double quotedPrice,
            BookingStatus status = BookingStatus::CONFIRMED,
            const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    // Domain methods
    int getDurationDays() const;
    bool isValidDateRange() const;

    // Getters
    int getCustomerId() const { return customerId; }
    int getVehicleId() const { return vehicleId; }
    const std::string& getStartDate() const { return startDate; }
    const std::string& getEndDate() const { return endDate; }
    BookingStatus getStatus() const { return status; }
    double getQuotedPrice() const { return quotedPrice; }
    const std::string& getCreatedAt() const { return createdAt; }

    // Mutators with validation
    void setDateRange(const std::string& start, const std::string& end);
    void setQuotedPrice(double price);
    void setStatus(BookingStatus newStatus) { status = newStatus; }
};

} // namespace velorent
