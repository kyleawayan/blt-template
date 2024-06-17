import React from "react";
import "./DecksDashboard.css";
import { useVDJData } from "./useVDJData";
import { useCurrentTime } from "./useCurrentTime";
import { Player } from "./playerData";

const VUMeter = ({ l, r }: { l: number; r: number }) => {
  return (
    <div className="vu-meter mb-2 overflow-hidden">
      <div
        className="vu-meter-bar bg-white"
        style={{
          // @ts-ignore i added the vuLeft property
          width: `${l ?? 0}%`,
          height: "6px", // Add this line to set the height
          marginBottom: "1px",
          transition: "width 0.05s ease-in-out",
        }}
      ></div>
      <div
        className="vu-meter-bar bg-white"
        style={{
          // @ts-ignore i added the vuRight property
          width: `${r ?? 0}%`,
          height: "6px", // Add this line to set the height
          transition: "width 0.05s ease-in-out",
        }}
      ></div>
    </div>
  );
};

const SingleDeck = ({ player }: { player: Player }) => (
  <div
    className="text-left flex-1 m-2 fade"
    style={{
      opacity: player["is-on-air"] ? 1 : 0,
    }}
  >
    <div
      className={`w-12 h-12 bg-black bg-opacity-50 text-white flex items-center justify-center mb-2 ${
        player["is-tempo-master"] ? "bg-orange-500" : ""
      }`}
    >
      <h1 className="text-2xl p-2">{player.number}</h1>
    </div>
    <div>
      <div className="mb-2">
        <img
          // @ts-ignore
          src={player.cover}
          width="100"
          height="100"
          alt={`Artwork ${player.number}`}
        />
      </div>
      <div className="mb-2">
        <h2 className="text-xl h-12 lg:h-6 overflow-hidden text-overflow-ellipsis mb-1">
          {player.track?.title || "Unknown Title"}
        </h2>
        <p className="h-6 overflow-hidden">
          {player.track?.artist || "Unknown Artist"}
        </p>
      </div>
      <div>
        {/* <img
          src={`/wave-detail/${
            player.number
          }?width=300&scale=2&timestamp=${Date.now()}`}
          alt="Scrolling waveform"
        /> */}
        {/* @ts-ignore */}
        <VUMeter l={player.vu_meter_l} r={player.vu_meter_r} />
        <div>
          <div className="text-xl font-lcd-mini">
            {player["time-remaining"]?.display}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DecksDashboard = () => {
  const { tempo, players } = useVDJData();
  const currentTime = useCurrentTime(500); // Update time every 500 ms

  if (!players || players.length === 0) {
    return <div>Loading...</div>;
  }

  const order = [2, 0, 1, 3];
  const orderedPlayers = order.map((index) => players[index]);

  return (
    <div className="gradient-wrapper">
      <div className="containerSafe">
        <div id="bpmAndClock">
          <div className="text-6xl flex items-baseline gap-3 mb-3">
            <div className="font-lcd">
              {
                tempo.padStart(
                  3,
                  "!"
                ) /* ! bc it makes a space in the lcd font */
              }
            </div>
            <div className="font-sans text-3xl"> BPM</div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-lcd text-4xl">{currentTime.split(" ")[0]}</div>
            <div className="font-sans text-2xl">
              {currentTime.split(" ")[1]}
            </div>
          </div>
        </div>
        <div
          id="decks"
          className="fixed bottom-0 left-0 right-0 flex flex-row justify-between"
        >
          {orderedPlayers.map((player) => (
            <SingleDeck player={player} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecksDashboard;
