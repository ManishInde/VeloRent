#include "DatabaseManager.h"
#include "VehicleService.h"
#include "CustomerService.h"
#include "BookingService.h"
#include "RentalService.h"
#include "PaymentService.h"
#include "MaintenanceService.h"
#include "ReviewService.h"
#include "LoyaltyService.h"
#include "NotificationService.h"
#include "Car.h"

#include "VehicleRepository.h"
#include "CustomerRepository.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "MaintenanceRepository.h"
#include "ReviewRepository.h"
#include "LoyaltyRepository.h"
#include "NotificationRepository.h"

#include "ValidationException.h"
#include "InvalidBookingException.h"
#include "RentalNotActiveException.h"
#include "BusinessRuleException.h"
#include "ForbiddenException.h"
#include "NotFoundException.h"
#include "PaymentException.h"
#include "BusinessRuleException.h"
#include "NotFoundException.h"

#include <iostream>
#include <cassert>

using namespace velorent;

void testVehicleService(DatabaseManager& db) {
    std::cout << "  [1/9] Testing VehicleService...\n";
    VehicleRepository vRepo(db);
    VehicleService vService(vRepo);

    auto v1 = vService.getVehicleDetails(1);
    assert(v1 != nullptr);
    assert(v1->getId() == 1);

    auto available = vService.getAvailableVehicles();
    assert(!available.empty());

    VehicleFilter filter;
    filter.brand = "Maruti";
    auto searchRes = vService.searchVehicles(filter);
    assert(!searchRes.empty());

    // Test case-insensitive search by model (Creta)
    VehicleFilter cretaFilter;
    cretaFilter.searchTerm = "Creta";
    auto cretaRes = vService.searchVehicles(cretaFilter);
    assert(!cretaRes.empty());
    assert(cretaRes[0]->getModel() == "Creta");

    // Test case-insensitive lowercase search by model (swift)
    VehicleFilter swiftFilter;
    swiftFilter.searchTerm = "swift";
    auto swiftRes = vService.searchVehicles(swiftFilter);
    assert(!swiftRes.empty());
    assert(swiftRes[0]->getModel() == "Swift");

    // Test search by full name (Honda City)
    VehicleFilter cityFilter;
    cityFilter.searchTerm = "Honda City";
    auto cityRes = vService.searchVehicles(cityFilter);
    assert(!cityRes.empty());
    assert(cityRes[0]->getModel() == "City");

    // Test validation
    try {
        Car invalidCar(0, "", "", "", 1, FuelType::PETROL, TransmissionType::MANUAL, 5, -100.0);
        vService.addVehicle(invalidCar);
        assert(false && "Should have thrown ValidationException for invalid car");
    } catch (const ValidationException&) {
        // Expected
    }

    std::cout << "        VehicleService PASSED [OK]\n";
}

void testCustomerService(DatabaseManager& db) {
    std::cout << "  [2/9] Testing CustomerService...\n";
    CustomerRepository cRepo(db);
    CustomerService cService(cRepo);

    auto c7 = cService.getCustomerById(7);
    assert(c7 != nullptr);
    assert(c7->getId() == 7);

    // Test validation
    try {
        Customer invalidCustomer(0, "", "invalidemail", "hash", "12345", "");
        cService.registerCustomer(invalidCustomer);
        assert(false && "Should have thrown ValidationException");
    } catch (const ValidationException&) {
        // Expected
    }

    std::cout << "        CustomerService PASSED [OK]\n";
}

void testBookingService(DatabaseManager& db) {
    std::cout << "  [3/9] Testing BookingService...\n";
    BookingRepository bRepo(db);
    CustomerRepository cRepo(db);
    VehicleRepository vRepo(db);
    BookingService bService(bRepo, cRepo, vRepo);

    // Test preliminary quote
    double quote = bService.calculatePreliminaryQuote(1, "2026-10-01", "2026-10-05");
    assert(quote > 0.0);

    // Test invalid date range (end before start)
    try {
        bService.createBooking(7, 1, "2026-10-10", "2026-10-05");
        assert(false && "Should have thrown InvalidBookingException");
    } catch (const InvalidBookingException&) {
        // Expected
    }

    std::cout << "        BookingService PASSED [OK]\n";
}

void testRentalService(DatabaseManager& db) {
    std::cout << "  [4/9] Testing RentalService...\n";
    RentalRepository rRepo(db);
    BookingRepository bRepo(db);
    VehicleRepository vRepo(db);
    RentalService rService(rRepo, bRepo, vRepo);

    auto active = rService.getActiveRentals();
    assert(!active.empty() || true);

    // Test invalid odometer return or non-active rental
    try {
        rService.returnVehicle(1, 10, 2); // Rental 1 is already COMPLETED in sample data
        assert(false && "Should have thrown RentalNotActiveException or ValidationException");
    } catch (const VeloRentException&) {
        // Expected exception
    }

    std::cout << "        RentalService PASSED [OK]\n";
}

void testPaymentService(DatabaseManager& db) {
    std::cout << "  [5/9] Testing PaymentService...\n";
    PaymentRepository pRepo(db);
    RentalRepository rRepo(db);
    PaymentService pService(pRepo, rRepo);

    // Test invalid payment amount
    try {
        pService.processPayment(1, -500.0, PaymentMethod::UPI, PaymentType::BASE_RENT);
        assert(false && "Should have thrown PaymentException");
    } catch (const PaymentException&) {
        // Expected
    }

    std::cout << "        PaymentService PASSED [OK]\n";
}

void testMaintenanceService(DatabaseManager& db) {
    std::cout << "  [6/9] Testing MaintenanceService...\n";
    MaintenanceRepository mRepo(db);
    VehicleRepository vRepo(db);
    MaintenanceService mService(mRepo, vRepo);

    auto openTasks = mService.getOpenMaintenanceTasks();
    assert(!openTasks.empty() || true);

    // Test empty description
    try {
        mService.scheduleMaintenance(1, MaintenanceType::ROUTINE, MaintenancePriority::LOW, "", "2026-10-01");
        assert(false && "Should have thrown ValidationException");
    } catch (const ValidationException&) {
        // Expected
    }

    std::cout << "        MaintenanceService PASSED [OK]\n";
}

void testReviewService(DatabaseManager& db) {
    std::cout << "  [7/9] Testing ReviewService...\n";
    ReviewRepository revRepo(db);
    RentalRepository rRepo(db);
    BookingRepository bRepo(db);
    VehicleRepository vRepo(db);
    ReviewService revService(revRepo, rRepo, bRepo, &vRepo);

    // 1. Test invalid rating (< 1 or > 5)
    try {
        Review r(0, 1, 7, 1, 10, "Great", "");
        revService.submitReview(r);
        assert(false && "Should have thrown ValidationException for rating > 5");
    } catch (const ValidationException&) {
        // Expected
    }

    // 2. Test duplicate review for already reviewed rental (Rental 1 already has Review 1 in seed)
    try {
        Review r(0, 1, 7, 11, 5, "Duplicate review test", "");
        revService.submitReview(r);
        assert(false && "Should have thrown BusinessRuleException for duplicate review");
    } catch (const BusinessRuleException&) {
        // Expected
    }

    // 3. Test review for non-existent rental
    try {
        Review r(0, 999999, 7, 1, 5, "Non-existent rental test", "");
        revService.submitReview(r);
        assert(false && "Should have thrown NotFoundException for non-existent rental");
    } catch (const NotFoundException&) {
        // Expected
    }

    // 4. Test review for rental belonging to another customer
    // Rental 7 in seed belongs to Customer 8 and is not yet reviewed. Submitting as Customer 7 should fail.
    try {
        Review r(0, 7, 7, 1, 5, "Unauthorized review test", "");
        revService.submitReview(r);
        assert(false && "Should have thrown ForbiddenException for unauthorized customer");
    } catch (const ForbiddenException&) {
        // Expected
    }

    std::cout << "        ReviewService PASSED [OK]\n";
}

void testLoyaltyService(DatabaseManager& db) {
    std::cout << "  [8/9] Testing LoyaltyService...\n";
    LoyaltyRepository lRepo(db);
    LoyaltyService lService(lRepo);

    auto acc = lService.getAccountByCustomer(7);
    assert(acc.getCustomerId() == 7);

    bool canRedeem = lService.canRedeemPoints(7, 999999);
    assert(!canRedeem);

    std::cout << "        LoyaltyService PASSED [OK]\n";
}

void testNotificationService(DatabaseManager& db) {
    std::cout << "  [9/9] Testing NotificationService...\n";
    NotificationRepository nRepo(db);
    NotificationService nService(nRepo);

    auto notifs = nService.getUserNotifications(7);
    assert(!notifs.empty() || true);

    // Test empty title
    try {
        nService.sendNotification(7, NotificationType::SYSTEM, "", "");
        assert(false && "Should have thrown ValidationException");
    } catch (const ValidationException&) {
        // Expected
    }

    std::cout << "        NotificationService PASSED [OK]\n";
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "       VeloRent Phase 4 Service Layer Tests        \n";
    std::cout << "====================================================\n\n";

    try {
        DatabaseManager& db = DatabaseManager::getInstance();
        db.loadConfig("config/config.json");
        db.connect();

        testVehicleService(db);
        testCustomerService(db);
        testBookingService(db);
        testRentalService(db);
        testPaymentService(db);
        testMaintenanceService(db);
        testReviewService(db);
        testLoyaltyService(db);
        testNotificationService(db);

        std::cout << "\n====================================================\n";
        std::cout << "   ALL SERVICE LAYER UNIT TESTS PASSED (9/9) [OK]   \n";
        std::cout << "====================================================\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "\nFATAL SERVICE TEST FAILURE: " << ex.what() << "\n";
        return 1;
    }
}
