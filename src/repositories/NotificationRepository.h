#pragma once
#include "Notification.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class NotificationRepository {
private:
    DatabaseManager& db;

public:
    explicit NotificationRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Notification findById(int notificationId);
    std::vector<Notification> findByUser(int userId);
    std::vector<Notification> findUnreadByUser(int userId);

    int save(Notification& notification);
    bool markAsRead(int notificationId);
};

} // namespace velorent
