// ezmp3 Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videoUrlInput = document.getElementById('video-url');
    const convertBtn = document.getElementById('convert-btn');
    const audioQualitySelect = document.getElementById('audio-quality');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resultContainer = document.getElementById('result-container');
    const videoTitle = document.getElementById('video-title');
    const downloadBtn = document.getElementById('download-btn');
    const convertAnotherBtn = document.getElementById('convert-another-btn');
    
    // New elements for video preview
    let videoPreviewContainer = null;
    let videoThumbnail = null;
    let videoTitlePreview = null;
    let videoDuration = null;
    let videoChannel = null;
    
    // URL Debounce timer
    let urlInputTimer = null;
    const URL_DEBOUNCE_DELAY = 800; // ms
    
    // 下载历史
    let downloadHistory = JSON.parse(localStorage.getItem('ezmp3_download_history') || '[]');

    // 全局变量，用于防止重复下载
    let isDownloading = false;
    let lastDownloadedFile = null;
    let downloadQueue = [];
    let selectedQuality = '128'; // 默认音质

    // Sample video titles for demonstration
    const sampleTitles = [
        "Adventures in Nature - Relaxing Music",
        "Epic Movie Soundtrack Compilation",
        "Acoustic Guitar Covers - Popular Songs",
        "Lo-Fi Beats to Study and Relax",
        "Top 10 Pop Hits of 2023 - Music Mix",
        "Classical Piano Masterpieces",
        "Motivational Workout Music Playlist",
        "Relaxing Beach Sounds - Ocean Waves",
        "Jazz Cafe Music - Smooth Jazz Saxophone"
    ];

    // 添加下载设置
    let downloadSettings = JSON.parse(localStorage.getItem('ezmp3_download_settings') || 
        JSON.stringify({
            autoOpenFolder: false,
            defaultQuality: 'medium', // 默认使用中等音质
            notificationDuration: 5000,
            preventDuplicates: true
        })
    );

    // 初始化主题
    initTheme();
    
    // 添加主题切换按钮事件监听器
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleDarkMode();
        });
    }

    // Event Listeners
    if (videoUrlInput) {
        // Add input event for URL preview
        videoUrlInput.addEventListener('input', function() {
            // Clear previous timer
            if (urlInputTimer) {
                clearTimeout(urlInputTimer);
            }
            
            // Set new timer for debouncing
            urlInputTimer = setTimeout(() => {
                const url = videoUrlInput.value.trim();
                if (isValidUrl(url)) {
                    fetchVideoInfo(url);
                } else {
                    hideVideoPreview();
                }
            }, URL_DEBOUNCE_DELAY);
        });
        
        // Add paste event for immediate preview
        videoUrlInput.addEventListener('paste', function(e) {
            // Short delay to allow paste to complete
            setTimeout(() => {
                const url = videoUrlInput.value.trim();
                if (isValidUrl(url)) {
                    fetchVideoInfo(url);
                }
            }, 100);
        });
    }

    if (convertBtn) {
        convertBtn.addEventListener('click', startConversion);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', simulateDownload);
    }

    if (convertAnotherBtn) {
        convertAnotherBtn.addEventListener('click', resetConverter);
    }
    
    if (audioQualitySelect) {
        audioQualitySelect.addEventListener('change', function() {
            selectedQuality = this.value;
        });
        
        // 设置默认选中的音质
        if (downloadSettings.defaultQuality === 'low') {
            audioQualitySelect.value = '64';
        } else if (downloadSettings.defaultQuality === 'medium') {
            audioQualitySelect.value = '128';
        } else if (downloadSettings.defaultQuality === 'high') {
            audioQualitySelect.value = '192';
        } else if (downloadSettings.defaultQuality === 'ultra') {
            audioQualitySelect.value = '320';
        }
        selectedQuality = audioQualitySelect.value;
    }
    
    // 添加页面顶部菜单中的下载历史按钮点击事件
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', showDownloadHistory);
    }

    // 添加"查看历史记录"按钮点击事件
    const viewHistoryBtn = document.getElementById('view-history-btn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', showDownloadHistory);
    }
    
    // 添加"打开下载文件夹"按钮点击事件
    const openFolderBtn = document.getElementById('open-download-folder-btn');
    if (openFolderBtn) {
        openFolderBtn.addEventListener('click', function() {
            showMessage('此功能在实际应用中会打开您的下载文件夹', 'info');
        });
    }
    
    // 添加设置按钮点击事件
    const showSettingsBtn = document.getElementById('show-settings-btn');
    if (showSettingsBtn) {
        showSettingsBtn.addEventListener('click', showDownloadSettings);
    }

    // Functions
    function startConversion() {
        // Validate URL
        const url = videoUrlInput.value.trim();
        if (!isValidUrl(url)) {
            showError('Please enter a valid video URL');
            return;
        }

        // Hide any previous errors
        hideError();
        
        // Hide the video preview during conversion
        hideVideoPreview();

        // Show progress
        progressContainer.classList.remove('hidden');
        convertBtn.disabled = true;
        videoUrlInput.disabled = true;

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(() => {
                    // Use video preview data for the result if available
                    if (window.currentVideoInfo) {
                        videoTitle.textContent = window.currentVideoInfo.title;
                    }
                    showResult();
                }, 500); // Show result after a small delay
            }
            updateProgress(progress);
        }, 300);
    }

    function updateProgress(value) {
        const roundedValue = Math.round(value);
        progressBar.style.width = `${roundedValue}%`;
        progressText.textContent = `${roundedValue}%`;
        
        // Add animated class when progress is ongoing
        if (roundedValue < 100) {
            progressBar.classList.add('animated-progress-bar');
        } else {
            progressBar.classList.remove('animated-progress-bar');
        }
    }

    function showResult() {
        // Hide progress
        progressContainer.classList.add('hidden');
        
        // Show result
        resultContainer.classList.remove('hidden');
        
        // Set random video title from sample data
        const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
        videoTitle.textContent = randomTitle;
        
        // 确保下载按钮显示正确的文本
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('opacity-70');
            downloadBtn.innerHTML = 'Download MP3';
        }
        
        // 移除转换结果区域下方可能存在的"正在准备下载..."元素
        const downloadingElements = document.querySelectorAll('.fixed.bottom-4.right-4');
        downloadingElements.forEach(element => {
            if (document.body.contains(element)) {
                document.body.removeChild(element);
            }
        });
        
        // Add fade-in animation
        resultContainer.classList.add('fade-in');
    }

    function simulateDownload() {
        // 如果已经在下载，则不重复启动下载
        if (isDownloading) {
            console.log('A download is already in progress, please wait for the current download to complete');
            showMessage('正在进行一个下载任务，请等待当前下载完成', 'info');
            return;
        }
        
        // 检查文件名
        if (!videoTitle.textContent || videoTitle.textContent.trim() === '') {
            videoTitle.textContent = 'download.mp3';
        }
        
        // 禁用下载按钮，防止重复点击
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.classList.add('opacity-70');
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Preparing download...';
        }
        
        // 清除任何存在的通知
        const existingNotifications = document.querySelectorAll('.fixed.bottom-4.right-4');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        try {
            // 创建一个随机的MP3文件大小（1-10MB）
            const fileSize = Math.floor(Math.random() * 9000000) + 1000000;
            
            // 生成文件名，包含音质信息
            const safeFileName = videoTitle.textContent.replace(/[^\w\s-]/gi, '') || 'download';
            const fileName = `${safeFileName}-${selectedQuality}kbps.mp3`;
            
            // 显示准备消息
            showMessage('正在准备MP3文件...', 'info');
            
            // 创建一个模拟的MP3文件Blob
            createMockMP3File(fileSize)
                .then(blob => {
                    // 验证Blob对象
                    if (!(blob instanceof Blob) || blob.size === 0) {
                        throw new Error('创建的MP3文件无效');
                    }
                    
                    // 确保MIME类型正确
                    if (blob.type !== 'audio/mpeg') {
                        console.warn('MP3文件MIME类型不正确，调整为audio/mpeg');
                        // 创建一个新Blob以确保MIME类型正确
                        blob = new Blob([blob], { type: 'audio/mpeg' });
                    }
                    
                    // 创建一个临时的URL，指向这个Blob
                    const blobUrl = URL.createObjectURL(blob);
                    console.log('创建的Blob URL:', blobUrl);
                    
                    // 显示下载选项对话框
                    showDownloadOptionsDialog(blobUrl, fileName, fileSize);
                })
                .catch(error => {
                    console.error('生成MP3文件失败:', error);
                    showMessage('生成MP3文件失败，请重试', 'error');
                    
                    // 恢复下载按钮状态
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.classList.remove('opacity-70');
                        downloadBtn.innerHTML = '下载 MP3';
                    }
                });
        } catch (error) {
            console.error('下载准备过程中出错:', error);
            showMessage('下载准备失败，请重试', 'error');
            
            // 恢复下载按钮状态
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('opacity-70');
                downloadBtn.innerHTML = '下载 MP3';
            }
        }
    }

    /**
     * 创建一个模拟的MP3文件
     * @param {number} size - 文件大小（字节）
     * @returns {Promise<Blob>} 模拟的MP3文件Blob
     */
    async function createMockMP3File(size) {
        // 创建一个指定大小的ArrayBuffer
        const arrayBuffer = new ArrayBuffer(size);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // 添加MP3文件头标记（ID3v2标记）
        // 这是一个更完善的MP3文件头 (ID3v2)
        const id3Header = new Uint8Array([
            0x49, 0x44, 0x33,       // "ID3"
            0x03, 0x00,             // 版本 3.0
            0x00,                   // 标志位
            0x00, 0x00, 0x00, 0x0A  // 大小信息 (10 bytes 不包括头部)
        ]);
        uint8Array.set(id3Header, 0);
        
        // MP3帧头，设置一些基本值 (MPEG-1 Layer 3)
        // 参考: http://www.mp3-tech.org/programmer/frame_header.html
        const bitrate = parseInt(selectedQuality);
        let bitrateIndex = 0x05; // 默认为 80kbps
        
        // 根据所选音质设置比特率索引
        if (bitrate <= 64) bitrateIndex = 0x02;       // 64kbps
        else if (bitrate <= 128) bitrateIndex = 0x08; // 128kbps
        else if (bitrate <= 192) bitrateIndex = 0x0A; // 192kbps
        else bitrateIndex = 0x0C;                     // 256kbps (近似于320kbps)
        
        // 创建有效的MP3帧头
        const frameHeader = new Uint8Array([
            0xFF, 0xFB,            // 帧同步和MPEG1 Layer3
            bitrateIndex << 4 | 0x01, // 比特率索引 (高4位) + 采样率索引 (低2位，41kHz)
            0xC0,                  // 填充位等
        ]);
        uint8Array.set(frameHeader, 10); // ID3v2头部后面添加帧
        
        // 添加音频数据 (正弦波模拟)
        const audioDataStart = 14; // 帧头后面
        const sampleRate = 44100;
        const frequency = 440; // A4音符 (440 Hz)
        
        for (let i = audioDataStart; i < size - audioDataStart; i++) {
            if (i < size) {
                // 生成一个简单的音频波形模式
                // 这里我们创建一个基于正弦波的简单模式
                const time = (i - audioDataStart) / sampleRate;
                const amplitude = 127;
                const value = Math.floor(amplitude * Math.sin(2 * Math.PI * frequency * time) + 128);
                uint8Array[i] = value & 0xFF;
            }
        }
        
        // 创建一个MP3类型的Blob，确保MIME类型正确
        return new Blob([arrayBuffer], { 
            type: 'audio/mpeg',
            endings: 'transparent'
        });
    }

    function showDownloadOptionsDialog(downloadUrl, fileName, fileSize) {
        // 创建下载选项对话框
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative';
        
        // 对话框头部
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-6 pb-2 border-b';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-900';
        title.textContent = 'File is ready';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
            // 释放Blob URL
            if (downloadUrl.startsWith('blob:')) {
                URL.revokeObjectURL(downloadUrl);
            }
            // 恢复下载按钮状态
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('opacity-70');
            }
        };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // 对话框内容
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        // 文件信息显示
        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'mb-6';
        
        const fileIcon = document.createElement('div');
        fileIcon.className = 'mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-500';
        fileIcon.innerHTML = '<i class="fas fa-music text-3xl"></i>';
        
        // 格式化文件大小
        const formattedSize = formatFileSize(fileSize);
        
        const fileNameDisplay = document.createElement('div');
        fileNameDisplay.className = 'text-center';
        fileNameDisplay.innerHTML = `
            <p class="text-lg font-medium text-gray-900 mb-1">${fileName}</p>
            <p class="text-sm text-gray-500">Quality: ${selectedQuality}kbps ${getQualityDescription(selectedQuality)}</p>
            <p class="text-sm text-gray-500">Size: ${formattedSize}</p>
            <p class="text-sm text-gray-500">File will be downloaded to your default download folder</p>
        `;
        
        fileInfoDiv.appendChild(fileIcon);
        fileInfoDiv.appendChild(fileNameDisplay);
        
        content.appendChild(fileInfoDiv);
        
        // 对话框底部按钮
        const footer = document.createElement('div');
        footer.className = 'flex justify-center gap-4 mt-6';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
            // 释放Blob URL
            if (downloadUrl.startsWith('blob:')) {
                URL.revokeObjectURL(downloadUrl);
            }
            // 恢复下载按钮状态
            if (window.downloadBtn) {
                window.downloadBtn.disabled = false;
                window.downloadBtn.classList.remove('opacity-70');
            }
        };
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
            
            // 验证下载URL
            if (!downloadUrl || !downloadUrl.startsWith('blob:')) {
                console.error('无效的下载URL格式:', downloadUrl);
                showMessage('下载链接无效，请重试', 'error');
                
                // 恢复下载按钮状态
                if (window.downloadBtn) {
                    window.downloadBtn.disabled = false;
                    window.downloadBtn.classList.remove('opacity-70');
                }
                return;
            }
            
            // 标记为正在下载
            isDownloading = true;
            
            // 使用默认下载路径
            handleBrowserDownload(downloadUrl, fileName, '', false, fileSize);
        };
        
        const downloadAndOpenBtn = document.createElement('button');
        downloadAndOpenBtn.className = 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700';
        downloadAndOpenBtn.textContent = 'Download and Open';
        downloadAndOpenBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
            
            // 验证下载URL
            if (!downloadUrl || !downloadUrl.startsWith('blob:')) {
                console.error('无效的下载URL格式:', downloadUrl);
                showMessage('下载链接无效，请重试', 'error');
                
                // 恢复下载按钮状态
                if (window.downloadBtn) {
                    window.downloadBtn.disabled = false;
                    window.downloadBtn.classList.remove('opacity-70');
                }
                return;
            }
            
            // 标记为正在下载
            isDownloading = true;
            
            // 使用默认下载路径，并设置下载完成后打开文件
            handleBrowserDownload(downloadUrl, fileName, '', true, fileSize);
        };
        
        footer.appendChild(cancelBtn);
        footer.appendChild(downloadBtn);
        footer.appendChild(downloadAndOpenBtn);
        
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        dialogOverlay.appendChild(dialog);
        document.body.appendChild(dialogOverlay);
    }

    function handleBrowserDownload(downloadUrl, fileName, downloadPath = '', shouldOpenFile = false, fileSize = 0) {
        // 清除所有现有的通知元素，避免多个通知堆叠
        const notificationElements = document.querySelectorAll('.fixed.bottom-4.right-4');
        notificationElements.forEach(element => {
            if (document.body.contains(element)) {
                document.body.removeChild(element);
            }
        });
        
        // 1. 创建下载链接
        const link = document.createElement('a');
        
        // 修复：确保URL是有效的Blob URL或文件URL，而不是网页URL
        // 检查downloadUrl是否为有效的Blob URL或以http开头但不是example.com
        if (downloadUrl.startsWith('blob:') || 
           (downloadUrl.startsWith('http') && !downloadUrl.includes('example.com'))) {
            link.href = downloadUrl;
        } else {
            console.error('无效的下载URL:', downloadUrl);
            showMessage('下载链接无效，请重试', 'error');
            
            // 恢复下载按钮状态
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('opacity-70');
                downloadBtn.innerHTML = '下载 MP3';
            }
            
            isDownloading = false;
            return;
        }
        
        link.download = fileName; // 确保设置download属性强制浏览器下载而不是打开
        
        // 2. 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 3. 添加到下载历史
        const downloadStartTime = new Date();
        const existingRecord = downloadHistory.find(record => record.fileName === fileName);
        if (!existingRecord) {
            addToDownloadHistory(fileName, downloadUrl, downloadStartTime, '浏览器默认下载文件夹', fileSize);
        } else {
            // 更新下载记录
            existingRecord.timestamp = new Date().toISOString();
            // 重新排序历史记录
            downloadHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            // 保存到本地存储
            localStorage.setItem('ezmp3_download_history', JSON.stringify(downloadHistory));
        }
        
        // 记录最后下载的文件名
        lastDownloadedFile = fileName;
        
        // 4. 显示下载中状态提示
        const downloadingElement = createDownloadingNotification(fileName);
        
        // 5. 模拟下载完成事件（真实情况下无法知道确切的下载完成时间）
        setTimeout(() => {
            // 删除"正在下载..."提示
            if (document.body.contains(downloadingElement)) {
                document.body.removeChild(downloadingElement);
            }
            
            // 显示下载成功对话框，而不是简单的通知
            showDownloadSuccessDialog(fileName, shouldOpenFile, downloadUrl);
            
            // 重新启用下载按钮
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('opacity-70');
                downloadBtn.innerHTML = '下载 MP3';
            }
            
            // 标记为下载完成
            isDownloading = false;
            
            // 处理下载队列
            if (downloadQueue.length > 0) {
                const nextDownload = downloadQueue.shift();
                setTimeout(() => {
                    handleBrowserDownload(nextDownload.url, nextDownload.name, '', nextDownload.shouldOpen);
                }, 500);
            }
            
            // 释放Blob URL
            setTimeout(() => {
                if (downloadUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(downloadUrl);
                }
            }, 60000); // 1分钟后释放，以确保有足够时间播放音频
        }, 5000); // 适当延长下载时间，使进度条有时间显示
    }

    /**
     * 格式化文件大小显示
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 显示下载成功对话框
     * @param {string} fileName - 下载的文件名
     * @param {boolean} shouldOpenFile - 是否应该自动打开文件
     * @param {string} blobUrl - 文件的Blob URL，用于音频预览
     */
    function showDownloadSuccessDialog(fileName, shouldOpenFile, blobUrl) {
        // 创建对话框遮罩
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative fade-in';
        
        // 成功图标
        const successIcon = document.createElement('div');
        successIcon.className = 'mx-auto w-24 h-24 flex items-center justify-center bg-green-100 rounded-full text-green-500 mb-6';
        successIcon.innerHTML = '<i class="fas fa-check text-4xl"></i>';
        
        // 成功标题
        const title = document.createElement('h3');
        title.className = 'text-2xl font-semibold text-center text-gray-800 mb-2';
        title.textContent = '下载成功!';
        
        // 文件信息
        const fileInfo = document.createElement('div');
        fileInfo.className = 'text-center mb-6';
        
        const fileNameElement = document.createElement('p');
        fileNameElement.className = 'text-gray-600 mb-1 break-all';
        fileNameElement.textContent = fileName;
        
        const filePath = document.createElement('p');
        filePath.className = 'text-sm text-gray-500';
        filePath.textContent = '文件已保存到您的下载文件夹';
        
        fileInfo.appendChild(fileNameElement);
        fileInfo.appendChild(filePath);
        
        // 音频预览播放器（如果是MP3文件）
        const audioPreview = document.createElement('div');
        audioPreview.className = 'w-full mb-6 bg-gray-100 p-4 rounded-lg';
        
        // 创建音频元素和播放器UI
        const audioPlayer = document.createElement('audio');
        
        // 验证并设置音频源
        if (blobUrl && (blobUrl.startsWith('blob:') || blobUrl.includes('.mp3'))) {
            audioPlayer.src = blobUrl; // 使用Blob URL作为音频源
            audioPlayer.preload = 'metadata';
        } else {
            console.warn('无效的音频预览URL:', blobUrl);
        }
        
        // 处理音频加载错误
        audioPlayer.onerror = (e) => {
            console.error('音频加载失败:', e);
            audioPreview.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-exclamation-circle text-yellow-500 text-xl mb-2"></i>
                    <p>音频预览不可用</p>
                    <p class="text-xs mt-1">已下载的文件仍然可以在您的下载文件夹中找到</p>
                </div>
            `;
        };
        
        // 播放器状态
        let isPlaying = false;
        let duration = 0;
        let currentTime = 0;
        
        // 音频播放器UI
        const playerUI = document.createElement('div');
        playerUI.className = 'audio-player';
        playerUI.innerHTML = `
            <p class="text-center text-sm text-gray-600 mb-2">音频预览</p>
            <div class="flex items-center justify-center space-x-4">
                <button id="play-pause-btn" class="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-play" id="play-icon"></i>
                    <i class="fas fa-pause hidden" id="pause-icon"></i>
                </button>
                <div class="flex-grow bg-gray-300 h-2 rounded-full relative cursor-pointer" id="progress-container">
                    <div class="absolute left-0 top-0 bg-blue-500 h-2 rounded-full" id="progress-bar" style="width: 0%"></div>
                </div>
                <span class="text-xs text-gray-500" id="time-display">0:00</span>
            </div>
        `;
        
        // 添加音频播放器到UI
        audioPreview.appendChild(playerUI);
        
        // 添加事件监听
        audioPlayer.addEventListener('loadedmetadata', () => {
            duration = audioPlayer.duration;
            updateTimeDisplay();
        });
        
        audioPlayer.addEventListener('timeupdate', () => {
            currentTime = audioPlayer.currentTime;
            const progressPercent = (currentTime / duration) * 100;
            const progressBar = playerUI.querySelector('#progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
            updateTimeDisplay();
        });
        
        audioPlayer.addEventListener('ended', () => {
            isPlaying = false;
            updatePlayPauseIcon();
        });
        
        // 点击播放/暂停按钮
        playerUI.querySelector('#play-pause-btn').addEventListener('click', () => {
            if (!audioPlayer.src) {
                showMessage('无法播放音频，音频源无效', 'error');
                return;
            }
            
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
                updatePlayPauseIcon();
            } else {
                audioPlayer.play()
                    .then(() => {
                        isPlaying = true;
                        updatePlayPauseIcon();
                    })
                    .catch(err => {
                        console.error('播放失败:', err);
                        
                        // 显示错误消息
                        showMessage('无法播放音频，这是一个模拟的音频文件', 'error');
                    });
            }
        });
        
        // 点击进度条跳转
        const progressContainer = playerUI.querySelector('#progress-container');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                if (!audioPlayer.src) {
                    return;
                }
                
                if (duration > 0) {
                    const clickPosition = (e.offsetX / progressContainer.offsetWidth);
                    audioPlayer.currentTime = clickPosition * duration;
                }
            });
        }
        
        // 更新播放/暂停图标
        function updatePlayPauseIcon() {
            const playIcon = playerUI.querySelector('#play-icon');
            const pauseIcon = playerUI.querySelector('#pause-icon');
            
            if (isPlaying) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            } else {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        }
        
        // 更新时间显示
        function updateTimeDisplay() {
            const timeDisplay = playerUI.querySelector('#time-display');
            if (timeDisplay) {
                const currentMinutes = Math.floor(currentTime / 60);
                const currentSeconds = Math.floor(currentTime % 60);
                const durationMinutes = Math.floor(duration / 60);
                const durationSeconds = Math.floor(duration % 60);
                
                timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
            }
        }
        
        // 按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex flex-wrap justify-center gap-4';
        
        // 打开文件夹按钮
        const openFolderBtn = document.createElement('button');
        openFolderBtn.className = 'px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 flex items-center';
        openFolderBtn.innerHTML = '<i class="fas fa-folder-open mr-2"></i> 打开文件夹';
        openFolderBtn.onclick = () => {
            // 尝试直接打开下载文件夹
            // 注意：由于浏览器安全限制，这个功能通常需要通过本地应用或浏览器扩展实现
            try {
                // 检测操作系统
                let os = 'unknown';
                if (navigator.userAgent.indexOf('Win') !== -1) os = 'windows';
                else if (navigator.userAgent.indexOf('Mac') !== -1) os = 'mac';
                else if (navigator.userAgent.indexOf('Linux') !== -1) os = 'linux';
                
                if (os === 'windows') {
                    // Windows尝试打开downloads文件夹
                    window.open('file:///C:/Users/Downloads/', '_blank');
                } else if (os === 'mac') {
                    // Mac尝试打开downloads文件夹
                    window.open('file:///Users/Downloads/', '_blank');
                } else if (os === 'linux') {
                    // Linux尝试打开downloads文件夹
                    window.open('file:///home/Downloads/', '_blank');
                } else {
                    throw new Error('未知操作系统');
                }
            } catch (e) {
                console.error('无法直接打开文件夹:', e);
                
                // 显示提示消息
                showMessage('由于浏览器安全限制，无法直接打开下载文件夹。请手动查找您的下载文件夹。', 'info');
                
                // 显示一个帮助对话框，指导用户如何找到下载文件夹
                showDownloadFolderHelp();
            }
        };
        
        // 播放文件按钮
        const playFileBtn = document.createElement('button');
        playFileBtn.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center';
        playFileBtn.innerHTML = '<i class="fas fa-play mr-2"></i> 播放文件';
        playFileBtn.onclick = () => {
            // 使用我们创建的音频播放器播放音频
            if (audioPlayer && !isPlaying) {
                audioPlayer.play()
                    .then(() => {
                        isPlaying = true;
                        updatePlayPauseIcon();
                    })
                    .catch(err => {
                        console.error('播放失败:', err);
                        showMessage('无法播放音频，这是一个模拟的音频文件', 'error');
                    });
            } else if (audioPlayer && isPlaying) {
                // 如果已经在播放，则显示提示
                showMessage('音频已经在播放中', 'info');
            } else {
                // 如果音频播放器不可用，显示错误信息
                showMessage('音频播放器不可用', 'error');
            }
        };
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center';
        closeBtn.innerHTML = '<i class="fas fa-check mr-2"></i> 完成';
        closeBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
        };
        
        // 如果设置了自动打开文件
        if (shouldOpenFile) {
            // 模拟自动打开文件的行为
            setTimeout(() => {
                playFileBtn.click();
            }, 500);
        }
        
        // 组装按钮
        buttonsContainer.appendChild(openFolderBtn);
        buttonsContainer.appendChild(playFileBtn);
        buttonsContainer.appendChild(closeBtn);
        
        // 组装对话框
        dialog.appendChild(successIcon);
        dialog.appendChild(title);
        dialog.appendChild(fileInfo);
        dialog.appendChild(audioPreview);
        dialog.appendChild(buttonsContainer);
        
        // 关闭按钮
        const topCloseBtn = document.createElement('button');
        topCloseBtn.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600';
        topCloseBtn.innerHTML = '<i class="fas fa-times"></i>';
        topCloseBtn.onclick = () => {
            document.body.removeChild(dialogOverlay);
        };
        
        dialog.appendChild(topCloseBtn);
        
        // 添加到页面
        dialogOverlay.appendChild(dialog);
        document.body.appendChild(dialogOverlay);
        
        // 点击遮罩时关闭对话框
        dialogOverlay.addEventListener('click', (e) => {
            if (e.target === dialogOverlay) {
                document.body.removeChild(dialogOverlay);
            }
        });
        
        // 自动5分钟后关闭
        setTimeout(() => {
            if (document.body.contains(dialogOverlay)) {
                document.body.removeChild(dialogOverlay);
            }
        }, 5 * 60 * 1000);
    }

    function createDownloadingNotification(fileName) {
        // 清除所有现有的通知，避免重复显示
        const existingNotifications = document.querySelectorAll('.fixed.bottom-4.right-4');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-md p-4 flex flex-col max-w-sm w-full transform transition-all duration-300';
        
        notification.innerHTML = `
            <div class="flex items-center w-full mb-2">
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900 flex items-center">
                        <i class="fas fa-file-audio mr-2 text-blue-500"></i>
                        Downloading...
                    </div>
                </div>
                <div>
                    <button class="text-gray-400 hover:text-gray-600" id="close-download-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="w-full">
                <div class="text-xs text-gray-600 mb-1 flex justify-between">
                    <span class="truncate max-w-[80%]">${fileName}</span>
                    <span class="text-gray-500">0%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-blue-500 h-1.5 rounded-full w-0" id="download-progress-bar"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 绑定关闭按钮事件
        notification.querySelector('#close-download-btn').addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        // 模拟下载进度
        simulateDownloadProgress(notification.querySelector('#download-progress-bar'), notification.querySelector('span.text-gray-500'));
        
        return notification;
    }

    // 模拟下载进度条
    function simulateDownloadProgress(progressBar, percentText) {
        let progress = 0;
        const interval = setInterval(() => {
            // 计算进度，非线性增长，一开始快，后面慢
            if (progress < 80) {
                progress += Math.random() * 5 + 2;
            } else if (progress < 95) {
                progress += Math.random() * 1;
            } else {
                progress += 0.1;
            }
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            const roundedProgress = Math.min(Math.round(progress), 100);
            progressBar.style.width = `${roundedProgress}%`;
            percentText.textContent = `${roundedProgress}%`;
        }, 200);
        
        return interval;
    }

    function addToDownloadHistory(fileName, fileUrl, timestamp, downloadPath = '', fileSize = 0) {
        // 计算文件大小的显示文本
        const sizeText = fileSize > 0 ? formatFileSize(fileSize) : '3.2 MB';
        
        // 创建一个下载记录对象
        const downloadRecord = {
            id: Date.now().toString(),
            fileName: fileName,
            fileUrl: fileUrl,
            timestamp: timestamp.toISOString(),
            size: sizeText,
            downloadPath: downloadPath || 'Default download folder'
        };
        
        // 添加到下载历史记录
        downloadHistory.unshift(downloadRecord);
        
        // 限制历史记录数量
        if (downloadHistory.length > 20) {
            downloadHistory = downloadHistory.slice(0, 20);
        }
        
        // 保存到本地存储
        localStorage.setItem('ezmp3_download_history', JSON.stringify(downloadHistory));
    }
    
    // 导出到全局作用域，使其可以在内联脚本中被调用
    window.showDownloadHistory = showDownloadHistory;
    window.showDownloadSettings = showDownloadSettings;
    
    function showDownloadHistory() {
        // 创建历史记录对话框
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 relative max-h-[80vh] flex flex-col';
        
        // 对话框头部
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4 pb-2 border-b';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-900';
        title.textContent = 'Download History';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.onclick = () => document.body.removeChild(dialogOverlay);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // 对话框内容
        const content = document.createElement('div');
        content.className = 'flex-1 overflow-auto';
        
        if (downloadHistory.length === 0) {
            // 没有下载记录
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 text-gray-500">
                    <i class="fas fa-history text-4xl mb-4"></i>
                    <p>You haven't downloaded any files</p>
                </div>
            `;
        } else {
            // 显示下载记录表格
            const table = document.createElement('table');
            table.className = 'min-w-full divide-y divide-gray-200';
            
            table.innerHTML = `
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download Time</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download Path</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${downloadHistory.map(record => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <i class="fas fa-music text-blue-500 mr-3"></i>
                                    <div class="text-sm font-medium text-gray-900">${record.fileName}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">${formatDate(record.timestamp)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">${record.size}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">${record.downloadPath}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button class="text-blue-600 hover:text-blue-900 mr-3 download-again" data-id="${record.id}">Download Again</button>
                                <button class="text-red-600 hover:text-red-900 remove-download" data-id="${record.id}">Remove</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            content.appendChild(table);
        }
        
        // 对话框底部
        const footer = document.createElement('div');
        footer.className = 'flex justify-between items-center mt-4 pt-2 border-t';
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'text-red-600 hover:text-red-800 text-sm font-medium';
        clearBtn.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> Clear All History';
        clearBtn.onclick = () => {
            if (confirm('Are you sure you want to clear all download history? This operation cannot be undone.')) {
                downloadHistory = [];
                localStorage.setItem('ezmp3_download_history', JSON.stringify(downloadHistory));
                document.body.removeChild(dialogOverlay);
                showMessage('Download history cleared', 'info');
            }
        };
        
        const closeBtn2 = document.createElement('button');
        closeBtn2.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded';
        closeBtn2.textContent = 'Close';
        closeBtn2.onclick = () => document.body.removeChild(dialogOverlay);
        
        footer.appendChild(clearBtn);
        footer.appendChild(closeBtn2);
        
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        dialogOverlay.appendChild(dialog);
        document.body.appendChild(dialogOverlay);
        
        // 绑定表格中的按钮事件
        if (downloadHistory.length > 0) {
            // 重新下载按钮
            dialog.querySelectorAll('.download-again').forEach(btn => {
                btn.addEventListener('click', function() {
                    const recordId = this.getAttribute('data-id');
                    const record = downloadHistory.find(r => r.id === recordId);
                    if (record) {
                        document.body.removeChild(dialogOverlay);
                        simulateDownload();
                        showMessage(`Downloading again: ${record.fileName}`, 'info');
                    }
                });
            });
            
            // 移除记录按钮
            dialog.querySelectorAll('.remove-download').forEach(btn => {
                btn.addEventListener('click', function() {
                    const recordId = this.getAttribute('data-id');
                    downloadHistory = downloadHistory.filter(r => r.id !== recordId);
                    localStorage.setItem('ezmp3_download_history', JSON.stringify(downloadHistory));
                    
                    // 刷新列表
                    document.body.removeChild(dialogOverlay);
                    showDownloadHistory();
                    showMessage('Record removed from download history', 'info');
                });
            });
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function resetConverter() {
        // Hide result
        resultContainer.classList.add('hidden');
        
        // Enable input and button
        videoUrlInput.value = '';
        videoUrlInput.disabled = false;
        convertBtn.disabled = false;
        
        // Focus on input
        videoUrlInput.focus();
    }

    function isValidUrl(url) {
        // Basic URL validation
        if (!url) return false;
        
        // Check if it's from a supported platform (simple check for demo)
        const supportedDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
        return supportedDomains.some(domain => url.includes(domain));
    }

    function showError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.getElementById('url-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'url-error';
            errorElement.className = 'text-red-500 text-sm mt-2';
            videoUrlInput.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        videoUrlInput.classList.add('border-red-500');
    }

    function hideError() {
        const errorElement = document.getElementById('url-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        videoUrlInput.classList.remove('border-red-500');
    }

    function showMessage(message, type = 'info') {
        // Create toast message container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `p-4 mb-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white opacity-0 transition-opacity duration-300`;
        toast.textContent = message;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('opacity-100');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('opacity-100');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // 导出到全局作用域，使其可以在内联脚本中被调用
    window.showMessage = showMessage;

    // Add class to make converter box interactive
    const converterBox = document.querySelector('.bg-white.rounded-xl.shadow-xl');
    if (converterBox) {
        converterBox.classList.add('converter-box');
    }

    // Add classes to feature cards for hover effects
    document.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md').forEach(card => {
        card.classList.add('feature-card');
    });

    // Add classes to testimonial cards
    document.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md').forEach(card => {
        if (card.querySelector('.text-yellow-400')) {
            card.classList.add('testimonial-card');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 下载设置功能
    function showDownloadSettings() {
        // 创建设置对话框
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative';
        
        // 对话框头部
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-6 pb-2 border-b';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-900';
        title.textContent = 'Download Settings';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.onclick = () => document.body.removeChild(dialogOverlay);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // 对话框内容 - 设置选项
        const content = document.createElement('div');
        content.className = 'space-y-6';
        
        // 1. 防止重复下载选项
        const preventDuplicatesDiv = document.createElement('div');
        preventDuplicatesDiv.className = 'flex items-center justify-between';
        
        const preventDuplicatesLabel = document.createElement('label');
        preventDuplicatesLabel.className = 'flex items-center cursor-pointer';
        preventDuplicatesLabel.innerHTML = `
            <span class="text-gray-700 mr-3">Prevent Duplicate Downloads</span>
            <div class="relative">
                <input type="checkbox" id="prevent-duplicates" class="sr-only" ${downloadSettings.preventDuplicates ? 'checked' : ''}>
                <div class="block bg-gray-300 w-12 h-6 rounded-full"></div>
                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
            </div>
        `;
        
        const preventDuplicatesText = document.createElement('p');
        preventDuplicatesText.className = 'text-xs text-gray-500 mt-1';
        preventDuplicatesText.textContent = 'Prompt for confirmation when downloading the same file again';
        
        preventDuplicatesDiv.appendChild(preventDuplicatesLabel);
        preventDuplicatesDiv.appendChild(preventDuplicatesText);
        
        // 2. 自动打开文件夹选项
        const autoOpenFolderDiv = document.createElement('div');
        autoOpenFolderDiv.className = 'flex items-center justify-between';
        
        const autoOpenFolderLabel = document.createElement('label');
        autoOpenFolderLabel.className = 'flex items-center cursor-pointer';
        autoOpenFolderLabel.innerHTML = `
            <span class="text-gray-700 mr-3">Download and Open Folder</span>
            <div class="relative">
                <input type="checkbox" id="auto-open-folder" class="sr-only" ${downloadSettings.autoOpenFolder ? 'checked' : ''}>
                <div class="block bg-gray-300 w-12 h-6 rounded-full"></div>
                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
            </div>
        `;
        
        const autoOpenFolderText = document.createElement('p');
        autoOpenFolderText.className = 'text-xs text-gray-500 mt-1';
        autoOpenFolderText.textContent = 'Automatically open the folder containing the downloaded file';
        
        autoOpenFolderDiv.appendChild(autoOpenFolderLabel);
        autoOpenFolderDiv.appendChild(autoOpenFolderText);
        
        // 3. 默认音质选项
        const qualityDiv = document.createElement('div');
        qualityDiv.className = 'mb-4';
        
        const qualityLabel = document.createElement('label');
        qualityLabel.className = 'block text-gray-700 text-sm font-medium mb-2';
        qualityLabel.textContent = 'Default Quality';
        
        const qualitySelect = document.createElement('select');
        qualitySelect.id = 'default-quality';
        qualitySelect.className = 'w-full p-2 border border-gray-300 rounded-md';
        
        const qualities = [
            { value: 'low', label: 'Low (64kbps) - Smallest File Size' },
            { value: 'medium', label: 'Medium (128kbps) - Recommended Choice' },
            { value: 'high', label: 'High (192kbps) - High Quality' },
            { value: 'ultra', label: 'Ultra (320kbps) - Lossless Quality' }
        ];
        
        qualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality.value;
            option.textContent = quality.label;
            if (downloadSettings.defaultQuality === quality.value) {
                option.selected = true;
            }
            qualitySelect.appendChild(option);
        });
        
        qualityDiv.appendChild(qualityLabel);
        qualityDiv.appendChild(qualitySelect);
        
        // 4. 通知持续时间
        const notificationDurationDiv = document.createElement('div');
        notificationDurationDiv.className = 'mb-4';
        
        const notificationDurationLabel = document.createElement('label');
        notificationDurationLabel.className = 'block text-gray-700 text-sm font-medium mb-2';
        notificationDurationLabel.textContent = 'Notification Display Time';
        
        const notificationDurationRange = document.createElement('input');
        notificationDurationRange.type = 'range';
        notificationDurationRange.id = 'notification-duration';
        notificationDurationRange.className = 'w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer';
        notificationDurationRange.min = '2000';
        notificationDurationRange.max = '10000';
        notificationDurationRange.step = '1000';
        notificationDurationRange.value = downloadSettings.notificationDuration;
        
        const durationValue = document.createElement('div');
        durationValue.className = 'text-xs text-gray-500 mt-1 text-center';
        durationValue.textContent = `${downloadSettings.notificationDuration / 1000} seconds`;
        
        notificationDurationRange.addEventListener('input', function() {
            durationValue.textContent = `${this.value / 1000} seconds`;
        });
        
        notificationDurationDiv.appendChild(notificationDurationLabel);
        notificationDurationDiv.appendChild(notificationDurationRange);
        notificationDurationDiv.appendChild(durationValue);
        
        // 组合所有设置
        content.appendChild(preventDuplicatesDiv);
        content.appendChild(autoOpenFolderDiv);
        content.appendChild(qualityDiv);
        content.appendChild(notificationDurationDiv);
        
        // 对话框底部 - 按钮
        const footer = document.createElement('div');
        footer.className = 'flex justify-end mt-6 pt-4 border-t';
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'mr-3 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100';
        resetBtn.textContent = 'Reset to Default';
        resetBtn.onclick = () => {
            // 重置所有设置为默认值
            downloadSettings = {
                autoOpenFolder: false,
                defaultQuality: 'medium',
                notificationDuration: 5000,
                preventDuplicates: true
            };
            
            // 更新UI
            document.getElementById('prevent-duplicates').checked = true;
            document.getElementById('auto-open-folder').checked = false;
            document.getElementById('default-quality').value = 'medium';
            document.getElementById('notification-duration').value = '5000';
            durationValue.textContent = '5 seconds';
            
            // 保存设置
            localStorage.setItem('ezmp3_download_settings', JSON.stringify(downloadSettings));
            
            showMessage('Settings reset to default', 'info');
        };
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
        saveBtn.textContent = 'Save Settings';
        saveBtn.onclick = () => {
            // 获取所有设置值
            downloadSettings = {
                preventDuplicates: document.getElementById('prevent-duplicates').checked,
                autoOpenFolder: document.getElementById('auto-open-folder').checked,
                defaultQuality: document.getElementById('default-quality').value,
                notificationDuration: parseInt(document.getElementById('notification-duration').value)
            };
            
            // 保存设置
            localStorage.setItem('ezmp3_download_settings', JSON.stringify(downloadSettings));
            
            // 显示成功消息
            showMessage('Download settings saved', 'success');
            
            // 关闭对话框
            document.body.removeChild(dialogOverlay);
        };
        
        footer.appendChild(resetBtn);
        footer.appendChild(saveBtn);
        
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        dialogOverlay.appendChild(dialog);
        document.body.appendChild(dialogOverlay);
        
        // 添加开关样式
        const toggles = dialogOverlay.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const dot = this.parentNode.querySelector('.dot');
                if (this.checked) {
                    dot.classList.add('transform', 'translate-x-6', 'bg-blue-600');
                    this.parentNode.querySelector('.block').classList.remove('bg-gray-300');
                    this.parentNode.querySelector('.block').classList.add('bg-blue-200');
                } else {
                    dot.classList.remove('transform', 'translate-x-6', 'bg-blue-600');
                    this.parentNode.querySelector('.block').classList.add('bg-gray-300');
                    this.parentNode.querySelector('.block').classList.remove('bg-blue-200');
                }
            });
            
            // 初始化开关状态
            if (toggle.checked) {
                const dot = toggle.parentNode.querySelector('.dot');
                dot.classList.add('transform', 'translate-x-6', 'bg-blue-600');
                toggle.parentNode.querySelector('.block').classList.remove('bg-gray-300');
                toggle.parentNode.querySelector('.block').classList.add('bg-blue-200');
            }
        });
    }

    // 辅助函数：根据音质值返回描述文本
    function getQualityDescription(quality) {
        switch(quality) {
            case '64': return '(Smallest File Size)';
            case '128': return '(Recommended Choice)';
            case '192': return '(High Quality)';
            case '320': return '(Lossless Quality)';
            default: return '';
        }
    }

    // Function to create video preview elements if they don't exist
    function createVideoPreviewElements() {
        if (!videoPreviewContainer) {
            videoPreviewContainer = document.createElement('div');
            videoPreviewContainer.className = 'video-preview-container bg-gray-100 rounded-lg p-4 mt-4 flex items-start hidden';
            videoPreviewContainer.style.transition = 'all 0.3s ease';
            
            videoThumbnail = document.createElement('img');
            videoThumbnail.className = 'w-24 h-auto rounded mr-4 object-cover';
            videoThumbnail.alt = 'Video thumbnail';
            
            const infoContainer = document.createElement('div');
            infoContainer.className = 'flex-1';
            
            videoTitlePreview = document.createElement('h4');
            videoTitlePreview.className = 'text-sm font-medium text-gray-900 mb-1 line-clamp-2';
            
            videoChannel = document.createElement('p');
            videoChannel.className = 'text-xs text-gray-600 mb-1';
            
            videoDuration = document.createElement('p');
            videoDuration.className = 'text-xs text-gray-500 flex items-center';
            videoDuration.innerHTML = '<i class="far fa-clock mr-1"></i> <span></span>';
            
            infoContainer.appendChild(videoTitlePreview);
            infoContainer.appendChild(videoChannel);
            infoContainer.appendChild(videoDuration);
            
            videoPreviewContainer.appendChild(videoThumbnail);
            videoPreviewContainer.appendChild(infoContainer);
            
            // Insert after the input container
            videoUrlInput.closest('.mb-6').appendChild(videoPreviewContainer);
        }
    }
    
    // Function to show video preview with data
    function showVideoPreview(data) {
        createVideoPreviewElements();
        
        // Set data
        videoThumbnail.src = data.thumbnail;
        videoTitlePreview.textContent = data.title;
        videoChannel.textContent = data.channel;
        videoDuration.querySelector('span').textContent = data.duration;
        
        // Show container with fade-in
        videoPreviewContainer.classList.remove('hidden');
        setTimeout(() => {
            videoPreviewContainer.classList.add('opacity-100');
        }, 10);
    }
    
    // Function to hide video preview
    function hideVideoPreview() {
        if (videoPreviewContainer && !videoPreviewContainer.classList.contains('hidden')) {
            videoPreviewContainer.classList.remove('opacity-100');
            setTimeout(() => {
                videoPreviewContainer.classList.add('hidden');
            }, 300);
        }
    }
    
    // Function to fetch video information
    function fetchVideoInfo(url) {
        // In a real implementation, we would call an API to get video information
        // For this demonstration, we'll simulate API response with sample data
        
        // Extract video ID from URL (simple extraction for YouTube)
        let videoId = '';
        
        // YouTube URL formats:
        // - https://www.youtube.com/watch?v=VIDEO_ID
        // - https://youtu.be/VIDEO_ID
        // - https://www.youtube.com/embed/VIDEO_ID
        // - https://www.youtube.com/v/VIDEO_ID
        
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1].split('?')[0];
        } else if (url.includes('youtube.com/v/')) {
            videoId = url.split('youtube.com/v/')[1].split('?')[0];
        }
        
        if (videoId) {
            // YouTube thumbnail URL patterns:
            // - https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg (HD)
            // - https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg (HQ)
            // - https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg (Medium)
            // - https://img.youtube.com/vi/VIDEO_ID/default.jpg (Standard)
            
            // In real implementation, get these details from YouTube API
            // For demo, use sample data with actual thumbnail
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            
            // Simulate API response
            const videoData = {
                title: 'Sample YouTube Video - ' + videoId,
                thumbnail: thumbnailUrl,
                channel: 'Sample Channel',
                duration: '3:45',
                videoId: videoId
            };
            
            // Store video information for later use
            window.currentVideoInfo = videoData;
            
            // Show preview with the data
            showVideoPreview(videoData);
            
            // In real implementation, we would use YouTube Data API
            // Example code (requires API key):
            /*
            fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=YOUR_API_KEY`)
                .then(response => response.json())
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        const videoData = {
                            title: data.items[0].snippet.title,
                            thumbnail: data.items[0].snippet.thumbnails.high.url,
                            channel: data.items[0].snippet.channelTitle,
                            duration: formatDuration(data.items[0].contentDetails.duration),
                            videoId: videoId
                        };
                        window.currentVideoInfo = videoData;
                        showVideoPreview(videoData);
                    }
                })
                .catch(error => console.error('Error fetching video info:', error));
            */
        } else {
            // If video ID couldn't be extracted, hide the preview
            hideVideoPreview();
        }
    }
    
    // Function to format ISO 8601 duration (PT1H23M45S) to readable format (1:23:45)
    function formatDuration(isoDuration) {
        // This would be used with actual YouTube API responses
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';
        
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    }

    /**
     * 初始化主题设置
     */
    function initTheme() {
        // 检查本地存储中的主题偏好
        const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        
        // 应用保存的主题设置
        if (darkModeEnabled) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
        // 更新主题切换按钮的图标
        updateThemeToggleIcon(darkModeEnabled);
    }

    /**
     * 切换暗黑模式
     */
    function toggleDarkMode() {
        const isDarkMode = document.documentElement.classList.toggle('dark-mode');
        
        // 保存主题偏好到本地存储
        localStorage.setItem('darkMode', isDarkMode);
        
        // 更新主题切换按钮的图标
        updateThemeToggleIcon(isDarkMode);
    }

    /**
     * 更新主题切换按钮的图标
     * @param {boolean} isDarkMode - 是否处于暗黑模式
     */
    function updateThemeToggleIcon(isDarkMode) {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            if (isDarkMode) {
                themeToggle.innerHTML = '<i class="fas fa-sun sun-icon"></i>';
                themeToggle.title = '切换到浅色模式';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon moon-icon"></i>';
                themeToggle.title = '切换到暗黑模式';
            }
        }
    }

    /**
     * 显示下载文件夹帮助对话框
     */
    function showDownloadFolderHelp() {
        // 创建对话框遮罩
        const helpDialogOverlay = document.createElement('div');
        helpDialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // 创建对话框容器
        const helpDialog = document.createElement('div');
        helpDialog.className = 'bg-white rounded-xl shadow-md p-6 max-w-md w-full mx-4 relative fade-in';
        
        // 对话框标题
        const helpTitle = document.createElement('h3');
        helpTitle.className = 'text-xl font-semibold mb-4 text-gray-800';
        helpTitle.textContent = '如何找到您的下载文件夹';
        
        // 关闭按钮
        const closeHelpBtn = document.createElement('button');
        closeHelpBtn.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600';
        closeHelpBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeHelpBtn.onclick = () => {
            document.body.removeChild(helpDialogOverlay);
        };
        
        // 帮助内容
        const helpContent = document.createElement('div');
        helpContent.className = 'space-y-4 text-gray-600 text-sm';
        
        // 不同浏览器的说明
        helpContent.innerHTML = `
            <div>
                <h4 class="font-medium text-gray-800 mb-1">在Chrome中:</h4>
                <p>1. 点击浏览器右上角的 ⋮ (菜单) 按钮</p>
                <p>2. 选择 "下载内容"</p>
                <p>3. 点击 "在文件夹中显示"</p>
            </div>
            <div>
                <h4 class="font-medium text-gray-800 mb-1">在Firefox中:</h4>
                <p>1. 点击浏览器右上角的 ☰ (菜单) 按钮</p>
                <p>2. 选择 "下载"</p>
                <p>3. 找到您的文件并点击 "打开所在文件夹"</p>
            </div>
            <div>
                <h4 class="font-medium text-gray-800 mb-1">在Edge中:</h4>
                <p>1. 点击浏览器右上角的 ... (菜单) 按钮</p>
                <p>2. 选择 "下载"</p>
                <p>3. 找到您的文件并点击 "在文件夹中显示"</p>
            </div>
            <div>
                <h4 class="font-medium text-gray-800 mb-1">在Safari中:</h4>
                <p>1. 点击浏览器右上角的 ⌄ (下载) 按钮</p>
                <p>2. 找到您的文件并点击 "在访达中显示"</p>
            </div>
            <div class="pt-2">
                <p class="italic">提示: 大多数浏览器默认将文件保存在系统的 "下载" 文件夹中。</p>
            </div>
        `;
        
        // 确定按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg';
        confirmBtn.textContent = '明白了';
        confirmBtn.onclick = () => {
            document.body.removeChild(helpDialogOverlay);
        };
        
        // 组装对话框
        helpDialog.appendChild(helpTitle);
        helpDialog.appendChild(closeHelpBtn);
        helpDialog.appendChild(helpContent);
        helpDialog.appendChild(confirmBtn);
        
        helpDialogOverlay.appendChild(helpDialog);
        document.body.appendChild(helpDialogOverlay);
        
        // 点击遮罩关闭对话框
        helpDialogOverlay.addEventListener('click', (e) => {
            if (e.target === helpDialogOverlay) {
                document.body.removeChild(helpDialogOverlay);
            }
        });
    }
}); 