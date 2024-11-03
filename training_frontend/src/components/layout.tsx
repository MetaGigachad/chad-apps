import { ParentProps, Show, createSignal, mergeProps, onMount, useContext } from "solid-js";
import { UserContext } from "../contexts/UserContext";
import { Icon } from "./utils";
import { ThemeContext } from "../contexts/ThemeContext";

export function Layout(props: ParentProps) {
  return (
    <Root>
      <FontLoader>
        <Body>{props.children}</Body>
      </FontLoader>
    </Root>
  );
}

function FontLoader(props: ParentProps) {
  const [loadingFonts, setLoadingFonts] = createSignal(true);

  onMount(async () => {
    await Promise.all([
      document.fonts.load('16px "Squada One"'),
      document.fonts.load('16px "Material Symbols Outlined"')
    ]).then(() => {
      console.log('Both fonts have successfully loaded.');
      setLoadingFonts(false);
    }).catch(() => {
      console.log('One or both fonts failed to load.');
    });
  })

  return (
    <Show when={loadingFonts()} fallback={props.children}>
      <div class="w-screen h-screen flex items-center justify-center">
      <div class="loader"></div>
      </div>
    </Show>
  );
}

function Root(props: ParentProps) {
  const theme = useContext(ThemeContext)!;
  return (
    <div
      classList={{ dark: theme.value !== "dark" }}
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
      <div class="flex flex-col items-stretch h-screen">
        <Header />
        <div class="flex md:items-start flex-col-reverse items-stretch md:flex-row flex-grow min-h-0">{props.children}</div>
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
  const user = useContext(UserContext)!;
  return (
    <Show when={user.loggedIn} fallback={<LoginButton />}>
      <UserIcon />
    </Show>
  );
}

function LoginButton(propsRaw: { disabled?: boolean }) {
  const props = mergeProps({ disabled: false } as const, propsRaw);
  return (
    <button
      disabled={props.disabled}
      class="flex gap-0.5 rounded-full border border-current pb-1 pl-1 pr-2 pt-0.5 enabled:dark:hover:text-blue-300 disabled:dark:text-zinc-400"
    >
      <Icon name="login" class="" />
      <span class="font-semibold">Log in</span>
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
