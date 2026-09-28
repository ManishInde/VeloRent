#include "VehicleHealthSnapshot.h"
#include "ValidationUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

VehicleHealthSnapshot::VehicleHealthSnapshot(int snapshotId,
                                             int vehicleId,
                                             double healthScore,
                                             HealthComputedBy computedBy,
                                             const std::string& recordedAt)
    : snapshotId(snapshotId), vehicleId(vehicleId),
      healthScore(healthScore), computedBy(computedBy), recordedAt(recordedAt)
{
    ValidationUtils::validateHealthScore(healthScore);
}

std::string VehicleHealthSnapshot::toString() const {
    std::ostringstream ss;
    ss << "VehicleHealthSnapshot[ID: " << snapshotId << ", VehicleID: " << vehicleId
       << ", Score: " << healthScore << "/100, By: " << EnumUtils::toString(computedBy) << "]";
    return ss.str();
}

} // namespace velorent
