#pragma once
#include "Vehicle.h"

namespace velorent {

/**
 * @brief Represents a Sports Utility Vehicle (SUV).
 * OOP Concepts: Inheritance, Polymorphism (capacity/rugged factor).
 */
class SUV : public Vehicle {
private:
    bool isFourWheelDrive;

public:
    SUV(int id,
        const std::string& registrationNumber,
        const std::string& brand,
        const std::string& model,
        int categoryId,
        FuelType fuelType,
        TransmissionType transmission,
        int seats,
        double baseRentalRate,
        bool isFourWheelDrive = true,
        int odometerKm = 0,
        double healthScore = 100.0,
        VehicleStatus status = VehicleStatus::AVAILABLE,
        int purchaseYear = 2024);

    std::string getVehicleType() const override { return "SUV"; }
    double calculateMaintenanceFactor() const override;
    double calculateRentalCost(int durationDays) const override;

    bool getIsFourWheelDrive() const { return isFourWheelDrive; }
    void setIsFourWheelDrive(bool fwd) { isFourWheelDrive = fwd; }
};

} // namespace velorent
