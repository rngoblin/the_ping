import { createSigilSeed } from "@/utils/generateSigil";

export type ChatMessage = {
  id: string;
  roomId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  kind?: "user" | "system";
};

export const messagesByRoom: Record<string, ChatMessage[]> = {
  "main-floor": [
    { id: "m1", roomId: "main-floor", username: "salma", avatar: createSigilSeed("salma", 0), message: "this blend is impossible in a very calm way", timestamp: "now" },
    { id: "m2", roomId: "main-floor", username: "niko", avatar: createSigilSeed("niko", 1), message: "room just leaned forward", timestamp: "1m" },
    { id: "m3", roomId: "main-floor", username: "mei", avatar: createSigilSeed("mei", 2), message: "signal is clean here", timestamp: "2m" }
  ],
  ambient: [
    { id: "a1", roomId: "ambient", username: "lo", avatar: createSigilSeed("lo", 0), message: "the pad behind the hats is glowing", timestamp: "now" },
    { id: "a2", roomId: "ambient", username: "cass", avatar: createSigilSeed("cass", 1), message: "best room to disappear in", timestamp: "3m" }
  ],
  "smoking-area": [
    { id: "s1", roomId: "smoking-area", username: "june", avatar: createSigilSeed("june", 2), message: "came out here and the stream followed me", timestamp: "now" },
    { id: "s2", roomId: "smoking-area", username: "ori", avatar: createSigilSeed("ori", 0), message: "anyone else watching from a kitchen floor", timestamp: "4m" }
  ],
  "visuals-art": [
    { id: "v1", roomId: "visuals-art", username: "anna", avatar: createSigilSeed("anna", 0), message: "camera grain is doing a lot of emotional labor", timestamp: "now" },
    { id: "v2", roomId: "visuals-art", username: "rue", avatar: createSigilSeed("rue", 1), message: "the white wash between cuts is perfect", timestamp: "5m" }
  ],
  "producers-lair": [
    { id: "p1", roomId: "producers-lair", username: "eon", avatar: createSigilSeed("eon", 2), message: "that delay send is tucked so low", timestamp: "now" },
    { id: "p2", roomId: "producers-lair", username: "mika", avatar: createSigilSeed("mika", 0), message: "sub has patience", timestamp: "2m" }
  ],
  shitposting: [
    { id: "x1", roomId: "shitposting", username: "hex", avatar: createSigilSeed("hex", 1), message: "dj has the posture of a tax audit", timestamp: "now" },
    { id: "x2", roomId: "shitposting", username: "pam", avatar: createSigilSeed("pam", 2), message: "bassline just asked me to update my billing info", timestamp: "1m" }
  ]
};
