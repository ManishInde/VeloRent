#include "RecommendationEngine.h"
#include "EnumUtils.h"
#include <algorithm>

namespace velorent {

std::vector<RecommendationResult> RecommendationEngine::recommendVehicles(
    const std::vector<std::shared_ptr<Vehicle>>& candidates,
    const UserPreferences& prefs,
    double avgVehicleRating) {

    std::vector<RecommendationResult> results;

    for (const auto& v : candidates) {
        if (!v) continue;
        if (v->getStatus() != VehicleStatus::AVAILABLE) continue;

        RecommendationResult rec;
        rec.vehicle = v;

        // 1. Budget Score
        if (prefs.maxBudgetPerDay > 0.0) {
            if (v->getBaseRentalRate() <= prefs.maxBudgetPerDay) {
                rec.score.budgetScore = 100.0;
            } else {
                double over = v->getBaseRentalRate() - prefs.maxBudgetPerDay;
                rec.score.budgetScore = std::max(0.0, 100.0 - (over / prefs.maxBudgetPerDay * 100.0));
            }
        } else {
            rec.score.budgetScore = 80.0; // neutral
        }

        // 2. Category Match Score
        if (prefs.targetCategoryId != 0) {
            rec.score.categoryScore = (v->getCategoryId() == prefs.targetCategoryId) ? 100.0 : 40.0;
        } else {
            rec.score.categoryScore = 80.0;
        }

        // 3. Preference Match Score
        double prefMatches = 0.0;
        double totalPrefs = 0.0;

        if (!prefs.preferredFuelType.empty()) {
            totalPrefs += 1.0;
            if (EnumUtils::toString(v->getFuelType()) == prefs.preferredFuelType) prefMatches += 1.0;
        }
        if (!prefs.preferredTransmission.empty()) {
            totalPrefs += 1.0;
            if (EnumUtils::toString(v->getTransmission()) == prefs.preferredTransmission) prefMatches += 1.0;
        }
        if (prefs.minSeats > 0) {
            totalPrefs += 1.0;
            if (v->getSeats() >= prefs.minSeats) prefMatches += 1.0;
        }
        if (prefs.requireEV) {
            totalPrefs += 1.0;
            if (v->getFuelType() == FuelType::ELECTRIC) prefMatches += 1.0;
        }

        rec.score.preferenceScore = (totalPrefs > 0.0) ? (prefMatches / totalPrefs * 100.0) : 80.0;

        // 4. Health Score
        rec.score.healthScore = v->getHealthScore();

        // 5. Rating Score
        rec.score.ratingScore = (avgVehicleRating / 5.0) * 100.0;

        // Weighted Final Score: Budget 30%, Category 25%, Preferences 20%, Health 15%, Rating 10%
        rec.score.finalScore = (rec.score.budgetScore * 0.30) +
                               (rec.score.categoryScore * 0.25) +
                               (rec.score.preferenceScore * 0.20) +
                               (rec.score.healthScore * 0.15) +
                               (rec.score.ratingScore * 0.10);

        // Explanations
        rec.explanation.push_back("Category match: " + std::to_string(static_cast<int>(rec.score.categoryScore)) + "%");
        rec.explanation.push_back("Budget compatibility: " + std::to_string(static_cast<int>(rec.score.budgetScore)) + "%");
        rec.explanation.push_back("Feature preferences match: " + std::to_string(static_cast<int>(rec.score.preferenceScore)) + "%");
        rec.explanation.push_back("Vehicle health index: " + std::to_string(static_cast<int>(rec.score.healthScore)) + "/100");

        results.push_back(rec);
    }

    // Sort descending by finalScore
    std::sort(results.begin(), results.end(), [](const RecommendationResult& a, const RecommendationResult& b) {
        return a.score.finalScore > b.score.finalScore;
    });

    return results;
}

} // namespace velorent
