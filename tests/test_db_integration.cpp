#include "DatabaseManager.h"
#include "VehicleRepository.h"
#include "CustomerRepository.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "MaintenanceRepository.h"
#include "ReviewRepository.h"
#include "LoyaltyRepository.h"
#include "NotificationRepository.h"
#include "DatabaseException.h"
#include "NotFoundException.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void runDatabaseConnectionTest() {
    std::cout << "  [1/3] Testing MySQL Database Connection & Config...\n";
    DatabaseManager& db = DatabaseManager::getInstance();
    db.loadConfig("config/config.json");
    db.connect();
    assert(db.isConnected());
    assert(db.ping());

    // Execute simple SELECT 1
    ResultSet rs = db.executeQuery("SELECT 1 AS test_val");
    assert(!rs.empty());
    assert(rs[0].getInt("test_val") == 1);

    // Verify velorent database & sample vehicle #1 read
    ResultSet rsVeh = db.executeQuery("SELECT brand, model FROM vehicles WHERE vehicle_id = 1");
    assert(!rsVeh.empty());
    std::cout << "        Sample Vehicle #1: " << rsVeh[0].getString("brand") << " " << rsVeh[0].getString("model") << "\n";
    std::cout << "        Connection Test PASSED [OK]\n";
}

void runRepositoryIntegrationTests() {
    std::cout << "  [2/3] Testing Repositories against velorent Database...\n";
    DatabaseManager& db = DatabaseManager::getInstance();

    // 1. VehicleRepository
    VehicleRepository vehicleRepo(db);
    auto v1 = vehicleRepo.findById(1);
    assert(v1 != nullptr);
    assert(v1->getId() == 1);
    auto allVeh = vehicleRepo.findAll();
    assert(allVeh.size() >= 50);

    // 2. CustomerRepository
    CustomerRepository customerRepo(db);
    auto c1 = customerRepo.findById(7); // Sample Customer ID 7
    assert(c1 != nullptr);
    assert(c1->getId() == 7);

    // 3. BookingRepository
    BookingRepository bookingRepo(db);
    auto b1 = bookingRepo.findById(1);
    assert(b1.getId() == 1);

    // 4. RentalRepository
    RentalRepository rentalRepo(db);
    auto r1 = rentalRepo.findById(1);
    assert(r1.getId() == 1);

    // 5. PaymentRepository
    PaymentRepository paymentRepo(db);
    auto p1 = paymentRepo.findById(1);
    assert(p1.getId() == 1);

    // 6. MaintenanceRepository
    MaintenanceRepository maintRepo(db);
    auto m1 = maintRepo.findById(1);
    assert(m1.getId() == 1);

    // 7. ReviewRepository
    ReviewRepository reviewRepo(db);
    auto revList = reviewRepo.findByVehicle(11);
    assert(!revList.empty());

    // 8. LoyaltyRepository
    LoyaltyRepository loyaltyRepo(db);
    auto acc = loyaltyRepo.findAccountByCustomer(7);
    assert(acc.getCustomerId() == 7);

    // 9. NotificationRepository
    NotificationRepository notifRepo(db);
    auto notifs = notifRepo.findByUser(7);
    assert(!notifs.empty());

    std::cout << "        All 9 Repositories Integration PASSED [OK]\n";
}

void runTransactionRollbackAndCommitTest() {
    std::cout << "  [3/3] Testing Transaction BEGIN, ROLLBACK, and COMMIT...\n";
    DatabaseManager& db = DatabaseManager::getInstance();

    // PART A: ROLLBACK TEST
    db.beginTransaction();
    std::string sqlInsert = "INSERT INTO vehicles (registration_no, brand, model, category_id, fuel_type, transmission, seats, base_rate_per_day, purchase_year, status, added_by) VALUES ('TEST-ROLLBACK-999', 'TestBrand', 'RollbackModel', 1, 'PETROL', 'MANUAL', 5, 9999.0, 2024, 'AVAILABLE', 2)";
    uint64_t tempId = db.executeInsert(sqlInsert);
    assert(tempId > 0);

    // Verify temp vehicle is visible within uncommitted transaction
    ResultSet rsInside = db.executeQuery("SELECT vehicle_id FROM vehicles WHERE registration_no = 'TEST-ROLLBACK-999'");
    assert(!rsInside.empty());

    // ROLLBACK transaction
    db.rollback();
    assert(!db.isInTransaction());

    // Verify temp vehicle was NOT persisted
    ResultSet rsAfterRollback = db.executeQuery("SELECT vehicle_id FROM vehicles WHERE registration_no = 'TEST-ROLLBACK-999'");
    assert(rsAfterRollback.empty());
    std::cout << "        Transaction ROLLBACK Verification PASSED [OK]\n";

    // PART B: COMMIT TEST
    db.beginTransaction();
    std::string sqlInsertCommit = "INSERT INTO vehicles (registration_no, brand, model, category_id, fuel_type, transmission, seats, base_rate_per_day, purchase_year, status, added_by) VALUES ('TEST-COMMIT-888', 'TestBrand', 'CommitModel', 1, 'PETROL', 'MANUAL', 5, 8888.0, 2024, 'AVAILABLE', 2)";
    uint64_t commitTempId = db.executeInsert(sqlInsertCommit);
    assert(commitTempId > 0);

    db.commit();
    assert(!db.isInTransaction());

    // Verify temp vehicle WAS persisted after commit
    ResultSet rsAfterCommit = db.executeQuery("SELECT vehicle_id FROM vehicles WHERE registration_no = 'TEST-COMMIT-888'");
    assert(!rsAfterCommit.empty());

    // Clean up test vehicle so database is left pristine
    db.executeUpdate("DELETE FROM vehicles WHERE vehicle_id = ?", {static_cast<int>(commitTempId)});
    std::cout << "        Transaction COMMIT & Cleanup Verification PASSED [OK]\n";
}

int main() {
    std::cout << "====================================================\n";
    std::cout << "   VeloRent MySQL Integration & Data Access Tests   \n";
    std::cout << "====================================================\n\n";

    try {
        runDatabaseConnectionTest();
        runRepositoryIntegrationTests();
        runTransactionRollbackAndCommitTest();

        std::cout << "\n====================================================\n";
        std::cout << " ALL DATABASE INTEGRATION TESTS PASSED SUCCESSFULLY! \n";
        std::cout << "====================================================\n";
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "\nFATAL INTEGRATION TEST FAILURE: " << ex.what() << "\n";
        return 1;
    }
}
