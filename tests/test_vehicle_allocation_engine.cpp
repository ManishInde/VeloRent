#include "VehicleAllocationEngine.h"
#include "Car.h"
#include "VehicleUnavailableException.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void runVehicleAllocationEngineTests() {
    std::cout << "  [4/8] Testing VehicleAllocationEngine...\n";
    VehicleAllocationEngine engine;

    auto car1 = std::make_shared<Car>(1, "REG-1", "Honda", "City", 2, FuelType::PETROL, TransmissionType::AUTOMATIC, 5, 2000.0, 15000, 95.0, VehicleStatus::AVAILABLE);
    auto car2 = std::make_shared<Car>(2, "REG-2", "Hyundai", "Verna", 2, FuelType::PETROL, TransmissionType::AUTOMATIC, 5, 2100.0, 50000, 80.0, VehicleStatus::AVAILABLE);
    auto carMaint = std::make_shared<Car>(3, "REG-3", "Ford", "EcoSport", 2, FuelType::DIESEL, TransmissionType::MANUAL, 5, 1800.0, 80000, 30.0, VehicleStatus::MAINTENANCE);

    std::vector<std::shared_ptr<Vehicle>> fleet = {car1, car2, carMaint};

    UserPreferences req;
    req.targetCategoryId = 2; // Sedan
    req.maxBudgetPerDay = 2200.0;
    req.preferredTransmission = "AUTOMATIC";

    auto res = engine.allocateVehicle(fleet, req);
    assert(res.selectedVehicle != nullptr);
    assert(res.selectedVehicle->getId() == 1); // Car1 has higher health score and lower mileage
    assert(!res.explanation.empty());

    // Test no candidate exception
    try {
        UserPreferences reqUnmatchable;
        reqUnmatchable.targetCategoryId = 99; // Non-existent category
        engine.allocateVehicle(fleet, reqUnmatchable);
        assert(false && "Should have thrown VehicleUnavailableException");
    } catch (const VehicleUnavailableException&) {
        // Expected
    }

    std::cout << "        VehicleAllocationEngine PASSED [OK]\n";
}
