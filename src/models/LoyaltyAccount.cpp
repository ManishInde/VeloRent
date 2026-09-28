#include "LoyaltyAccount.h"
#include "ValidationException.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

LoyaltyAccount::LoyaltyAccount(int accountId,
                               int customerId,
                               int currentPoints,
                               int totalPointsEarned,
                               LoyaltyTier tier,
                               const std::string& lastUpdated)
    : accountId(accountId), customerId(customerId),
      currentPoints(currentPoints), totalPointsEarned(totalPointsEarned),
      tier(tier), lastUpdated(lastUpdated)
{
    recalculateTier();
}

std::string LoyaltyAccount::toString() const {
    std::ostringstream ss;
    ss << "LoyaltyAccount[ID: " << accountId << ", CustomerID: " << customerId
       << ", CurrentPoints: " << currentPoints
       << ", LifetimePoints: " << totalPointsEarned
       << ", Tier: " << EnumUtils::toString(tier) << "]";
    return ss.str();
}

void LoyaltyAccount::addPoints(int pts) {
    if (pts <= 0) {
        throw ValidationException("Points added must be positive.");
    }
    currentPoints += pts;
    totalPointsEarned += pts;
    recalculateTier();
}

void LoyaltyAccount::deductPoints(int pts) {
    if (pts <= 0) {
        throw ValidationException("Points deducted must be positive.");
    }
    if (pts > currentPoints) {
        throw ValidationException("Insufficient loyalty points balance.");
    }
    currentPoints -= pts;
}

void LoyaltyAccount::recalculateTier() {
    if (totalPointsEarned >= 15000) {
        tier = LoyaltyTier::PLATINUM;
    } else if (totalPointsEarned >= 5000) {
        tier = LoyaltyTier::GOLD;
    } else if (totalPointsEarned >= 1000) {
        tier = LoyaltyTier::SILVER;
    } else {
        tier = LoyaltyTier::BRONZE;
    }
}

} // namespace velorent
