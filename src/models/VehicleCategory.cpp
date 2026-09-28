#include "VehicleCategory.h"
#include <sstream>

namespace velorent {

VehicleCategory::VehicleCategory(int categoryId,
                                 const std::string& categoryName,
                                 const std::string& description,
                                 double baseDailyRateFactor)
    : categoryId(categoryId), categoryName(categoryName),
      description(description), baseDailyRateFactor(baseDailyRateFactor)
{
}

std::string VehicleCategory::toString() const {
    std::ostringstream ss;
    ss << "VehicleCategory[ID: " << categoryId << ", Name: " << categoryName
       << ", Factor: " << baseDailyRateFactor << "]";
    return ss.str();
}

} // namespace velorent
