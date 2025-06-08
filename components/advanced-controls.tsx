"use client"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Gauge, RotateCw, Bookmark, ArrowLeftRight } from "lucide-react"

interface AdvancedControlsProps {
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
  crossfade: boolean
  onCrossfadeChange: (enabled: boolean) => void
  gapless: boolean
  onGaplessChange: (enabled: boolean) => void
  onCreateBookmark: () => void
}

export function AdvancedControls({
  playbackSpeed,
  onSpeedChange,
  crossfade,
  onCrossfadeChange,
  gapless,
  onGaplessChange,
  onCreateBookmark,
}: AdvancedControlsProps) {
  const speedPresets = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Gauge className="h-5 w-5" />
          Advanced Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Playback Speed</span>
            <span className="text-xs text-white/50">{playbackSpeed}x</span>
          </div>
          <Slider
            value={[playbackSpeed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.5}
            max={2}
            step={0.1}
            className="[&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500"
          />
          <div className="flex gap-1">
            {speedPresets.map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => onSpeedChange(speed)}
                className={`text-xs ${playbackSpeed === speed ? "bg-pink-600 hover:bg-pink-700" : "hover:bg-white/10"}`}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-white/70" />
              <span className="text-sm">Crossfade</span>
            </div>
            <Switch checked={crossfade} onCheckedChange={onCrossfadeChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-white/70" />
              <span className="text-sm">Gapless Playback</span>
            </div>
            <Switch checked={gapless} onCheckedChange={onGaplessChange} />
          </div>
        </div>

        <Button onClick={onCreateBookmark} className="w-full bg-pink-600 hover:bg-pink-700">
          <Bookmark className="h-4 w-4 mr-2" />
          Create Bookmark
        </Button>
      </CardContent>
    </Card>
  )
}
