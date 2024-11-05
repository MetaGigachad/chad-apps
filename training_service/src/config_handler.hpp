#pragma once

#include <string>
#include <string_view>

#include <userver/components/component_list.hpp>

namespace training_service {

void AppendConfig(userver::components::ComponentList& component_list);

}  // namespace training_service
