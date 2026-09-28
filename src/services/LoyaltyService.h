#pragma once
#include "LoyaltyRepository.h"
#include "LoyaltyAccount.h"
#include "LoyaltyTransaction.h"
#include <vector>

namespace velorent {

class LoyaltyService {
private:
    LoyaltyRepository& loyaltyRepo;

public:
    explicit LoyaltyService(LoyaltyRepository& lRepo);

    LoyaltyAccount getAccountByCustomer(int customerId);
    std::vector<LoyaltyTransaction> getTransactionHistory(int customerId);
    LoyaltyTier getCustomerTier(int customerId);
    bool canRedeemPoints(int customerId, int pointsToRedeem);
};

} // namespace velorent
