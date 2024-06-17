const WebSocket = require("ws");
const JZZ = require("jzz");
const axios = require("axios");

// WebSocket server
const wss = new WebSocket.Server({ port: 8081 });

// Store the state of stems for each deck
const stemState = {
  1: { vocal: false, melody: false, bass: false, drums: false },
  2: { vocal: false, melody: false, bass: false, drums: false },
  3: { vocal: false, melody: false, bass: false, drums: false },
  4: { vocal: false, melody: false, bass: false, drums: false },
};

// Pending requests counter
let pendingRequestCount = 0;

function parseMidiMessage(message) {
  const [status, data1, data2] = message;
  const command = status >> 4;
  const channel = status & 0xf;
  const deck = channel + 1;

  let data = {
    command,
    channel,
    data1,
    data2,
    deck,
  };

  switch (command) {
    case 0x9: // Note On (LEDs, ON AIR STATUS)
      data.type = "LED";
      data.note = data1;
      data.value = data2;
      break;
    case 0x8: // Note Off
      data.type = "LED";
      data.note = data1;
      data.value = data2;
      break;
    case 0xb: // Control Change (TIME REMAINING, VU METERS)
      data.type = "CC";
      data.cc = data1;
      data.value = data2;
      break;
    default:
      data.type = "Unknown";
  }

  return data;
}

function broadcastData(data) {
  // Broadcast data to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

async function fetchTrackInfo(deck) {
  try {
    pendingRequestCount++;
    logStatus();

    const title = await axios.get(
      `http://127.0.0.1:8010/query?script=deck ${deck} get_title`
    );
    const artist = await axios.get(
      `http://127.0.0.1:8010/query?script=deck ${deck} get_artist`
    );
    const cover = await axios.get(
      `http://127.0.0.1:8010/query?script=deck ${deck} get_controller_image`,
      { responseType: "arraybuffer" }
    );

    const coverBase64 = Buffer.from(cover.data, "binary").toString("base64");
    const coverUrl = `data:image/jpeg;base64,${coverBase64}`;

    const data = {
      type: "TRACK_INFO",
      deck,
      track: {
        title: title.data,
        artist: artist.data,
      },
      cover: coverUrl,
    };

    broadcastData(data);
  } catch (error) {
    console.error(`Error fetching track info for deck ${deck}`, error);
  } finally {
    pendingRequestCount--;
    logStatus();
  }
}

function startTrackInfoFetching() {
  const decks = [1, 2, 3, 4];
  decks.forEach((deck, index) => {
    setTimeout(() => {
      fetchTrackInfo(deck);
    }, index * 1000);
  });
  setInterval(() => {
    axios
      .get(`http://127.0.0.1:8010/query?script=deck master get_bpm`)
      .then((res) => {
        broadcastData({ type: "MASTER_TEMPO", bpm: res.data });
      });
    decks.forEach((deck, index) => {
      setTimeout(() => {
        fetchTrackInfo(deck);
      }, index * 1000);
    });
  }, 5000);
}

function logStatus() {
  console.log("MIDI-In:  IAC Driver Bus 1");
  console.log(
    "MIDI parser and WebSocket server running on ws://localhost:8081"
  );
  console.log(`Pending requests: ${pendingRequestCount}`);
}

JZZ()
  .or("Cannot start MIDI engine!")
  .openMidiIn()
  .or("Cannot open MIDI In port!")
  .and(function () {
    console.log("MIDI-In: ", this.name());
    logStatus();
  })
  .connect(function (msg) {
    const midiData = parseMidiMessage(msg);

    let broadcast = false;
    let data = {};

    if (midiData.type === "LED" && midiData.note === 0x01) {
      data = {
        type: "ONAIR_STATUS",
        deck: midiData.deck,
        status: midiData.command === 0x9 && midiData.value === 127, // NOTE_ON with value 127 is enabled
      };
      broadcast = true;
    } else if (
      midiData.type === "LED" &&
      midiData.command === 0x8 &&
      midiData.value === 64 &&
      midiData.note === 0x01
    ) {
      data = {
        type: "ONAIR_STATUS",
        deck: midiData.deck,
        status: false, // NOTE_OFF with value 64 is disabled
      };
      broadcast = true;
    } else if (midiData.type === "LED" && midiData.note === 0x02) {
      data = {
        type: "IS_MASTER",
        deck: midiData.deck,
        status: midiData.command === 0x9 && midiData.value === 127, // NOTE_ON with value 127 is enabled
      };
      broadcast = true;
    } else if (
      midiData.type === "LED" &&
      midiData.command === 0x8 &&
      midiData.value === 64 &&
      midiData.note === 0x02
    ) {
      data = {
        type: "IS_MASTER",
        deck: midiData.deck,
        status: false, // NOTE_OFF with value 64 is disabled
      };
      broadcast = true;
    } else if (midiData.type === "LED") {
      let stemType = "";
      switch (midiData.note) {
        case 0x03:
          stemType = "vocal";
          break;
        case 0x04:
          stemType = "melody";
          break;
        case 0x05:
          stemType = "bass";
          break;
        case 0x06:
          stemType = "drums";
          break;
        default:
          stemType = "";
      }
      if (stemType) {
        stemState[midiData.deck][stemType] =
          midiData.command === 0x9 && midiData.value === 127; // NOTE_ON with value 127 is enabled

        data = {
          type: "STEMS",
          deck: midiData.deck,
          stems: stemState[midiData.deck],
        };
        broadcast = true;
      } else if (
        midiData.command === 0x8 &&
        midiData.value === 64 &&
        (midiData.note === 0x03 ||
          midiData.note === 0x04 ||
          midiData.note === 0x05 ||
          midiData.note === 0x06)
      ) {
        switch (midiData.note) {
          case 0x03:
            stemType = "vocal";
            break;
          case 0x04:
            stemType = "melody";
            break;
          case 0x05:
            stemType = "bass";
            break;
          case 0x06:
            stemType = "drums";
            break;
          default:
            stemType = "";
        }
        if (stemType) {
          stemState[midiData.deck][stemType] = false; // NOTE_OFF with value 64 is disabled

          data = {
            type: "STEMS",
            deck: midiData.deck,
            stems: stemState[midiData.deck],
          };
          broadcast = true;
        }
      }
    } else if (midiData.type === "CC") {
      if (
        midiData.cc === 0x2c ||
        midiData.cc === 0x2d ||
        midiData.cc === 0x2e
      ) {
        data = {
          type: "TIME_REMAINING",
          deck: midiData.deck,
          cc: midiData.cc,
          value: midiData.value,
        };
        broadcast = true;
      } else if (midiData.cc === 0x30 || midiData.cc === 0x31) {
        data = {
          type: midiData.cc === 0x30 ? "VU_METER_L" : "VU_METER_R",
          deck: midiData.deck,
          level: midiData.value,
        };
        broadcast = true;
      }
    }

    if (broadcast) {
      broadcastData(data);
    }
  });

startTrackInfoFetching();

console.log("MIDI parser and WebSocket server running on ws://localhost:8081");
