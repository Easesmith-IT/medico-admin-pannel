import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function customId(id, prefix = "ID") {
  if (!id) return "";
  const part = `${id.slice(0, 6)}-${id.slice(-6)}`.toUpperCase();
  return `#${prefix}-${part}`;
}

export function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === "all"
    )
      return;
    query.append(key, value);
  });

  return query.toString(); // returns clean query string
}

// export function generateTimeOptions() {
//   const times = [];
//   const interval = 30; // 30-minute intervals
//   const start = 0; // 12:00 AM
//   const end = 24 * 60; // 11:30 PM (1440 minutes)

//   for (let minutes = start; minutes < end; minutes += interval) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;

//     const period = hours < 12 ? "AM" : "PM";
//     const displayHours = hours % 12 === 0 ? 12 : hours % 12;
//     const displayMins = mins < 10 ? `0${mins}` : mins;

//     times.push(`${displayHours}:${displayMins} ${period}`);
//   }

//   return times;
// }

export function generateTimeOptions() {
  const times = [];
  const interval = 30; // 30 minutes
  const start = 0;
  const end = 24 * 60;

  for (let minutes = start; minutes < end; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const displayHours = hours < 10 ? `0${hours}` : hours;
    const displayMins = mins < 10 ? `0${mins}` : mins;

    times.push(`${displayHours}:${displayMins}`);
  }

  return times;
}

export function generateTimeRange(startTime, endTime, interval = 30) {
  const times = [];

  // Convert "HH:MM" to minutes
  const toMinutes = (timeStr) => {
    const [hours, mins] = timeStr.split(":").map(Number);
    return hours * 60 + mins;
  };

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  for (let minutes = start; minutes <= end; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const displayHours = hours < 10 ? `0${hours}` : hours;
    const displayMins = mins < 10 ? `0${mins}` : mins;

    times.push(`${displayHours}:${displayMins}`);
  }

  return times;
}
