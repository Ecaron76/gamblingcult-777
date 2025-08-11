import "./globals.css";
import { SITE } from "../lib/constants";

export const metadata = {
  title: `${SITE.name} — $${SITE.ticker}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — $${SITE.ticker}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — $${SITE.ticker}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gradient-to-b from-[#070a0f] to-[#0a0f14] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
