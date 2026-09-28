#pragma once
#include "json.hpp"
#include "Vehicle.h"
#include "Car.h"
#include "Bike.h"
#include "Customer.h"
#include "Booking.h"
#include "Rental.h"
#include "Payment.h"
#include "DamageReport.h"
#include "Maintenance.h"
#include "Review.h"
#include "LoyaltyAccount.h"
#include "Notification.h"
#include "PricingEngine.h"
#include "VehicleHealthEngine.h"
#include "CustomerRiskEngine.h"
#include "FleetIntelligenceEngine.h"
#include <memory>
#include <vector>

namespace velorent {

class JsonUtils {
public:
    // Vehicle serializers
    static nlohmann::json toJson(const Vehicle& vehicle);
    static nlohmann::json toJson(const std::vector<std::shared_ptr<Vehicle>>& vehicles);

    // Customer serializers
    static nlohmann::json toJson(const Customer& customer);

    // Booking serializers
    static nlohmann::json toJson(const Booking& booking);
    static nlohmann::json toJson(const std::vector<Booking>& bookings);

    // Rental serializers
    static nlohmann::json toJson(const Rental& rental);
    static nlohmann::json toJson(const std::vector<Rental>& rentals);

    // Payment serializers
    static nlohmann::json toJson(const Payment& payment);
    static nlohmann::json toJson(const std::vector<Payment>& payments);

    // DamageReport serializers
    static nlohmann::json toJson(const DamageReport& report);
    static nlohmann::json toJson(const std::vector<DamageReport>& reports);

    // Maintenance serializers
    static nlohmann::json toJson(const Maintenance& task);
    static nlohmann::json toJson(const std::vector<Maintenance>& tasks);

    // Review serializers
    static nlohmann::json toJson(const Review& review);
    static nlohmann::json toJson(const std::vector<Review>& reviews);

    // Loyalty Account serializers
    static nlohmann::json toJson(const LoyaltyAccount& account);

    // Notification serializers
    static nlohmann::json toJson(const Notification& notification);
    static nlohmann::json toJson(const std::vector<Notification>& notifications);

    // Intelligence Engine Result serializers
    static nlohmann::json toJson(const PricingBreakdown& breakdown);
    static nlohmann::json toJson(const VehicleHealthResult& health);
    static nlohmann::json toJson(const CustomerRiskResult& risk);
    static nlohmann::json toJson(const FleetAnalyticsReport& report);
};

} // namespace velorent
