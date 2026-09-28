#pragma once
#include "Vehicle.h"

namespace velorent {

/**
 * @brief Represents an Electric Vehicle (EV).
 * OOP Concepts: Inheritance, Polymorphism (EV maintenance & battery telemetry).
 */
class ElectricVehicle : public Vehicle {
private:
    double batteryCapacityKwh;
    double currentChargePercent;
    int rangeKm;

public:
    ElectricVehicle(int id,
                    const std::string& registrationNumber,
                    const std::string& brand,
                    const std::string& model,
                    int categoryId,
                    TransmissionType transmission,
                    int seats,
                    double baseRentalRate,
                    double batteryCapacityKwh = 60.0,
                    double currentChargePercent = 100.0,
                    int rangeKm = 400,
                    int odometerKm = 0,
                    double healthScore = 100.0,
                    VehicleStatus status = VehicleStatus::AVAILABLE,
                    int purchaseYear = 2024);

    std::string getVehicleType() const override { return "ELECTRIC"; }
    double calculateMaintenanceFactor() const override;
    double calculateRentalCost(int durationDays) const override;
    std::string displaySummary() const override;

    double getBatteryCapacityKwh() const { return batteryCapacityKwh; }
    double getCurrentChargePercent() const { return currentChargePercent; }
    int getRangeKm() const { return rangeKm; }

    void setCurrentChargePercent(double percent);
    void setBatteryCapacityKwh(double capacity) { batteryCapacityKwh = capacity; }
    void setRangeKm(int range) { rangeKm = range; }
};

} // namespace velorent
