export function displayTimestamp(
  unixTimestamp: number
): string {
  const expireDate = new Date(unixTimestamp);
  const dateString = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(expireDate);
  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric"
  }).format(expireDate);
  return `${timeString} on ${dateString}`;
}