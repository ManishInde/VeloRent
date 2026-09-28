#pragma once
#include "httplib.h"
#include "BookingService.h"
#include "AuthMiddleware.h"

namespace velorent {

class BookingController {
private:
    BookingService& bookingService;
    AuthMiddleware& authMiddleware;

public:
    BookingController(BookingService& bookingService, AuthMiddleware& authMiddleware);

    void createBooking(const httplib::Request& req, httplib::Response& res);
    void getBookingById(const httplib::Request& req, httplib::Response& res);
    void cancelBooking(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
