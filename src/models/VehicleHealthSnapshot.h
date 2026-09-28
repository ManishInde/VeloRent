#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a historical time-series snapshot of a vehicle's computed health score.
 */
class VehicleHealthSnapshot : public IEntity {
private:
    int snapshotId;
    int vehicleId;
    double healthScore;
    HealthComputedBy computedBy;
    std::string recordedAt;

public:
    VehicleHealthSnapshot(int snapshotId,
                          int vehicleId,
                          double healthScore,
                          HealthComputedBy computedBy = HealthComputedBy::ENGINE,
                          const std::string& recordedAt = "");

    int getId() const override { return snapshotId; }
    std::string toString() const override;

    int getVehicleId() const { return vehicleId; }
    double getHealthScore() const { return healthScore; }
    HealthComputedBy getComputedBy() const { return computedBy; }
    const std::string& getRecordedAt() const { return recordedAt; }
};

} // namespace velorent
