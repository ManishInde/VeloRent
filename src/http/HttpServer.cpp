#include "HttpServer.h"
#include "HttpResponse.h"
#include "Logger.h"

// Exceptions
#include "VeloRentException.h"
#include "NotFoundException.h"
#include "UnauthorizedException.h"
#include "ForbiddenException.h"
#include "VehicleUnavailableException.h"
#include "InvalidBookingException.h"
#include "ValidationException.h"
#include "PaymentException.h"
#include "BusinessRuleException.h"
#include "DatabaseException.h"

namespace velorent {

HttpServer::HttpServer(const std::string& host,
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
                       FleetController& fleetCtrl)
    : host(host), port(port), allowedOrigin(allowedOrigin), dbManager(dbManager),
      authCtrl(authCtrl), vehicleCtrl(vehicleCtrl), customerCtrl(customerCtrl),
      bookingCtrl(bookingCtrl), rentalCtrl(rentalCtrl),
      paymentCtrl(paymentCtrl), reviewCtrl(reviewCtrl),
      maintenanceCtrl(maintenanceCtrl), loyaltyCtrl(loyaltyCtrl),
      notificationCtrl(notificationCtrl), intelligenceCtrl(intelligenceCtrl),
      fleetCtrl(fleetCtrl)
{
    setupCors();
    setupExceptionHandler();
    registerRoutes();
}

void HttpServer::setupCors() {
    svr.set_post_routing_handler([this](const httplib::Request& req, httplib::Response& res) {
        std::string requestOrigin = req.get_header_value("Origin");
        std::string headerOrigin = this->allowedOrigin;

        if (this->allowedOrigin == "*" || requestOrigin.empty()) {
            headerOrigin = this->allowedOrigin;
        } else if (this->allowedOrigin.find(requestOrigin) != std::string::npos) {
            headerOrigin = requestOrigin;
        }

        res.set_header("Access-Control-Allow-Origin", headerOrigin);
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set_header("X-Content-Type-Options", "nosniff");
    });

    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 204;
    });
}

void HttpServer::setupExceptionHandler() {
    svr.set_exception_handler([](const httplib::Request&, httplib::Response& res, std::exception_ptr ep) {
        try {
            if (ep) std::rethrow_exception(ep);
        } catch (const UnauthorizedException& ex) {
            HttpResponse::error(res, 401, "UNAUTHORIZED", ex.what());
        } catch (const ForbiddenException& ex) {
            HttpResponse::error(res, 403, "FORBIDDEN", ex.what());
        } catch (const NotFoundException& ex) {
            HttpResponse::notFound(res, ex.what());
        } catch (const VehicleUnavailableException& ex) {
            HttpResponse::conflict(res, ex.what());
        } catch (const InvalidBookingException& ex) {
            HttpResponse::unprocessableEntity(res, ex.what());
        } catch (const ValidationException& ex) {
            HttpResponse::badRequest(res, ex.what());
        } catch (const PaymentException& ex) {
            HttpResponse::unprocessableEntity(res, ex.what());
        } catch (const BusinessRuleException& ex) {
            HttpResponse::conflict(res, ex.what());
        } catch (const DatabaseException& ex) {
            HttpResponse::serviceUnavailable(res, std::string("Database error: ") + ex.what());
        } catch (const VeloRentException& ex) {
            HttpResponse::badRequest(res, ex.what());
        } catch (const std::exception& ex) {
            HttpResponse::internalError(res, std::string("Internal server error: ") + ex.what());
        } catch (...) {
            HttpResponse::internalError(res, "Unknown server error occurred.");
        }
    });
}

void HttpServer::registerRoutes() {
    // 0. Auth Controller Routes
    authCtrl.registerRoutes(svr);

    // 1. Root & Health Check
    svr.Get("/api", [](const httplib::Request&, httplib::Response& res) {
        HttpResponse::success(res, {
            {"name", "VeloRent REST API"},
            {"version", "1.0.0"},
            {"status", "running"}
        });
    });

    svr.Get("/api/health", [this](const httplib::Request&, httplib::Response& res) {
        bool dbOk = this->dbManager.isConnected();
        HttpResponse::success(res, {
            {"service", "VeloRent API"},
            {"status", "UP"},
            {"database", dbOk ? "UP" : "DOWN"}
        });
    });

    // 2. Vehicle Routes
    svr.Get("/api/vehicles", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.getVehicles(req, res); });
    svr.Get(R"(/api/vehicles/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.getVehicleById(req, res); });
    svr.Get(R"(/api/vehicles/(\d+)/health)", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.getVehicleHealth(req, res); });
    svr.Post("/api/vehicles", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.createVehicle(req, res); });
    svr.Put(R"(/api/vehicles/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.updateVehicle(req, res); });
    svr.Patch(R"(/api/vehicles/(\d+)/status)", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.updateVehicleStatus(req, res); });
    svr.Delete(R"(/api/vehicles/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { vehicleCtrl.deleteVehicle(req, res); });

    // 3. Customer Routes
    svr.Post("/api/customers", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.registerCustomer(req, res); });
    svr.Get(R"(/api/customers/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.getCustomerById(req, res); });
    svr.Get(R"(/api/customers/(\d+)/bookings)", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.getCustomerBookings(req, res); });
    svr.Get(R"(/api/customers/(\d+)/rentals)", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.getCustomerRentals(req, res); });
    svr.Get(R"(/api/customers/(\d+)/loyalty)", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.getCustomerLoyalty(req, res); });
    svr.Get(R"(/api/customers/(\d+)/risk)", [this](const httplib::Request& req, httplib::Response& res) { customerCtrl.getCustomerRisk(req, res); });

    // 4. Booking Routes
    svr.Post("/api/bookings", [this](const httplib::Request& req, httplib::Response& res) { bookingCtrl.createBooking(req, res); });
    svr.Get(R"(/api/bookings/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { bookingCtrl.getBookingById(req, res); });
    svr.Post(R"(/api/bookings/(\d+)/cancel)", [this](const httplib::Request& req, httplib::Response& res) { bookingCtrl.cancelBooking(req, res); });

    // 5. Rental Routes
    svr.Post(R"(/api/rentals/(\d+)/start)", [this](const httplib::Request& req, httplib::Response& res) { rentalCtrl.startRental(req, res); });
    svr.Get(R"(/api/rentals/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { rentalCtrl.getRentalById(req, res); });
    svr.Post(R"(/api/rentals/(\d+)/return)", [this](const httplib::Request& req, httplib::Response& res) { rentalCtrl.returnRental(req, res); });

    // 6. Payment Routes
    svr.Post("/api/payments", [this](const httplib::Request& req, httplib::Response& res) { paymentCtrl.processPayment(req, res); });
    svr.Get(R"(/api/rentals/(\d+)/payments)", [this](const httplib::Request& req, httplib::Response& res) { paymentCtrl.getPaymentsByRental(req, res); });
    svr.Get(R"(/api/customers/(\d+)/payments)", [this](const httplib::Request& req, httplib::Response& res) { paymentCtrl.getCustomerPayments(req, res); });

    // 7. Review Routes
    svr.Post("/api/reviews", [this](const httplib::Request& req, httplib::Response& res) { reviewCtrl.submitReview(req, res); });
    svr.Get("/api/reviews", [this](const httplib::Request& req, httplib::Response& res) { reviewCtrl.getAllReviews(req, res); });
    svr.Get(R"(/api/vehicles/(\d+)/reviews)", [this](const httplib::Request& req, httplib::Response& res) { reviewCtrl.getVehicleReviews(req, res); });
    svr.Get(R"(/api/customers/(\d+)/reviews)", [this](const httplib::Request& req, httplib::Response& res) { reviewCtrl.getCustomerReviews(req, res); });
    svr.Get(R"(/api/rentals/(\d+)/review)", [this](const httplib::Request& req, httplib::Response& res) { reviewCtrl.getRentalReview(req, res); });

    // 8. Maintenance Routes
    svr.Get("/api/maintenance", [this](const httplib::Request& req, httplib::Response& res) { maintenanceCtrl.getMaintenanceTasks(req, res); });
    svr.Get(R"(/api/maintenance/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { maintenanceCtrl.getMaintenanceById(req, res); });
    svr.Post("/api/maintenance", [this](const httplib::Request& req, httplib::Response& res) { maintenanceCtrl.scheduleMaintenance(req, res); });
    svr.Post(R"(/api/maintenance/(\d+)/complete)", [this](const httplib::Request& req, httplib::Response& res) { maintenanceCtrl.completeMaintenance(req, res); });
    svr.Patch(R"(/api/maintenance/(\d+)/status)", [this](const httplib::Request& req, httplib::Response& res) { maintenanceCtrl.updateStatus(req, res); });

    // 9. Loyalty Routes
    svr.Post(R"(/api/customers/(\d+)/loyalty/redeem)", [this](const httplib::Request& req, httplib::Response& res) { loyaltyCtrl.redeemPoints(req, res); });
    svr.Post(R"(/api/customers/(\d+)/loyalty/earn)", [this](const httplib::Request& req, httplib::Response& res) { loyaltyCtrl.earnPoints(req, res); });

    // 10. Notification Routes
    svr.Get(R"(/api/customers/(\d+)/notifications)", [this](const httplib::Request& req, httplib::Response& res) { notificationCtrl.getCustomerNotifications(req, res); });
    svr.Get(R"(/api/notifications/(\d+))", [this](const httplib::Request& req, httplib::Response& res) { notificationCtrl.getNotificationById(req, res); });
    svr.Patch(R"(/api/notifications/(\d+)/read)", [this](const httplib::Request& req, httplib::Response& res) { notificationCtrl.markAsRead(req, res); });
    svr.Post("/api/notifications", [this](const httplib::Request& req, httplib::Response& res) { notificationCtrl.createNotification(req, res); });

    // 11. Intelligence Routes
    svr.Post("/api/pricing/quote", [this](const httplib::Request& req, httplib::Response& res) { intelligenceCtrl.getPricingQuote(req, res); });
    svr.Get("/api/recommendations", [this](const httplib::Request& req, httplib::Response& res) { intelligenceCtrl.getRecommendations(req, res); });
    svr.Post("/api/recommendations", [this](const httplib::Request& req, httplib::Response& res) { intelligenceCtrl.getRecommendations(req, res); });
    svr.Post("/api/vehicles/allocate", [this](const httplib::Request& req, httplib::Response& res) { intelligenceCtrl.allocateVehicle(req, res); });

    // 12. Fleet Intelligence Routes
    svr.Get("/api/fleet/analytics", [this](const httplib::Request& req, httplib::Response& res) { fleetCtrl.getFleetAnalytics(req, res); });
    svr.Get("/api/fleet/insights", [this](const httplib::Request& req, httplib::Response& res) { fleetCtrl.getFleetInsights(req, res); });
}

bool HttpServer::listen() {
    Logger::info("HttpServer: Starting VeloRent REST API server on " + host + ":" + std::to_string(port));
    return svr.listen(host.c_str(), port);
}

void HttpServer::stop() {
    Logger::info("HttpServer: Stopping server...");
    svr.stop();
}

} // namespace velorent
