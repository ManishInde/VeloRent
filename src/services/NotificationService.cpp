#include "NotificationService.h"
#include "ValidationException.h"
#include "Logger.h"

namespace velorent {

NotificationService::NotificationService(NotificationRepository& nRepo)
    : notificationRepo(nRepo)
{
}

int NotificationService::sendNotification(int userId, NotificationType type, const std::string& title,
                                          const std::string& message, int referenceId) {
    Logger::info("NotificationService: Sending notification to User ID " + std::to_string(userId) + " Title: " + title);
    if (title.empty() || message.empty()) {
        throw ValidationException("Notification title and message cannot be empty.");
    }
    Notification notif(0, userId, type, title, message, referenceId, false, "");
    return notificationRepo.save(notif);
}

Notification NotificationService::getNotificationById(int notificationId) {
    return notificationRepo.findById(notificationId);
}

std::vector<Notification> NotificationService::getUserNotifications(int userId) {
    return notificationRepo.findByUser(userId);
}

std::vector<Notification> NotificationService::getUnreadUserNotifications(int userId) {
    return notificationRepo.findUnreadByUser(userId);
}

bool NotificationService::markNotificationAsRead(int notificationId) {
    Logger::info("NotificationService: Marking notification ID " + std::to_string(notificationId) + " as read.");
    return notificationRepo.markAsRead(notificationId);
}

} // namespace velorent
