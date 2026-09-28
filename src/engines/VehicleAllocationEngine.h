#pragma once
#include "Vehicle.h"
#include "RecommendationEngine.h"
#include <memory>
#include <vector>
#include <string>

namespace velorent {

struct AllocationResult {
    std::shared_ptr<Vehicle> selectedVehicle = nullptr;
    double allocationScore = 0.0;
    std::vector<std::shared_ptr<Vehicle>> alternativeCandidates;
    std::vector<std::string> explanation;
};

class VehicleAllocationEngine {
public:
    VehicleAllocationEngine() = default;

    /**
     * @brief Deterministically selects the optimal physical vehicle candidate for a booking request.
     */
    AllocationResult allocateVehicle(const std::vector<std::shared_ptr<Vehicle>>& availableFleet,
                                     const UserPreferences& bookingReq);
};

} // namespace velorent
