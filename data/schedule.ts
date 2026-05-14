export type ScheduleAct = {
  id: string;
  day: string;
  time: string;
  title: string;
  artist: string;
  city: string;
  source: string;
  genre: string;
  mood: string;
};

export const schedule: ScheduleAct[] = [
  {
    id: "up-1",
    day: "Thursday",
    time: "tomorrow 02:00",
    title: "Slow Signal",
    artist: "Aral Sea Club",
    city: "Helsinki",
    source: "basement radio room",
    genre: "dub techno",
    mood: "wide, patient, frost-lit"
  },
  {
    id: "up-2",
    day: "Friday",
    time: "23:30",
    title: "Main Floor Transmission",
    artist: "Yae Tonic",
    city: "Berlin",
    source: "low roof session",
    genre: "hardgroove",
    mood: "rolling drums, little mercy"
  },
  {
    id: "up-3",
    day: "Saturday",
    time: "04:15",
    title: "Freight Elevator",
    artist: "Saint Index",
    city: "Detroit",
    source: "industrial camera feed",
    genre: "breakbeat",
    mood: "metallic swing, late charge"
  },
  {
    id: "up-4",
    day: "Sunday",
    time: "01:00",
    title: "Afterhours Ambient",
    artist: "Nara Phase",
    city: "Lisbon",
    source: "gallery floor",
    genre: "ambient",
    mood: "pale drones, windows open"
  },
  {
    id: "up-5",
    day: "Sunday",
    time: "03:40",
    title: "No Moon Archive",
    artist: "Vanta Lace",
    city: "Bristol",
    source: "private link room",
    genre: "jungle",
    mood: "ghost breaks, low lamps"
  },
  {
    id: "up-6",
    day: "Monday",
    time: "00:20",
    title: "Small Oscillator Studies",
    artist: "Moss Index",
    city: "Warsaw",
    source: "tabletop live set",
    genre: "experimental electronics",
    mood: "wires, breath, close detail"
  }
];
