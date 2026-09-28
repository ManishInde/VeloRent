#pragma once
#include "NotificationRepository.h"
#include "Notification.h"
#include <vector>

namespace velorent {

class NotificationService {
private:
    NotificationRepository& notificationRepo;

public:
    explicit NotificationService(NotificationRepository& nRepo);

    int sendNotification(int userId, NotificationType type, const std::string& title,
                         const std::string& message, int referenceId = 0);

    Notification getNotificationById(int notificationId);
    std::vector<Notification> getUserNotifications(int userId);
    std::vector<Notification> getUnreadUserNotifications(int userId);
    bool markNotificationAsRead(int notificationId);
};

} // namespace velorent
