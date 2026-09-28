#pragma once
#include "httplib.h"
#include "MaintenanceService.h"
#include "AuthMiddleware.h"

namespace velorent {

class MaintenanceController {
private:
    MaintenanceService& maintenanceService;
    AuthMiddleware& authMiddleware;

public:
    MaintenanceController(MaintenanceService& maintenanceService, AuthMiddleware& authMiddleware);

    void getMaintenanceTasks(const httplib::Request& req, httplib::Response& res);
    void getMaintenanceById(const httplib::Request& req, httplib::Response& res);
    void scheduleMaintenance(const httplib::Request& req, httplib::Response& res);
    void completeMaintenance(const httplib::Request& req, httplib::Response& res);
    void updateStatus(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
