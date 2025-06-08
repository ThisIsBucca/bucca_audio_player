// app/layout.tsx

import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Quicksand, Audiowide } from "next/font/google";

// Load Google Fonts
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
  display: "swap",
});

// SEO Metadata
export const metadata = {
  title: "Bucca Music Player",
  description: "A stylish mobile-first music player",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${audiowide.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-quicksand">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
