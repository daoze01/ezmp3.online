const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const morgan = require('morgan');
const fetch = require('node-fetch');

// 设置ffmpeg路径
ffmpeg.setFfmpegPath(ffmpegPath);

// 创建临时文件目录
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 创建输出目录
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/output', express.static(OUTPUT_DIR));

// 设置30分钟定时清理临时文件
setInterval(() => {
    cleanupTempFiles();
}, 30 * 60 * 1000);

// 路由
app.get('/', (req, res) => {
    res.send('EzMP3 API Server Running');
});

// 获取视频信息
app.get('/api/info', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    try {
        const info = await ytdl.getInfo(url);
        
        const videoDetails = {
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            lengthSeconds: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            videoId: info.videoDetails.videoId
        };
        
        res.json(videoDetails);
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to get video information' });
    }
});

// 转换视频为MP3
app.post('/api/convert', async (req, res) => {
    const { url, quality = 128 } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    try {
        const info = await ytdl.getInfo(url);
        const videoId = info.videoDetails.videoId;
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // 移除特殊字符
        
        const conversionId = uuidv4();
        const outputFileName = `${title}-${quality}kbps-${conversionId}.mp3`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        
        // 开始转换过程
        const audioStream = ytdl(url, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        
        // 使用ffmpeg设置比特率
        const ffmpegProcess = ffmpeg(audioStream)
            .audioBitrate(quality)
            .toFormat('mp3')
            .on('progress', (progress) => {
                console.log(`Processing: ${progress.percent}% done`);
            })
            .on('end', () => {
                console.log('Processing finished');
                
                // 生成下载链接
                const downloadLink = `/output/${outputFileName}`;
                
                res.json({
                    success: true,
                    title,
                    downloadLink,
                    fileName: outputFileName
                });
            })
            .on('error', (err) => {
                console.error('Error during conversion:', err);
                res.status(500).json({ error: 'Conversion failed' });
            })
            .save(outputPath);
            
    } catch (error) {
        console.error('Error converting video:', error);
        res.status(500).json({ error: 'Failed to convert video' });
    }
});

// 下载MP3文件
app.get('/api/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// 剪辑音频
app.post('/api/trim', async (req, res) => {
    const { url, startTime, endTime, quality = 128 } = req.body;
    
    if (!url || startTime === undefined || endTime === undefined) {
        return res.status(400).json({ error: 'URL, startTime, and endTime are required' });
    }
    
    try {
        const info = await ytdl.getInfo(url);
        const videoId = info.videoDetails.videoId;
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        const conversionId = uuidv4();
        const outputFileName = `${title}-trim-${quality}kbps-${conversionId}.mp3`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        
        // 下载完整音频
        const audioStream = ytdl(url, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        
        // 使用ffmpeg剪辑并设置比特率
        const ffmpegProcess = ffmpeg(audioStream)
            .audioBitrate(quality)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .toFormat('mp3')
            .on('progress', (progress) => {
                console.log(`Trimming: ${progress.percent}% done`);
            })
            .on('end', () => {
                console.log('Trimming finished');
                
                const downloadLink = `/output/${outputFileName}`;
                
                res.json({
                    success: true,
                    title: `${title} (Trimmed)`,
                    downloadLink,
                    fileName: outputFileName
                });
            })
            .on('error', (err) => {
                console.error('Error during trimming:', err);
                res.status(500).json({ error: 'Trimming failed' });
            })
            .save(outputPath);
    } catch (error) {
        console.error('Error trimming audio:', error);
        res.status(500).json({ error: 'Failed to trim audio' });
    }
});

// 清理临时文件
function cleanupTempFiles() {
    fs.readdir(TEMP_DIR, (err, files) => {
        if (err) {
            console.error('Error reading temp directory:', err);
            return;
        }
        
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting stats for file ${file}:`, err);
                    return;
                }
                
                // 删除创建时间超过30分钟的文件
                const now = new Date().getTime();
                const fileAge = now - stats.birthtime.getTime();
                
                if (fileAge > 30 * 60 * 1000) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`Error deleting file ${file}:`, err);
                        } else {
                            console.log(`Deleted temp file: ${file}`);
                        }
                    });
                }
            });
        });
    });
    
    // 清理输出目录中超过24小时的文件
    fs.readdir(OUTPUT_DIR, (err, files) => {
        if (err) {
            console.error('Error reading output directory:', err);
            return;
        }
        
        files.forEach(file => {
            const filePath = path.join(OUTPUT_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting stats for file ${file}:`, err);
                    return;
                }
                
                // 删除创建时间超过24小时的文件
                const now = new Date().getTime();
                const fileAge = now - stats.birthtime.getTime();
                
                if (fileAge > 24 * 60 * 60 * 1000) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`Error deleting output file ${file}:`, err);
                        } else {
                            console.log(`Deleted output file: ${file}`);
                        }
                    });
                }
            });
        });
    });
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 