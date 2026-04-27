import { formatDistanceToNow } from "date-fns";

export const shortAddress = (addr = "") =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const generateAvatar = (address = "") => {
  // Generate a deterministic gradient avatar from address
  const colors = [
    ["#6c63ff", "#00d4aa"],
    ["#ff4d6d", "#6c63ff"],
    ["#00d4aa", "#3b82f6"],
    ["#f59e0b", "#ef4444"],
    ["#8b5cf6", "#06b6d4"],
    ["#ec4899", "#8b5cf6"],
  ];
  const idx = parseInt(address.slice(2, 4) || "0", 16) % colors.length;
  return colors[idx];
};

export const reputationLabel = (score) => {
  if (score >= 500) return { label: "Legendary", color: "text-yellow-400" };
  if (score >= 200) return { label: "Notable", color: "text-purple-400" };
  if (score >= 50) return { label: "Active", color: "text-chain-green" };
  return { label: "Newcomer", color: "text-chain-text-muted" };
};
