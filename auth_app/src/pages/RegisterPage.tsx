import { Component, Show, createSignal } from "solid-js";
import { PageBase } from "../components/PageBase";
import { LineForm } from "../components/LineForm";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { useNavigate } from "@solidjs/router";

export const RegisterPage: Component = () => {
  const navigate = useNavigate();

  const [password, setPassword] = createSignal("");
  const [success, setSuccess] = createSignal(false);
  const [conflict, setConflict] = createSignal(false);

  const submitHandler = async (fields: { [key: string]: string }) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fields["username"],
        password: fields["password"],
      }),
    });
    
    setSuccess(response.status === 200);
    setConflict(response.status === 409);
  };

  return (
    <PageBase title="Become Chad" back={["< Login", () => navigate("/login")]}>
      <LineForm
        fields={[
          {
            name: "username",
            label: "Username",
            validator: (x) => (x.length === 0 ? "Required" : (conflict() ? "Username is already taken" : "")),
            type: "text",
            autocomplete: "email",
          },
          {
            name: "password",
            label: "Password",
            validator: (x) => {setPassword(x); return x.length === 0 ? "Required" : ""},
            type: "password",
            autocomplete: "current-password",
          },
          {
            name: "confirm-password",
            label: "Confirm password",
            validator: (x) => (x.length === 0 ? "Required" : (password() !== x ? "Doesn't match" : "")),
            type: "password",
            autocomplete: "current-password",
          },
        ]}
        onSubmit={submitHandler}
      >
        <div class="flex justify-center">
          <PrimaryButton type="submit">Register</PrimaryButton>
          {/* <SecondaryButton onClick={(_) => window.location.pathname = "/login"} type="button">Login</SecondaryButton> */}
        </div>
        <Show when={success()}>
          <h3 class="mt-4 font-semibold text-center">Successfully registered!</h3>
        </Show>
      </LineForm>
    </PageBase>
  );
};
