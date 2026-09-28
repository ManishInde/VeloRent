#include "PricingRule.h"
#include <sstream>

namespace velorent {

PricingRule::PricingRule(int ruleId,
                         const std::string& ruleName,
                         const std::string& category,
                         double multiplier,
                         bool isActive,
                         const std::string& description)
    : ruleId(ruleId), ruleName(ruleName), category(category),
      multiplier(multiplier), isActive(isActive), description(description)
{
}

std::string PricingRule::toString() const {
    std::ostringstream ss;
    ss << "PricingRule[ID: " << ruleId << ", Name: " << ruleName
       << ", Category: " << category << ", Multiplier: " << multiplier
       << ", Active: " << (isActive ? "YES" : "NO") << "]";
    return ss.str();
}

} // namespace velorent
