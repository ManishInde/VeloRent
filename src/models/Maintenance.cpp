#include "Maintenance.h"
#include "ValidationUtils.h"
#include "MoneyUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

Maintenance::Maintenance(int id,
                         int vehicleId,
                         MaintenanceType type,
                         MaintenancePriority priority,
                         MaintenanceStatus status,
                         const std::string& description,
                         int damageReportId,
                         const std::string& scheduledDate,
                         const std::string& completionDate,
                         double totalCost,
                         int assignedTo)
    : id(id), vehicleId(vehicleId), damageReportId(damageReportId),
      type(type), status(status), priority(priority),
      description(description), scheduledDate(scheduledDate),
      completionDate(completionDate), assignedTo(assignedTo)
{
    setTotalCost(totalCost);
}

std::string Maintenance::toString() const {
    std::ostringstream ss;
    ss << "Maintenance[ID: " << id << ", VehicleID: " << vehicleId
       << ", Type: " << EnumUtils::toString(type)
       << ", Priority: " << EnumUtils::toString(priority)
       << ", Status: " << EnumUtils::toString(status)
       << ", Cost: INR " << totalCost << "]";
    return ss.str();
}

void Maintenance::setTotalCost(double cost) {
    ValidationUtils::validateNonNegativeAmount(cost, "Maintenance Cost");
    totalCost = MoneyUtils::roundToTwoDecimals(cost);
}

void Maintenance::markCompleted(const std::string& completionTimestamp, double finalCost) {
    completionDate = completionTimestamp;
    setTotalCost(finalCost);
    status = MaintenanceStatus::COMPLETED;
}

} // namespace velorent
