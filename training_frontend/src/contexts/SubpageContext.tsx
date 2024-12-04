import { makePersisted } from "@solid-primitives/storage";
import { Accessor, createContext, createSignal, ParentProps, useContext } from "solid-js";
import { Workout } from "../api";

export const SubpageContext = createContext<[Accessor<WorkoutsPage>, NavigateFn]>();

export function useViewerSubpage() {
  const [subpage, navigate] = useContext(SubpageContext)!;
  return [subpage() as WorkoutsPage & { name: "viewer" }, navigate] as const;
}

export function useEditorSubpage() {
  const [subpage, navigate] = useContext(SubpageContext)!;
  return [subpage() as WorkoutsPage & { name: "editor" }, navigate] as const;
}

export function SubpageProvider(props: ParentProps) {
  const [page, setPage] = makePersisted(
    createSignal<WorkoutsPage>({
      name: "list",
    }),
    { name: "workouts/page" },
  );

  const navigate = (page: WorkoutsPage) => setPage(page);

  return (
    <SubpageContext.Provider value={[page, navigate]}>
      {props.children}
    </SubpageContext.Provider>
  );
}

type NavigateFn = (page: WorkoutsPage) => void;

type WorkoutsPage =
  | { name: "list" }
  | { name: "viewer"; id: string }
  | { name: "editor"; workout: Workout };
