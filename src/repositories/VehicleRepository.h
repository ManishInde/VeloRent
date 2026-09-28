#pragma once
#include "Vehicle.h"
#include "DatabaseManager.h"
#include <memory>
#include <vector>

namespace velorent {

class VehicleRepository {
private:
    DatabaseManager& db;

public:
    explicit VehicleRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    std::shared_ptr<Vehicle> findById(int vehicleId);
    std::vector<std::shared_ptr<Vehicle>> findAll();
    std::vector<std::shared_ptr<Vehicle>> findAvailable();
    std::vector<std::shared_ptr<Vehicle>> findByCategory(int categoryId);
    std::vector<std::shared_ptr<Vehicle>> findByStatus(VehicleStatus status);
    std::vector<std::shared_ptr<Vehicle>> search(const std::string& brand, int categoryId, double maxRate);
    
    int save(Vehicle& vehicle);
    bool update(const Vehicle& vehicle);
    bool deactivate(int vehicleId);
};

} // namespace velorent
