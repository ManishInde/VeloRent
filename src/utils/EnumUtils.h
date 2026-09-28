#pragma once
#include "Enums.h"
#include <string>

namespace velorent {

class EnumUtils {
public:
    // UserRole
    static std::string toString(UserRole role);
    static UserRole stringToUserRole(const std::string& str);

    // AccountStatus
    static std::string toString(AccountStatus status);
    static AccountStatus stringToAccountStatus(const std::string& str);

    // VehicleStatus
    static std::string toString(VehicleStatus status);
    static VehicleStatus stringToVehicleStatus(const std::string& str);

    // FuelType
    static std::string toString(FuelType fuel);
    static FuelType stringToFuelType(const std::string& str);

    // TransmissionType
    static std::string toString(TransmissionType trans);
    static TransmissionType stringToTransmissionType(const std::string& str);

    // BookingStatus
    static std::string toString(BookingStatus status);
    static BookingStatus stringToBookingStatus(const std::string& str);

    // RentalStatus
    static std::string toString(RentalStatus status);
    static RentalStatus stringToRentalStatus(const std::string& str);

    // PaymentStatus
    static std::string toString(PaymentStatus status);
    static PaymentStatus stringToPaymentStatus(const std::string& str);

    // PaymentMethod
    static std::string toString(PaymentMethod method);
    static PaymentMethod stringToPaymentMethod(const std::string& str);

    // PaymentType
    static std::string toString(PaymentType type);
    static PaymentType stringToPaymentType(const std::string& str);

    // MaintenanceStatus
    static std::string toString(MaintenanceStatus status);
    static MaintenanceStatus stringToMaintenanceStatus(const std::string& str);

    // MaintenanceType
    static std::string toString(MaintenanceType type);
    static MaintenanceType stringToMaintenanceType(const std::string& str);

    // MaintenancePriority
    static std::string toString(MaintenancePriority priority);
    static MaintenancePriority stringToMaintenancePriority(const std::string& str);

    // DamageSeverity
    static std::string toString(DamageSeverity severity);
    static DamageSeverity stringToDamageSeverity(const std::string& str);

    // DamageResolutionStatus
    static std::string toString(DamageResolutionStatus status);
    static DamageResolutionStatus stringToDamageResolutionStatus(const std::string& str);

    // LoyaltyTier
    static std::string toString(LoyaltyTier tier);
    static LoyaltyTier stringToLoyaltyTier(const std::string& str);

    // LoyaltyTransactionType
    static std::string toString(LoyaltyTransactionType type);
    static LoyaltyTransactionType stringToLoyaltyTransactionType(const std::string& str);

    // WaitlistStatus
    static std::string toString(WaitlistStatus status);
    static WaitlistStatus stringToWaitlistStatus(const std::string& str);

    // NotificationType
    static std::string toString(NotificationType type);
    static NotificationType stringToNotificationType(const std::string& str);

    // RefundStatus
    static std::string toString(RefundStatus status);
    static RefundStatus stringToRefundStatus(const std::string& str);

    // HealthComputedBy
    static std::string toString(HealthComputedBy computedBy);
    static HealthComputedBy stringToHealthComputedBy(const std::string& str);
};

} // namespace velorent
