"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sparkles, Heart, Clock, Music, TrendingUp } from "lucide-react"

interface SmartPlaylistsProps {
  songs: any[]
  onCreateSmartPlaylist: (criteria: any) => void
}

export function SmartPlaylists({ songs, onCreateSmartPlaylist }: SmartPlaylistsProps) {
  const [criteria, setCriteria] = useState({
    type: "favorites",
    value: "",
    limit: 50,
  })

  const smartPlaylistTypes = [
    { value: "favorites", label: "Favorite Songs", icon: Heart },
    { value: "recent", label: "Recently Played", icon: Clock },
    { value: "genre", label: "By Genre", icon: Music },
    { value: "mood", label: "By Mood", icon: Sparkles },
    { value: "mostPlayed", label: "Most Played", icon: TrendingUp },
  ]

  const handleCreate = () => {
    onCreateSmartPlaylist(criteria)
  }

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Sparkles className="h-5 w-5" />
          Smart Playlists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-white/70">Playlist Type</label>
          <Select value={criteria.type} onValueChange={(value) => setCriteria({ ...criteria, type: value })}>
            <SelectTrigger className="bg-white/10 border-pink-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-pink-500/30 text-white">
              {smartPlaylistTypes.map((type) => {
                const Icon = type.icon
                return (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {(criteria.type === "genre" || criteria.type === "mood") && (
          <div className="space-y-2">
            <label className="text-sm text-white/70">{criteria.type === "genre" ? "Genre" : "Mood"}</label>
            <Input
              value={criteria.value}
              onChange={(e) => setCriteria({ ...criteria, value: e.target.value })}
              placeholder={`Enter ${criteria.type}...`}
              className="bg-white/10 border-pink-500/30 text-white"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-white/70">Max Songs</label>
          <Input
            type="number"
            value={criteria.limit}
            onChange={(e) => setCriteria({ ...criteria, limit: Number(e.target.value) })}
            min={1}
            max={1000}
            className="bg-white/10 border-pink-500/30 text-white"
          />
        </div>

        <Button onClick={handleCreate} className="w-full bg-pink-600 hover:bg-pink-700">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Smart Playlist
        </Button>
      </CardContent>
    </Card>
  )
}
