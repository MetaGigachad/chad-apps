#pragma once

#include <httplib.h>

#include "state.h"

namespace server {

void options(state::State& s) {
    using httplib::Request;
    using httplib::Response;

    s.svr.Options("/(.*)", [&](const Request& req, Response& res) {
        auto origin = req.get_header_value("Origin");
        auto method = req.get_header_value("Access-Control-Request-Method");
        auto headers = req.get_header_value("Access-Control-Request-Headers");

        if (!s.env.allowed_origins.contains(origin)) {
            res.status = 403;
        }

        res.status = 203;
        res.set_header("Access-Control-Allow-Origin", origin);
        res.set_header("Access-Control-Allow-Methods", method);
        res.set_header("Access-Control-Allow-Headers", headers);
        res.set_header("Access-Control-Max-Age", "8200");
    });
}

};  // namespace options
