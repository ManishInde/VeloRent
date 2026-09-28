#include "Payment.h"
#include "ValidationException.h"
#include <cassert>
#include <iostream>

using namespace velorent;

void runPaymentTests() {
    // 1. Payment creation & rounding
    Payment payment(7001, 5001, 7560.456, PaymentMethod::UPI, PaymentType::RENTAL_FEE, PaymentStatus::COMPLETED, "TXN-998877");
    assert(payment.getId() == 7001);
    assert(payment.getRentalId() == 5001);
    assert(payment.getAmount() == 7560.46); // Rounded to 2 decimals
    assert(payment.getMethod() == PaymentMethod::UPI);
    assert(payment.getStatus() == PaymentStatus::COMPLETED);
    assert(payment.isValid());

    // 2. Negative payment amount validation
    bool thrown = false;
    try {
        Payment badPayment(7002, 5001, -500.0, PaymentMethod::CREDIT_CARD);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);
}
