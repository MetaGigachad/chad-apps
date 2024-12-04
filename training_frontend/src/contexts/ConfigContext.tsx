import { Match, ParentProps, Switch, createContext, createResource } from "solid-js";
import { Configuration, DefaultApi, GetConfigResponse } from "../api";

export const ConfigContext = createContext<GetConfigResponse>();

export function ConfigProvider(props: ParentProps) {
  const [config] = createResource<GetConfigResponse>(async () => await new DefaultApi(new Configuration()).getConfig());

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
