import { BlockData } from "../components/blocks";
import { apiFetch } from "../utils";
import { UserContext } from "./UserContext";
import { ParentProps, createContext, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export interface EditorType {
  plan?: {
    textId: string;
    name: string;
    blocks: BlockData[];
  };
  loadPlan: (textId: string, name: string) => Promise<void>;
  migratePlan: (blocks: BlockData[]) => Promise<void>;
  unloadPlan: () => void;
}

export const EditorContext = createContext<EditorType>();

export function EditorProvider(props: ParentProps) {
  const [editor, setEditor] = createStore<EditorType>({ loadPlan, migratePlan, unloadPlan });

  const user = useContext(UserContext)!;

  async function loadPlan(textId: string, name: string) {
    const blocks: BlockData[] = await apiFetch(user, `/plans/${textId}`).then(
      (res) => res.json(),
    );
    setEditor("plan", { textId, name, blocks });
    localStorage.setItem("/editor", JSON.stringify(editor));
  }

  async function migratePlan(blocks: BlockData[]) {
    if (editor.plan === undefined) {
      throw "Tried to migrate, but no plan is loaded";
    }
    const ok = await apiFetch(user, `/plans/${editor.plan.textId}`, {
      method: "POST",
      body: JSON.stringify(blocks),
    }).then(x => x.ok);
    if (ok) {
      setEditor("plan", "blocks", blocks);
      localStorage.setItem("/editor", JSON.stringify(editor));
    }
  }
  
  async function unloadPlan() {
    localStorage.removeItem("/editor");
  }

  onMount(() => {
    const rawEditor = localStorage.getItem("/editor");
    if (rawEditor == null) {
      return
    }
    setEditor(JSON.parse(rawEditor));
  });

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  );
}
