#pragma once
#include "httplib.h"
#include "FleetIntelligenceEngine.h"
#include "VehicleRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "MaintenanceRepository.h"
#include "BookingRepository.h"
#include "AuthMiddleware.h"

namespace velorent {

class FleetController {
private:
    FleetIntelligenceEngine& fleetEngine;
    VehicleRepository& vehicleRepo;
    RentalRepository& rentalRepo;
    PaymentRepository& paymentRepo;
    MaintenanceRepository& maintenanceRepo;
    AuthMiddleware& authMiddleware;
    BookingRepository* bookingRepo;

public:
    FleetController(FleetIntelligenceEngine& fleetEngine,
                    VehicleRepository& vehicleRepo,
                    RentalRepository& rentalRepo,
                    PaymentRepository& paymentRepo,
                    MaintenanceRepository& maintenanceRepo,
                    AuthMiddleware& authMiddleware,
                    BookingRepository* bookingRepo = nullptr);

    void getFleetAnalytics(const httplib::Request& req, httplib::Response& res);
    void getFleetInsights(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
