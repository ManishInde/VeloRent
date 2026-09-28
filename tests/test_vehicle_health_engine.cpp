#include "VehicleHealthEngine.h"
#include "Car.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void runVehicleHealthEngineTests() {
    std::cout << "  [3/8] Testing VehicleHealthEngine...\n";
    VehicleHealthEngine engine;

    // Test 1: Pristine vehicle
    Car car1(1, "REG-1", "Honda", "City", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, 2000.0, 10000, 98.0, VehicleStatus::AVAILABLE);
    auto res1 = engine.evaluateHealth(car1);
    assert(res1.score >= 90.0);
    assert(res1.category == HealthCategory::EXCELLENT);

    // Test 2: High mileage + unresolved severe damage
    Car car2(2, "REG-2", "Toyota", "Innova", 3, FuelType::DIESEL, TransmissionType::MANUAL, 7, 3000.0, 150000, 85.0, VehicleStatus::MAINTENANCE);
    DamageReport severeDmg(1, 1, 2, 5, DamageSeverity::SEVERE, "Engine block failure", 45000.0, DamageResolutionStatus::PENDING, "2026-09-01");
    std::vector<DamageReport> damages = {severeDmg};
    std::vector<Maintenance> maints = {Maintenance(1, 2, MaintenanceType::REPAIR, MaintenancePriority::CRITICAL, MaintenanceStatus::OPEN, "Engine repair")};

    auto res2 = engine.evaluateHealth(car2, damages, maints);
    assert(res2.score < 40.0);
    assert(res2.category == HealthCategory::CRITICAL);
    assert(!res2.warnings.empty());

    std::cout << "        VehicleHealthEngine PASSED [OK]\n";
}
