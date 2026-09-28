#include <iostream>

// Declarations of individual engine test suite runners
void runPricingEngineTests();
void runRecommendationEngineTests();
void runVehicleHealthEngineTests();
void runVehicleAllocationEngineTests();
void runLoyaltyEngineTests();
void runCustomerRiskEngineTests();
void runFleetIntelligenceEngineTests();

int main() {
    std::cout << "============================================" << std::endl;
    std::cout << "   VeloRent Phase 5 Engine Unit Test Suite  " << std::endl;
    std::cout << "============================================" << std::endl << std::endl;

    try {
        runPricingEngineTests();
        runRecommendationEngineTests();
        runVehicleHealthEngineTests();
        runVehicleAllocationEngineTests();
        runLoyaltyEngineTests();
        runCustomerRiskEngineTests();
        runFleetIntelligenceEngineTests();

        std::cout << "============================================" << std::endl;
        std::cout << "  ALL 7 INTELLIGENCE ENGINE TESTS PASSED!  " << std::endl;
        std::cout << "============================================" << std::endl;
        return 0;
    } catch (const std::exception& ex) {
        std::cerr << "[TEST FAILED] Exception: " << ex.what() << std::endl;
        return 1;
    } catch (...) {
        std::cerr << "[TEST FAILED] Unknown exception occurred." << std::endl;
        return 1;
    }
}
