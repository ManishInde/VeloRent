#include "BookingRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"
#include "DatabaseException.h"

namespace velorent {

BookingRepository::BookingRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Booking BookingRepository::findById(int bookingId) {
    std::string sql = "SELECT * FROM bookings WHERE booking_id = ?";
    ResultSet rs = db.executeQuery(sql, {bookingId});
    if (rs.empty()) {
        throw NotFoundException("Booking with ID " + std::to_string(bookingId) + " not found.");
    }
    return RowMappers::mapBooking(rs[0]);
}

std::vector<Booking> BookingRepository::findByCustomer(int customerId) {
    std::string sql = "SELECT * FROM bookings WHERE customer_id = ? ORDER BY booking_id DESC";
    ResultSet rs = db.executeQuery(sql, {customerId});
    std::vector<Booking> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapBooking(row));
    }
    return list;
}

std::vector<Booking> BookingRepository::findByVehicle(int vehicleId) {
    std::string sql = "SELECT * FROM bookings WHERE vehicle_id = ? ORDER BY booking_id DESC";
    ResultSet rs = db.executeQuery(sql, {vehicleId});
    std::vector<Booking> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapBooking(row));
    }
    return list;
}

std::vector<Booking> BookingRepository::findActiveBookings() {
    std::string sql = "SELECT * FROM bookings WHERE status IN ('CONFIRMED', 'ACTIVE') ORDER BY start_date ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<Booking> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapBooking(row));
    }
    return list;
}

int BookingRepository::createBooking(int customerId, int vehicleId, const std::string& startDate,
                                      const std::string& endDate, double quotedPrice,
                                      double demandFactor, int actorId) {
    if (actorId == 0) actorId = customerId;

    // Use MySQL Session User Variable to capture OUT parameter from sp_create_booking
    std::string callSql = "CALL sp_create_booking(?, ?, ?, ?, ?, ?, ?, @new_id)";
    db.executeQuery(callSql, {customerId, vehicleId, startDate, endDate, quotedPrice, demandFactor, actorId});

    ResultSet rs = db.executeQuery("SELECT @new_id AS new_id");
    if (rs.empty() || rs[0].isNull("new_id")) {
        throw DatabaseException("sp_create_booking failed to return a valid booking ID.");
    }

    return rs[0].getInt("new_id");
}

bool BookingRepository::cancelBooking(int bookingId, int cancelledBy, const std::string& reason, double refundAmount) {
    std::string callSql = "CALL sp_cancel_booking(?, ?, ?, ?)";
    db.executeQuery(callSql, {bookingId, cancelledBy, reason, refundAmount});
    return true;
}

int BookingRepository::save(Booking& booking) {
    std::string sql = "INSERT INTO bookings (customer_id, vehicle_id, start_date, end_date, quoted_price, status) VALUES (?, ?, ?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        booking.getCustomerId(),
        booking.getVehicleId(),
        booking.getStartDate(),
        booking.getEndDate(),
        booking.getQuotedPrice(),
        EnumUtils::toString(booking.getStatus())
    });
    return static_cast<int>(newId);
}

bool BookingRepository::updateStatus(int bookingId, BookingStatus status) {
    std::string sql = "UPDATE bookings SET status = ? WHERE booking_id = ?";
    uint64_t rows = db.executeUpdate(sql, {EnumUtils::toString(status), bookingId});
    return rows > 0;
}

} // namespace velorent
