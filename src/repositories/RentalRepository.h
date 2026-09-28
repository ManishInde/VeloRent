#pragma once
#include "Rental.h"
#include "DatabaseManager.h"
#include <vector>

namespace velorent {

class RentalRepository {
private:
    DatabaseManager& db;

public:
    explicit RentalRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    Rental findById(int rentalId);
    Rental findByBooking(int bookingId);
    std::vector<Rental> findActiveRentals();

    /**
     * @brief Activates a CONFIRMED booking as an active rental via stored procedure sp_confirm_rental.
     */
    int startRental(int bookingId, int startOdometer, int actorId = 0);

    /**
     * @brief Completes a physical rental trip via stored procedure sp_return_vehicle.
     */
    bool completeRental(int rentalId, int returnOdometer, int actorId = 0);

    int save(Rental& rental);
    bool update(const Rental& rental);
};

} // namespace velorent
