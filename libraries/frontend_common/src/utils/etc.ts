import { Accessor, createEffect, on } from "solid-js";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => capitalizeObject(item));
  }

  return Object.keys(obj).reduce((result, key) => {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    result[capitalizedKey] = capitalizeObject(obj[key]);
    return result;
  }, {} as any);
}

export async function waitForValue<T>(signal: Accessor<T>, value: T) {
  let isEffectEnabled = true;
  await new Promise<void>((resolve) => {
    createEffect(
      on(signal, () => {
        if (!isEffectEnabled) {
          return;
        }
        if (signal() === value) {
          isEffectEnabled = false;
          resolve();
        }
      }),
    );
  });
}

export function clearSearchParams() {
  const url = new URL(window.location.toString());
  url.search = "";
  window.history.replaceState({}, document.title, url);
}

export function omit<T extends object>(obj: T, ...keysToRemove: (keyof T)[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key]) => !keysToRemove.includes(key as keyof T),
    ),
  );
}

export function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
