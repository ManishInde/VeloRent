#include "SUV.h"
#include "MoneyUtils.h"

namespace velorent {

SUV::SUV(int id,
         const std::string& registrationNumber,
         const std::string& brand,
         const std::string& model,
         int categoryId,
         FuelType fuelType,
         TransmissionType transmission,
         int seats,
         double baseRentalRate,
         bool isFourWheelDrive,
         int odometerKm,
         double healthScore,
         VehicleStatus status,
         int purchaseYear)
    : Vehicle(id, registrationNumber, brand, model, categoryId, fuelType,
              transmission, seats, baseRentalRate, odometerKm, healthScore, status, purchaseYear),
      isFourWheelDrive(isFourWheelDrive)
{
}

double SUV::calculateMaintenanceFactor() const {
    double baseFactor = isFourWheelDrive ? 1.3 : 1.15;
    double kmFactor = (odometerKm / 15000.0) * 0.1;
    return MoneyUtils::roundToTwoDecimals(baseFactor + kmFactor);
}

double SUV::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) durationDays = 1;
    double multiplier = isFourWheelDrive ? 1.15 : 1.0;
    double total = baseRentalRate * durationDays * multiplier;
    return MoneyUtils::roundToTwoDecimals(total);
}

} // namespace velorent
