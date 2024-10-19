import { ParentProps, createContext } from "solid-js";

export const OverlayContext = createContext<OverlayInfo>();
interface OverlayInfo {
  close: () => void;
}

export function OverlayProvider(props: ParentProps & {close: () => void}) {
  return (
    <OverlayContext.Provider value={{close: props.close}}>
      {props.children}
    </OverlayContext.Provider>
  );
}
