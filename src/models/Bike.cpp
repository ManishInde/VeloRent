#include "Bike.h"
#include "MoneyUtils.h"

namespace velorent {

Bike::Bike(int id,
           const std::string& registrationNumber,
           const std::string& brand,
           const std::string& model,
           int categoryId,
           FuelType fuelType,
           TransmissionType transmission,
           int seats,
           double baseRentalRate,
           int engineCc,
           int odometerKm,
           double healthScore,
           VehicleStatus status,
           int purchaseYear)
    : Vehicle(id, registrationNumber, brand, model, categoryId, fuelType,
              transmission, seats, baseRentalRate, odometerKm, healthScore, status, purchaseYear),
      engineCc(engineCc)
{
}

double Bike::calculateMaintenanceFactor() const {
    // Bikes wear tires/chain faster per km
    double kmFactor = (odometerKm / 5000.0) * 0.08;
    return MoneyUtils::roundToTwoDecimals(0.8 + kmFactor);
}

double Bike::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) durationDays = 1;
    // Bike rate with slight long-duration discount for >= 7 days
    double rate = baseRentalRate;
    if (durationDays >= 7) {
        rate *= 0.90; // 10% discount for weekly bike rentals
    }
    return MoneyUtils::roundToTwoDecimals(rate * durationDays);
}

} // namespace velorent
