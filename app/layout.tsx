import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STEM4U',
  description: 'STEM4U - Aileler için STEM eğitim platformu',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
