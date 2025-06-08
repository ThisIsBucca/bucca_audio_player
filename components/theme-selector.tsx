"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Zap, Minimize, Sun, Moon } from "lucide-react"

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

const themes = [
  {
    id: "neon",
    name: "Neon",
    icon: Zap,
    colors: ["#ff2a6d", "#05d9e8"],
    description: "Electric pink and cyan",
  },
  {
    id: "retro",
    name: "Retro",
    icon: Palette,
    colors: ["#ff6b35", "#f7931e"],
    description: "Warm orange vibes",
  },
  {
    id: "minimal",
    name: "Minimal",
    icon: Minimize,
    colors: ["#6366f1", "#8b5cf6"],
    description: "Clean purple tones",
  },
  {
    id: "dark",
    name: "Dark",
    icon: Moon,
    colors: ["#374151", "#6b7280"],
    description: "Pure dark mode",
  },
  {
    id: "light",
    name: "Light",
    icon: Sun,
    colors: ["#3b82f6", "#06b6d4"],
    description: "Bright and clean",
  },
]

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Palette className="h-5 w-5" />
          Themes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <Button
                key={theme.id}
                variant={currentTheme === theme.id ? "default" : "ghost"}
                onClick={() => onThemeChange(theme.id)}
                className={`justify-start h-auto p-3 ${
                  currentTheme === theme.id ? "bg-pink-600 hover:bg-pink-700" : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-xs opacity-70">{theme.description}</div>
                  </div>
                  <div className="flex gap-1">
                    {theme.colors.map((color, index) => (
                      <div key={index} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
