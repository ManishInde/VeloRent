#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents an entry in the work log for a maintenance task.
 */
class MaintenanceLog : public IEntity {
private:
    int logId;
    int maintenanceId;
    int staffId;
    std::string actionTaken;
    double logCost;
    std::string loggedAt;

public:
    MaintenanceLog(int logId,
                   int maintenanceId,
                   int staffId,
                   const std::string& actionTaken,
                   double logCost = 0.0,
                   const std::string& loggedAt = "");

    int getId() const override { return logId; }
    std::string toString() const override;

    int getMaintenanceId() const { return maintenanceId; }
    int getStaffId() const { return staffId; }
    const std::string& getActionTaken() const { return actionTaken; }
    double getLogCost() const { return logCost; }
    const std::string& getLoggedAt() const { return loggedAt; }
};

} // namespace velorent
