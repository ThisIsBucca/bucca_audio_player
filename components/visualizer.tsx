"use client";
import { useEffect, useRef } from "react";

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  type?: "bars" | "wave" | "circular";
}

export function Visualizer({ audioRef, isPlaying, type = "bars" }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Responsive canvas size
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        // Set canvas size for HiDPI screens
        canvasRef.current.width = canvasRef.current.offsetWidth * dpr;
        canvasRef.current.height = canvasRef.current.offsetHeight * dpr;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    if (!sourceNodeRef.current) {
      try {
        sourceNodeRef.current = audioContext.createMediaElementSource(audio);
      } catch (err) {
        // Show a friendlier error if the audio format is not supported
        if (audio.error && audio.error.code === 4) {
          // code 4: MEDIA_ERR_SRC_NOT_SUPPORTED
          audio.dispatchEvent(new CustomEvent('bucca-audio-error', {
            detail: 'This audio file format is not supported. Please try a different file (e.g., MP3, WAV, OGG).'
          }));
        }
        // MediaElementSourceNode already exists or cannot be created
      }
    }

    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      sourceNodeRef.current?.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // HiDPI support
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#05d9e8";

      if (isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        switch (type) {
          case "bars":
            drawBars(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight);
            break;
          case "wave":
            drawWave(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight);
            break;
          case "circular":
            drawCircular(ctx, dataArray, canvas.offsetWidth, canvas.offsetHeight);
            break;
        }
      } else {
        // Draw subtle idle animation
        drawIdle(ctx, canvas.offsetWidth, canvas.offsetHeight);
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, type, audioRef]);

  // Modern bar style with rounded corners and glow
  const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) => {
    const barWidth = w / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * h * 0.7;
      const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
      gradient.addColorStop(0, "#ff2a6d");
      gradient.addColorStop(1, "#05d9e8");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x + 3, h);
      ctx.lineTo(x + barWidth - 3, h);
      ctx.lineTo(x + barWidth - 3, h - barHeight + 8);
      ctx.quadraticCurveTo(x + barWidth / 2, h - barHeight - 8, x + 3, h - barHeight + 8);
      ctx.closePath();
      ctx.shadowColor = "#ff2a6d";
      ctx.shadowBlur = 10;
      ctx.fill();
      x += barWidth;
    }
  };

  // Modern wave style
  const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#05d9e8";
    ctx.shadowColor = "#ff2a6d";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const centerY = h / 2;
    const sliceWidth = w / (data.length - 1);
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      const y = centerY + (v - 0.5) * h * 0.6;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  };

  // Modern circular style
  const drawCircular = (ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 4;
    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2;
      const barHeight = (data[i] / 255) * radius;
      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius + barHeight);
      const y2 = cy + Math.sin(angle) * (radius + barHeight);
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, "#05d9e8");
      gradient.addColorStop(1, "#ff2a6d");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ff2a6d";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  // Idle animation (subtle pulsing gradient)
  const drawIdle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#22223b");
    gradient.addColorStop(1, "#4a4e69");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#05d9e8";
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  return (
    <div className="w-full h-24 md:h-32 rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm bg-gradient-to-br from-[#1a0033]/60 to-[#05d9e8]/10">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent rounded-xl"
      />
    </div>
  );
}
