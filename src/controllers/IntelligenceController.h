#pragma once
#include "httplib.h"
#include "PricingEngine.h"
#include "RecommendationEngine.h"
#include "VehicleAllocationEngine.h"
#include "VehicleRepository.h"
#include "CustomerRepository.h"
#include "AuthMiddleware.h"

namespace velorent {

class IntelligenceController {
private:
    PricingEngine& pricingEngine;
    RecommendationEngine& recommendationEngine;
    VehicleAllocationEngine& allocationEngine;
    VehicleRepository& vehicleRepo;
    CustomerRepository& customerRepo;
    AuthMiddleware& authMiddleware;

public:
    IntelligenceController(PricingEngine& pricingEngine,
                           RecommendationEngine& recommendationEngine,
                           VehicleAllocationEngine& allocationEngine,
                           VehicleRepository& vehicleRepo,
                           CustomerRepository& customerRepo,
                           AuthMiddleware& authMiddleware);

    void getPricingQuote(const httplib::Request& req, httplib::Response& res);
    void getRecommendations(const httplib::Request& req, httplib::Response& res);
    void allocateVehicle(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
