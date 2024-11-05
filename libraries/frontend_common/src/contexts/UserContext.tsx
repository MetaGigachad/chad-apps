import { randomString } from "../utils/rand";
import { makePersisted } from "@solid-primitives/storage";
import base64url from "base64url";
import {
    Accessor,
  ParentProps,
  createEffect,
  createMemo,
  mergeProps,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { createContext } from "solid-js";
import { reconcile, createStore, unwrap } from "solid-js/store";
import { clearSearchParams } from "../utils/etc";

export const UserContext = createContext<[UserContextDataType, Accessor<UserContextMethodsType>]>();

export function useLoggedInUser() {
  return useContext(UserContext)! as [UserContextLoggedInDataType, Accessor<UserContextLoggedInMethodsType>];
}

export function useLoggedOutUser() {
  return useContext(UserContext)! as [UserContextLoggedOutDataType, Accessor<UserContextLoggedOutMethodsType>];
}

export function UserProvider(rawProps: UserProviderProps) {
  const props = mergeProps(rawProps, { localStorageKey: "user" });
  console.log("Using v1.0.0");

  const [context, setContext] = makePersisted(
    createStore<UserContextDataType>({ state: "loggedOut" }),
    { name: props.localStorageKey },
  );

  const methods: Accessor<UserContextMethodsType> = createMemo(() => {
    switch (context.state) {
      case "loggedOut":
        return { login };
      case "loggedIn":
        return { logout };
      default:
        return {};
    }
  });
  createEffect(() => 
  console.log("common", context, methods));

  async function login() {
    const newContext: UserContextDataType = {
      state: "loggingIn",
      data: {
        codeVerifier: randomString(64),
        state: randomString(16),
      },
    };
    setContext(reconcile(newContext));

    await oauth2Redirect(newContext.data);
  }

  async function oauth2Redirect(data: { codeVerifier: string; state: string }) {
    const codeVerifierBytes = new TextEncoder().encode(data.codeVerifier);
    const codeVerifierHash = await crypto.subtle.digest(
      "SHA-256",
      codeVerifierBytes,
    );
    const codeChallenge = base64url.encode(codeVerifierHash as Buffer);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: props.oauth2Config.clientId,
      redirect_uri: props.oauth2Config.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: "openid offline",
      state: data.state,
    });

    console.log("redirecting to ", `${props.oauth2Config.authUrl}?${params.toString()}`);
    window.location.assign(
      `${props.oauth2Config.authUrl}?${params.toString()}`,
    );
  }

  onMount(async () => {
    await exchangeCodeForTokens();
  });

  async function exchangeCodeForTokens() {
    if (context.state !== "loggingIn") {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    clearSearchParams();

    const error = urlParams.get("error");
    if (error === "access_denied") {
      setContext(reconcile({state: "loggedOut"}));
      return;
    }

    const code = urlParams.get("code");
    if (code == null) {
      console.log(`Authorization code wasn't provided by OAuth2 endpoint`);
      setContext(reconcile({state: "loggedOut"}));
      return;
    }

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: props.oauth2Config.clientId,
      redirect_uri: props.oauth2Config.redirectUri,
      code_verifier: context.data.codeVerifier,
      code,
    }).toString();
    const res: Response = await fetch(props.oauth2Config.tokenUrl, {
      method: "POST",
      headers,
      body,
    });
    if (!res.ok) {
      console.log(`Code for tokens exchange failed: ${res.status}`);
      setContext(reconcile({state: "loggedOut"}));
      return;
    }
    const oauth2Data: OAuth2Data = await res.json();

    const newContext: UserContextDataType = {
      state: "loggedIn",
      data: oauth2Data,
      refreshedAt: Date.now(),
      checked: true,
    };
    setContext(reconcile(newContext));
  }

  let refreshTimeoutId: NodeJS.Timeout | undefined;
  createEffect(() => {
    const ctx = unwrap(context);
    if (ctx.state !== "loggedIn") {
      clearTimeout(refreshTimeoutId);
      return;
    }
    const precideExprirationBy = 30000;
    const nextRefreshAt =
      ctx.refreshedAt + ctx.data.expires_in * 1000 - precideExprirationBy;
    const nextRefreshIn = nextRefreshAt - Date.now();
    if (!ctx.checked && nextRefreshIn > 0) {
      ctx.checked = true;
      setContext(reconcile(ctx));
    }
    refreshTimeoutId = setTimeout(refresh, nextRefreshIn);
  });
  onCleanup(() => {
    clearTimeout(refreshTimeoutId);
  });

  async function refresh() {
    const ctx = unwrap(context);
    if (ctx.state !== "loggedIn") {
      return;
    }

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: ctx.data.refresh_token,
      client_id: props.oauth2Config.clientId,
    }).toString();
    const res: RefreshResponse = await fetch(props.oauth2Config.tokenUrl, {
      method: "POST",
      headers,
      body,
    }).then((res) => {
      if (!res.ok) {
        throw `Tokens refresh failed: ${res.status}`;
      }
      return res.json();
    });

    ctx.data.access_token = res.access_token;
    ctx.data.refresh_token = res.refresh_token;
    ctx.data.expires_in = res.expires_in;
    ctx.data.token_type = res.token_type;
    ctx.checked = true;
    setContext(reconcile(ctx));
  }

  async function logout() {
    const newContext: UserContextDataType = {
      state: "loggedOut",
    };
    console.log("loggin out");
    setContext(reconcile(newContext));
  }

  return (
    <UserContext.Provider value={[context, methods]}>
      {props.children}
    </UserContext.Provider>
  );
}

type UserContextDataType = UserContextLoggedOutDataType | UserContextLoggingInDataType | UserContextLoggedInDataType;

type UserContextMethodsType = UserContextLoggedOutMethodsType | UserContextLoggingInMethodsType | UserContextLoggedInMethodsType;

interface UserContextLoggedOutDataType {
  state: "loggedOut";
}

interface UserContextLoggedOutMethodsType {
  login(): Promise<void>;
}

interface UserContextLoggingInDataType {
  state: "loggingIn";
  data: {
    codeVerifier: string;
    state: string;
  };
}

interface UserContextLoggingInMethodsType {
}

export interface UserContextLoggedInDataType {
  state: "loggedIn";
  data: OAuth2Data;
  refreshedAt: number;
  checked: boolean;
}

interface UserContextLoggedInMethodsType {
  logout(): Promise<void>;
}

interface OAuth2Data {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface RefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

type UserProviderProps = ParentProps & {
  oauth2Config: OAuth2Config;
  localStorageKey?: string;
};

interface OAuth2Config {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
}
