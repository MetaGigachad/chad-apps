import { EditorContext } from "../state/EditorContext";
import { ArrayElement, sleep } from "@metachad/frontend-common";
import { ButtonWithDropdown } from "./ButtonWithDropdown";
import { DaySelector } from "./DaySelector";
import { IntervalSelector } from "./IntervalSelector";
import {
  Component,
  For,
  JSX,
  Match,
  ParentComponent,
  Setter,
  Show,
  Switch,
  createEffect,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

let blockTypes = ["Feed info", "Assign task", "Meta"] as const;
type BlockType = ArrayElement<typeof blockTypes>;
type BlockTypeChangeHandler = (newType: BlockType) => void;

type BlockDataStore = ReturnType<typeof createStore<BlockData>>;
type Store<T extends object> = ReturnType<typeof createStore<T>>;

export type BlockData = FeedInfoData | AssignTaskData | MetaData;

interface FeedInfoData {
  readonly type: "Feed info";
  day: number;
  content: string;
}

interface AssignTaskData {
  readonly type: "Assign task";
  interval: [number, number];
  name: string;
  description: string;
}

interface MetaData {
  readonly type: "Meta";
  key: string;
  value: string;
}

export const Plan: Component = () => {
  const editor = useContext(EditorContext)!;
  const [blocks, setBlocks] = createSignal<Store<BlockData>[]>([]);

  const [defaultDays, setDefaultDays] = createSignal(
    Array<number>(blocks().length),
  );
  createEffect(() => {
    const minDays = Array<number>(blocks().length);
    let currentDay = 1;
    for (let i = 0; i < blocks().length; i++) {
      const data = blocks()[i][0];
      if (data.type === "Feed info") {
        currentDay = data.day;
      } else if (data.type === "Assign task") {
        currentDay = data.interval[0];
      }
      minDays[i] = currentDay;
    }
    setDefaultDays(minDays);
  });

  onMount(() => {
    if (editor.plan !== undefined) {
      setBlocks(editor.plan.blocks.map((x) => createStore(x)));
    }
  });

  return (
    <div class="flex flex-col items-center gap-2 w-96">
      <Show
        when={editor.plan !== undefined}
        fallback={
          <div class="font-bold flex flex-col items-center pt-5">
            <div class="text-2xl">No plan selected</div>
            <div class="font-semibold mt-2">Create plan in Plans tab</div>
          </div>
        }
      >
        <div class="flex justify-between self-stretch">
          <div class="pl-1 text-2xl font-bold">{editor.plan!.name}</div>
          <MigrateButton
            onClick={() => editor.migratePlan(blocks().map((x) => x[0]))}
          />
        </div>
        <Show
          when={blocks().length > 0}
          fallback={
            <button
              class="p-2 font-bold text-md flex items-center rounded-xl border dark:border-zinc-700 dark:text-zinc-700 hover:dark:text-zinc-400"
              onClick={() =>
                setBlocks([
                  createStore<BlockData>({
                    type: "Feed info",
                    day: 1,
                    content: "",
                  }),
                ])
              }
            >
              <span class="material-symbols-outlined">add</span>
            </button>
          }
        >
          <For each={blocks()}>
            {(block, i) => (
              <BlockWithControls
                setBlocks={setBlocks}
                blockData={block}
                index={i()}
                defaultDay={defaultDays()[i()]}
                showDelete={true}
              />
            )}
          </For>
        </Show>
      </Show>
    </div>
  );
};

export function MigrateButton(props: { onClick: () => Promise<void> }) {
  const [state, setState] = createSignal<"button" | "loader" | "msg">("button");

  return (
    <Switch>
      <Match when={state() === "button"}>
        <button
          class="p-2 font-bold text-md rounded-xl dark:bg-zinc-300 dark:text-zinc-700 hover:dark:bg-zinc-200"
          onClick={async () => {
            await Promise.all([props.onClick(), sleep(200).then(() => setState("loader"))])
            setState("msg");
            await sleep(1000);
            setState("button");
          }}
        >
          Migrate
        </button>
      </Match>
      <Match when={state() === "loader"}>
        <div class="p-2 font-bold text-md rounded-xl dark:text-zinc-400 ring dark:ring-zinc-400">Loading</div>
      </Match>
      <Match when={state() === "msg"}>
        <div class="p-2 font-bold text-md rounded-xl dark:bg-green-300 dark:text-zinc-700">Success</div>
      </Match>
    </Switch>
  );
}

export const BlockWithControls: Component<{
  setBlocks: Setter<BlockDataStore[]>;
  blockData: BlockDataStore;
  index: number;
  defaultDay: number;
  showDelete: boolean;
}> = (props) => {
  const [show, setShow] = createSignal(false);

  let [newBlockDay, setNewBlockDay] = createSignal(props.defaultDay);

  createEffect(() => {
    const data = props.blockData[0];
    if (data.type === "Feed info") {
      setNewBlockDay(data.day);
    } else if (data.type === "Assign task") {
      setNewBlockDay(data.interval[0]);
    }
  });

  let ref: HTMLDivElement;

  return (
    <div
      ref={ref!}
      class="flex flex-col items-start gap-2 w-96"
      onMouseEnter={(_) => setShow(true)}
      onMouseLeave={(_) => setShow(false)}
    >
      <Block
        blockData={props.blockData}
        defaultDay={props.defaultDay}
        onDateChange={() => {
          props.setBlocks((xPrev) => {
            const val = xPrev[props.index];
            let x = xPrev.toSpliced(props.index, 1);
            let blockDay = 0;
            const data = val[0];
            if (data.type === "Feed info") {
              blockDay = data.day;
            } else if (data.type === "Assign task") {
              blockDay = data.interval[0];
            }
            let currentDay = 1;
            let result = x.length;
            for (let i = 0; i < x.length; i++) {
              const data = x[i][0];
              if (data.type === "Feed info") {
                currentDay = data.day;
              } else if (data.type === "Assign task") {
                currentDay = data.interval[0];
              }
              if (blockDay < currentDay) {
                result = i;
                break;
              }
            }
            if (result === props.index) {
              return xPrev;
            }
            return x.toSpliced(result, 0, val);
          });
          ref.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />
      <div
        style={{ visibility: show() ? "visible" : "hidden" }}
        class="flex items-center gap-2 text-xs"
      >
        <span class="material-symbols-outlined dark:text-zinc-700">
          subdirectory_arrow_right
        </span>
        <div class="flex items-stretch rounded-xl text-xs border overflow-hidden dark:border-zinc-700 dark:text-zinc-700">
          <div class="px-2 py-1 dark:bg-zinc-700 dark:text-zinc-800">
            <span class="material-symbols-outlined">add</span>
          </div>
          <button
            class="px-2 hover:dark:text-zinc-400"
            onClick={(_) => {
              props.setBlocks((x) => {
                x.splice(
                  props.index,
                  0,
                  createStore<BlockData>({
                    type: "Feed info",
                    day: newBlockDay(),
                    content: "",
                  }),
                );
                return x.slice();
              });
            }}
          >
            <span class="material-symbols-outlined">arrow_upward</span>
          </button>
          <button
            class="px-2 hover:dark:text-zinc-400"
            onClick={(_) => {
              props.setBlocks((x) => {
                x.splice(
                  props.index + 1,
                  0,
                  createStore<BlockData>({
                    type: "Feed info",
                    day: newBlockDay(),
                    content: "",
                  }),
                );
                return x.slice();
              });
            }}
          >
            <span class="material-symbols-outlined">arrow_downward</span>
          </button>
        </div>
        <Show when={props.showDelete}>
          <div class="flex items-center rounded-xl text-xs border dark:border-zinc-700 dark:text-zinc-700">
            <button
              class="px-2 py-1 hover:dark:text-zinc-400"
              onClick={(_) => {
                props.setBlocks((x) => {
                  x.splice(props.index, 1);
                  return x.slice();
                });
              }}
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export const Block: Component<{
  blockData: BlockDataStore;
  defaultDay: number;
  onDateChange: () => void;
}> = (props) => {
  const typeToComponent = {
    "Feed info": FeedInfoBlock,
    "Assign task": AssignTaskBlock,
    Meta: MetaBlock,
  };
  let dateChangeCount = 0;
  return (
    <Dynamic
      component={typeToComponent[props.blockData[0].type]}
      onDateChange={() => {
        dateChangeCount++;
        if (dateChangeCount === 1) {
          return;
        }
        props.onDateChange();
      }}
      blockData={props.blockData as any}
      onBlockTypeChange={(newType: BlockType) =>
        props.blockData[1]((old) => {
          dateChangeCount = 0;
          if (old.type === newType) {
            return old;
          }
          if (old.type === "Feed info" && newType === "Assign task") {
            return {
              type: newType,
              interval: [old.day, old.day + 1],
              name: "",
              description: "",
            };
          } else if (old.type === "Assign task" && newType === "Feed info") {
            return {
              type: newType,
              day: old.interval[0],
              content: "",
            };
          }
          switch (newType) {
            case "Feed info":
              return {
                type: newType,
                day: props.defaultDay,
                content: "",
              };
            case "Assign task":
              return {
                type: newType,
                interval: [props.defaultDay, props.defaultDay + 1],
                name: "",
                description: "",
              };
            case "Meta":
              return {
                type: newType,
                key: "",
                value: "",
              };
          }
        })
      }
    />
  );
};

export const FeedInfoBlock: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<FeedInfoData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <BaseBlock header={<FeedInfoHeader {...props} />}>
      <TextEditor
        placeholder="Add info content here..."
        onChange={(x) => props.blockData[1]("content", x)}
        value={props.blockData[0].content}
      />
    </BaseBlock>
  );
};

export const AssignTaskBlock: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<AssignTaskData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <BaseBlock header={<AssignTaskHeader {...props} />}>
      <TitleEditor
        placeholder="Add task name..."
        onChange={(x) => props.blockData[1]("name", x)}
        value={props.blockData[0].name}
      />
      <TextEditor
        placeholder="Add task description..."
        onChange={(x) => props.blockData[1]("description", x)}
        value={props.blockData[0].description}
      />
    </BaseBlock>
  );
};

export const MetaBlock: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<MetaData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <BaseBlock header={<MetaHeader {...props} />}>
      <TitleEditor
        placeholder="Add key here..."
        onChange={(x) => props.blockData[1]("key", x)}
        value={props.blockData[0].key}
      />
      <TextEditor
        placeholder="Add value here..."
        onChange={(x) => props.blockData[1]("value", x)}
        value={props.blockData[0].value}
      />
    </BaseBlock>
  );
};

export const BaseBlock: ParentComponent<{ header: JSX.Element }> = (props) => {
  let ref: HTMLDivElement;
  const [highlight, setHighlight] = createSignal(true);
  onMount(() => {
    ref.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(false), 200);
  });
  return (
    <div
      ref={ref!}
      class="flex flex-col place-self-stretch gap-1 rounded-xl p-2 transition-colors duration-1000"
      classList={{
        "dark:bg-zinc-700": !highlight(),
        "dark:bg-zinc-600": highlight(),
      }}
    >
      <div>{props.header}</div>
      {props.children}
    </div>
  );
};

export const FeedInfoHeader: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<FeedInfoData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <div class="flex justify-between">
      <ButtonWithDropdown
        values={blockTypes}
        current={"Feed info"}
        onChange={props.onBlockTypeChange}
      />
      <DaySelector
        default={props.blockData[0].day}
        onChange={(newDay) => {
          props.blockData[1]("day", newDay);
          props.onDateChange();
        }}
      />
    </div>
  );
};

export const AssignTaskHeader: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<AssignTaskData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <div class="flex justify-between">
      <ButtonWithDropdown
        values={blockTypes}
        current={"Assign task"}
        onChange={props.onBlockTypeChange}
      />
      <IntervalSelector
        default={props.blockData[0].interval}
        onChange={(newInterval) => {
          props.blockData[1]("interval", newInterval);
          props.onDateChange();
        }}
      />
    </div>
  );
};

export const MetaHeader: Component<{
  onBlockTypeChange: BlockTypeChangeHandler;
  blockData: Store<MetaData>;
  onDateChange: () => void;
}> = (props) => {
  return (
    <div class="flex justify-between">
      <ButtonWithDropdown
        values={blockTypes}
        current={"Meta"}
        onChange={props.onBlockTypeChange}
      />
    </div>
  );
};

export const TitleEditor: Component<{
  placeholder: string;
  onChange: (newValue: string) => void;
  value: string;
}> = (props) => {
  return (
    <input
      placeholder={props.placeholder}
      class="resize-y rounded-lg border border-zinc-400 bg-zinc-700 px-2 py-1 text-lg text-zinc-200 focus:border-zinc-200 focus:outline-none"
      type="text"
      autocomplete="off"
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    ></input>
  );
};

export const TextEditor: Component<{
  placeholder: string;
  onChange: (newValue: string) => void;
  value: string;
}> = (props) => {
  return (
    <textarea
      placeholder={props.placeholder}
      class="resize-y rounded-lg border border-zinc-400 bg-zinc-700 px-2 py-1 text-sm text-zinc-200 focus:border-zinc-200 focus:outline-none"
      rows="6"
      cols="26"
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
    ></textarea>
  );
};
