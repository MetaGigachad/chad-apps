<script>
  import "../app.css";
</script>

<svelte:head>
    <title>Training Journal</title>
</svelte:head>

<div class="flex justify-between items-center bg-stone-950 text-stone-100 p-4 border-b border-stone-700">
    <a href="/">
        <img src="logo.svg" alt="Training Journal logo" class="w-20">
    </a>
    <div class="flex space-x-4">
        <div class="h-8 w-8 bg-stone-600 border border-stone-700 rounded-full">
        </div>
    </div>
</div>
<div class="flex justify-between bg-stone-950 text-stone-100">
    <div class="flex flex-col min-h-screen max-w-screen-sm w-1/5 p-4 space-y-2">
        <a href="/" class="flex items-center p-3 space-x-4 rounded-lg hover:bg-stone-900">
            <img src="dashboard.svg" alt="Dashboard icon" class="w-6">
            <p>Dashboard</p>
        </a>
        <a href="/workouts" class="flex items-center p-3 space-x-4 rounded-lg hover:bg-stone-900">
            <img src="workouts.svg" alt="New workout icon" class="w-6">
            <p>Workouts</p>
        </a>
        <a href="/sessions" class="flex items-center p-3 space-x-4 rounded-lg hover:bg-stone-900">
            <img src="sessions.svg" alt="New workout icon" class="w-6">
            <p>Sessions</p>
        </a>
    </div>
    <div class="flex-1 min-h-screen">
        <slot></slot>
    </div>
    <div class="flex-1 min-h-screen">
    </div>
</div>
