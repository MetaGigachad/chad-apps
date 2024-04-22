import { Component } from "solid-js";
import { PageBase } from "../components/PageBase";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

export const RootPage: Component = () => {
  return (
    <PageBase title="Welcome to Chad Auth">
      <h2 class="mb-4">
        <b>Chad Auth</b> is OAuth2 and OpenID Connect compliant authentication
        app.
        <br />
        Try us out!
      </h2>
      <div class="flex justify-between">
        <a href="/login">
          <PrimaryButton type="button">Login</PrimaryButton>
        </a>
        <a href="/register">
          <SecondaryButton type="button">Register</SecondaryButton>
        </a>
      </div>
    </PageBase>
  );
};
