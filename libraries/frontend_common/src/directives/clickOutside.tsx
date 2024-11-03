import { Accessor, onCleanup } from "solid-js";
import { assertIsNode } from "../utils/types";

export const clickOutside = (el: Element, accessor: Accessor<() => void>) => {
  const onClick = ({ target }: MouseEvent) => {
    assertIsNode(target);
    if (!el.contains(target)) {
      accessor()?.();
    }
  };

  document.body.addEventListener("click", onClick);
  onCleanup(() => document.body.removeEventListener("click", onClick));
};

declare module "solid-js" {
  namespace JSX {
    interface DirectiveFunctions {
      clickOutside: typeof clickOutside;
    }
  }
}

