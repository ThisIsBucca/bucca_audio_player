"use client"

import { useState, useEffect } from "react"
import { Music, Play } from "lucide-react"

interface AppStarterProps {
  onComplete: () => void
}

export function AppStarter({ onComplete }: AppStarterProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500)
    const timer2 = setTimeout(() => setStage(2), 1500)
    const timer3 = setTimeout(() => setStage(3), 2500)
    const timer4 = setTimeout(() => onComplete(), 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background with nightclub image */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('/nightclub-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 transition-all duration-1000 ${
              stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <Music className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title Animation */}
        <div className="mb-6">
          <h1
            className={`text-4xl md:text-6xl font-audiowide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 transition-all duration-1000 ${
              stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Bucca
          </h1>
          <h2
            className={`text-2xl md:text-3xl font-audiowide text-white/80 transition-all duration-1000 delay-300 ${
              stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Music Player
          </h2>
        </div>

        {/* Tagline */}
        <p
          className={`text-lg text-white/60 font-quicksand transition-all duration-1000 delay-500 ${
            stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Your personal music experience
        </p>

        {/* Loading Animation */}
        <div className="mt-8">
          <div
            className={`flex justify-center space-x-1 transition-all duration-1000 ${
              stage >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-pink-500 to-blue-500 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Pulsing Play Button */}
        <div className="mt-12">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-1000 ${
              stage >= 3 ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-0"
            }`}
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full transition-all duration-2000 ${
              stage >= 1 ? "opacity-60" : "opacity-0"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float 3s ease-in-out infinite alternate ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
