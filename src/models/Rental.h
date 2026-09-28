#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents an active or completed physical vehicle rental trip.
 * OOP Concepts: Encapsulation, Composition (refers to Booking by ID).
 */
class Rental : public IEntity {
private:
    int id;
    int bookingId;
    std::string actualStart;
    std::string actualReturn;
    int startingOdometer;
    int endingOdometer;
    RentalStatus status;
    std::string createdAt;

public:
    Rental(int id,
           int bookingId,
           const std::string& actualStart,
           int startingOdometer,
           const std::string& actualReturn = "",
           int endingOdometer = 0,
           RentalStatus status = RentalStatus::ACTIVE,
           const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    // Domain methods
    int calculateDistanceTravelled() const;
    bool isOverdue(const std::string& expectedEndDate) const;
    bool isCompleted() const { return status == RentalStatus::COMPLETED; }

    // Getters
    int getBookingId() const { return bookingId; }
    const std::string& getActualStart() const { return actualStart; }
    const std::string& getActualReturn() const { return actualReturn; }
    int getStartingOdometer() const { return startingOdometer; }
    int getEndingOdometer() const { return endingOdometer; }
    RentalStatus getStatus() const { return status; }
    const std::string& getCreatedAt() const { return createdAt; }

    // Mutators with domain validation
    void completeRental(const std::string& returnTimestamp, int finalOdometer);
    void setStatus(RentalStatus newStatus) { status = newStatus; }
    void setStartingOdometer(int odo);
};

} // namespace velorent
