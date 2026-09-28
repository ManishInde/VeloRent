#include "Rental.h"
#include "ValidationUtils.h"
#include "ValidationException.h"
#include "DateUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

Rental::Rental(int id,
               int bookingId,
               const std::string& actualStart,
               int startingOdometer,
               const std::string& actualReturn,
               int endingOdometer,
               RentalStatus status,
               const std::string& createdAt)
    : id(id), bookingId(bookingId), actualStart(actualStart),
      actualReturn(actualReturn), endingOdometer(endingOdometer),
      status(status), createdAt(createdAt)
{
    setStartingOdometer(startingOdometer);
    if (endingOdometer > 0 && endingOdometer < startingOdometer) {
        throw ValidationException("Ending odometer cannot be less than starting odometer.");
    }
}

std::string Rental::toString() const {
    std::ostringstream ss;
    ss << "Rental[ID: " << id << ", BookingID: " << bookingId
       << ", Start: " << actualStart
       << ", Distance: " << calculateDistanceTravelled() << " km"
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

int Rental::calculateDistanceTravelled() const {
    if (endingOdometer <= startingOdometer) {
        return 0;
    }
    return endingOdometer - startingOdometer;
}

bool Rental::isOverdue(const std::string& expectedEndDate) const {
    if (status == RentalStatus::COMPLETED || status == RentalStatus::CANCELLED) {
        return false;
    }
    std::string current = DateUtils::getCurrentDate();
    return DateUtils::isAfter(current, expectedEndDate);
}

void Rental::completeRental(const std::string& returnTimestamp, int finalOdometer) {
    if (finalOdometer < startingOdometer) {
        throw ValidationException("Final odometer (" + std::to_string(finalOdometer) +
                                    ") cannot be less than starting odometer (" +
                                    std::to_string(startingOdometer) + ").");
    }
    actualReturn = returnTimestamp;
    endingOdometer = finalOdometer;
    status = RentalStatus::COMPLETED;
}

void Rental::setStartingOdometer(int odo) {
    ValidationUtils::validateOdometer(odo);
    startingOdometer = odo;
}

} // namespace velorent
