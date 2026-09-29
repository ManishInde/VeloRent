#ifdef _WIN32
#include <winsock2.h>
#endif
#include "Logger.h"
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

// Authentication
#include "TokenManager.h"
#include "AuthService.h"
#include "AuthMiddleware.h"

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

// HTTP Server
#include "HttpServer.h"

#include <iostream>
#include <fstream>
#include "json.hpp"

using namespace velorent;

int main() {
    std::cout << "============================================" << std::endl;
    std::cout << "   VeloRent REST API Application Server    " << std::endl;
    std::cout << "============================================" << std::endl;

    std::string configPath = "config/config.json";
    std::ifstream configFile(configPath);
    if (!configFile.is_open()) {
        configPath = "../config/config.json";
        configFile.open(configPath);
    }

    std::string host = "0.0.0.0";
    int port = 8081;
    std::string allowedOrigin = "http://localhost:3000";
    std::string jwtSecret = "velorent_super_secret_jwt_key_2026_change_in_production!";
    int tokenTtl = 86400;

    // Load config if available
    try {
        if (configFile.is_open()) {
            nlohmann::json cfg = nlohmann::json::parse(configFile);
            if (cfg.contains("server")) {
                host = cfg["server"].value("host", "0.0.0.0");
                port = cfg["server"].value("port", 8081);
            }
            if (cfg.contains("cors")) {
                allowedOrigin = cfg["cors"].value("allowed_origin", "http://localhost:3000");
            }
            if (cfg.contains("auth")) {
                jwtSecret = cfg["auth"].value("jwt_secret", jwtSecret);
                tokenTtl = cfg["auth"].value("token_ttl_seconds", 86400);
            }
        }
    } catch (const std::exception& ex) {
        Logger::info("Config warning: " + std::string(ex.what()) + ". Using defaults.");
    }

    try {
        // 1. Initialize Database
        Logger::info("Initializing DatabaseManager...");
        auto& db = DatabaseManager::getInstance();
        db.loadConfig(configPath);
        db.connect();
        if (!db.isConnected()) {
            std::cerr << "[ERROR] Failed to connect to MySQL database!" << std::endl;
            return 1;
        }
        Logger::info("Database connection verified successfully.");

        // 2. Instantiate Repositories
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

        // 3. Instantiate Authentication Layer
        TokenManager tokenManager(jwtSecret, tokenTtl);
        AuthService authService(userRepo, tokenManager);
        AuthMiddleware authMiddleware(tokenManager);

        // 4. Instantiate Services
        CustomerService customerService(customerRepo, &bookingRepo, &rentalRepo, &loyaltyRepo);
        VehicleService vehicleService(vehicleRepo);
        BookingService bookingService(bookingRepo, customerRepo, vehicleRepo);
        RentalService rentalService(rentalRepo, bookingRepo, vehicleRepo);
        PaymentService paymentService(paymentRepo, rentalRepo);
        MaintenanceService maintenanceService(maintenanceRepo, vehicleRepo);
        ReviewService reviewService(reviewRepo, rentalRepo, bookingRepo, &vehicleRepo);
        LoyaltyService loyaltyService(loyaltyRepo);
        NotificationService notificationService(notificationRepo);

        // 5. Instantiate Engines
        PricingEngine pricingEngine;
        RecommendationEngine recommendationEngine;
        VehicleHealthEngine healthEngine;
        VehicleAllocationEngine allocationEngine;
        LoyaltyEngine loyaltyEngine;
        CustomerRiskEngine riskEngine;
        FleetIntelligenceEngine fleetEngine;

        // 6. Instantiate Controllers
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
        FleetController fleetCtrl(fleetEngine, vehicleRepo, rentalRepo, paymentRepo, maintenanceRepo, authMiddleware, &bookingRepo);

        // 7. Instantiate & Launch HTTP Server
        HttpServer server(host, port, allowedOrigin, db,
                          authCtrl, vehicleCtrl, customerCtrl, bookingCtrl, rentalCtrl,
                          paymentCtrl, reviewCtrl, maintenanceCtrl, loyaltyCtrl,
                          notificationCtrl, intelligenceCtrl, fleetCtrl);

        std::cout << "[SERVER STARTED] Listening on http://" << host << ":" << port << std::endl;
        std::cout << "[CORS ALLOWED ORIGIN] " << allowedOrigin << std::endl;
        std::cout << "Press Ctrl+C to stop the server." << std::endl << std::endl;

        if (!server.listen()) {
            std::cerr << "[ERROR] HTTP Server failed to listen." << std::endl;
            return 1;
        }

        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "[FATAL] Server exception: " << ex.what() << std::endl;
        return 1;
    }
}
