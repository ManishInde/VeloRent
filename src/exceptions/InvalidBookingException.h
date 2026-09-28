#pragma once
#include "BusinessRuleException.h"

namespace velorent {

/**
 * @brief Thrown when a booking request fails application-level validation (e.g., invalid dates, expired licence, ineligible customer).
 */
class InvalidBookingException : public BusinessRuleException {
public:
    explicit InvalidBookingException(const std::string& message)
        : BusinessRuleException("Invalid Booking: " + message) {}
};

} // namespace velorent
