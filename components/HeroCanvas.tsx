"use client";

import React, { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Wave layers (multiple sine waves)
    const waves = [
      { y: 0.65, amp: 14, len: 280, speed: 0.0008, color: "rgba(201,163,107,0.16)" },
      { y: 0.74, amp: 22, len: 420, speed: 0.0006, color: "rgba(201,163,107,0.10)" },
      { y: 0.82, amp: 30, len: 540, speed: 0.0004, color: "rgba(246,239,225,0.06)" },
    ];

    // Drifting fish silhouettes
    const fishCount = 6;
    const fishes = Array.from({ length: fishCount }, () => ({
      x: Math.random() * (W || 1200),
      y: 0.55 + Math.random() * 0.35,
      size: 0.5 + Math.random() * 1.1,
      speed: 0.18 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      flip: Math.random() < 0.5,
    }));

    // Bubbles
    const bubbles = Array.from({ length: 30 }, () => ({
      x: Math.random() * (W || 1200),
      y: (H || 800) + Math.random() * (H || 800),
      r: 1 + Math.random() * 2.5,
      speed: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.3,
      a: 0.1 + Math.random() * 0.35,
    }));

    const drawWave = (t: number, w: typeof waves[0]) => {
      ctx.beginPath();
      const baseY = H * w.y;
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) {
        const y =
          baseY +
          Math.sin(x / w.len + t * w.speed) * w.amp +
          Math.sin(x / (w.len * 0.5) + t * w.speed * 1.8) * (w.amp * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
    };

    const drawFish = (f: typeof fishes[0], t: number) => {
      const x = ((f.x + t * f.speed * 0.08) % (W + 200)) - 100;
      const yWave = H * f.y + Math.sin(t * 0.0009 + f.phase) * 8;
      const size = 36 * f.size;
      ctx.save();
      ctx.translate(x, yWave);
      if (f.flip) ctx.scale(-1, 1);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#c9a36b";
      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.5, size * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      // tail
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, 0);
      ctx.lineTo(-size * 0.7, -size * 0.18);
      ctx.lineTo(-size * 0.7, size * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (b: typeof bubbles[0], t: number) => {
      b.y -= b.speed;
      b.x += Math.sin(t * 0.001 + b.y * 0.01) * b.drift;
      if (b.y < -10) {
        b.y = H + 10;
        b.x = Math.random() * W;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(246,239,225,${b.a})`;
      ctx.fill();
    };

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach((b) => drawBubble(b, t));
      fishes.forEach((f) => drawFish(f, t));
      waves.forEach((w) => drawWave(t, w));
      raf = requestAnimationFrame(draw);
    };

    // Use IntersectionObserver to pause drawing when canvas is not visible
    let observer: IntersectionObserver;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!raf) raf = requestAnimationFrame(draw);
            } else {
              if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
              }
            }
          });
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      id="heroCanvas"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
