export interface Pokemon {
  id: number;
  name: string;
  nameEn: string;
  nameJp: string;
  genus: string; // e.g. "鼠宝可梦"
  types: string[]; // e.g. ["电"]
  height: number; // in meters (e.g. 0.4)
  weight: number; // in kg (e.g. 6.0)
  description: string;
  artworkUrl: string;
  cryUrl: string;
  color: string;
  catchphrase?: string;
  audioVoiceIntro?: string;
}

export type ScanState = 'idle' | 'scanning' | 'silhouette' | 'revealed' | 'error';
