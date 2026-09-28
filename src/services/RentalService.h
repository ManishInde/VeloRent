#pragma once
#include "RentalRepository.h"
#include "BookingRepository.h"
#include "VehicleRepository.h"
#include "Rental.h"
#include <memory>
#include <vector>

namespace velorent {

class RentalService {
private:
    RentalRepository& rentalRepo;
    BookingRepository& bookingRepo;
    VehicleRepository& vehicleRepo;

public:
    RentalService(RentalRepository& rRepo,
                  BookingRepository& bRepo,
                  VehicleRepository& vRepo);

    int startRental(int bookingId, int startOdometer, int actorId = 0);
    bool returnVehicle(int rentalId, int returnOdometer, int actorId = 0);

    Rental getRentalById(int rentalId);
    Rental getRentalByBooking(int bookingId);
    std::vector<Rental> getActiveRentals();
    
    int calculateDistanceTravelled(int rentalId);
};

} // namespace velorent
