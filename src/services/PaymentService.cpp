#include "PaymentService.h"
#include "PaymentException.h"
#include "NotFoundException.h"
#include "Logger.h"

namespace velorent {

PaymentService::PaymentService(PaymentRepository& pRepo, RentalRepository& rRepo)
    : paymentRepo(pRepo), rentalRepo(rRepo)
{
}

int PaymentService::processPayment(int rentalId, double amount, PaymentMethod method,
                                   PaymentType pType, int pointsUsed,
                                   const std::string& txnRef, int actorId) {
    Logger::info("PaymentService: Processing payment for Rental ID " + std::to_string(rentalId) + " Amount: INR " + std::to_string(amount));
    
    // Verify rental exists
    rentalRepo.findById(rentalId);

    validatePayment(amount, method, pType);

    // Duplicate payment protection
    auto existingPayments = paymentRepo.findByRental(rentalId);
    for (const auto& p : existingPayments) {
        if (!txnRef.empty() && p.getTransactionId() == txnRef) {
            throw PaymentException("Duplicate payment detected: transaction reference " + txnRef + " has already been processed.");
        }
        if (p.getStatus() == PaymentStatus::COMPLETED &&
            (pType == PaymentType::BASE_RENT || pType == PaymentType::RENTAL_FEE) &&
            (p.getPaymentType() == PaymentType::BASE_RENT || p.getPaymentType() == PaymentType::RENTAL_FEE)) {
            throw PaymentException("Base rental fee has already been paid for this rental.");
        }
    }

    int payId = paymentRepo.processPayment(rentalId, amount, method, pType, pointsUsed, txnRef, actorId);
    Logger::info("PaymentService: Payment completed with Payment ID " + std::to_string(payId));
    return payId;
}

Payment PaymentService::getPaymentById(int paymentId) {
    return paymentRepo.findById(paymentId);
}

std::vector<Payment> PaymentService::getPaymentsByRental(int rentalId) {
    return paymentRepo.findByRental(rentalId);
}

std::vector<Payment> PaymentService::getPaymentsByCustomer(int customerId) {
    return paymentRepo.findByCustomer(customerId);
}

void PaymentService::validatePayment(double amount, PaymentMethod method, PaymentType type) {
    if (type != PaymentType::REFUND && amount <= 0.0) {
        throw PaymentException("Payment amount must be positive for non-refund transactions.");
    }
    if (type == PaymentType::REFUND && amount >= 0.0) {
        throw PaymentException("Refund amount must be negative.");
    }
}

} // namespace velorent
