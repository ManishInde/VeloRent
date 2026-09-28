#include "MaintenanceRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"
#include "DatabaseException.h"

namespace velorent {

MaintenanceRepository::MaintenanceRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Maintenance MaintenanceRepository::findById(int maintenanceId) {
    std::string sql = "SELECT * FROM maintenance WHERE maintenance_id = ?";
    ResultSet rs = db.executeQuery(sql, {maintenanceId});
    if (rs.empty()) {
        throw NotFoundException("Maintenance record with ID " + std::to_string(maintenanceId) + " not found.");
    }
    return RowMappers::mapMaintenance(rs[0]);
}

std::vector<Maintenance> MaintenanceRepository::findByVehicle(int vehicleId) {
    std::string sql = "SELECT * FROM maintenance WHERE vehicle_id = ? ORDER BY maintenance_id DESC";
    ResultSet rs = db.executeQuery(sql, {vehicleId});
    std::vector<Maintenance> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapMaintenance(row));
    }
    return list;
}

std::vector<Maintenance> MaintenanceRepository::findOpenTasks() {
    std::string sql = "SELECT * FROM maintenance WHERE status IN ('OPEN', 'IN_PROGRESS') ORDER BY priority DESC, scheduled_date ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<Maintenance> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapMaintenance(row));
    }
    return list;
}

int MaintenanceRepository::scheduleMaintenance(int vehicleId, MaintenanceType type, MaintenancePriority priority,
                                                 const std::string& description, const std::string& scheduledDate,
                                                 int assignedTo, int damageReportId, int actorId) {
    std::string sql = "CALL sp_schedule_maintenance(?, ?, ?, ?, ?, ?, ?, ?, @new_maint_id)";
    db.executeQuery(sql, {
        vehicleId,
        EnumUtils::toString(type),
        EnumUtils::toString(priority),
        description,
        scheduledDate.empty() ? DbValue(nullptr) : DbValue(scheduledDate),
        assignedTo == 0 ? DbValue(nullptr) : DbValue(assignedTo),
        damageReportId == 0 ? DbValue(nullptr) : DbValue(damageReportId),
        actorId
    });

    ResultSet rs = db.executeQuery("SELECT @new_maint_id AS new_id");
    if (rs.empty() || rs[0].isNull("new_id")) {
        throw DatabaseException("sp_schedule_maintenance failed to return a valid maintenance ID.");
    }

    return rs[0].getInt("new_id");
}

bool MaintenanceRepository::completeMaintenance(int maintenanceId, double totalCost, int staffId,
                                                const std::string& notes, const std::string& partsUsed) {
    std::string sql = "CALL sp_complete_maintenance(?, ?, ?, ?, ?)";
    db.executeQuery(sql, {maintenanceId, totalCost, staffId, notes, partsUsed});
    return true;
}

int MaintenanceRepository::save(Maintenance& maintenance) {
    std::string sql = "INSERT INTO maintenance (vehicle_id, maintenance_type, priority, status, description) VALUES (?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        maintenance.getVehicleId(),
        EnumUtils::toString(maintenance.getType()),
        EnumUtils::toString(maintenance.getPriority()),
        EnumUtils::toString(maintenance.getStatus()),
        maintenance.getDescription()
    });
    return static_cast<int>(newId);
}

bool MaintenanceRepository::updateStatus(int maintenanceId, MaintenanceStatus status) {
    std::string sql = "UPDATE maintenance SET status = ? WHERE maintenance_id = ?";
    uint64_t rows = db.executeUpdate(sql, {EnumUtils::toString(status), maintenanceId});
    return rows > 0;
}

} // namespace velorent
