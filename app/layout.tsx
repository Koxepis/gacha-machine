import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gacha Machine',
  description: 'GSAP Gacha Machine demo in Next.js + Tailwind',
}

import './globals.css'
import { M_PLUS_Rounded_1c } from 'next/font/google'

const mPlus = M_PLUS_Rounded_1c({ subsets: ['latin'], weight: ['400'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mPlus.className} h-full min-h-screen overflow-hidden text-white`}>{children}</body>
    </html>
  )
}
