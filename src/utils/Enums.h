#pragma once
#include <string>

namespace velorent {

/**
 * @brief User role types in VeloRent.
 */
enum class UserRole {
    CUSTOMER,
    ADMIN,
    FLEET_MANAGER,
    MAINTENANCE_STAFF
};

/**
 * @brief Account status of a user.
 */
enum class AccountStatus {
    ACTIVE,
    SUSPENDED,
    INACTIVE
};

/**
 * @brief Current operational status of a vehicle.
 */
enum class VehicleStatus {
    AVAILABLE,
    RENTED,
    MAINTENANCE,
    RESERVED,
    OUT_OF_SERVICE
};

/**
 * @brief Vehicle fuel/power types.
 */
enum class FuelType {
    PETROL,
    DIESEL,
    ELECTRIC,
    HYBRID,
    CNG
};

/**
 * @brief Vehicle transmission types.
 */
enum class TransmissionType {
    MANUAL,
    AUTOMATIC
};

/**
 * @brief Booking reservation statuses.
 */
enum class BookingStatus {
    CONFIRMED,
    CANCELLED,
    COMPLETED,
    ACTIVE
};

/**
 * @brief Physical rental event statuses.
 */
enum class RentalStatus {
    ACTIVE,
    COMPLETED,
    OVERDUE,
    CANCELLED
};

/**
 * @brief Payment lifecycle statuses.
 */
enum class PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED
};

/**
 * @brief Supported payment methods.
 */
enum class PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    UPI,
    NET_BANKING,
    CASH,
    WALLET,
    LOYALTY_POINTS,
    CARD
};

/**
 * @brief Payment purpose classification.
 */
enum class PaymentType {
    RENTAL_FEE,
    BASE_RENT,
    DAMAGE_CHARGE,
    LATE_FEE,
    DEPOSIT,
    REFUND,
    ADJUSTMENT
};

/**
 * @brief Maintenance task lifecycle statuses.
 */
enum class MaintenanceStatus {
    OPEN,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
};

/**
 * @brief Maintenance task classification.
 */
enum class MaintenanceType {
    ROUTINE,
    REPAIR,
    INSPECTION,
    EMERGENCY
};

/**
 * @brief Priority levels for maintenance tasks.
 */
enum class MaintenancePriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL,
    URGENT
};

/**
 * @brief Vehicle damage severity classification.
 */
enum class DamageSeverity {
    MINOR,
    MODERATE,
    SEVERE
};

/**
 * @brief Damage report resolution status.
 */
enum class DamageResolutionStatus {
    PENDING,
    IN_REPAIR,
    RESOLVED,
    DISPUTED
};

/**
 * @brief Customer loyalty reward tiers.
 */
enum class LoyaltyTier {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM
};

/**
 * @brief Loyalty point transaction types.
 */
enum class LoyaltyTransactionType {
    EARN,
    REDEEM,
    EXPIRE,
    BONUS
};

/**
 * @brief Waitlist queue request status.
 */
enum class WaitlistStatus {
    WAITING,
    NOTIFIED,
    FULFILLED,
    CANCELLED,
    EXPIRED
};

/**
 * @brief Notification classifications.
 */
enum class NotificationType {
    BOOKING_CONFIRMED,
    BOOKING_CANCELLED,
    RENTAL_STARTED,
    RENTAL_COMPLETED,
    PAYMENT_RECEIVED,
    DAMAGE_REPORTED,
    MAINTENANCE_ALERT,
    WAITLIST_NOTIFIED,
    LOYALTY_TIER_UPGRADE,
    SYSTEM
};

/**
 * @brief Refund processing statuses.
 */
enum class RefundStatus {
    PENDING,
    PROCESSED,
    FAILED,
    NOT_APPLICABLE
};

/**
 * @brief System component or trigger that recorded a health score snapshot.
 */
enum class HealthComputedBy {
    INSPECTION,
    ENGINE,
    SERVICE,
    SYSTEM
};

} // namespace velorent
