// Launch-proof stats: DexScreener -> Pump.fun fallback + holders
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { TOKEN } from "@/lib/constants";

export async function GET() {
  const mint = TOKEN.mint;

  // 1) Price/MC with fallback
  const { mc, price } = await getPriceAndMc(mint);

  // 2) Holders (use absolute URL so it works in prod & dev)
  let holders = 0;
  try {
    const base =
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const r = await fetch(`${base}/api/holders`, { cache: "no-store" });
    const j = await r.json();
    holders = j?.holders ?? 0;
  } catch {}

  return new Response(JSON.stringify({ mc, price, holders }), {
    headers: { "Content-Type": "application/json" },
  });
}

/* ---------------- helpers ---------------- */

async function getPriceAndMc(mint) {
  // Try DexScreener first
  try {
    const r = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
      { cache: "no-store" }
    );
    const j = await r.json();
    const p = j?.pairs?.[0];
    const mc = num(p?.marketCap ?? p?.fdv);
    const price = num(p?.priceUsd);
    if (mc > 0 && price > 0) return { mc, price };
  } catch {}

  // Fallback to Pump.fun (works immediately at launch)
  try {
    const r = await fetch(
      `https://frontend-api.pump.fun/coins/${mint}`,
      { cache: "no-store" }
    );
    const j = await r.json();
    // fields commonly present on pump.fun
    const mc = num(j?.marketCapUsd ?? j?.market_cap_usd);
    const price = num(j?.priceUsd ?? j?.price_usd);
    return { mc, price };
  } catch {}

  return { mc: 0, price: 0 };
}

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
