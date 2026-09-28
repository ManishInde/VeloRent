#include "HttpResponse.h"
#include "JsonUtils.h"
#include "Car.h"
#include "Customer.h"
#include "Booking.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void testJsonUtilsFormatting() {
    std::cout << "  [1/3] Testing JsonUtils serialization..." << std::endl;

    Car car(1, "KA01AB1234", "Honda", "City", 1, FuelType::PETROL, TransmissionType::AUTOMATIC, 5, 2500.0, 15000, 95.0, VehicleStatus::AVAILABLE, 2022);
    nlohmann::json vj = JsonUtils::toJson(car);
    assert(vj["id"] == 1);
    assert(vj["registrationNumber"] == "KA01AB1234");
    assert(vj["brand"] == "Honda");
    assert(vj["type"] == "CAR");
    assert(vj["baseRentalRate"] == 2500.0);

    Customer cust(10, "John Doe", "john@example.com", "passhash", "9876543210", "DL12345");
    nlohmann::json cj = JsonUtils::toJson(cust);
    assert(cj["id"] == 10);
    assert(cj["email"] == "john@example.com");
    assert(cj["role"] == "CUSTOMER");

    Booking b(100, 10, 1, "2026-10-01", "2026-10-05", 10000.0, BookingStatus::CONFIRMED);
    nlohmann::json bj = JsonUtils::toJson(b);
    assert(bj["id"] == 100);
    assert(bj["totalPrice"] == 10000.0);
    assert(bj["status"] == "CONFIRMED");

    std::cout << "        JsonUtils PASSED [OK]" << std::endl;
}

void testHttpResponseFormatting() {
    std::cout << "  [2/3] Testing HttpResponse payload formatting..." << std::endl;

    httplib::Response res;
    HttpResponse::success(res, {{"foo", "bar"}}, 200);
    assert(res.status == 200);
    nlohmann::json body = nlohmann::json::parse(res.body);
    assert(body["success"] == true);
    assert(body["data"]["foo"] == "bar");

    httplib::Response resErr;
    HttpResponse::notFound(resErr, "Item missing");
    assert(resErr.status == 404);
    nlohmann::json errBody = nlohmann::json::parse(resErr.body);
    assert(errBody["success"] == false);
    assert(errBody["error"]["code"] == "NOT_FOUND");
    assert(errBody["error"]["message"] == "Item missing");

    std::cout << "        HttpResponse PASSED [OK]" << std::endl;
}

void runHttpServerUnitTests() {
    testJsonUtilsFormatting();
    testHttpResponseFormatting();
}
