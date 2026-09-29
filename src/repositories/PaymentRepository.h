#pragma once
#include "Payment.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class PaymentRepository {
private:
    DatabaseManager& db;

public:
    explicit PaymentRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Payment findById(int paymentId);
    std::vector<Payment> findAll();
    std::vector<Payment> findByRental(int rentalId);
    std::vector<Payment> findByCustomer(int customerId);

    /**
     * @brief Processes a payment using stored procedure sp_process_payment.
     */
    int processPayment(int rentalId, double amount, PaymentMethod method,
                       PaymentType paymentType = PaymentType::RENTAL_FEE,
                       int pointsUsed = 0, const std::string& txnRef = "", int actorId = 0);

    int save(Payment& payment);
};

} // namespace velorent
