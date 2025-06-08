"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Song, Playlist, RepeatMode, AudioSettings, UserStats, SleepTimer, Bookmark } from "@/types/music-player"

export function useMusicPlayer() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "default",
      name: "My Playlist",
      songs: [],
    },
  ])
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>("default")
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off")
  const [isShuffle, setIsShuffle] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    equalizer: { enabled: false, preset: "flat", bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    effects: { reverb: 0, echo: 0, bassBoost: 0, spatialAudio: false },
    playbackSpeed: 1,
    crossfade: false,
    gapless: true,
    normalize: false,
  })
  const [currentTheme, setCurrentTheme] = useState("neon")
  const [userStats, setUserStats] = useState<UserStats>({
    totalListeningTime: 0,
    songsPlayed: 0,
    favoriteGenre: "",
    topArtist: "",
  })
  const [sleepTimer, setSleepTimer] = useState<SleepTimer>({
    enabled: false,
    duration: 30,
    fadeOut: true,
  })
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const equalizerNodesRef = useRef<BiquadFilterNode[]>([])
  const reverbNodeRef = useRef<ConvolverNode | null>(null)
  const bassBoostRef = useRef<BiquadFilterNode | null>(null)
  const pannerNodeRef = useRef<PannerNode | null>(null)
  const delayNodeRef = useRef<DelayNode | null>(null)
  const delayGainRef = useRef<GainNode | null>(null)
  const shuffleIndices = useRef<number[]>([])
  const shouldAutoPlayRef = useRef(false)

  const currentPlaylist = playlists.find((p) => p.id === currentPlaylistId) || playlists[0]
  const currentSong = currentSongIndex >= 0 ? currentPlaylist.songs[currentSongIndex] : null

  // Initialize Web Audio API
  const initAudioContext = useCallback(() => {
    if (!audioRef.current) return

    // Don't create multiple contexts for the same audio element
    if (audioContextRef.current && sourceNodeRef.current) {
      console.log("Audio context already initialized")
      return
    }

    try {
      // Clean up existing context if it exists
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
        sourceNodeRef.current = null
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaElementSource(audioRef.current)
      const gainNode = audioContext.createGain()

      // Create equalizer filters (10-band)
      const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
      const equalizerNodes = frequencies.map((freq, index) => {
        const filter = audioContext.createBiquadFilter()
        filter.type = index === 0 ? "lowshelf" : index === frequencies.length - 1 ? "highshelf" : "peaking"
        filter.frequency.setValueAtTime(freq, audioContext.currentTime)
        filter.Q.setValueAtTime(1, audioContext.currentTime)
        filter.gain.setValueAtTime(0, audioContext.currentTime)
        return filter
      })

      // Create reverb effect
      const reverbNode = audioContext.createConvolver()
      const reverbGain = audioContext.createGain()
      reverbGain.gain.setValueAtTime(0, audioContext.currentTime)

      // Create simple impulse response for reverb
      const length = audioContext.sampleRate * 2 // 2 seconds
      const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
        }
      }
      reverbNode.buffer = impulse

      // Create bass boost filter
      const bassBoost = audioContext.createBiquadFilter()
      bassBoost.type = "lowshelf"
      bassBoost.frequency.setValueAtTime(200, audioContext.currentTime)
      bassBoost.gain.setValueAtTime(0, audioContext.currentTime)

      // Create 3D audio panner
      const panner = audioContext.createPanner()
      panner.panningModel = "HRTF"
      panner.distanceModel = "inverse"
      panner.refDistance = 1
      panner.maxDistance = 10000
      panner.rolloffFactor = 1
      panner.coneInnerAngle = 360
      panner.coneOuterAngle = 0
      panner.coneOuterGain = 0
      panner.setPosition(0, 0, 1)

      // Create delay (echo) effect
      const delay = audioContext.createDelay(1.0)
      const delayGain = audioContext.createGain()
      const delayFeedback = audioContext.createGain()
      delay.delayTime.setValueAtTime(0.3, audioContext.currentTime)
      delayGain.gain.setValueAtTime(0, audioContext.currentTime)
      delayFeedback.gain.setValueAtTime(0.3, audioContext.currentTime)

      // Connect audio graph
      let currentNode = source

      // Connect equalizer chain
      equalizerNodes.forEach((filter) => {
        currentNode.connect(filter)
        currentNode = filter
      })

      // Connect bass boost
      currentNode.connect(bassBoost)
      currentNode = bassBoost

      // Connect to main gain
      currentNode.connect(gainNode)

      // Connect reverb (parallel processing)
      currentNode.connect(reverbGain)
      reverbGain.connect(reverbNode)
      reverbNode.connect(gainNode)

      // Connect delay (parallel processing)
      currentNode.connect(delayGain)
      delayGain.connect(delay)
      delay.connect(delayFeedback)
      delayFeedback.connect(delay)
      delay.connect(gainNode)

      // Connect 3D audio if enabled
      if (audioSettings.effects.spatialAudio) {
        gainNode.connect(panner)
        panner.connect(audioContext.destination)
      } else {
        gainNode.connect(audioContext.destination)
      }

      // Store references
      audioContextRef.current = audioContext
      sourceNodeRef.current = source
      gainNodeRef.current = gainNode
      equalizerNodesRef.current = equalizerNodes
      reverbNodeRef.current = reverbNode
      bassBoostRef.current = bassBoost
      pannerNodeRef.current = panner
      delayNodeRef.current = delay
      delayGainRef.current = delayGain

      console.log("Audio context initialized successfully")
    } catch (error) {
      console.error("Failed to initialize audio context:", error)
      setAudioError("Failed to initialize audio processing")
    }
  }, [audioSettings.effects.spatialAudio])

  // Add cleanup function
  const cleanupAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
        audioContextRef.current = null
        sourceNodeRef.current = null
        gainNodeRef.current = null
        equalizerNodesRef.current = []
        reverbNodeRef.current = null
        bassBoostRef.current = null
        pannerNodeRef.current = null
        delayNodeRef.current = null
        delayGainRef.current = null
        console.log("Audio context cleaned up")
      } catch (error) {
        console.error("Error cleaning up audio context:", error)
      }
    }
  }, [])

  // Apply equalizer settings
  const applyEqualizerSettings = useCallback(() => {
    if (!equalizerNodesRef.current.length || !audioSettings.equalizer.enabled) return

    try {
      audioSettings.equalizer.bands.forEach((gain, index) => {
        const filter = equalizerNodesRef.current[index]
        if (filter && audioContextRef.current) {
          filter.gain.setValueAtTime(gain, audioContextRef.current.currentTime)
        }
      })
      console.log("Equalizer applied:", audioSettings.equalizer.bands)
    } catch (error) {
      console.error("Failed to apply equalizer:", error)
    }
  }, [audioSettings.equalizer])

  // Apply audio effects
  const applyAudioEffects = useCallback(() => {
    if (!audioContextRef.current) return

    try {
      const { reverb, echo, bassBoost, spatialAudio } = audioSettings.effects

      // Apply reverb
      if (reverbNodeRef.current && gainNodeRef.current) {
        const reverbGain = gainNodeRef.current.context.createGain()
        reverbGain.gain.setValueAtTime(reverb / 100, audioContextRef.current.currentTime)
      }

      // Apply echo/delay
      if (delayGainRef.current) {
        delayGainRef.current.gain.setValueAtTime(echo / 100, audioContextRef.current.currentTime)
      }

      // Apply bass boost
      if (bassBoostRef.current) {
        bassBoostRef.current.gain.setValueAtTime(bassBoost / 5, audioContextRef.current.currentTime) // Scale down
      }

      // Apply 3D spatial audio
      if (pannerNodeRef.current && spatialAudio) {
        // Reconnect with panner
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect()
          gainNodeRef.current.connect(pannerNodeRef.current)
          pannerNodeRef.current.connect(audioContextRef.current.destination)
        }
      } else if (gainNodeRef.current && !spatialAudio) {
        // Reconnect without panner
        gainNodeRef.current.disconnect()
        gainNodeRef.current.connect(audioContextRef.current.destination)
      }

      console.log("Audio effects applied:", audioSettings.effects)
    } catch (error) {
      console.error("Failed to apply audio effects:", error)
    }
  }, [audioSettings.effects])

  // Apply playback speed
  const applyPlaybackSpeed = useCallback(() => {
    if (!audioRef.current) return

    try {
      audioRef.current.playbackRate = audioSettings.playbackSpeed
      console.log("Playback speed applied:", audioSettings.playbackSpeed)
    } catch (error) {
      console.error("Failed to apply playback speed:", error)
    }
  }, [audioSettings.playbackSpeed])

  // Update audio settings and apply them
  const updateAudioSettings = useCallback(
    (newSettings: Partial<AudioSettings>) => {
      setAudioSettings((prev) => {
        const updated = { ...prev, ...newSettings }

        // Apply settings immediately
        setTimeout(() => {
          if (updated.equalizer !== prev.equalizer) {
            applyEqualizerSettings()
          }
          if (updated.effects !== prev.effects) {
            applyAudioEffects()
          }
          if (updated.playbackSpeed !== prev.playbackSpeed) {
            applyPlaybackSpeed()
          }
        }, 100)

        return updated
      })
    },
    [applyEqualizerSettings, applyAudioEffects, applyPlaybackSpeed],
  )

  // Apply all audio settings when they change
  useEffect(() => {
    applyEqualizerSettings()
  }, [applyEqualizerSettings])

  useEffect(() => {
    applyAudioEffects()
  }, [applyAudioEffects])

  useEffect(() => {
    applyPlaybackSpeed()
  }, [applyPlaybackSpeed])

  // Initialize audio context when audio element is ready
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => {
      // Only initialize once per audio element
      if (!audioContextRef.current && !sourceNodeRef.current) {
        // Small delay to ensure audio element is fully ready
        setTimeout(() => {
          initAudioContext()
        }, 100)
      }
    }

    const handleLoadStart = () => {
      // Clean up previous context when loading new audio
      if (audioContextRef.current && sourceNodeRef.current) {
        cleanupAudioContext()
      }
    }

    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("loadstart", handleLoadStart)

    return () => {
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("loadstart", handleLoadStart)
    }
  }, [initAudioContext, cleanupAudioContext])

  // Rest of the existing functions remain the same...
  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songs: [],
    }
    setPlaylists((prev) => [...prev, newPlaylist])
    return newPlaylist.id
  }, [])

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p)))
  }, [])

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, songs: p.songs.filter((s) => s.id !== songId) } : p)),
    )
  }, [])

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      if (playlistId === "default") return
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
      if (currentPlaylistId === playlistId) {
        setCurrentPlaylistId("default")
        setCurrentSongIndex(-1)
        setIsPlaying(false)
      }
    },
    [currentPlaylistId],
  )

  const getAudioErrorMessage = useCallback((audio: HTMLAudioElement) => {
    if (!audio.error) return "Unknown audio error"

    switch (audio.error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return "Audio playback was aborted"
      case MediaError.MEDIA_ERR_NETWORK:
        return "Network error occurred while loading audio"
      case MediaError.MEDIA_ERR_DECODE:
        return "Audio file is corrupted or in an unsupported format"
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "Audio format not supported by your browser"
      default:
        return `Audio error (code: ${audio.error.code})`
    }
  }, [])

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return

    if (currentSongIndex < 0 || !currentSong) {
      if (currentPlaylist.songs.length > 0) {
        setCurrentSongIndex(0)
        return
      }
      return
    }

    const audio = audioRef.current

    try {
      setAudioError(null)

      // Resume audio context if suspended
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume()
      }

      if (audio.ended || audio.currentTime >= audio.duration) {
        audio.currentTime = 0
      }

      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        if (audio.readyState < 2) {
          try {
            await audio.play()
            setIsPlaying(true)
          } catch (error) {
            console.log("Audio not ready yet, retrying...")
            setTimeout(async () => {
              try {
                await audio.play()
                setIsPlaying(true)
              } catch (playError) {
                console.error("Audio playback retry failed:", playError)
              }
            }, 500)
          }
        } else {
          await audio.play()
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error)
      if (
        error instanceof Error &&
        !error.message.includes("user didn't interact") &&
        !error.message.includes("user gesture")
      ) {
        setAudioError(error instanceof Error ? error.message : "Audio playback failed")
      }
    }
  }, [isPlaying, currentSongIndex, currentSong, currentPlaylist.songs.length])

  // Rest of the existing functions remain exactly the same...
  const playSong = useCallback(
    async (playlistId: string, index: number) => {
      await new Promise((resolve) => setTimeout(resolve, 50))

      const playlist = playlists.find((p) => p.id === playlistId)
      if (!playlist) {
        console.error(`Playlist not found: ${playlistId}`)
        setAudioError("Playlist not found")
        return
      }

      if (index < 0 || index >= playlist.songs.length) {
        console.error(`Invalid song index: ${index}`)
        setAudioError(`Invalid song index: ${index}`)
        return
      }

      const song = playlist.songs[index]
      if (!song || !song.url) {
        setAudioError("Song file not available")
        return
      }

      setCurrentPlaylistId(playlistId)
      setCurrentSongIndex(index)
      setAudioError(null)

      if (isShuffle) {
        const indices = [...Array(playlist.songs.length).keys()]
        indices.splice(index, 1)
        shuffleArray(indices)
        indices.unshift(index)
        shuffleIndices.current = indices
      }

      if (shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
      }

      console.log(`Selected song: ${song.name} at index ${index}`)
    },
    [playlists, isShuffle],
  )

  const seek = useCallback(
    (value: number) => {
      if (!audioRef.current || !currentSong) return
      try {
        audioRef.current.currentTime = value
        setCurrentTime(value)
        setAudioError(null)
      } catch (error) {
        console.error("Seek error:", error)
        setAudioError("Seek failed")
      }
    },
    [currentSong],
  )

  const setVolumeLevel = useCallback(
    (value: number) => {
      if (!audioRef.current) return
      try {
        const newVolume = Math.max(0, Math.min(1, value))
        audioRef.current.volume = newVolume

        // Also update Web Audio API gain if available
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current?.currentTime || 0)
        }

        setVolume(newVolume)
        if (newVolume === 0) {
          setIsMuted(true)
        } else if (isMuted) {
          setIsMuted(false)
        }
        setAudioError(null)
      } catch (error) {
        console.error("Volume error:", error)
      }
    },
    [isMuted],
  )

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    try {
      if (isMuted) {
        audioRef.current.volume = volume
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current?.currentTime || 0)
        }
      } else {
        audioRef.current.volume = 0
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0)
        }
      }
      setIsMuted(!isMuted)
      setAudioError(null)
    } catch (error) {
      console.error("Mute error:", error)
    }
  }, [isMuted, volume])

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((current) => {
      if (current === "off") return "all"
      if (current === "all") return "one"
      return "off"
    })
  }, [])

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      if (!prev && currentPlaylist) {
        const indices = [...Array(currentPlaylist.songs.length).keys()]
        if (currentSongIndex >= 0) {
          indices.splice(currentSongIndex, 1)
          shuffleArray(indices)
          indices.unshift(currentSongIndex)
        } else {
          shuffleArray(indices)
        }
        shuffleIndices.current = indices
      }
      return !prev
    })
  }, [currentPlaylist, currentSongIndex])

  const playNext = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.songs.length === 0) return

    let nextIndex: number

    if (isShuffle) {
      const currentShuffleIndex = shuffleIndices.current.indexOf(currentSongIndex)
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.current.length
      nextIndex = shuffleIndices.current[nextShuffleIndex]
    } else {
      nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length
    }

    shouldAutoPlayRef.current = true
    setCurrentSongIndex(nextIndex)
    setAudioError(null)
  }, [currentPlaylist, currentSongIndex, isShuffle])

  const playPrevious = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.songs.length === 0) return

    let prevIndex: number

    if (isShuffle) {
      const currentShuffleIndex = shuffleIndices.current.indexOf(currentSongIndex)
      const prevShuffleIndex = (currentShuffleIndex - 1 + shuffleIndices.current.length) % shuffleIndices.current.length
      prevIndex = shuffleIndices.current[prevShuffleIndex]
    } else {
      prevIndex = (currentSongIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length
    }

    shouldAutoPlayRef.current = true
    setCurrentSongIndex(prevIndex)
    setAudioError(null)
  }, [currentPlaylist, currentSongIndex, isShuffle])

  const handleFileUpload = useCallback((files: FileList, playlistId = "default") => {
    const newSongs: Song[] = []

    Array.from(files).forEach((file) => {
      try {
        if (file.type.startsWith("audio/") || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
          const song: Song = {
            id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Unknown Artist",
            duration: 0,
            file: file,
            url: URL.createObjectURL(file),
          }
          newSongs.push(song)
        }
      } catch (error) {
        console.error("Error processing file:", error)
      }
    })

    if (newSongs.length > 0) {
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, songs: [...p.songs, ...newSongs] } : p)))
      setAudioError(null)
      console.log(`Successfully uploaded ${newSongs.length} songs`)
    }

    return newSongs
  }, [])

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }

    const updateDuration = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0
        audio.play().catch((error) => {
          console.error("Error replaying song:", error)
        })
      } else if (repeatMode === "all" || currentSongIndex < currentPlaylist.songs.length - 1) {
        shouldAutoPlayRef.current = true

        let nextIndex: number
        if (isShuffle) {
          const currentShuffleIndex = shuffleIndices.current.indexOf(currentSongIndex)
          const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.current.length
          nextIndex = shuffleIndices.current[nextShuffleIndex]
        } else {
          nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length
        }

        setCurrentSongIndex(nextIndex)
      } else {
        setIsPlaying(false)
      }
    }

    const handleError = () => {
      const errorMessage = getAudioErrorMessage(audio)
      console.error("Audio error:", errorMessage)
      setIsPlaying(false)
      setAudioError(errorMessage)
    }

    const handleLoadStart = () => {
      setAudioError(null)
    }

    const handleCanPlay = () => {
      setAudioError(null)
      // Apply current settings when song is ready
      setTimeout(() => {
        applyEqualizerSettings()
        applyAudioEffects()
        applyPlaybackSpeed()
      }, 100)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [
    currentPlaylist,
    currentSongIndex,
    repeatMode,
    isShuffle,
    getAudioErrorMessage,
    applyEqualizerSettings,
    applyAudioEffects,
    applyPlaybackSpeed,
  ])

  // Update audio source when current song changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (currentSong.url) {
      try {
        setAudioError(null)
        audio.src = currentSong.url
        audio.load()

        console.log(`Loading audio: ${currentSong.name}`)

        if (isPlaying) {
          audio.play().catch((error) => {
            console.error("Auto-play error:", error)
          })
        }
      } catch (error) {
        console.error("Error setting audio source:", error)
        setAudioError("Failed to load audio file")
      }
    }
  }, [currentSong, isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    return () => {
      // Clean up URLs
      playlists.forEach((playlist) => {
        playlist.songs.forEach((song) => {
          if (song.url && song.file) {
            try {
              URL.revokeObjectURL(song.url)
            } catch (error) {
              console.error("Error revoking URL:", error)
            }
          }
        })
      })

      // Clean up audio context
      cleanupAudioContext()
    }
  }, [playlists, cleanupAudioContext])

  const toggleFavorite = useCallback((songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => ({
        ...playlist,
        songs: playlist.songs.map((song) => (song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song)),
      })),
    )
  }, [])

  const createSmartPlaylist = useCallback(
    (criteria: any) => {
      const allSongs = playlists.flatMap((p) => p.songs)
      let filteredSongs: Song[] = []

      switch (criteria.type) {
        case "favorites":
          filteredSongs = allSongs.filter((song) => song.isFavorite)
          break
        case "recent":
          filteredSongs = allSongs
            .filter((song) => song.lastPlayed)
            .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))
            .slice(0, criteria.limit)
          break
        case "genre":
          filteredSongs = allSongs.filter((song) => song.genre?.toLowerCase().includes(criteria.value.toLowerCase()))
          break
        case "mood":
          filteredSongs = allSongs.filter((song) => song.mood?.toLowerCase().includes(criteria.value.toLowerCase()))
          break
        case "mostPlayed":
          filteredSongs = allSongs.sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, criteria.limit)
          break
      }

      const newPlaylist: Playlist = {
        id: `smart-${Date.now()}`,
        name: `Smart: ${criteria.type}${criteria.value ? ` (${criteria.value})` : ""}`,
        songs: filteredSongs,
        isSmartPlaylist: true,
        smartCriteria: criteria,
      }

      setPlaylists((prev) => [...prev, newPlaylist])
      return newPlaylist.id
    },
    [playlists],
  )

  const createBookmark = useCallback(
    (name?: string) => {
      if (!currentSong) return

      const bookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        songId: currentSong.id,
        position: currentTime,
        name: name || `${currentSong.name} - ${formatTime(currentTime)}`,
        createdAt: new Date(),
      }

      setBookmarks((prev) => [...prev, bookmark])
      return bookmark.id
    },
    [currentSong, currentTime, formatTime],
  )

  const updateLyrics = useCallback((songId: string, lyrics: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => ({
        ...playlist,
        songs: playlist.songs.map((song) => (song.id === songId ? { ...song, lyrics } : song)),
      })),
    )
  }, [])

  const handleSleepTimerComplete = useCallback(() => {
    setIsPlaying(false)
    setSleepTimer((prev) => ({ ...prev, enabled: false }))
  }, [])

  return {
    playlists,
    currentPlaylistId,
    currentPlaylist,
    currentSongIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    isShuffle,
    isMuted,
    audioError,
    audioRef,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    setCurrentPlaylistId,
    togglePlayPause,
    playSong,
    seek,
    setVolumeLevel,
    toggleMute,
    cycleRepeatMode,
    toggleShuffle,
    playNext,
    playPrevious,
    handleFileUpload,
    formatTime,
    audioSettings,
    updateAudioSettings,
    currentTheme,
    setCurrentTheme,
    userStats,
    sleepTimer,
    setSleepTimer,
    bookmarks,
    toggleFavorite,
    createSmartPlaylist,
    createBookmark,
    updateLyrics,
    handleSleepTimerComplete,
  }
}
