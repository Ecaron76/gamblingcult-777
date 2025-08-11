"use client"
import Image from "next/image";
import { LINKS, SITE, TOKEN } from "../lib/constants";
import MatrixBg from "@/components/MatricBg";
import { useEffect, useState } from "react";
import Ticker from "@/components/Ticker";
import MCCountdown from "@/components/MCCountdown";
import GoalCard from "@/components/MCCountdown";
const RPC_URL = "https://mainnet.helius-rpc.com/v1/8ce7891c-0bb4-4bcd-a04d-edbe376ad2b0"
export default function Home() {
  const [marketCap, setMarketCap] = useState(null);
  const [holders, setHolders] = useState(null);

  useEffect(() => {
    let timer;
    const load = async () => {
      await Promise.all([updateMC(), updateHolders()]);
      timer = setTimeout(load, 30_000); // refresh 30s
    };
    load();
    return () => clearTimeout(timer);
  }, []);

  async function safeJson(res) {
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    try { return await res.json(); } catch { return null; }
  }

  // 1) Market cap via DexScreener
  async function updateMC() {
    try {
      // endpoint tokens → pairs array (souvent fdv présent)
      const r1 = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN.mint}`);
      const j1 = await safeJson(r1);
      const pair = j1?.pairs?.[0];
      const mc = pair?.marketCap || pair?.fdv; // selon listing
      if (mc) setMarketCap(Math.round(mc));
    } catch (e) {
      console.warn("MC fetch error", e);
    }
  }

  // 2) Holders: tente Solscan (rapide), sinon RPC (fallback)
  // Holders via Solana RPC (no Solscan)
  async function updateHolders() {
    try {
      const r = await fetch("/api/holders");
      const j = await r.json();
      setHolders(j.holders);
    } catch (e) {
      console.warn("Holders fetch error", e);
    }
  }
  
  
  return (
    <main className="relative max-w-6xl mx-auto px-4 py-10">
      <MatrixBg />

      {/* NAV */}
      
      <header className="sticky top-4 z-40 backdrop-blur bg-black/30 border border-white/10 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,.35)]">
      <Ticker />
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <Image src="/logo.png" width={36} height={36} alt="logo" className="rounded-md logo-glitch" />
            <span className="font-extrabold tracking-tight">GamblingCult</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <a href="#tokenomics" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-sm text-zinc-200 hover:bg-white/5">Tokenomics</a>
            <a href="#buy" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-sm text-zinc-200 hover:bg-white/5">Buy</a>
            <a href="#roadmap" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-sm text-zinc-200 hover:bg-white/5">Roadmap</a>
            <a href={LINKS.x} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-100 border border-white/20 hover:bg-white/5">X / Community</a>
            <a href={LINKS.pump} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-black shadow-[0_10px_30px_#0006] bg-[linear-gradient(135deg,var(--pri),var(--pri2))]">Buy ${SITE.ticker}</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-white/10 p-6 bg-[linear-gradient(180deg,var(--card),#0b1017)] shadow-[0_10px_30px_rgba(0,0,0,.35)]">
          <div className="flex items-center gap-3 text-xs text-emerald-300/80">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">SOL • Community Token</span>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">0/0 tax</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mt-3">
            {SITE.name} <span className="gradient">${SITE.ticker}</span>
          </h1>
          <p className="text-zinc-300 mt-3">{SITE.description}</p>

          <div className="flex flex-wrap gap-3 mt-5">
            <a href={LINKS.pump} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-black shadow-[0_10px_30px_#0006] bg-[linear-gradient(135deg,var(--pri),var(--pri2))]">Pump.fun</a>
            <a href={LINKS.jupiterSwap} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-100 border border-white/20 hover:bg-white/5">Swap via Jupiter</a>
            <a href={`https://solscan.io/token/${TOKEN.mint}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-100 border border-white/20 hover:bg-white/5">
              Mint: {TOKEN.mint.slice(0,6)}...{TOKEN.mint.slice(-4)}
            </a>
          </div>

          <p className="text-xs text-zinc-500 mt-3">Disclaimer: Not financial advice. Do your own research.</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
  <KPI label="Market Cap" value={<CountUp n={marketCap} prefix="$" />} />
  <KPI label="Holders" value={<CountUp n={holders} />} />
  <KPI label="LP" value="Locked ✅" accent />
</div>

        </div>

        {/* Right: meme banner card */}
        {/* Right: meme banner card */}
<div className="rounded-2xl border border-white/10 overflow-hidden bg-[linear-gradient(180deg,var(--card),#0b1017)] shadow-[0_10px_30px_rgba(0,0,0,.35)] h-full">
  <Image
    src="/banner.png"
    alt="GamblingCult banner"
    width={1200}
    height={900}
    className="w-full h-full object-cover"
    priority
  />
</div>

      </section>

      {/* FEATURE STRIP */}
      <section className="mt-10 grid sm:grid-cols-3 gap-3">
        <Feature tag="No Presale" sub="100% fair-launch" />
        <Feature tag="LP Locked" sub="Proof on-chain" />
        <Feature tag="Community First" sub="Memes > Meetings" />
      </section>

      <div className="mt-5">
  <GoalCard current={marketCap ?? 0} target={1_000_000} />
</div>
      {/* TOKENOMICS */}
      <section id="tokenomics" className="mt-16">
  <h2 className="text-2xl font-extrabold mb-2 gradient">Tokenomics</h2>

  {/* KPI cards */}
  <div className="grid sm:grid-cols-3 gap-4 mt-4">
    <StatCard label="Total Supply" value={`1,000,000,000 $${SITE.ticker}`} />
    <StatCard label="Taxes" value="0 / 0" />
    <StatCard label="Network" value="Solana" />
  </div>

  {/* Distribution + Mint */}
  <div className="grid md:grid-cols-2 gap-6 mt-6">
    {/* Distribution */}
    <div className="rounded-2xl border border-white/10 p-6 bg-[linear-gradient(180deg,var(--card),#0b1017)]">
      <h3 className="font-semibold mb-3">Allocation</h3>

      <DistRow name="LP" pct={100} color="bg-emerald-400" />
      <DistRow name="Team" pct={0}   color="bg-zinc-500" />
      <DistRow name="CEX"  pct={0}   color="bg-zinc-500" />

      <div className="text-xs text-zinc-400 mt-3">
        * TBC = to be confirmed. Update if allocations change.
      </div>
    </div>

    {/* Mint + quick links */}
    <div className="rounded-2xl border border-white/10 p-6 bg-[linear-gradient(180deg,var(--card),#0b1017)]">
      <h3 className="font-semibold mb-3">Mint Address</h3>

      <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/30">
        <code className="text-sm break-all flex-1">{TOKEN.mint}</code>
        <button
          onClick={() => navigator.clipboard.writeText(TOKEN.mint)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-black bg-[linear-gradient(135deg,var(--pri),var(--pri2))] shadow-[0_10px_30px_#0006]"
          aria-label="Copy mint"
        >
          Copy
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <a href={`https://solscan.io/token/${TOKEN.mint}`} target="_blank" className="quicklink">Solscan</a>
        <a href={LINKS.dexscreener} target="_blank" className="quicklink">DexScreener</a>
        <a href={LINKS.pump} target="_blank" className="quicklink">Pump.fun</a>
      </div>

      {/* mini badge avec le logo */}
      <div className="mt-5 flex items-center gap-2 text-zinc-300">
        <Image src="/logo.png" alt="CULT 777" width={28} height={28} className="rounded-md drop-shadow-[0_0_10px_#41ff87]" />
        <span className="text-sm">LP <span className="text-emerald-400 font-semibold">Locked</span> • Taxes <span className="text-emerald-400 font-semibold">0/0</span></span>
      </div>
    </div>
  </div>
</section>

      {/* HOW TO BUY */}
      <section id="buy" className="mt-16">
        <h2 className="text-2xl font-extrabold mb-2 gradient">How to Buy</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 p-6 bg-[linear-gradient(180deg,var(--card),#0b1017)]">
            <ol className="list-decimal list-inside space-y-2 text-zinc-200">
              <li>Install <b>Phantom</b> and fund with <b>SOL</b>.</li>
              <li>Open <a className="underline text-emerald-400" href={LINKS.pump} target="_blank">Pump.fun</a> or <a className="underline text-emerald-400" href={LINKS.jupiterSwap} target="_blank">Jupiter</a>.</li>
              <li>Verify the mint: <code className="break-all">{TOKEN.mint}</code>.</li>
              <li>Set slippage if needed, confirm, and ride the meme.</li>
            </ol>
            <div className="flex gap-3 mt-4">
              <a href={LINKS.dexscreener} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-black shadow-[0_10px_30px_#0006] bg-[linear-gradient(135deg,var(--pri),var(--pri2))]">DexScreener</a>
              <a href={LINKS.x} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-100 border border-white/20 hover:bg-white/5">Twitter / X</a>
            </div>
          </div>
          {/* Meme gallery box with logo */}
          
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="mt-16">
        <h2 className="text-2xl font-extrabold mb-2 gradient">Roadmap</h2>
        <div className="relative grid md:grid-cols-3 gap-6">
          <RoadStep n="1" title="Launch & Lock" text="Pump.fun launch, LP lock, reach 1k holders." />
          <RoadStep n="2" title="Go Viral" text="Memes, collabs, listings on trackers, community raids." />
          <RoadStep n="3" title="777 Utility" text="‘777 spin’ mini‑game, merch, integrations." />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-16 mb-24">
        <h2 className="text-2xl font-extrabold mb-2 gradient">FAQ</h2>
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,var(--card),#0b1017)] divide-y divide-white/10">
          <FaqRow q="Is the mint authority frozen?" a="Yes. Authority is revoked/transferred — verify on Solscan." />
          <FaqRow q="Any taxes?" a="0 / 0." />
          <FaqRow q="Is LP locked?" a="Yes — share the locker link as proof." />
        </div>
      </section>

      <footer className="py-10 text-sm text-zinc-400 flex items-center justify-between">
        <span>© {new Date().getFullYear()} GamblingCult — Made with memes & ❤️</span>
        <a href={LINKS.x} target="_blank" className="underline hover:text-zinc-200">Join the Cult on X</a>
      </footer>
    </main>
  );
}

/* ---------- small components ---------- */


function Feature({ tag, sub }) {
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 flex items-center justify-between">
      <span className="font-semibold">{tag}</span>
      <span className="text-emerald-300/80 text-sm">{sub}</span>
    </div>
  );
}

function RoadStep({ n, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-[linear-gradient(180deg,var(--card),#0b1017)] relative">
      <span className="absolute -left-3 -top-3 w-10 h-10 rounded-full grid place-items-center text-black font-black shadow-[0_0_20px_#41ff87] bg-[linear-gradient(135deg,var(--pri),var(--pri2))]">{n}</span>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-zinc-300">{text}</p>
    </div>
  );
}

function FaqRow({ q, a }) {
  return (
    <details className="p-5 group">
      <summary className="cursor-pointer font-semibold flex items-center justify-between">
        {q}
        <span className="text-emerald-300/80 text-xs group-open:rotate-180 transition">▼</span>
      </summary>
      <p className="text-zinc-300 mt-2">{a}</p>
    </details>
  );
}
function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-[linear-gradient(180deg,var(--card),#0b1017)]">
      <span className="text-zinc-400 text-sm">{label}</span>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function DistRow({ name, pct, color }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{name}</span>
        <span className="text-zinc-400">{pct}%</span>
      </div>
      <div className="h-2 mt-1 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
function KPI({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <span className="text-zinc-400">{label}</span>
      <b className={`block text-lg ${accent ? "text-emerald-400" : ""}`}>{value ?? "—"}</b>
    </div>
  );
}

function CountUp({ n, prefix = "" }) {
  const [val, setVal] = useState(n ?? 0);
  useEffect(() => {
    if (typeof n !== "number") return;
    const start = val, end = n;
    const dur = 500; // ms
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(start + (end - start) * p);
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (typeof n !== "number") return <>—</>;
  return <>{prefix}{val.toLocaleString()}</>;
}
