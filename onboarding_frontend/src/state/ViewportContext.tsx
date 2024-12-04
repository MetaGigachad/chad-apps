import { ParentProps, createContext, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

interface ViewportInfo {
  mobile: boolean;
}
export const ViewportContext = createContext<ViewportInfo>();

export function ViewportProvider(props: ParentProps) {
  const mobile = () => window.innerWidth < 768;

  const [viewportInfo, setViewportInfo] = createStore({mobile: mobile()});

  const resizeHandler = () => {
    setViewportInfo("mobile", mobile());
  };

  onMount(() => {
    window.addEventListener('resize', resizeHandler);
  });

  onCleanup(() => {
    window.removeEventListener('resize', resizeHandler);
  })

  return (
    <ViewportContext.Provider value={viewportInfo}>{props.children}</ViewportContext.Provider>
  );
}
