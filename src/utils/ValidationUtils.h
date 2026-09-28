#pragma once
#include <string>

namespace velorent {

class ValidationUtils {
public:
    static void validateEmail(const std::string& email);
    static void validatePhone(const std::string& phone);
    static void validatePositiveRate(double rate, const std::string& fieldName = "Rate");
    static void validateNonNegativeAmount(double amount, const std::string& fieldName = "Amount");
    static void validateHealthScore(double score);
    static void validateSeats(int seats);
    static void validateRating(int rating);
    static void validateOdometer(int odometer);
    static void validateNonEmptyString(const std::string& str, const std::string& fieldName);
};

} // namespace velorent
