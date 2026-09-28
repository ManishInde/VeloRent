#include "Logger.h"
#include "DateUtils.h"

namespace velorent {

std::mutex Logger::logMutex;
LogLevel Logger::currentLogLevel = LogLevel::INFO;

void Logger::setLogLevel(LogLevel level) {
    std::lock_guard<std::mutex> lock(logMutex);
    currentLogLevel = level;
}

void Logger::info(const std::string& message) {
    log(LogLevel::INFO, "INFO", message);
}

void Logger::warn(const std::string& message) {
    log(LogLevel::WARN, "WARN", message);
}

void Logger::error(const std::string& message) {
    log(LogLevel::ERR, "ERROR", message);
}

void Logger::log(LogLevel level, const std::string& prefix, const std::string& message) {
    std::lock_guard<std::mutex> lock(logMutex);
    if (level < currentLogLevel) return;

    std::string timestamp = DateUtils::getCurrentTimestamp();
    std::cout << "[" << timestamp << "] [" << prefix << "] " << message << std::endl;
}

} // namespace velorent
