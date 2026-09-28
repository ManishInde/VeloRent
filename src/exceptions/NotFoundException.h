#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when a requested entity cannot be found.
 */
class NotFoundException : public VeloRentException {
public:
    explicit NotFoundException(const std::string& message)
        : VeloRentException("Not Found Error: " + message) {}
};

} // namespace velorent
