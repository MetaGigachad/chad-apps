<script lang="ts">
    import { signUp } from "$lib/api";

    let inputs: Array<HTMLInputElement> = [];
    let user_name: string = "";
    let first_name: string = "";
    let last_name: string = "";
    let password: string = "";
    let confirm_password: string = "";

    $: passwords_match =
        password == confirm_password ||
        (password.length === 0 && confirm_password.length === 0);
    $: user_name_correct = 0 < user_name.length && user_name.length <= 50;
    $: first_name_correct = 0 < first_name.length && first_name.length <= 50;
    $: last_name_correct = 0 < last_name.length && last_name.length <= 50;
    $: password_correct =
        0 < password.length && password.length <= 50 && passwords_match;
    $: confirm_password_correct =
        0 < confirm_password.length &&
        confirm_password.length <= 50 &&
        passwords_match;
    $: form_correct =
        user_name_correct &&
        first_name_correct &&
        last_name_correct &&
        password_correct &&
        confirm_password_correct;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            const id = inputs.indexOf(event.target);
            inputs[id + 1].focus();
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        if (!form_correct) {
            return;
        }

        const response = await signUp(
            user_name,
            password,
            first_name,
            last_name
        );

        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get("continue");
        if (url) {
            //location.assign(url);
        }
    }
</script>

<form on:submit={handleSubmit} novalidate>
    <div
        class="w-screen max-w-lg flex flex-col items-stretch p-10 sm:border rounded-lg border-stone-700"
    >
        <h1 class="text-3xl mb-6 mx-auto">Sign up</h1>
        <div class="flex flex-col items-stretch content-evenly space-y-4">
            <div>
                <label for="username" class="block pb-1">Username</label>
                <input
                    autofocus
                    on:keydown={handleKeydown}
                    bind:this={inputs[inputs.length]}
                    bind:value={user_name}
                    type="text"
                    id="username"
                    class="w-full block bg-inherit border rounded p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    class:border-stone-700={user_name_correct}
                    class:border-red-300={!user_name_correct}
                    placeholder="jonh.doe"
                    required
                />
            </div>
            <div>
                <label for="first_name" class="block pb-1">First name</label>
                <input
                    on:keydown={handleKeydown}
                    bind:this={inputs[inputs.length]}
                    bind:value={first_name}
                    type="text"
                    id="first_name"
                    class="w-full block bg-inherit border rounded p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    class:border-stone-700={first_name_correct}
                    class:border-red-300={!first_name_correct}
                    placeholder="John"
                    required
                />
            </div>
            <div>
                <label for="last_name" class="block pb-1">Last name</label>
                <input
                    on:keydown={handleKeydown}
                    bind:this={inputs[inputs.length]}
                    bind:value={last_name}
                    type="text"
                    id="last_name"
                    class="w-full block bg-inherit border rounded p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    class:border-stone-700={last_name_correct}
                    class:border-red-300={!last_name_correct}
                    placeholder="Doe"
                    required
                />
            </div>
            <div>
                <label for="password" class="block pb-1">Password</label>
                <input
                    on:keydown={handleKeydown}
                    bind:this={inputs[inputs.length]}
                    bind:value={password}
                    type="password"
                    id="password"
                    class="w-full block bg-inherit border rounded p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    class:border-stone-700={password_correct}
                    class:border-red-300={!password_correct}
                    placeholder="•••••••••"
                    required
                />
            </div>
            <div>
                <label for="confirm_password" class="block pb-1"
                    >Confirm password</label
                >
                <input
                    bind:this={inputs[inputs.length]}
                    bind:value={confirm_password}
                    type="password"
                    id="confirm_password"
                    class="w-full block bg-inherit border rounded p-2 focus:ring-stone-100 focus:border-stone-100 transition"
                    class:border-stone-700={confirm_password_correct}
                    class:border-red-300={!confirm_password_correct}
                    placeholder="•••••••••"
                    required
                />
            </div>
        </div>
        <div class="flex justify-between space-x-4 mt-8">
            <a
                href="/log_in"
                class="bg-inherit border-stone-700 border rounded-full py-2 px-4 hover:text-red-200 hover:border-red-200 transition"
                >Log in</a
            >
            <button
                type="submit"
                disabled={!form_correct || null}
                class="bg-red-300 border-red-300 text-stone-950 border rounded-full py-2 px-4 hover:bg-red-200 hover:border-red-200 transition disabled:bg-stone-700 disabled:border-stone-700 disabled:hover:bg-stone-700 disabled:hover:border-stone-700 disabled:text-inherit"
                >Continue</button
            >
        </div>
    </div>
</form>
