import { Component } from "solid-js";
import { PageBase } from "../components/PageBase";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { useNavigate } from "@solidjs/router";

export const RootPage: Component = () => {
  const navigate = useNavigate();

  return (
    <PageBase title="Welcome to Chad Auth">
      <h2 class="mb-4">
        <b>Chad Auth</b> is OAuth2 and OpenID Connect compliant authentication
        app.
        <br />
        Try us out!
      </h2>
      <div class="flex justify-between">
        <PrimaryButton type="button" onClick={() => navigate("/login")}>Login</PrimaryButton>
        <SecondaryButton type="button" onClick={() => navigate("/register")}>Register</SecondaryButton>
      </div>
    </PageBase>
  );
};
