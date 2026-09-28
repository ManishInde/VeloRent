#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Dynamic pricing rule configuration entity.
 */
class PricingRule : public IEntity {
private:
    int ruleId;
    std::string ruleName;
    std::string category;
    double multiplier;
    bool isActive;
    std::string description;

public:
    PricingRule(int ruleId,
                const std::string& ruleName,
                const std::string& category,
                double multiplier,
                bool isActive = true,
                const std::string& description = "");

    int getId() const override { return ruleId; }
    std::string toString() const override;

    const std::string& getRuleName() const { return ruleName; }
    const std::string& getCategory() const { return category; }
    double getMultiplier() const { return multiplier; }
    bool getIsActive() const { return isActive; }
    const std::string& getDescription() const { return description; }

    void setIsActive(bool active) { isActive = active; }
    void setMultiplier(double mult) { multiplier = mult; }
};

} // namespace velorent
