#pragma once

#include <httplib.h>

#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <pqxx/pqxx>
#include <set>
#include <string>

#include "utils/logging.h"

namespace state {

class Env {
public:
    const char* POSTGRES_URI;
    const char* HOST;
    const char* PORT;
    const char* JWT_SECRET;
    std::set<std::string> allowed_origins;

    Env() {
        using json = nlohmann::json;

        POSTGRES_URI = std::getenv("POSTGRES_URI");
        if (!POSTGRES_URI) {
            critical("POSTGRES_URI env var is not set.");
            exit(EXIT_FAILURE);
        }
        HOST = std::getenv("HOST");
        if (!HOST) {
            critical("HOST env var is not set.");
            exit(EXIT_FAILURE);
        }
        PORT = std::getenv("PORT");
        if (!PORT) {
            critical("PORT env var is not set.");
            exit(EXIT_FAILURE);
        }
        JWT_SECRET = std::getenv("JWT_SECRET");
        if (!JWT_SECRET) {
            critical("JWT_SECRET env var is not set.");
            exit(EXIT_FAILURE);
        }
        const char* ALLOWED_ORIGINS = std::getenv("ALLOWED_ORIGINS");
        if (!ALLOWED_ORIGINS) {
            critical("ALLOWED_ORIGINS env var is not set.");
            exit(EXIT_FAILURE);
        }
        allowed_origins = json::parse(ALLOWED_ORIGINS);
    }
};

class State {
public:
    httplib::Server svr;
    std::unique_ptr<pqxx::connection> postgres;
    Env env;

    State() {
        postgres = std::make_unique<pqxx::connection>(env.POSTGRES_URI);
        info(postgres->is_open() ? "Postgres is connected"
                                 : "Postgres connection failed");
    }
};

};  // namespace state
