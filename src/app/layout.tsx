import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pop the Nose - Betting Game",
  description: "A fun nose popping game for bets",
  keywords: ["nose game", "betting game", "pop game", "fun game", "online game", "코 터뜨리기", "재미있는 게임"],
  authors: [{ name: "Nose Bomb" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://nosebomb.pages.dev",
    siteName: "Pop the Nose",
    title: "Pop the Nose - 재미있는 코 터뜨리기 게임",
    description: "친구들과 함께 즐기는 짜릿한 코 터뜨리기 베팅 게임! 누가 먼저 코를 터뜨릴까요?",
    images: [
      {
        url: "https://nosebomb.pages.dev/nose.png",
        width: 1200,
        height: 630,
        alt: "Pop the Nose Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pop the Nose - 재미있는 코 터뜨리기 게임",
    description: "친구들과 함께 즐기는 짜릿한 코 터뜨리기 베팅 게임!",
    images: ["https://nosebomb.pages.dev/nose.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "afdfadacacc44383",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pop the Nose",
    "description": "친구들과 함께 즐기는 짜릿한 코 터뜨리기 베팅 게임",
    "url": "https://nosebomb.pages.dev",
    "applicationCategory": "Game",
    "genre": "Casual Game",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "100"
    }
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
