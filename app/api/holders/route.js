export async function GET() {
    const RPC_URL =
      "https://mainnet.helius-rpc.com/?api-key=8ce7891c-0bb4-4bcd-a04d-edbe376ad2b0";
    const mint = "BMoJWgoF7GZjjYskH1BCz1xZnJXa1xyhvZ9Evup7q9bZ";
  
    // Legacy SPL Token program (change to Token-2022 if needed)
    const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  
    try {
      // 1) Get all token accounts for this mint via getProgramAccounts
      const r = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getProgramAccounts",
          params: [
            TOKEN_PROGRAM,
            {
              encoding: "jsonParsed",
              commitment: "confirmed",
              filters: [
                {
                  dataSize: 165, // SPL token account size
                },
                {
                  memcmp: {
                    offset: 0, // Mint address is at offset 0
                    bytes: mint,
                  },
                },
              ],
            },
          ],
        }),
      });
  
      const j = await r.json();
      const accounts = j?.result ?? [];
  
      // 2) Count unique owners with uiAmount > 0
      const owners = new Set();
      let circulating = 0;
      let largestBalance = 0;
  
      for (const acc of accounts) {
        const info = acc?.account?.data?.parsed?.info;
        const owner = info?.owner;
        const uiAmount = info?.tokenAmount?.uiAmount || 0;
  
        if (uiAmount > 0 && owner) {
          owners.add(owner);
          circulating += uiAmount;
          if (uiAmount > largestBalance) largestBalance = uiAmount;
        }
      }
  
      const holders = owners.size;
  
      return new Response(
        JSON.stringify({
          holders,
          circulating,
          largestAccountBalance: largestBalance,
          accountsFound: accounts.length,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (e) {
      console.error("Error fetching holders:", e);
      return new Response(
        JSON.stringify({ error: "Failed to fetch holders" }),
        { status: 500 }
      );
    }
  }
  