#include "engines/LoyaltyEngine.h"
#include <iostream>
#include <cassert>
#include <cmath>

using namespace velorent;

void testLoyaltyPointsCalculation() {
    LoyaltyEngine engine;
    
    // ₹1000 => 10 points
    assert(engine.calculatePointsEarned(1000.0) == 10);
    // ₹250 => 2 points
    assert(engine.calculatePointsEarned(250.0) == 2);
    // ₹50 => 0 points
    assert(engine.calculatePointsEarned(50.0) == 0);
    // ₹1580 => 15 points
    assert(engine.calculatePointsEarned(1580.0) == 15);
    
    std::cout << "  [PASS] testLoyaltyPointsCalculation" << std::endl;
}

void testLoyaltyRedemptionValue() {
    LoyaltyEngine engine;
    
    // 100 points = ₹50
    assert(std::abs(engine.calculateRedemptionValueINR(100) - 50.0) < 0.001);
    // 50 points = ₹25
    assert(std::abs(engine.calculateRedemptionValueINR(50) - 25.0) < 0.001);
    
    std::cout << "  [PASS] testLoyaltyRedemptionValue" << std::endl;
}

void testLoyaltyTierEvaluation() {
    LoyaltyEngine engine;
    
    // Bronze -> Bronze
    auto r1 = engine.evaluateTier(200, LoyaltyTier::BRONZE);
    assert(r1.newTier == LoyaltyTier::BRONZE);
    assert(!r1.tierUpgraded);
    
    // Bronze -> Silver (1000 pts threshold)
    auto r2 = engine.evaluateTier(1200, LoyaltyTier::BRONZE);
    assert(r2.newTier == LoyaltyTier::SILVER);
    assert(r2.tierUpgraded);
    
    // Silver -> Gold (5000 pts threshold)
    auto r3 = engine.evaluateTier(6000, LoyaltyTier::SILVER);
    assert(r3.newTier == LoyaltyTier::GOLD);
    assert(r3.tierUpgraded);
    
    // Gold -> Platinum (15000 pts threshold)
    auto r4 = engine.evaluateTier(16000, LoyaltyTier::GOLD);
    assert(r4.newTier == LoyaltyTier::PLATINUM);
    assert(r4.tierUpgraded);
    
    // Already Platinum
    auto r5 = engine.evaluateTier(18000, LoyaltyTier::PLATINUM);
    assert(r5.newTier == LoyaltyTier::PLATINUM);
    assert(!r5.tierUpgraded);
    
    std::cout << "  [PASS] testLoyaltyTierEvaluation" << std::endl;
}

void testLoyaltyTierDiscountPct() {
    LoyaltyEngine engine;
    
    assert(std::abs(engine.getTierDiscountPct(LoyaltyTier::BRONZE) - 0.0) < 0.001);
    assert(std::abs(engine.getTierDiscountPct(LoyaltyTier::SILVER) - 5.0) < 0.001);
    assert(std::abs(engine.getTierDiscountPct(LoyaltyTier::GOLD) - 10.0) < 0.001);
    assert(std::abs(engine.getTierDiscountPct(LoyaltyTier::PLATINUM) - 15.0) < 0.001);
    
    std::cout << "  [PASS] testLoyaltyTierDiscountPct" << std::endl;
}

void testLoyaltyRedemptionValidation() {
    LoyaltyEngine engine;
    
    LoyaltyAccount account(1, 1, 200, 400, LoyaltyTier::SILVER, "2026-03-01");
    
    // Requesting 100 pts (value ₹50) on ₹1000 rental -> Valid
    assert(engine.validateRedemption(account, 100, 1000.0) == true);
    
    // Requesting 300 pts when account only has 200 pts -> Invalid (throws ValidationException)
    try {
        engine.validateRedemption(account, 300, 1000.0);
        assert(false);
    } catch (...) {}
    
    // Requesting 200 pts (value ₹100) on ₹50 rental (max 50% discount = ₹25) -> Invalid (throws ValidationException)
    try {
        engine.validateRedemption(account, 200, 50.0);
        assert(false);
    } catch (...) {}
    
    std::cout << "  [PASS] testLoyaltyRedemptionValidation" << std::endl;
}

void runLoyaltyEngineTests() {
    std::cout << "[TEST] Running Loyalty Engine Tests..." << std::endl;
    testLoyaltyPointsCalculation();
    testLoyaltyRedemptionValue();
    testLoyaltyTierEvaluation();
    testLoyaltyTierDiscountPct();
    testLoyaltyRedemptionValidation();
    std::cout << "[SUCCESS] Loyalty Engine Tests Passed!" << std::endl << std::endl;
}
