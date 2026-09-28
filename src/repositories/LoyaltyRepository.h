#pragma once
#include "LoyaltyAccount.h"
#include "LoyaltyTransaction.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class LoyaltyRepository {
private:
    DatabaseManager& db;

public:
    explicit LoyaltyRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    LoyaltyAccount findAccountByCustomer(int customerId);
    std::vector<LoyaltyTransaction> findTransactions(int accountId);

    int saveTransaction(LoyaltyTransaction& transaction);
    bool updateAccount(const LoyaltyAccount& account);
};

} // namespace velorent
