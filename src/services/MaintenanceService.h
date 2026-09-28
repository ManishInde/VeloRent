#pragma once
#include "MaintenanceRepository.h"
#include "VehicleRepository.h"
#include "Maintenance.h"
#include <vector>

namespace velorent {

class MaintenanceService {
private:
    MaintenanceRepository& maintenanceRepo;
    VehicleRepository& vehicleRepo;

public:
    MaintenanceService(MaintenanceRepository& mRepo, VehicleRepository& vRepo);

    int scheduleMaintenance(int vehicleId, MaintenanceType type, MaintenancePriority priority,
                            const std::string& description, const std::string& scheduledDate,
                            int assignedTo = 0, int damageReportId = 0, int actorId = 0);

    bool completeMaintenance(int maintenanceId, double totalCost, int staffId,
                             const std::string& notes = "", const std::string& partsUsed = "");

    Maintenance getTaskById(int maintenanceId);
    std::vector<Maintenance> getVehicleMaintenanceHistory(int vehicleId);
    std::vector<Maintenance> getOpenMaintenanceTasks();
    bool updateStatus(int maintenanceId, MaintenanceStatus status);
};

} // namespace velorent
