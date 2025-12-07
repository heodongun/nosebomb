import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pop the Nose - Betting Game",
  description: "A fun nose popping game for bets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
