export type Room = {
  id: string;
  name: string;
  description: string;
  mood: string;
  tagline: string;
  accent: string;
  tint: string;
  densityLabel: string;
  symbol: string;
  count: number;
  vibe: number;
};

export const rooms: Room[] = [
  {
    id: "main-floor",
    name: "main floor",
    description: "low ceiling, close heat",
    mood: "public / warm / moving",
    tagline: "the shared floor",
    accent: "#5E7A64",
    tint: "rgba(94,122,100,0.18)",
    densityLabel: "packed but calm",
    symbol: "floor",
    count: 642,
    vibe: 84
  },
  {
    id: "ambient",
    name: "ambient room",
    description: "slow fog and sidechain pads",
    mood: "slow / textural / low light",
    tagline: "for fog and long attention",
    accent: "#71807A",
    tint: "rgba(113,128,122,0.2)",
    densityLabel: "softly occupied",
    symbol: "haze",
    count: 214,
    vibe: 48
  },
  {
    id: "hardgroove",
    name: "hardgroove",
    description: "drums are doing the talking",
    mood: "locked / percussive / forward",
    tagline: "pressure without spectacle",
    accent: "#66735D",
    tint: "rgba(102,115,93,0.2)",
    densityLabel: "high motion",
    symbol: "grid",
    count: 388,
    vibe: 92
  },
  {
    id: "smoking-area",
    name: "smoking area",
    description: "half outside, half confession",
    mood: "loose / off-topic / afterhours",
    tagline: "step outside without leaving",
    accent: "#7A7668",
    tint: "rgba(122,118,104,0.2)",
    densityLabel: "open air",
    symbol: "side",
    count: 156,
    vibe: 55
  },
  {
    id: "visuals-art",
    name: "visuals & art",
    description: "projector glow and references",
    mood: "observant / image-led / pale glow",
    tagline: "watch the room looking back",
    accent: "#657B77",
    tint: "rgba(101,123,119,0.2)",
    densityLabel: "focused",
    symbol: "frame",
    count: 98,
    vibe: 61
  },
  {
    id: "producers-den",
    name: "producer's den",
    description: "kick chains, dub sends, notes",
    mood: "technical / generous / low voice",
    tagline: "small notes on large systems",
    accent: "#596F61",
    tint: "rgba(89,111,97,0.2)",
    densityLabel: "listening close",
    symbol: "patch",
    count: 126,
    vibe: 73
  },
  {
    id: "shitposting",
    name: "shitposting",
    description: "no context survives here",
    mood: "loose / fast / unserious",
    tagline: "a side room for pressure release",
    accent: "#77715E",
    tint: "rgba(119,113,94,0.2)",
    densityLabel: "unstable but friendly",
    symbol: "static",
    count: 218,
    vibe: 77
  }
];
