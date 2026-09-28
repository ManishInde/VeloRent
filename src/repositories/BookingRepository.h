#pragma once
#include "Booking.h"
#include "DatabaseManager.h"
#include <memory>
#include <vector>

namespace velorent {

class BookingRepository {
private:
    DatabaseManager& db;

public:
    explicit BookingRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Booking findById(int bookingId);
    std::vector<Booking> findByCustomer(int customerId);
    std::vector<Booking> findByVehicle(int vehicleId);
    std::vector<Booking> findActiveBookings();

    /**
     * @brief Creates a booking by invoking the stored procedure sp_create_booking.
     * The stored procedure enforces vehicle availability and date overlap checks.
     * @return Newly created booking_id.
     */
    int createBooking(int customerId, int vehicleId, const std::string& startDate,
                      const std::string& endDate, double quotedPrice,
                      double demandFactor = 1.0, int actorId = 0);

    /**
     * @brief Cancels a booking by invoking the stored procedure sp_cancel_booking.
     */
    bool cancelBooking(int bookingId, int cancelledBy, const std::string& reason, double refundAmount = 0.0);

    int save(Booking& booking);
    bool updateStatus(int bookingId, BookingStatus status);
};

} // namespace velorent
