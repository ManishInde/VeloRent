#include "DateUtils.h"
#include "ValidationException.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <regex>

namespace velorent {

static std::tm parseDate(const std::string& dateStr) {
    std::tm tm = {};
    std::string cleanDate = dateStr.substr(0, 10);
    std::istringstream ss(cleanDate);
    ss >> std::get_time(&tm, "%Y-%m-%d");
    if (ss.fail()) {
        throw ValidationException("Failed to parse date string: " + dateStr);
    }
    return tm;
}

int DateUtils::daysBetween(const std::string& startDateISO, const std::string& endDateISO) {
    std::tm tmStart = parseDate(startDateISO);
    std::tm tmEnd   = parseDate(endDateISO);

    std::time_t timeStart = std::mktime(&tmStart);
    std::time_t timeEnd   = std::mktime(&tmEnd);

    if (timeStart == -1 || timeEnd == -1) {
        throw ValidationException("Invalid date value for day difference calculation.");
    }

    double diffSeconds = std::difftime(timeEnd, timeStart);
    return static_cast<int>(diffSeconds / (60 * 60 * 24));
}

bool DateUtils::isAfter(const std::string& dateStr1, const std::string& dateStr2) {
    std::tm tm1 = parseDate(dateStr1);
    std::tm tm2 = parseDate(dateStr2);

    std::time_t time1 = std::mktime(&tm1);
    std::time_t time2 = std::mktime(&tm2);

    return time1 > time2;
}

bool DateUtils::isBefore(const std::string& dateStr1, const std::string& dateStr2) {
    std::tm tm1 = parseDate(dateStr1);
    std::tm tm2 = parseDate(dateStr2);

    std::time_t time1 = std::mktime(&tm1);
    std::time_t time2 = std::mktime(&tm2);

    return time1 < time2;
}

bool DateUtils::isValidDateFormat(const std::string& dateStr) {
    static const std::regex dateRegex(R"(\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?)");
    return std::regex_match(dateStr, dateRegex);
}

std::string DateUtils::getCurrentDate() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::tm tmBuf = {};
#if defined(_WIN32) || defined(_WIN64)
    localtime_s(&tmBuf, &in_time_t);
#else
    localtime_r(&in_time_t, &tmBuf);
#endif
    std::ostringstream ss;
    ss << std::put_time(&tmBuf, "%Y-%m-%d");
    return ss.str();
}

std::string DateUtils::getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::tm tmBuf = {};
#if defined(_WIN32) || defined(_WIN64)
    localtime_s(&tmBuf, &in_time_t);
#else
    localtime_r(&in_time_t, &tmBuf);
#endif
    std::ostringstream ss;
    ss << std::put_time(&tmBuf, "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

} // namespace velorent
