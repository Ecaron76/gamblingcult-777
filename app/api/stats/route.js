export async function GET() {
    const mint = "BMoJWgoF7GZjjYskH1BCz1xZnJXa1xyhvZ9Evup7q9bZ";
  
    // 1) Market data (DexScreener)
    let mc = 0, price = 0;
    try {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: "no-store" });
      const j = await r.json();
      const p = j?.pairs?.[0];
      mc = Math.round(p?.marketCap ?? p?.fdv ?? 0);
      price = Number(p?.priceUsd ?? 0);
    } catch (e) { /* noop */ }
  
    // 2) Holders via your existing route (use ABSOLUTE URL)
    let holders = 0;
    try {
      const base =
        process.env.SITE_URL                              // set this in prod if you want (https://your.xyz)
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  
      const r = await fetch(`${base}/api/holders`, { cache: "no-store" });
      const j = await r.json();
      holders = j?.holders ?? 0;
    } catch (e) { /* noop */ }
  
    return new Response(JSON.stringify({ mc, price, holders }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  