import { makePersisted } from "@solid-primitives/storage";
import { Accessor, ParentProps, createContext, createSignal } from "solid-js";

type Theme = "light" | "dark";
export interface ThemeContextType {
  value: Theme;
  toggle: () => void;
}
export const ThemeContext = createContext<[Accessor<Theme>, () => void]>();

export function ThemeProvider(props: ParentProps) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = prefersDark ? "dark" : "light";

  const [theme, setTheme] = makePersisted(createSignal<Theme>(defaultTheme), {
    name: "theme",
  });

  const toggle = () => {
    if (theme() === "light") {
      setTheme("dark");
    } else if (theme() === "dark") {
      setTheme("light");
    } else {
      throw `'${theme()}' is not a valid value for theme`;
    }
  };

  return (
    <ThemeContext.Provider value={[theme, toggle]}>
      {props.children}
    </ThemeContext.Provider>
  );
}
