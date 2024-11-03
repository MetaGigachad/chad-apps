#pragma once

#include <string>
#include <string_view>

#include <userver/components/component_list.hpp>

namespace training_service {

enum class UserType { kFirstTime, kKnown };
std::string SayHelloTo(std::string_view name, UserType type);

void AppendHello(userver::components::ComponentList& component_list);

}  // namespace training_service
