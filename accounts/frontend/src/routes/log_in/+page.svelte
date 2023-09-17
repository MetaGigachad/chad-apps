<script lang="ts">
    let inputs: Array<HTMLInputElement> = [];

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            const id = inputs.indexOf(event.target);
            inputs[id + 1].focus();
        }
    }
</script>

<form novalidate>
    <div
        class="w-screen max-w-lg flex flex-col items-stretch p-10 sm:border rounded-lg border-stone-700"
    >
        <h1 class="text-3xl mb-6 mx-auto">Log in</h1>
        <div class="flex flex-col items-stretch content-evenly space-y-4">
            <div>
                <label for="username" class="block pb-1">Username</label>
                <input
        autofocus
        on:keydown={handleKeydown}
                    type="text"
                    id="username"
                    class="w-full block bg-inherit border rounded border-stone-700 p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    placeholder="jonh.doe"
                    required
                />
            </div>
            <div>
                <label for="password" class="block pb-1">Password</label>
                <input
        bind:this={inputs[inputs.length]}
                    type="password"
                    id="password"
                    class="w-full block bg-inherit border rounded border-stone-700 p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    placeholder="•••••••••"
                    required
                />
            </div>
        </div>
        <div class="flex justify-between space-x-4 mt-8">
            <a
                href="/sign_up"
                class="bg-inherit border-stone-700 border rounded-full py-2 px-4 hover:text-red-200 hover:border-red-200 transition"
                >Sign up</a>
            <button
                type="submit"
                class="bg-red-300 border-red-300 text-stone-950 border rounded-full py-2 px-4 hover:bg-red-200 hover:border-red-200 transition"
                >Continue</button
            >
        </div>
    </div>
</form>
