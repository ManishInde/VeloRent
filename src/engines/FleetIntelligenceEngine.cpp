#include "FleetIntelligenceEngine.h"
#include "EnumUtils.h"
#include <algorithm>
#include <map>

namespace velorent {

FleetAnalyticsReport FleetIntelligenceEngine::generateReport(
    const std::vector<std::shared_ptr<Vehicle>>& fleet,
    const std::vector<Rental>& rentals,
    const std::vector<Payment>& payments,
    const std::vector<Maintenance>& maintenanceTasks) {

    FleetAnalyticsReport report;
    report.totalVehicles = static_cast<int>(fleet.size());

    if (report.totalVehicles == 0) return report;

    double totalHealthSum = 0.0;

    for (const auto& v : fleet) {
        if (!v) continue;
        totalHealthSum += v->getHealthScore();

        switch (v->getStatus()) {
            case VehicleStatus::AVAILABLE:   report.availableVehicles++; break;
            case VehicleStatus::RESERVED:    report.reservedVehicles++; break;
            case VehicleStatus::RENTED:      report.rentedVehicles++; break;
            case VehicleStatus::MAINTENANCE: report.maintenanceVehicles++; break;
            default: break;
        }

        // Check low health alert
        if (v->getHealthScore() < 60.0) {
            FleetInsight ins;
            ins.metricName = "Declining Vehicle Health";
            ins.metricValue = v->getBrand() + " " + v->getModel() + " (Reg: " + v->getRegistrationNumber() + ")";
            ins.severity = v->getHealthScore() < 40.0 ? InsightSeverity::CRITICAL : InsightSeverity::WARNING;
            ins.explanation = "Vehicle health index dropped to " + std::to_string(static_cast<int>(v->getHealthScore())) + "/100.";
            ins.suggestedAction = "Schedule routine fleet inspection and preemptive servicing.";
            report.insights.push_back(ins);
        }
    }

    report.averageHealthScore = totalHealthSum / report.totalVehicles;
    report.fleetUtilizationPct = (static_cast<double>(report.rentedVehicles) / report.totalVehicles) * 100.0;

    // Sum total revenue
    for (const auto& p : payments) {
        if (p.getStatus() == PaymentStatus::COMPLETED) {
            report.totalRevenueINR += p.getAmount();
        }
    }

    // Sum total maintenance cost
    for (const auto& m : maintenanceTasks) {
        if (m.getStatus() == MaintenanceStatus::COMPLETED) {
            report.totalMaintenanceCostINR += m.getTotalCost();
        }
    }

    report.netEstimatedProfitINR = report.totalRevenueINR - report.totalMaintenanceCostINR;

    // High level fleet insights
    FleetInsight summaryIns;
    summaryIns.metricName = "Overall Fleet Utilization Rate";
    summaryIns.metricValue = std::to_string(static_cast<int>(report.fleetUtilizationPct)) + "%";
    summaryIns.severity = report.fleetUtilizationPct < 30.0 ? InsightSeverity::WARNING : InsightSeverity::INFO;
    summaryIns.explanation = std::to_string(report.rentedVehicles) + " of " + std::to_string(report.totalVehicles) + " vehicles currently rented out.";
    summaryIns.suggestedAction = report.fleetUtilizationPct < 30.0 ? "Launch promotional discounts to boost demand." : "Maintain current pricing and dispatch operations.";
    report.insights.push_back(summaryIns);

    FleetInsight profitIns;
    profitIns.metricName = "Net Estimated Fleet Profit";
    profitIns.metricValue = "INR " + std::to_string(static_cast<int>(report.netEstimatedProfitINR));
    profitIns.severity = InsightSeverity::INFO;
    profitIns.explanation = "Calculated from INR " + std::to_string(static_cast<int>(report.totalRevenueINR)) + " gross revenue minus INR " +
                            std::to_string(static_cast<int>(report.totalMaintenanceCostINR)) + " maintenance expenses.";
    profitIns.suggestedAction = "Reinvest operational profits into fleet expansion for high-demand categories.";
    report.insights.push_back(profitIns);

    return report;
}

std::string FleetIntelligenceEngine::severityToString(InsightSeverity severity) {
    switch (severity) {
        case InsightSeverity::INFO:     return "INFO";
        case InsightSeverity::WARNING:  return "WARNING";
        case InsightSeverity::CRITICAL: return "CRITICAL";
    }
    return "UNKNOWN";
}

} // namespace velorent
