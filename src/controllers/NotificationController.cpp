#include "NotificationController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"

namespace velorent {

NotificationController::NotificationController(NotificationService& notificationService,
                                                 NotificationRepository& notificationRepo,
                                                 AuthMiddleware& authMiddleware)
    : notificationService(notificationService), notificationRepo(notificationRepo),
      authMiddleware(authMiddleware) {}

void NotificationController::getCustomerNotifications(const httplib::Request& req, httplib::Response& res) {
    try {
        int userId = std::stoi(req.matches[1]);

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, userId);

        bool unreadOnly = req.has_param("unreadOnly") && (req.get_param_value("unreadOnly") == "true" || req.get_param_value("unreadOnly") == "1");

        auto notifications = unreadOnly ? notificationService.getUnreadUserNotifications(userId)
                                        : notificationService.getUserNotifications(userId);
        HttpResponse::collection(res, JsonUtils::toJson(notifications));
    } catch (...) {
        throw;
    }
}

void NotificationController::getNotificationById(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);
        Notification notif = notificationService.getNotificationById(id);
        if (notif.getId() == 0) {
            HttpResponse::notFound(res, "Notification with ID " + std::to_string(id) + " not found.");
            return;
        }

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, notif.getUserId());

        HttpResponse::success(res, JsonUtils::toJson(notif));
    } catch (...) {
        throw;
    }
}

void NotificationController::markAsRead(const httplib::Request& req, httplib::Response& res) {
    try {
        int id = std::stoi(req.matches[1]);
        Notification notif = notificationService.getNotificationById(id);
        if (notif.getId() == 0) {
            HttpResponse::notFound(res, "Notification with ID " + std::to_string(id) + " not found.");
            return;
        }

        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::checkOwnership(auth, notif.getUserId());

        bool ok = notificationService.markNotificationAsRead(id);
        if (!ok) {
            HttpResponse::notFound(res, "Notification with ID " + std::to_string(id) + " not found.");
            return;
        }
        Notification updated = notificationService.getNotificationById(id);
        HttpResponse::success(res, JsonUtils::toJson(updated));
    } catch (...) {
        throw;
    }
}

void NotificationController::createNotification(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        auto body = nlohmann::json::parse(req.body);
        int userId = body.at("userId").get<int>();
        std::string title = body.at("title").get<std::string>();
        std::string msg = body.at("message").get<std::string>();
        std::string typeStr = body.value("type", "SYSTEM");
        int refId = body.value("referenceId", 0);

        NotificationType type = EnumUtils::stringToNotificationType(typeStr);
        int notifId = notificationService.sendNotification(userId, type, title, msg, refId);
        Notification notif = notificationService.getNotificationById(notifId);
        HttpResponse::success(res, JsonUtils::toJson(notif), 201);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

} // namespace velorent
