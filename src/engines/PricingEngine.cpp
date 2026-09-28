#include "PricingEngine.h"
#include "DateUtils.h"
#include "ValidationException.h"
#include <cmath>
#include <algorithm>

namespace velorent {

PricingBreakdown PricingEngine::calculatePrice(const Vehicle& vehicle,
                                               const std::string& startDateISO,
                                               const std::string& endDateISO,
                                               double demandFactor,
                                               LoyaltyTier tier,
                                               double categorySurchargePct) {
    if (DateUtils::isAfter(startDateISO, endDateISO)) {
        throw ValidationException("PricingEngine: End date must be after start date.");
    }

    int days = DateUtils::daysBetween(startDateISO, endDateISO);
    if (days <= 0) days = 1;

    PricingBreakdown breakdown;
    breakdown.baseRatePerDay = vehicle.getBaseRentalRate();
    breakdown.durationDays = days;
    breakdown.subtotal = breakdown.baseRatePerDay * days;
    breakdown.explanation.push_back("Base Rate: INR " + std::to_string(static_cast<int>(breakdown.baseRatePerDay)) +
                                   " x " + std::to_string(days) + " days = INR " + std::to_string(static_cast<int>(breakdown.subtotal)));

    // 1. Demand factor adjustment
    if (std::abs(demandFactor - 1.0) > 0.001) {
        breakdown.demandAdjustment = breakdown.subtotal * (demandFactor - 1.0);
        std::string sign = breakdown.demandAdjustment >= 0 ? "+" : "";
        breakdown.explanation.push_back("Demand Factor (" + std::to_string(demandFactor).substr(0, 4) + "x): " +
                                       sign + "INR " + std::to_string(static_cast<int>(breakdown.demandAdjustment)));
    }

    // 2. Category surcharge
    if (categorySurchargePct > 0.0) {
        breakdown.categorySurchargeAmount = breakdown.subtotal * (categorySurchargePct / 100.0);
        breakdown.explanation.push_back("Category Surcharge (" + std::to_string(static_cast<int>(categorySurchargePct)) + "%): +INR " +
                                       std::to_string(static_cast<int>(breakdown.categorySurchargeAmount)));
    }

    // 3. Long duration discount
    if (days >= 30) {
        breakdown.durationDiscount = breakdown.subtotal * 0.20; // 20% off
        breakdown.explanation.push_back("Long Rental Discount (30+ days, 20% off): -INR " + std::to_string(static_cast<int>(breakdown.durationDiscount)));
    } else if (days >= 14) {
        breakdown.durationDiscount = breakdown.subtotal * 0.15; // 15% off
        breakdown.explanation.push_back("Long Rental Discount (14+ days, 15% off): -INR " + std::to_string(static_cast<int>(breakdown.durationDiscount)));
    } else if (days >= 7) {
        breakdown.durationDiscount = breakdown.subtotal * 0.10; // 10% off
        breakdown.explanation.push_back("Long Rental Discount (7+ days, 10% off): -INR " + std::to_string(static_cast<int>(breakdown.durationDiscount)));
    }

    // 4. Loyalty tier discount
    double loyaltyPct = 0.0;
    switch (tier) {
        case LoyaltyTier::SILVER:   loyaltyPct = 0.05; break;
        case LoyaltyTier::GOLD:     loyaltyPct = 0.10; break;
        case LoyaltyTier::PLATINUM: loyaltyPct = 0.15; break;
        case LoyaltyTier::BRONZE:   loyaltyPct = 0.00; break;
    }
    if (loyaltyPct > 0.0) {
        breakdown.loyaltyDiscount = breakdown.subtotal * loyaltyPct;
        breakdown.explanation.push_back("Loyalty Discount (" + std::to_string(static_cast<int>(loyaltyPct * 100)) + "% off): -INR " +
                                       std::to_string(static_cast<int>(breakdown.loyaltyDiscount)));
    }

    // Compute final price
    double rawFinal = breakdown.subtotal + breakdown.demandAdjustment + breakdown.categorySurchargeAmount -
                      breakdown.durationDiscount - breakdown.loyaltyDiscount;

    // Apply sensible floor cap (must be at least 50% of base subtotal to prevent zero/negative price)
    double minFloor = breakdown.subtotal * 0.50;
    breakdown.finalPrice = std::max(rawFinal, minFloor);

    breakdown.explanation.push_back("Final Calculated Price: INR " + std::to_string(static_cast<int>(breakdown.finalPrice)));
    return breakdown;
}

} // namespace velorent
