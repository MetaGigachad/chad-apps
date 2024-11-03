import base64url from "base64url";
import { ParentProps, mergeProps, onMount } from "solid-js";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { localSignal, localSignalOpt } from "../utils";

interface AuthData {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface UserType {
  loggedIn: boolean;
  authData?: AuthData;
  login: () => Promise<void>;
  logout: () => void;
}

type UserProviderProps = ParentProps & {
  localStoragePrefix?: string;
};

export const UserContext = createContext<UserType>();

export function UserProvider(rawProps: UserProviderProps) {
  const props = mergeProps(rawProps, { localStoragePrefix: "user" });
  const [loggingIn, setLoggingIn] = localSignal(`${props.localStoragePrefix}/loggingIn`, false);
  const [data, setData] = localSignalOpt<AuthData>(`${props.localStoragePrefix}/data`);

  const [user, setUser] = createStore<UserType>({ loggedIn: false, login, logout });

  onMount(async () => {
    if (loggingIn()) {
      await getToken();
      return;
    }
    const data = localStorage.getItem(localStoragePrefix + "/data");
    if (data !== null) {
      setUser("authData", JSON.parse(data));
      setUser("loggedIn", true);
      return;
    }
  });

  async function login() {
    const codeVerifier = randomString(64);
    localStorage.setItem(localStoragePrefix + "/verifier", codeVerifier);
    const state = randomString(16);
    localStorage.setItem(localStoragePrefix + "/state", state);
    localStorage.setItem(localStoragePrefix + "/loggingIn", "true");
    window.location.assign(await makeAuthUrl(codeVerifier, state));
  }

  async function logout() {
    for (const item of ["data", "verifier", "state"]) {
      localStorage.removeItem(localStoragePrefix + "/" + item);
    }
    setUser("loggedIn", false);
    setUser("authData", {});
  }

  async function getToken() {
    localStorage.setItem(localStoragePrefix + "/loggingIn", "false");
    const response = await fetch("/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "onboarding_app",
        redirect_uri: window.location.origin.concat("/plans"),
        code_verifier: localStorage.getItem(localStoragePrefix + "/verifier")!,
        code: new URLSearchParams(window.location.search).get("code")!,
      }).toString(),
    });

    if (response.status !== 200) {
      throw "Unexpected response";
    }

    const authData = await response.json();
    localStorage.setItem(localStoragePrefix + "/data", JSON.stringify(authData));
    setUser("authData", authData);
    setUser("loggedIn", true);
  }

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
}

function randomString(length: number) {
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

async function makeAuthUrl(codeVerifier: string, state: string) {
  return import.meta.env.VITE_AUTH_FRONTEND_URL + `/oauth2/auth?`.concat(
    new URLSearchParams({
      response_type: "code",
      client_id: "onboarding_app",
      redirect_uri: window.location.origin.concat("/plans"),
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
