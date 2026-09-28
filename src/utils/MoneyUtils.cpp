#include "MoneyUtils.h"
#include <cmath>
#include <iomanip>
#include <sstream>

namespace velorent {

double MoneyUtils::roundToTwoDecimals(double val) {
    return std::round(val * 100.0) / 100.0;
}

std::string MoneyUtils::formatINR(double amount) {
    double rounded = roundToTwoDecimals(amount);
    std::ostringstream ss;
    ss << "INR " << std::fixed << std::setprecision(2) << rounded;
    return ss.str();
}

double MoneyUtils::calculatePercentage(double amount, double percentage) {
    return roundToTwoDecimals((amount * percentage) / 100.0);
}

} // namespace velorent
