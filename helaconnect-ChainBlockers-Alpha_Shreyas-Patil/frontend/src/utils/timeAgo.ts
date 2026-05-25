export function timeAgo(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);

  const diffMs: number = now.getTime() - past.getTime();
  const seconds: number = Math.floor(diffMs / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes: number = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours: number = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days: number = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  const weeks: number = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  const months: number = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  const years: number = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}