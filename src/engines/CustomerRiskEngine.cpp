#include "CustomerRiskEngine.h"
#include <algorithm>

namespace velorent {

CustomerRiskResult CustomerRiskEngine::evaluateCustomerRisk(const Customer& customer,
                                                             const std::vector<Booking>& bookingHistory,
                                                             const std::vector<Rental>& rentalHistory,
                                                             const std::vector<DamageReport>& damageHistory,
                                                             const std::vector<Payment>& paymentHistory) {
    CustomerRiskResult result;
    double currentRisk = 10.0; // baseline

    // 1. Damage Reports Impact
    for (const auto& dmg : damageHistory) {
        double add = 0.0;
        switch (dmg.getSeverity()) {
            case DamageSeverity::MINOR:    add = 15.0; break;
            case DamageSeverity::MODERATE: add = 30.0; break;
            case DamageSeverity::SEVERE:   add = 50.0; break;
        }
        currentRisk += add;
        result.contributingFactors.push_back("Damage incident (" + dmg.getDescription() + "): +" +
                                             std::to_string(static_cast<int>(add)) + " risk pts");
    }

    // 2. Overdue Rentals Impact
    int overdueCount = 0;
    for (const auto& r : rentalHistory) {
        if (r.getStatus() == RentalStatus::OVERDUE) overdueCount++;
    }
    if (overdueCount > 0) {
        double add = overdueCount * 15.0;
        currentRisk += add;
        result.contributingFactors.push_back("Overdue rental returns (" + std::to_string(overdueCount) + "): +" +
                                             std::to_string(static_cast<int>(add)) + " risk pts");
    }

    // 3. Payment Failures Impact
    int failedPayments = 0;
    for (const auto& p : paymentHistory) {
        if (p.getStatus() == PaymentStatus::FAILED) failedPayments++;
    }
    if (failedPayments > 0) {
        double add = failedPayments * 20.0;
        currentRisk += add;
        result.contributingFactors.push_back("Failed payment attempts (" + std::to_string(failedPayments) + "): +" +
                                             std::to_string(static_cast<int>(add)) + " risk pts");
    }

    // 4. Booking Cancellations Impact
    int cancelledBookings = 0;
    for (const auto& b : bookingHistory) {
        if (b.getStatus() == BookingStatus::CANCELLED) cancelledBookings++;
    }
    if (cancelledBookings > 0) {
        double add = cancelledBookings * 5.0;
        currentRisk += add;
        result.contributingFactors.push_back("Cancelled bookings (" + std::to_string(cancelledBookings) + "): +" +
                                             std::to_string(static_cast<int>(add)) + " risk pts");
    }

    // 5. Successful Clean Rentals Credit
    int cleanRentals = 0;
    for (const auto& r : rentalHistory) {
        if (r.getStatus() == RentalStatus::COMPLETED) cleanRentals++;
    }
    if (cleanRentals > 0) {
        double credit = cleanRentals * 5.0;
        currentRisk -= credit;
        result.contributingFactors.push_back("Successful completed rentals (" + std::to_string(cleanRentals) + "): -" +
                                             std::to_string(static_cast<int>(credit)) + " risk pts");
    }

    // Clamp score 0.0 - 100.0
    result.riskScore = std::max(0.0, std::min(100.0, currentRisk));

    // Assign risk level
    if (result.riskScore < 30.0) {
        result.riskLevel = RiskLevel::LOW;
        result.recommendedAction = "Low Risk: Standard security deposit and automated instant booking approval.";
    } else if (result.riskScore < 70.0) {
        result.riskLevel = RiskLevel::MEDIUM;
        result.recommendedAction = "Medium Risk: Higher security deposit required; mandate ID verification before vehicle dispatch.";
    } else {
        result.riskLevel = RiskLevel::HIGH;
        result.recommendedAction = "High Risk: Require manual fleet manager sign-off and full security deposit before booking confirmation.";
    }

    return result;
}

std::string CustomerRiskEngine::riskLevelToString(RiskLevel level) {
    switch (level) {
        case RiskLevel::LOW:    return "LOW";
        case RiskLevel::MEDIUM: return "MEDIUM";
        case RiskLevel::HIGH:   return "HIGH";
    }
    return "UNKNOWN";
}

} // namespace velorent
