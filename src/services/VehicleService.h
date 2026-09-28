#pragma once
#include "VehicleRepository.h"
#include "Vehicle.h"
#include <memory>
#include <vector>

namespace velorent {

struct VehicleFilter {
    int categoryId = 0;
    std::string fuelTypeStr = "";
    std::string transmissionStr = "";
    int minSeats = 0;
    double minPrice = 0.0;
    double maxPrice = 0.0;
    std::string statusStr = "";
    double minHealthScore = 0.0;
    std::string brand = "";
    std::string searchTerm = "";
};

class VehicleService {
private:
    VehicleRepository& vehicleRepo;

public:
    explicit VehicleService(VehicleRepository& repo);

    std::shared_ptr<Vehicle> getVehicleDetails(int vehicleId);
    std::vector<std::shared_ptr<Vehicle>> getAllVehicles();
    std::vector<std::shared_ptr<Vehicle>> getAvailableVehicles();
    std::vector<std::shared_ptr<Vehicle>> searchVehicles(const VehicleFilter& filter);
    
    int addVehicle(Vehicle& vehicle);
    bool updateVehicle(const Vehicle& vehicle);
    bool deactivateVehicle(int vehicleId);
    bool updateVehicleStatus(int vehicleId, VehicleStatus newStatus);
    
    void validateVehicle(const Vehicle& vehicle);
};

} // namespace velorent
