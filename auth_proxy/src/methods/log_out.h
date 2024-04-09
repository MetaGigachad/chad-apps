#pragma once

#include <httplib.h>

#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <string>

#include "state.h"
#include "utils/cookies.h"
#include "utils/jwt.h"

namespace methods {

void log_out(state::State& s) {
    using json = nlohmann::json;
    using httplib::Request;
    using httplib::Response;

    s.svr.Post("/log_out", [&](const Request& req, Response& res) {
        if (!req.has_header("Cookie")) {
            res.status = 400;
            res.set_content("No cookies", "text/plain");
        }
        auto cookies = parse_cookies(req.get_header_value("Cookie"));
        if (!cookies.contains("refresh_token")) {
            res.status = 400;
            res.set_content("No refresh_token cookie", "text/plain");
        }
        auto refresh_token = cookies["refresh_token"];
        auto decoded_refresh_token =
            verify_refresh_token(refresh_token, s.env.JWT_SECRET);
        std::string user_name = decoded_refresh_token.get_id();

        pqxx::work tx {*s.postgres};
        tx.exec0(
            std::format("UPDATE users SET refresh_tokens = "
                        "array_remove(refresh_tokens, '{}') "
                        "WHERE user_name = '{}'",
                        tx.esc(refresh_token), tx.esc(user_name)));
        tx.commit();

        res.status = 200;
        delete_refresh_token_cookie(res, refresh_token);
    });
}

};  // namespace methods
