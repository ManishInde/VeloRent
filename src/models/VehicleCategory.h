#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a vehicle category classification (e.g., Hatchback, Sedan, SUV, EV).
 */
class VehicleCategory : public IEntity {
private:
    int categoryId;
    std::string categoryName;
    std::string description;
    double baseDailyRateFactor;

public:
    VehicleCategory(int categoryId,
                    const std::string& categoryName,
                    const std::string& description = "",
                    double baseDailyRateFactor = 1.0);

    int getId() const override { return categoryId; }
    std::string toString() const override;

    const std::string& getCategoryName() const { return categoryName; }
    const std::string& getDescription() const { return description; }
    double getBaseDailyRateFactor() const { return baseDailyRateFactor; }
};

} // namespace velorent
