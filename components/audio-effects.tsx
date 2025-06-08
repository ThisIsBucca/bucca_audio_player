"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves, Volume2, Headphones, Zap } from "lucide-react"

interface AudioEffectsProps {
  effects: {
    reverb: number
    echo: number
    bassBoost: number
    spatialAudio: boolean
  }
  onEffectsChange: (effects: any) => void
}

export function AudioEffects({ effects, onEffectsChange }: AudioEffectsProps) {
  const updateEffect = (key: string, value: any) => {
    onEffectsChange({
      ...effects,
      [key]: value,
    })
  }

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Waves className="h-5 w-5" />
          Audio Effects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-white/70" />
              <span className="text-sm">Reverb</span>
            </div>
            <span className="text-xs text-white/50">{effects.reverb}%</span>
          </div>
          <Slider
            value={[effects.reverb]}
            onValueChange={(value) => updateEffect("reverb", value[0])}
            max={100}
            step={1}
            className="[&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-white/70" />
              <span className="text-sm">Echo</span>
            </div>
            <span className="text-xs text-white/50">{effects.echo}%</span>
          </div>
          <Slider
            value={[effects.echo]}
            onValueChange={(value) => updateEffect("echo", value[0])}
            max={100}
            step={1}
            className="[&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-white/70" />
              <span className="text-sm">Bass Boost</span>
            </div>
            <span className="text-xs text-white/50">{effects.bassBoost}%</span>
          </div>
          <Slider
            value={[effects.bassBoost]}
            onValueChange={(value) => updateEffect("bassBoost", value[0])}
            max={100}
            step={1}
            className="[&>span:first-child]:bg-white/20 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-white/70" />
            <span className="text-sm">3D Spatial Audio</span>
          </div>
          <Switch checked={effects.spatialAudio} onCheckedChange={(value) => updateEffect("spatialAudio", value)} />
        </div>
      </CardContent>
    </Card>
  )
}
