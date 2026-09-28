#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when an operation violates domain business logic constraints.
 */
class BusinessRuleException : public VeloRentException {
public:
    explicit BusinessRuleException(const std::string& message)
        : VeloRentException("Business Rule Error: " + message) {}
};

} // namespace velorent
