#include "CancellationRecord.h"
#include "ValidationUtils.h"
#include "MoneyUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

CancellationRecord::CancellationRecord(int id,
                                       int bookingId,
                                       int cancelledBy,
                                       const std::string& reason,
                                       double refundAmount,
                                       RefundStatus refundStatus,
                                       const std::string& cancelledAt)
    : id(id), bookingId(bookingId), cancelledBy(cancelledBy),
      reason(reason), refundStatus(refundStatus), cancelledAt(cancelledAt)
{
    setRefundAmount(refundAmount);
}

std::string CancellationRecord::toString() const {
    std::ostringstream ss;
    ss << "CancellationRecord[ID: " << id << ", BookingID: " << bookingId
       << ", CancelledBy: " << cancelledBy
       << ", RefundAmount: INR " << refundAmount
       << ", RefundStatus: " << EnumUtils::toString(refundStatus) << "]";
    return ss.str();
}

void CancellationRecord::setRefundAmount(double amount) {
    ValidationUtils::validateNonNegativeAmount(amount, "Refund Amount");
    refundAmount = MoneyUtils::roundToTwoDecimals(amount);
}

} // namespace velorent
