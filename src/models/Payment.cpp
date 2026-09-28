#include "Payment.h"
#include "ValidationUtils.h"
#include "MoneyUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

Payment::Payment(int id,
                 int rentalId,
                 double amount,
                 PaymentMethod method,
                 PaymentType paymentType,
                 PaymentStatus status,
                 const std::string& transactionId,
                 const std::string& createdAt)
    : id(id), rentalId(rentalId), method(method),
      status(status), paymentType(paymentType),
      transactionId(transactionId), createdAt(createdAt)
{
    setAmount(amount);
}

std::string Payment::toString() const {
    std::ostringstream ss;
    ss << "Payment[ID: " << id << ", RentalID: " << rentalId
       << ", Amount: " << MoneyUtils::formatINR(amount)
       << ", Method: " << EnumUtils::toString(method)
       << ", Type: " << EnumUtils::toString(paymentType)
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

void Payment::setAmount(double amt) {
    ValidationUtils::validatePositiveRate(amt, "Payment Amount");
    amount = MoneyUtils::roundToTwoDecimals(amt);
}

} // namespace velorent
