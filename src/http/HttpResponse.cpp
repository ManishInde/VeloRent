#include "HttpResponse.h"

namespace velorent {

void HttpResponse::sendJson(httplib::Response& res, int statusCode, const nlohmann::json& body) {
    res.status = statusCode;
    res.set_content(body.dump(4), "application/json");
}

void HttpResponse::success(httplib::Response& res, const nlohmann::json& data, int statusCode) {
    nlohmann::json body;
    body["success"] = true;
    body["data"] = data;
    sendJson(res, statusCode, body);
}

void HttpResponse::collection(httplib::Response& res, const nlohmann::json& items, int statusCode) {
    nlohmann::json body;
    body["success"] = true;
    body["data"] = items;
    body["count"] = items.is_array() ? items.size() : 0;
    sendJson(res, statusCode, body);
}

void HttpResponse::error(httplib::Response& res, int statusCode, const std::string& errorCode, const std::string& message) {
    nlohmann::json body;
    body["success"] = false;
    body["error"] = {
        {"code", errorCode},
        {"message", message}
    };
    sendJson(res, statusCode, body);
}

void HttpResponse::badRequest(httplib::Response& res, const std::string& message) {
    error(res, 400, "BAD_REQUEST", message);
}

void HttpResponse::notFound(httplib::Response& res, const std::string& message) {
    error(res, 404, "NOT_FOUND", message);
}

void HttpResponse::conflict(httplib::Response& res, const std::string& message) {
    error(res, 409, "CONFLICT", message);
}

void HttpResponse::unprocessableEntity(httplib::Response& res, const std::string& message) {
    error(res, 422, "UNPROCESSABLE_ENTITY", message);
}

void HttpResponse::internalError(httplib::Response& res, const std::string& message) {
    error(res, 500, "INTERNAL_SERVER_ERROR", message);
}

void HttpResponse::serviceUnavailable(httplib::Response& res, const std::string& message) {
    error(res, 503, "SERVICE_UNAVAILABLE", message);
}

} // namespace velorent
