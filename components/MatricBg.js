"use client";
import { useEffect, useRef } from "react";

export default function MatrixBg() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let w, h, cols, drops, raf;
    const chars = "アィゥェォカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+$%║";

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cols = Math.floor(window.innerWidth / 14);
      drops = Array(cols).fill(0);
    };

    const draw = () => {
      // voile noir transparent pour le trail
      ctx.fillStyle = "rgba(6,10,14,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#41ff87"; // néon vert
      ctx.font = "14px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14;
        const y = drops[i] * 18;
        ctx.shadowColor = "#41ff87";
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 pointer-events-none opacity-30"
      aria-hidden="true"
    />
  );
}
