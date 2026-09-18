import type { Metadata, Viewport } from "next";
import { Fredoka, Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/catmate/Providers";
import { FloatingPaws } from "@/components/catmate/FloatingPaws";

const quicksand = Quicksand({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CatMate — find your purr-fect match 🐾",
  description:
    "A delightfully fluffy cat dating app. Swipe adorable cats, match on shared purr-sonality, and chat in Human or Meow.",
  applicationName: "CatMate",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1119" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="bubblegum"
      className={`${quicksand.variable} ${fredoka.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          <FloatingPaws />
          {children}
        </Providers>
      </body>
    </html>
  );
}
