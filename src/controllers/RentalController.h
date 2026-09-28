#pragma once
#include "httplib.h"
#include "RentalService.h"
#include "AuthMiddleware.h"

namespace velorent {

class RentalController {
private:
    RentalService& rentalService;
    AuthMiddleware& authMiddleware;

public:
    RentalController(RentalService& rentalService, AuthMiddleware& authMiddleware);

    void startRental(const httplib::Request& req, httplib::Response& res);
    void getRentalById(const httplib::Request& req, httplib::Response& res);
    void returnRental(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
