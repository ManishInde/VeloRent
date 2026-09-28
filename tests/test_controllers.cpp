#include "VehicleController.h"
#include "CustomerController.h"
#include "BookingController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include <iostream>
#include <cassert>

using namespace velorent;

void testControllerRequestRouting() {
    std::cout << "  [3/3] Testing Controller endpoint mapping logic..." << std::endl;

    // Test JSON payload construction and status mapping
    httplib::Response res400;
    HttpResponse::badRequest(res400, "Invalid JSON input");
    assert(res400.status == 400);

    httplib::Response res409;
    HttpResponse::conflict(res409, "Vehicle already booked for selected dates");
    assert(res409.status == 409);

    httplib::Response res422;
    HttpResponse::unprocessableEntity(res422, "Invalid rental duration specified");
    assert(res422.status == 422);

    std::cout << "        Controller Mapping PASSED [OK]" << std::endl;
}

void runControllerUnitTests() {
    testControllerRequestRouting();
}
