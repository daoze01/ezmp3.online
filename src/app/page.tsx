import VideoConverter from '@/components/VideoConverter';

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">ezMP3</span>
          <nav className="space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600">Home</a>
            <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
            <a href="#footer" className="text-gray-600 hover:text-blue-600">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Convert YouTube Videos to MP3 in Seconds</h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8">Fast, free, and secure MP3 downloads without registration.</p>
        <VideoConverter />
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">High Quality</h3>
            <p className="text-gray-600">Get crystal-clear MP3 files at your desired bitrate.</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">No Ads</h3>
            <p className="text-gray-600">Enjoy a clean interface without annoying pop-ups.</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">100% Free</h3>
            <p className="text-gray-600">No subscriptions or hidden fees—ever.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-800 text-gray-400 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 ezMP3. All rights reserved.</p>
          <p className="mt-2 space-x-2">
            <a href="/privacy" className="hover:text-white underline">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-white underline">Terms of Service</a>
          </p>
        </div>
      </footer>
    </>
  );
}
