#pragma once
#include "httplib.h"
#include "DatabaseManager.h"
#include "AuthController.h"
#include "VehicleController.h"
#include "CustomerController.h"
#include "BookingController.h"
#include "RentalController.h"
#include "PaymentController.h"
#include "ReviewController.h"
#include "MaintenanceController.h"
#include "LoyaltyController.h"
#include "NotificationController.h"
#include "IntelligenceController.h"
#include "FleetController.h"
#include <string>
#include <vector>

namespace velorent {

class HttpServer {
private:
    httplib::Server svr;
    std::string host;
    int port;
    std::string allowedOrigin;
    std::vector<std::string> allowedOriginsList;
    DatabaseManager& dbManager;

    AuthController& authCtrl;
    VehicleController& vehicleCtrl;
    CustomerController& customerCtrl;
    BookingController& bookingCtrl;
    RentalController& rentalCtrl;
    PaymentController& paymentCtrl;
    ReviewController& reviewCtrl;
    MaintenanceController& maintenanceCtrl;
    LoyaltyController& loyaltyCtrl;
    NotificationController& notificationCtrl;
    IntelligenceController& intelligenceCtrl;
    FleetController& fleetCtrl;

    void registerRoutes();
    void setupCors();
    void setupExceptionHandler();

public:
    HttpServer(const std::string& host,
               int port,
               const std::string& allowedOrigin,
               DatabaseManager& dbManager,
               AuthController& authCtrl,
               VehicleController& vehicleCtrl,
               CustomerController& customerCtrl,
               BookingController& bookingCtrl,
               RentalController& rentalCtrl,
               PaymentController& paymentCtrl,
               ReviewController& reviewCtrl,
               MaintenanceController& maintenanceCtrl,
               LoyaltyController& loyaltyCtrl,
               NotificationController& notificationCtrl,
               IntelligenceController& intelligenceCtrl,
               FleetController& fleetCtrl);

    bool listen();
    void stop();
};

} // namespace velorent
