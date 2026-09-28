#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a vehicle feature specification in the database catalog.
 */
class VehicleFeature : public IEntity {
private:
    int featureId;
    std::string featureName;
    std::string category;
    std::string description;

public:
    VehicleFeature(int featureId,
                   const std::string& featureName,
                   const std::string& category = "GENERAL",
                   const std::string& description = "");

    int getId() const override { return featureId; }
    std::string toString() const override;

    const std::string& getFeatureName() const { return featureName; }
    const std::string& getCategory() const { return category; }
    const std::string& getDescription() const { return description; }
};

} // namespace velorent
