#include "Car.h"
#include "MoneyUtils.h"

namespace velorent {

Car::Car(int id,
         const std::string& registrationNumber,
         const std::string& brand,
         const std::string& model,
         int categoryId,
         FuelType fuelType,
         TransmissionType transmission,
         int seats,
         double baseRentalRate,
         int odometerKm,
         double healthScore,
         VehicleStatus status,
         int purchaseYear)
    : Vehicle(id, registrationNumber, brand, model, categoryId, fuelType,
              transmission, seats, baseRentalRate, odometerKm, healthScore, status, purchaseYear)
{
}

double Car::calculateMaintenanceFactor() const {
    // Maintenance factor derived from odometer reading and health score
    double kmFactor = (odometerKm / 10000.0) * 0.05;
    double healthDegradation = (100.0 - healthScore) * 0.02;
    return MoneyUtils::roundToTwoDecimals(1.0 + kmFactor + healthDegradation);
}

double Car::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) durationDays = 1;
    // Standard car rate
    double total = baseRentalRate * durationDays;
    return MoneyUtils::roundToTwoDecimals(total);
}

} // namespace velorent
