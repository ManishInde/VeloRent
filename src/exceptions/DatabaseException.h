#pragma once
#include "VeloRentException.h"

namespace velorent {

/**
 * @brief Thrown when a MySQL database or query execution error occurs.
 * Preserves error code and SQL state without leaking raw connection pointers.
 */
class DatabaseException : public VeloRentException {
private:
    unsigned int errorCode;
    std::string sqlState;

public:
    explicit DatabaseException(const std::string& message,
                               unsigned int errorCode = 0,
                               const std::string& sqlState = "")
        : VeloRentException("Database Error [" + std::to_string(errorCode) + "]: " + message),
          errorCode(errorCode), sqlState(sqlState) {}

    unsigned int getErrorCode() const { return errorCode; }
    const std::string& getSqlState() const { return sqlState; }
};

} // namespace velorent
