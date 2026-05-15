export type SigilPixel = {
  x: number;
  y: number;
  tone: "green" | "greenSoft" | "pink";
};

export type GeneratedSigil = {
  seed: string;
  variant: number;
  pixels: SigilPixel[];
};

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: number) => {
  let state = seed || 1;

  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
};

export const createSigilSeed = (nickname: string, variant: number) => {
  const cleanNickname = nickname.trim().toLowerCase() || "anonymous";
  return `${cleanNickname}:${variant}`;
};

export const generateSigil = (seed: string, variant = 0): GeneratedSigil => {
  const random = createRandom(hashString(`${seed}:${variant}:ping-signal`));
  const pixels = new Map<string, SigilPixel>();
  const centerBias = 0.42 + random() * 0.16;

  const addPixel = (x: number, y: number, tone: SigilPixel["tone"]) => {
    if (x < 1 || x > 14 || y < 1 || y > 14) {
      return;
    }

    pixels.set(`${x}:${y}`, { x, y, tone });
  };

  for (let y = 2; y <= 13; y += 1) {
    for (let x = 3; x <= 7; x += 1) {
      const verticalWeight = y > 4 && y < 12 ? 0.16 : -0.04;
      const horizontalWeight = x > 4 ? 0.08 : -0.02;

      if (random() < centerBias + verticalWeight + horizontalWeight) {
        const tone = random() > 0.74 ? "greenSoft" : "green";
        addPixel(x, y, tone);
        addPixel(15 - x, y, tone);
      }
    }
  }

  for (let index = 0; index < 6; index += 1) {
    const y = 3 + Math.floor(random() * 10);
    const x = 4 + Math.floor(random() * 4);
    addPixel(x, y, "green");
    addPixel(15 - x, y, "green");
  }

  if (random() > 0.48) {
    const pinkY = 4 + Math.floor(random() * 8);
    const pinkX = random() > 0.5 ? 6 : 9;
    addPixel(pinkX, pinkY, "pink");
  }

  return {
    seed,
    variant,
    pixels: [...pixels.values()].sort((a, b) => a.y - b.y || a.x - b.x)
  };
};
