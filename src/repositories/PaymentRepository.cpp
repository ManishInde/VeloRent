#include "PaymentRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"
#include "DatabaseException.h"

namespace velorent {

PaymentRepository::PaymentRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Payment PaymentRepository::findById(int paymentId) {
    std::string sql = "SELECT * FROM payments WHERE payment_id = ?";
    ResultSet rs = db.executeQuery(sql, {paymentId});
    if (rs.empty()) {
        throw NotFoundException("Payment with ID " + std::to_string(paymentId) + " not found.");
    }
    return RowMappers::mapPayment(rs[0]);
}

std::vector<Payment> PaymentRepository::findByRental(int rentalId) {
    std::string sql = "SELECT * FROM payments WHERE rental_id = ? ORDER BY payment_id ASC";
    ResultSet rs = db.executeQuery(sql, {rentalId});
    std::vector<Payment> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapPayment(row));
    }
    return list;
}

std::vector<Payment> PaymentRepository::findByCustomer(int customerId) {
    std::string sql = "SELECT p.* FROM payments p JOIN rentals r ON p.rental_id = r.rental_id JOIN bookings b ON r.booking_id = b.booking_id WHERE b.customer_id = ? ORDER BY p.payment_id DESC";
    ResultSet rs = db.executeQuery(sql, {customerId});
    std::vector<Payment> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapPayment(row));
    }
    return list;
}

int PaymentRepository::processPayment(int rentalId, double amount, PaymentMethod method,
                                        PaymentType paymentType, int pointsUsed,
                                        const std::string& txnRef, int actorId) {
    std::string sql = "CALL sp_process_payment(?, ?, ?, ?, ?, ?, ?, @new_pay_id)";
    db.executeQuery(sql, {
        rentalId,
        amount,
        EnumUtils::toString(method),
        EnumUtils::toString(paymentType),
        pointsUsed,
        txnRef,
        actorId
    });

    ResultSet rs = db.executeQuery("SELECT @new_pay_id AS new_id");
    if (rs.empty() || rs[0].isNull("new_id")) {
        throw DatabaseException("sp_process_payment failed to return a valid payment ID.");
    }

    return rs[0].getInt("new_id");
}

int PaymentRepository::save(Payment& payment) {
    std::string sql = "INSERT INTO payments (rental_id, amount, payment_method, payment_type, status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        payment.getRentalId(),
        payment.getAmount(),
        EnumUtils::toString(payment.getMethod()),
        EnumUtils::toString(payment.getPaymentType()),
        EnumUtils::toString(payment.getStatus()),
        payment.getTransactionId()
    });
    return static_cast<int>(newId);
}

} // namespace velorent
