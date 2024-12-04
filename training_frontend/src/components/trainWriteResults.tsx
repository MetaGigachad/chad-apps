import { Accessor, createSignal, Setter, useContext } from "solid-js";
import { TrainContext } from "../contexts/TrainContext";
import { Show, JSX } from "solid-js";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";
import { Timer } from "./trainInProgress";

export function TrainWriteResults() {
  const [_, data, methods] = useContext(TrainContext)!;
  const e = methods().getCurrentExercise();
  const [form, setForm] = createSignal({ reps: e.repRange[1], weight: 0 });

  return (
    <div class="flex h-full flex-col-reverse md:flex-col md:items-center md:justify-center">
      <Controls form={form} />
      <WriteResults setForm={setForm} />
    </div>
  );
}

function Controls(props: { form: Accessor<Form> }) {
  const [_, data, methods] = useContext(TrainContext)!;

  return (
    <div class="flex items-center pt-2 md:pt-0">
      <div class="mx-auto flex gap-x-2 md:mx-0 md:flex-grow-0">
        <Button
          disableAdapt={true}
          icon="resume"
          text="Continue"
          onClick={() => {
            const form = props.form();
            methods().writeResults(form.reps, form.weight);
          }}
        />
      </div>
    </div>
  );
}

function WriteResults(props: { setForm: Setter<Form> }) {
  const [_, data, methods] = useContext(TrainContext)!;
  const e = methods().getCurrentExercise();

  return (
    <div class="flex flex-grow md:flex-grow-0 flex-col px-3 py-2 md:shadow md:border md:border-zinc-700 md:mt-2 md:rounded-xl md:p-4">
      <h3 class="mb-2 text-3xl font-bold">Write Results</h3>
      <div class="mb-2 text-2xl font-bold">{e.exercise.name}</div>
      <div class="mb-2">
        <div class="mb-0.5 font-semibold">Reps</div>
        <Input
          type="number"
          min={0}
          value={e.repRange[1]}
          onChange={(e) =>
            props.setForm((x) => ({ ...x, reps: e.target.valueAsNumber }))
          }
        />
      </div>
      <div>
        <div class="mb-0.5 font-semibold">Weight</div>
        <Input
          type="number"
          min={0}
          value={0}
          onChange={(e) =>
            props.setForm((x) => ({ ...x, weight: e.target.valueAsNumber }))
          }
        />
      </div>
      <Timer startTime={data.exerciseLog.endedAt} isRest={true} />
    </div>
  );
}

function Input(
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "class">,
) {
  return (
    <input
      class="rounded-lg border bg-transparent px-2 py-1 outline-none dark:text-zinc-200 focus:dark:border-blue-300 w-full"
      {...props}
    />
  );
}

interface Form {
  reps: number;
  weight: number;
}
