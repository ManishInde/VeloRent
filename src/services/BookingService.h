#pragma once
#include "BookingRepository.h"
#include "CustomerRepository.h"
#include "VehicleRepository.h"
#include "Booking.h"
#include <memory>
#include <vector>

namespace velorent {

class BookingService {
private:
    BookingRepository& bookingRepo;
    CustomerRepository& customerRepo;
    VehicleRepository& vehicleRepo;

public:
    BookingService(BookingRepository& bRepo,
                   CustomerRepository& cRepo,
                   VehicleRepository& vRepo);

    /**
     * @brief Application-level preliminary quote calculation (days * baseRate).
     */
    double calculatePreliminaryQuote(int vehicleId, const std::string& startDate, const std::string& endDate);

    /**
     * @brief Performs application validation then delegates transactional creation to sp_create_booking.
     */
    int createBooking(int customerId, int vehicleId, const std::string& startDate,
                      const std::string& endDate, double demandFactor = 1.0, int actorId = 0);

    bool cancelBooking(int bookingId, int cancelledBy, const std::string& reason, double refundAmount = 0.0);

    Booking getBookingById(int bookingId);
    std::vector<Booking> getCustomerBookings(int customerId);
    std::vector<Booking> getVehicleBookings(int vehicleId);
    std::vector<Booking> getActiveBookings();

private:
    void validateBookingRequest(int customerId, int vehicleId, const std::string& startDate, const std::string& endDate);
};

} // namespace velorent
