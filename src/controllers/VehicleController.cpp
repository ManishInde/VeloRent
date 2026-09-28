#include "VehicleController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"
#include "Car.h"
#include "Bike.h"
#include "ValidationException.h"
#include "NotFoundException.h"
#include <iostream>

namespace velorent {

VehicleController::VehicleController(VehicleService& vehicleService,
                                       VehicleHealthEngine& healthEngine,
                                       MaintenanceRepository& maintenanceRepo,
                                       AuthMiddleware& authMiddleware)
    : vehicleService(vehicleService), healthEngine(healthEngine),
      maintenanceRepo(maintenanceRepo), authMiddleware(authMiddleware) {}

void VehicleController::getVehicles(const httplib::Request& req, httplib::Response& res) {
    try {
        VehicleFilter filter;
        if (req.has_param("search")) {
            filter.searchTerm = req.get_param_value("search");
        }
        if (req.has_param("brand")) filter.brand = req.get_param_value("brand");
        if (req.has_param("status")) filter.statusStr = req.get_param_value("status");
        if (req.has_param("fuelType")) filter.fuelTypeStr = req.get_param_value("fuelType");
        if (req.has_param("transmission")) filter.transmissionStr = req.get_param_value("transmission");
        if (req.has_param("minPrice")) filter.minPrice = std::stod(req.get_param_value("minPrice"));
        if (req.has_param("maxPrice")) filter.maxPrice = std::stod(req.get_param_value("maxPrice"));
        if (req.has_param("categoryId")) filter.categoryId = std::stoi(req.get_param_value("categoryId"));

        auto vehicles = vehicleService.searchVehicles(filter);
        HttpResponse::collection(res, JsonUtils::toJson(vehicles));
    } catch (...) {
        throw;
    }
}

void VehicleController::getVehicleById(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);
        auto vehicle = vehicleService.getVehicleDetails(id);
        if (!vehicle) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(id) + " not found.");
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(*vehicle));
    } catch (...) {
        throw;
    }
}

void VehicleController::getVehicleHealth(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        int id = std::stoi(req.matches[1]);
        auto vehicle = vehicleService.getVehicleDetails(id);
        if (!vehicle) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(id) + " not found.");
            return;
        }

        auto maints = maintenanceRepo.findByVehicle(id);
        auto result = healthEngine.evaluateHealth(*vehicle, {}, maints);
        nlohmann::json data = JsonUtils::toJson(result);
        data["vehicleId"] = id;
        HttpResponse::success(res, data);
    } catch (...) {
        throw;
    }
}

void VehicleController::createVehicle(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        auto body = nlohmann::json::parse(req.body);
        std::string regNum = body.at("registrationNumber").get<std::string>();
        std::string brand = body.at("brand").get<std::string>();
        std::string model = body.at("model").get<std::string>();
        int categoryId = body.at("categoryId").get<int>();
        std::string type = body.value("type", "CAR");
        double baseRate = body.at("baseRentalRate").get<double>();
        std::string fuelStr = body.value("fuelType", "PETROL");
        std::string transStr = body.value("transmission", "MANUAL");

        FuelType fuel = EnumUtils::stringToFuelType(fuelStr);
        TransmissionType trans = EnumUtils::stringToTransmissionType(transStr);

        int newId = 0;
        if (type == "BIKE") {
            int cc = body.value("engineCc", 150);
            Bike bike(0, regNum, brand, model, categoryId, fuel, trans, 2, baseRate, cc);
            newId = vehicleService.addVehicle(bike);
        } else {
            int seats = body.value("seats", 5);
            Car car(0, regNum, brand, model, categoryId, fuel, trans, seats, baseRate);
            newId = vehicleService.addVehicle(car);
        }

        auto created = vehicleService.getVehicleDetails(newId);
        HttpResponse::success(res, JsonUtils::toJson(*created), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON parsing/validation error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void VehicleController::updateVehicle(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        int id = std::stoi(req.matches[1]);
        auto vehicle = vehicleService.getVehicleDetails(id);
        if (!vehicle) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(id) + " not found.");
            return;
        }

        auto body = nlohmann::json::parse(req.body);
        if (body.contains("baseRentalRate")) {
            vehicle->setBaseRentalRate(body.at("baseRentalRate").get<double>());
            vehicleService.updateVehicle(*vehicle);
        }
        auto updated = vehicleService.getVehicleDetails(id);
        HttpResponse::success(res, JsonUtils::toJson(*updated));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void VehicleController::updateVehicleStatus(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        int id = std::stoi(req.matches[1]);
        auto body = nlohmann::json::parse(req.body);
        std::string statusStr = body.at("status").get<std::string>();
        VehicleStatus status = EnumUtils::stringToVehicleStatus(statusStr);

        bool ok = vehicleService.updateVehicleStatus(id, status);
        if (!ok) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(id) + " not found.");
            return;
        }

        auto updated = vehicleService.getVehicleDetails(id);
        HttpResponse::success(res, JsonUtils::toJson(*updated));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void VehicleController::deleteVehicle(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireRole(auth, UserRole::ADMIN);

        int id = std::stoi(req.matches[1]);
        bool ok = vehicleService.deactivateVehicle(id);
        if (!ok) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(id) + " not found.");
            return;
        }
        HttpResponse::success(res, {{"message", "Vehicle deactivated successfully."}});
    } catch (...) {
        throw;
    }
}

} // namespace velorent
