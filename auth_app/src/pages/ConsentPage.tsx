import { Component, Show, createSignal, onMount } from "solid-js";
import { PageBase } from "../components/PageBase";

export const ConsentPage: Component = () => {
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const consentChallenge = queryParams.get("consent_challenge");

    const response = await fetch("/api/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consent_challenge: consentChallenge,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const body = await response.json();
      window.location = body["redirect_to"];
    }

    setLoading(false);
  });

  return (
    <Show when={!loading()} fallback={<div class="loader"></div>}>
      <PageBase title="Consent Failed">
        <h2 class="mb-4">
          <b>Consent</b> failed for some reason. Please retry logging in.
        </h2>
      </PageBase>
    </Show>
  );
};
