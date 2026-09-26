export function getTimeLeft(timestamp: string | bigint | number): string {
  const targetSeconds =
    typeof timestamp === "string"
      ? Number(timestamp.replace("n", ""))
      : Number(timestamp);

  const currentSeconds = Math.floor(Date.now() / 1000);

  const totalSecondsLeft = targetSeconds - currentSeconds;

  if (totalSecondsLeft <= 0) {
    return "0 hours, 0 seconds left";
  }

  const hours = Math.floor(totalSecondsLeft / 3600);
  const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
  const seconds = totalSecondsLeft % 60;

  return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours > 0 && minutes === 0) return `${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${rest}s`;
  return `${rest}s`;
}

export function shortAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
