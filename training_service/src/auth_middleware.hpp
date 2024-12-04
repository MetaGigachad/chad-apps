#pragma once

#include <userver/components/component_list.hpp>

namespace training_service {

struct UserData {
    std::string Id;
    std::string OAuth2UserId;
    std::string UserName;
};

void AppendAuthMiddleware(userver::components::ComponentList& component_list);

}  // namespace training_service
