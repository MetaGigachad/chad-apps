import deploy from "../assets/deploy.png";
import edit from "../assets/edit.png";
import plans from "../assets/plans.png";
import { useLoggedOutUser } from "@metachad/frontend-common";
import { ParentProps } from "solid-js";

export function NotLoggedInPage() {
  const [_, methods] = useLoggedOutUser();
  return (
    <div class="flex flex-col justify-center items-center min-h-screen">
      <div class="md:mt-4 gap-8 flex items-center md:rounded-full px-6 dark:bg-zinc-800 dark:text-zinc-300 p-4 font-bold md:w-auto w-full justify-center">
        <h2 class="text-4xl squada-one-regular text-nowrap">Onboarding App</h2>
        <button
          class="rounded-full text-nowrap px-4 border border-current font-bold dark:text-zinc-200 hover:dark:text-blue-300 p-1"
          onClick={() => methods().login()}
        >
          Log In
        </button>
      </div>
      <DescriptionBlock
        title="Create onboarding plans"
        body="Use plans tab to create onboarding plans for every team of you company."
      />
      <ImageBlock>
        <Img src={plans} />
      </ImageBlock>
      <DescriptionBlock
        title="Edit plans and migrate users to new version"
        body="Change onboarding plans based on user feed back and migrate users that already following a plan to new version."
      />
      <ImageBlock>
        <Img src={edit} />
      </ImageBlock>
      <DescriptionBlock
        title="Deploy plans"
        body="After plan is customized to your liking deploy it to new employees by providing their telegram username. You can view plans in progress in deployments tab."
      />
      <ImageBlock>
        <Img src={deploy} />
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
    <div class="rounded-xl overflow-hidden outline-8 shadow-lg shadow-zinc-950 border-4 dark:border-zinc-600 md:w-96 w-72">
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
