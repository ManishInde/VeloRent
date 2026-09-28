#pragma once
#include <string>
#include <mutex>
#include <iostream>

namespace velorent {

enum class LogLevel {
    INFO,
    WARN,
    ERR
};

class Logger {
private:
    static std::mutex logMutex;
    static LogLevel currentLogLevel;

public:
    static void setLogLevel(LogLevel level);
    static void info(const std::string& message);
    static void warn(const std::string& message);
    static void error(const std::string& message);

private:
    static void log(LogLevel level, const std::string& prefix, const std::string& message);
};

} // namespace velorent
