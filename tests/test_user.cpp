#include "User.h"
#include "Customer.h"
#include "Admin.h"
#include "FleetManager.h"
#include "MaintenanceStaff.h"
#include "ValidationException.h"
#include <cassert>
#include <memory>
#include <iostream>

using namespace velorent;

void runUserTests() {
    // 1. Customer instantiation and getters
    Customer cust(1, "Ananya Sharma", "ananya@example.com", "hash123", "9876543210", "DL-1420110012345", "2030-05-15", 5, 12.5);
    assert(cust.getId() == 1);
    assert(cust.getFullName() == "Ananya Sharma");
    assert(cust.getEmail() == "ananya@example.com");
    assert(cust.getDrivingLicenseNumber() == "DL-1420110012345");
    assert(cust.getTotalRentals() == 5);
    assert(cust.getRiskScore() == 12.5);
    assert(cust.getRole() == UserRole::CUSTOMER);
    assert(cust.getRoleName() == "CUSTOMER");

    // 2. Polymorphic user pointer dispatch
    std::unique_ptr<User> userPtr = std::make_unique<Customer>(2, "Rahul Verma", "rahul@example.com", "hash456", "9876543211", "DL-9988776655");
    assert(userPtr->getRoleName() == "CUSTOMER");
    std::string dash = userPtr->displayDashboard();
    assert(dash.find("Rahul Verma") != std::string::npos);

    // 3. Admin user creation
    Admin admin(3, "Super Admin", "admin@velorent.com", "adminhash", "9999999999", "IT Operations", "SUPER_ADMIN");
    assert(admin.getRole() == UserRole::ADMIN);
    assert(admin.getAdminLevel() == "SUPER_ADMIN");

    // 4. FleetManager creation
    FleetManager manager(4, "Fleet Ops", "fleet@velorent.com", "fleethash", "8888888888", "South Hub", 50);
    assert(manager.getRole() == UserRole::FLEET_MANAGER);
    assert(manager.getManagedVehiclesCount() == 50);

    // 5. MaintenanceStaff creation
    MaintenanceStaff staff(5, "Tech Lead", "tech@velorent.com", "techhash", "7777777777", "EV & Powertrain", 12);
    assert(staff.getRole() == UserRole::MAINTENANCE_STAFF);
    assert(staff.getTasksCompleted() == 12);

    // 6. Encapsulation & Validation test: Invalid email should throw ValidationException
    bool exceptionThrown = false;
    try {
        Customer invalidCust(6, "Bad Email", "invalid-email-str", "pass", "9999999999", "DL-12345");
    } catch (const ValidationException&) {
        exceptionThrown = true;
    }
    assert(exceptionThrown);
}
