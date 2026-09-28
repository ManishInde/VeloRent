#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a scheduled or active maintenance task for a vehicle.
 */
class Maintenance : public IEntity {
private:
    int id;
    int vehicleId;
    int damageReportId;
    MaintenanceType type;
    MaintenanceStatus status;
    MaintenancePriority priority;
    std::string description;
    std::string scheduledDate;
    std::string completionDate;
    double totalCost;
    int assignedTo; // Staff user ID

public:
    Maintenance(int id,
                int vehicleId,
                MaintenanceType type,
                MaintenancePriority priority = MaintenancePriority::MEDIUM,
                MaintenanceStatus status = MaintenanceStatus::OPEN,
                const std::string& description = "",
                int damageReportId = 0,
                const std::string& scheduledDate = "",
                const std::string& completionDate = "",
                double totalCost = 0.0,
                int assignedTo = 0);

    int getId() const override { return id; }
    std::string toString() const override;

    // Getters
    int getVehicleId() const { return vehicleId; }
    int getDamageReportId() const { return damageReportId; }
    MaintenanceType getType() const { return type; }
    MaintenanceStatus getStatus() const { return status; }
    MaintenancePriority getPriority() const { return priority; }
    const std::string& getDescription() const { return description; }
    const std::string& getScheduledDate() const { return scheduledDate; }
    const std::string& getCompletionDate() const { return completionDate; }
    double getTotalCost() const { return totalCost; }
    int getAssignedTo() const { return assignedTo; }

    // Mutators
    void setTotalCost(double cost);
    void setStatus(MaintenanceStatus newStatus) { status = newStatus; }
    void setPriority(MaintenancePriority newPriority) { priority = newPriority; }
    void setAssignedTo(int staffId) { assignedTo = staffId; }
    void markCompleted(const std::string& completionTimestamp, double finalCost);
};

} // namespace velorent
