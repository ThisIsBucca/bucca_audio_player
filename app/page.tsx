"use client"

import type React from "react"

import { useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  AlertCircle,
  Music,
  List,
  X,
  Settings,
  Heart,
  BarChart3,
  Sparkles,
  FileText,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useMusicPlayer } from "@/hooks/use-music-player"
import { PlaylistModal } from "@/components/playlist-modal"
import { AppStarter } from "@/components/app-starter"
import { useMobile } from "@/hooks/use-mobile"
import { Equalizer } from "@/components/equalizer"
import { AudioEffects } from "@/components/audio-effects"
import { Visualizer } from "@/components/visualizer"
import { LyricsDisplay } from "@/components/lyrics-display"
import { SmartPlaylists } from "@/components/smart-playlists"
import { ThemeSelector } from "@/components/theme-selector"
import { AdvancedControls } from "@/components/advanced-controls"
import { useTheme } from "next-themes"

const waveKeyframes = `
  @keyframes wave {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
  .wave-bar {
    animation: wave 0.8s ease-in-out infinite alternate;
  }
`

export default function BuccaMusicPlayer() {
  const { theme, setTheme } = useTheme()
  const {
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
    userStats,
    sleepTimer,
    setSleepTimer,
    bookmarks,
    toggleFavorite,
    createSmartPlaylist,
    createBookmark,
    updateLyrics,
    handleSleepTimerComplete,
  } = useMusicPlayer()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showStarter, setShowStarter] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState<
    "player" | "equalizer" | "effects" | "lyrics" | "smart" | "themes" | "advanced"
  >("player")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      let targetPlaylistId = "default"

      if (event.target.files.length > 1) {
        const randomName = `Playlist ${new Date().toLocaleDateString()} ${Math.floor(Math.random() * 1000)}`
        targetPlaylistId = createPlaylist(randomName)
      }

      const newSongs = handleFileUpload(event.target.files, targetPlaylistId)

      if (newSongs.length > 0) {
        setCurrentPlaylistId(targetPlaylistId)

        setTimeout(() => {
          const updatedPlaylist = playlists.find((p) => p.id === targetPlaylistId)
          if (updatedPlaylist && updatedPlaylist.songs.length > 0) {
            playSong(targetPlaylistId, 0)

            setTimeout(() => {
              togglePlayPause()
            }, 500)
          }
        }, 200)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <Repeat1 className="h-4 w-4" />
      case "all":
        return <Repeat className="h-4 w-4 text-pink-500" />
      default:
        return <Repeat className="h-4 w-4" />
    }
  }

  if (showStarter) {
    return <AppStarter onComplete={() => setShowStarter(false)} />
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 flex items-center justify-center font-quicksand overflow-hidden"
        style={{
          backgroundImage: "url('/nightclub-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-sm mx-auto h-full flex flex-col">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-pink-500/20 flex-1 flex flex-col">
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 rounded-2xl"></div>

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10 flex-1 flex flex-col">
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 mb-1">
                  Bucca Music Player
                </h1>
                <p className="text-white/70 text-xs">Your personal music experience</p>
              </div>

              {/* Error Display */}
              {audioError && (
                <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-2 max-h-20 overflow-y-auto custom-scrollbar">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-red-300 text-sm break-words whitespace-pre-line">{audioError}</p>
                </div>
              )}

              {/* File Selection & Playlist */}
              <div className="mb-4 flex items-center justify-between">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-3 py-1 text-xs h-8"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Add Music
                </Button>

                <PlaylistModal
                  playlists={playlists}
                  currentPlaylistId={currentPlaylistId}
                  onCreatePlaylist={createPlaylist}
                  onDeletePlaylist={deletePlaylist}
                  onSelectPlaylist={setCurrentPlaylistId}
                  onPlaySong={playSong}
                  onRemoveSong={removeSongFromPlaylist}
                  formatTime={formatTime}
                />
              </div>

              {/* Current Song Info */}
              {currentSong ? (
                <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-pink-500/20">
                  <p className="text-white font-medium text-sm truncate">{currentSong.name}</p>
                  <p className="text-white/60 text-xs">{currentSong.artist}</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-pink-500/20">
                  <p className="text-white/60 text-center text-xs">No song selected</p>
                </div>
              )}

              {/* Wave Animation */}
              {currentSong && (
                <>
                  <style jsx>{waveKeyframes}</style>
                  <div className="mb-4 flex justify-center items-center h-12 bg-black/20 backdrop-blur-sm rounded-xl border border-pink-500/20">
                    {isPlaying ? (
                      <div className="flex items-end space-x-0.5">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-t from-pink-500 to-blue-500 rounded-full wave-bar shadow-sm"
                            style={{
                              width: "2px",
                              height: `${8 + Math.random() * 16}px`,
                              animationDelay: `${i * 0.08}s`,
                              animationDuration: `${0.6 + Math.random() * 0.4}s`,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-end space-x-0.5">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-white/20 rounded-full"
                            style={{
                              width: "2px",
                              height: "6px",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Audio Element */}
              <audio ref={audioRef} preload="metadata" />

              {/* Player Controls */}
              <div className="space-y-4 flex-1 flex flex-col justify-end">
                {/* Progress Bar */}
                <div className="space-y-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-pink-500/20">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={(value) => seek(value[0])}
                    disabled={!currentSong || audioError !== null}
                    className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-pink-500 [&>span:first-child_span]:to-blue-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
                  />

                  {/* Time Display */}
                  <div className="flex justify-between text-white/90 text-xs font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between px-2">
                  <Button
                    onClick={toggleShuffle}
                    disabled={!currentSong}
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-8 w-8 ${
                      isShuffle ? "text-pink-500 bg-pink-500/20" : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={playPrevious}
                    disabled={!currentSong}
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={togglePlayPause}
                    disabled={!currentSong}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:from-gray-500 disabled:to-gray-600 shadow-lg"
                    size="icon"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>

                  <Button
                    onClick={playNext}
                    disabled={!currentSong}
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={cycleRepeatMode}
                    disabled={!currentSong}
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-8 w-8 ${
                      repeatMode !== "off"
                        ? "text-pink-500 bg-pink-500/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {getRepeatIcon()}
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-xl p-2 border border-pink-500/20">
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolumeLevel(value[0] / 100)}
                    className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-pink-500 [&>span:first-child_span]:to-blue-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
                  />
                </div>
              </div>

              {/* Instructions */}
              {!currentSong && (
                <div className="mt-4 text-center bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-pink-500/20">
                  <p className="text-white/90 text-xs">Upload music files to start playing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div
      className={`h-screen w-screen min-h-screen min-w-full font-quicksand overflow-hidden ${
        theme === "neon"
          ? "bg-gradient-to-br from-[#1a0033] via-[#0a0f2c] to-[#0ff0fc]"
          : theme === "retro"
          ? "bg-gradient-to-br from-[#fffbe6] via-[#ffe0b2] to-[#ff6b35]"
          : theme === "minimal"
          ? "bg-gradient-to-br from-[#f5f6fa] via-[#e0e7ef] to-[#6366f1]"
          : theme === "light"
          ? "bg-gradient-to-br from-blue-100 via-white to-cyan-100"
          : "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      }`}
      style={
        theme === "neon"
          ? {
              backgroundImage:
                "linear-gradient(135deg, #1a0033 0%, #0a0f2c 60%, #0ff0fc 100%), url('/nightclub-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }
          : undefined
      }
    >
      <div className="relative w-full max-w-6xl mx-auto my-4 h-[calc(100vh-2rem)] flex flex-col md:flex-row bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-pink-500/20 overflow-hidden">
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 rounded-2xl pointer-events-none z-0" />
        {/* Sidebar - Playlist Section */}
        <aside
          className={`relative z-10 w-full md:w-80 bg-black/30 border-r border-pink-500/20 p-4 flex flex-col h-full min-h-0 ${
            showSidebar ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-audiowide text-pink-500">Playlists</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full text-white/70 hover:text-white hover:bg-white/10 h-6 w-6"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl mb-3 h-8 text-xs"
            >
              <Upload className="w-3 h-3 mr-2" />
              Add Music
            </Button>
          </div>
          {/* Playlist List */}
          <div className="space-y-1 mb-4 flex-shrink-0 max-h-60 overflow-y-auto custom-scrollbar">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`p-2 rounded-lg cursor-pointer transition-all text-xs ${
                  currentPlaylistId === playlist.id
                    ? "bg-pink-500/30 border border-pink-500/50"
                    : "bg-white/5 hover:bg-white/10 border border-transparent"
                }`}
                onClick={() => setCurrentPlaylistId(playlist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{playlist.name}</p>
                    <p className="text-xs text-white/60">{playlist.songs.length} songs</p>
                  </div>
                  {playlist.id !== "default" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full text-white/60 hover:text-white hover:bg-red-500/20 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePlaylist(playlist.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Current Playlist Songs */}
          {currentPlaylist && (
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-medium text-white/90 mb-2 flex-shrink-0">
                {currentPlaylist.name} - {currentPlaylist.songs.length} songs
              </h3>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-pink-500/20 p-3 h-56 pb-4 flex flex-col">
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {currentPlaylist.songs.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="w-6 h-6 text-white/30 mx-auto mb-2" />
                      <p className="text-white/60 text-xs">No songs in this playlist</p>
                    </div>
                  ) : (
                    <div className="space-y-1 pb-4">
                      {currentPlaylist.songs.map((song, index) => (
                        <div
                          key={song.id}
                          className={`p-2 rounded-lg cursor-pointer text-xs transition-all ${
                            currentSongIndex === index && currentPlaylistId === currentPlaylist.id
                              ? "bg-gradient-to-r from-pink-500/30 to-blue-500/30 border border-pink-500/50"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                          onClick={() => {
                            playSong(currentPlaylist.id, index)
                            setTimeout(() => {
                              if (!isPlaying) {
                                togglePlayPause()
                              }
                            }, 100)
                          }}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                                currentSongIndex === index && currentPlaylistId === currentPlaylist.id
                                  ? "bg-pink-500"
                                  : "bg-white/10"
                              }`}
                            >
                              {currentSongIndex === index && currentPlaylistId === currentPlaylist.id && isPlaying ? (
                                <Pause className="h-3 w-3 text-white" />
                              ) : (
                                <Play className="h-3 w-3 text-white ml-0.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{song.name}</p>
                              <p className="text-xs text-white/60 truncate">{formatTime(song.duration)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
        {/* Main Player Section */}
        <main className="relative z-10 flex-1 flex flex-col min-w-0 p-6 gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 h-6 w-6"
                onClick={() => setShowSidebar(true)}
              >
                <List className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
                Bucca Music Player
              </h1>
            </div>
            <p className="text-white/70 text-sm hidden md:block">Your personal music experience</p>
          </div>
          {/* Tab Navigation */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-pink-500/20">
              {[
                { id: "player", icon: Music, label: "Player" },
                { id: "equalizer", icon: BarChart3, label: "EQ" },
                { id: "effects", icon: Sparkles, label: "Effects" },
                { id: "lyrics", icon: FileText, label: "Lyrics" },
                { id: "smart", icon: Sparkles, label: "Smart" },
                { id: "themes", icon: Palette, label: "Themes" },
                { id: "advanced", icon: Settings, label: "Advanced" },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-xs ${
                      activeTab === tab.id ? "bg-pink-600 hover:bg-pink-700" : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>
          {/* Error Display */}
          {audioError && (
            <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-2 max-h-20 overflow-y-auto custom-scrollbar">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-red-300 text-sm break-words whitespace-pre-line">{audioError}</p>
            </div>
          )}
          {/* Tabbed Content */}
          <section className="flex-1 flex flex-col items-center justify-center min-h-0 w-full">
            {activeTab === "player" && (
              <>
                {currentSong ? (
                  <div className="text-center mb-4 w-full">
                    <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-white/10 shadow-lg relative">
                      <Music className="w-16 h-16 text-white/30" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(currentSong.id)}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            currentSong.isFavorite ? "fill-pink-500 text-pink-500" : "text-white/60"
                          }`}
                        />
                      </Button>
                    </div>
                    <h2 className="text-xl inline-block font-medium text-white mb-1 truncate max-w-md">
                      {currentSong.name}
                    </h2>
                    <p className="text-sm text-white/60">{currentSong.artist}</p>
                    {currentSong.album && <p className="text-xs text-white/40">{currentSong.album}</p>}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-pink-500/20 w-full max-w-md">
                    <Music className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">No song selected</p>
                    <p className="text-white/40 mt-1 text-xs">Upload music or select a song from your playlist</p>
                  </div>
                )}

                {/* Visualizer */}
                {currentSong && (
                  <div className="w-full max-w-md mb-4">
                    <Visualizer audioRef={audioRef as React.RefObject<HTMLAudioElement>} isPlaying={isPlaying} type="bars" />
                  </div>
                )}
              </>
            )}

            {activeTab === "equalizer" && (
              <div className="w-full max-w-2xl">
                <Equalizer
                  settings={audioSettings.equalizer}
                  onSettingsChange={(eq) => updateAudioSettings({ equalizer: eq })}
                />
              </div>
            )}

            {activeTab === "effects" && (
              <div className="w-full max-w-md">
                <AudioEffects
                  effects={audioSettings.effects}
                  onEffectsChange={(effects) => updateAudioSettings({ effects })}
                />
              </div>
            )}

            {activeTab === "lyrics" && (
              <div className="w-full max-w-md">
                <LyricsDisplay
                  song={currentSong}
                  currentTime={currentTime}
                  onLyricsUpdate={(lyrics) => currentSong && updateLyrics(currentSong.id, lyrics)}
                />
              </div>
            )}

            {activeTab === "smart" && (
              <div className="w-full max-w-md">
                <SmartPlaylists
                  songs={playlists.flatMap((p) => p.songs)}
                  onCreateSmartPlaylist={createSmartPlaylist}
                />
              </div>
            )}

            {activeTab === "themes" && (
              <div className="w-full max-w-md max-h-80 overflow-y-auto custom-scrollbar">
                <ThemeSelector currentTheme={theme || "dark"} onThemeChange={setTheme} />
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="w-full max-w-md">
                <AdvancedControls
                  playbackSpeed={audioSettings.playbackSpeed}
                  onSpeedChange={(speed) => updateAudioSettings({ playbackSpeed: speed })}
                  crossfade={audioSettings.crossfade}
                  onCrossfadeChange={(crossfade) => updateAudioSettings({ crossfade })}
                  gapless={audioSettings.gapless}
                  onGaplessChange={(gapless) => updateAudioSettings({ gapless })}
                  onCreateBookmark={() => createBookmark()}
                />
              </div>
            )}
          </section>
          {/* Audio Element */}
          <audio ref={audioRef} preload="metadata" />
          {/* Player Controls */}
          <footer className="w-full max-w-2xl mx-auto mt-2">
            <div className="space-y-2 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-pink-500/20 mb-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={(value) => seek(value[0])}
                disabled={!currentSong || audioError !== null}
                className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-pink-500 [&>span:first-child_span]:to-blue-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
              />
              <div className="flex justify-between text-white/90 text-xs font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex items-center justify-center space-x-3 mb-4 md:mb-0">
                <Button
                  onClick={toggleShuffle}
                  disabled={!currentSong}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full h-8 w-8 ${
                    isShuffle ? "text-pink-500 bg-pink-500/20" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>

                <Button
                  onClick={playPrevious}
                  disabled={!currentSong}
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={!currentSong}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white disabled:opacity-50 disabled:from-gray-500 disabled:to-gray-600 shadow-lg"
                  size="icon"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>

                <Button
                  onClick={playNext}
                  disabled={!currentSong}
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  onClick={cycleRepeatMode}
                  disabled={!currentSong}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full h-8 w-8 ${
                    repeatMode !== "off"
                      ? "text-pink-500 bg-pink-500/20"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {getRepeatIcon()}
                </Button>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-xl p-2 border border-pink-500/20 flex-1">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-6 w-6 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolumeLevel(value[0] / 100)}
                  className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-pink-500 [&>span:first-child_span]:to-blue-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
                />
              </div>
            </div>
          </footer>
        </main>
      </div>

      <style jsx global>{`
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 42, 109, 0.5) rgba(255, 255, 255, 0.05);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin: 4px 0;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #ff2a6d, #05d9e8);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #e01b5c, #01b7c5);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* Force scrollbar to always be visible */
  .custom-scrollbar::-webkit-scrollbar-thumb {
    min-height: 20px;
  }
  
  /* Ensure scrollbar appears even when not hovering */
  .custom-scrollbar {
    overflow-y: scroll !important;
  }
`}</style>
    </div>
  )
}
