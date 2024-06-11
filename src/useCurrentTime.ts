// useCurrentTime.ts
import { useEffect, useState } from "react";

function formatTime(date: Date): string {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12 || 12;

  // Pad minutes with a zero if needed using `String().padStart`
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${hours}:${formattedMinutes} ${ampm}`;
}

export function useCurrentTime(interval: number = 1000): string {
  const [time, setTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const updateTime = () => {
      setTime(formatTime(new Date()));
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, interval); // Update at the specified interval

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [interval]);

  return time;
}
