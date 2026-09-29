#include "JsonUtils.h"
#include "EnumUtils.h"

namespace velorent {

nlohmann::json JsonUtils::toJson(const Vehicle& v) {
    nlohmann::json j;
    j["id"] = v.getId();
    j["registrationNumber"] = v.getRegistrationNumber();
    j["brand"] = v.getBrand();
    j["model"] = v.getModel();
    j["categoryId"] = v.getCategoryId();
    j["type"] = v.getVehicleType();
    j["fuelType"] = EnumUtils::toString(v.getFuelType());
    j["transmission"] = EnumUtils::toString(v.getTransmission());
    j["seats"] = v.getSeats();
    j["baseRentalRate"] = v.getBaseRentalRate();
    j["odometerKm"] = v.getOdometerKm();
    j["healthScore"] = v.getHealthScore();
    j["status"] = EnumUtils::toString(v.getStatus());
    j["purchaseYear"] = v.getPurchaseYear();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<std::shared_ptr<Vehicle>>& vehicles) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& v : vehicles) {
        if (v) {
            arr.push_back(toJson(*v));
        }
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const Customer& c) {
    nlohmann::json j;
    j["id"] = c.getId();
    j["fullName"] = c.getFullName();
    j["email"] = c.getEmail();
    j["phone"] = c.getPhone();
    j["drivingLicenseNumber"] = c.getDrivingLicenseNumber();
    j["licenseExpiry"] = c.getLicenseExpiry();
    j["totalRentals"] = c.getTotalRentals();
    j["riskScore"] = c.getRiskScore();
    j["accountStatus"] = EnumUtils::toString(c.getStatus());
    j["role"] = c.getRoleName();
    return j;
}

nlohmann::json JsonUtils::toJson(const Booking& b) {
    nlohmann::json j;
    j["id"] = b.getId();
    j["customerId"] = b.getCustomerId();
    j["vehicleId"] = b.getVehicleId();
    j["startDate"] = b.getStartDate();
    j["endDate"] = b.getEndDate();
    j["totalPrice"] = b.getQuotedPrice();
    j["status"] = EnumUtils::toString(b.getStatus());
    j["createdAt"] = b.getCreatedAt();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Booking>& bookings) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& b : bookings) {
        arr.push_back(toJson(b));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const Rental& r) {
    nlohmann::json j;
    j["id"] = r.getId();
    j["bookingId"] = r.getBookingId();
    j["startOdometerKm"] = r.getStartingOdometer();
    j["endOdometerKm"] = r.getEndingOdometer();
    j["startDateTime"] = r.getActualStart();
    j["endDateTime"] = r.getActualReturn();
    j["status"] = EnumUtils::toString(r.getStatus());
    j["distanceDrivenKm"] = r.calculateDistanceTravelled();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Rental>& rentals) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& r : rentals) {
        arr.push_back(toJson(r));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const Payment& p) {
    nlohmann::json j;
    j["id"] = p.getId();
    j["rentalId"] = p.getRentalId();
    j["amount"] = p.getAmount();
    j["method"] = EnumUtils::toString(p.getMethod());
    j["type"] = EnumUtils::toString(p.getPaymentType());
    j["status"] = EnumUtils::toString(p.getStatus());
    j["transactionId"] = p.getTransactionId();
    j["createdAt"] = p.getCreatedAt();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Payment>& payments) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& p : payments) {
        arr.push_back(toJson(p));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const DamageReport& d) {
    nlohmann::json j;
    j["id"] = d.getId();
    j["rentalId"] = d.getRentalId();
    j["vehicleId"] = d.getVehicleId();
    j["reportedBy"] = d.getReportedBy();
    j["severity"] = EnumUtils::toString(d.getSeverity());
    j["description"] = d.getDescription();
    j["estimatedCost"] = d.getEstimatedCost();
    j["resolutionStatus"] = EnumUtils::toString(d.getResolutionStatus());
    j["createdAt"] = d.getCreatedAt();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<DamageReport>& reports) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& d : reports) {
        arr.push_back(toJson(d));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const Maintenance& m) {
    nlohmann::json j;
    j["id"] = m.getId();
    j["vehicleId"] = m.getVehicleId();
    j["damageReportId"] = m.getDamageReportId();
    j["type"] = EnumUtils::toString(m.getType());
    j["priority"] = EnumUtils::toString(m.getPriority());
    j["status"] = EnumUtils::toString(m.getStatus());
    j["description"] = m.getDescription();
    j["scheduledDate"] = m.getScheduledDate();
    j["completionDate"] = m.getCompletionDate();
    j["totalCost"] = m.getTotalCost();
    j["assignedTo"] = m.getAssignedTo();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Maintenance>& tasks) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& m : tasks) {
        arr.push_back(toJson(m));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const Review& r) {
    nlohmann::json j;
    j["id"] = r.getId();
    j["rentalId"] = r.getRentalId();
    j["customerId"] = r.getCustomerId();
    j["vehicleId"] = r.getVehicleId();
    j["rating"] = r.getRating();
    j["comment"] = r.getComment();
    j["createdAt"] = r.getCreatedAt();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Review>& reviews) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& r : reviews) {
        arr.push_back(toJson(r));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const LoyaltyAccount& l) {
    nlohmann::json j;
    j["id"] = l.getId();
    j["customerId"] = l.getCustomerId();
    j["currentPoints"] = l.getCurrentPoints();
    j["totalPointsEarned"] = l.getTotalPointsEarned();
    j["tier"] = EnumUtils::toString(l.getTier());
    j["lastUpdated"] = l.getLastUpdated();
    return j;
}

nlohmann::json JsonUtils::toJson(const Notification& n) {
    nlohmann::json j;
    j["id"] = n.getId();
    j["userId"] = n.getUserId();
    j["title"] = n.getTitle();
    j["message"] = n.getMessage();
    j["type"] = EnumUtils::toString(n.getNotificationType());
    j["isRead"] = n.getIsRead();
    j["createdAt"] = n.getCreatedAt();
    return j;
}

nlohmann::json JsonUtils::toJson(const std::vector<Notification>& notifications) {
    nlohmann::json arr = nlohmann::json::array();
    for (const auto& n : notifications) {
        arr.push_back(toJson(n));
    }
    return arr;
}

nlohmann::json JsonUtils::toJson(const PricingBreakdown& p) {
    nlohmann::json j;
    j["baseRatePerDay"] = p.baseRatePerDay;
    j["durationDays"] = p.durationDays;
    j["subtotal"] = p.subtotal;
    j["demandAdjustment"] = p.demandAdjustment;
    j["categorySurchargeAmount"] = p.categorySurchargeAmount;
    j["durationDiscount"] = p.durationDiscount;
    j["loyaltyDiscount"] = p.loyaltyDiscount;
    j["finalPrice"] = p.finalPrice;
    j["explanation"] = p.explanation;
    return j;
}

nlohmann::json JsonUtils::toJson(const VehicleHealthResult& vh) {
    nlohmann::json j;
    j["score"] = vh.score;
    j["category"] = VehicleHealthEngine::categoryToString(vh.category);
    j["factors"] = vh.factors;
    j["warnings"] = vh.warnings;
    j["recommendedAction"] = vh.recommendedAction;
    return j;
}

nlohmann::json JsonUtils::toJson(const CustomerRiskResult& cr) {
    nlohmann::json j;
    j["riskScore"] = cr.riskScore;
    j["riskLevel"] = CustomerRiskEngine::riskLevelToString(cr.riskLevel);
    j["contributingFactors"] = cr.contributingFactors;
    j["recommendedAction"] = cr.recommendedAction;
    return j;
}

nlohmann::json JsonUtils::toJson(const FleetAnalyticsReport& r) {
    nlohmann::json j;
    j["totalVehicles"] = r.totalVehicles;
    j["availableVehicles"] = r.availableVehicles;
    j["reservedVehicles"] = r.reservedVehicles;
    j["rentedVehicles"] = r.rentedVehicles;
    j["maintenanceVehicles"] = r.maintenanceVehicles;
    j["activeBookings"] = r.activeBookings;
    j["fleetUtilizationPct"] = r.fleetUtilizationPct;
    j["totalRevenueINR"] = r.totalRevenueINR;
    j["totalMaintenanceCostINR"] = r.totalMaintenanceCostINR;
    j["netEstimatedProfitINR"] = r.netEstimatedProfitINR;
    j["averageHealthScore"] = r.averageHealthScore;
    
    nlohmann::json insightsArr = nlohmann::json::array();
    for (const auto& ins : r.insights) {
        nlohmann::json ij;
        ij["metricName"] = ins.metricName;
        ij["metricValue"] = ins.metricValue;
        ij["severity"] = FleetIntelligenceEngine::severityToString(ins.severity);
        ij["explanation"] = ins.explanation;
        ij["suggestedAction"] = ins.suggestedAction;
        insightsArr.push_back(ij);
    }
    j["insights"] = insightsArr;
    return j;
}

} // namespace velorent
