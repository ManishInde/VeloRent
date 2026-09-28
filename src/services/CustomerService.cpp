#include "CustomerService.h"
#include "ValidationException.h"
#include "NotFoundException.h"
#include "Logger.h"

namespace velorent {

CustomerService::CustomerService(CustomerRepository& cRepo,
                                 BookingRepository* bRepo,
                                 RentalRepository* rRepo,
                                 LoyaltyRepository* lRepo)
    : customerRepo(cRepo), bookingRepo(bRepo), rentalRepo(rRepo), loyaltyRepo(lRepo)
{
}

int CustomerService::registerCustomer(Customer& customer) {
    Logger::info("CustomerService: Registering new customer " + customer.getEmail());
    validateCustomer(customer);
    return customerRepo.save(customer);
}

std::shared_ptr<Customer> CustomerService::getCustomerById(int customerId) {
    Logger::info("CustomerService: Fetching customer ID " + std::to_string(customerId));
    auto c = customerRepo.findById(customerId);
    if (!c) {
        throw NotFoundException("Customer ID " + std::to_string(customerId) + " not found.");
    }
    return c;
}

std::shared_ptr<Customer> CustomerService::getCustomerByEmail(const std::string& email) {
    Logger::info("CustomerService: Fetching customer by email " + email);
    auto c = customerRepo.findByEmail(email);
    if (!c) {
        throw NotFoundException("Customer email " + email + " not found.");
    }
    return c;
}

std::vector<std::shared_ptr<Customer>> CustomerService::getAllCustomers() {
    Logger::info("CustomerService: Retrieving all customers.");
    return customerRepo.findAll();
}

bool CustomerService::updateCustomerProfile(const Customer& customer) {
    Logger::info("CustomerService: Updating profile for customer ID " + std::to_string(customer.getId()));
    validateCustomer(customer);
    return customerRepo.update(customer);
}

std::vector<Booking> CustomerService::getBookingHistory(int customerId) {
    Logger::info("CustomerService: Fetching booking history for Customer ID " + std::to_string(customerId));
    if (!bookingRepo) return {};
    return bookingRepo->findByCustomer(customerId);
}

std::vector<Rental> CustomerService::getRentalHistory(int customerId) {
    Logger::info("CustomerService: Fetching rental history for Customer ID " + std::to_string(customerId));
    if (!rentalRepo) return {};
    // Get all bookings then rentals for customer
    if (!bookingRepo) return {};
    auto bookings = bookingRepo->findByCustomer(customerId);
    std::vector<Rental> rentals;
    for (const auto& b : bookings) {
        try {
            rentals.push_back(rentalRepo->findByBooking(b.getId()));
        } catch (...) {}
    }
    return rentals;
}

LoyaltyAccount CustomerService::getLoyaltyInfo(int customerId) {
    Logger::info("CustomerService: Fetching loyalty info for Customer ID " + std::to_string(customerId));
    if (!loyaltyRepo) throw NotFoundException("Loyalty repository unavailable.");
    return loyaltyRepo->findAccountByCustomer(customerId);
}

void CustomerService::validateCustomer(const Customer& customer) {
    if (customer.getFullName().empty()) {
        throw ValidationException("Customer full name cannot be empty.");
    }
    if (customer.getEmail().find('@') == std::string::npos) {
        throw ValidationException("Invalid email format.");
    }
    if (customer.getDrivingLicenseNumber().empty()) {
        throw ValidationException("Driving licence number cannot be empty.");
    }
}

} // namespace velorent
