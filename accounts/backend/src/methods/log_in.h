#pragma once

#include <httplib.h>

#include <bcrypt/BCrypt.hpp>
#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/jwt.h"

namespace schemas::log_in {

struct Request {
    std::string user_name;
    std::string password;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Request, user_name, password)

struct Response {
    std::string access_token;
    std::string refresh_token;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Response, access_token, refresh_token)

};  // namespace schemas::log_in

namespace methods {

void log_in(state::State& s) {
    namespace scm = schemas::log_in;

    using json = nlohmann::json;
    using httplib::Request;
    using httplib::Response;

    s.svr.Post("/log_in", [&](const Request& req, Response& res) {
        auto req_body = json::parse(req.body).get<scm::Request>();
        pqxx::work tx {*s.postgres};

        if (req_body.user_name.empty() || req_body.user_name.size() > 50) {
            res.status = 400;
            res.body = "Invalid user_name size";
            return;
        }
        if (!tx.query_value<bool>(
                std::format("SELECT COUNT(1) FROM users WHERE user_name = '{}'",
                            req_body.user_name))) {
            res.status = 400;
            res.body = "User with this user_name doesn't exist";
            return;
        }

        if (req_body.password.empty() || req_body.password.size() > 50) {
            res.status = 400;
            res.body = "Invalid password size";
            return;
        }
        std::string hash = tx.query_value<std::string>(std::format(
            "SELECT password FROM users WHERE user_name = '{}'", req_body.user_name));
        if (!BCrypt::validatePassword(req_body.password, hash)) {
            res.status = 400;
            res.body = "Incorrect password";
            return;
        }

        scm::Response res_body {
            .access_token = make_access_token(req_body.user_name, s.env.JWT_SECRET),
            .refresh_token = make_refresh_token(req_body.user_name, s.env.JWT_SECRET)};

        tx.exec0(
            std::format("UPDATE users SET refresh_tokens = refresh_tokens || ARRAY['{}'] "
                        "WHERE user_name = '{}'",
                        res_body.refresh_token, req_body.user_name));

        // Cleanup
        auto refresh_tokens = tx.exec1(std::format(
            "SELECT refresh_tokens FROM users WHERE user_name = '{}'",
            req_body.user_name))[0]
                                  .as_array();

        auto item = refresh_tokens.get_next();
        while (item.first == pqxx::array_parser::juncture::string_value) {
            auto& token = item.second;
            try {
                verify_refresh_token(token, s.env.JWT_SECRET);
            } catch (jwt::error::token_verification_error& e) {
                if (e == jwt::error::token_verification_error::token_expired) {
                    tx.exec0(
                        std::format("UPDATE users SET refresh_tokens = "
                                    "array_remove(refresh_tokens, '{}') "
                                    "WHERE user_name = '{}'",
                                    token, req_body.user_name));
                }
            }
        }

        tx.commit();

        res.set_content(static_cast<json>(res_body).dump(), "application/json");

        res.status = 200;
    });
}

};  // namespace methods
