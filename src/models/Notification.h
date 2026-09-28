#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents an in-app user notification.
 */
class Notification : public IEntity {
private:
    int id;
    int userId;
    NotificationType notificationType;
    std::string title;
    std::string message;
    int referenceId;
    bool isRead;
    std::string createdAt;

public:
    Notification(int id,
                 int userId,
                 NotificationType notificationType,
                 const std::string& title,
                 const std::string& message,
                 int referenceId = 0,
                 bool isRead = false,
                 const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    int getUserId() const { return userId; }
    NotificationType getNotificationType() const { return notificationType; }
    const std::string& getTitle() const { return title; }
    const std::string& getMessage() const { return message; }
    int getReferenceId() const { return referenceId; }
    bool getIsRead() const { return isRead; }
    const std::string& getCreatedAt() const { return createdAt; }

    void markAsRead() { isRead = true; }
};

} // namespace velorent
