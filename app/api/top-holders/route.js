// app/api/holders-list/route.js
import { TOKEN } from "@/lib/constants";
const mint = TOKEN.mint;  // ⬅️ utilise la même source
export async function GET() {
    const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=8ce7891c-0bb4-4bcd-a04d-edbe376ad2b0";
    
    const TOKEN_PROGRAM_LEGACY = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
    const TOKEN_PROGRAM_2022   = "TokenzQdGc8h5ESmYkGqG4qMnh4Ykq1t7JRDW1iSkKy";
    const EXCLUDED = new Set(["63cC7FK9kNVZw76rVekpGmVTcqQyPP5uk4LmKz5jpi7N"]); // LP
  
    async function rpc(method, params) {
      const r = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        cache: "no-store",
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      return j.result;
    }
  
    // price
    let price = 0;
    try {
      const ds = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: "no-store" });
      const dj = await ds.json();
      price = Number(dj?.pairs?.[0]?.priceUsd ?? 0);
    } catch {}
  
    // supply
    let supplyUi = 0;
    try {
      const sup = await rpc("getTokenSupply", [mint, { commitment: "confirmed" }]);
      const dec = sup?.value?.decimals ?? 0;
      const amt = sup?.value?.amount ?? "0";
      supplyUi = Number(amt) / 10 ** dec;
    } catch {}
  
    // accounts (try 2022 then legacy)
    async function getAccounts(programId) {
      const res = await rpc("getProgramAccounts", [
        programId,
        {
          encoding: "jsonParsed",
          commitment: "confirmed",
          filters: [
            { dataSize: 165 },
            { memcmp: { offset: 0, bytes: mint } },
          ],
        },
      ]);
      return res ?? [];
    }
  
    let accounts = [];
    try {
      accounts = await getAccounts(TOKEN_PROGRAM_2022);
      if (!accounts.length) accounts = await getAccounts(TOKEN_PROGRAM_LEGACY);
    } catch { accounts = []; }
  
    // aggregate by owner
    const map = new Map();
    for (const a of accounts) {
      const info = a?.account?.data?.parsed?.info;
      const owner = info?.owner;
      const ui = info?.tokenAmount?.uiAmount || 0;
      if (!owner || ui <= 0) continue;
      if (EXCLUDED.has(owner)) continue;
      map.set(owner, (map.get(owner) || 0) + ui);
    }
  
    // ... tout ton code identique au-dessus

const holders = [...map.entries()]
.sort((a, b) => b[1] - a[1])
.map(([address, amount], i) => ({
  rank: i + 1,
  address,
  amount,
  pctOfSupply: supplyUi ? (amount / supplyUi) * 100 : 0,
  valueUsd: price ? amount * price : 0,
}))
.slice(0, 10);  // ⬅️ top 10 seulement

return new Response(JSON.stringify({ price, supply: supplyUi, holders }), {
headers: { "Content-Type": "application/json" },
});

  }
  