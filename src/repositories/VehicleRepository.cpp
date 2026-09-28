#include "VehicleRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"

namespace velorent {

VehicleRepository::VehicleRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

std::shared_ptr<Vehicle> VehicleRepository::findById(int vehicleId) {
    std::string sql = "SELECT * FROM vehicles WHERE vehicle_id = ?";
    ResultSet rs = db.executeQuery(sql, {vehicleId});
    if (rs.empty()) {
        throw NotFoundException("Vehicle with ID " + std::to_string(vehicleId) + " not found.");
    }
    return RowMappers::mapVehicle(rs[0]);
}

std::vector<std::shared_ptr<Vehicle>> VehicleRepository::findAll() {
    std::string sql = "SELECT * FROM vehicles ORDER BY vehicle_id ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<std::shared_ptr<Vehicle>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapVehicle(row));
    }
    return list;
}

std::vector<std::shared_ptr<Vehicle>> VehicleRepository::findAvailable() {
    std::string sql = "SELECT * FROM vehicles WHERE status = 'AVAILABLE' ORDER BY base_rate_per_day ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<std::shared_ptr<Vehicle>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapVehicle(row));
    }
    return list;
}

std::vector<std::shared_ptr<Vehicle>> VehicleRepository::findByCategory(int categoryId) {
    std::string sql = "SELECT * FROM vehicles WHERE category_id = ? ORDER BY vehicle_id ASC";
    ResultSet rs = db.executeQuery(sql, {categoryId});
    std::vector<std::shared_ptr<Vehicle>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapVehicle(row));
    }
    return list;
}

std::vector<std::shared_ptr<Vehicle>> VehicleRepository::findByStatus(VehicleStatus status) {
    std::string sql = "SELECT * FROM vehicles WHERE status = ? ORDER BY vehicle_id ASC";
    ResultSet rs = db.executeQuery(sql, {EnumUtils::toString(status)});
    std::vector<std::shared_ptr<Vehicle>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapVehicle(row));
    }
    return list;
}

std::vector<std::shared_ptr<Vehicle>> VehicleRepository::search(const std::string& brand, int categoryId, double maxRate) {
    std::string sql = "SELECT * FROM vehicles WHERE status = 'AVAILABLE' AND (? = '' OR brand LIKE ?) AND (? = 0 OR category_id = ?) AND (? = 0.0 OR base_rate_per_day <= ?) ORDER BY base_rate_per_day ASC";
    std::string brandPattern = "%" + brand + "%";
    ResultSet rs = db.executeQuery(sql, {brand, brandPattern, categoryId, categoryId, maxRate, maxRate});
    std::vector<std::shared_ptr<Vehicle>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapVehicle(row));
    }
    return list;
}

int VehicleRepository::save(Vehicle& vehicle) {
    std::string sql = "INSERT INTO vehicles (registration_no, brand, model, category_id, fuel_type, transmission, seats, base_rate_per_day, odometer_km, health_score, status, purchase_year, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2)";
    uint64_t newId = db.executeInsert(sql, {
        vehicle.getRegistrationNumber(),
        vehicle.getBrand(),
        vehicle.getModel(),
        vehicle.getCategoryId(),
        EnumUtils::toString(vehicle.getFuelType()),
        EnumUtils::toString(vehicle.getTransmission()),
        vehicle.getSeats(),
        vehicle.getBaseRentalRate(),
        vehicle.getOdometerKm(),
        vehicle.getHealthScore(),
        EnumUtils::toString(vehicle.getStatus()),
        vehicle.getPurchaseYear()
    });
    return static_cast<int>(newId);
}

bool VehicleRepository::update(const Vehicle& vehicle) {
    std::string sql = "UPDATE vehicles SET registration_no = ?, brand = ?, model = ?, category_id = ?, fuel_type = ?, transmission = ?, seats = ?, base_rate_per_day = ?, odometer_km = ?, health_score = ?, status = ?, purchase_year = ? WHERE vehicle_id = ?";
    uint64_t rows = db.executeUpdate(sql, {
        vehicle.getRegistrationNumber(),
        vehicle.getBrand(),
        vehicle.getModel(),
        vehicle.getCategoryId(),
        EnumUtils::toString(vehicle.getFuelType()),
        EnumUtils::toString(vehicle.getTransmission()),
        vehicle.getSeats(),
        vehicle.getBaseRentalRate(),
        vehicle.getOdometerKm(),
        vehicle.getHealthScore(),
        EnumUtils::toString(vehicle.getStatus()),
        vehicle.getPurchaseYear(),
        vehicle.getId()
    });
    return rows > 0;
}

bool VehicleRepository::deactivate(int vehicleId) {
    std::string sql = "UPDATE vehicles SET status = 'INACTIVE' WHERE vehicle_id = ?";
    uint64_t rows = db.executeUpdate(sql, {vehicleId});
    return rows > 0;
}

} // namespace velorent
