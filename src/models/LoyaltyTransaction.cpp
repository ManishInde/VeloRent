#include "LoyaltyTransaction.h"
#include "ValidationUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

LoyaltyTransaction::LoyaltyTransaction(int transactionId,
                                       int accountId,
                                       LoyaltyTransactionType type,
                                       int points,
                                       const std::string& reason,
                                       int referenceId,
                                       const std::string& createdAt)
    : transactionId(transactionId), accountId(accountId), type(type),
      points(points), reason(reason), referenceId(referenceId), createdAt(createdAt)
{
    ValidationUtils::validateNonNegativeAmount(points, "Loyalty Transaction Points");
}

std::string LoyaltyTransaction::toString() const {
    std::ostringstream ss;
    ss << "LoyaltyTransaction[ID: " << transactionId << ", AccountID: " << accountId
       << ", Type: " << EnumUtils::toString(type)
       << ", Points: " << points << ", Reason: " << reason << "]";
    return ss.str();
}

} // namespace velorent
