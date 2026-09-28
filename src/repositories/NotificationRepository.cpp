#include "NotificationRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"

namespace velorent {

NotificationRepository::NotificationRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Notification NotificationRepository::findById(int notificationId) {
    std::string sql = "SELECT * FROM notifications WHERE notification_id = ?";
    ResultSet rs = db.executeQuery(sql, {notificationId});
    if (rs.empty()) {
        throw NotFoundException("Notification with ID " + std::to_string(notificationId) + " not found.");
    }
    return RowMappers::mapNotification(rs[0]);
}

std::vector<Notification> NotificationRepository::findByUser(int userId) {
    std::string sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC";
    ResultSet rs = db.executeQuery(sql, {userId});
    std::vector<Notification> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapNotification(row));
    }
    return list;
}

std::vector<Notification> NotificationRepository::findUnreadByUser(int userId) {
    std::string sql = "SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY notification_id DESC";
    ResultSet rs = db.executeQuery(sql, {userId});
    std::vector<Notification> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapNotification(row));
    }
    return list;
}

int NotificationRepository::save(Notification& notification) {
    std::string sql = "INSERT INTO notifications (user_id, notification_type, title, message, reference_id, is_read) VALUES (?, ?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        notification.getUserId(),
        EnumUtils::toString(notification.getNotificationType()),
        notification.getTitle(),
        notification.getMessage(),
        notification.getReferenceId() == 0 ? DbValue(nullptr) : DbValue(notification.getReferenceId()),
        notification.getIsRead()
    });
    return static_cast<int>(newId);
}

bool NotificationRepository::markAsRead(int notificationId) {
    std::string sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
    uint64_t rows = db.executeUpdate(sql, {notificationId});
    return rows > 0;
}

} // namespace velorent
