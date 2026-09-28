#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a customer's queue request for a vehicle when unavailable.
 */
class WaitlistEntry : public IEntity {
private:
    int id;
    int customerId;
    int vehicleId;
    std::string requestedStart;
    std::string requestedEnd;
    WaitlistStatus status;
    std::string notifiedAt;
    std::string queuedAt;

public:
    WaitlistEntry(int id,
                  int customerId,
                  int vehicleId,
                  const std::string& requestedStart,
                  const std::string& requestedEnd,
                  WaitlistStatus status = WaitlistStatus::WAITING,
                  const std::string& notifiedAt = "",
                  const std::string& queuedAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    int getCustomerId() const { return customerId; }
    int getVehicleId() const { return vehicleId; }
    const std::string& getRequestedStart() const { return requestedStart; }
    const std::string& getRequestedEnd() const { return requestedEnd; }
    WaitlistStatus getStatus() const { return status; }
    const std::string& getNotifiedAt() const { return notifiedAt; }
    const std::string& getQueuedAt() const { return queuedAt; }

    void setStatus(WaitlistStatus newStatus) { status = newStatus; }
    void markNotified(const std::string& timestamp);
};

} // namespace velorent
