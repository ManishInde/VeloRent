#pragma once
#include "Customer.h"
#include "DamageReport.h"
#include "Booking.h"
#include "Rental.h"
#include "Payment.h"
#include <string>
#include <vector>

namespace velorent {

enum class RiskLevel {
    LOW,
    MEDIUM,
    HIGH
};

struct CustomerRiskResult {
    double riskScore = 0.0;
    RiskLevel riskLevel = RiskLevel::LOW;
    std::vector<std::string> contributingFactors;
    std::string recommendedAction;
};

class CustomerRiskEngine {
public:
    CustomerRiskEngine() = default;

    /**
     * @brief Evaluates operational rental risk indicator for a customer based on historical behavior.
     */
    CustomerRiskResult evaluateCustomerRisk(const Customer& customer,
                                             const std::vector<Booking>& bookingHistory = {},
                                             const std::vector<Rental>& rentalHistory = {},
                                             const std::vector<DamageReport>& damageHistory = {},
                                             const std::vector<Payment>& paymentHistory = {});

    static std::string riskLevelToString(RiskLevel level);
};

} // namespace velorent
