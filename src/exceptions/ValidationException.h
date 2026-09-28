#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when input data fails domain validation rules.
 */
class ValidationException : public VeloRentException {
public:
    explicit ValidationException(const std::string& message)
        : VeloRentException("Validation Error: " + message) {}
};

} // namespace velorent
