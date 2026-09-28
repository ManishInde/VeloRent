#include "RentalRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"
#include "DatabaseException.h"

namespace velorent {

RentalRepository::RentalRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

Rental RentalRepository::findById(int rentalId) {
    std::string sql = "SELECT * FROM rentals WHERE rental_id = ?";
    ResultSet rs = db.executeQuery(sql, {rentalId});
    if (rs.empty()) {
        throw NotFoundException("Rental with ID " + std::to_string(rentalId) + " not found.");
    }
    return RowMappers::mapRental(rs[0]);
}

Rental RentalRepository::findByBooking(int bookingId) {
    std::string sql = "SELECT * FROM rentals WHERE booking_id = ?";
    ResultSet rs = db.executeQuery(sql, {bookingId});
    if (rs.empty()) {
        throw NotFoundException("Rental for Booking ID " + std::to_string(bookingId) + " not found.");
    }
    return RowMappers::mapRental(rs[0]);
}

std::vector<Rental> RentalRepository::findActiveRentals() {
    std::string sql = "SELECT * FROM rentals WHERE status IN ('ACTIVE', 'OVERDUE') ORDER BY actual_start ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<Rental> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapRental(row));
    }
    return list;
}

int RentalRepository::startRental(int bookingId, int startOdometer, int actorId) {
    std::string sql = "CALL sp_confirm_rental(?, ?, ?, @new_rental_id)";
    db.executeQuery(sql, {bookingId, startOdometer, actorId});

    ResultSet rs = db.executeQuery("SELECT @new_rental_id AS new_id");
    if (rs.empty() || rs[0].isNull("new_id")) {
        throw DatabaseException("sp_confirm_rental failed to return a valid rental ID.");
    }

    return rs[0].getInt("new_id");
}

bool RentalRepository::completeRental(int rentalId, int returnOdometer, int actorId) {
    std::string sql = "CALL sp_return_vehicle(?, ?, ?)";
    db.executeQuery(sql, {rentalId, returnOdometer, actorId});
    return true;
}

int RentalRepository::save(Rental& rental) {
    std::string sql = "INSERT INTO rentals (booking_id, actual_start, start_odometer, status) VALUES (?, ?, ?, ?)";
    uint64_t newId = db.executeInsert(sql, {
        rental.getBookingId(),
        rental.getActualStart(),
        rental.getStartingOdometer(),
        EnumUtils::toString(rental.getStatus())
    });
    return static_cast<int>(newId);
}

bool RentalRepository::update(const Rental& rental) {
    std::string sql = "UPDATE rentals SET actual_end = ?, end_odometer = ?, status = ? WHERE rental_id = ?";
    uint64_t rows = db.executeUpdate(sql, {
        rental.getActualReturn().empty() ? DbValue(nullptr) : DbValue(rental.getActualReturn()),
        rental.getEndingOdometer(),
        EnumUtils::toString(rental.getStatus()),
        rental.getId()
    });
    return rows > 0;
}

} // namespace velorent
