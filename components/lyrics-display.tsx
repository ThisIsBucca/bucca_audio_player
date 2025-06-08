"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Edit, Save, X } from "lucide-react"

interface LyricsDisplayProps {
  song: any
  currentTime: number
  onLyricsUpdate: (lyrics: string) => void
}

export function LyricsDisplay({ song, currentTime, onLyricsUpdate }: LyricsDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState("")

  useEffect(() => {
    if (song?.lyrics) {
      setEditedLyrics(song.lyrics)
    }
  }, [song])

  const handleSave = () => {
    onLyricsUpdate(editedLyrics)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedLyrics(song?.lyrics || "")
    setIsEditing(false)
  }

  if (!song) return null

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-pink-500">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lyrics
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 text-white/70 hover:text-white"
            >
              <Edit className="h-3 w-3" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-6 w-6 text-green-400 hover:text-green-300"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-6 w-6 text-red-400 hover:text-red-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedLyrics}
            onChange={(e) => setEditedLyrics(e.target.value)}
            placeholder="Enter lyrics here..."
            className="min-h-[200px] bg-white/10 border-pink-500/30 text-white resize-none"
          />
        ) : (
          <div className="min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
            {song.lyrics ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">{song.lyrics}</pre>
            ) : (
              <div className="text-center py-8 text-white/60">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No lyrics available</p>
                <p className="text-xs mt-1">Click edit to add lyrics</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
