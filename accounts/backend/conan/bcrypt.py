from conan import ConanFile
from conan.tools.cmake import CMake, CMakeDeps, cmake_layout, CMakeToolchain
from conan.tools.files import get

class LibBCryptRecipe(ConanFile):
    name = "bcrypt"
    version = "1.0"

    settings = "os", "compiler", "build_type", "arch"

    def source(self):
        get(self, "https://github.com/trusch/libbcrypt/archive/d6523c370de6e724ce4ec703e2449b5b028ea3b1.zip", strip_root=True)

    def layout(self):
        cmake_layout(self)

    def generate(self):
        deps = CMakeDeps(self)
        deps.generate()
        tc = CMakeToolchain(self)
        tc.generate()

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()

    def package(self):
        cmake = CMake(self)
        cmake.install()

    def package_info(self):
        self.cpp_info.libs = ["bcrypt"]
