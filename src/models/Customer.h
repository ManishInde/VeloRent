#pragma once
#include "User.h"

namespace velorent {

/**
 * @brief Represents a customer user in VeloRent.
 * OOP Concepts Demonstrated:
 * - Inheritance: Subclass of User.
 * - Polymorphism: Overrides displayDashboard() and getRoleName().
 * - Encapsulation: Customer-specific attributes (driving license, risk score, rental count).
 */
class Customer : public User {
private:
    std::string drivingLicenseNumber;
    std::string licenseExpiry;
    int totalRentals;
    double riskScore;

public:
    Customer(int id,
             const std::string& fullName,
             const std::string& email,
             const std::string& passwordHash,
             const std::string& phone,
             const std::string& drivingLicenseNumber,
             const std::string& licenseExpiry = "",
             int totalRentals = 0,
             double riskScore = 0.0,
             AccountStatus status = AccountStatus::ACTIVE,
             const std::string& createdAt = "");

    std::string displayDashboard() const override;
    std::string getRoleName() const override { return "CUSTOMER"; }

    // Getters & Setters
    const std::string& getDrivingLicenseNumber() const { return drivingLicenseNumber; }
    const std::string& getLicenseExpiry() const { return licenseExpiry; }
    int getTotalRentals() const { return totalRentals; }
    double getRiskScore() const { return riskScore; }

    void setDrivingLicenseNumber(const std::string& license);
    void setLicenseExpiry(const std::string& expiry) { licenseExpiry = expiry; }
    void setTotalRentals(int count);
    void setRiskScore(double score);
    void incrementRentals() { totalRentals++; }
};

} // namespace velorent
