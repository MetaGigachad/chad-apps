/**
 * Converts Date to string looking like "2 hours ago"
 */
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

  const monthsAgo =
    now.getMonth() -
    date.getMonth() +
    12 * (now.getFullYear() - date.getFullYear());

  if (monthsAgo < 12) {
    return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
  }

  const yearsAgo = now.getFullYear() - date.getFullYear();

  if (yearsAgo === 1) {
    return "1 year ago";
  } else if (yearsAgo < 3) {
    return `${yearsAgo} years ago`;
  } else {
    return (
      date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }
}

/**
 * Changes all number properties ending with 'At' to Date objects,
 * assuming number corresponds to number of milliseconds since epoch
 */
export function parseDates(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "number" && key.endsWith("At")) {
      obj[key] = new Date(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      parseDates(obj[key]);
    }
  }
  return obj;
}
