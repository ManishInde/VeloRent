#include "VehicleFeature.h"
#include <sstream>

namespace velorent {

VehicleFeature::VehicleFeature(int featureId,
                               const std::string& featureName,
                               const std::string& category,
                               const std::string& description)
    : featureId(featureId), featureName(featureName),
      category(category), description(description)
{
}

std::string VehicleFeature::toString() const {
    std::ostringstream ss;
    ss << "VehicleFeature[ID: " << featureId << ", Name: " << featureName
       << ", Category: " << category << "]";
    return ss.str();
}

} // namespace velorent
