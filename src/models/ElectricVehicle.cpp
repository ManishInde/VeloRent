#include "ElectricVehicle.h"
#include "MoneyUtils.h"
#include "ValidationException.h"
#include <sstream>

namespace velorent {

ElectricVehicle::ElectricVehicle(int id,
                                 const std::string& registrationNumber,
                                 const std::string& brand,
                                 const std::string& model,
                                 int categoryId,
                                 TransmissionType transmission,
                                 int seats,
                                 double baseRentalRate,
                                 double batteryCapacityKwh,
                                 double currentChargePercent,
                                 int rangeKm,
                                 int odometerKm,
                                 double healthScore,
                                 VehicleStatus status,
                                 int purchaseYear)
    : Vehicle(id, registrationNumber, brand, model, categoryId, FuelType::ELECTRIC,
              transmission, seats, baseRentalRate, odometerKm, healthScore, status, purchaseYear),
      batteryCapacityKwh(batteryCapacityKwh), rangeKm(rangeKm)
{
    setCurrentChargePercent(currentChargePercent);
}

double ElectricVehicle::calculateMaintenanceFactor() const {
    // EVs have fewer moving parts -> lower base maintenance factor
    double baseFactor = 0.7;
    // Battery degradation impact over time
    double batteryAgeFactor = (100.0 - healthScore) * 0.03;
    return MoneyUtils::roundToTwoDecimals(baseFactor + batteryAgeFactor);
}

double ElectricVehicle::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) durationDays = 1;
    // Eco green incentive factor
    double total = baseRentalRate * durationDays * 0.95;
    return MoneyUtils::roundToTwoDecimals(total);
}

std::string ElectricVehicle::displaySummary() const {
    std::ostringstream ss;
    ss << Vehicle::displaySummary() << " | Battery: " << currentChargePercent
       << "% (" << rangeKm << " km range)";
    return ss.str();
}

void ElectricVehicle::setCurrentChargePercent(double percent) {
    if (percent < 0.0 || percent > 100.0) {
        throw ValidationException("Battery charge percentage must be between 0.0 and 100.0.");
    }
    currentChargePercent = percent;
}

} // namespace velorent
