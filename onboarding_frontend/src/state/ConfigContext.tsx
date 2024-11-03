import { Match, ParentProps, Resource, Switch, createContext, createResource, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export interface ConfigType {
  oAuth2: {
    authUrl: string
    tokenUrl: string
    clientId: string
    redirectUri: string
  }
}

export const ConfigContext = createContext<ConfigType>();

export function ConfigProvider(props: ParentProps) {
  const [config] = createResource<ConfigType>(fetchConfig);

  return (
      <Switch>
        <Match when={config.loading}>
          <div></div>
        </Match>
        <Match when={!config.loading && config.error !== undefined}>
          <div>Error loading config: reload page</div>
        </Match>
        <Match when={!config.loading && config.error === undefined}>
          <ConfigContext.Provider value={config()}>
            {props.children}
          </ConfigContext.Provider>
        </Match>
      </Switch>
  );
}

export async function fetchConfig(): Promise<ConfigType> {
  const res = await fetch("/api/config").then((r) => r.json());
  return res;
}
