#include "RentalService.h"
#include "RentalNotActiveException.h"
#include "InvalidBookingException.h"
#include "NotFoundException.h"
#include "ValidationException.h"
#include "Logger.h"
#include "EnumUtils.h"

namespace velorent {

RentalService::RentalService(RentalRepository& rRepo,
                             BookingRepository& bRepo,
                             VehicleRepository& vRepo)
    : rentalRepo(rRepo), bookingRepo(bRepo), vehicleRepo(vRepo)
{
}

int RentalService::startRental(int bookingId, int startOdometer, int actorId) {
    Logger::info("RentalService: Activating rental for Booking ID " + std::to_string(bookingId));
    auto booking = bookingRepo.findById(bookingId);
    if (booking.getStatus() != BookingStatus::CONFIRMED) {
        throw InvalidBookingException("Only CONFIRMED bookings can be converted to active rentals.");
    }
    if (startOdometer < 0) {
        throw ValidationException("Starting odometer reading cannot be negative.");
    }

    int rentalId = rentalRepo.startRental(bookingId, startOdometer, actorId);
    Logger::info("RentalService: Rental activated successfully with Rental ID " + std::to_string(rentalId));
    return rentalId;
}

bool RentalService::returnVehicle(int rentalId, int returnOdometer, int actorId) {
    Logger::info("RentalService: Processing return for Rental ID " + std::to_string(rentalId));
    auto rental = rentalRepo.findById(rentalId);
    if (rental.getStatus() != RentalStatus::ACTIVE && rental.getStatus() != RentalStatus::OVERDUE) {
        throw RentalNotActiveException("Rental ID " + std::to_string(rentalId) + " is not active for return.");
    }
    if (returnOdometer < rental.getStartingOdometer()) {
        throw ValidationException("Return odometer (" + std::to_string(returnOdometer) +
                                  ") cannot be less than starting odometer (" +
                                  std::to_string(rental.getStartingOdometer()) + ").");
    }

    bool ok = rentalRepo.completeRental(rentalId, returnOdometer, actorId);
    Logger::info("RentalService: Vehicle returned successfully for Rental ID " + std::to_string(rentalId));
    return ok;
}

Rental RentalService::getRentalById(int rentalId) {
    return rentalRepo.findById(rentalId);
}

Rental RentalService::getRentalByBooking(int bookingId) {
    return rentalRepo.findByBooking(bookingId);
}

std::vector<Rental> RentalService::getActiveRentals() {
    return rentalRepo.findActiveRentals();
}

int RentalService::calculateDistanceTravelled(int rentalId) {
    auto r = rentalRepo.findById(rentalId);
    if (r.getEndingOdometer() <= 0) return 0;
    return r.getEndingOdometer() - r.getStartingOdometer();
}

} // namespace velorent
