#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents an individual loyalty points transaction log entry.
 */
class LoyaltyTransaction : public IEntity {
private:
    int transactionId;
    int accountId;
    LoyaltyTransactionType type;
    int points;
    std::string reason;
    int referenceId;
    std::string createdAt;

public:
    LoyaltyTransaction(int transactionId,
                       int accountId,
                       LoyaltyTransactionType type,
                       int points,
                       const std::string& reason = "",
                       int referenceId = 0,
                       const std::string& createdAt = "");

    int getId() const override { return transactionId; }
    std::string toString() const override;

    int getAccountId() const { return accountId; }
    LoyaltyTransactionType getType() const { return type; }
    int getPoints() const { return points; }
    const std::string& getReason() const { return reason; }
    int getReferenceId() const { return referenceId; }
    const std::string& getCreatedAt() const { return createdAt; }
};

} // namespace velorent
