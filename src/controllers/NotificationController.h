#pragma once
#include "httplib.h"
#include "NotificationService.h"
#include "NotificationRepository.h"
#include "AuthMiddleware.h"

namespace velorent {

class NotificationController {
private:
    NotificationService& notificationService;
    NotificationRepository& notificationRepo;
    AuthMiddleware& authMiddleware;

public:
    NotificationController(NotificationService& notificationService,
                           NotificationRepository& notificationRepo,
                           AuthMiddleware& authMiddleware);

    void getCustomerNotifications(const httplib::Request& req, httplib::Response& res);
    void getNotificationById(const httplib::Request& req, httplib::Response& res);
    void markAsRead(const httplib::Request& req, httplib::Response& res);
    void createNotification(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
