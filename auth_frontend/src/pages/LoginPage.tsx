import { Component, Show, createSignal, onMount } from "solid-js";
import { PageBase } from "../components/PageBase";
import { LineForm } from "../components/LineForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { useNavigate } from "@solidjs/router";

export const LoginPage: Component = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(true);
  const [userExists, setUserExists] = createSignal(true);

  onMount(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");
    if (loginChallenge === null) {
      setLoading(false);
      return
    }
    localStorage.setItem("loginChallenge", loginChallenge);

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
    const loginChallenge = localStorage.getItem("loginChallenge");
    if (loginChallenge === null) {
      throw "No login challenge";
    }

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
    });

    setUserExists(response.status !== 404);

    const body = await response.json();
    if (body["redirect_to"] === undefined) {
      return;
    }
    window.location = body["redirect_to"];
  };

  const denyHandler = async (_: MouseEvent) => {
    const loginChallenge = localStorage.getItem("loginChallenge");
    if (loginChallenge == null) {
      return
    }

    const response = await fetch("/api/denyLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_challenge: loginChallenge,
      }),
    }).then((data) => data.json());

    if (response["redirect_to"] === undefined) {
      console.log(response);
      return;
    }

    window.location = response["redirect_to"];
  };

  return (
    <PageBase title="Chad Auth" back={["< Stop login", denyHandler]}>
      <LineForm
        fields={[
          {
            name: "username",
            label: "Username",
            validator: (x) =>
              x.length === 0
                ? "Required"
                : !userExists()
                  ? "User doesn't exist"
                  : "",
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
        <div class="flex mt-auto gap-4 justify-between">
          <SecondaryButton
            onClick={() => {
              !loading() && navigate("/register");
            }}
            type="button"
          >
            Register
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={loading()}>
            Login
          </PrimaryButton>
        </div>
      </LineForm>
    </PageBase>
  );
};
