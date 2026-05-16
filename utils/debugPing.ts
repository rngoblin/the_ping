export const isPingDebugEnabled = () => {
  if (process.env.NEXT_PUBLIC_DEBUG_PING === "true") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("DEBUG_PING") === "true";
};

export const debugPing = (label: string, payload?: unknown) => {
  if (!isPingDebugEnabled()) {
    return;
  }

  if (payload === undefined) {
    console.debug(`[PING] ${label}`);
    return;
  }

  console.debug(`[PING] ${label}`, payload);
};
