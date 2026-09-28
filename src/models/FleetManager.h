#pragma once
#include "User.h"

namespace velorent {

/**
 * @brief Represents a fleet manager user.
 */
class FleetManager : public User {
private:
    std::string assignedHub;
    int managedVehiclesCount;

public:
    FleetManager(int id,
                 const std::string& fullName,
                 const std::string& email,
                 const std::string& passwordHash,
                 const std::string& phone,
                 const std::string& assignedHub = "Central Hub",
                 int managedVehiclesCount = 0,
                 AccountStatus status = AccountStatus::ACTIVE,
                 const std::string& createdAt = "");

    std::string displayDashboard() const override;
    std::string getRoleName() const override { return "FLEET_MANAGER"; }

    const std::string& getAssignedHub() const { return assignedHub; }
    int getManagedVehiclesCount() const { return managedVehiclesCount; }

    void setAssignedHub(const std::string& hub) { assignedHub = hub; }
    void setManagedVehiclesCount(int count) { managedVehiclesCount = count; }
};

} // namespace velorent
