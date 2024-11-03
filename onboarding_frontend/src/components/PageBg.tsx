import { Component, JSX, useContext } from "solid-js";
import { ThemeContext } from "@metachad/frontend-common"

interface PageBgProps {
  children?: JSX.Element;
}

export const PageBg: Component<PageBgProps> = (props) => {
  const theme = useContext(ThemeContext)!;
  return (
    <div
      class="min-h-screen bg-gradient-to-br from-red-300 to-blue-500 dark:from-slate-700 dark:to-slate-900"
      classList={{ dark: theme.value === "dark" }}
      id="popUpRoot"
    >
      {props.children}
    </div>
  );
};