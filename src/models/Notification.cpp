#include "Notification.h"
#include "ValidationUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

Notification::Notification(int id,
                           int userId,
                           NotificationType notificationType,
                           const std::string& title,
                           const std::string& message,
                           int referenceId,
                           bool isRead,
                           const std::string& createdAt)
    : id(id), userId(userId), notificationType(notificationType),
      title(title), message(message), referenceId(referenceId),
      isRead(isRead), createdAt(createdAt)
{
    ValidationUtils::validateNonEmptyString(title, "Notification Title");
    ValidationUtils::validateNonEmptyString(message, "Notification Message");
}

std::string Notification::toString() const {
    std::ostringstream ss;
    ss << "Notification[ID: " << id << ", UserID: " << userId
       << ", Type: " << EnumUtils::toString(notificationType)
       << ", Title: " << title << ", Read: " << (isRead ? "YES" : "NO") << "]";
    return ss.str();
}

} // namespace velorent
