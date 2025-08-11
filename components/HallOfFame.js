// components/HallOfFame.js
"use client";
import { useEffect, useState } from "react";

const TITLES_BY_RANK = [
  "The Whale King",   // 1
  "Diamond Hands",    // 2
  "Apex Trader",      // 3
  "Market Maker",     // 4
  "High Roller",      // 5
  "Alpha Stacker",    // 6
  "Price Sniper",     // 7
  "Moon Rider",       // 8
  "Token Titan",      // 9
  "Lucky Roller",     // 10
];

export default function HallOfFame() {
  const [data, setData] = useState({ price: 0, supply: 0, holders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/top-holders", { cache: "no-store" });
        const j = await r.json();
        setData(j || { price: 0, supply: 0, holders: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // top 10 en 2 lignes de 5
  const top10 = data.holders.slice(0, 10);
  const rows = [top10.slice(0, 5), top10.slice(5, 10)];

  return (
    <section className="mt-16" id="hall-of-fame">
      <h2 className="text-2xl font-extrabold mb-2 gradient">Hall of Fame — Top Holders</h2>

      {loading && top10.length === 0 ? (
        <SkeletonRows />
      ) : (
        rows.map((row, ri) => (
          <div key={ri} className="grid md:grid-cols-5 sm:grid-cols-2 gap-4 mt-4">
            {row.map((h) => (
              <HolderCard
                key={h.address}
                rank={h.rank}
                title={titleForRank(h.rank)}
                address={h.address}
                amount={h.amount}
                pct={h.pctOfSupply}
                usd={h.valueUsd}
              />
            ))}
          </div>
        ))
      )}
    </section>
  );
}

function titleForRank(rank) {
  return TITLES_BY_RANK[rank - 1] || `Rank #${rank}`;
}

function HolderCard({ rank, title, address, amount, pct, usd }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[linear-gradient(180deg,var(--card),#0b1017)] p-4 overflow-hidden">
      {/* fond lisible */}
      <div className="absolute inset-0 opacity-[0.08]"
           style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(65,255,135,.3) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(65,255,135,.3) 0 1px, transparent 1px 28px)" }} />
      <div className="relative">
        {/* badge rang */}
        <span className="absolute -top-3 -left-3 w-9 h-9 rounded-full grid place-items-center text-black font-extrabold bg-[linear-gradient(135deg,var(--pri),var(--pri2))] shadow-[0_0_20px_rgba(65,255,135,.4)]">
          {rank}
        </span>

        <div className="pl-8">
          <div className="text-emerald-300 font-bold">{title}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{short(address)}</div>
        </div>

        {/* chiffres */}
        <div className="mt-3 text-sm font-mono">
          <div className="text-zinc-200">
            {fmt(amount)} <span className="text-zinc-400">$777</span>
          </div>
          <div className="text-xs text-zinc-500">
            {pct.toFixed(2)}% • ≈ ${fmt(usd)}
          </div>
        </div>

        {/* barre de progression */}
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[linear-gradient(135deg,var(--pri),var(--pri2))] animate-stripes"
            style={{ width: `${Math.min(100, pct)}%` }}
            title={`${pct.toFixed(2)}%`}
          />
        </div>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1].map((ri) => (
        <div key={ri} className="grid md:grid-cols-5 sm:grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-white/10 bg-black/30 animate-pulse" />
          ))}
        </div>
      ))}
    </>
  );
}

const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmt = (n) => (!n || !isFinite(n) ? "0" : Math.round(n).toLocaleString());
