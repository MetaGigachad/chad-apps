import { useLoggedOutUser } from "@metachad/frontend-common"

export function NotLoggedInPage() {
  const [_, methods] = useLoggedOutUser();
  return (
    <div class="flex justify-center items-center min-h-screen">
      <div class="flex flex-col items-center rounded-xl dark:bg-gray-800 dark:text-gray-300 p-4 font-bold">
        <h2 class="text-2xl">Onboarding control plane</h2>
        <button
          class="rounded-md dark:bg-gray-300 dark:text-gray-800 hover:dark:bg-gray-200 mt-5 p-1"
          onClick={methods().login}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
