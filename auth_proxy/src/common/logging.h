#pragma once

#include <chrono>
#include <cstdlib>
#include <format>
#include <iostream>

#define LogTime(msg) std::cerr << std::format("[{:%d-%m-%Y %H:%M:%OS}] ", std::chrono::system_clock::now()) << msg
#define LogTrace(msg) LogTime("[TRACE] " << msg)
#define LogInfo(msg) LogTime("[INFO] " << msg)
#define LogError(msg) LogTime("[ERROR] " << msg)
#define LogCritical(msg) LogTime("[CRITICAL] " << msg); exit(EXIT_FAILURE);
