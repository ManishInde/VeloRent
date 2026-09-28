#pragma once
#include <stdexcept>
#include <string>

namespace velorent {

/**
 * @brief Base exception class for all VeloRent domain and application exceptions.
 */
class VeloRentException : public std::runtime_error {
public:
    explicit VeloRentException(const std::string& message)
        : std::runtime_error(message) {}
};

} // namespace velorent
