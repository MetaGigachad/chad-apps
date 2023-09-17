#pragma once

#include <httplib.h>

#include <bcrypt/BCrypt.hpp>
#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/cookies.h"
#include "utils/jwt.h"

namespace schemas::sign_up {

struct Request {
    std::string user_name;
    std::string password;
    std::string first_name;
    std::string last_name;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Request, user_name, password)

struct Response {
    std::string access_token;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Response, access_token)

};  // namespace schemas::sign_up

namespace methods {

void sign_up(state::State& s) {
    namespace scm = schemas::sign_up;

    using json = nlohmann::json;
    using httplib::Request;
    using httplib::Response;

    s.svr.Post("/sign_up", [&](const Request& req, Response& res) {
        auto req_body = json::parse(req.body).get<scm::Request>();
        pqxx::work tx {*s.postgres};

        if (req_body.user_name.empty() || req_body.user_name.size() > 50) {
            res.status = 400;
            res.set_content("Invalid user_name size", "text/plain");
            return;
        }
        if (req_body.password.empty() || req_body.password.size() > 50) {
            res.status = 400;
            res.set_content("Invalid password size", "text/plain");
            return;
        }
        if (req_body.password.empty() || req_body.first_name.size() > 50) {
            res.status = 400;
            res.set_content("Invalid first_name size", "text/plain");
            return;
        }
        if (req_body.password.empty() || req_body.last_name.size() > 50) {
            res.status = 400;
            res.set_content("Invalid last_name size", "text/plain");
            return;
        }

        if (tx.query_value<bool>(
                std::format("SELECT COUNT(1) FROM users WHERE user_name = '{}'",
                            tx.esc(req_body.user_name)))) {
            res.status = 400;
            res.set_content("User with this user_name already exists", "text/plain");
            return;
        }

        std::string hashed_password = BCrypt::generateHash(req_body.password);

        auto refresh_token = make_refresh_token(req_body.user_name, s.env.JWT_SECRET);
        scm::Response res_body {
            .access_token = make_access_token(req_body.user_name, s.env.JWT_SECRET)};

        tx.exec0(std::format(
            "INSERT INTO users (user_name, password, refresh_tokens, "
            "first_name, last_name) VALUES "
            "('{}', '{}', ARRAY['{}'], '{}', '{}')",
            tx.esc(req_body.user_name), tx.esc(hashed_password), tx.esc(refresh_token),
            tx.esc(req_body.first_name), tx.esc(req_body.last_name)));

        tx.commit();

        if (req.has_header("Cookie")) {
            trace(std::format("Cookie: {}", req.get_header_value("Cookie")));
        }
        trace(std::format("Response: {}", static_cast<json>(res_body).dump()));

        res.status = 200;
        set_refresh_token_cookie(res, refresh_token);
        res.set_content(static_cast<json>(res_body).dump(), "application/json");
    });
}

};  // namespace methods
