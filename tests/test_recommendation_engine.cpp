#include "RecommendationEngine.h"
#include "Car.h"
#include "ElectricVehicle.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void runRecommendationEngineTests() {
    std::cout << "  [2/8] Testing RecommendationEngine...\n";
    RecommendationEngine engine;

    auto car1 = std::make_shared<Car>(1, "KA-01-A-1", "Honda", "City", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, 2000.0, 10000, 95.0, VehicleStatus::AVAILABLE);
    auto ev2 = std::make_shared<ElectricVehicle>(2, "KA-01-E-2", "Tata", "Nexon EV", 5, TransmissionType::AUTOMATIC, 5, 2500.0, 60.0, 100.0, 350, 5000, 98.0, VehicleStatus::AVAILABLE);
    auto car3 = std::make_shared<Car>(3, "KA-01-B-3", "Maruti", "Swift", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, 1200.0, 20000, 90.0, VehicleStatus::AVAILABLE);

    std::vector<std::shared_ptr<Vehicle>> candidates = {car1, ev2, car3};

    UserPreferences prefs;
    prefs.maxBudgetPerDay = 2200.0;
    prefs.requireEV = true;

    auto recs = engine.recommendVehicles(candidates, prefs, 4.8);
    assert(!recs.empty());
    // EV should rank highest because requireEV preference is set
    assert(recs[0].vehicle->getId() == 2);
    assert(!recs[0].explanation.empty());

    std::cout << "        RecommendationEngine PASSED [OK]\n";
}
