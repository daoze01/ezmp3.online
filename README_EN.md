# EzMP3 - Free YouTube to MP3 Converter

## Project Overview

EzMP3 is a powerful online tool for converting YouTube and other video platform content to MP3 format. The project uses a frontend-backend architecture with HTML, CSS, and JavaScript for the frontend, and Node.js for the backend API services.

## Main Features

- **Video to MP3 Conversion**: Convert videos from YouTube, Vimeo, Facebook, and other platforms to MP3 format
- **Video Info Preview**: Automatically fetch video title, thumbnail, and duration after pasting URL
- **Audio Trimming**: Set start and end times to convert only the needed portions
- **Multiple Quality Options**: Support for 64k, 128k, 192k, and 320k bitrates
- **Download History**: Automatically save conversion history for easy repeat downloads
- **Dark Mode**: Support for light/dark theme switching to reduce eye strain during night use
- **Multilingual Support**: English and Chinese interfaces, easily extendable to more languages
- **Responsive Design**: Perfect adaptation to PC, tablet, and mobile devices

## Phase 2 Improvements

Compared to Phase 1's static demo version, Phase 2 implements actual functionality:

1. **Actual API Integration**: Added backend service for real video info retrieval and MP3 conversion
2. **Video Info Preview**: Immediate display of video information after pasting URL, enhancing user experience
3. **Audio Trimming Feature**: Support for selecting specific parts of videos for conversion
4. **Dark Mode**: Implemented dark theme with automatic switching based on user preferences
5. **Multilingual Support**: Added English/Chinese language switching
6. **Improved UI Interactions**: More detailed conversion status feedback and download notifications
7. **Code Refactoring**: More modular code structure for future extensions

## File Structure

```
ezmp3/
├── index.html          # Main HTML page
├── css/                # Style folder
│   ├── styles.css      # Tailwind supplementary styles
│   └── style.css       # Theme switching styles
├── js/                 # JavaScript folder
│   ├── script.js       # Main script logic
│   ├── api.js          # API communication module
│   └── i18n.js         # Multilingual support module
├── images/             # Image resource folder
├── server/             # Backend service directory
│   ├── server.js       # Main server file
│   ├── package.json    # Backend dependency configuration
│   └── .env.example    # Environment variable example
└── DEPLOYMENT.md       # Deployment documentation
```

## Technology Stack

### Frontend
- HTML5
- CSS3 / Tailwind CSS
- JavaScript (ES6+)
- Responsive design

### Backend
- Node.js
- Express.js
- ytdl-core (YouTube download library)
- fluent-ffmpeg (Audio processing)

## Quick Start

### Frontend

Simply open the `index.html` file in a browser to preview the UI.

### Backend

1. Navigate to the backend directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment variable file:
   ```
   cp .env.example .env
   ```

4. Start the server:
   ```
   npm start
   ```

5. The server will run at http://localhost:3000

## Deployment

For detailed deployment instructions, please refer to the [DEPLOYMENT.md](DEPLOYMENT.md) file.

## Future Plans

- Batch conversion functionality
- Advanced audio effects (volume enhancement, fade in/out, etc.)
- More output formats (MP3, WAV, AAC, etc.)
- User account system

## License

This project is licensed under the MIT License.

## Contact

For questions or suggestions, please contact:
- Email: support@ezmp3.online 