import { useState } from 'react'
import { createClient, FunctionsError } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('128')
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')

  const handleConvert = async () => {
    try {
      setConverting(true)
      setError('')
      setProgress(0)
      setDownloadUrl('')

      // 调用Edge Function进行转换
      const { data, error } = await supabase.functions.invoke('convert-video', {
        body: { url, quality: parseInt(quality) }
      })

      if (error) throw error

      setDownloadUrl(data.downloadUrl)
      setProgress(100)
  } catch (err) {
    console.error('Conversion error:', err)
    const error = err as Error
    setError(error?.message || '转换过程中发生错误')
}finally {
      setConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold mb-8 text-center">视频转MP3</h1>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    视频URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="输入YouTube视频链接"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    音频质量
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="320">320 kbps</option>
                  </select>
                </div>

                {error && (
                  <div className="mb-4 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={converting || !url}
                  className={`w-full py-2 px-4 rounded ${
                    converting || !url
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-700'
                  } text-white font-bold`}
                >
                  {converting ? '转换中...' : '开始转换'}
                </button>

                {converting && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}

                {downloadUrl && (
                  <div className="mt-4">
                    <a
                      href={downloadUrl}
                      className="text-blue-500 hover:text-blue-700"
                      download
                    >
                      下载MP3文件
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 