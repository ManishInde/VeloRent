#pragma once
#include "httplib.h"
#include "CustomerService.h"
#include "BookingRepository.h"
#include "RentalRepository.h"
#include "PaymentRepository.h"
#include "LoyaltyRepository.h"
#include "CustomerRiskEngine.h"
#include "AuthMiddleware.h"

namespace velorent {

class CustomerController {
private:
    CustomerService& customerService;
    BookingRepository& bookingRepo;
    RentalRepository& rentalRepo;
    PaymentRepository& paymentRepo;
    LoyaltyRepository& loyaltyRepo;
    CustomerRiskEngine& riskEngine;
    AuthMiddleware& authMiddleware;

public:
    CustomerController(CustomerService& customerService,
                       BookingRepository& bookingRepo,
                       RentalRepository& rentalRepo,
                       PaymentRepository& paymentRepo,
                       LoyaltyRepository& loyaltyRepo,
                       CustomerRiskEngine& riskEngine,
                       AuthMiddleware& authMiddleware);

    void registerCustomer(const httplib::Request& req, httplib::Response& res);
    void getCustomerById(const httplib::Request& req, httplib::Response& res);
    void getCustomerBookings(const httplib::Request& req, httplib::Response& res);
    void getCustomerRentals(const httplib::Request& req, httplib::Response& res);
    void getCustomerLoyalty(const httplib::Request& req, httplib::Response& res);
    void getCustomerRisk(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
