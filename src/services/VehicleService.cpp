#include "VehicleService.h"
#include "ValidationException.h"
#include "NotFoundException.h"
#include "Logger.h"
#include "EnumUtils.h"
#include <algorithm>

namespace velorent {

VehicleService::VehicleService(VehicleRepository& repo)
    : vehicleRepo(repo)
{
}

std::shared_ptr<Vehicle> VehicleService::getVehicleDetails(int vehicleId) {
    Logger::info("VehicleService: Fetching details for Vehicle ID " + std::to_string(vehicleId));
    auto v = vehicleRepo.findById(vehicleId);
    if (!v) {
        throw NotFoundException("Vehicle ID " + std::to_string(vehicleId) + " not found.");
    }
    return v;
}

std::vector<std::shared_ptr<Vehicle>> VehicleService::getAllVehicles() {
    Logger::info("VehicleService: Retrieving all vehicles.");
    return vehicleRepo.findAll();
}

std::vector<std::shared_ptr<Vehicle>> VehicleService::getAvailableVehicles() {
    Logger::info("VehicleService: Retrieving available vehicles.");
    return vehicleRepo.findAvailable();
}

#include <cctype>

static std::string toLowerString(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char c) { return std::tolower(c); });
    return lower;
}

std::vector<std::shared_ptr<Vehicle>> VehicleService::searchVehicles(const VehicleFilter& filter) {
    Logger::info("VehicleService: Executing vehicle search filter.");
    auto all = vehicleRepo.findAll();
    std::vector<std::shared_ptr<Vehicle>> result;

    for (const auto& v : all) {
        if (filter.categoryId != 0 && v->getCategoryId() != filter.categoryId) continue;
        if (!filter.fuelTypeStr.empty() && EnumUtils::toString(v->getFuelType()) != filter.fuelTypeStr) continue;
        if (!filter.transmissionStr.empty() && EnumUtils::toString(v->getTransmission()) != filter.transmissionStr) continue;
        if (filter.minSeats > 0 && v->getSeats() < filter.minSeats) continue;
        if (filter.minPrice > 0.0 && v->getBaseRentalRate() < filter.minPrice) continue;
        if (filter.maxPrice > 0.0 && v->getBaseRentalRate() > filter.maxPrice) continue;
        if (!filter.statusStr.empty() && EnumUtils::toString(v->getStatus()) != filter.statusStr) continue;
        if (filter.minHealthScore > 0.0 && v->getHealthScore() < filter.minHealthScore) continue;

        if (!filter.brand.empty()) {
            std::string vBrand = toLowerString(v->getBrand());
            std::string qBrand = toLowerString(filter.brand);
            if (vBrand.find(qBrand) == std::string::npos) continue;
        }

        if (!filter.searchTerm.empty()) {
            std::string query = toLowerString(filter.searchTerm);
            std::string brand = toLowerString(v->getBrand());
            std::string model = toLowerString(v->getModel());
            std::string fullName = brand + " " + model;
            std::string reg = toLowerString(v->getRegistrationNumber());

            bool match = (brand.find(query) != std::string::npos) ||
                         (model.find(query) != std::string::npos) ||
                         (fullName.find(query) != std::string::npos) ||
                         (reg.find(query) != std::string::npos);

            if (!match) continue;
        }

        result.push_back(v);
    }
    return result;
}

int VehicleService::addVehicle(Vehicle& vehicle) {
    Logger::info("VehicleService: Registering new vehicle " + vehicle.getRegistrationNumber());
    validateVehicle(vehicle);
    return vehicleRepo.save(vehicle);
}

bool VehicleService::updateVehicle(const Vehicle& vehicle) {
    Logger::info("VehicleService: Updating vehicle ID " + std::to_string(vehicle.getId()));
    validateVehicle(vehicle);
    return vehicleRepo.update(vehicle);
}

bool VehicleService::deactivateVehicle(int vehicleId) {
    Logger::info("VehicleService: Deactivating vehicle ID " + std::to_string(vehicleId));
    return vehicleRepo.deactivate(vehicleId);
}

bool VehicleService::updateVehicleStatus(int vehicleId, VehicleStatus newStatus) {
    Logger::info("VehicleService: Updating status of Vehicle ID " + std::to_string(vehicleId) + " to " + EnumUtils::toString(newStatus));
    auto v = vehicleRepo.findById(vehicleId);
    v->setStatus(newStatus);
    return vehicleRepo.update(*v);
}

void VehicleService::validateVehicle(const Vehicle& vehicle) {
    if (vehicle.getRegistrationNumber().empty()) {
        throw ValidationException("Vehicle registration number cannot be empty.");
    }
    if (vehicle.getBrand().empty() || vehicle.getModel().empty()) {
        throw ValidationException("Vehicle brand and model cannot be empty.");
    }
    if (vehicle.getBaseRentalRate() <= 0.0) {
        throw ValidationException("Vehicle base rental rate must be positive.");
    }
}

} // namespace velorent
