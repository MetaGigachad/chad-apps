#include <userver/components/minimal_server_component_list.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/utils/daemon_run.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/testsuite/testsuite_support.hpp>
#include <userver/clients/dns/component.hpp>

using namespace userver;

namespace gateway {
 
class Hello final : public server::handlers::HttpHandlerBase {
 public:
  // `kName` is used as the component name in static config
  static constexpr std::string_view kName = "handler-hello-sample";
 
  // Component is valid after construction and is able to accept requests
  using HttpHandlerBase::HttpHandlerBase;
 
  std::string HandleRequestThrow(
      const server::http::HttpRequest&,
      server::request::RequestContext&) const override {
    return "Hello world!\n";
  }
};

};
 
int main(int argc, char* argv[]) {
  const auto component_list =
    components::MinimalServerComponentList()
      .Append<gateway::Hello>()
      .Append<components::TestsuiteSupport>()
      .Append<components::HttpClient>()
      .Append<clients::dns::Component>()
      .Append<server::handlers::TestsControl>();
  return utils::DaemonMain(argc, argv, component_list);
}
