cmake_minimum_required(VERSION 3.22)

project(gateway)

# userver setup:
#   Enable userver libraries that are needed in this project
set(USERVER_FEATURE_POSTGRESQL ON CACHE BOOL "" FORCE)
set(USERVER_FEATURE_GRPC ON CACHE BOOL "" FORCE)
#   Compatibility mode: some systems don't support these features
set(USERVER_FEATURE_CRYPTOPP_BLAKE2 OFF CACHE BOOL "" FORCE)
set(USERVER_FEATURE_GRPC_CHANNELZ OFF CACHE BOOL "" FORCE)
set(USERVER_FEATURE_REDIS_HI_MALLOC ON CACHE BOOL "" FORCE)
#   Adding userver dependency
add_subdirectory(contrib/userver)
userver_setup_environment()

add_executable(
  ${PROJECT_NAME}
  src/main.cpp)
target_include_directories(${PROJECT_NAME} PRIVATE src)
target_link_libraries(${PROJECT_NAME} PRIVATE userver-postgresql)
target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_20)
target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Werror)

include(UserverTestsuite)
userver_testsuite_add_simple()



