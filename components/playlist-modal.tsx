"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Music, Trash2, Heart } from "lucide-react"
import type { Playlist } from "@/types/music-player"

interface PlaylistModalProps {
  playlists: Playlist[]
  currentPlaylistId: string
  onCreatePlaylist: (name: string) => string
  onDeletePlaylist: (id: string) => void
  onSelectPlaylist: (id: string) => void
  onPlaySong: (playlistId: string, songIndex: number) => void
  onRemoveSong: (playlistId: string, songId: string) => void
  formatTime: (time: number) => string
}

export function PlaylistModal({
  playlists,
  currentPlaylistId,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectPlaylist,
  onPlaySong,
  onRemoveSong,
  formatTime,
}: PlaylistModalProps) {
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(currentPlaylistId)
  const [isOpen, setIsOpen] = useState(false)

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const id = onCreatePlaylist(newPlaylistName)
      setSelectedPlaylistId(id)
      setNewPlaylistName("")
    }
  }

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/10 hover:bg-white/20 text-white"
          onClick={() => setIsOpen(true)}
        >
          <Music className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 border-pink-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-audiowide text-pink-500">Playlists</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 mt-4">
          <Input
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="bg-white/10 border-pink-500/30 text-white"
          />
          <Button onClick={handleCreatePlaylist} className="bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
          {playlists.map((playlist) => (
            <Button
              key={playlist.id}
              variant={selectedPlaylistId === playlist.id ? "default" : "outline"}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className={
                selectedPlaylistId === playlist.id
                  ? "bg-pink-600 hover:bg-pink-700 text-white border-none"
                  : "bg-transparent border-pink-500/30 text-white hover:bg-white/10"
              }
            >
              {playlist.name} ({playlist.songs.length})
            </Button>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-3 text-pink-400 sticky top-0 bg-black/90 py-1 z-10">
            {selectedPlaylist.name} Songs ({selectedPlaylist.songs.length})
          </h3>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedPlaylist.songs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-white/60 text-sm">No songs in this playlist</p>
                <p className="text-white/40 text-xs mt-1">Upload music files to get started</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedPlaylist.songs.map((song, index) => (
                  <li
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-pink-500/20"
                  >
                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => onPlaySong(selectedPlaylist.id, index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <span className="text-xs font-medium text-white/70">{index + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate text-white">{song.name}</p>
                            {song.isFavorite && <Heart className="h-3 w-3 fill-pink-500 text-pink-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-white/60 truncate">
                            {song.artist} • {formatTime(song.duration)}
                            {song.playCount && ` • ${song.playCount} plays`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveSong(selectedPlaylist.id, song.id)
                      }}
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-red-500/20 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {selectedPlaylist.id !== "default" && (
            <Button
              variant="destructive"
              onClick={() => onDeletePlaylist(selectedPlaylist.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Playlist
            </Button>
          )}
          <Button
            onClick={() => {
              onSelectPlaylist(selectedPlaylist.id)
              setIsOpen(false) // Close the modal
            }}
            className="bg-blue-600 hover:bg-blue-700 ml-auto"
          >
            Select Playlist
          </Button>
        </div>
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ff2a6d, #05d9e8);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #e01b5c, #01b7c5);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
