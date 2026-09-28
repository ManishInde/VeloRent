#pragma once
#include "Vehicle.h"
#include "DamageReport.h"
#include "Maintenance.h"
#include <string>
#include <vector>

namespace velorent {

enum class HealthCategory {
    EXCELLENT,       // 90 - 100
    GOOD,            // 75 - 89
    FAIR,            // 60 - 74
    NEEDS_ATTENTION, // 40 - 59
    CRITICAL         // 0 - 39
};

struct VehicleHealthResult {
    double score = 100.0;
    HealthCategory category = HealthCategory::EXCELLENT;
    std::vector<std::string> factors;
    std::vector<std::string> warnings;
    std::string recommendedAction;
};

class VehicleHealthEngine {
public:
    VehicleHealthEngine() = default;

    /**
     * @brief Computes a comprehensive health score and diagnostic result for a vehicle.
     */
    VehicleHealthResult evaluateHealth(const Vehicle& vehicle,
                                       const std::vector<DamageReport>& damageHistory = {},
                                       const std::vector<Maintenance>& openTasks = {});

    static std::string categoryToString(HealthCategory category);
};

} // namespace velorent
