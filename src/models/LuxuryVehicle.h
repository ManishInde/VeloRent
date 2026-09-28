#pragma once
#include "Vehicle.h"

namespace velorent {

/**
 * @brief Represents a high-end luxury vehicle.
 * OOP Concepts: Inheritance, Polymorphism (luxury surcharge & mandatory security deposit multiplier).
 */
class LuxuryVehicle : public Vehicle {
private:
    double luxuryTaxMultiplier;
    double securityDepositINR;

public:
    LuxuryVehicle(int id,
                  const std::string& registrationNumber,
                  const std::string& brand,
                  const std::string& model,
                  int categoryId,
                  FuelType fuelType,
                  TransmissionType transmission,
                  int seats,
                  double baseRentalRate,
                  double securityDepositINR = 25000.0,
                  double luxuryTaxMultiplier = 1.25,
                  int odometerKm = 0,
                  double healthScore = 100.0,
                  VehicleStatus status = VehicleStatus::AVAILABLE,
                  int purchaseYear = 2024);

    std::string getVehicleType() const override { return "LUXURY"; }
    double calculateMaintenanceFactor() const override;
    double calculateRentalCost(int durationDays) const override;

    double getLuxuryTaxMultiplier() const { return luxuryTaxMultiplier; }
    double getSecurityDepositINR() const { return securityDepositINR; }

    void setSecurityDepositINR(double deposit);
};

} // namespace velorent
