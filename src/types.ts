export interface SteamPlayer {
  name: string;
  status: string;
  online: boolean;
  country: string | null;
  timecreated: number | null;
  gameCount: number;
  level: number;
  recentGames: { name: string; hours: number }[];
}

export interface ScryfallCard {
  name: string;
  image_uris?: { normal: string };
  card_faces?: { image_uris: { normal: string } }[];
  set_name: string;
  rarity: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  fork: boolean;
}

export interface WinampTrack {
  title: string;
  id: string;
}

export type Suit = 'H' | 'D' | 'S' | 'C';

export interface Card {
  s: Suit;
  v: number;
  up: boolean;
}

export interface BonziMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  found: Card[][];
  tab: Card[][];
  score: number;
}
