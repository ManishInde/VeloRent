#include "SystemLog.h"
#include <sstream>

namespace velorent {

SystemLog::SystemLog(int logId,
                     int actorId,
                     const std::string& actorRole,
                     const std::string& action,
                     const std::string& entityType,
                     int entityId,
                     const std::string& oldValue,
                     const std::string& newValue,
                     const std::string& createdAt)
    : logId(logId), actorId(actorId), actorRole(actorRole),
      action(action), entityType(entityType), entityId(entityId),
      oldValue(oldValue), newValue(newValue), createdAt(createdAt)
{
}

std::string SystemLog::toString() const {
    std::ostringstream ss;
    ss << "SystemLog[ID: " << logId << ", Actor: " << actorRole << "(" << actorId << ")"
       << ", Action: " << action << ", Entity: " << entityType << "(" << entityId << ")]";
    return ss.str();
}

} // namespace velorent
