#include "LoyaltyEngine.h"
#include "ValidationException.h"
#include "EnumUtils.h"
#include <cmath>

namespace velorent {

int LoyaltyEngine::calculatePointsEarned(double amountINR) {
    if (amountINR <= 0.0) return 0;
    // 1 point per ₹100 spent (rounded down)
    return static_cast<int>(std::floor(amountINR / 100.0));
}

double LoyaltyEngine::calculateRedemptionValueINR(int points) {
    if (points <= 0) return 0.0;
    // 1 point = ₹0.50
    return points * 0.50;
}

LoyaltyEvaluationResult LoyaltyEngine::evaluateTier(int totalPointsEarned, LoyaltyTier currentTier) {
    LoyaltyEvaluationResult res;
    
    if (totalPointsEarned >= 15000) {
        res.newTier = LoyaltyTier::PLATINUM;
    } else if (totalPointsEarned >= 5000) {
        res.newTier = LoyaltyTier::GOLD;
    } else if (totalPointsEarned >= 1000) {
        res.newTier = LoyaltyTier::SILVER;
    } else {
        res.newTier = LoyaltyTier::BRONZE;
    }

    res.tierUpgraded = (res.newTier > currentTier);
    if (res.tierUpgraded) {
        res.message = "Congratulations! Upgraded from " + EnumUtils::toString(currentTier) +
                      " to " + EnumUtils::toString(res.newTier) + " tier!";
    } else {
        res.message = "Current tier: " + EnumUtils::toString(res.newTier);
    }

    return res;
}

double LoyaltyEngine::getTierDiscountPct(LoyaltyTier tier) {
    switch (tier) {
        case LoyaltyTier::SILVER:   return 5.0;  // 5% discount
        case LoyaltyTier::GOLD:     return 10.0; // 10% discount
        case LoyaltyTier::PLATINUM: return 15.0; // 15% discount
        case LoyaltyTier::BRONZE:   return 0.0;
    }
    return 0.0;
}

bool LoyaltyEngine::validateRedemption(const LoyaltyAccount& account, int pointsRequested, double rentalSubtotalINR) {
    if (pointsRequested <= 0) return false;
    if (account.getCurrentPoints() < pointsRequested) {
        throw ValidationException("LoyaltyEngine: Requested redemption points (" + std::to_string(pointsRequested) +
                                  ") exceeds balance (" + std::to_string(account.getCurrentPoints()) + ").");
    }

    // Minimum 100 points required to redeem
    if (pointsRequested < 100) {
        throw ValidationException("LoyaltyEngine: Minimum 100 points required for redemption.");
    }

    // Max redemption value cannot exceed 50% of subtotal
    double valueINR = calculateRedemptionValueINR(pointsRequested);
    if (valueINR > (rentalSubtotalINR * 0.50)) {
        throw ValidationException("LoyaltyEngine: Point redemption value (INR " + std::to_string(static_cast<int>(valueINR)) +
                                  ") cannot exceed 50% of subtotal (INR " + std::to_string(static_cast<int>(rentalSubtotalINR * 0.50)) + ").");
    }

    return true;
}

} // namespace velorent
