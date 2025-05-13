'use client';

import { useState } from 'react';

export default function VideoConverter() {
  const [url, setUrl] = useState('');

  const handleConvert = () => {
    try {
      if (url) {
        const validUrl = new URL(url);
        console.log('Processing URL:', validUrl.toString());
        // 处理转换逻辑
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('无效URL');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
      <input
        id="videoUrl"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube video URL"
        className="w-full max-w-xl px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />
      <button
        onClick={handleConvert}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition w-full sm:w-auto"
      >
        Convert
      </button>
    </div>
  );
} 