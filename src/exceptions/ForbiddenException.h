#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when user is authenticated but lacks required role or resource ownership.
 */
class ForbiddenException : public VeloRentException {
public:
    explicit ForbiddenException(const std::string& message)
        : VeloRentException(message) {}
};

} // namespace velorent
