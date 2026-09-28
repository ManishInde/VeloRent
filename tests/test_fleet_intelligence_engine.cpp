#include "engines/FleetIntelligenceEngine.h"
#include "Car.h"
#include "Bike.h"
#include <iostream>
#include <cassert>
#include <cmath>

using namespace velorent;

void testFleetIntelligenceReportGeneration() {
    FleetIntelligenceEngine engine;
    
    std::vector<std::shared_ptr<Vehicle>> fleet;
    fleet.push_back(std::make_shared<Car>(1, "KA01AB1234", "Honda", "City", 1, FuelType::PETROL, TransmissionType::AUTOMATIC, 5, 2500.0, 15000, 95.0, VehicleStatus::AVAILABLE, 2022));
    fleet.push_back(std::make_shared<Car>(2, "KA01CD5678", "Hyundai", "Creta", 2, FuelType::DIESEL, TransmissionType::MANUAL, 5, 3000.0, 10000, 90.0, VehicleStatus::RENTED, 2023));
    fleet.push_back(std::make_shared<Bike>(3, "KA01EF9012", "Royal Enfield", "Classic 350", 3, FuelType::PETROL, TransmissionType::MANUAL, 2, 1200.0, 350, 25000, 85.0, VehicleStatus::MAINTENANCE, 2021));
    
    // Payments
    Payment p1(1, 101, 2500.0, PaymentMethod::CARD, PaymentType::BASE_RENT, PaymentStatus::COMPLETED, "TX1001", "2026-03-01");
    Payment p2(2, 102, 3000.0, PaymentMethod::UPI, PaymentType::BASE_RENT, PaymentStatus::COMPLETED, "TX1002", "2026-03-02");
    std::vector<Payment> payments = { p1, p2 };
    
    // Maintenance
    Maintenance m1(1, 3, MaintenanceType::REPAIR, MaintenancePriority::HIGH, MaintenanceStatus::COMPLETED, "Engine Service", 0, "2026-03-01", "2026-03-02", 4500.0);
    std::vector<Maintenance> maintenance = { m1 };
    
    auto report = engine.generateReport(fleet, {}, payments, maintenance);
    
    assert(report.totalVehicles == 3);
    assert(report.availableVehicles == 1);
    assert(report.rentedVehicles == 1);
    assert(report.maintenanceVehicles == 1);
    
    // Utilization: 1 rented out of 3 = 33.33%
    assert(std::abs(report.fleetUtilizationPct - (1.0 / 3.0 * 100.0)) < 0.1);
    
    assert(std::abs(report.totalRevenueINR - 5500.0) < 0.001);
    assert(std::abs(report.totalMaintenanceCostINR - 4500.0) < 0.001);
    assert(std::abs(report.netEstimatedProfitINR - 1000.0) < 0.001);
    
    assert(!report.insights.empty());
    
    std::cout << "  [PASS] testFleetIntelligenceReportGeneration" << std::endl;
}

void testFleetSeverityToString() {
    assert(FleetIntelligenceEngine::severityToString(InsightSeverity::INFO) == "INFO");
    assert(FleetIntelligenceEngine::severityToString(InsightSeverity::WARNING) == "WARNING");
    assert(FleetIntelligenceEngine::severityToString(InsightSeverity::CRITICAL) == "CRITICAL");
    
    std::cout << "  [PASS] testFleetSeverityToString" << std::endl;
}

void runFleetIntelligenceEngineTests() {
    std::cout << "[TEST] Running Fleet Intelligence Engine Tests..." << std::endl;
    testFleetIntelligenceReportGeneration();
    testFleetSeverityToString();
    std::cout << "[SUCCESS] Fleet Intelligence Engine Tests Passed!" << std::endl << std::endl;
}
