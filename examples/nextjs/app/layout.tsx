import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Godlights — Next.js Example",
  description: "Animated god ray backgrounds for React and Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
