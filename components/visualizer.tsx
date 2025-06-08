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
        console.warn("MediaElementSourceNode already exists or cannot be created:", err);
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
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#05d9e8";

      switch (type) {
        case "bars":
          drawBars(ctx, dataArray, canvas.width, canvas.height);
          break;
        case "wave":
          drawWave(ctx, dataArray, canvas.width, canvas.height);
          break;
        case "circular":
          drawCircular(ctx, dataArray, canvas.width, canvas.height);
          break;
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, type]);

  const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) => {
    const barWidth = w / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * h * 0.8;
      const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
      gradient.addColorStop(0, "#ff2a6d");
      gradient.addColorStop(1, "#05d9e8");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
  };

  const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#05d9e8";
    ctx.beginPath();

    const centerY = h / 2;
    const sliceWidth = w / (data.length - 1); // Fix: spans entire width
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      const y = centerY + (v - 0.5) * h * 0.8; // Fix: center vertically
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
  };

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
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  return (
    <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent rounded-xl"
      />
    </div>
  );
}
