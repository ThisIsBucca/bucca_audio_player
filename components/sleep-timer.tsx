"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Moon } from "lucide-react"

interface SleepTimerProps {
  onTimerComplete: () => void
}

export function SleepTimer({ onTimerComplete }: SleepTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [duration, setDuration] = useState(30)
  const [timeLeft, setTimeLeft] = useState(0)
  const [fadeOut, setFadeOut] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onTimerComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, onTimerComplete])

  const startTimer = () => {
    setTimeLeft(duration * 60)
    setIsActive(true)
  }

  const stopTimer = () => {
    setIsActive(false)
    setTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-black/20 border-pink-500/30 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Moon className="h-5 w-5" />
          Sleep Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={180}
                className="bg-white/10 border-pink-500/30 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fade out</span>
              <Switch checked={fadeOut} onCheckedChange={setFadeOut} />
            </div>
            <Button onClick={startTimer} className="w-full bg-pink-600 hover:bg-pink-700">
              <Clock className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">{formatTime(timeLeft)}</div>
              <p className="text-sm text-white/70">Time remaining</p>
            </div>
            <Button onClick={stopTimer} variant="destructive" className="w-full">
              Stop Timer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
