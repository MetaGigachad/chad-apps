#pragma once

#include <httplib.h>

#include <bcrypt/BCrypt.hpp>
#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/jwt.h"

namespace schemas::refresh {

struct Request {
    std::string refresh_token;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Request, refresh_token)

struct Response {
    std::string access_token;
    std::string refresh_token;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Response, access_token, refresh_token)

};  // namespace schemas::refresh

namespace methods {

void refresh(state::State& s) {
    namespace scm = schemas::refresh;

    using json = nlohmann::json;
    using httplib::Request;
    using httplib::Response;

    s.svr.Post("/refresh", [&](const Request& req, Response& res) {
        auto req_body = json::parse(req.body).get<scm::Request>();
        pqxx::work tx {*s.postgres};

        auto refresh_token = verify_refresh_token(req_body.refresh_token, s.env.JWT_SECRET);
        std::string user_name = refresh_token.get_id();

        if (!tx.query_value<bool>(
                std::format("SELECT COUNT(1) FROM users WHERE '{}' = ANY(refresh_tokens)",
                            req_body.refresh_token))) {
            res.set_content("Invalid refresh_token", "text/plain");
            res.status = 400;
            return;
        }

        scm::Response res_body {
            .access_token = make_access_token(user_name, s.env.JWT_SECRET),
            .refresh_token = make_refresh_token(user_name, s.env.JWT_SECRET)};

        tx.exec0(
            std::format("UPDATE users SET refresh_tokens = array_remove(refresh_tokens, "
                        "'{}') || ARRAY['{}'] "
                        "WHERE user_name = '{}'",
                        req_body.refresh_token, res_body.refresh_token, user_name));

        tx.commit();

        res.set_content(static_cast<json>(res_body).dump(), "application/json");

        res.status = 200;
    });
}

};  // namespace handlers
