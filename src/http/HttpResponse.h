#pragma once
#include "httplib.h"
#include "json.hpp"
#include <string>

namespace velorent {

class HttpResponse {
public:
    static void sendJson(httplib::Response& res, int statusCode, const nlohmann::json& body);

    static void success(httplib::Response& res, const nlohmann::json& data, int statusCode = 200);

    static void collection(httplib::Response& res, const nlohmann::json& items, int statusCode = 200);

    static void error(httplib::Response& res, int statusCode, const std::string& errorCode, const std::string& message);

    static void badRequest(httplib::Response& res, const std::string& message);
    static void notFound(httplib::Response& res, const std::string& message);
    static void conflict(httplib::Response& res, const std::string& message);
    static void unprocessableEntity(httplib::Response& res, const std::string& message);
    static void internalError(httplib::Response& res, const std::string& message = "An internal server error occurred.");
    static void serviceUnavailable(httplib::Response& res, const std::string& message = "Database or dependent service is unavailable.");
};

} // namespace velorent
