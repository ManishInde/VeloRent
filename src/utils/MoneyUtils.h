#pragma once
#include <string>

namespace velorent {

class MoneyUtils {
public:
    /**
     * @brief Rounds a monetary double to exact 2 decimal places.
     */
    static double roundToTwoDecimals(double val);

    /**
     * @brief Formats double monetary amount into INR string representation (e.g. "₹1,250.00").
     */
    static std::string formatINR(double amount);

    /**
     * @brief Calculates tax or surcharge on an amount given a percentage.
     */
    static double calculatePercentage(double amount, double percentage);
};

} // namespace velorent
