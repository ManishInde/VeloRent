#include "LoyaltyRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"

namespace velorent {

LoyaltyRepository::LoyaltyRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

LoyaltyAccount LoyaltyRepository::findAccountByCustomer(int customerId) {
    std::string sql = "SELECT * FROM loyalty_accounts WHERE customer_id = ?";
    ResultSet rs = db.executeQuery(sql, {customerId});
    if (rs.empty()) {
        throw NotFoundException("Loyalty account for Customer ID " + std::to_string(customerId) + " not found.");
    }
    return RowMappers::mapLoyaltyAccount(rs[0]);
}

std::vector<LoyaltyTransaction> LoyaltyRepository::findTransactions(int accountId) {
    std::string sql = "SELECT * FROM loyalty_transactions WHERE loyalty_id = ? ORDER BY txn_id DESC";
    ResultSet rs = db.executeQuery(sql, {accountId});
    std::vector<LoyaltyTransaction> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapLoyaltyTransaction(row));
    }
    return list;
}

int LoyaltyRepository::saveTransaction(LoyaltyTransaction& transaction) {
    std::string sql = "INSERT INTO loyalty_transactions (loyalty_id, txn_type, points, source, reference_id) VALUES (?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        transaction.getAccountId(),
        EnumUtils::toString(transaction.getType()),
        transaction.getPoints(),
        transaction.getReason(),
        transaction.getReferenceId() == 0 ? DbValue(nullptr) : DbValue(transaction.getReferenceId())
    });
    return static_cast<int>(newId);
}

bool LoyaltyRepository::updateAccount(const LoyaltyAccount& account) {
    std::string sql = "UPDATE loyalty_accounts SET points_balance = ?, total_points_earned = ?, tier = ? WHERE loyalty_id = ?";
    uint64_t rows = db.executeUpdate(sql, {
        account.getCurrentPoints(),
        account.getTotalPointsEarned(),
        EnumUtils::toString(account.getTier()),
        account.getId()
    });
    return rows > 0;
}

} // namespace velorent
