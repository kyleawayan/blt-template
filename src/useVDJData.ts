// useVDJData.ts
import { useEffect, useState } from "react";
import { Player, Data, staticData } from "./playerData";

async function fetchDataFromVdj(
  vdjCommand: string,
  deck: string,
  parseValue?: boolean
) {
  const response = await fetch(
    `http://127.0.0.1:8003/query?script=deck ${deck} ${vdjCommand}`
  );
  let value = (await response.text()) as string | number | boolean;
  if (parseValue) {
    if (typeof value === "string" && !isNaN(Number(value))) {
      value = Number(value);
    } else if (typeof parseValue === "boolean") {
      value = value === "yes";
    }
  }
  return value;
}

async function getImageBlobFromVdj(deck: string) {
  const response = await fetch(
    `http://127.0.0.1:8003/query?script=deck ${deck} get_controller_image`
  );
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  return url;
}

function msToMMSSMS(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.padStart(2, "0")}.${milliseconds}`;
}

export function useVDJData() {
  const [tempo, setTempo] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const tempo = (await fetchDataFromVdj(
        "get_bpm",
        "master",
        true
      )) as number;
      setTempo(tempo.toFixed(0));

      // For each player
      const playerNumbers = ["1", "2", "3", "4"];
      const playerData: Player[] = [];

      for (const playerNumber of playerNumbers) {
        const player: Player = {
          // @ts-ignore vdj uses letters
          number: ["A", "B", "C", "D"][parseInt(playerNumber) - 1],
          "is-on-air": (await fetchDataFromVdj(
            "is_audible",
            playerNumber,
            true
          )) as boolean,
          "is-playing": (await fetchDataFromVdj(
            "play",
            playerNumber,
            true
          )) as boolean,
          "is-tempo-master": (await fetchDataFromVdj(
            "master_deck",
            playerNumber,
            true
          )) as boolean,
          // @ts-ignore just need display to show
          "time-remaining": {
            display: msToMMSSMS(
              Number(await fetchDataFromVdj("get_time", playerNumber))
            ),
          },
          // @ts-ignore track wants additional properties
          track: {
            title: (await fetchDataFromVdj(
              "get_title",
              playerNumber
            )) as string,
            artist: (await fetchDataFromVdj(
              "get_artist",
              playerNumber
            )) as string,
          },
          cover: await getImageBlobFromVdj(playerNumber),
        };

        console.log(player);

        playerData.push(player);
      }

      setPlayers(playerData);
    };

    // Initial fetch
    fetchData();
    // Update data every second
    // TODO: Change back to 50
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  return { tempo, players };
}
