#include "EnumUtils.h"
#include "ValidationException.h"
#include <algorithm>
#include <cctype>

namespace velorent {

static std::string toUpper(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return std::toupper(c);
    });
    return str;
}

// UserRole
std::string EnumUtils::toString(UserRole role) {
    switch (role) {
        case UserRole::CUSTOMER:          return "CUSTOMER";
        case UserRole::ADMIN:             return "ADMIN";
        case UserRole::FLEET_MANAGER:     return "FLEET_MANAGER";
        case UserRole::MAINTENANCE_STAFF: return "MAINTENANCE_STAFF";
    }
    return "UNKNOWN";
}

UserRole EnumUtils::stringToUserRole(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "CUSTOMER")          return UserRole::CUSTOMER;
    if (s == "ADMIN")             return UserRole::ADMIN;
    if (s == "FLEET_MANAGER")     return UserRole::FLEET_MANAGER;
    if (s == "MAINTENANCE_STAFF") return UserRole::MAINTENANCE_STAFF;
    throw ValidationException("Invalid UserRole string: " + str);
}

// AccountStatus
std::string EnumUtils::toString(AccountStatus status) {
    switch (status) {
        case AccountStatus::ACTIVE:    return "ACTIVE";
        case AccountStatus::SUSPENDED: return "SUSPENDED";
        case AccountStatus::INACTIVE:  return "INACTIVE";
    }
    return "UNKNOWN";
}

AccountStatus EnumUtils::stringToAccountStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "ACTIVE")    return AccountStatus::ACTIVE;
    if (s == "SUSPENDED") return AccountStatus::SUSPENDED;
    if (s == "INACTIVE")  return AccountStatus::INACTIVE;
    throw ValidationException("Invalid AccountStatus string: " + str);
}

// VehicleStatus
std::string EnumUtils::toString(VehicleStatus status) {
    switch (status) {
        case VehicleStatus::AVAILABLE:      return "AVAILABLE";
        case VehicleStatus::RENTED:         return "RENTED";
        case VehicleStatus::MAINTENANCE:    return "MAINTENANCE";
        case VehicleStatus::RESERVED:       return "RESERVED";
        case VehicleStatus::OUT_OF_SERVICE: return "OUT_OF_SERVICE";
    }
    return "UNKNOWN";
}

VehicleStatus EnumUtils::stringToVehicleStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "AVAILABLE")      return VehicleStatus::AVAILABLE;
    if (s == "RENTED")         return VehicleStatus::RENTED;
    if (s == "MAINTENANCE")    return VehicleStatus::MAINTENANCE;
    if (s == "RESERVED")       return VehicleStatus::RESERVED;
    if (s == "OUT_OF_SERVICE") return VehicleStatus::OUT_OF_SERVICE;
    throw ValidationException("Invalid VehicleStatus string: " + str);
}

// FuelType
std::string EnumUtils::toString(FuelType fuel) {
    switch (fuel) {
        case FuelType::PETROL:   return "PETROL";
        case FuelType::DIESEL:   return "DIESEL";
        case FuelType::ELECTRIC: return "ELECTRIC";
        case FuelType::HYBRID:   return "HYBRID";
        case FuelType::CNG:      return "CNG";
    }
    return "UNKNOWN";
}

FuelType EnumUtils::stringToFuelType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "PETROL")   return FuelType::PETROL;
    if (s == "DIESEL")   return FuelType::DIESEL;
    if (s == "ELECTRIC") return FuelType::ELECTRIC;
    if (s == "HYBRID")   return FuelType::HYBRID;
    if (s == "CNG")      return FuelType::CNG;
    throw ValidationException("Invalid FuelType string: " + str);
}

// TransmissionType
std::string EnumUtils::toString(TransmissionType trans) {
    switch (trans) {
        case TransmissionType::MANUAL:    return "MANUAL";
        case TransmissionType::AUTOMATIC: return "AUTOMATIC";
    }
    return "UNKNOWN";
}

TransmissionType EnumUtils::stringToTransmissionType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "MANUAL")    return TransmissionType::MANUAL;
    if (s == "AUTOMATIC") return TransmissionType::AUTOMATIC;
    throw ValidationException("Invalid TransmissionType string: " + str);
}

// BookingStatus
std::string EnumUtils::toString(BookingStatus status) {
    switch (status) {
        case BookingStatus::CONFIRMED: return "CONFIRMED";
        case BookingStatus::CANCELLED: return "CANCELLED";
        case BookingStatus::COMPLETED: return "COMPLETED";
        case BookingStatus::ACTIVE:    return "ACTIVE";
    }
    return "UNKNOWN";
}

BookingStatus EnumUtils::stringToBookingStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "CONFIRMED") return BookingStatus::CONFIRMED;
    if (s == "CANCELLED") return BookingStatus::CANCELLED;
    if (s == "COMPLETED") return BookingStatus::COMPLETED;
    if (s == "ACTIVE")    return BookingStatus::ACTIVE;
    throw ValidationException("Invalid BookingStatus string: " + str);
}

// RentalStatus
std::string EnumUtils::toString(RentalStatus status) {
    switch (status) {
        case RentalStatus::ACTIVE:    return "ACTIVE";
        case RentalStatus::COMPLETED: return "COMPLETED";
        case RentalStatus::OVERDUE:   return "OVERDUE";
        case RentalStatus::CANCELLED: return "CANCELLED";
    }
    return "UNKNOWN";
}

RentalStatus EnumUtils::stringToRentalStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "ACTIVE")    return RentalStatus::ACTIVE;
    if (s == "COMPLETED") return RentalStatus::COMPLETED;
    if (s == "OVERDUE")   return RentalStatus::OVERDUE;
    if (s == "CANCELLED") return RentalStatus::CANCELLED;
    throw ValidationException("Invalid RentalStatus string: " + str);
}

// PaymentStatus
std::string EnumUtils::toString(PaymentStatus status) {
    switch (status) {
        case PaymentStatus::PENDING:   return "PENDING";
        case PaymentStatus::COMPLETED: return "COMPLETED";
        case PaymentStatus::FAILED:    return "FAILED";
        case PaymentStatus::REFUNDED:  return "REFUNDED";
    }
    return "UNKNOWN";
}

PaymentStatus EnumUtils::stringToPaymentStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "PENDING")   return PaymentStatus::PENDING;
    if (s == "COMPLETED") return PaymentStatus::COMPLETED;
    if (s == "FAILED")    return PaymentStatus::FAILED;
    if (s == "REFUNDED")  return PaymentStatus::REFUNDED;
    throw ValidationException("Invalid PaymentStatus string: " + str);
}

// PaymentMethod
std::string EnumUtils::toString(PaymentMethod method) {
    switch (method) {
        case PaymentMethod::CREDIT_CARD:    return "CREDIT_CARD";
        case PaymentMethod::DEBIT_CARD:     return "DEBIT_CARD";
        case PaymentMethod::CARD:           return "CARD";
        case PaymentMethod::UPI:            return "UPI";
        case PaymentMethod::NET_BANKING:    return "NET_BANKING";
        case PaymentMethod::CASH:           return "CASH";
        case PaymentMethod::WALLET:         return "WALLET";
        case PaymentMethod::LOYALTY_POINTS: return "LOYALTY_POINTS";
    }
    return "UNKNOWN";
}

PaymentMethod EnumUtils::stringToPaymentMethod(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "CREDIT_CARD")    return PaymentMethod::CREDIT_CARD;
    if (s == "DEBIT_CARD")     return PaymentMethod::DEBIT_CARD;
    if (s == "CARD")           return PaymentMethod::CARD;
    if (s == "UPI")            return PaymentMethod::UPI;
    if (s == "NET_BANKING")    return PaymentMethod::NET_BANKING;
    if (s == "CASH")           return PaymentMethod::CASH;
    if (s == "WALLET")         return PaymentMethod::WALLET;
    if (s == "LOYALTY_POINTS") return PaymentMethod::LOYALTY_POINTS;
    throw ValidationException("Invalid PaymentMethod string: " + str);
}

// PaymentType
std::string EnumUtils::toString(PaymentType type) {
    switch (type) {
        case PaymentType::RENTAL_FEE:    return "RENTAL_FEE";
        case PaymentType::BASE_RENT:     return "BASE_RENT";
        case PaymentType::DAMAGE_CHARGE: return "DAMAGE_CHARGE";
        case PaymentType::LATE_FEE:      return "LATE_FEE";
        case PaymentType::DEPOSIT:       return "DEPOSIT";
        case PaymentType::REFUND:        return "REFUND";
        case PaymentType::ADJUSTMENT:    return "ADJUSTMENT";
    }
    return "UNKNOWN";
}

PaymentType EnumUtils::stringToPaymentType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "RENTAL_FEE" || s == "BASE_RENT") return PaymentType::BASE_RENT;
    if (s == "DAMAGE_CHARGE" || s == "DAMAGE_FEE") return PaymentType::DAMAGE_CHARGE;
    if (s == "LATE_FEE")      return PaymentType::LATE_FEE;
    if (s == "DEPOSIT" || s == "SECURITY_DEPOSIT") return PaymentType::DEPOSIT;
    if (s == "REFUND")        return PaymentType::REFUND;
    if (s == "ADJUSTMENT")    return PaymentType::ADJUSTMENT;
    throw ValidationException("Invalid PaymentType string: " + str);
}

// MaintenanceStatus
std::string EnumUtils::toString(MaintenanceStatus status) {
    switch (status) {
        case MaintenanceStatus::OPEN:        return "OPEN";
        case MaintenanceStatus::IN_PROGRESS: return "IN_PROGRESS";
        case MaintenanceStatus::COMPLETED:   return "COMPLETED";
        case MaintenanceStatus::CANCELLED:   return "CANCELLED";
    }
    return "UNKNOWN";
}

MaintenanceStatus EnumUtils::stringToMaintenanceStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "OPEN")        return MaintenanceStatus::OPEN;
    if (s == "IN_PROGRESS") return MaintenanceStatus::IN_PROGRESS;
    if (s == "COMPLETED")   return MaintenanceStatus::COMPLETED;
    if (s == "CANCELLED")   return MaintenanceStatus::CANCELLED;
    throw ValidationException("Invalid MaintenanceStatus string: " + str);
}

// MaintenanceType
std::string EnumUtils::toString(MaintenanceType type) {
    switch (type) {
        case MaintenanceType::ROUTINE:    return "ROUTINE";
        case MaintenanceType::REPAIR:     return "REPAIR";
        case MaintenanceType::INSPECTION: return "INSPECTION";
        case MaintenanceType::EMERGENCY:  return "EMERGENCY";
    }
    return "UNKNOWN";
}

MaintenanceType EnumUtils::stringToMaintenanceType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "ROUTINE")    return MaintenanceType::ROUTINE;
    if (s == "REPAIR")     return MaintenanceType::REPAIR;
    if (s == "INSPECTION") return MaintenanceType::INSPECTION;
    if (s == "EMERGENCY")  return MaintenanceType::EMERGENCY;
    throw ValidationException("Invalid MaintenanceType string: " + str);
}

// MaintenancePriority
std::string EnumUtils::toString(MaintenancePriority priority) {
    switch (priority) {
        case MaintenancePriority::LOW:      return "LOW";
        case MaintenancePriority::MEDIUM:   return "MEDIUM";
        case MaintenancePriority::HIGH:     return "HIGH";
        case MaintenancePriority::CRITICAL: return "CRITICAL";
        case MaintenancePriority::URGENT:   return "URGENT";
    }
    return "UNKNOWN";
}

MaintenancePriority EnumUtils::stringToMaintenancePriority(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "LOW")      return MaintenancePriority::LOW;
    if (s == "MEDIUM")   return MaintenancePriority::MEDIUM;
    if (s == "HIGH")     return MaintenancePriority::HIGH;
    if (s == "CRITICAL") return MaintenancePriority::CRITICAL;
    if (s == "URGENT")   return MaintenancePriority::URGENT;
    throw ValidationException("Invalid MaintenancePriority string: " + str);
}

// DamageSeverity
std::string EnumUtils::toString(DamageSeverity severity) {
    switch (severity) {
        case DamageSeverity::MINOR:    return "MINOR";
        case DamageSeverity::MODERATE: return "MODERATE";
        case DamageSeverity::SEVERE:   return "SEVERE";
    }
    return "UNKNOWN";
}

DamageSeverity EnumUtils::stringToDamageSeverity(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "MINOR")    return DamageSeverity::MINOR;
    if (s == "MODERATE") return DamageSeverity::MODERATE;
    if (s == "SEVERE")   return DamageSeverity::SEVERE;
    throw ValidationException("Invalid DamageSeverity string: " + str);
}

// DamageResolutionStatus
std::string EnumUtils::toString(DamageResolutionStatus status) {
    switch (status) {
        case DamageResolutionStatus::PENDING:   return "PENDING";
        case DamageResolutionStatus::IN_REPAIR: return "IN_REPAIR";
        case DamageResolutionStatus::RESOLVED:  return "RESOLVED";
        case DamageResolutionStatus::DISPUTED:  return "DISPUTED";
    }
    return "UNKNOWN";
}

DamageResolutionStatus EnumUtils::stringToDamageResolutionStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "PENDING")   return DamageResolutionStatus::PENDING;
    if (s == "IN_REPAIR") return DamageResolutionStatus::IN_REPAIR;
    if (s == "RESOLVED")  return DamageResolutionStatus::RESOLVED;
    if (s == "DISPUTED")  return DamageResolutionStatus::DISPUTED;
    throw ValidationException("Invalid DamageResolutionStatus string: " + str);
}

// LoyaltyTier
std::string EnumUtils::toString(LoyaltyTier tier) {
    switch (tier) {
        case LoyaltyTier::BRONZE:   return "BRONZE";
        case LoyaltyTier::SILVER:   return "SILVER";
        case LoyaltyTier::GOLD:     return "GOLD";
        case LoyaltyTier::PLATINUM: return "PLATINUM";
    }
    return "UNKNOWN";
}

LoyaltyTier EnumUtils::stringToLoyaltyTier(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "BRONZE")   return LoyaltyTier::BRONZE;
    if (s == "SILVER")   return LoyaltyTier::SILVER;
    if (s == "GOLD")     return LoyaltyTier::GOLD;
    if (s == "PLATINUM") return LoyaltyTier::PLATINUM;
    throw ValidationException("Invalid LoyaltyTier string: " + str);
}

// LoyaltyTransactionType
std::string EnumUtils::toString(LoyaltyTransactionType type) {
    switch (type) {
        case LoyaltyTransactionType::EARN:   return "EARN";
        case LoyaltyTransactionType::REDEEM: return "REDEEM";
        case LoyaltyTransactionType::EXPIRE: return "EXPIRE";
        case LoyaltyTransactionType::BONUS:  return "BONUS";
    }
    return "UNKNOWN";
}

LoyaltyTransactionType EnumUtils::stringToLoyaltyTransactionType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "EARN")   return LoyaltyTransactionType::EARN;
    if (s == "REDEEM") return LoyaltyTransactionType::REDEEM;
    if (s == "EXPIRE") return LoyaltyTransactionType::EXPIRE;
    if (s == "BONUS")  return LoyaltyTransactionType::BONUS;
    throw ValidationException("Invalid LoyaltyTransactionType string: " + str);
}

// WaitlistStatus
std::string EnumUtils::toString(WaitlistStatus status) {
    switch (status) {
        case WaitlistStatus::WAITING:   return "WAITING";
        case WaitlistStatus::NOTIFIED:  return "NOTIFIED";
        case WaitlistStatus::FULFILLED: return "FULFILLED";
        case WaitlistStatus::CANCELLED: return "CANCELLED";
        case WaitlistStatus::EXPIRED:   return "EXPIRED";
    }
    return "UNKNOWN";
}

WaitlistStatus EnumUtils::stringToWaitlistStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "WAITING")   return WaitlistStatus::WAITING;
    if (s == "NOTIFIED")  return WaitlistStatus::NOTIFIED;
    if (s == "FULFILLED") return WaitlistStatus::FULFILLED;
    if (s == "CANCELLED") return WaitlistStatus::CANCELLED;
    if (s == "EXPIRED")   return WaitlistStatus::EXPIRED;
    throw ValidationException("Invalid WaitlistStatus string: " + str);
}

// NotificationType
std::string EnumUtils::toString(NotificationType type) {
    switch (type) {
        case NotificationType::BOOKING_CONFIRMED:    return "BOOKING_CONFIRMED";
        case NotificationType::BOOKING_CANCELLED:    return "BOOKING_CANCELLED";
        case NotificationType::RENTAL_STARTED:       return "RENTAL_STARTED";
        case NotificationType::RENTAL_COMPLETED:     return "RENTAL_COMPLETED";
        case NotificationType::PAYMENT_RECEIVED:     return "PAYMENT_RECEIVED";
        case NotificationType::DAMAGE_REPORTED:      return "DAMAGE_REPORTED";
        case NotificationType::MAINTENANCE_ALERT:    return "MAINTENANCE_ALERT";
        case NotificationType::WAITLIST_NOTIFIED:    return "WAITLIST_NOTIFIED";
        case NotificationType::LOYALTY_TIER_UPGRADE: return "LOYALTY_TIER_UPGRADE";
        case NotificationType::SYSTEM:               return "SYSTEM";
    }
    return "UNKNOWN";
}

NotificationType EnumUtils::stringToNotificationType(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "BOOKING_CONFIRMED")    return NotificationType::BOOKING_CONFIRMED;
    if (s == "BOOKING_CANCELLED")    return NotificationType::BOOKING_CANCELLED;
    if (s == "RENTAL_STARTED")       return NotificationType::RENTAL_STARTED;
    if (s == "RENTAL_COMPLETED")     return NotificationType::RENTAL_COMPLETED;
    if (s == "PAYMENT_RECEIVED")     return NotificationType::PAYMENT_RECEIVED;
    if (s == "DAMAGE_REPORTED")      return NotificationType::DAMAGE_REPORTED;
    if (s == "MAINTENANCE_ALERT")    return NotificationType::MAINTENANCE_ALERT;
    if (s == "WAITLIST_NOTIFIED")    return NotificationType::WAITLIST_NOTIFIED;
    if (s == "LOYALTY_TIER_UPGRADE") return NotificationType::LOYALTY_TIER_UPGRADE;
    if (s == "SYSTEM")               return NotificationType::SYSTEM;
    throw ValidationException("Invalid NotificationType string: " + str);
}

// RefundStatus
std::string EnumUtils::toString(RefundStatus status) {
    switch (status) {
        case RefundStatus::PENDING:        return "PENDING";
        case RefundStatus::PROCESSED:      return "PROCESSED";
        case RefundStatus::FAILED:         return "FAILED";
        case RefundStatus::NOT_APPLICABLE: return "NOT_APPLICABLE";
    }
    return "UNKNOWN";
}

RefundStatus EnumUtils::stringToRefundStatus(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "PENDING")        return RefundStatus::PENDING;
    if (s == "PROCESSED")      return RefundStatus::PROCESSED;
    if (s == "FAILED")         return RefundStatus::FAILED;
    if (s == "NOT_APPLICABLE") return RefundStatus::NOT_APPLICABLE;
    throw ValidationException("Invalid RefundStatus string: " + str);
}

// HealthComputedBy
std::string EnumUtils::toString(HealthComputedBy computedBy) {
    switch (computedBy) {
        case HealthComputedBy::INSPECTION: return "INSPECTION";
        case HealthComputedBy::ENGINE:     return "ENGINE";
        case HealthComputedBy::SERVICE:    return "SERVICE";
        case HealthComputedBy::SYSTEM:     return "SYSTEM";
    }
    return "UNKNOWN";
}

HealthComputedBy EnumUtils::stringToHealthComputedBy(const std::string& str) {
    std::string s = toUpper(str);
    if (s == "INSPECTION") return HealthComputedBy::INSPECTION;
    if (s == "ENGINE")     return HealthComputedBy::ENGINE;
    if (s == "SERVICE")    return HealthComputedBy::SERVICE;
    if (s == "SYSTEM")     return HealthComputedBy::SYSTEM;
    throw ValidationException("Invalid HealthComputedBy string: " + str);
}

} // namespace velorent
