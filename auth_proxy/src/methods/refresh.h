#pragma once

#include <httplib.h>

#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/cookies.h"
#include "utils/jwt.h"

namespace schemas::refresh {

struct Response {
    std::string access_token;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Response, access_token)

};  // namespace schemas::refresh

namespace methods {

void refresh(state::State& s) {
    namespace scm = schemas::refresh;

    using json = nlohmann::json;
    using httplib::Request;
    using httplib::Response;

    s.svr.Post("/refresh", [&](const Request& req, Response& res) {
        pqxx::work tx {*s.postgres};

        if (!req.has_header("Cookie")) {
            res.status = 400;
            res.set_content("No cookies", "text/plain");
        }
        auto cookies = parse_cookies(req.get_header_value("Cookie"));
        if (!cookies.contains("refresh_token")) {
            res.status = 400;
            res.set_content("No refresh_token cookie", "text/plain");
        }
        auto old_refresh_token = cookies["refresh_token"];

        auto old_decoded_refresh_token =
            verify_refresh_token(old_refresh_token, s.env.JWT_SECRET);
        std::string user_name = old_decoded_refresh_token.get_id();

        if (!tx.query_value<bool>(
                std::format("SELECT COUNT(1) FROM users WHERE '{}' = ANY(refresh_tokens)",
                            tx.esc(old_refresh_token)))) {
            res.set_content("Invalid refresh_token", "text/plain");
            res.status = 400;
            return;
        }

        auto new_refresh_token = make_refresh_token(user_name, s.env.JWT_SECRET);
        scm::Response res_body {
            .access_token = make_access_token(user_name, s.env.JWT_SECRET)};

        tx.exec0(
            std::format("UPDATE users SET refresh_tokens = array_remove(refresh_tokens, "
                        "'{}') || ARRAY['{}'] "
                        "WHERE user_name = '{}'",
                        tx.esc(old_refresh_token), tx.esc(new_refresh_token),
                        tx.esc(user_name)));

        tx.commit();

        res.status = 200;
        set_refresh_token_cookie(res, new_refresh_token);
        res.set_content(static_cast<json>(res_body).dump(), "application/json");
    });
}

};  // namespace methods
