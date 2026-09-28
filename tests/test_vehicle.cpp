#include "Vehicle.h"
#include "Car.h"
#include "Bike.h"
#include "SUV.h"
#include "LuxuryVehicle.h"
#include "ElectricVehicle.h"
#include "ValidationException.h"
#include <cassert>
#include <memory>
#include <vector>
#include <iostream>

using namespace velorent;

void runVehicleTests() {
    // 1. Car rental cost & maintenance factor calculation
    Car car(101, "KA-01-MG-2001", "Honda", "City", 2, FuelType::PETROL, TransmissionType::MANUAL, 5, 1800.0, 15000, 92.0);
    assert(car.getVehicleType() == "CAR");
    assert(car.calculateRentalCost(3) == 5400.0); // 1800 * 3
    assert(car.calculateMaintenanceFactor() > 1.0);

    // 2. Bike weekly discount polymorphism test
    Bike bike(102, "KA-01-BK-3001", "Royal Enfield", "Classic 350", 7, FuelType::PETROL, TransmissionType::MANUAL, 2, 800.0, 350, 8000, 90.0);
    assert(bike.getVehicleType() == "BIKE");
    // 10 days at 800/day with 10% weekly discount = 800 * 0.90 * 10 = 7200
    assert(bike.calculateRentalCost(10) == 7200.0);

    // 3. SUV 4WD surcharge polymorphism test
    SUV suv(103, "KA-01-MH-4001", "Mahindra", "Thar", 3, FuelType::DIESEL, TransmissionType::MANUAL, 4, 3000.0, true, 12000, 88.0);
    assert(suv.getVehicleType() == "SUV");
    assert(suv.calculateRentalCost(2) == 6900.0); // 3000 * 2 * 1.15 = 6900

    // 4. Luxury vehicle security deposit and tax multiplier
    LuxuryVehicle luxury(104, "KA-01-LX-5001", "BMW", "5 Series", 4, FuelType::PETROL, TransmissionType::AUTOMATIC, 5, 8000.0, 30000.0, 1.25);
    assert(luxury.getVehicleType() == "LUXURY");
    assert(luxury.getSecurityDepositINR() == 30000.0);
    assert(luxury.calculateRentalCost(2) == 20000.0); // 8000 * 1.25 * 2 = 20000

    // 5. Electric Vehicle battery telemetry & green discount
    ElectricVehicle ev(105, "KA-01-EV-6001", "Nexon", "EV Max", 5, TransmissionType::AUTOMATIC, 5, 2500.0, 40.5, 95.0, 312);
    assert(ev.getVehicleType() == "ELECTRIC");
    assert(ev.getFuelType() == FuelType::ELECTRIC);
    assert(ev.getCurrentChargePercent() == 95.0);
    assert(ev.calculateRentalCost(2) == 4750.0); // 2500 * 2 * 0.95 = 4750

    // 6. Heterogeneous collection polymorphism test
    std::vector<std::unique_ptr<Vehicle>> fleet;
    fleet.push_back(std::make_unique<Car>(1, "KA-01-A-1", "Maruti", "Swift", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, 1200.0));
    fleet.push_back(std::make_unique<Bike>(2, "KA-01-B-2", "Yamaha", "FZ", 7, FuelType::PETROL, TransmissionType::MANUAL, 2, 500.0));
    fleet.push_back(std::make_unique<ElectricVehicle>(3, "KA-01-E-3", "Tata", "Tigor EV", 5, TransmissionType::AUTOMATIC, 5, 1500.0));

    double totalRate = 0.0;
    for (const auto& v : fleet) {
        assert(v->getBaseRentalRate() > 0.0);
        totalRate += v->calculateRentalCost(1);
    }
    assert(totalRate > 0.0);

    // 7. Validation test: negative rate must throw ValidationException
    bool thrown = false;
    try {
        Car badCar(999, "KA-01-ERR", "Fake", "Model", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, -500.0);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);
}
