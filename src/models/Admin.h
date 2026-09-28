#pragma once
#include "User.h"

namespace velorent {

/**
 * @brief Represents an administrative system user.
 * OOP Concepts: Inheritance, Polymorphism, Encapsulation.
 */
class Admin : public User {
private:
    std::string department;
    std::string adminLevel;

public:
    Admin(int id,
          const std::string& fullName,
          const std::string& email,
          const std::string& passwordHash,
          const std::string& phone,
          const std::string& department = "IT & Operations",
          const std::string& adminLevel = "SUPER_ADMIN",
          AccountStatus status = AccountStatus::ACTIVE,
          const std::string& createdAt = "");

    std::string displayDashboard() const override;
    std::string getRoleName() const override { return "ADMIN"; }

    const std::string& getDepartment() const { return department; }
    const std::string& getAdminLevel() const { return adminLevel; }

    void setDepartment(const std::string& dept) { department = dept; }
    void setAdminLevel(const std::string& level) { adminLevel = level; }
};

} // namespace velorent
