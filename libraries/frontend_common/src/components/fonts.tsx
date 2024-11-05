import { createSignal, onMount, ParentProps, Show } from "solid-js";

export function FontLoader(props: ParentProps) {
  const [loadingFonts, setLoadingFonts] = createSignal(true);

  onMount(async () => {
    await Promise.all([
      document.fonts.load('16px "Squada One"'),
      document.fonts.load('16px "Material Symbols Outlined"')
    ]).then(() => {
      console.log('Both fonts have successfully loaded.');
      setLoadingFonts(false);
    }).catch(() => {
      console.log('One or both fonts failed to load.');
    });
  })

  return (
    <Show when={loadingFonts()} fallback={props.children}>
      <div class="w-screen h-screen flex items-center justify-center">
      <div class="loader"></div>
      </div>
    </Show>
  );
}
