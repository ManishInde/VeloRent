#pragma once
#include "DatabaseManager.h"
#include "User.h"
#include "Customer.h"
#include "Admin.h"
#include "FleetManager.h"
#include "MaintenanceStaff.h"
#include "Vehicle.h"
#include "Car.h"
#include "Bike.h"
#include "SUV.h"
#include "LuxuryVehicle.h"
#include "ElectricVehicle.h"
#include "Booking.h"
#include "Rental.h"
#include "Payment.h"
#include "Maintenance.h"
#include "MaintenanceLog.h"
#include "VehicleInspection.h"
#include "DamageReport.h"
#include "LoyaltyAccount.h"
#include "LoyaltyTransaction.h"
#include "Review.h"
#include "WaitlistEntry.h"
#include "Notification.h"
#include "CancellationRecord.h"
#include <memory>

namespace velorent {

class RowMappers {
public:
    static std::shared_ptr<User> mapUser(const ResultSetRow& row);
    static std::shared_ptr<Customer> mapCustomer(const ResultSetRow& row);
    static std::shared_ptr<Vehicle> mapVehicle(const ResultSetRow& row);
    static Booking mapBooking(const ResultSetRow& row);
    static Rental mapRental(const ResultSetRow& row);
    static Payment mapPayment(const ResultSetRow& row);
    static Maintenance mapMaintenance(const ResultSetRow& row);
    static MaintenanceLog mapMaintenanceLog(const ResultSetRow& row);
    static VehicleInspection mapVehicleInspection(const ResultSetRow& row);
    static DamageReport mapDamageReport(const ResultSetRow& row);
    static LoyaltyAccount mapLoyaltyAccount(const ResultSetRow& row);
    static LoyaltyTransaction mapLoyaltyTransaction(const ResultSetRow& row);
    static Review mapReview(const ResultSetRow& row);
    static WaitlistEntry mapWaitlistEntry(const ResultSetRow& row);
    static Notification mapNotification(const ResultSetRow& row);
    static CancellationRecord mapCancellationRecord(const ResultSetRow& row);
};

} // namespace velorent
