#pragma once
#include "LoyaltyAccount.h"
#include "LoyaltyTransaction.h"
#include "Enums.h"
#include <string>
#include <vector>

namespace velorent {

struct LoyaltyEvaluationResult {
    LoyaltyTier newTier = LoyaltyTier::BRONZE;
    bool tierUpgraded = false;
    std::string message;
};

class LoyaltyEngine {
public:
    LoyaltyEngine() = default;

    /**
     * @brief Calculates points earned for a payment amount in INR (1 pt per ₹100).
     */
    int calculatePointsEarned(double amountINR);

    /**
     * @brief Calculates monetary discount in INR for a given number of points (1 pt = ₹0.50).
     */
    double calculateRedemptionValueINR(int points);

    /**
     * @brief Evaluates tier progression based on total points earned.
     */
    LoyaltyEvaluationResult evaluateTier(int totalPointsEarned, LoyaltyTier currentTier);

    /**
     * @brief Gets discount percentage associated with a loyalty tier.
     */
    double getTierDiscountPct(LoyaltyTier tier);

    /**
     * @brief Validates if points redemption request is valid against account balance and rental price.
     */
    bool validateRedemption(const LoyaltyAccount& account, int pointsRequested, double rentalSubtotalINR);
};

} // namespace velorent
