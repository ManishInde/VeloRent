#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a financial payment transaction for a rental.
 * OOP Concepts: Encapsulation, Exact monetary representation using double rounded to 2 decimals.
 */
class Payment : public IEntity {
private:
    int id;
    int rentalId;
    double amount;
    PaymentMethod method;
    PaymentStatus status;
    PaymentType paymentType;
    std::string transactionId;
    std::string createdAt;

public:
    Payment(int id,
            int rentalId,
            double amount,
            PaymentMethod method,
            PaymentType paymentType = PaymentType::RENTAL_FEE,
            PaymentStatus status = PaymentStatus::COMPLETED,
            const std::string& transactionId = "",
            const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    bool isValid() const { return amount > 0.0; }

    // Getters
    int getRentalId() const { return rentalId; }
    double getAmount() const { return amount; }
    PaymentMethod getMethod() const { return method; }
    PaymentStatus getStatus() const { return status; }
    PaymentType getPaymentType() const { return paymentType; }
    const std::string& getTransactionId() const { return transactionId; }
    const std::string& getCreatedAt() const { return createdAt; }

    // Mutators with validation
    void setAmount(double amt);
    void setStatus(PaymentStatus newStatus) { status = newStatus; }
    void setMethod(PaymentMethod newMethod) { method = newMethod; }
    void setTransactionId(const std::string& txId) { transactionId = txId; }
};

} // namespace velorent
