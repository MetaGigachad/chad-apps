import {
  Match,
  ParentProps,
  Show,
  Switch,
  mergeProps,
  useContext,
} from "solid-js";
import { Icon } from "./utils";
import {
  ThemeContext,
  useLoggedInUser,
  useLoggedOutUser,
  UserContext,
} from "@metachad/frontend-common";

export function Layout(props: ParentProps) {
  return <Body>{props.children}</Body>;
}

export function Root(props: ParentProps) {
  const [theme] = useContext(ThemeContext)!;
  return (
    <div
      classList={{ dark: theme() !== "dark" || true }}
      class="transition-colors dark:bg-zinc-900 dark:text-zinc-200"
      id="root"
    >
      {props.children}
    </div>
  );
}

function Body(props: ParentProps) {
  return (
    <div class="flex w-screen flex-col items-stretch">
      <div class="flex h-screen flex-col items-stretch">
        <Header />
        <div class="flex min-h-0 flex-grow flex-col-reverse items-stretch md:flex-row md:items-start">
          {props.children}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="flex items-center justify-between px-4 py-2">
      <h1 class="squada-one-regular text-3xl font-bold">Training App</h1>
      <LoginInfo />
    </header>
  );
}

function LoginInfo() {
  const [user] = useContext(UserContext)!;
  return (
    <Switch>
      <Match when={user.state === "loggedOut"}>
        <LoginButton />
      </Match>
      <Match when={user.state === "loggingIn"}>
        <div class="loader"></div>
      </Match>
      <Match when={user.state === "loggedIn"}>
        <LogoutButton />
      </Match>
    </Switch>
  );
}

function LoginButton(propsRaw: { disabled?: boolean }) {
  const [_, methods] = useLoggedOutUser();
  const props = mergeProps({ disabled: false } as const, propsRaw);
  return (
    <button
      disabled={props.disabled}
      class="flex gap-0.5 rounded-full border border-current pb-1 pl-1 pr-2 pt-0.5 enabled:dark:hover:text-blue-300 disabled:dark:text-zinc-400"
      onClick={async () => await methods().login()}
    >
      <Icon name="login" class="" />
      <span class="font-semibold">Log in</span>
    </button>
  );
}

function LogoutButton(propsRaw: { disabled?: boolean }) {
  const [_, methods] = useLoggedInUser();
  const props = mergeProps({ disabled: false } as const, propsRaw);
  return (
    <button
      disabled={props.disabled}
      class="flex gap-0.5 rounded-full border border-current pb-1 pl-1 pr-2 pt-0.5 enabled:dark:hover:text-blue-300 disabled:dark:text-zinc-400"
      onClick={async () => await methods().logout()}
    >
      <Icon name="logout" class="" />
      <span class="font-semibold">Log out</span>
    </button>
  );
}

function UserIcon() {
  return <div class="rounded-full p-4 dark:bg-zinc-800"></div>;
}

function Footer() {
  return (
    <footer class="flex grow justify-around p-2 font-semibold dark:bg-zinc-925 dark:text-zinc-300">
      <div>
        Made by <span class="font-bold">MetaGigachad</span>
      </div>
    </footer>
  );
}
