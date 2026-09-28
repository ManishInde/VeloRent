#pragma once
#include "httplib.h"
#include "PaymentService.h"
#include "AuthMiddleware.h"

namespace velorent {

class PaymentController {
private:
    PaymentService& paymentService;
    AuthMiddleware& authMiddleware;

public:
    PaymentController(PaymentService& paymentService, AuthMiddleware& authMiddleware);

    void processPayment(const httplib::Request& req, httplib::Response& res);
};

} // namespace velorent
