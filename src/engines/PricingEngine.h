#pragma once
#include "Vehicle.h"
#include "Customer.h"
#include "Enums.h"
#include <string>
#include <vector>
#include <memory>

namespace velorent {

struct PricingBreakdown {
    double baseRatePerDay = 0.0;
    int durationDays = 0;
    double subtotal = 0.0;
    double demandAdjustment = 0.0;
    double weekendAdjustment = 0.0;
    double seasonalAdjustment = 0.0;
    double categorySurchargeAmount = 0.0;
    double durationDiscount = 0.0;
    double loyaltyDiscount = 0.0;
    double finalPrice = 0.0;
    std::vector<std::string> explanation;
};

class PricingEngine {
public:
    PricingEngine() = default;

    /**
     * @brief Computes deterministic dynamic price breakdown for a requested rental.
     */
    PricingBreakdown calculatePrice(const Vehicle& vehicle,
                                   const std::string& startDateISO,
                                   const std::string& endDateISO,
                                   double demandFactor = 1.0,
                                   LoyaltyTier tier = LoyaltyTier::BRONZE,
                                   double categorySurchargePct = 0.0);
};

} // namespace velorent
