#pragma once
#include "Vehicle.h"

namespace velorent {

/**
 * @brief Represents a motorcycle or scooter bike vehicle.
 * OOP Concepts: Inheritance, Polymorphism (custom rental cost & maintenance factor).
 */
class Bike : public Vehicle {
private:
    int engineCc;

public:
    Bike(int id,
         const std::string& registrationNumber,
         const std::string& brand,
         const std::string& model,
         int categoryId,
         FuelType fuelType,
         TransmissionType transmission,
         int seats,
         double baseRentalRate,
         int engineCc = 150,
         int odometerKm = 0,
         double healthScore = 100.0,
         VehicleStatus status = VehicleStatus::AVAILABLE,
         int purchaseYear = 2024);

    std::string getVehicleType() const override { return "BIKE"; }
    double calculateMaintenanceFactor() const override;
    double calculateRentalCost(int durationDays) const override;

    int getEngineCc() const { return engineCc; }
    void setEngineCc(int cc) { engineCc = cc; }
};

} // namespace velorent
