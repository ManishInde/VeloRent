#pragma once
#include "BusinessRuleException.h"

namespace velorent {

/**
 * @brief Thrown when a payment processing or validation rule fails.
 */
class PaymentException : public BusinessRuleException {
public:
    explicit PaymentException(const std::string& message)
        : BusinessRuleException("Payment Failure: " + message) {}
};

} // namespace velorent
