#pragma once
#include "CustomerRepository.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "LoyaltyRepository.h"
#include "Customer.h"
#include <memory>
#include <vector>

namespace velorent {

class CustomerService {
private:
    CustomerRepository& customerRepo;
    BookingRepository* bookingRepo;
    RentalRepository* rentalRepo;
    LoyaltyRepository* loyaltyRepo;

public:
    explicit CustomerService(CustomerRepository& cRepo,
                            BookingRepository* bRepo = nullptr,
                            RentalRepository* rRepo = nullptr,
                            LoyaltyRepository* lRepo = nullptr);

    int registerCustomer(Customer& customer);
    std::shared_ptr<Customer> getCustomerById(int customerId);
    std::shared_ptr<Customer> getCustomerByEmail(const std::string& email);
    std::vector<std::shared_ptr<Customer>> getAllCustomers();
    bool updateCustomerProfile(const Customer& customer);

    std::vector<Booking> getBookingHistory(int customerId);
    std::vector<Rental> getRentalHistory(int customerId);
    LoyaltyAccount getLoyaltyInfo(int customerId);

    void validateCustomer(const Customer& customer);
};

} // namespace velorent
