"use client"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Music, RotateCcw } from "lucide-react"

interface EqualizerProps {
  settings: {
    enabled: boolean
    preset: string
    bands: number[]
  }
  onSettingsChange: (settings: any) => void
}

const presets = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rock: [5, 3, -1, -2, 1, 2, 4, 5, 6, 6],
  pop: [2, 4, 3, 1, -1, -1, 1, 3, 4, 4],
  jazz: [4, 3, 1, 2, -1, -1, 0, 2, 3, 4],
  classical: [5, 4, 3, 2, -1, -1, 2, 3, 4, 5],
  electronic: [6, 5, 2, 0, -2, 2, 1, 2, 5, 6],
  bass: [8, 6, 4, 2, 1, -1, -2, -1, 2, 3],
  vocal: [-2, -1, 2, 4, 4, 3, 2, 1, 0, -1],
}

const frequencies = ["32", "64", "125", "250", "500", "1K", "2K", "4K", "8K", "16K"]

export function Equalizer({ settings, onSettingsChange }: EqualizerProps) {
  const handlePresetChange = (preset: string) => {
    onSettingsChange({
      ...settings,
      preset,
      bands: presets[preset as keyof typeof presets],
    })
  }

  const handleBandChange = (index: number, value: number[]) => {
    const newBands = [...settings.bands]
    newBands[index] = value[0]
    onSettingsChange({
      ...settings,
      bands: newBands,
      preset: "custom",
    })
  }

  const resetEqualizer = () => {
    onSettingsChange({
      ...settings,
      preset: "flat",
      bands: presets.flat,
    })
  }

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-pink-500">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Equalizer
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => onSettingsChange({ ...settings, enabled })}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={resetEqualizer}
              className="h-6 w-6 text-white/70 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={settings.preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="bg-white/10 border-pink-500/30 text-white">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-pink-500/30 text-white">
            {Object.keys(presets).map((preset) => (
              <SelectItem key={preset} value={preset} className="hover:bg-white/10">
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {frequencies.map((freq, index) => (
            <div key={freq} className="flex flex-col items-center space-y-2">
              <div className="h-24 flex items-end">
                <Slider
                  orientation="vertical"
                  value={[settings.bands[index] || 0]}
                  onValueChange={(value) => handleBandChange(index, value)}
                  max={12}
                  min={-12}
                  step={1}
                  disabled={!settings.enabled}
                  className="h-20 [&>span:first-child]:w-1 [&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-t [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-gradient-to-t [&>span:first-child_span]:from-pink-500 [&>span:first-child_span]:to-blue-500"
                />
              </div>
              <span className="text-xs text-white/70">{freq}</span>
              <span className="text-xs text-white/50">
                {settings.bands[index] > 0 ? "+" : ""}
                {settings.bands[index]}dB
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
