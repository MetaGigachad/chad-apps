#pragma once

#include <chrono>
#include <cstdio>
#include <format>
#include <string>

namespace logging {

class Logger {
    enum class Level { TRACE, INFO, ERROR, CRITICAL };

public:
    void trace(std::string msg) {
        fprintf(stderr, "%s\n", make_log(Level::TRACE, msg).c_str());
    }

    void info(std::string msg) {
        fprintf(stderr, "%s\n", make_log(Level::INFO, msg).c_str());
    }

    void error(std::string msg) {
        fprintf(stderr, "%s\n", make_log(Level::ERROR, msg).c_str());
    }

    void critical(std::string msg) {
        fprintf(stderr, "%s\n", make_log(Level::CRITICAL, msg).c_str());
    }

private:
    std::string make_log(Level level, std::string msg) {
        const auto now = std::chrono::system_clock::now();

        std::string level_str;
        switch (level) {
            case Level::TRACE:
                level_str = "[TRACE]";
                break;
            case Level::INFO:
                level_str = "[INFO]";
                break;
            case Level::ERROR:
                level_str = "[ERROR]";
                break;
            case Level::CRITICAL:
                level_str = "[CRITICAL]";
                break;
        }
        return std::format("{:%d-%m-%Y %H:%M:%OS} {} {}", now, level_str, msg);
    }
};

Logger logger;

};  // namespace logging

void trace(std::string msg) {
    logging::logger.trace(msg);
}

void info(std::string msg) {
    logging::logger.info(msg);
}

void error(std::string msg) {
    logging::logger.error(msg);
}

void critical(std::string msg) {
    logging::logger.critical(msg);
}
