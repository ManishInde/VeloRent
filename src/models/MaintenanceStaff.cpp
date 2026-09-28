#include "MaintenanceStaff.h"
#include <sstream>

namespace velorent {

MaintenanceStaff::MaintenanceStaff(int id,
                                   const std::string& fullName,
                                   const std::string& email,
                                   const std::string& passwordHash,
                                   const std::string& phone,
                                   const std::string& specialization,
                                   int tasksCompleted,
                                   AccountStatus status,
                                   const std::string& createdAt)
    : User(id, fullName, email, passwordHash, phone, UserRole::MAINTENANCE_STAFF, status, createdAt),
      specialization(specialization), tasksCompleted(tasksCompleted)
{
}

std::string MaintenanceStaff::displayDashboard() const {
    std::ostringstream ss;
    ss << "=== Maintenance Technician Portal ===\n"
       << "Technician: " << fullName << "\n"
       << "Specialization: " << specialization << "\n"
       << "Total Repair Tasks Completed: " << tasksCompleted << "\n";
    return ss.str();
}

} // namespace velorent
