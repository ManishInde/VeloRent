#include "LoyaltyAccount.h"
#include "Review.h"
#include "DamageReport.h"
#include "VehicleHealthSnapshot.h"
#include "ValidationUtils.h"
#include "ValidationException.h"
#include "BusinessRuleException.h"
#include <cassert>
#include <iostream>

using namespace velorent;

void runValidationTests() {
    // 1. LoyaltyAccount points & tier auto-calculation
    LoyaltyAccount account(1, 101, 500, 500, LoyaltyTier::BRONZE);
    assert(account.getTier() == LoyaltyTier::BRONZE);

    // Add 1000 points -> total 1500 -> SILVER tier
    account.addPoints(1000);
    assert(account.getTier() == LoyaltyTier::SILVER);

    // Add 4000 points -> total 5500 -> GOLD tier
    account.addPoints(4000);
    assert(account.getTier() == LoyaltyTier::GOLD);

    // Add 10000 points -> total 15500 -> PLATINUM tier
    account.addPoints(10000);
    assert(account.getTier() == LoyaltyTier::PLATINUM);

    // Insufficient balance deduction throws ValidationException
    bool thrown = false;
    try {
        account.deductPoints(99999);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);

    // 2. Review rating bounds (1 to 5)
    Review review(1, 5001, 1, 101, 5, "Excellent vehicle!");
    assert(review.getRating() == 5);

    thrown = false;
    try {
        Review badReview(2, 5001, 1, 101, 6, "Invalid 6-star rating");
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);

    // 3. Health score validation (0 to 100)
    VehicleHealthSnapshot snapshot(1, 101, 95.5, HealthComputedBy::ENGINE);
    assert(snapshot.getHealthScore() == 95.5);

    thrown = false;
    try {
        VehicleHealthSnapshot badSnapshot(2, 101, 105.0, HealthComputedBy::ENGINE);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);

    // 4. Damage report severity & estimated cost
    DamageReport damage(1, 5001, 101, 1, DamageSeverity::SEVERE, "Bumper dent and radiator leakage", 35000.0);
    assert(damage.getSeverity() == DamageSeverity::SEVERE);
    assert(damage.getEstimatedCost() == 35000.0);
}
