cmake_minimum_required(VERSION 3.22.1)

project(training-journal-backend)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
if(CMAKE_EXPORT_COMPILE_COMMANDS)
  set(CMAKE_CXX_STANDARD_INCLUDE_DIRECTORIES
      ${CMAKE_CXX_IMPLICIT_INCLUDE_DIRECTORIES})
endif()

find_package(httplib REQUIRED)
find_package(libpqxx REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(bcrypt CONFIG REQUIRED)

add_executable(
  ${PROJECT_NAME}
  src/main.cpp
  src/state.h
  src/utils/logging.h
  src/utils/jwt.h
  src/utils/cookies.h
  src/server/pre_routing.h
  src/server/options.h
  src/methods/log_in.h
  src/methods/log_out.h
  src/methods/sign_up.h
  src/methods/refresh.h)
target_include_directories(${PROJECT_NAME} PRIVATE src)
target_link_libraries(
  ${PROJECT_NAME} httplib::httplib libpqxx::pqxx nlohmann_json::nlohmann_json
  jwt-cpp::jwt-cpp bcrypt::bcrypt)
