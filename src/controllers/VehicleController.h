#pragma once
#include "httplib.h"
#include "VehicleService.h"
#include "VehicleHealthEngine.h"
#include "MaintenanceRepository.h"
#include "AuthMiddleware.h"

namespace velorent {

class VehicleController {
private:
    VehicleService& vehicleService;
    VehicleHealthEngine& healthEngine;
    MaintenanceRepository& maintenanceRepo;
    AuthMiddleware& authMiddleware;

public:
    VehicleController(VehicleService& vehicleService,
                      VehicleHealthEngine& healthEngine,
                      MaintenanceRepository& maintenanceRepo,
                      AuthMiddleware& authMiddleware);

    void getVehicles(const httplib::Request& req, httplib::Response& res);
    void getVehicleById(const httplib::Request& req, httplib::Response& res);
    void getVehicleHealth(const httplib::Request& req, httplib::Response& res);
    void createVehicle(const httplib::Request& req, httplib::Response& res);
    void updateVehicle(const httplib::Request& req, httplib::Response& res);
    void updateVehicleStatus(const httplib::Request& req, httplib::Response& res);
    void deleteVehicle(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
