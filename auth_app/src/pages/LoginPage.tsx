import { Component } from "solid-js";
import { PageBase } from "../components/PageBase";
import { LineForm } from "../components/LineForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

export const LoginPage: Component = () => {
  const submitHandler = async (fields: { [key: string]: string }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");

    const response = await fetch("http://localhost:3000/api/login", {
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
    
    const data = await response.json();
    console.log(data);
  };

  return (
    <PageBase title="Chad Auth">
      <LineForm
        fields={[
          {
            name: "username",
            label: "Username",
            validator: (x) => (x.length === 0 ? "Empty" : ""),
            cache: true,
            type: "text",
            autocomplete: "username",
          },
          {
            name: "password",
            label: "Password",
            validator: (x) => (x.length === 0 ? "Empty" : ""),
            type: "password",
            autocomplete: "current-password",
          },
        ]}
        onSubmit={submitHandler}
      >
        <div class="flex justify-between">
          <PrimaryButton type="submit">Login</PrimaryButton>
          <a href="/register">
            <SecondaryButton type="button">Register</SecondaryButton>
          </a>
        </div>
      </LineForm>
    </PageBase>
  );
};
