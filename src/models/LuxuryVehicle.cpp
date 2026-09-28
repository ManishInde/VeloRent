#include "LuxuryVehicle.h"
#include "MoneyUtils.h"
#include "ValidationUtils.h"

namespace velorent {

LuxuryVehicle::LuxuryVehicle(int id,
                             const std::string& registrationNumber,
                             const std::string& brand,
                             const std::string& model,
                             int categoryId,
                             FuelType fuelType,
                             TransmissionType transmission,
                             int seats,
                             double baseRentalRate,
                             double securityDepositINR,
                             double luxuryTaxMultiplier,
                             int odometerKm,
                             double healthScore,
                             VehicleStatus status,
                             int purchaseYear)
    : Vehicle(id, registrationNumber, brand, model, categoryId, fuelType,
              transmission, seats, baseRentalRate, odometerKm, healthScore, status, purchaseYear),
      luxuryTaxMultiplier(luxuryTaxMultiplier)
{
    setSecurityDepositINR(securityDepositINR);
}

double LuxuryVehicle::calculateMaintenanceFactor() const {
    // High cost of specialized luxury components
    return MoneyUtils::roundToTwoDecimals(1.8 + (100.0 - healthScore) * 0.05);
}

double LuxuryVehicle::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) durationDays = 1;
    double grossRate = baseRentalRate * luxuryTaxMultiplier;
    return MoneyUtils::roundToTwoDecimals(grossRate * durationDays);
}

void LuxuryVehicle::setSecurityDepositINR(double deposit) {
    ValidationUtils::validateNonNegativeAmount(deposit, "Security Deposit");
    securityDepositINR = deposit;
}

} // namespace velorent
