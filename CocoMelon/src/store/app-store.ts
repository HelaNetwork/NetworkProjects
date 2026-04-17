import { create } from "zustand";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type {
  UserProfile,
  Match,
  ChatMessage,
  Notification,
  OnChainEvent,
} from "@/lib/types";

interface AppState {
  // Auth
  address: string | null;
  identityHash: string | null;
  isConnected: boolean;

  // Profile
  profile: UserProfile | null;
  profiles: UserProfile[];

  // Matches & Likes
  matches: Match[];
  likedProfiles: string[];
  swipeIndex: number;

  // Chat
  messages: Record<string, ChatMessage[]>;
  activeChat: string | null;

  // Events
  events: OnChainEvent[];

  // Notifications
  notifications: Notification[];

  // UI
  isLoading: boolean;

  // Auth actions
  setAuth: (address: string, identityHash: string) => void;
  disconnect: () => void;

  // Profile actions
  setProfile: (profile: UserProfile) => void;
  setProfiles: (profiles: UserProfile[]) => void;

  // Match actions
  addMatch: (match: Match) => void;
  setMatches: (matches: Match[]) => void;

  // Like actions
  addLike: (profileHash: string) => void;

  // Swipe actions
  nextSwipe: () => void;
  resetSwipe: () => void;

  // Chat actions
  addMessage: (matchId: string, message: ChatMessage) => void;
  setActiveChat: (matchId: string | null) => void;

  // Event actions
  addEvent: (event: OnChainEvent) => void;

  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // UI actions
  setLoading: (loading: boolean) => void;

  // Hydration
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  address: null,
  identityHash: null,
  isConnected: false,
  profile: null,
  profiles: [],
  matches: [],
  likedProfiles: [],
  swipeIndex: 0,
  messages: {},
  activeChat: null,
  events: [],
  notifications: [],
  isLoading: false,

  setAuth: (address, identityHash) => {
    setItem(STORAGE_KEYS.IDENTITY, { address, identityHash });
    set({ address, identityHash, isConnected: true });
  },

  disconnect: () => {
    set({
      address: null,
      identityHash: null,
      isConnected: false,
      profile: null,
    });
  },

  setProfile: (profile) => {
    setItem(STORAGE_KEYS.PROFILE, profile);
    set({ profile });
  },

  setProfiles: (profiles) => {
    setItem(STORAGE_KEYS.PROFILES_CACHE, profiles);
    set({ profiles });
  },

  addMatch: (match) => {
    const current = get().matches;
    const exists = current.find((m) => m.id === match.id);
    if (exists) return;
    const updated = [...current, match];
    setItem(STORAGE_KEYS.MATCHES, updated);
    set({ matches: updated });

    get().addNotification({
      id: `match-${match.id}`,
      type: "match",
      title: "New Match!",
      message: `You matched with ${match.profile?.name || "someone"}`,
      timestamp: Date.now(),
      read: false,
    });
  },

  setMatches: (matches) => {
    setItem(STORAGE_KEYS.MATCHES, matches);
    set({ matches });
  },

  addLike: (profileHash) => {
    const current = get().likedProfiles;
    if (current.includes(profileHash)) return;
    const updated = [...current, profileHash];
    setItem(STORAGE_KEYS.LIKED_PROFILES, updated);
    set({ likedProfiles: updated });
  },

  nextSwipe: () => {
    const next = get().swipeIndex + 1;
    setItem(STORAGE_KEYS.SWIPE_INDEX, next);
    set({ swipeIndex: next });
  },

  resetSwipe: () => {
    setItem(STORAGE_KEYS.SWIPE_INDEX, 0);
    set({ swipeIndex: 0 });
  },

  addMessage: (matchId, message) => {
    const current = get().messages;
    const chatMessages = current[matchId] || [];
    const updated = {
      ...current,
      [matchId]: [...chatMessages, message],
    };
    setItem(STORAGE_KEYS.CHAT_PREFIX + matchId, updated[matchId]);
    set({ messages: updated });
  },

  setActiveChat: (matchId) => set({ activeChat: matchId }),

  addEvent: (event) => {
    set({ events: [...get().events, event] });
  },

  addNotification: (notification) => {
    const current = get().notifications;
    setItem(STORAGE_KEYS.NOTIFICATIONS, [...current, notification]);
    set({ notifications: [...current, notification] });
  },

  markNotificationRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
  },

  clearNotifications: () => {
    setItem(STORAGE_KEYS.NOTIFICATIONS, []);
    set({ notifications: [] });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: () => {
    const identity = getItem<{ address: string; identityHash: string }>(
      STORAGE_KEYS.IDENTITY
    );
    const profile = getItem<UserProfile>(STORAGE_KEYS.PROFILE);
    const matches = getItem<Match[]>(STORAGE_KEYS.MATCHES);
    const likedProfiles = getItem<string[]>(STORAGE_KEYS.LIKED_PROFILES);
    const swipeIndex = getItem<number>(STORAGE_KEYS.SWIPE_INDEX);
    const notifications = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const profiles = getItem<UserProfile[]>(STORAGE_KEYS.PROFILES_CACHE);

    const messageKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("hela_match_chat_")
    );
    const messages: Record<string, ChatMessage[]> = {};
    messageKeys.forEach((key) => {
      const matchId = key.replace("hela_match_chat_", "");
      try {
        messages[matchId] = JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        messages[matchId] = [];
      }
    });

    set({
      address: identity?.address || null,
      identityHash: identity?.identityHash || null,
      isConnected: !!identity,
      profile: profile || null,
      matches: matches || [],
      likedProfiles: likedProfiles || [],
      swipeIndex: swipeIndex || 0,
      notifications: notifications || [],
      profiles: profiles || [],
      messages,
    });
  },
}));
