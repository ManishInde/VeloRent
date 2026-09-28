#include "VehicleHealthEngine.h"
#include <algorithm>

namespace velorent {

VehicleHealthResult VehicleHealthEngine::evaluateHealth(const Vehicle& vehicle,
                                                         const std::vector<DamageReport>& damageHistory,
                                                         const std::vector<Maintenance>& openTasks) {
    VehicleHealthResult result;
    double currentScore = vehicle.getHealthScore();

    // 1. Odometer mileage deduction
    int odo = vehicle.getOdometerKm();
    if (odo > 50000) {
        int excess = odo - 50000;
        double mileagePenalty = std::min(20.0, (excess / 10000.0) * 1.5);
        currentScore -= mileagePenalty;
        result.factors.push_back("High odometer reading (" + std::to_string(odo) + " km): -" +
                                 std::to_string(static_cast<int>(mileagePenalty)) + " pts");
        if (odo > 120000) {
            result.warnings.push_back("High mileage threshold exceeded (> 120,000 km). Routine engine overhaul recommended.");
        }
    }

    // 2. Damage reports penalty
    for (const auto& dmg : damageHistory) {
        if (dmg.getResolutionStatus() != DamageResolutionStatus::RESOLVED) {
            double penalty = 0.0;
            switch (dmg.getSeverity()) {
                case DamageSeverity::MINOR:    penalty = 10.0; break;
                case DamageSeverity::MODERATE: penalty = 25.0; break;
                case DamageSeverity::SEVERE:   penalty = 50.0; break;
            }
            currentScore -= penalty;
            result.factors.push_back("Unresolved damage report (" + dmg.getDescription() + "): -" +
                                     std::to_string(static_cast<int>(penalty)) + " pts");
            result.warnings.push_back("Unresolved damage report logged on vehicle.");
        }
    }

    // 3. Open maintenance tasks penalty
    if (!openTasks.empty()) {
        double maintPenalty = openTasks.size() * 15.0;
        currentScore -= maintPenalty;
        result.factors.push_back("Open maintenance tasks pending (" + std::to_string(openTasks.size()) + "): -" +
                                 std::to_string(static_cast<int>(maintPenalty)) + " pts");
        result.warnings.push_back("Vehicle has " + std::to_string(openTasks.size()) + " pending maintenance tasks.");
    }

    // Clamp score 0.0 - 100.0
    result.score = std::max(0.0, std::min(100.0, currentScore));

    // Category assignment
    if (result.score >= 90.0) {
        result.category = HealthCategory::EXCELLENT;
        result.recommendedAction = "Vehicle in peak condition. Ready for long-distance rentals.";
    } else if (result.score >= 75.0) {
        result.category = HealthCategory::GOOD;
        result.recommendedAction = "Vehicle healthy. Standard rental inspection recommended.";
    } else if (result.score >= 60.0) {
        result.category = HealthCategory::FAIR;
        result.recommendedAction = "Schedule routine service soon.";
    } else if (result.score >= 40.0) {
        result.category = HealthCategory::NEEDS_ATTENTION;
        result.recommendedAction = "Vehicle requires maintenance before long-distance bookings.";
    } else {
        result.category = HealthCategory::CRITICAL;
        result.recommendedAction = "CRITICAL: Deactivate from active fleet immediately and send for emergency repair.";
    }

    return result;
}

std::string VehicleHealthEngine::categoryToString(HealthCategory category) {
    switch (category) {
        case HealthCategory::EXCELLENT:       return "EXCELLENT";
        case HealthCategory::GOOD:            return "GOOD";
        case HealthCategory::FAIR:            return "FAIR";
        case HealthCategory::NEEDS_ATTENTION: return "NEEDS_ATTENTION";
        case HealthCategory::CRITICAL:        return "CRITICAL";
    }
    return "UNKNOWN";
}

} // namespace velorent
