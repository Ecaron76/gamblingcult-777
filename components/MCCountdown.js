"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function GoalCard({ current = 0, target = 1_000_000 }) {
  // % brut
  const pct = useMemo(() => {
    if (!target) return 0;
    return Math.max(0, Math.min(100, (current / target) * 100));
  }, [current, target]);

  const remaining = Math.max(0, target - (current || 0));
  const nearGoal = pct >= 90 && pct < 100;
  const reached = pct >= 100;

  // animations douces
  const [animPct, setAnimPct] = useState(pct);
  const [animMC, setAnimMC] = useState(current || 0);
  const prevPct = useRef(pct);
  const firedConfetti = useRef(false);

  // canvas pour étincelles / confetti
  const canvasRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      setAnimPct((v) => v + (pct - v) * 0.12);
      setAnimMC((v) => v + ((current || 0) - v) * 0.1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct, current]);

  // bursts & confetti
  useEffect(() => {
    const prev = prevPct.current ?? 0;
    if (pct > prev + 0.8) sparkBurst(canvasRef.current, animPct);
    if (pct >= 100 && !firedConfetti.current) {
      confetti(canvasRef.current, 150);
      firedConfetti.current = true;
    }
    prevPct.current = pct;
  }, [pct, animPct]);

  return (
    <div
      className={[
        "rounded-2xl border border-white/10 p-5",
        "bg-[linear-gradient(180deg,var(--card),#0b1017)]",
        "relative overflow-hidden",
        nearGoal ? "ring-1 ring-emerald-400/40 animate-neonPulse animate-shake-soft" : "",
      ].join(" ")}
    >
      {/* grid matrix subtile */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(65,255,135,.22) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(65,255,135,.22) 0 1px, transparent 1px 32px)",
        }}
      />

      {/* canvas particles */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* header */}
      <div className="relative flex items-center gap-3">
        <span className="text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">
          Goal: $1,000,000 MC
        </span>
      </div>

      <h3 className="mt-2 text-xl font-extrabold">
        <span className="text-zinc-300">Current MC:</span>{" "}
        <span className="gradient">${Math.max(0, Math.round(animMC)).toLocaleString()}</span>
      </h3>

      {/* rail */}
      <div className="mt-4 h-5 rounded-full bg-black/50 border border-white/10 overflow-hidden relative">
        {/* ticks */}
        <Ticks />
        {/* fond rayé qui défile */}
        <div className="absolute inset-0 opacity-35 bg-[linear-gradient(135deg,transparent 25%,rgba(65,255,135,.25) 25%,rgba(65,255,135,.25) 50%,transparent 50%,transparent 75%,rgba(65,255,135,.25) 75%)] bg-[length:26px_26px] animate-stripes" />
        {/* remplissage + sheen */}
        <div className="h-full relative transition-[width] duration-150 ease-out" style={{ width: `${Math.min(animPct, 100)}%` }}>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] shadow-[inset_0_0_24px_rgba(65,255,135,.5)]" />
          <div className="absolute -inset-y-3 w-1/3 max-w-[190px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent)] blur-md animate-sheen" />
        </div>
        {/* marqueur 100% */}
        <div className="absolute inset-y-0 right-0 w-[2px] bg-emerald-300/60">
          <span className="absolute -top-6 right-0 translate-x-1/2 text-[10px] text-emerald-300">1M</span>
        </div>
        {/* orb qui suit */}
        <Orb pct={Math.min(animPct, 100)} />
      </div>

      {/* labels */}
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{animPct.toFixed(1)}%</span>
        <span>{reached ? "🚀 Goal reached!" : `🔥 $${remaining.toLocaleString()} until $1M`}</span>
      </div>

      {/* glossy highlight */}
      <div className="pointer-events-none absolute -top-1/2 -left-1/2 w-[200%] h-[200%] rotate-12 opacity-10 bg-white blur-3xl" />
    </div>
  );
}

/* ---------- sub components ---------- */
function Ticks() {
  // 0,25,50,75,100
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[0, 25, 50, 75, 100].map((p) => (
        <div key={p} className="absolute inset-y-0 border-r border-emerald-300/20" style={{ left: `${p}%` }}>
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-emerald-300/70">{p}%</span>
        </div>
      ))}
    </div>
  );
}

function Orb({ pct }) {
  return (
    <div
      className="absolute -top-1 left-0 translate-x-[-10px]"
      style={{ transform: `translateX(calc(${pct}% - 10px))` }}
    >
      <span className="block w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_20px_8px_rgba(65,255,135,.6)] animate-orb" />
      {/* traînée */}
      <span
        className="block h-[3px] rounded-r-full bg-emerald-400/50"
        style={{ width: "52px", marginTop: "2px", boxShadow: "0 0 12px rgba(65,255,135,.45) inset" }}
      />
    </div>
  );
}

/* ---------- particles helpers ---------- */
function sparkBurst(canvas, atPct = 50, count = 14) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width; canvas.height = rect.height;
  const x = (Math.min(atPct, 100) / 100) * rect.width;
  const y = rect.height / 2;

  const parts = Array.from({ length: count }).map(() => ({
    x, y,
    vx: (Math.random() - 0.5) * 3.2,
    vy: -Math.random() * 2.6 - 0.6,
    life: 34 + Math.random() * 22,
    color: `hsl(${120 + Math.random() * 30}, 100%, ${55 + Math.random() * 25}%)`,
  }));

  let raf;
  const step = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    parts.forEach((p) => {
      p.life -= 1;
      p.x += p.vx; p.y += p.vy; p.vy += 0.07;
      ctx.globalAlpha = Math.max(0, p.life / 50);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    });
    if (parts.some((p) => p.life > 0)) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

function confetti(canvas, count = 140) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width; canvas.height = rect.height;

  const pieces = Array.from({ length: count }).map(() => ({
    x: Math.random() * rect.width,
    y: -10,
    vy: 1 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 1.6,
    size: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.25,
    hue: 120 + Math.random() * 40,
  }));

  let frames = 0, raf;
  const step = () => {
    frames++;
    ctx.clearRect(0, 0, rect.width, rect.height);
    pieces.forEach((p) => {
      p.y += p.vy; p.x += p.vx; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = `hsl(${p.hue}, 90%, ${40 + (Math.sin(frames/10)+1)*10}%)`;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });
    if (frames < 240) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
