#pragma once
#include <string>

namespace velorent {

class DateUtils {
public:
    /**
     * @brief Calculate difference in days between two ISO date strings (YYYY-MM-DD).
     */
    static int daysBetween(const std::string& startDateISO, const std::string& endDateISO);

    /**
     * @brief Checks if dateStr1 is chronologically after dateStr2.
     */
    static bool isAfter(const std::string& dateStr1, const std::string& dateStr2);

    /**
     * @brief Checks if dateStr1 is chronologically before dateStr2.
     */
    static bool isBefore(const std::string& dateStr1, const std::string& dateStr2);

    /**
     * @brief Validates if string follows YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format.
     */
    static bool isValidDateFormat(const std::string& dateStr);

    /**
     * @brief Returns current UTC date string in YYYY-MM-DD format.
     */
    static std::string getCurrentDate();

    /**
     * @brief Returns current UTC timestamp string in YYYY-MM-DD HH:MM:SS format.
     */
    static std::string getCurrentTimestamp();
};

} // namespace velorent
