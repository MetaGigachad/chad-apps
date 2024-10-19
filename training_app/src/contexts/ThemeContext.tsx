import { ParentProps, createContext } from "solid-js";
import { localSignal } from "../utils";

type Theme = "light" | "dark";
interface ThemeContextType {
  value: Theme;
  toggle: () => void;
}
export const ThemeContext = createContext<ThemeContextType>();

export function ThemeProvider(props: ParentProps) {
  const [theme, setTheme] = localSignal<Theme>("theme", "light");

  const context: ThemeContextType = {
    value: theme(),
    toggle: () => {
      if (theme() === "light") {
        setTheme("dark");
      } else if (theme() === "dark") {
        setTheme("light");
      }
    },
  };

  return (
    <ThemeContext.Provider value={context}>
      {props.children}
    </ThemeContext.Provider>
  );
}
