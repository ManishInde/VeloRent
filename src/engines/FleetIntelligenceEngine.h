#pragma once
#include "Vehicle.h"
#include "Rental.h"
#include "Payment.h"
#include "Maintenance.h"
#include <string>
#include <vector>
#include <memory>

namespace velorent {

enum class InsightSeverity {
    INFO,
    WARNING,
    CRITICAL
};

struct FleetInsight {
    std::string metricName;
    std::string metricValue;
    InsightSeverity severity = InsightSeverity::INFO;
    std::string explanation;
    std::string suggestedAction;
};

struct FleetAnalyticsReport {
    int totalVehicles = 0;
    int availableVehicles = 0;
    int rentedVehicles = 0;
    int maintenanceVehicles = 0;
    double fleetUtilizationPct = 0.0;
    double totalRevenueINR = 0.0;
    double totalMaintenanceCostINR = 0.0;
    double netEstimatedProfitINR = 0.0;
    double averageHealthScore = 0.0;
    std::vector<FleetInsight> insights;
};

class FleetIntelligenceEngine {
public:
    FleetIntelligenceEngine() = default;

    /**
     * @brief Generates actionable fleet operational intelligence report from system datasets.
     */
    FleetAnalyticsReport generateReport(const std::vector<std::shared_ptr<Vehicle>>& fleet,
                                        const std::vector<Rental>& rentals = {},
                                        const std::vector<Payment>& payments = {},
                                        const std::vector<Maintenance>& maintenanceTasks = {});

    static std::string severityToString(InsightSeverity severity);
};

} // namespace velorent
