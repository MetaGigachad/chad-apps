import { UserContextLoggedInDataType } from "../contexts/UserContext";
import { waitForValue } from "./etc";

export async function apiFetch(
  user: UserContextLoggedInDataType,
  method: string,
  init?: RequestInit,
) {
  await waitForValue(() => user.checked, true);
  const headers = new Headers(init?.headers);
  delete init?.headers;
  headers.set("Authorization", "Bearer " + user.data.access_token);
  return await fetch("/api" + method, { headers, ...init });
}
