#include "Customer.h"
#include "ValidationUtils.h"
#include "ValidationException.h"
#include <sstream>

namespace velorent {

Customer::Customer(int id,
                   const std::string& fullName,
                   const std::string& email,
                   const std::string& passwordHash,
                   const std::string& phone,
                   const std::string& drivingLicenseNumber,
                   const std::string& licenseExpiry,
                   int totalRentals,
                   double riskScore,
                   AccountStatus status,
                   const std::string& createdAt)
    : User(id, fullName, email, passwordHash, phone, UserRole::CUSTOMER, status, createdAt),
      licenseExpiry(licenseExpiry)
{
    setDrivingLicenseNumber(drivingLicenseNumber);
    setTotalRentals(totalRentals);
    setRiskScore(riskScore);
}

std::string Customer::displayDashboard() const {
    std::ostringstream ss;
    ss << "=== Customer Dashboard ===\n"
       << "Welcome, " << fullName << "!\n"
       << "License: " << drivingLicenseNumber << "\n"
       << "Total Completed Rentals: " << totalRentals << "\n"
       << "Customer Risk Score: " << riskScore << "/100.0\n";
    return ss.str();
}

void Customer::setDrivingLicenseNumber(const std::string& license) {
    ValidationUtils::validateNonEmptyString(license, "Driving License Number");
    drivingLicenseNumber = license;
}

void Customer::setTotalRentals(int count) {
    if (count < 0) {
        throw ValidationException("Total rentals cannot be negative.");
    }
    totalRentals = count;
}

void Customer::setRiskScore(double score) {
    if (score < 0.0 || score > 100.0) {
        throw ValidationException("Risk score must be between 0.0 and 100.0.");
    }
    riskScore = score;
}

} // namespace velorent
