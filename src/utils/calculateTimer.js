// Calculates time remaining until a given start Date object.
// Only performs detailed breakdown when time left is <= 24 hours.
// Returns an object: { within24h, finished, msLeft, hours, minutes, seconds, formatted }
export default function calculateTimer(startDateTime, now = new Date()) {
  if (!(startDateTime instanceof Date)) {
    startDateTime = new Date(startDateTime);
  }
  const msLeft = startDateTime - now;

  if (isNaN(msLeft)) {
    return { within24h: false, finished: false };
  }

  // If start already passed
  if (msLeft <= 0) {
    return { within24h: true, finished: true, msLeft: 0, hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00' };
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (msLeft > oneDayMs) {
    // don't compute further if more than 24h away
    return { within24h: false, finished: false, msLeft };
  }

  // compute h/m/s
  let remaining = Math.floor(msLeft / 1000);
  const hours = Math.floor(remaining / 3600);
  remaining -= hours * 3600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining - minutes * 60;

  // Formatting rules:
  // - default: "hh:mm" (pad 2) while not both hh and mm == 0
  // - when both hours and minutes are 0, show "hh:mm:ss" (00:00:ss)
  const pad = (v) => String(v).padStart(2, '0');
  let formatted;
  if (hours === 0 && minutes === 0) {
    formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // 00:00:ss
  } else {
    formatted = `${pad(hours)}:${pad(minutes)}`; // hh:mm
  }

  return { within24h: true, finished: false, msLeft, hours, minutes, seconds, formatted };
}
