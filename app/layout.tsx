import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gacha Machine',
  description: 'GSAP Gacha Machine demo in Next.js + Tailwind',
}

import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
