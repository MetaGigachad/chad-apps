import { UserType } from "./state/UserContext";

export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !("nodeType" in e)) {
    throw new Error(`Node expected`);
  }
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function apiFetch(user: UserType, method: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  delete init?.headers;
  if (user.authData !== undefined) {
    headers.set("Authorization", "Bearer " + user.authData.access_token);
  }
  return fetch("/api" + method, { headers, ...init });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => capitalizeObject(item));
    }

    return Object.keys(obj).reduce((result, key) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        result[capitalizedKey] = capitalizeObject(obj[key]);
        return result;
    }, {} as any);
}
