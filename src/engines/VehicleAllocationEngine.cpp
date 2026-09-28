#include "VehicleAllocationEngine.h"
#include "NotFoundException.h"
#include "VehicleUnavailableException.h"
#include "EnumUtils.h"
#include <algorithm>

namespace velorent {

AllocationResult VehicleAllocationEngine::allocateVehicle(
    const std::vector<std::shared_ptr<Vehicle>>& availableFleet,
    const UserPreferences& bookingReq) {

    AllocationResult result;
    std::vector<std::pair<double, std::shared_ptr<Vehicle>>> scoredCandidates;

    for (const auto& v : availableFleet) {
        if (!v) continue;
        if (v->getStatus() != VehicleStatus::AVAILABLE) continue;

        // Exclude vehicles with critical health (< 40)
        if (v->getHealthScore() < 40.0) continue;

        // Must match category if requested
        if (bookingReq.targetCategoryId != 0 && v->getCategoryId() != bookingReq.targetCategoryId) {
            continue;
        }

        double score = 0.0;

        // 1. Health Score (30%)
        score += v->getHealthScore() * 0.30;

        // 2. Budget Score (25%)
        if (bookingReq.maxBudgetPerDay > 0.0) {
            if (v->getBaseRentalRate() <= bookingReq.maxBudgetPerDay) {
                score += 25.0;
            } else {
                double diff = v->getBaseRentalRate() - bookingReq.maxBudgetPerDay;
                score += std::max(0.0, 25.0 - (diff / bookingReq.maxBudgetPerDay * 25.0));
            }
        } else {
            score += 20.0;
        }

        // 3. Balanced Utilization Score (25%) - Prefer vehicles with lower odometer km to balance wear
        double odoScore = std::max(0.0, 25.0 - (v->getOdometerKm() / 100000.0 * 25.0));
        score += odoScore;

        // 4. Feature Preference Match (20%)
        double prefPoints = 0.0;
        if (!bookingReq.preferredFuelType.empty() && EnumUtils::toString(v->getFuelType()) == bookingReq.preferredFuelType) {
            prefPoints += 10.0;
        }
        if (!bookingReq.preferredTransmission.empty() && EnumUtils::toString(v->getTransmission()) == bookingReq.preferredTransmission) {
            prefPoints += 10.0;
        }
        score += prefPoints;

        scoredCandidates.push_back({score, v});
    }

    if (scoredCandidates.empty()) {
        throw VehicleUnavailableException("VehicleAllocationEngine: No suitable available vehicle matches the booking requirements.");
    }

    // Sort descending by score
    std::sort(scoredCandidates.begin(), scoredCandidates.end(),
              [](const std::pair<double, std::shared_ptr<Vehicle>>& a,
                 const std::pair<double, std::shared_ptr<Vehicle>>& b) {
                  return a.first > b.first;
              });

    result.selectedVehicle = scoredCandidates[0].second;
    result.allocationScore = scoredCandidates[0].first;

    result.explanation.push_back("Selected Vehicle: " + result.selectedVehicle->getBrand() + " " +
                                 result.selectedVehicle->getModel() + " (Reg: " + result.selectedVehicle->getRegistrationNumber() + ")");
    result.explanation.push_back("Allocation Score: " + std::to_string(static_cast<int>(result.allocationScore)) + "/100");
    result.explanation.push_back("Health Score: " + std::to_string(static_cast<int>(result.selectedVehicle->getHealthScore())) + "/100");
    result.explanation.push_back("Odometer: " + std::to_string(result.selectedVehicle->getOdometerKm()) + " km");

    for (size_t i = 1; i < scoredCandidates.size(); ++i) {
        result.alternativeCandidates.push_back(scoredCandidates[i].second);
    }

    return result;
}

} // namespace velorent
