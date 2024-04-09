#include <httplib.h>

#include "methods/log_in.h"
#include "methods/log_out.h"
#include "methods/refresh.h"
#include "methods/sign_up.h"
#include "server/options.h"
#include "server/pre_routing.h"
#include "state.h"
#include "utils/logging.h"

int main() {
    using namespace httplib;

    gateway::TState s;

    s.Server.set_logger([](const Request& req, const Response& res) {
        LogInfo("Request: " << req.target);
    });

    s.Server.set_exception_handler([](const Request& req, Response& res, std::exception_ptr ep) {
        try {
            std::rethrow_exception(ep);
        } catch (std::exception& e) {
            LogError("Exception in handler: " << e.what());
        } catch (...) {
            LogError("Unknown exception in handler");
        }
        res.status = InternalServerError_500;
    });

    server::options(s);
    server::pre_routing(s);

    methods::sign_up(s);
    s.Server.Post("/login", gateway::TLoginHandler(s));
    methods::log_out(s);
    methods::refresh(s);

    LogInfo("Listening on " << s.Config().Host << ":" << s.Config().Port);
    s.Server.listen(s.Config().Host, s.Config().Port);
}