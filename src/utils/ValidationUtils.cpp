#include "ValidationUtils.h"
#include "ValidationException.h"
#include <regex>

namespace velorent {

void ValidationUtils::validateEmail(const std::string& email) {
    static const std::regex emailRegex(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    if (!std::regex_match(email, emailRegex)) {
        throw ValidationException("Invalid email format: " + email);
    }
}

void ValidationUtils::validatePhone(const std::string& phone) {
    if (phone.empty() || phone.length() < 7 || phone.length() > 15) {
        throw ValidationException("Phone number must be between 7 and 15 digits: " + phone);
    }
}

void ValidationUtils::validatePositiveRate(double rate, const std::string& fieldName) {
    if (rate <= 0.0) {
        throw ValidationException(fieldName + " must be strictly positive (> 0). Value: " + std::to_string(rate));
    }
}

void ValidationUtils::validateNonNegativeAmount(double amount, const std::string& fieldName) {
    if (amount < 0.0) {
        throw ValidationException(fieldName + " cannot be negative. Value: " + std::to_string(amount));
    }
}

void ValidationUtils::validateHealthScore(double score) {
    if (score < 0.0 || score > 100.0) {
        throw ValidationException("Health score must be between 0.0 and 100.0. Value: " + std::to_string(score));
    }
}

void ValidationUtils::validateSeats(int seats) {
    if (seats <= 0) {
        throw ValidationException("Vehicle seat count must be positive (> 0). Value: " + std::to_string(seats));
    }
}

void ValidationUtils::validateRating(int rating) {
    if (rating < 1 || rating > 5) {
        throw ValidationException("Rating must be an integer between 1 and 5. Value: " + std::to_string(rating));
    }
}

void ValidationUtils::validateOdometer(int odometer) {
    if (odometer < 0) {
        throw ValidationException("Odometer reading cannot be negative. Value: " + std::to_string(odometer));
    }
}

void ValidationUtils::validateNonEmptyString(const std::string& str, const std::string& fieldName) {
    if (str.empty()) {
        throw ValidationException(fieldName + " cannot be empty.");
    }
}

} // namespace velorent
