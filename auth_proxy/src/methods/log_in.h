#pragma once

#include <httplib.h>

extern "C" {
    #include <crypt.h>
}
#include <nlohmann/json.hpp>
#include <pqxx/pqxx>
#include <string>
#include <format>

#include "common/state.h"
#include "utils/cookies.h"
#include "common/base_handler.h"

namespace gateway {

using json = nlohmann::json;

struct TLoginRequest {
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(TLoginRequest, username, password)
    std::string username;
    std::string password;
};

struct TLoginResponse {
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(TLoginResponse, access_token)
    std::string access_token;
};

class TLoginHandler : public TJsonHandler<TLoginHandler, TLoginRequest, TLoginResponse> {
public:
    TLoginHandler(const TState& state)
        : TJsonHandler(state) {}

    std::variant<TLoginResponse, TErrorResponse> Impl(const TLoginRequest& req) {
        pqxx::work tx {*State_.DbConnection};

        if (req.username.empty() || req.username.size() > 50) {
            return TErrorResponse("Invalid username size");
        }
        if (!tx.query_value<bool>(
                std::format("SELECT COUNT(1) FROM users WHERE user_name = '{}'",
                            tx.esc(req.username)))) {
            return TErrorResponse("User with this user_name doesn't exist");
        }

        if (req.password.empty() || req.password.size() > 50) {
            return TErrorResponse("Invalid password size");
        }
        std::string hash = tx.query_value<std::string>(
            std::format("SELECT password FROM users WHERE user_name = '{}'",
                        tx.esc(req.username)));

        crypt_data crypt_data {
            .initialized = 0
        };
        std::string new_hash = crypt_r(req.password.c_str(), hash.c_str() + hash.size() - 31, &crypt_data);

        if (hash != new_hash) {
            return TErrorResponse("Incorrect password");
        }

        auto refresh_token = make_refresh_token(req.username, State_.Config().JwtSecret);
        TLoginResponse res {
            .access_token = make_access_token(req.username, State_.Config().JwtSecret)};

        tx.exec0(
            std::format("UPDATE users SET refresh_tokens = refresh_tokens || ARRAY['{}'] "
                        "WHERE user_name = '{}'",
                        tx.esc(refresh_token), tx.esc(req.username)));

        // Cleanup
        auto refresh_tokens = tx.exec1(std::format(
            "SELECT refresh_tokens FROM users WHERE user_name = '{}'",
            tx.esc(req.username)))[0]
                                  .as_array();

        auto item = refresh_tokens.get_next();
        while (item.first == pqxx::array_parser::juncture::string_value) {
            auto& token = item.second;
            try {
                verify_refresh_token(token, State_.Config().JwtSecret);
            } catch (jwt::error::token_verification_error& e) {
                if (e == jwt::error::token_verification_error::token_expired) {
                    tx.exec0(
                        std::format("UPDATE users SET refresh_tokens = "
                                    "array_remove(refresh_tokens, '{}') "
                                    "WHERE user_name = '{}'",
                                    tx.esc(token), tx.esc(req.username)));
                }
            }
        }
        tx.commit();

        // set_refresh_token_cookie(res, refresh_token); 
        return res;
    }
};

}
