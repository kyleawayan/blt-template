interface Track {
  genre: string;
  remixer?: string;
  "starting-tempo": number;
  slot: string;
  color?: string;
  key: string;
  "original-artist"?: string;
  added: string;
  type: string;
  duration: number;
  artist: string;
  title: string;
  year: number;
  label?: string;
  id: number;
  comment: string;
  album?: string;
  "color-name"?: string;
  rating: number;
}

interface Time {
  "raw-milliseconds": number;
  minutes: number;
  seconds: number;
  frames: number;
  "frame-tenths": number;
  display: string;
}

interface Player {
  "beat-within-bar"?: number;
  "is-synced": boolean;
  address: string;
  "beat-number": number;
  "pitch-display": string;
  "is-track-loaded": boolean;
  "cue-countdown-display": string;
  number: number;
  "is-playing": boolean;
  "is-looping": boolean;
  "is-playing-cdj-mode": boolean;
  name: string;
  "is-paused": boolean;
  "time-remaining": Time;
  "time-played": Time;
  "is-playing-backwards": boolean;
  pitch: number;
  "track-bpm": number;
  "pitch-multiplier": number;
  "is-playing-vinyl-mode": boolean;
  "firmware-version": string;
  "is-searching": boolean;
  "is-busy": boolean;
  kind: string;
  "track-number": number;
  "is-on-air": boolean;
  "track-source-player": number;
  "is-playing-forwards": boolean;
  "is-tempo-master": boolean;
  "is-bpm-only-synced": boolean;
  "is-cued": boolean;
  tempo: number;
  "is-at-end": boolean;
  "cue-countdown": number;
  track?: Track;
}

interface Data {
  players: Record<string, Player>;
  master: Player;
}

function createPlayer(number: number): Player {
  return {
    address: `Player ${number}`,
    number: number,
    tempo: 120,
    "is-synced": false,
    "is-playing": true,
    "is-looping": false,
    "pitch-display": "0.0%",
    "beat-number": 1,
    "cue-countdown-display": "10s",
    "is-track-loaded": true,
    "is-tempo-master": false,
    "is-on-air": false,
    name: `Player ${number}`,
    "is-playing-forwards": true,
    "is-playing-cdj-mode": true,
    "time-remaining": {
      "raw-milliseconds": 30000,
      minutes: 5,
      seconds: 0,
      frames: 0,
      "frame-tenths": 0,
      display: "00:00:00:00",
    },
    "time-played": {
      "raw-milliseconds": 0,
      minutes: 0,
      seconds: 0,
      frames: 0,
      "frame-tenths": 0,
      display: "00:00:00:00",
    },
    pitch: 0,
    "track-bpm": 120,
    "pitch-multiplier": 1,
    "is-playing-backwards": false,
    "firmware-version": "1.0",
    "is-searching": false,
    "is-busy": false,
    kind: "Player",
    "track-number": 1,
    "track-source-player": 1,
    "is-playing-vinyl-mode": false,
    "is-bpm-only-synced": false,
    "is-at-end": false,
    "cue-countdown": 10,
    "is-cued": false,
    "is-paused": false,
    track: {
      genre: "House",
      "starting-tempo": 120,
      slot: `Player ${number}`,
      key: "Am",
      added: "2024-01-01",
      type: "Track",
      duration: 300,
      artist:
        number === 2
          ? "Long Artist Name Long Artist Name Long Artist Name Long Artist Name"
          : "Artist Name",
      title:
        number === 3
          ? `Sample Track ${number} Long Title Long Title Here Long Title Here Long Title Here Long Title Here Cool`
          : `Sample Track ${number} Track Title Here`,
      year: 2024,
      id: number,
      comment: "",
      rating: 5,
    },
  };
}

const staticData: Data = {
  master: createPlayer(0),
  players: {
    1: createPlayer(1),
    2: createPlayer(2),
    3: createPlayer(3),
    4: createPlayer(4),
  },
};

const staticPlayersArray = [
  staticData.players[1],
  staticData.players[2],
  staticData.players[3],
  staticData.players[4],
];

export type { Data, Player, Track };
export { staticData, staticPlayersArray };
