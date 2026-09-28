#include <iostream>
#include <vector>
#include <functional>
#include <string>

// Test registry declarations
void runUserTests();
void runVehicleTests();
void runBookingRentalTests();
void runPaymentTests();
void runValidationTests();

int main() {
    std::cout << "====================================================\n";
    std::cout << "   VeloRent C++ Model Layer Unit Tests Runner       \n";
    std::cout << "====================================================\n\n";

    int passed = 0;
    int failed = 0;

    auto executeTest = [&](const std::string& name, const std::function<void()>& testFunc) {
        std::cout << "[RUNNING] " << name << "... ";
        try {
            testFunc();
            std::cout << "PASSED [OK]\n";
            passed++;
        } catch (const std::exception& ex) {
            std::cout << "FAILED! Exception: " << ex.what() << "\n";
            failed++;
        } catch (...) {
            std::cout << "FAILED! Unknown exception thrown.\n";
            failed++;
        }
    };

    executeTest("User Hierarchy & Polymorphism Tests", runUserTests);
    executeTest("Vehicle Hierarchy & Rental Cost Polymorphism Tests", runVehicleTests);
    executeTest("Booking & Rental Domain Logic Tests", runBookingRentalTests);
    executeTest("Payment Model & Monetary Logic Tests", runPaymentTests);
    executeTest("Domain Validation & Exception Handling Tests", runValidationTests);

    std::cout << "\n====================================================\n";
    std::cout << " TEST SUMMARY: " << passed << " PASSED, " << failed << " FAILED\n";
    std::cout << "====================================================\n";

    return (failed == 0) ? 0 : 1;
}
