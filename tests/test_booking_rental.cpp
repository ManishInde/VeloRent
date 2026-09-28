#include "Booking.h"
#include "Rental.h"
#include "ValidationException.h"
#include <cassert>
#include <iostream>

using namespace velorent;

void runBookingRentalTests() {
    // 1. Booking creation & duration calculation
    Booking booking(1001, 1, 101, "2026-10-01", "2026-10-05", 7200.0);
    assert(booking.getId() == 1001);
    assert(booking.getCustomerId() == 1);
    assert(booking.getVehicleId() == 101);
    assert(booking.getDurationDays() == 4);
    assert(booking.getQuotedPrice() == 7200.0);
    assert(booking.getStatus() == BookingStatus::CONFIRMED);

    // 2. Booking invalid date validation (end before start)
    bool thrown = false;
    try {
        Booking invalidBooking(1002, 1, 101, "2026-10-10", "2026-10-05", 5000.0);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);

    // 3. Rental trip initialization & distance calculation
    Rental rental(5001, 1001, "2026-10-01 10:00:00", 15000);
    assert(rental.getId() == 5001);
    assert(rental.getBookingId() == 1001);
    assert(rental.getStartingOdometer() == 15000);
    assert(rental.getStatus() == RentalStatus::ACTIVE);

    // Complete trip with final odometer reading
    rental.completeRental("2026-10-05 11:30:00", 15450);
    assert(rental.getEndingOdometer() == 15450);
    assert(rental.calculateDistanceTravelled() == 450);
    assert(rental.getStatus() == RentalStatus::COMPLETED);

    // 4. Rental odometer validation (ending < starting must throw)
    thrown = false;
    try {
        Rental badRental(5002, 1001, "2026-10-01 10:00:00", 20000);
        badRental.completeRental("2026-10-05 11:30:00", 19500);
    } catch (const ValidationException&) {
        thrown = true;
    }
    assert(thrown);
}
