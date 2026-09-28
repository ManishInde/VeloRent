#include "Booking.h"
#include "DateUtils.h"
#include "ValidationUtils.h"
#include "ValidationException.h"
#include "EnumUtils.h"
#include "MoneyUtils.h"
#include <sstream>

namespace velorent {

Booking::Booking(int id,
                 int customerId,
                 int vehicleId,
                 const std::string& startDate,
                 const std::string& endDate,
                 double quotedPrice,
                 BookingStatus status,
                 const std::string& createdAt)
    : id(id), customerId(customerId), vehicleId(vehicleId),
      status(status), createdAt(createdAt)
{
    setDateRange(startDate, endDate);
    setQuotedPrice(quotedPrice);
}

std::string Booking::toString() const {
    std::ostringstream ss;
    ss << "Booking[ID: " << id << ", CustomerID: " << customerId
       << ", VehicleID: " << vehicleId
       << ", Dates: " << startDate << " to " << endDate
       << ", Days: " << getDurationDays()
       << ", QuotedPrice: INR " << quotedPrice
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

int Booking::getDurationDays() const {
    int days = DateUtils::daysBetween(startDate, endDate);
    return days <= 0 ? 1 : days;
}

bool Booking::isValidDateRange() const {
    return DateUtils::isBefore(startDate, endDate);
}

void Booking::setDateRange(const std::string& start, const std::string& end) {
    if (!DateUtils::isValidDateFormat(start) || !DateUtils::isValidDateFormat(end)) {
        throw ValidationException("Booking date must be in valid format (YYYY-MM-DD).");
    }
    if (!DateUtils::isBefore(start, end)) {
        throw ValidationException("Booking end date (" + end + ") must be after start date (" + start + ").");
    }
    startDate = start;
    endDate = end;
}

void Booking::setQuotedPrice(double price) {
    ValidationUtils::validateNonNegativeAmount(price, "Quoted Price");
    quotedPrice = MoneyUtils::roundToTwoDecimals(price);
}

} // namespace velorent
