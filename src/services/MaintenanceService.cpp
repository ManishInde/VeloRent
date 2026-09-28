#include "MaintenanceService.h"
#include "ValidationException.h"
#include "NotFoundException.h"
#include "Logger.h"

namespace velorent {

MaintenanceService::MaintenanceService(MaintenanceRepository& mRepo, VehicleRepository& vRepo)
    : maintenanceRepo(mRepo), vehicleRepo(vRepo)
{
}

int MaintenanceService::scheduleMaintenance(int vehicleId, MaintenanceType type, MaintenancePriority priority,
                                             const std::string& description, const std::string& scheduledDate,
                                             int assignedTo, int damageReportId, int actorId) {
    Logger::info("MaintenanceService: Scheduling maintenance for Vehicle ID " + std::to_string(vehicleId));
    vehicleRepo.findById(vehicleId);

    if (description.empty()) {
        throw ValidationException("Maintenance description cannot be empty.");
    }

    int id = maintenanceRepo.scheduleMaintenance(vehicleId, type, priority, description, scheduledDate, assignedTo, damageReportId, actorId);
    Logger::info("MaintenanceService: Maintenance task scheduled with ID " + std::to_string(id));
    return id;
}

bool MaintenanceService::completeMaintenance(int maintenanceId, double totalCost, int staffId,
                                            const std::string& notes, const std::string& partsUsed) {
    Logger::info("MaintenanceService: Completing maintenance task ID " + std::to_string(maintenanceId));
    if (totalCost < 0.0) {
        throw ValidationException("Maintenance total cost cannot be negative.");
    }
    return maintenanceRepo.completeMaintenance(maintenanceId, totalCost, staffId, notes, partsUsed);
}

Maintenance MaintenanceService::getTaskById(int maintenanceId) {
    return maintenanceRepo.findById(maintenanceId);
}

std::vector<Maintenance> MaintenanceService::getVehicleMaintenanceHistory(int vehicleId) {
    return maintenanceRepo.findByVehicle(vehicleId);
}

std::vector<Maintenance> MaintenanceService::getOpenMaintenanceTasks() {
    return maintenanceRepo.findOpenTasks();
}

bool MaintenanceService::updateStatus(int maintenanceId, MaintenanceStatus status) {
    return maintenanceRepo.updateStatus(maintenanceId, status);
}

} // namespace velorent
