import { useNavigate } from "@solidjs/router";
import { Header } from "../components/Header";
import { Button, NavBar } from "../components/NavBar";
import { EditorContext } from "../state/EditorContext";
import { apiFetch, capitalizeObject, sleep, useLoggedInUser } from "@metachad/frontend-common";
import {
  For,
  JSX,
  ParentProps,
  Show,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

export function PlansPage() {
  return (
    <div class="mt-2 flex gap-4 text-zinc-200">
      <NavBar selected={Button.PLANS} />
      <div class="mb-6 mr-6 flex max-w-full flex-wrap gap-4 rounded-2xl bg-zinc-800 p-4">
        <PlansList />
      </div>
    </div>
  );
}

interface Plan {
  textId: string;
  name: string;
}

export function PlansList() {
  const [plans, setPlans] = createSignal(Array<Plan>());
  const [user] = useLoggedInUser();
  const [loading, setLoading] = createSignal(true);

  const updatePlans = async () => {
    setLoading(true);
    const plans: Plan[] = await apiFetch(user, "/plans").then((response) =>
      response.json(),
    );
    setPlans(plans);
    setLoading(false);
  };

  onMount(updatePlans);

  return (
    <div class="w-96 flex flex-col gap-2">
      <div class="flex flex-col overflow-hidden divide-y divide-dotted divide-zinc-600 rounded-xl dark:bg-zinc-700">
        <div class="flex">
          <NewPlanButton onCreate={updatePlans} />
        </div>
        <Show
          when={!loading()}
          fallback={
            <div class="divide-solid">
              <div class="loader ml-auto mr-auto m-2 text-zinc-400"></div>
            </div>
          }
        >
          <Show
            when={plans().length > 0}
            fallback={
              <div class="py-2 flex flex-col items-center font-semibold">
                <div class="text-lg">You have no plans</div>
                <div class="text-sm">
                  Use <b>New plan</b> button to create one
                </div>
              </div>
            }
          >
            <For each={plans()}>
              {(plan) => <Plan plan={plan} updatePlans={updatePlans} />}
            </For>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export function Plan(props: { plan: Plan; updatePlans: () => Promise<void> }) {
  const navigate = useNavigate();

  const [showControls, setShowControls] = createSignal(false);
  const [showDeployOverlay, setShowDeployOverlay] = createSignal(false);
  const [user] = useLoggedInUser();
  const editor = useContext(EditorContext)!;

  const deletePlan = async () => {
    const ok = await apiFetch(user, `/plans/${props.plan.textId}`, {
      method: "DELETE",
    }).then((res) => res.ok);
    if (ok) {
      if (
        editor.plan !== undefined &&
        editor.plan.textId === props.plan.textId
      ) {
        editor.unloadPlan();
      }
      props.updatePlans();
    } else {
      throw "Error in delete operation";
    }
  };

  return (
    <>
      <div
        class="flex items-center p-2 dark:bg-zinc-700 hover:dark:bg-zinc-600 cursor-pointer"
        onMouseEnter={(_) => setShowControls(true)}
        onMouseLeave={(_) => setShowControls(false)}
        onClick={async () => {
          await editor.loadPlan(props.plan.textId, props.plan.name);
          navigate("/editPlan");
        }}
      >
        <div class="flex-auto text-start pl-2">{props.plan.name}</div>
        <div
          style={{ visibility: showControls() ? "visible" : "hidden" }}
          class="flex gap-2"
        >
          <button
            class="dark:text-zinc-400 hover:dark:text-zinc-300"
            onClick={(e) => {
              setShowDeployOverlay(true);
              e.stopPropagation();
            }}
          >
            <span class="material-symbols-outlined text-md">rocket_launch</span>
          </button>
          <button
            class="dark:text-zinc-400 hover:dark:text-zinc-300"
            onClick={(e) => {
              deletePlan();
              e.stopPropagation();
            }}
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <Show when={showDeployOverlay()}>
        <DeployOverlay
          hideOverlay={() => setShowDeployOverlay(false)}
          onDeploy={async () => { }}
          plan={props.plan}
        />
      </Show>
    </>
  );
}

export function NewPlanButton(props: { onCreate: () => Promise<void> }) {
  const [showOverlay, setShowOverlay] = createSignal(false);

  return (
    <button
      class="flex gap-1 items-center p-2 py-3 pr-3 font-bold dark:bg-zinc-700 hover:dark:bg-zinc-600"
      onClick={() => setShowOverlay(true)}
    >
      <span class="material-symbols-outlined">add</span>
      <div class="">New plan</div>
      <Show when={showOverlay()}>
        <NewPlanOverlay
          hideOverlay={() => setShowOverlay(false)}
          onCreate={props.onCreate}
        />
      </Show>
    </button>
  );
}

export function BaseOverlay(props: ParentProps) {
  return (
    <Portal mount={document.querySelector("#popUpRoot")!}>
      <div class="fixed w-screen min-h-screen left-0 top-0 flex flex-col justify-center items-center bg-zinc-950 opacity-90"></div>
      <div class="fixed w-screen min-h-screen left-0 top-0 flex flex-col justify-center items-center font-normal">
        <div class="flex flex-col gap-1 rounded-xl p-2 dark:bg-zinc-700 w-96 dark:text-zinc-200">
          {props.children}
        </div>
      </div>
    </Portal>
  );
}

export function NewPlanOverlay(props: {
  hideOverlay: () => void;
  onCreate: () => Promise<void>;
}) {
  const [plan, setPlan] = createStore({ textId: "", name: "" });
  const [user] = useLoggedInUser();

  const onCreate = async () => {
    if (!/^[a-zA-Z0-9_-]*$/.test(plan.textId)) {
      console.log("Invalid textId");
      return;
    }
    const ok = await apiFetch(user, "/plans", {
      method: "POST",
      body: JSON.stringify(capitalizeObject(plan)),
    }).then((res) => res.ok);
    if (ok) {
      await props.onCreate();
      props.hideOverlay();
    } else {
      console.log("Failed to create plan");
    }
  };

  return (
    <BaseOverlay>
      <div class="flex justify-between items-center text-2xl px-3 py-2">
        <div class="font-bold">New plan</div>
        <button
          class="rounded-md flex flex-col justify-center items-center hover:dark:bg-zinc-600"
          onClick={(_) => props.hideOverlay()}
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <EntryEditor
        placeholder="Plan name..."
        onChange={(e) => setPlan("name", e.target.value)}
      />
      <EntryEditor
        placeholder="Plan id..."
        onChange={(e) => setPlan("textId", e.target.value)}
      />
      <ButtonWithLoader onClick={onCreate}>Create</ButtonWithLoader>
    </BaseOverlay>
  );
}

export function DeployOverlay(props: {
  hideOverlay: () => void;
  onDeploy: () => Promise<void>;
  plan: Plan;
}) {
  const [telegramUsername, setTelegramUsername] = createSignal("");
  const [user] = useLoggedInUser();

  const onDeploy = async () => {
    const ok = await apiFetch(user, "/deployments", {
      method: "POST",
      body: JSON.stringify({
        planTextId: props.plan.textId,
        telegramUsername: telegramUsername(),
      }),
    }).then((x) => x.ok);
    if (ok) {
      await props.onDeploy();
      props.hideOverlay();
    } else {
      throw "Failed deploy";
    }
  };

  return (
    <BaseOverlay>
      <div class="flex justify-between items-center text-2xl px-3 py-2">
        <div class="font-bold">Deploy</div>
        <button
          class="rounded-md flex flex-col justify-center items-center hover:dark:bg-zinc-600"
          onClick={(_) => props.hideOverlay()}
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
      <div class="mx-1 mb-1">
        <b>Plan id</b>: {props.plan.textId}
      </div>
      <EntryEditor
        placeholder="Telegram username..."
        onChange={(e) => setTelegramUsername(e.target.value)}
      />
      <ButtonWithLoader onClick={onDeploy}>Deploy</ButtonWithLoader>
    </BaseOverlay>
  );
}

export function ButtonWithLoader(
  props: ParentProps<{ onClick: () => Promise<void> }>,
) {
  const [loading, setLoading] = createSignal(false);
  const [clicked, setClicked] = createSignal(false);
  const onClick = async (_: any) => {
    setClicked(true);
    await Promise.all([
      props.onClick(),
      sleep(200).then(() => setLoading(true)),
    ]);
    setLoading(false);
    setClicked(false);
  };

  return (
    <button
      class="mt-1 p-1 rounded-md font-bold"
      classList={{
        "dark:text-zinc-700 dark:bg-zinc-300 hover:dark:bg-zinc-200":
          !loading() && !clicked(),
        "dark:text-zinc-300": loading(),
        "dark:text-zinc-700 dark:bg-zinc-300": !loading() && clicked(),
      }}
      disabled={clicked()}
      onClick={onClick}
    >
      <Show
        when={!loading()}
        fallback={<div class="loader ml-auto mr-auto m-0.5"></div>}
      >
        {props.children}
      </Show>
    </button>
  );
}

export function EntryEditor(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      class="resize-y rounded-lg border border-zinc-400 bg-zinc-700 px-2 py-1 text-md text-zinc-200 focus:border-zinc-200 focus:outline-none"
      type="text"
      autocomplete="off"
    ></input>
  );
}
