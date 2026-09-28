#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a system-wide immutable audit trail log entry.
 */
class SystemLog : public IEntity {
private:
    int logId;
    int actorId;
    std::string actorRole;
    std::string action;
    std::string entityType;
    int entityId;
    std::string oldValue;
    std::string newValue;
    std::string createdAt;

public:
    SystemLog(int logId,
              int actorId,
              const std::string& actorRole,
              const std::string& action,
              const std::string& entityType,
              int entityId,
              const std::string& oldValue = "",
              const std::string& newValue = "",
              const std::string& createdAt = "");

    int getId() const override { return logId; }
    std::string toString() const override;

    int getActorId() const { return actorId; }
    const std::string& getActorRole() const { return actorRole; }
    const std::string& getAction() const { return action; }
    const std::string& getEntityType() const { return entityType; }
    int getEntityId() const { return entityId; }
    const std::string& getOldValue() const { return oldValue; }
    const std::string& getNewValue() const { return newValue; }
    const std::string& getCreatedAt() const { return createdAt; }
};

} // namespace velorent
