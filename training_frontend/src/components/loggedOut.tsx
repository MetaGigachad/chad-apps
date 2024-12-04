import workouts_list from "../assets/workouts_list.png";
import workouts_viewer from "../assets/workouts_viewer.png";
import add_exercise from "../assets/add_exercise.png";
import train_next from "../assets/train_next.png";
import train_inprogress from "../assets/train_inprogress.png";
import train_results from "../assets/train_results.png";
import logs_list from "../assets/logs_list.png";
import logs_viewer from "../assets/logs_viewer.png";
import { ParentProps } from "solid-js";

export function LoggedOutPageMain() {
  return (
    <div class="grid max-h-full md:grid-cols-1 gap-2 overflow-y-scroll md:px-48">
      <DescriptionBlock
        title="Manage workouts"
        body="Use workouts tab to create, view and edit your workouts"
      />
      <ImageBlock>
        <Img src={workouts_list} />
        <Img src={workouts_viewer} />
        <Img src={add_exercise} />
      </ImageBlock>
      <DescriptionBlock
        title="Start workouts"
        body="You can start workout in train tab. While your workout progresses you can change exercises, record your repetitions and weights. After you finished your workout will be logged"
      />
      <ImageBlock>
        <Img src={train_next} />
        <Img src={train_inprogress} />
        <Img src={train_results} />
      </ImageBlock>
      <DescriptionBlock
        title="View workout logs"
        body="In logs tab you can found logs for all workouts you have finished"
      />
      <ImageBlock>
        <Img src={logs_list} />
        <Img src={logs_viewer} />
      </ImageBlock>
    </div>
  );
}

function ImageBlock(props: ParentProps) {
  return (
    <div class="m-20 my-10 flex justify-center gap-10 md:h-72 rounded-2xl md:flex-row flex-col">
      {props.children}
    </div>
  );
}

function Img(props: { src: string }) {
  return (
    <div class="rounded-xl overflow-hidden outline-8 shadow-lg shadow-zinc-950 border-4 dark:border-zinc-600">
      <img class="h-full w-full object-contain" {...props} />;
    </div>
  );
}

function DescriptionBlock(props: { title: string; body: string }) {
  return (
    <div class="p-10 px-20">
      <div class="flex flex-col items-center">
        <h2 class="text-xl font-semibold">{props.title}</h2>
        <p class="text-center">{props.body}</p>
      </div>
    </div>
  );
}
