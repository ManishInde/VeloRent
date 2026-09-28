#pragma once
#include "BusinessRuleException.h"

namespace velorent {

/**
 * @brief Thrown when a vehicle cannot be booked or rented because it is unavailable, reserved, rented, or under maintenance.
 */
class VehicleUnavailableException : public BusinessRuleException {
public:
    explicit VehicleUnavailableException(const std::string& message)
        : BusinessRuleException("Vehicle Unavailable: " + message) {}
};

} // namespace velorent
