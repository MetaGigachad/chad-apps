import base64url from "base64url";
import { Component, createSignal, onMount } from "solid-js";

export const [authData, setAuthData] = createSignal<AuthData>();
export const loggedIn = () => authData() !== undefined;

export const AuthState: Component = () => {
  onMount(async () => {
    const data = localStorage.getItem(storePref + "/data");
    if (data === null) {
      return;
    }
    setAuthData(JSON.parse(data));
  });

  return <></>;
};

const storePref = AuthState.name;

const randomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const makeAuthUrl = async (codeVerifier: string, state: string) => {
  return `http://localhost:4444/oauth2/auth?`.concat(
    new URLSearchParams({
      response_type: "code",
      client_id: "training_app",
      redirect_uri: window.location.origin.concat("/callback"),
      code_challenge: base64url.encode(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(codeVerifier),
        ),
      ),
      code_challenge_method: "S256",
      state,
    }).toString(),
  );
};

export const startLogin = async () => {
  const codeVerifier = randomString(64);
  localStorage.setItem(storePref + "/verifier", codeVerifier);
  const state = randomString(16);
  localStorage.setItem(storePref + "/state", state);

  window.location.assign(await makeAuthUrl(codeVerifier, state));
};

export const finishLogin = async () => {
  const response = await fetch("http://localhost:4444/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "training_app",
      redirect_uri: window.location.origin.concat("/callback"),
      code_verifier: localStorage.getItem(storePref + "/verifier")!,
      code: new URLSearchParams(window.location.search).get("code")!,
    }).toString(),
  });

  if (response.status !== 200) {
    throw "Unexpected response";
  }

  const authData = await response.json();
  localStorage.setItem(storePref + "/data", JSON.stringify(authData));
  setAuthData(authData);
};

interface AuthData {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}
