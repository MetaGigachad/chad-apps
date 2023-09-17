#include <httplib.h>

#include <format>

#include "methods/log_in.h"
#include "methods/log_out.h"
#include "methods/refresh.h"
#include "methods/sign_up.h"
#include "server/options.h"
#include "server/pre_routing.h"
#include "state.h"
#include "utils/logging.h"

int main(void) {
    using namespace httplib;

    state::State s;

    s.svr.set_logger([](const Request& req, const Response& res) {
        info(std::format("Request: {}", req.target));
    });

    s.svr.set_exception_handler([](const auto& req, auto& res, std::exception_ptr ep) {
        try {
            std::rethrow_exception(ep);
        } catch (std::exception& e) {
            error(std::format("Exception in handler: {}", e.what()));
        } catch (...) {
            error("Unknown exception in handler");
        }
        res.status = 400;
    });

    server::options(s);
    server::pre_routing(s);

    methods::sign_up(s);
    methods::log_in(s);
    methods::log_out(s);
    methods::refresh(s);

    info(std::format("Starting on {}:{}", s.env.HOST, s.env.PORT));
    s.svr.listen(s.env.HOST, std::stoi(s.env.PORT));
}
