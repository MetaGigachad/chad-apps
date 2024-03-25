#pragma once

#include <httplib.h>

#include <format>
#include <string>
#include <map>

void set_refresh_token_cookie(httplib::Response& res, const std::string& refresh_token) {
    res.set_header(
        "Set-Cookie",
        std::format("refresh_token={}; Max-Age=172800; Domain=http://localhost:8080; Path=/; HttpOnly", refresh_token));
}

void delete_refresh_token_cookie(httplib::Response& res,
                                 const std::string& refresh_token) {
    res.set_header("Set-Cookie", std::format("refresh_token=deleted; Expires=Thu, 01 Jan "
                                             "1970 00:00:01 GMT; Path=/; HttpOnly"));
}

std::map<std::string, std::string> parse_cookies(const std::string& data) {
    enum State { IN_NAME, IN_VALUE, SEMICOLON };

    std::map<std::string, std::string> parsed;
    std::string name;
    std::string value;
    State state = IN_NAME;
    for (size_t i = 0; i < data.size(); ++i) {
        switch (state) {
            case IN_NAME:
                if (data[i] == '=') {
                    state = IN_VALUE;
                } else {
                    name.push_back(data[i]);
                }
                break;
            case IN_VALUE:
                if (data[i] == ';') {
                    state = SEMICOLON;
                } else {
                    value.push_back(data[i]);
                }
                break;
            case SEMICOLON:
                if (data[i] != ' ') {
                    std::runtime_error("Invalid cookies: no space after semicolon");
                }
                parsed[name] = value;
                name.clear();
                value.clear();
                state = IN_VALUE;
                break;
        }
    }
    parsed[name] = value;
    return parsed;
}
