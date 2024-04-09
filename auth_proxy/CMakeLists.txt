cmake_minimum_required(VERSION 3.22.1)

project(auth_proxy)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
if(CMAKE_EXPORT_COMPILE_COMMANDS)
  set(CMAKE_CXX_STANDARD_INCLUDE_DIRECTORIES
      ${CMAKE_CXX_IMPLICIT_INCLUDE_DIRECTORIES})
endif()

find_package(nlohmann_json 3.11.3 REQUIRED)
find_package(jwt-cpp 0.7.0 REQUIRED)
find_package(libpqxx 7.9.0 REQUIRED)
find_package(httplib 0.15.3 REQUIRED)
find_library(libxcrypt crypt PATHS /usr/local/lib)
find_package(ozo 0.0.1 REQUIRED)
find_package(Boost 1.72.0 REQUIRED)

add_executable(
  ${PROJECT_NAME}
  src/main.cpp)
target_include_directories(${PROJECT_NAME} PRIVATE src)
target_link_libraries(${PROJECT_NAME} PRIVATE ${libxcrypt} jwt-cpp::jwt-cpp nlohmann_json::nlohmann_json libpqxx::pqxx httplib::httplib yandex::ozo Boost::boost)
target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_20)
target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Werror)
