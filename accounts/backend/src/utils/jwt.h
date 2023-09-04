#pragma once

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/defaults.h>

#include <string_view>

std::string make_access_token(const std::string& user_name, const char* secret) {
    return jwt::create()
        .set_issued_at(std::chrono::system_clock::now())
        .set_expires_at(std::chrono::system_clock::now() +
                        std::chrono::seconds {3600 * 3})
        .set_id(user_name)
        .sign(jwt::algorithm::hs256 {secret});
}

std::string make_refresh_token(const std::string& user_name, const char* secret) {
    return jwt::create()
        .set_issued_at(std::chrono::system_clock::now())
        .set_expires_at(std::chrono::system_clock::now() +
                        std::chrono::seconds {3600 * 48})
        .set_id(user_name)
        .sign(jwt::algorithm::hs256 {secret});
}
auto verify_access_token(const std::string& token, const char* secret) {
    static auto verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256 {secret});
    auto decoded = jwt::decode(token);
    verifier.verify(decoded);
    return decoded;
}

auto verify_refresh_token(const std::string& token, const char* secret) {
    static auto verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256 {secret});
    auto decoded = jwt::decode(token);
    verifier.verify(decoded);
    return decoded;
}
