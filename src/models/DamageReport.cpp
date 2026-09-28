#include "DamageReport.h"
#include "ValidationUtils.h"
#include "MoneyUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

DamageReport::DamageReport(int id,
                           int rentalId,
                           int vehicleId,
                           int reportedBy,
                           DamageSeverity severity,
                           const std::string& description,
                           double estimatedCost,
                           DamageResolutionStatus resolutionStatus,
                           const std::string& createdAt)
    : id(id), rentalId(rentalId), vehicleId(vehicleId), reportedBy(reportedBy),
      severity(severity), description(description),
      resolutionStatus(resolutionStatus), createdAt(createdAt)
{
    setEstimatedCost(estimatedCost);
}

std::string DamageReport::toString() const {
    std::ostringstream ss;
    ss << "DamageReport[ID: " << id << ", VehicleID: " << vehicleId
       << ", RentalID: " << rentalId
       << ", Severity: " << EnumUtils::toString(severity)
       << ", EstimatedCost: INR " << estimatedCost
       << ", Status: " << EnumUtils::toString(resolutionStatus) << "]";
    return ss.str();
}

void DamageReport::setEstimatedCost(double cost) {
    ValidationUtils::validateNonNegativeAmount(cost, "Damage Estimated Cost");
    estimatedCost = MoneyUtils::roundToTwoDecimals(cost);
}

} // namespace velorent
