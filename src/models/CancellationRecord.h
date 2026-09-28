#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a formal booking cancellation audit record.
 */
class CancellationRecord : public IEntity {
private:
    int id;
    int bookingId;
    int cancelledBy;
    std::string reason;
    double refundAmount;
    RefundStatus refundStatus;
    std::string cancelledAt;

public:
    CancellationRecord(int id,
                       int bookingId,
                       int cancelledBy,
                       const std::string& reason,
                       double refundAmount = 0.0,
                       RefundStatus refundStatus = RefundStatus::NOT_APPLICABLE,
                       const std::string& cancelledAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    int getBookingId() const { return bookingId; }
    int getCancelledBy() const { return cancelledBy; }
    const std::string& getReason() const { return reason; }
    double getRefundAmount() const { return refundAmount; }
    RefundStatus getRefundStatus() const { return refundStatus; }
    const std::string& getCancelledAt() const { return cancelledAt; }

    void setRefundAmount(double amount);
    void setRefundStatus(RefundStatus status) { refundStatus = status; }
};

} // namespace velorent
