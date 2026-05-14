export type ChatMessage = {
  id: string;
  roomId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
};

export const messagesByRoom: Record<string, ChatMessage[]> = {
  "main-floor": [
    { id: "m1", roomId: "main-floor", username: "salma", avatar: "SA", message: "this blend is impossible in a very calm way", timestamp: "now" },
    { id: "m2", roomId: "main-floor", username: "niko", avatar: "NK", message: "room just leaned forward", timestamp: "1m" },
    { id: "m3", roomId: "main-floor", username: "mei", avatar: "ME", message: "signal is clean here", timestamp: "2m" }
  ],
  ambient: [
    { id: "a1", roomId: "ambient", username: "lo", avatar: "LO", message: "the pad behind the hats is glowing", timestamp: "now" },
    { id: "a2", roomId: "ambient", username: "cass", avatar: "CA", message: "best room to disappear in", timestamp: "3m" }
  ],
  hardgroove: [
    { id: "h1", roomId: "hardgroove", username: "toma", avatar: "TO", message: "proper rolling pressure", timestamp: "now" },
    { id: "h2", roomId: "hardgroove", username: "vera", avatar: "VE", message: "need the track id on this percussion", timestamp: "2m" }
  ],
  "smoking-area": [
    { id: "s1", roomId: "smoking-area", username: "june", avatar: "JU", message: "came out here and the stream followed me", timestamp: "now" },
    { id: "s2", roomId: "smoking-area", username: "ori", avatar: "OR", message: "anyone else watching from a kitchen floor", timestamp: "4m" }
  ],
  "visuals-art": [
    { id: "v1", roomId: "visuals-art", username: "anna", avatar: "AN", message: "camera grain is doing a lot of emotional labor", timestamp: "now" },
    { id: "v2", roomId: "visuals-art", username: "rue", avatar: "RU", message: "the white wash between cuts is perfect", timestamp: "5m" }
  ],
  "producers-den": [
    { id: "p1", roomId: "producers-den", username: "eon", avatar: "EO", message: "that delay send is tucked so low", timestamp: "now" },
    { id: "p2", roomId: "producers-den", username: "mika", avatar: "MI", message: "sub has patience", timestamp: "2m" }
  ],
  shitposting: [
    { id: "x1", roomId: "shitposting", username: "hex", avatar: "HX", message: "dj has the posture of a tax audit", timestamp: "now" },
    { id: "x2", roomId: "shitposting", username: "pam", avatar: "PA", message: "bassline just asked me to update my billing info", timestamp: "1m" }
  ]
};
