cmake_minimum_required(VERSION 3.14)
project(VeloRent VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard to C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# MySQL Client Library paths
set(MYSQL_INCLUDE_DIR "C:/Program Files/MySQL/MySQL Server 9.5/include")
set(MYSQL_LIB_DIR "C:/Program Files/MySQL/MySQL Server 9.5/lib")

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/models
    ${CMAKE_CURRENT_SOURCE_DIR}/src/exceptions
    ${CMAKE_CURRENT_SOURCE_DIR}/src/utils
    ${CMAKE_CURRENT_SOURCE_DIR}/src/database
    ${CMAKE_CURRENT_SOURCE_DIR}/src/repositories
    ${CMAKE_CURRENT_SOURCE_DIR}/src/services
    ${CMAKE_CURRENT_SOURCE_DIR}/src/engines
    ${CMAKE_CURRENT_SOURCE_DIR}/src/controllers
    ${CMAKE_CURRENT_SOURCE_DIR}/src/http
    ${CMAKE_CURRENT_SOURCE_DIR}/src/auth
    ${MYSQL_INCLUDE_DIR}
)

link_directories(${MYSQL_LIB_DIR})

# System sockets library for Windows (cpp-httplib)
if(WIN32)
    set(SOCKET_LIBS ws2_32 wsock32)
else()
    set(SOCKET_LIBS pthread)
endif()

# Collect source files for models, exceptions, and utilities
file(GLOB MODEL_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/models/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/src/utils/*.cpp"
)

# Collect Data Access Layer sources (DatabaseManager, RowMappers, Repositories)
file(GLOB DAL_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/database/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/src/repositories/*.cpp"
)

# Collect Authentication & Security sources
file(GLOB AUTH_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/auth/*.cpp"
)

# Collect Service Layer sources
file(GLOB SERVICE_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/services/*.cpp"
)

# Collect Intelligent Business Engine sources
file(GLOB ENGINE_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/engines/*.cpp"
)

# Collect HTTP & Controller sources
file(GLOB HTTP_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/http/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/src/controllers/*.cpp"
)

# Create static library for domain models (Zero DB dependency)
add_library(velorent_models STATIC ${MODEL_SOURCES})

# Create static library for Data Access Layer (DAL)
add_library(velorent_dal STATIC ${DAL_SOURCES})
target_link_libraries(velorent_dal PUBLIC velorent_models libmysql)

# Create static library for Authentication Layer
add_library(velorent_auth STATIC ${AUTH_SOURCES})
target_link_libraries(velorent_auth PUBLIC velorent_dal velorent_models)

# Create static library for Service Layer
add_library(velorent_services STATIC ${SERVICE_SOURCES})
target_link_libraries(velorent_services PUBLIC velorent_dal velorent_models)

# Create static library for Intelligence Engines
add_library(velorent_engines STATIC ${ENGINE_SOURCES})
target_link_libraries(velorent_engines PUBLIC velorent_services velorent_dal velorent_models)

# Create static library for Controllers & HTTP Layer
add_library(velorent_http STATIC ${HTTP_SOURCES})
target_link_libraries(velorent_http PUBLIC velorent_auth velorent_engines velorent_services velorent_dal velorent_models ${SOCKET_LIBS})

# Phase 6/7 Main REST API Executable
add_executable(velorent_server
    "${CMAKE_CURRENT_SOURCE_DIR}/src/main_server.cpp"
)
target_link_libraries(velorent_server PRIVATE velorent_http ${SOCKET_LIBS})

# Model Unit Tests Executable (Independent of MySQL)
add_executable(velorent_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_main.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_user.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_vehicle.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_booking_rental.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_payment.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_validation.cpp"
)
target_link_libraries(velorent_tests PRIVATE velorent_models)

# Database Integration Tests Executable (Connects to MySQL velorent database)
add_executable(velorent_db_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_db_integration.cpp"
)
target_link_libraries(velorent_db_tests PRIVATE velorent_dal)

# Phase 4 Service Unit Tests Executable
add_executable(velorent_service_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_services.cpp"
)
target_link_libraries(velorent_service_tests PRIVATE velorent_services)

# Phase 4 Core Rental Workflow Integration Tests Executable
add_executable(velorent_workflow_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_rental_workflow.cpp"
)
target_link_libraries(velorent_workflow_tests PRIVATE velorent_services)

# Phase 5 Engine Unit & Integration Tests Executable
add_executable(velorent_engine_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_pricing_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_recommendation_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_vehicle_health_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_vehicle_allocation_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_loyalty_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_customer_risk_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_fleet_intelligence_engine.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_engine_integration.cpp"
)
target_link_libraries(velorent_engine_tests PRIVATE velorent_engines)

# Phase 6 API & Controller Integration Tests Executable
add_executable(velorent_api_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_http_server.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_controllers.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_api_integration.cpp"
)
target_link_libraries(velorent_api_tests PRIVATE velorent_http ${SOCKET_LIBS})

# Phase 7 Authentication & Security Tests Executable
add_executable(velorent_auth_tests
    "${CMAKE_CURRENT_SOURCE_DIR}/tests/test_auth_api.cpp"
)
target_link_libraries(velorent_auth_tests PRIVATE velorent_http ${SOCKET_LIBS})

# Post-build copy step for libmysql.dll
add_custom_command(TARGET velorent_db_tests POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MYSQL_LIB_DIR}/libmysql.dll"
    "$<TARGET_FILE_DIR:velorent_db_tests>"
)
add_custom_command(TARGET velorent_server POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MYSQL_LIB_DIR}/libmysql.dll"
    "$<TARGET_FILE_DIR:velorent_server>"
)
add_custom_command(TARGET velorent_api_tests POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MYSQL_LIB_DIR}/libmysql.dll"
    "$<TARGET_FILE_DIR:velorent_api_tests>"
)
add_custom_command(TARGET velorent_auth_tests POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${MYSQL_LIB_DIR}/libmysql.dll"
    "$<TARGET_FILE_DIR:velorent_auth_tests>"
)

# Print build configuration overview
message(STATUS "VeloRent Phase 7 Authentication & Security Layer built with C++17 standard.")
message(STATUS "Target libraries: velorent_models, velorent_dal, velorent_auth, velorent_services, velorent_engines, velorent_http")
message(STATUS "Target executables: velorent_server, velorent_tests, velorent_db_tests, velorent_service_tests, velorent_workflow_tests, velorent_engine_tests, velorent_api_tests, velorent_auth_tests")
