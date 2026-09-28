#ifdef _WIN32
#include <winsock2.h>
#endif
#include "httplib.h"
#include "json.hpp"
#include "DatabaseManager.h"
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
#include "PasswordHasher.h"
#include "TokenManager.h"
#include "AuthService.h"
#include "AuthMiddleware.h"
#include "AuthController.h"

// Services & Engines
#include "CustomerService.h"
#include "VehicleService.h"
#include "BookingService.h"
#include "RentalService.h"
#include "PaymentService.h"
#include "MaintenanceService.h"
#include "ReviewService.h"
#include "LoyaltyService.h"
#include "NotificationService.h"

#include "PricingEngine.h"
#include "RecommendationEngine.h"
#include "VehicleHealthEngine.h"
#include "VehicleAllocationEngine.h"
#include "LoyaltyEngine.h"
#include "CustomerRiskEngine.h"
#include "FleetIntelligenceEngine.h"

// Controllers & Server
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
#include "HttpServer.h"

#include <iostream>
#include <thread>
#include <chrono>
#include <cassert>

using namespace velorent;

void testPasswordHasher() {
    std::cout << "  [1/5] Testing PasswordHasher (Bcrypt)..." << std::endl;

    std::string pass = "VeloRent@2026";
    std::string hash = PasswordHasher::hashPassword(pass);
    assert(!hash.empty());
    assert(hash.find("$2b$") == 0);

    // Verify correct password
    bool match = PasswordHasher::verifyPassword(pass, hash);
    assert(match);

    // Verify wrong password fails
    bool wrongMatch = PasswordHasher::verifyPassword("WrongPassword123", hash);
    assert(!wrongMatch);

    // Verify existing sample hash from 07_sample_data.sql
    std::string sampleHash = "$2b$12$LfmhPQWe9Z0sH8kXr1mLVOtY3nK7jA2B6cD4eF5gH0iJ1kL2mN3oP4";
    assert(PasswordHasher::verifyPassword("VeloRent@2026", sampleHash));

    std::cout << "        PasswordHasher PASSED [OK]" << std::endl;
}

void testTokenManager() {
    std::cout << "  [2/5] Testing TokenManager (HMAC-SHA256 JWT)..." << std::endl;

    TokenManager tm("test_secret_key_12345", 3600);

    Customer testUser(7, "Rahul Verma", "rahul.verma@gmail.com", "hash", "9880004001", "DL-0420110012345", "2029-08-15");
    std::string token = tm.generateToken(testUser);
    assert(!token.empty());

    AuthContext ctx;
    bool valid = tm.validateToken(token, ctx);
    assert(valid);
    assert(ctx.userId == 7);
    assert(ctx.email == "rahul.verma@gmail.com");
    assert(ctx.role == UserRole::CUSTOMER);
    assert(ctx.authenticated);

    // Test tampered token signature failure
    std::string tamperedToken = token + "tampered";
    AuthContext ctx2;
    assert(!tm.validateToken(tamperedToken, ctx2));

    // Test token revocation
    tm.revokeToken(ctx.tokenId);
    AuthContext ctx3;
    assert(!tm.validateToken(token, ctx3));

    std::cout << "        TokenManager PASSED [OK]" << std::endl;
}

void testAuthMiddleware() {
    std::cout << "  [3/5] Testing AuthMiddleware & Authorization Assertions..." << std::endl;

    TokenManager tm("test_secret_key_12345", 3600);
    AuthMiddleware middleware(tm);

    AuthContext customerCtx;
    customerCtx.userId = 7;
    customerCtx.role = UserRole::CUSTOMER;
    customerCtx.status = AccountStatus::ACTIVE;
    customerCtx.authenticated = true;

    AuthContext adminCtx;
    adminCtx.userId = 1;
    adminCtx.role = UserRole::ADMIN;
    adminCtx.status = AccountStatus::ACTIVE;
    adminCtx.authenticated = true;

    // Test requireAuthenticated
    AuthMiddleware::requireAuthenticated(customerCtx);

    // Test requireRole
    AuthMiddleware::requireRole(adminCtx, UserRole::ADMIN);
    try {
        AuthMiddleware::requireRole(customerCtx, UserRole::ADMIN);
        assert(false && "Should have thrown ForbiddenException");
    } catch (const ForbiddenException&) {
        // Expected
    }

    // Test checkOwnership
    AuthMiddleware::checkOwnership(customerCtx, 7); // Customer 7 accessing own resource -> OK
    try {
        AuthMiddleware::checkOwnership(customerCtx, 8); // Customer 7 accessing Customer 8 resource -> Forbidden
        assert(false && "Should have thrown ForbiddenException");
    } catch (const ForbiddenException&) {
        // Expected
    }

    AuthMiddleware::checkOwnership(adminCtx, 8); // Admin accessing Customer 8 resource -> Allowed

    std::cout << "        AuthMiddleware PASSED [OK]" << std::endl;
}

void testAuthService(DatabaseManager& db) {
    std::cout << "  [4/5] Testing AuthService (Login, Logout, Rate Limiting)..." << std::endl;

    UserRepository userRepo(db);
    TokenManager tm("test_secret_key_12345", 3600);
    AuthService authService(userRepo, tm, 5, 900);

    // Test successful login with sample user
    auto res1 = authService.login("arjun.mehta@velorent.in", "VeloRent@2026");
    assert(res1.success);
    assert(!res1.token.empty());
    assert(res1.user != nullptr);
    assert(res1.user->getRole() == UserRole::ADMIN);

    // Test invalid password login failure
    auto res2 = authService.login("arjun.mehta@velorent.in", "WrongPassword");
    assert(!res2.success);
    assert(res2.statusCode == 401);

    // Test invalid email login failure
    auto res3 = authService.login("nonexistent@domain.com", "VeloRent@2026");
    assert(!res3.success);
    assert(res3.statusCode == 401);

    std::cout << "        AuthService PASSED [OK]" << std::endl;
}

int main() {
    std::cout << "============================================" << std::endl;
    std::cout << "   VeloRent Phase 7 Security & Auth Tests   " << std::endl;
    std::cout << "============================================" << std::endl << std::endl;

    try {
        testPasswordHasher();
        testTokenManager();
        testAuthMiddleware();

        auto& db = DatabaseManager::getInstance();
        db.loadConfig("config/config.json");
        db.connect();
        if (!db.isConnected()) {
            std::cerr << "[WARNING] DB Connection failed; skipping live database auth tests." << std::endl;
            return 0;
        }

        testAuthService(db);

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
        ReviewService reviewService(reviewRepo, rentalRepo, bookingRepo, &vehicleRepo);
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

        int testPort = 8090;
        HttpServer server("127.0.0.1", testPort, "*", db,
                          authCtrl, vehicleCtrl, customerCtrl, bookingCtrl, rentalCtrl,
                          paymentCtrl, reviewCtrl, maintenanceCtrl, loyaltyCtrl,
                          notificationCtrl, intelligenceCtrl, fleetCtrl);

        std::thread serverThread([&server]() {
            server.listen();
        });

        std::this_thread::sleep_for(std::chrono::milliseconds(200));

        httplib::Client cli("http://127.0.0.1:8090");
        cli.set_read_timeout(5, 0);

        std::cout << "  [5/5] Testing Live Auth REST Endpoints & RBAC..." << std::endl;

        // 1. Test POST /api/auth/login (Success as Customer)
        nlohmann::json loginBody = {
            {"email", "aditya.kumar@gmail.com"},
            {"password", "VeloRent@2026"}
        };
        auto loginRes = cli.Post("/api/auth/login", loginBody.dump(), "application/json");
        assert(loginRes && loginRes->status == 200);
        auto loginJson = nlohmann::json::parse(loginRes->body);
        assert(loginJson["success"] == true);
        std::string customerToken = loginJson["data"]["token"].get<std::string>();
        assert(!customerToken.empty());
        std::cout << "        [PASS] POST /api/auth/login (Customer)" << std::endl;

        // 2. Test GET /api/auth/me
        httplib::Headers authHeaders = {{"Authorization", "Bearer " + customerToken}};
        auto meRes = cli.Get("/api/auth/me", authHeaders);
        assert(meRes && meRes->status == 200);
        auto meJson = nlohmann::json::parse(meRes->body);
        assert(meJson["data"]["email"] == "aditya.kumar@gmail.com");
        assert(meJson["data"]["role"] == "CUSTOMER");
        std::cout << "        [PASS] GET /api/auth/me" << std::endl;

        // 3. Test Protected endpoint without token -> 401 Unauthorized
        auto unauthRes = cli.Get("/api/customers/7");
        assert(unauthRes && unauthRes->status == 401);
        std::cout << "        [PASS] Protected endpoint without token -> 401 Unauthorized" << std::endl;

        // 4. Test Customer accessing another Customer's profile -> 403 Forbidden
        auto forbiddenRes = cli.Get("/api/customers/8", authHeaders);
        assert(forbiddenRes && forbiddenRes->status == 403);
        std::cout << "        [PASS] Customer accessing Customer 8 profile -> 403 Forbidden" << std::endl;

        // 5. Test Customer accessing Admin endpoint /api/fleet/analytics -> 403 Forbidden
        auto adminRes = cli.Get("/api/fleet/analytics", authHeaders);
        assert(adminRes && adminRes->status == 403);
        std::cout << "        [PASS] Customer accessing Fleet Analytics -> 403 Forbidden" << std::endl;

        // 6. Test Admin Login and accessing Fleet Analytics -> 200 OK
        nlohmann::json adminLoginBody = {
            {"email", "arjun.mehta@velorent.in"},
            {"password", "VeloRent@2026"}
        };
        auto adminLoginRes = cli.Post("/api/auth/login", adminLoginBody.dump(), "application/json");
        assert(adminLoginRes && adminLoginRes->status == 200);
        std::string adminToken = nlohmann::json::parse(adminLoginRes->body)["data"]["token"].get<std::string>();

        httplib::Headers adminAuthHeaders = {{"Authorization", "Bearer " + adminToken}};
        auto fleetRes = cli.Get("/api/fleet/analytics", adminAuthHeaders);
        assert(fleetRes && fleetRes->status == 200);
        std::cout << "        [PASS] Admin accessing Fleet Analytics -> 200 OK" << std::endl;

        // Stop server
        server.stop();
        if (serverThread.joinable()) {
            serverThread.join();
        }

        std::cout << "============================================" << std::endl;
        std::cout << "   ALL PHASE 7 AUTH SECURITY TESTS PASSED!  " << std::endl;
        std::cout << "============================================" << std::endl;
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "[AUTH TEST FAILED] Exception: " << ex.what() << std::endl;
        return 1;
    }
}
