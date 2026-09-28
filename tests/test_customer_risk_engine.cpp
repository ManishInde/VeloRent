#include "engines/CustomerRiskEngine.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void testLowRiskCustomer() {
    CustomerRiskEngine engine;
    Customer customer(1, "Alice Smith", "alice@example.com", "passhash", "9876543210", "DL123456", "2030-01-01");
    
    // Customer with clean history, KYC verified
    auto result = engine.evaluateCustomerRisk(customer);
    
    assert(result.riskLevel == RiskLevel::LOW);
    assert(result.riskScore < 30.0);
    assert(result.recommendedAction.find("Standard") != std::string::npos);
    
    std::cout << "  [PASS] testLowRiskCustomer" << std::endl;
}

void testHighRiskUnverifiedCustomer() {
    CustomerRiskEngine engine;
    Customer customer(2, "Bob Risks", "bob@example.com", "passhash", "9876543211", "DL654321", "");
    
    // Unverified customer with past damages
    DamageReport damage(1, 101, 2, 2, DamageSeverity::SEVERE, "Front crash severely damaged bumper and radiator", 25000.0, DamageResolutionStatus::PENDING, "2026-03-01");
    std::vector<DamageReport> damages = { damage };
    
    auto result = engine.evaluateCustomerRisk(customer, {}, {}, damages, {});
    
    assert(result.riskLevel == RiskLevel::HIGH || result.riskLevel == RiskLevel::MEDIUM);
    assert(result.riskScore > 30.0);
    assert(!result.contributingFactors.empty());
    
    std::cout << "  [PASS] testHighRiskUnverifiedCustomer" << std::endl;
}

void testRiskLevelToString() {
    assert(CustomerRiskEngine::riskLevelToString(RiskLevel::LOW) == "LOW");
    assert(CustomerRiskEngine::riskLevelToString(RiskLevel::MEDIUM) == "MEDIUM");
    assert(CustomerRiskEngine::riskLevelToString(RiskLevel::HIGH) == "HIGH");
    
    std::cout << "  [PASS] testRiskLevelToString" << std::endl;
}

void runCustomerRiskEngineTests() {
    std::cout << "[TEST] Running Customer Risk Engine Tests..." << std::endl;
    testLowRiskCustomer();
    testHighRiskUnverifiedCustomer();
    testRiskLevelToString();
    std::cout << "[SUCCESS] Customer Risk Engine Tests Passed!" << std::endl << std::endl;
}
