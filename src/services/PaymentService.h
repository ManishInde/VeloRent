#pragma once
#include "PaymentRepository.h"
#include "RentalRepository.h"
#include "Payment.h"
#include <vector>

namespace velorent {

class PaymentService {
private:
    PaymentRepository& paymentRepo;
    RentalRepository& rentalRepo;

public:
    PaymentService(PaymentRepository& pRepo, RentalRepository& rRepo);

    int processPayment(int rentalId, double amount, PaymentMethod method,
                       PaymentType pType = PaymentType::BASE_RENT,
                       int pointsUsed = 0, const std::string& txnRef = "", int actorId = 0);

    Payment getPaymentById(int paymentId);
    std::vector<Payment> getPaymentsByRental(int rentalId);
    std::vector<Payment> getPaymentsByCustomer(int customerId);

    void validatePayment(double amount, PaymentMethod method, PaymentType type);
};

} // namespace velorent
