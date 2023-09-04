#pragma once

#include <httplib.h>

#include <bcrypt/BCrypt.hpp>
#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/jwt.h"

namespace schemas::sign_up {

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

};

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
            res.body = "Invalid user_name size";
            return;
        }

        if (tx.query_value<bool>(std::format(
                "SELECT COUNT(1) FROM users WHERE user_name = '{}'", req_body.user_name))) {
            res.status = 400;
            res.body = "User with this user_name already exists";
            return;
        }
        if (req_body.password.empty() || req_body.password.size() > 50) {
            res.status = 400;
            res.body = "Invalid password size";
            return;
        }

        std::string hashed_password = BCrypt::generateHash(req_body.password);

        scm::Response res_body {
            .access_token = make_access_token(req_body.user_name, s.env.JWT_SECRET),
            .refresh_token = make_refresh_token(req_body.user_name, s.env.JWT_SECRET)};

        tx.exec0(
            std::format("INSERT INTO users (user_name, password, refresh_tokens) VALUES "
                        "('{}', '{}', ARRAY['{}'])",
                        req_body.user_name, hashed_password, res_body.refresh_token));

        tx.commit();

        res.set_content(static_cast<json>(res_body).dump(), "application/json");
        res.status = 200;
    });
}

};  // namespace handlers
