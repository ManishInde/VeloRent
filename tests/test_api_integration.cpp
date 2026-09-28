#ifdef _WIN32
#include <winsock2.h>
#endif
#include "httplib.h"
#include "json.hpp"
#include "DatabaseManager.h"

// Repositories
#include "UserRepository.h"
#include "CustomerRepository.h"
#include "VehicleRepository.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "MaintenanceRepository.h"
#include "ReviewRepository.h"
#include "NotificationRepository.h"
#include "LoyaltyRepository.h"

// Auth Components
#include "TokenManager.h"
#include "AuthService.h"
#include "AuthMiddleware.h"
#include "AuthController.h"

// Services
#include "CustomerService.h"
#include "VehicleService.h"
#include "BookingService.h"
#include "RentalService.h"
#include "PaymentService.h"
#include "MaintenanceService.h"
#include "ReviewService.h"
#include "LoyaltyService.h"
#include "NotificationService.h"

// Engines
#include "PricingEngine.h"
#include "RecommendationEngine.h"
#include "VehicleHealthEngine.h"
#include "VehicleAllocationEngine.h"
#include "LoyaltyEngine.h"
#include "CustomerRiskEngine.h"
#include "FleetIntelligenceEngine.h"

// Controllers
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

// Server
#include "HttpServer.h"

#include <iostream>
#include <thread>
#include <chrono>
#include <cassert>

using namespace velorent;

void runHttpServerUnitTests();
void runControllerUnitTests();

int main() {
    std::cout << "============================================" << std::endl;
    std::cout << "   VeloRent Phase 6 API & Controller Tests  " << std::endl;
    std::cout << "============================================" << std::endl << std::endl;

    try {
        // 1. Run local unit tests
        runHttpServerUnitTests();
        runControllerUnitTests();

        // 2. Connect DB
        auto& db = DatabaseManager::getInstance();
        db.loadConfig("config/config.json");
        db.connect();
        if (!db.isConnected()) {
            std::cerr << "[WARNING] DB Connection failed; skipping live API server integration tests." << std::endl;
            return 0;
        }

        // Repositories
        UserRepository userRepo(db);
        CustomerRepository customerRepo(db);
        VehicleRepository vehicleRepo(db);
        BookingRepository bookingRepo(db);
        RentalRepository rentalRepo(db);
        PaymentRepository paymentRepo(db);
        MaintenanceRepository maintenanceRepo(db);
        ReviewRepository reviewRepo(db);
        NotificationRepository notificationRepo(db);
        LoyaltyRepository loyaltyRepo(db);

        // Auth
        TokenManager tokenManager("test_secret_key_12345", 3600);
        AuthService authService(userRepo, tokenManager);
        AuthMiddleware authMiddleware(tokenManager);

        // Services
        CustomerService customerService(customerRepo);
        VehicleService vehicleService(vehicleRepo);
        BookingService bookingService(bookingRepo, customerRepo, vehicleRepo);
        RentalService rentalService(rentalRepo, bookingRepo, vehicleRepo);
        PaymentService paymentService(paymentRepo, rentalRepo);
        MaintenanceService maintenanceService(maintenanceRepo, vehicleRepo);
        ReviewService reviewService(reviewRepo, rentalRepo);
        LoyaltyService loyaltyService(loyaltyRepo);
        NotificationService notificationService(notificationRepo);

        // Engines
        PricingEngine pricingEngine;
        RecommendationEngine recommendationEngine;
        VehicleHealthEngine healthEngine;
        VehicleAllocationEngine allocationEngine;
        LoyaltyEngine loyaltyEngine;
        CustomerRiskEngine riskEngine;
        FleetIntelligenceEngine fleetEngine;

        // Controllers
        AuthController authCtrl(authService, authMiddleware);
        VehicleController vehicleCtrl(vehicleService, healthEngine, maintenanceRepo, authMiddleware);
        CustomerController customerCtrl(customerService, bookingRepo, rentalRepo, paymentRepo, loyaltyRepo, riskEngine, authMiddleware);
        BookingController bookingCtrl(bookingService, authMiddleware);
        RentalController rentalCtrl(rentalService, authMiddleware);
        PaymentController paymentCtrl(paymentService, authMiddleware);
        ReviewController reviewCtrl(reviewService, reviewRepo, authMiddleware);
        MaintenanceController maintenanceCtrl(maintenanceService, authMiddleware);
        LoyaltyController loyaltyCtrl(loyaltyService, loyaltyEngine, authMiddleware);
        NotificationController notificationCtrl(notificationService, notificationRepo, authMiddleware);
        IntelligenceController intelligenceCtrl(pricingEngine, recommendationEngine, allocationEngine, vehicleRepo, customerRepo, authMiddleware);
        FleetController fleetCtrl(fleetEngine, vehicleRepo, rentalRepo, paymentRepo, maintenanceRepo, authMiddleware);

        int testPort = 8089;
        HttpServer server("127.0.0.1", testPort, "*", db,
                          authCtrl, vehicleCtrl, customerCtrl, bookingCtrl, rentalCtrl,
                          paymentCtrl, reviewCtrl, maintenanceCtrl, loyaltyCtrl,
                          notificationCtrl, intelligenceCtrl, fleetCtrl);

        // Launch server in background thread
        std::thread serverThread([&server]() {
            server.listen();
        });

        std::this_thread::sleep_for(std::chrono::milliseconds(200));

        httplib::Client cli("http://127.0.0.1:8089");
        cli.set_read_timeout(5, 0);

        std::cout << "[TEST] Running Live REST API Client Integration Tests..." << std::endl;

        // Obtain Admin Token for protected routes
        nlohmann::json loginBody = {
            {"email", "arjun.mehta@velorent.in"},
            {"password", "VeloRent@2026"}
        };
        auto loginRes = cli.Post("/api/auth/login", loginBody.dump(), "application/json");
        assert(loginRes && loginRes->status == 200);
        std::string adminToken = nlohmann::json::parse(loginRes->body)["data"]["token"].get<std::string>();
        httplib::Headers adminHeaders = {{"Authorization", "Bearer " + adminToken}};

        // Test GET /api
        auto res1 = cli.Get("/api");
        assert(res1 && res1->status == 200);
        auto j1 = nlohmann::json::parse(res1->body);
        assert(j1["success"] == true);
        assert(j1["data"]["name"] == "VeloRent REST API");
        std::cout << "  [PASS] GET /api" << std::endl;

        // Test GET /api/health
        auto res2 = cli.Get("/api/health");
        assert(res2 && res2->status == 200);
        auto j2 = nlohmann::json::parse(res2->body);
        assert(j2["data"]["status"] == "UP");
        std::cout << "  [PASS] GET /api/health" << std::endl;

        // Test GET /api/vehicles
        auto res3 = cli.Get("/api/vehicles");
        assert(res3 && res3->status == 200);
        auto j3 = nlohmann::json::parse(res3->body);
        assert(j3["success"] == true);
        assert(j3["data"].is_array());
        std::cout << "  [PASS] GET /api/vehicles" << std::endl;

        // Test GET /api/vehicles/1
        auto res4 = cli.Get("/api/vehicles/1");
        assert(res4 && res4->status == 200);
        auto j4 = nlohmann::json::parse(res4->body);
        assert(j4["data"]["id"] == 1);
        std::cout << "  [PASS] GET /api/vehicles/1" << std::endl;

        // Test GET /api/vehicles/1/health (Protected)
        auto res5 = cli.Get("/api/vehicles/1/health", adminHeaders);
        assert(res5 && res5->status == 200);
        auto j5 = nlohmann::json::parse(res5->body);
        assert(j5["data"].contains("score"));
        std::cout << "  [PASS] GET /api/vehicles/1/health" << std::endl;

        // Test POST /api/pricing/quote
        nlohmann::json quoteReq = {
            {"vehicleId", 1},
            {"startDate", "2026-10-01"},
            {"endDate", "2026-10-05"},
            {"demandFactor", 1.0},
            {"loyaltyTier", "GOLD"}
        };
        auto res6 = cli.Post("/api/pricing/quote", quoteReq.dump(), "application/json");
        assert(res6 && res6->status == 200);
        auto j6 = nlohmann::json::parse(res6->body);
        assert(j6["data"].contains("finalPrice"));
        std::cout << "  [PASS] POST /api/pricing/quote" << std::endl;

        // Test GET /api/fleet/analytics (Protected)
        auto res7 = cli.Get("/api/fleet/analytics", adminHeaders);
        assert(res7 && res7->status == 200);
        auto j7 = nlohmann::json::parse(res7->body);
        assert(j7["data"].contains("totalVehicles"));
        std::cout << "  [PASS] GET /api/fleet/analytics" << std::endl;

        // Test GET /api/vehicles/999999 (404 Not Found)
        auto res8 = cli.Get("/api/vehicles/999999");
        assert(res8 && res8->status == 404);
        auto j8 = nlohmann::json::parse(res8->body);
        assert(j8["success"] == false);
        assert(j8["error"]["code"] == "NOT_FOUND");
        std::cout << "  [PASS] GET /api/vehicles/999999 (404 Error Handling)" << std::endl;

        // Stop server
        server.stop();
        if (serverThread.joinable()) {
            serverThread.join();
        }

        std::cout << "============================================" << std::endl;
        std::cout << "   ALL PHASE 6 API REST TESTS PASSED [100%]  " << std::endl;
        std::cout << "============================================" << std::endl;
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "[TEST FAILED] Exception: " << ex.what() << std::endl;
        return 1;
    }
}
