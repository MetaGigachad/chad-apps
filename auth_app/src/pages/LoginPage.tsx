import { Component, Show, createSignal, onMount } from "solid-js";
import { PageBase } from "../components/PageBase";
import { LineForm } from "../components/LineForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

export const LoginPage: Component = () => {
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");

    const response = await fetch("/api/startLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_challenge: loginChallenge,
      }),
    });

    if (response.bodyUsed) {
      const body = await response.json();
      window.location = body["redirect_to"];
    }

    setLoading(false);
  });

  const submitHandler = async (fields: { [key: string]: string }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fields["username"],
        password: fields["password"],
        login_challenge: loginChallenge,
      }),
    }).then((data) => data.json());

    window.location = response["redirect_to"];
  };

  const denyHandler = async (_: MouseEvent) => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");

    const response = await fetch("/api/denyLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_challenge: loginChallenge,
      }),
    }).then((data) => data.json());

    window.location = response["redirect_to"];
  };

  return (
    <Show when={!loading()} fallback={<div class="loader"></div>}>
      <PageBase title="Chad Auth">
        <LineForm
          fields={[
            {
              name: "username",
              label: "Username",
              validator: (x) => (x.length === 0 ? "Required" : ""),
              cache: true,
              type: "text",
              autocomplete: "username",
            },
            {
              name: "password",
              label: "Password",
              validator: (x) => (x.length === 0 ? "Required" : ""),
              type: "password",
              autocomplete: "current-password",
            },
          ]}
          onSubmit={submitHandler}
        >
          <div class="flex justify-between">
            <PrimaryButton type="submit">Login</PrimaryButton>
            <PrimaryButton onClick={denyHandler} type="button">
              Deny
            </PrimaryButton>
            <SecondaryButton
              onClick={(_) => (window.location.pathname = "/register")}
              type="button"
            >
              Register
            </SecondaryButton>
          </div>
        </LineForm>
      </PageBase>
    </Show>
  );
};
