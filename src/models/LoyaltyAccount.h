#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a customer's loyalty account.
 * Tier representation: BRONZE, SILVER, GOLD, PLATINUM.
 */
class LoyaltyAccount : public IEntity {
private:
    int accountId;
    int customerId;
    int currentPoints;
    int totalPointsEarned;
    LoyaltyTier tier;
    std::string lastUpdated;

public:
    LoyaltyAccount(int accountId,
                   int customerId,
                   int currentPoints = 0,
                   int totalPointsEarned = 0,
                   LoyaltyTier tier = LoyaltyTier::BRONZE,
                   const std::string& lastUpdated = "");

    int getId() const override { return accountId; }
    std::string toString() const override;

    // Getters
    int getCustomerId() const { return customerId; }
    int getCurrentPoints() const { return currentPoints; }
    int getTotalPointsEarned() const { return totalPointsEarned; }
    LoyaltyTier getTier() const { return tier; }
    const std::string& getLastUpdated() const { return lastUpdated; }

    // Mutators
    void addPoints(int pts);
    void deductPoints(int pts);
    void recalculateTier();
    void setTier(LoyaltyTier newTier) { tier = newTier; }
};

} // namespace velorent
