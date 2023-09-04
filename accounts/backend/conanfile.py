from conan import ConanFile
from conan.tools.cmake import CMake, CMakeDeps, CMakeToolchain, cmake_layout


class AccountServiceRecipe(ConanFile):
    requires = "cpp-httplib/0.14.0", "libpqxx/7.8.1", "nlohmann_json/3.11.2", "jwt-cpp/0.6.0", "bcrypt/1.0"
    settings = "os", "compiler", "build_type", "arch"

    def layout(self):
        cmake_layout(self)

    def generate(self):
        deps = CMakeDeps(self)
        deps.generate()
        tc = CMakeToolchain(self)
        tc.generate()
        self.cmake = CMake(self)
    
    def build(self):
        self.cmake.configure()
        self.cmake.build()
