#pragma once
#include <string>

namespace velorent {

/**
 * @brief Utility class for secure password hashing and verification using Bcrypt.
 * Responsibilities:
 * - Hash plaintext passwords using Bcrypt with configurable cost factor
 * - Verify candidate plaintext password against stored Bcrypt hash
 * - Prevent plaintext password logging, exposure, or insecure hash algorithms
 */
class PasswordHasher {
public:
    /**
     * @brief Hash a plaintext password using Bcrypt with a salt.
     * @param password Plaintext password to hash
     * @param workFactor Cost factor (default 12)
     * @return Formatted Bcrypt hash string ($2b$12$...)
     */
    static std::string hashPassword(const std::string& password, int workFactor = 12);

    /**
     * @brief Verify a candidate plaintext password against a stored Bcrypt hash.
     * @param password Plaintext password to check
     * @param storedHash Stored Bcrypt hash string
     * @return true if password matches hash, false otherwise
     */
    static bool verifyPassword(const std::string& password, const std::string& storedHash);
};

} // namespace velorent
