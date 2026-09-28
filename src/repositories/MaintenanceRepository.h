#pragma once
#include "Maintenance.h"
#include "MaintenanceLog.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class MaintenanceRepository {
private:
    DatabaseManager& db;

public:
    explicit MaintenanceRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Maintenance findById(int maintenanceId);
    std::vector<Maintenance> findByVehicle(int vehicleId);
    std::vector<Maintenance> findOpenTasks();

    /**
     * @brief Schedules a maintenance task via stored procedure sp_schedule_maintenance.
     */
    int scheduleMaintenance(int vehicleId, MaintenanceType type, MaintenancePriority priority,
                            const std::string& description, const std::string& scheduledDate,
                            int assignedTo = 0, int damageReportId = 0, int actorId = 0);

    /**
     * @brief Completes a maintenance task via stored procedure sp_complete_maintenance.
     */
    bool completeMaintenance(int maintenanceId, double totalCost, int staffId,
                            const std::string& notes = "", const std::string& partsUsed = "");

    int save(Maintenance& maintenance);
    bool updateStatus(int maintenanceId, MaintenanceStatus status);
};

} // namespace velorent
