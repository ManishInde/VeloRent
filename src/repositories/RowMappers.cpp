#include "RowMappers.h"
#include "EnumUtils.h"

namespace velorent {

std::shared_ptr<User> RowMappers::mapUser(const ResultSetRow& row) {
    int id = row.getInt("user_id");
    std::string name = row.getString("full_name");
    std::string email = row.getString("email");
    std::string pass = row.getString("password_hash");
    std::string phone = row.getString("phone");
    UserRole role = EnumUtils::stringToUserRole(row.getString("role"));
    bool active = row.getBool("is_active", true);
    AccountStatus status = active ? AccountStatus::ACTIVE : AccountStatus::SUSPENDED;
    std::string createdAt = row.getString("created_at");

    switch (role) {
        case UserRole::CUSTOMER: {
            std::string license = row.getString("driving_licence_no", row.getString("driving_license_number", "DL-UNSPECIFIED"));
            std::string expiry = row.getString("licence_expiry", row.getString("license_expiry", ""));
            int totalRentals = row.getInt("total_rentals", 0);
            double riskScore = row.getDouble("risk_score", 0.0);
            return std::make_shared<Customer>(id, name, email, pass, phone, license, expiry, totalRentals, riskScore, status, createdAt);
        }
        case UserRole::ADMIN: {
            std::string dept = row.getString("department", "IT Operations");
            std::string level = row.getString("employee_code", "SUPER_ADMIN");
            return std::make_shared<Admin>(id, name, email, pass, phone, dept, level, status, createdAt);
        }
        case UserRole::FLEET_MANAGER: {
            std::string hub = row.getString("depot_location", row.getString("assigned_hub", "Central Hub"));
            int count = row.getInt("managed_vehicles_count", 0);
            return std::make_shared<FleetManager>(id, name, email, pass, phone, hub, count, status, createdAt);
        }
        case UserRole::MAINTENANCE_STAFF: {
            std::string spec = row.getString("specialisation", row.getString("specialization", "General Tech"));
            int tasks = row.getInt("tasks_completed", 0);
            return std::make_shared<MaintenanceStaff>(id, name, email, pass, phone, spec, tasks, status, createdAt);
        }
    }
    return nullptr;
}

std::shared_ptr<Customer> RowMappers::mapCustomer(const ResultSetRow& row) {
    auto u = mapUser(row);
    return std::dynamic_pointer_cast<Customer>(u);
}

std::shared_ptr<Vehicle> RowMappers::mapVehicle(const ResultSetRow& row) {
    int id = row.getInt("vehicle_id");
    std::string reg = row.getString("registration_no", row.getString("registration_number", ""));
    std::string brand = row.getString("brand");
    std::string model = row.getString("model");
    int catId = row.getInt("category_id");
    FuelType fuel = EnumUtils::stringToFuelType(row.getString("fuel_type"));
    TransmissionType trans = EnumUtils::stringToTransmissionType(row.getString("transmission"));
    int seats = row.getInt("seats", 5);
    double rate = row.getDouble("base_rate_per_day", row.getDouble("base_rental_rate", 0.0));
    int odo = row.getInt("odometer_km");
    double health = row.getDouble("health_score", 100.0);
    VehicleStatus status = EnumUtils::stringToVehicleStatus(row.getString("status"));
    int year = row.getInt("purchase_year", 2024);

    if (catId == 5 || fuel == FuelType::ELECTRIC) {
        return std::make_shared<ElectricVehicle>(id, reg, brand, model, catId, trans, seats, rate, 60.0, 100.0, 350, odo, health, status, year);
    } else if (catId == 4) {
        return std::make_shared<LuxuryVehicle>(id, reg, brand, model, catId, fuel, trans, seats, rate, 25000.0, 1.25, odo, health, status, year);
    } else if (catId == 3) {
        return std::make_shared<SUV>(id, reg, brand, model, catId, fuel, trans, seats, rate, true, odo, health, status, year);
    } else if (catId == 6 || catId == 7) {
        return std::make_shared<Bike>(id, reg, brand, model, catId, fuel, trans, seats, rate, 150, odo, health, status, year);
    } else {
        return std::make_shared<Car>(id, reg, brand, model, catId, fuel, trans, seats, rate, odo, health, status, year);
    }
}

Booking RowMappers::mapBooking(const ResultSetRow& row) {
    return Booking(
        row.getInt("booking_id"),
        row.getInt("customer_id"),
        row.getInt("vehicle_id"),
        row.getString("start_date"),
        row.getString("end_date"),
        row.getDouble("quoted_price"),
        EnumUtils::stringToBookingStatus(row.getString("status")),
        row.getString("created_at")
    );
}

Rental RowMappers::mapRental(const ResultSetRow& row) {
    return Rental(
        row.getInt("rental_id"),
        row.getInt("booking_id"),
        row.getString("actual_start"),
        row.getInt("start_odometer", row.getInt("starting_odometer", 0)),
        row.getString("actual_end", row.getString("actual_return", "")),
        row.getInt("end_odometer", row.getInt("ending_odometer", 0)),
        EnumUtils::stringToRentalStatus(row.getString("status")),
        row.getString("created_at")
    );
}

Payment RowMappers::mapPayment(const ResultSetRow& row) {
    return Payment(
        row.getInt("payment_id"),
        row.getInt("rental_id"),
        row.getDouble("amount"),
        EnumUtils::stringToPaymentMethod(row.getString("payment_method")),
        EnumUtils::stringToPaymentType(row.getString("payment_type", "BASE_RENT")),
        EnumUtils::stringToPaymentStatus(row.getString("status", row.getString("payment_status", "COMPLETED"))),
        row.getString("transaction_ref", row.getString("transaction_id", "")),
        row.getString("paid_at", row.getString("created_at", row.getString("payment_timestamp", "")))
    );
}

Maintenance RowMappers::mapMaintenance(const ResultSetRow& row) {
    return Maintenance(
        row.getInt("maintenance_id"),
        row.getInt("vehicle_id"),
        EnumUtils::stringToMaintenanceType(row.getString("maintenance_type")),
        EnumUtils::stringToMaintenancePriority(row.getString("priority")),
        EnumUtils::stringToMaintenanceStatus(row.getString("status")),
        row.getString("description"),
        row.getInt("damage_report_id", 0),
        row.getString("scheduled_date"),
        row.getString("completed_at", row.getString("completion_date", "")),
        row.getDouble("total_cost", 0.0),
        row.getInt("assigned_to", 0)
    );
}

MaintenanceLog RowMappers::mapMaintenanceLog(const ResultSetRow& row) {
    return MaintenanceLog(
        row.getInt("log_id"),
        row.getInt("maintenance_id"),
        row.getInt("staff_id"),
        row.getString("notes", row.getString("action_taken", "")),
        row.getDouble("cost_logged", row.getDouble("log_cost", 0.0)),
        row.getString("logged_at")
    );
}

VehicleInspection RowMappers::mapVehicleInspection(const ResultSetRow& row) {
    return VehicleInspection(
        row.getInt("inspection_id"),
        row.getInt("vehicle_id"),
        row.getInt("inspector_id"),
        row.getString("inspected_at", row.getString("inspection_date", "")),
        row.getDouble("health_score_given", row.getDouble("score", 100.0)),
        row.getString("notes"),
        row.getBool("passed", true)
    );
}

DamageReport RowMappers::mapDamageReport(const ResultSetRow& row) {
    bool resolved = row.getBool("is_resolved", false);
    DamageResolutionStatus status = resolved ? DamageResolutionStatus::RESOLVED : DamageResolutionStatus::PENDING;
    return DamageReport(
        row.getInt("report_id"),
        row.getInt("rental_id"),
        row.getInt("vehicle_id"),
        row.getInt("reported_by"),
        EnumUtils::stringToDamageSeverity(row.getString("severity")),
        row.getString("description"),
        row.getDouble("estimated_cost", 0.0),
        status,
        row.getString("reported_at", row.getString("created_at", ""))
    );
}

LoyaltyAccount RowMappers::mapLoyaltyAccount(const ResultSetRow& row) {
    return LoyaltyAccount(
        row.getInt("loyalty_id", row.getInt("account_id", 0)),
        row.getInt("customer_id"),
        row.getInt("points_balance", row.getInt("current_points", 0)),
        row.getInt("total_points_earned", 0),
        EnumUtils::stringToLoyaltyTier(row.getString("tier", "BRONZE")),
        row.getString("updated_at", row.getString("created_at", row.getString("last_updated", "")))
    );
}

LoyaltyTransaction RowMappers::mapLoyaltyTransaction(const ResultSetRow& row) {
    return LoyaltyTransaction(
        row.getInt("txn_id", row.getInt("transaction_id", 0)),
        row.getInt("loyalty_id", row.getInt("account_id", 0)),
        EnumUtils::stringToLoyaltyTransactionType(row.getString("txn_type", row.getString("transaction_type", "EARN"))),
        row.getInt("points"),
        row.getString("source", row.getString("reason", "")),
        row.getInt("reference_id", 0),
        row.getString("created_at")
    );
}

Review RowMappers::mapReview(const ResultSetRow& row) {
    return Review(
        row.getInt("review_id"),
        row.getInt("rental_id"),
        row.getInt("customer_id"),
        row.getInt("vehicle_id"),
        row.getInt("rating"),
        row.getString("comment"),
        row.getString("created_at")
    );
}

WaitlistEntry RowMappers::mapWaitlistEntry(const ResultSetRow& row) {
    return WaitlistEntry(
        row.getInt("waitlist_id"),
        row.getInt("customer_id"),
        row.getInt("vehicle_id"),
        row.getString("requested_start"),
        row.getString("requested_end"),
        EnumUtils::stringToWaitlistStatus(row.getString("status")),
        row.getString("notified_at"),
        row.getString("queued_at")
    );
}

Notification RowMappers::mapNotification(const ResultSetRow& row) {
    return Notification(
        row.getInt("notification_id"),
        row.getInt("user_id"),
        EnumUtils::stringToNotificationType(row.getString("notification_type")),
        row.getString("title"),
        row.getString("message"),
        row.getInt("reference_id", 0),
        row.getBool("is_read", false),
        row.getString("created_at")
    );
}

CancellationRecord RowMappers::mapCancellationRecord(const ResultSetRow& row) {
    return CancellationRecord(
        row.getInt("cancellation_id"),
        row.getInt("booking_id"),
        row.getInt("cancelled_by"),
        row.getString("reason"),
        row.getDouble("refund_amount", 0.0),
        EnumUtils::stringToRefundStatus(row.getString("refund_status", "NOT_APPLICABLE")),
        row.getString("cancelled_at")
    );
}

} // namespace velorent
