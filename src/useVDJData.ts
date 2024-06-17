// @ts-nocheck
import { useEffect, useState } from "react";
import { staticPlayersArray } from "./playerData";

export function useVDJData() {
  const [tempo, setTempo] = useState("idk");
  const [players, setPlayers] = useState(staticPlayersArray);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8081");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setPlayers((prevPlayers) => {
        // Clone the previous players state
        const updatedPlayers = [...prevPlayers];

        // Get the player index based on the deck number
        const playerIndex = data.deck - 1;

        if (updatedPlayers[playerIndex] || data.type === "MASTER_TEMPO") {
          if (updatedPlayers[playerIndex]) {
            updatedPlayers[playerIndex].number = ["A", "B", "C", "D"][
              playerIndex
            ];
          }
          switch (data.type) {
            case "VU_METER_L":
              updatedPlayers[playerIndex].vu_meter_l = data.level;
              break;
            case "VU_METER_R":
              updatedPlayers[playerIndex].vu_meter_r = data.level;
              break;
            case "TIME_REMAINING":
              const timeRemaining =
                updatedPlayers[playerIndex]["time-remaining"];
              if (data.cc === 0x2c) {
                timeRemaining.minutes = data.value;
              } else if (data.cc === 0x2d) {
                timeRemaining.seconds = data.value;
              } else if (data.cc === 0x2e) {
                timeRemaining["frame-tenths"] = data.value;
              }
              // Update display
              timeRemaining.display = `${timeRemaining.minutes
                .toString()
                .padStart(2, "0")}:${timeRemaining.seconds
                .toString()
                .padStart(2, "0")}:${timeRemaining["frame-tenths"]
                .toString()
                .padStart(2, "0")}`;
              break;
            case "ONAIR_STATUS":
              updatedPlayers[playerIndex]["is-on-air"] = data.status;
              break;
            case "IS_MASTER":
              updatedPlayers[playerIndex]["is-tempo-master"] = data.status;
              break;
            case "STEMS":
              updatedPlayers[playerIndex].stems = data.stems;
              break;
            case "TRACK_INFO":
              console.log(data);
              updatedPlayers[playerIndex].track = data.track;
              updatedPlayers[playerIndex].cover = data.cover;
              break;
            case "MASTER_TEMPO":
              setTempo(Math.round(data.bpm).toString());
              break;
            default:
              break;
          }
        }

        return updatedPlayers;
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  return { tempo, players };
}
