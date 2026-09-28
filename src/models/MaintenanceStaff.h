#pragma once
#include "User.h"

namespace velorent {

/**
 * @brief Represents a maintenance staff technician user.
 */
class MaintenanceStaff : public User {
private:
    std::string specialization;
    int tasksCompleted;

public:
    MaintenanceStaff(int id,
                     const std::string& fullName,
                     const std::string& email,
                     const std::string& passwordHash,
                     const std::string& phone,
                     const std::string& specialization = "General Mechanical & EV",
                     int tasksCompleted = 0,
                     AccountStatus status = AccountStatus::ACTIVE,
                     const std::string& createdAt = "");

    std::string displayDashboard() const override;
    std::string getRoleName() const override { return "MAINTENANCE_STAFF"; }

    const std::string& getSpecialization() const { return specialization; }
    int getTasksCompleted() const { return tasksCompleted; }

    void setSpecialization(const std::string& spec) { specialization = spec; }
    void setTasksCompleted(int count) { tasksCompleted = count; }
    void incrementTasksCompleted() { tasksCompleted++; }
};

} // namespace velorent
