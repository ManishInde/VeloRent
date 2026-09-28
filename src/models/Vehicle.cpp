#include "Vehicle.h"
#include "ValidationUtils.h"
#include "EnumUtils.h"
#include "MoneyUtils.h"
#include <sstream>

namespace velorent {

Vehicle::Vehicle(int id,
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
    : id(id), brand(brand), model(model), categoryId(categoryId),
      fuelType(fuelType), transmission(transmission), status(status), purchaseYear(purchaseYear)
{
    setRegistrationNumber(registrationNumber);
    setSeats(seats);
    setBaseRentalRate(baseRentalRate);
    setOdometerKm(odometerKm);
    setHealthScore(healthScore);
}

std::string Vehicle::toString() const {
    std::ostringstream ss;
    ss << "Vehicle[ID: " << id << ", Reg: " << registrationNumber
       << ", Make/Model: " << brand << " " << model
       << ", Type: " << getVehicleType()
       << ", Rate: INR " << baseRentalRate << "/day"
       << ", Health: " << healthScore << "/100"
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

double Vehicle::calculateRentalCost(int durationDays) const {
    if (durationDays <= 0) {
        durationDays = 1;
    }
    double total = baseRentalRate * durationDays;
    return MoneyUtils::roundToTwoDecimals(total);
}

std::string Vehicle::displaySummary() const {
    std::ostringstream ss;
    ss << brand << " " << model << " (" << registrationNumber << ") - "
       << getVehicleType() << " | " << EnumUtils::toString(status)
       << " | INR " << baseRentalRate << "/day | Health: " << healthScore << "%";
    return ss.str();
}

void Vehicle::setRegistrationNumber(const std::string& reg) {
    ValidationUtils::validateNonEmptyString(reg, "Registration Number");
    registrationNumber = reg;
}

void Vehicle::setBaseRentalRate(double rate) {
    ValidationUtils::validatePositiveRate(rate, "Base Rental Rate");
    baseRentalRate = rate;
}

void Vehicle::setOdometerKm(int km) {
    ValidationUtils::validateOdometer(km);
    odometerKm = km;
}

void Vehicle::setHealthScore(double score) {
    ValidationUtils::validateHealthScore(score);
    healthScore = score;
}

void Vehicle::setSeats(int s) {
    ValidationUtils::validateSeats(s);
    seats = s;
}

} // namespace velorent
