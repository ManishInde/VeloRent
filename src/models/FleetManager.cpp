#include "FleetManager.h"
#include <sstream>

namespace velorent {

FleetManager::FleetManager(int id,
                           const std::string& fullName,
                           const std::string& email,
                           const std::string& passwordHash,
                           const std::string& phone,
                           const std::string& assignedHub,
                           int managedVehiclesCount,
                           AccountStatus status,
                           const std::string& createdAt)
    : User(id, fullName, email, passwordHash, phone, UserRole::FLEET_MANAGER, status, createdAt),
      assignedHub(assignedHub), managedVehiclesCount(managedVehiclesCount)
{
}

std::string FleetManager::displayDashboard() const {
    std::ostringstream ss;
    ss << "=== Fleet Operations Management Dashboard ===\n"
       << "Manager: " << fullName << "\n"
       << "Hub Location: " << assignedHub << "\n"
       << "Vehicles Managed: " << managedVehiclesCount << "\n";
    return ss.str();
}

} // namespace velorent
