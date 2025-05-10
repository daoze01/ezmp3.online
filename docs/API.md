import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Free YouTube MP4 to MP3 Converter | ezMP3 Online Tool",
  description: "ezMP3 is a fast, free YouTube mp4 to mp3 converter. Download YouTube audio as MP3 online with high quality. Try ezMP3 for easy MP3 download!",
  openGraph: {
    title: "Free YouTube MP4 to MP3 Converter | ezMP3 Online Tool",
    description: "ezMP3 is a fast, free YouTube mp4 to mp3 converter. Download YouTube audio as MP3 online with high quality. Try ezMP3 for easy MP3 download!",
    images: ["/og-image.png"],
    url: "https://yourdomain.com/",
    type: "website"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}