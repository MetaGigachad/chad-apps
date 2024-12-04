import { makePersisted } from "@solid-primitives/storage";
import { Accessor, createContext, createSignal, ParentProps, useContext } from "solid-js";

export const LogsContext =
  createContext<[Accessor<LogsSubpage>, Accessor<LogsMethods>]>();

export function useViewerSubpage() {
  const [subpage, methods] = useContext(LogsContext)!;
  return [subpage() as LogsSubpage & { name: "viewer" }, methods] as const;
}

export function LogsProvider(props: ParentProps) {
  const [page, setPage] = makePersisted(
    createSignal<LogsSubpage>({
      name: "list",
    }),
    { name: "logs/subpage" },
  );

  const navigate = (page: LogsSubpage) => setPage(page);

  const methods = () => ({
    navigate,
  });

  return (
    <LogsContext.Provider value={[page, methods]}>
      {props.children}
    </LogsContext.Provider>
  );
}

type LogsSubpage = { name: "list" } | { name: "viewer", id: string };

type LogsMethods = {
  navigate(newSubpage: LogsSubpage): void;
};
