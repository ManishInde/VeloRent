#include "LoyaltyService.h"
#include "Logger.h"

namespace velorent {

LoyaltyService::LoyaltyService(LoyaltyRepository& lRepo)
    : loyaltyRepo(lRepo)
{
}

LoyaltyAccount LoyaltyService::getAccountByCustomer(int customerId) {
    Logger::info("LoyaltyService: Fetching loyalty account for Customer ID " + std::to_string(customerId));
    return loyaltyRepo.findAccountByCustomer(customerId);
}

std::vector<LoyaltyTransaction> LoyaltyService::getTransactionHistory(int customerId) {
    Logger::info("LoyaltyService: Fetching transaction history for Customer ID " + std::to_string(customerId));
    auto account = loyaltyRepo.findAccountByCustomer(customerId);
    return loyaltyRepo.findTransactions(account.getId());
}

LoyaltyTier LoyaltyService::getCustomerTier(int customerId) {
    auto account = loyaltyRepo.findAccountByCustomer(customerId);
    return account.getTier();
}

bool LoyaltyService::canRedeemPoints(int customerId, int pointsToRedeem) {
    if (pointsToRedeem <= 0) return false;
    auto account = loyaltyRepo.findAccountByCustomer(customerId);
    return account.getCurrentPoints() >= pointsToRedeem;
}

} // namespace velorent
