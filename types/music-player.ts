export interface Song {
  id: string
  name: string
  artist: string
  album?: string
  genre?: string
  duration: number
  file?: File
  url?: string
  artwork?: string
  isFavorite?: boolean
  playCount?: number
  lastPlayed?: Date
  bpm?: number
  mood?: string
  lyrics?: string
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
  createdAt?: Date
  description?: string
  isSmartPlaylist?: boolean
  smartCriteria?: SmartPlaylistCriteria
}

export interface SmartPlaylistCriteria {
  type: "favorites" | "recent" | "genre" | "mood" | "mostPlayed"
  value?: string
  limit?: number
}

export type RepeatMode = "off" | "one" | "all"

export type Theme = "neon" | "retro" | "minimal" | "dark" | "light"

export interface AudioSettings {
  equalizer: EqualizerSettings
  effects: AudioEffects
  playbackSpeed: number
  crossfade: boolean
  gapless: boolean
  normalize: boolean
}

export interface EqualizerSettings {
  enabled: boolean
  preset: string
  bands: number[]
}

export interface AudioEffects {
  reverb: number
  echo: number
  bassBoost: number
  spatialAudio: boolean
}

export interface UserStats {
  totalListeningTime: number
  songsPlayed: number
  favoriteGenre: string
  topArtist: string
}

export interface SleepTimer {
  enabled: boolean
  duration: number
  fadeOut: boolean
}

export interface Bookmark {
  id: string
  songId: string
  position: number
  name: string
  createdAt: Date
}
