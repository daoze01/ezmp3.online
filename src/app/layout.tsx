import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "ezMP3 - Free YouTube MP4 to MP3 Converter",
  description: "Convert YouTube videos to MP3 online for free. Fast, secure, and no registration required.",
  openGraph: {
    title: "ezMP3 | Free YouTube MP4 to MP3 Converter",
    description: "Download high-quality MP3 from YouTube videos online. No ads, no registration.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 font-sans leading-relaxed">{children}</body>
    </html>
  )
}
