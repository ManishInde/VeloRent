#pragma once
#include "BusinessRuleException.h"

namespace velorent {

/**
 * @brief Thrown when attempting an operation on a rental that is not in ACTIVE state.
 */
class RentalNotActiveException : public BusinessRuleException {
public:
    explicit RentalNotActiveException(const std::string& message)
        : BusinessRuleException("Rental Not Active: " + message) {}
};

} // namespace velorent
