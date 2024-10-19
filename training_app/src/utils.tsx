import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export function localSignal<T>(
  key: string,
  ...args: Parameters<typeof createSignal<T>>
) {
  const [signal, setSignal] = createSignal<T>(...args);

  const value = localStorage.getItem(key);
  if (value != null) {
    setSignal(JSON.parse(value));
  }

  createEffect(() => localStorage.setItem(key, JSON.stringify(signal())));

  return [signal, setSignal] as const;
}

export function localStore<T extends object>(
  key: string,
  ...args: Parameters<typeof createStore<T>>
) {
  const [store, setStore] = createStore<T>(...args);

  const value = localStorage.getItem(key);
  if (value != null) {
    setStore(JSON.parse(value));
  }

  createEffect(() => localStorage.setItem(key, JSON.stringify(store)));

  return [store, setStore] as const;
}

export function prettyDate(date: Date) {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  const dayDiff = Math.floor(diff / 86400);

  if (isNaN(dayDiff) || dayDiff < 0) {
    throw "prettyDate error";
  }

  if (dayDiff < 31) {
    return (
      (dayDiff == 0 &&
        ((diff < 60 && "just now") ||
          (diff < 120 && "1 minute ago") ||
          (diff < 3600 && Math.floor(diff / 60) + " minutes ago") ||
          (diff < 7200 && "1 hour ago") ||
          (diff < 86400 && Math.floor(diff / 3600) + " hours ago"))) ||
      (dayDiff == 1 && "Yesterday") ||
      (dayDiff < 7 && dayDiff + " days ago") ||
      (dayDiff < 28 && Math.ceil(dayDiff / 7) + " weeks ago") ||
      (dayDiff >= 28 && "1 month ago")
    );
  }

  const monthsAgo = now.getMonth() - date.getMonth() + (12 * (now.getFullYear() - date.getFullYear()));

  if (monthsAgo < 12) {
    return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
  }

  const yearsAgo = now.getFullYear() - date.getFullYear();

  if (yearsAgo === 1) {
    return "1 year ago";
  } else if (yearsAgo < 3) {
    return `${yearsAgo} years ago`;
  } else {
    // For dates more than 2 years ago, return the compact date and time format
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) + " " + date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function parseDates(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "number" && key.endsWith("At")) {
      obj[key] = new Date(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      parseDates(obj[key]);
    }
  }
  return obj;
};

function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

export function makeRand(seed: string) {
  const [a, b, c, d] = cyrb128(seed);
  return sfc32(a, b, c, d);
}
