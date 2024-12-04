import { createContext, ParentProps, useContext } from "solid-js";
import { Configuration, DefaultApi, ErrorContext, Middleware, ResponseContext } from "../api";
import { useLoggedInUser, UserContext } from "@metachad/frontend-common";

export const ApiContext = createContext<() => DefaultApi>();

export function ApiProvider(props: ParentProps) {
  const [user] = useContext(UserContext)!;
  const api = () => {
    switch (user.state) {
      case "loggedOut":
      case "loggingIn":
        return new DefaultApi(new Configuration({}));
      case "loggedIn":
        return new DefaultApi(
          new Configuration({
            accessToken: user.data.access_token,
            middleware: [
              {
                async post(context: ResponseContext) {
                  if (context.response.status === 403) {
                    const methods = useLoggedInUser()[1];
                    await methods().logout();
                  }
                },
              }
            ],
          }),
        );
    }
  };

  return (
    <ApiContext.Provider value={api}>{props.children}</ApiContext.Provider>
  );
}
