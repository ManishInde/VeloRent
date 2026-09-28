#include "Admin.h"
#include <sstream>

namespace velorent {

Admin::Admin(int id,
             const std::string& fullName,
             const std::string& email,
             const std::string& passwordHash,
             const std::string& phone,
             const std::string& department,
             const std::string& adminLevel,
             AccountStatus status,
             const std::string& createdAt)
    : User(id, fullName, email, passwordHash, phone, UserRole::ADMIN, status, createdAt),
      department(department), adminLevel(adminLevel)
{
}

std::string Admin::displayDashboard() const {
    std::ostringstream ss;
    ss << "=== Administrator Control Panel ===\n"
       << "Admin: " << fullName << " (" << adminLevel << ")\n"
       << "Department: " << department << "\n"
       << "Access Level: FULL_SYSTEM_OVERRIDE\n";
    return ss.str();
}

} // namespace velorent
