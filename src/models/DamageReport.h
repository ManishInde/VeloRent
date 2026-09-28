#pragma once
#include "IEntity.h"
#include "Enums.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a reported vehicle damage incident linked to a rental.
 */
class DamageReport : public IEntity {
private:
    int id;
    int rentalId;
    int vehicleId;
    int reportedBy;
    DamageSeverity severity;
    std::string description;
    double estimatedCost;
    DamageResolutionStatus resolutionStatus;
    std::string createdAt;

public:
    DamageReport(int id,
                 int rentalId,
                 int vehicleId,
                 int reportedBy,
                 DamageSeverity severity,
                 const std::string& description,
                 double estimatedCost = 0.0,
                 DamageResolutionStatus resolutionStatus = DamageResolutionStatus::PENDING,
                 const std::string& createdAt = "");

    int getId() const override { return id; }
    std::string toString() const override;

    // Getters
    int getRentalId() const { return rentalId; }
    int getVehicleId() const { return vehicleId; }
    int getReportedBy() const { return reportedBy; }
    DamageSeverity getSeverity() const { return severity; }
    const std::string& getDescription() const { return description; }
    double getEstimatedCost() const { return estimatedCost; }
    DamageResolutionStatus getResolutionStatus() const { return resolutionStatus; }
    const std::string& getCreatedAt() const { return createdAt; }

    // Mutators
    void setEstimatedCost(double cost);
    void setSeverity(DamageSeverity newSeverity) { severity = newSeverity; }
    void setResolutionStatus(DamageResolutionStatus newStatus) { resolutionStatus = newStatus; }
};

} // namespace velorent
