#include "PricingEngine.h"
#include "Car.h"
#include "ValidationException.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void runPricingEngineTests() {
    std::cout << "  [1/8] Testing PricingEngine...\n";
    PricingEngine engine;
    Car sampleCar(1, "KA-01-AB-1234", "Honda", "City", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, 2000.0);

    // Test 1: Normal 3-day rental
    auto bd1 = engine.calculatePrice(sampleCar, "2026-10-01", "2026-10-04", 1.0, LoyaltyTier::BRONZE);
    assert(bd1.durationDays == 3);
    assert(std::abs(bd1.subtotal - 6000.0) < 0.001);
    assert(std::abs(bd1.finalPrice - 6000.0) < 0.001);

    // Test 2: High demand factor (1.2x)
    auto bd2 = engine.calculatePrice(sampleCar, "2026-10-01", "2026-10-04", 1.2, LoyaltyTier::BRONZE);
    assert(std::abs(bd2.demandAdjustment - 1200.0) < 0.001);
    assert(std::abs(bd2.finalPrice - 7200.0) < 0.001);

    // Test 3: Long rental discount (10 days = 10% off) + Gold loyalty discount (10% off)
    auto bd3 = engine.calculatePrice(sampleCar, "2026-10-01", "2026-10-11", 1.0, LoyaltyTier::GOLD);
    assert(bd3.durationDays == 10);
    assert(std::abs(bd3.subtotal - 20000.0) < 0.001);
    assert(std::abs(bd3.durationDiscount - 2000.0) < 0.001); // 10%
    assert(std::abs(bd3.loyaltyDiscount - 2000.0) < 0.001);  // 10%
    assert(std::abs(bd3.finalPrice - 16000.0) < 0.001);

    // Test 4: Invalid date ordering exception
    try {
        engine.calculatePrice(sampleCar, "2026-10-10", "2026-10-05");
        assert(false && "Should have thrown ValidationException");
    } catch (const ValidationException&) {
        // Expected
    }

    std::cout << "        PricingEngine PASSED [OK]\n";
}
