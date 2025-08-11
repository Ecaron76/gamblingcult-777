// components/Ticker.js
"use client";
import { useEffect, useState } from "react";

export default function Ticker() {
  const [stats, setStats] = useState({ mc: 0, price: 0, holders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const r = await fetch("/api/stats");
      const data = await r.json();
      setStats(data);
    };
    fetchData();
    const int = setInterval(fetchData, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="bg-black border-b border-emerald-500 text-emerald-400 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee py-2 text-sm font-mono">
        💰 MC: ${stats.mc.toLocaleString()} | 📈 Price: ${stats.price.toFixed(8)} | 👥 Holders: {stats.holders}
      </div>
    </div>
  );
}
