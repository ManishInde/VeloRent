#pragma once
#include "Vehicle.h"
#include "Customer.h"
#include <memory>
#include <vector>
#include <string>

namespace velorent {

struct UserPreferences {
    int targetCategoryId = 0;
    double maxBudgetPerDay = 0.0;
    std::string preferredFuelType = "";
    std::string preferredTransmission = "";
    int minSeats = 0;
    bool requireEV = false;
};

struct RecommendationScore {
    double budgetScore = 0.0;        // 0-100
    double categoryScore = 0.0;      // 0-100
    double preferenceScore = 0.0;    // 0-100
    double healthScore = 0.0;        // 0-100
    double ratingScore = 0.0;        // 0-100
    double finalScore = 0.0;         // 0-100 weighted final score
};

struct RecommendationResult {
    std::shared_ptr<Vehicle> vehicle;
    RecommendationScore score;
    std::vector<std::string> explanation;
};

class RecommendationEngine {
public:
    RecommendationEngine() = default;

    /**
     * @brief Ranks and recommends available vehicles according to customer preferences.
     */
    std::vector<RecommendationResult> recommendVehicles(
        const std::vector<std::shared_ptr<Vehicle>>& candidates,
        const UserPreferences& prefs,
        double avgVehicleRating = 4.5);
};

} // namespace velorent
