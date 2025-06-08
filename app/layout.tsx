import type React from "react"
import "./globals.css"
import "./fonts.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Bucca Music Player",
  description: "A stylish mobile-first music player",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
