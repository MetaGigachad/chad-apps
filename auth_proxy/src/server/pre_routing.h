#pragma once

#include <httplib.h>

#include "state.h"

namespace server {

void pre_routing(state::State& s) {
    using hr = httplib::Server::HandlerResponse;
    using httplib::Request;
    using httplib::Response;

    s.svr.set_pre_routing_handler([&](const Request& req, Response& res) {
        auto origin = req.get_header_value("Origin");
        if (!s.env.allowed_origins.contains(origin)) {
            res.status = 403;
            return hr::Handled;
        }
        
        if (req.method != "OPTIONS") {
            res.set_header("Access-Control-Allow-Origin", origin);
        }

        return hr::Unhandled;
    });
}

};  // namespace server
