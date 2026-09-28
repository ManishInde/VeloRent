#include "BookingService.h"
#include "InvalidBookingException.h"
#include "VehicleUnavailableException.h"
#include "NotFoundException.h"
#include "DateUtils.h"
#include "Logger.h"
#include "EnumUtils.h"

namespace velorent {

BookingService::BookingService(BookingRepository& bRepo,
                               CustomerRepository& cRepo,
                               VehicleRepository& vRepo)
    : bookingRepo(bRepo), customerRepo(cRepo), vehicleRepo(vRepo)
{
}

double BookingService::calculatePreliminaryQuote(int vehicleId, const std::string& startDate, const std::string& endDate) {
    auto vehicle = vehicleRepo.findById(vehicleId);
    if (!vehicle) {
        throw NotFoundException("Vehicle ID " + std::to_string(vehicleId) + " not found.");
    }
    int days = DateUtils::daysBetween(startDate, endDate);
    if (days <= 0) days = 1;
    return days * vehicle->getBaseRentalRate();
}

int BookingService::createBooking(int customerId, int vehicleId, const std::string& startDate,
                                   const std::string& endDate, double demandFactor, int actorId) {
    Logger::info("BookingService: Request to create booking for Customer ID " + std::to_string(customerId) +
                 " and Vehicle ID " + std::to_string(vehicleId) + " (" + startDate + " to " + endDate + ")");

    // 1. Application-level validations
    validateBookingRequest(customerId, vehicleId, startDate, endDate);

    // 2. Compute quote
    double quotedPrice = calculatePreliminaryQuote(vehicleId, startDate, endDate) * demandFactor;

    // 3. Delegate to DB repository calling stored procedure sp_create_booking
    int newBookingId = bookingRepo.createBooking(customerId, vehicleId, startDate, endDate, quotedPrice, demandFactor, actorId);
    Logger::info("BookingService: Booking successfully created with ID " + std::to_string(newBookingId));
    return newBookingId;
}

bool BookingService::cancelBooking(int bookingId, int cancelledBy, const std::string& reason, double refundAmount) {
    Logger::info("BookingService: Cancelling booking ID " + std::to_string(bookingId) + " by user " + std::to_string(cancelledBy));
    auto b = bookingRepo.findById(bookingId);
    if (b.getStatus() == BookingStatus::CANCELLED || b.getStatus() == BookingStatus::COMPLETED) {
        throw InvalidBookingException("Booking cannot be cancelled in status: " + EnumUtils::toString(b.getStatus()));
    }
    return bookingRepo.cancelBooking(bookingId, cancelledBy, reason, refundAmount);
}

Booking BookingService::getBookingById(int bookingId) {
    return bookingRepo.findById(bookingId);
}

std::vector<Booking> BookingService::getCustomerBookings(int customerId) {
    return bookingRepo.findByCustomer(customerId);
}

std::vector<Booking> BookingService::getVehicleBookings(int vehicleId) {
    return bookingRepo.findByVehicle(vehicleId);
}

std::vector<Booking> BookingService::getActiveBookings() {
    return bookingRepo.findActiveBookings();
}

void BookingService::validateBookingRequest(int customerId, int vehicleId, const std::string& startDate, const std::string& endDate) {
    if (DateUtils::isAfter(startDate, endDate)) {
        throw InvalidBookingException("End date (" + endDate + ") must be after start date (" + startDate + ").");
    }

    auto customer = customerRepo.findById(customerId);
    if (!customer) {
        throw NotFoundException("Customer ID " + std::to_string(customerId) + " not found.");
    }

    if (!customer->getLicenseExpiry().empty() && DateUtils::isBefore(customer->getLicenseExpiry(), startDate)) {
        throw InvalidBookingException("Customer driving licence will be expired during requested rental period.");
    }

    auto vehicle = vehicleRepo.findById(vehicleId);
    if (!vehicle) {
        throw NotFoundException("Vehicle ID " + std::to_string(vehicleId) + " not found.");
    }

    if (vehicle->getStatus() == VehicleStatus::MAINTENANCE || vehicle->getStatus() == VehicleStatus::OUT_OF_SERVICE) {
        throw VehicleUnavailableException("Vehicle is under maintenance or out of service.");
    }
}

} // namespace velorent
