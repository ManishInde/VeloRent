#pragma once
#include "Vehicle.h"

namespace velorent {

/**
 * @brief Represents a standard sedan or hatchback car.
 * OOP Concepts: Inheritance, Polymorphism.
 */
class Car : public Vehicle {
public:
    Car(int id,
        const std::string& registrationNumber,
        const std::string& brand,
        const std::string& model,
        int categoryId,
        FuelType fuelType,
        TransmissionType transmission,
        int seats,
        double baseRentalRate,
        int odometerKm = 0,
        double healthScore = 100.0,
        VehicleStatus status = VehicleStatus::AVAILABLE,
        int purchaseYear = 2024);

    std::string getVehicleType() const override { return "CAR"; }
    double calculateMaintenanceFactor() const override;
    double calculateRentalCost(int durationDays) const override;
};

} // namespace velorent
