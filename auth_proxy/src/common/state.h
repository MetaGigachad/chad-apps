#pragma once

#include <httplib.h>

#include <nlohmann/json.hpp>
#include <nlohmann/json_fwd.hpp>
#include <optional>
#include <pqxx/pqxx>
#include <string>

#include "common/logging.h"
#include "common/token_manager.h"

#define ENV_VAR_REQ(name) \
    const char* name = std::getenv(#name); \
    if (!name) { \
        LogCritical(#name " env var is not set."); \
    }

namespace gateway {

std::optional<uint16_t> StringToUInt16(const std::string& str) {
    try {
        unsigned long ul_result = std::stoul(str);
        if (ul_result <= std::numeric_limits<uint16_t>::max()) {
            return static_cast<uint16_t>(ul_result);
        }
        return std::nullopt;
    } catch (const std::invalid_argument& e) {
        return std::nullopt;
    } catch (const std::out_of_range& e) {
        return std::nullopt;
    }
}

class TConfig {
public:
    std::string PostgresUri;
    std::string Host;
    uint16_t Port;
    std::string JwtSecret;
    
    TConfig() = default;
    
    void LoadFromEnv() {
        ENV_VAR_REQ(POSTGRES_URI);
        PostgresUri = POSTGRES_URI;

        ENV_VAR_REQ(HOST);
        Host = HOST;

        ENV_VAR_REQ(PORT);
        std::optional<uint16_t> port = StringToUInt16(PORT);
        if (!port) {
            LogCritical("PORT has incorrect format");
        }
        Port = *port;

        ENV_VAR_REQ(JWT_SECRET);
        JwtSecret = JWT_SECRET;
    }
};

class TState {
public:
    httplib::Server Server;
    std::unique_ptr<pqxx::connection> DbConnection;
    
    const TConfig& Config() const { return Config_; }
    const TTokenManager& TokenManager() const { return TokenManager_; }

    void Init() {
        Config_.LoadFromEnv();
        TokenManager_.Init(Config_.JwtSecret);

        DbConnection = std::make_unique<pqxx::connection>(Config_.PostgresUri);
        if (DbConnection->is_open()) {
            LogInfo("Connected to database");
        } else {
            LogCritical("Failed to connect to database");
        }
    }

private:
    TConfig Config_;
    TTokenManager TokenManager_;
};

};  // namespace gateway

#undef ENV_VAR_REQ
