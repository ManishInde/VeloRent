#include "FleetController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"

namespace velorent {

FleetController::FleetController(FleetIntelligenceEngine& fleetEngine,
                                 VehicleRepository& vehicleRepo,
                                 RentalRepository& rentalRepo,
                                 PaymentRepository& paymentRepo,
                                 MaintenanceRepository& maintenanceRepo,
                                 AuthMiddleware& authMiddleware,
                                 BookingRepository* bookingRepo)
    : fleetEngine(fleetEngine), vehicleRepo(vehicleRepo),
      rentalRepo(rentalRepo), paymentRepo(paymentRepo),
      maintenanceRepo(maintenanceRepo), authMiddleware(authMiddleware),
      bookingRepo(bookingRepo) {}

void FleetController::getFleetAnalytics(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        auto fleet = vehicleRepo.findAll();
        auto rentals = rentalRepo.findActiveRentals();
        auto payments = paymentRepo.findAll();
        auto maints = maintenanceRepo.findAll();

        auto report = fleetEngine.generateReport(fleet, rentals, payments, maints);
        if (bookingRepo) {
            auto activeBookings = bookingRepo->findActiveBookings();
            report.activeBookings = static_cast<int>(activeBookings.size());
        }
        HttpResponse::success(res, JsonUtils::toJson(report));
    } catch (...) {
        throw;
    }
}

void FleetController::getFleetInsights(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAnyRole(auth, {UserRole::ADMIN, UserRole::FLEET_MANAGER});

        auto fleet = vehicleRepo.findAll();
        auto rentals = rentalRepo.findActiveRentals();
        auto payments = paymentRepo.findAll();
        auto maints = maintenanceRepo.findAll();

        auto report = fleetEngine.generateReport(fleet, rentals, payments, maints);
        if (bookingRepo) {
            auto activeBookings = bookingRepo->findActiveBookings();
            report.activeBookings = static_cast<int>(activeBookings.size());
        }

        nlohmann::json insightsArr = nlohmann::json::array();
        for (const auto& ins : report.insights) {
            nlohmann::json ij;
            ij["metricName"] = ins.metricName;
            ij["metricValue"] = ins.metricValue;
            ij["severity"] = FleetIntelligenceEngine::severityToString(ins.severity);
            ij["explanation"] = ins.explanation;
            ij["suggestedAction"] = ins.suggestedAction;
            insightsArr.push_back(ij);
        }

        HttpResponse::collection(res, insightsArr);
    } catch (...) {
        throw;
    }
}

} // namespace velorent
