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

#include "VehicleRepository.h"
#include "CustomerRepository.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "MaintenanceRepository.h"
#include "ReviewRepository.h"
#include "LoyaltyRepository.h"
#include "NotificationRepository.h"

#include <iostream>
#include <cassert>
#include <thread>
#include <chrono>

using namespace velorent;

void runCoreRentalWorkflow() {
    std::cout << "Starting End-to-End Core Rental Workflow Simulation...\n\n";

    DatabaseManager& db = DatabaseManager::getInstance();
    db.loadConfig("config/config.json");
    db.connect();

    // Instantiate Repositories
    VehicleRepository vehicleRepo(db);
    CustomerRepository customerRepo(db);
    BookingRepository bookingRepo(db);
    RentalRepository rentalRepo(db);
    PaymentRepository paymentRepo(db);
    MaintenanceRepository maintRepo(db);
    ReviewRepository reviewRepo(db);
    LoyaltyRepository loyaltyRepo(db);
    NotificationRepository notifRepo(db);

    // Instantiate Services via Dependency Injection
    VehicleService vehicleService(vehicleRepo);
    CustomerService customerService(customerRepo, &bookingRepo, &rentalRepo, &loyaltyRepo);
    BookingService bookingService(bookingRepo, customerRepo, vehicleRepo);
    RentalService rentalService(rentalRepo, bookingRepo, vehicleRepo);
    PaymentService paymentService(paymentRepo, rentalRepo);
    ReviewService reviewService(reviewRepo, rentalRepo, bookingRepo, &vehicleRepo);
    NotificationService notificationService(notifRepo);

    // STEP 1: CUSTOMER REGISTRATION
    std::string testEmail = "test_workflow_user_999@velorent.com";
    std::cout << "Step 1: Registering new test customer (" << testEmail << ")...\n";

    // Clean up any leftover user from a prior interrupted run
    ResultSet rsPre = db.executeQuery("SELECT user_id FROM users WHERE email = ?", {testEmail});
    if (!rsPre.empty()) {
        int oldId = rsPre[0].getInt("user_id");
        db.executeUpdate("DELETE FROM notifications WHERE user_id = ?", {oldId});
        db.executeUpdate("DELETE FROM reviews WHERE customer_id = ?", {oldId});
        db.executeUpdate("DELETE FROM loyalty_transactions WHERE loyalty_id IN (SELECT loyalty_id FROM loyalty_accounts WHERE customer_id = ?)", {oldId});
        db.executeUpdate("DELETE FROM loyalty_accounts WHERE customer_id = ?", {oldId});
        db.executeUpdate("DELETE FROM payments WHERE rental_id IN (SELECT rental_id FROM rentals r JOIN bookings b ON r.booking_id = b.booking_id WHERE b.customer_id = ?)", {oldId});
        db.executeUpdate("DELETE FROM rentals WHERE booking_id IN (SELECT booking_id FROM bookings WHERE customer_id = ?)", {oldId});
        db.executeUpdate("DELETE FROM cancellation_records WHERE cancelled_by = ?", {oldId});
        db.executeUpdate("DELETE FROM bookings WHERE customer_id = ?", {oldId});
        db.executeUpdate("DELETE FROM customers WHERE customer_id = ?", {oldId});
        db.executeUpdate("DELETE FROM users WHERE user_id = ?", {oldId});
    }

    Customer newCustomer(0, "Workflow Tester", testEmail, "hash_pass_999", "9998887776", "DL-WF-99999", "2030-12-31");
    int customerId = customerService.registerCustomer(newCustomer);
    assert(customerId > 0);
    std::cout << "        -> Customer Registered with ID: " << customerId << " [OK]\n";

    // STEP 2: CUSTOMER LOOKUP
    std::cout << "Step 2: Retrieving customer details by email...\n";
    auto fetchedCustomer = customerService.getCustomerByEmail(testEmail);
    assert(fetchedCustomer != nullptr);
    assert(fetchedCustomer->getId() == customerId);
    std::cout << "        -> Customer Verified: " << fetchedCustomer->getFullName() << " [OK]\n";

    // STEP 3: SEARCH VEHICLES
    std::cout << "Step 3: Searching available vehicles...\n";
    VehicleFilter filter;
    filter.statusStr = "AVAILABLE";
    auto availableVehicles = vehicleService.searchVehicles(filter);
    assert(!availableVehicles.empty());
    int targetVehicleId = availableVehicles[0]->getId();
    std::cout << "        -> Selected Vehicle ID: " << targetVehicleId << " ("
              << availableVehicles[0]->getBrand() << " " << availableVehicles[0]->getModel() << ") [OK]\n";

    // STEP 4: VIEW VEHICLE DETAILS
    std::cout << "Step 4: Viewing vehicle details...\n";
    auto targetVehicle = vehicleService.getVehicleDetails(targetVehicleId);
    int startingOdometer = targetVehicle->getOdometerKm();
    std::cout << "        -> Vehicle Odometer: " << startingOdometer << " km [OK]\n";

    // STEP 5: CALCULATE PRELIMINARY QUOTE
    std::cout << "Step 5: Calculating preliminary rental quote for 3 days...\n";
    std::string startDate = "2026-11-01";
    std::string endDate = "2026-11-04";
    double preliminaryQuote = bookingService.calculatePreliminaryQuote(targetVehicleId, startDate, endDate);
    assert(preliminaryQuote > 0.0);
    std::cout << "        -> Calculated Quote: INR " << preliminaryQuote << " [OK]\n";

    // STEP 6: CREATE BOOKING (Triggers stored procedure sp_create_booking)
    std::cout << "Step 6: Creating booking...\n";
    int bookingId = bookingService.createBooking(customerId, targetVehicleId, startDate, endDate, 1.0, customerId);
    assert(bookingId > 0);
    auto bookingObj = bookingService.getBookingById(bookingId);
    assert(bookingObj.getStatus() == BookingStatus::CONFIRMED);
    std::cout << "        -> Booking Created with ID: " << bookingId << " (Status: CONFIRMED) [OK]\n";

    // STEP 7: CONFIRM RENTAL / PICKUP (Triggers stored procedure sp_confirm_rental)
    std::cout << "Step 7: Confirming rental & vehicle pickup...\n";
    int rentalId = rentalService.startRental(bookingId, startingOdometer, customerId);
    assert(rentalId > 0);
    auto rentalObj = rentalService.getRentalById(rentalId);
    assert(rentalObj.getStatus() == RentalStatus::ACTIVE);
    std::cout << "        -> Rental Activated with ID: " << rentalId << " (Status: ACTIVE) [OK]\n";

    // STEP 8: PROCESS BASE PAYMENT (Triggers stored procedure sp_process_payment)
    std::cout << "Step 8: Processing base rent payment...\n";
    int paymentId = paymentService.processPayment(rentalId, preliminaryQuote, PaymentMethod::UPI, PaymentType::BASE_RENT, 0, "UPI-REF-999888", customerId);
    assert(paymentId > 0);
    std::cout << "        -> Payment Processed with ID: " << paymentId << " [OK]\n";

    // STEP 9: RETURN VEHICLE (Triggers stored procedure sp_return_vehicle)
    std::cout << "Step 9: Returning vehicle after 300 km driven...\n";
    // Sleep 1s to ensure DATETIME actual_end > actual_start for MySQL CHECK constraint
    std::this_thread::sleep_for(std::chrono::seconds(1));
    int endingOdometer = startingOdometer + 300;
    bool returnOk = rentalService.returnVehicle(rentalId, endingOdometer, customerId);
    assert(returnOk);

    auto completedRental = rentalService.getRentalById(rentalId);
    assert(completedRental.getStatus() == RentalStatus::COMPLETED);
    int distance = rentalService.calculateDistanceTravelled(rentalId);
    assert(distance == 300);
    std::cout << "        -> Vehicle Returned Successfully. Distance Travelled: " << distance << " km [OK]\n";

    // STEP 10: SUBMIT CUSTOMER REVIEW
    std::cout << "Step 10: Submitting customer review...\n";
    Review newReview(0, rentalId, customerId, targetVehicleId, 5, "Workflow Test: Exceptional service and car condition!", "");
    int reviewId = reviewService.submitReview(newReview);
    assert(reviewId > 0);
    std::cout << "        -> Review Submitted with ID: " << reviewId << " [OK]\n";

    // STEP 11: SEND SYSTEM NOTIFICATION
    std::cout << "Step 11: Sending rental summary notification...\n";
    int notifId = notificationService.sendNotification(customerId, NotificationType::RENTAL_COMPLETED, "Rental Completed", "Thank you for using VeloRent!", rentalId);
    assert(notifId > 0);
    std::cout << "        -> Notification Sent with ID: " << notifId << " [OK]\n";

    // STEP 12: CLEAN UP TEST DATA SAFELY IN PROPER FOREIGN KEY DEPENDENCY ORDER
    std::cout << "Step 12: Cleaning up temporary test workflow records from database...\n";
    db.executeUpdate("DELETE FROM notifications WHERE user_id = ?", {customerId});
    db.executeUpdate("DELETE FROM reviews WHERE review_id = ?", {reviewId});
    db.executeUpdate("DELETE FROM loyalty_transactions WHERE loyalty_id IN (SELECT loyalty_id FROM loyalty_accounts WHERE customer_id = ?)", {customerId});
    db.executeUpdate("DELETE FROM loyalty_accounts WHERE customer_id = ?", {customerId});
    db.executeUpdate("DELETE FROM payments WHERE payment_id = ?", {paymentId});
    db.executeUpdate("DELETE FROM rentals WHERE rental_id = ?", {rentalId});
    db.executeUpdate("DELETE FROM cancellation_records WHERE booking_id = ?", {bookingId});
    db.executeUpdate("DELETE FROM bookings WHERE booking_id = ?", {bookingId});
    db.executeUpdate("DELETE FROM customers WHERE customer_id = ?", {customerId});
    db.executeUpdate("DELETE FROM users WHERE user_id = ?", {customerId});
    // Reset vehicle status back to AVAILABLE
    db.executeUpdate("UPDATE vehicles SET status = 'AVAILABLE', odometer_km = ? WHERE vehicle_id = ?", {startingOdometer, targetVehicleId});

    std::cout << "        -> Cleanup Completed. Database restored to pristine state [OK]\n";
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "   VeloRent Phase 4 Core Rental Workflow Test Suite \n";
    std::cout << "====================================================\n\n";

    try {
        runCoreRentalWorkflow();

        std::cout << "\n====================================================\n";
        std::cout << " CORE RENTAL WORKFLOW SIMULATION PASSED 100%! [OK]  \n";
        std::cout << "====================================================\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "\nFATAL WORKFLOW TEST FAILURE: " << ex.what() << "\n";
        return 1;
    }
}
