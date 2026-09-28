#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when authentication is missing, invalid, or expired.
 */
class UnauthorizedException : public VeloRentException {
public:
    explicit UnauthorizedException(const std::string& message)
        : VeloRentException(message) {}
};

} // namespace velorent
