#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Abstract Base class for all vehicles in VeloRent.
 * OOP Concepts Demonstrated:
 * - Abstraction: Abstract class with pure virtual methods.
 * - Encapsulation: Protected attributes with domain validation setters.
 * - Polymorphism: Virtual methods for rental cost, maintenance factor, and summary.
 */
class Vehicle : public IEntity {
protected:
    int id;
    std::string registrationNumber;
    std::string brand;
    std::string model;
    int categoryId;
    FuelType fuelType;
    TransmissionType transmission;
    int seats;
    double baseRentalRate;
    int odometerKm;
    double healthScore;
    VehicleStatus status;
    int purchaseYear;

public:
    Vehicle(int id,
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

    virtual ~Vehicle() = default;

    // Interface implementation
    int getId() const override { return id; }
    std::string toString() const override;

    // Virtual & Pure Virtual Methods (Polymorphism & Abstraction)
    virtual double calculateRentalCost(int durationDays) const;
    virtual std::string getVehicleType() const = 0;
    virtual double calculateMaintenanceFactor() const = 0;
    virtual std::string displaySummary() const;

    // Getters
    const std::string& getRegistrationNumber() const { return registrationNumber; }
    const std::string& getBrand() const { return brand; }
    const std::string& getModel() const { return model; }
    int getCategoryId() const { return categoryId; }
    FuelType getFuelType() const { return fuelType; }
    TransmissionType getTransmission() const { return transmission; }
    int getSeats() const { return seats; }
    double getBaseRentalRate() const { return baseRentalRate; }
    int getOdometerKm() const { return odometerKm; }
    double getHealthScore() const { return healthScore; }
    VehicleStatus getStatus() const { return status; }
    int getPurchaseYear() const { return purchaseYear; }

    // Mutators with domain validation
    void setRegistrationNumber(const std::string& reg);
    void setBrand(const std::string& b) { brand = b; }
    void setModel(const std::string& m) { model = m; }
    void setBaseRentalRate(double rate);
    void setOdometerKm(int km);
    void setHealthScore(double score);
    void setStatus(VehicleStatus newStatus) { status = newStatus; }
    void setSeats(int s);

    bool isAvailable() const { return status == VehicleStatus::AVAILABLE; }
};

} // namespace velorent
