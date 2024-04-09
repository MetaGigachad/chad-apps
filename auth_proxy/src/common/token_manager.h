#pragma once

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/defaults.h>
#include <iterator>

namespace gateway {

class TTokenManager {
public:
    void Init(std::string secret) {
        Secret_ = std::move(secret);
    }

    std::string IssueAccessToken(const std::string& username) const {
        std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
        return jwt::create()
            .set_issued_at(now)
            .set_expires_at(now + AccessTokenTtl_)
            .set_subject(username)
            .sign(jwt::algorithm::hs256 {Secret_});
    }

    std::string IssueRefreshToken(const std::string& username) const {
        std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
        return jwt::create()
            .set_issued_at(now)
            .set_expires_at(now + RefreshTokenTtl_)
            .set_subject(username)
            .sign(jwt::algorithm::hs256 {Secret_});
    }
    
    std::optional<std::string> Verify(const std::string& token) const {
        try {
            static auto verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256 {Secret_});
            auto decoded = jwt::decode(token);
            verifier.verify(decoded);
            return decoded.get_subject();
        } catch (jwt::error::token_verification_exception& e) {
            return std::nullopt;
        }
    }
    
private:
    std::string Secret_;

    static constexpr std::chrono::hours AccessTokenTtl_ {3}; 
    static constexpr std::chrono::days RefreshTokenTtl_ {2}; 
};

}