#include "VehicleInspection.h"
#include "ValidationUtils.h"
#include <sstream>

namespace velorent {

VehicleInspection::VehicleInspection(int inspectionId,
                                     int vehicleId,
                                     int inspectorId,
                                     const std::string& inspectionDate,
                                     double score,
                                     const std::string& notes,
                                     bool passed)
    : inspectionId(inspectionId), vehicleId(vehicleId), inspectorId(inspectorId),
      inspectionDate(inspectionDate), notes(notes), passed(passed)
{
    setScore(score);
}

std::string VehicleInspection::toString() const {
    std::ostringstream ss;
    ss << "VehicleInspection[ID: " << inspectionId << ", VehicleID: " << vehicleId
       << ", InspectorID: " << inspectorId
       << ", Score: " << score << "/100, Passed: " << (passed ? "YES" : "NO") << "]";
    return ss.str();
}

void VehicleInspection::setScore(double s) {
    ValidationUtils::validateHealthScore(s);
    score = s;
    passed = (score >= 70.0);
}

} // namespace velorent
