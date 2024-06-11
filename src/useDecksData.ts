// useDecksData.ts
import { useEffect, useState } from "react";
import { Player, Data, staticData } from "./playerData";

export function useDecksData() {
  const [tempo, setTempo] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // In development mode, use static data
      setTempo(staticData.master.tempo.toFixed(0));
      setPlayers(Object.values(staticData.players));
    } else {
      // In production mode, fetch live data
      const fetchData = () => {
        fetch("http://127.0.0.1:17081/params.json")
          .then((response) => response.json())
          .then((data: Data) => {
            setTempo(data.master.tempo.toFixed(0));
            setPlayers(Object.values(data.players));
          })
          .catch((error) => console.error("Error:", error));
      };

      // Initial fetch
      fetchData();
      // Update data every second
      const interval = setInterval(fetchData, 50);

      return () => clearInterval(interval);
    }
  }, []);

  return { tempo, players };
}
