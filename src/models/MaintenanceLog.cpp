#include "MaintenanceLog.h"
#include "ValidationUtils.h"
#include "MoneyUtils.h"
#include <sstream>

namespace velorent {

MaintenanceLog::MaintenanceLog(int logId,
                               int maintenanceId,
                               int staffId,
                               const std::string& actionTaken,
                               double logCost,
                               const std::string& loggedAt)
    : logId(logId), maintenanceId(maintenanceId), staffId(staffId),
      actionTaken(actionTaken), loggedAt(loggedAt)
{
    ValidationUtils::validateNonNegativeAmount(logCost, "Maintenance Log Cost");
    this->logCost = MoneyUtils::roundToTwoDecimals(logCost);
}

std::string MaintenanceLog::toString() const {
    std::ostringstream ss;
    ss << "MaintenanceLog[ID: " << logId << ", MaintID: " << maintenanceId
       << ", StaffID: " << staffId << ", Action: " << actionTaken
       << ", Cost: INR " << logCost << "]";
    return ss.str();
}

} // namespace velorent
