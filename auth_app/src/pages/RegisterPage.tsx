import { Component } from "solid-js";
import { PageBase } from "../components/PageBase";
import { LineForm } from "../components/LineForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

export const RegisterPage: Component = () => {
  const submitHandler = async (fields: { [key: string]: string }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const loginChallenge = queryParams.get("login_challenge");

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fields["username"],
        password: fields["password"],
      }),
    });
    
    const data = await response.text();
    console.log(data);
    console.log("success");
  };

  return (
    <PageBase title="Become Chad">
      <LineForm
        fields={[
          {
            name: "username",
            label: "Username",
            validator: (x) => (x.length === 0 ? "Empty" : ""),
            type: "text",
            autocomplete: "email",
          },
          {
            name: "email",
            label: "Email",
            validator: (x) => (x.length === 0 ? "Empty" : ""),
            type: "email",
            autocomplete: "email",
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
          <PrimaryButton type="submit">Register</PrimaryButton>
          <a href="/login">
            <SecondaryButton type="button">Login</SecondaryButton>
          </a>
        </div>
      </LineForm>
    </PageBase>
  );
};
