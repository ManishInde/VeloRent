#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Abstract Base class for all user types in VeloRent.
 * OOP Concepts Demonstrated:
 * - Abstraction: Abstract class with pure virtual functions.
 * - Encapsulation: Protected fields with public getters/setters and domain validations.
 * - Inheritance Base: Base class for Customer, Admin, FleetManager, MaintenanceStaff.
 */
class User : public IEntity {
protected:
    int id;
    std::string fullName;
    std::string email;
    std::string passwordHash;
    std::string phone;
    UserRole role;
    AccountStatus status;
    std::string createdAt;

public:
    User(int id,
         const std::string& fullName,
         const std::string& email,
         const std::string& passwordHash,
         const std::string& phone,
         UserRole role,
         AccountStatus status = AccountStatus::ACTIVE,
         const std::string& createdAt = "");

    virtual ~User() = default;

    // Interface implementation
    int getId() const override { return id; }
    std::string toString() const override;

    // Pure virtual functions (Abstraction & Polymorphism)
    virtual std::string displayDashboard() const = 0;
    virtual std::string getRoleName() const = 0;

    // Getters
    const std::string& getFullName() const { return fullName; }
    const std::string& getEmail() const { return email; }
    const std::string& getPasswordHash() const { return passwordHash; }
    const std::string& getPhone() const { return phone; }
    UserRole getRole() const { return role; }
    AccountStatus getStatus() const { return status; }
    const std::string& getCreatedAt() const { return createdAt; }

    // Mutators with encapsulation & domain validation
    void setFullName(const std::string& name);
    void setEmail(const std::string& emailStr);
    void setPasswordHash(const std::string& hash);
    void setPhone(const std::string& phoneStr);
    void setStatus(AccountStatus newStatus) { status = newStatus; }

    /**
     * @brief Checks if account is currently active.
     */
    bool isActive() const { return status == AccountStatus::ACTIVE; }
};

} // namespace velorent
