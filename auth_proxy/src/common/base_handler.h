#pragma once

#include <httplib.h>
#include <variant>

#include "common/state.h"

namespace gateway {

using json = nlohmann::json;

struct TErrorBody {
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(TErrorBody, message)
    std::string message;
};

struct TErrorResponse {
    httplib::StatusCode status = httplib::BadRequest_400;
    TErrorBody body;
    
    TErrorResponse(std::string message) : body(std::move(message)) {}
};

template<bool Protected = false>
class TBaseHandler {
public:
    TBaseHandler(const TState& state)
        : State_(state) {}
    
protected:
    bool ValidateAuth(const httplib::Request& req) {
        if (!Protected) {
            return true;
        }
        // TODO: Implement bearer auth check
        return false;
    }

protected:
    const TState& State_;
};

template<class TDerived, bool Protected = false>
class TRawHandler : public TBaseHandler<Protected> {
public:
    TRawHandler(const TState& state)
        : TBaseHandler<Protected>(state) {}

    void operator()(const httplib::Request& req, httplib::Response& res) {
        if (!this->ValidateAuth(req)) {
            return; 
        }
        static_cast<TDerived*>(this)->Impl(req, res);        
    }
};

template<class TDerived, typename TRequestJson, typename TResponseJson, bool Protected = false>
class TJsonHandler : public TBaseHandler<Protected> {
public:
    TJsonHandler(const TState& state)
        : TBaseHandler<Protected>(state) {}

    void operator()(const httplib::Request& req, httplib::Response& res) {
        if (!this->ValidateAuth(req)) {
            return; 
        }
        auto req_body = json::parse(req.body).get<TRequestJson>();
        std::variant<TResponseJson, TErrorResponse> res_obj = static_cast<TDerived*>(this)->Impl(std::move(req_body));        
        if (std::holds_alternative<TResponseJson>(res_obj)) {
            res.status = httplib::OK_200,
            res.set_content(static_cast<json>(res_obj).dump(), "application/json");
        } else {
            res.status = res_obj.status;
            res.set_content(static_cast<json>(res_obj.body).dump(), "application/json");
        }
    }
};

}