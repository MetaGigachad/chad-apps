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
