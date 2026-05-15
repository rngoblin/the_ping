const nicknamePattern = /^[\p{L}\p{N}_ .-]+$/u;
const repeatedCharacterPattern = /(.)\1{8,}/u;

export const normalizeNickname = (nickname: string) => nickname.trim().replace(/\s+/g, " ").slice(0, 24);

export const isNicknameAllowed = (nickname: string) => {
  const clean = normalizeNickname(nickname);

  return clean.length >= 2 && clean.length <= 24 && nicknamePattern.test(clean) && !repeatedCharacterPattern.test(clean);
};

export const normalizeChatMessage = (message: string) => message.trim().replace(/\s+/g, " ").slice(0, 500);

export const isChatMessageAllowed = (message: string) => {
  const clean = normalizeChatMessage(message);

  return clean.length > 0 && clean.length <= 500 && !repeatedCharacterPattern.test(clean);
};

export const createThrottle = (intervalMs: number) => {
  const lastActionByKey = new Map<string, number>();

  return (key: string) => {
    const now = Date.now();
    const previous = lastActionByKey.get(key) ?? 0;

    if (now - previous < intervalMs) {
      return false;
    }

    lastActionByKey.set(key, now);
    return true;
  };
};
