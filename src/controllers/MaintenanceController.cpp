#include "MaintenanceController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"

namespace velorent {

MaintenanceController::MaintenanceController(MaintenanceService& maintenanceService, AuthMiddleware& authMiddleware)
    : maintenanceService(maintenanceService), authMiddleware(authMiddleware) {}

void MaintenanceController::getMaintenanceTasks(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        if (req.has_param("vehicleId")) {
            int vehicleId = std::stoi(req.get_param_value("vehicleId"));
            auto tasks = maintenanceService.getVehicleMaintenanceHistory(vehicleId);
            HttpResponse::collection(res, JsonUtils::toJson(tasks));
            return;
        }
        auto tasks = maintenanceService.getOpenMaintenanceTasks();
        HttpResponse::collection(res, JsonUtils::toJson(tasks));
    } catch (...) {
        throw;
    }
}

void MaintenanceController::getMaintenanceById(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        int id = std::stoi(req.matches[1]);
        Maintenance task = maintenanceService.getTaskById(id);
        if (task.getId() == 0) {
            HttpResponse::notFound(res, "Maintenance task with ID " + std::to_string(id) + " not found.");
            return;
        }
        HttpResponse::success(res, JsonUtils::toJson(task));
    } catch (...) {
        throw;
    }
}

void MaintenanceController::scheduleMaintenance(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        auto body = nlohmann::json::parse(req.body);
        int vehicleId = body.at("vehicleId").get<int>();
        std::string typeStr = body.value("type", "ROUTINE");
        std::string priorityStr = body.value("priority", "MEDIUM");
        std::string desc = body.value("description", "");
        std::string scheduledDate = body.value("scheduledDate", "2026-10-01");
        int assignedTo = body.value("assignedTo", 0);
        int damageReportId = body.value("damageReportId", 0);

        MaintenanceType type = EnumUtils::stringToMaintenanceType(typeStr);
        MaintenancePriority priority = EnumUtils::stringToMaintenancePriority(priorityStr);

        int maintId = maintenanceService.scheduleMaintenance(vehicleId, type, priority, desc, scheduledDate, assignedTo, damageReportId);
        Maintenance task = maintenanceService.getTaskById(maintId);
        HttpResponse::success(res, JsonUtils::toJson(task), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void MaintenanceController::completeMaintenance(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::MAINTENANCE_STAFF});

        int id = std::stoi(req.matches[1]);
        auto body = nlohmann::json::parse(req.body);
        double cost = body.at("totalCost").get<double>();
        int staffId = body.value("staffId", auth.userId);
        std::string notes = body.value("notes", "Completed via REST API");

        bool ok = maintenanceService.completeMaintenance(id, cost, staffId, notes);
        if (!ok) {
            HttpResponse::notFound(res, "Maintenance task with ID " + std::to_string(id) + " not found or already completed.");
            return;
        }
        Maintenance task = maintenanceService.getTaskById(id);
        HttpResponse::success(res, JsonUtils::toJson(task));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void MaintenanceController::updateStatus(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER, UserRole::MAINTENANCE_STAFF});

        int id = std::stoi(req.matches[1]);
        auto body = nlohmann::json::parse(req.body);
        std::string statusStr = body.at("status").get<std::string>();
        MaintenanceStatus status = EnumUtils::stringToMaintenanceStatus(statusStr);

        bool ok = maintenanceService.updateStatus(id, status);
        if (!ok) {
            HttpResponse::notFound(res, "Maintenance task with ID " + std::to_string(id) + " not found.");
            return;
        }
        Maintenance task = maintenanceService.getTaskById(id);
        HttpResponse::success(res, JsonUtils::toJson(task));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

} // namespace velorent
