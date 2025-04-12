/**
 * ezmp3 多语言支持模块
 */

// 默认语言
let currentLanguage = localStorage.getItem('ezmp3_language') || 'en';

// 语言包
const translations = {
    en: {
        // 通用
        'app_name': 'ezmp3',
        'convert': 'Convert to MP3',
        'download': 'Download MP3',
        'convert_another': 'Convert Another Video',
        
        // 导航
        'nav_home': 'Home',
        'nav_how_to_use': 'How to Use',
        'nav_faq': 'FAQ',
        'nav_contact': 'Contact Us',
        'nav_history': 'Download History',
        
        // 主页
        'hero_title': 'Convert any video to MP3 in seconds',
        'hero_subtitle': 'The fastest and easiest way to convert content from YouTube, Vimeo, and other video platforms to high-quality MP3 files. No registration required, completely free!',
        'paste_url': 'Paste your video URL here:',
        'supported_platforms': 'Supported Platforms:',
        'platforms_note': 'Supports links from most popular video websites, including long and short videos.',
        'restricted_note': 'Does not support age-restricted content and paid content.',
        
        // 转换进程
        'converting': 'Converting... Please wait',
        'conversion_complete': 'Conversion completed!',
        
        // 下载相关
        'file_ready': 'File is ready',
        'quality': 'Quality',
        'download_path': 'File will be downloaded to your default download folder',
        'cancel': 'Cancel',
        'download_and_open': 'Download and Open',
        'downloading': 'Downloading...',
        'file_downloaded': 'File is downloaded',
        'saved_to': 'Saved to',
        'open': 'Open',
        'show_in_folder': 'Show in folder',
        'close': 'Close',
        
        // 音频剪辑
        'trim_audio': 'Audio Trimming (Optional)',
        'start_time': 'Start Time (seconds)',
        'end_time': 'End Time (seconds)',
        'apply_trim': 'Apply Trimming',
        
        // 分享
        'share_with_friends': 'Share ezmp3 with your friends:',
        
        // 设置和历史
        'settings': 'Settings',
        'download_settings': 'Download Settings',
        'prevent_duplicates': 'Prevent Duplicate Downloads',
        'prevent_duplicates_desc': 'Prompt for confirmation when downloading the same file again',
        'auto_open_folder': 'Download and Open Folder',
        'auto_open_folder_desc': 'Automatically open the folder containing the downloaded file',
        'default_quality': 'Default Quality',
        'notification_time': 'Notification Display Time',
        'seconds': 'seconds',
        'reset_default': 'Reset to Default',
        'save_settings': 'Save Settings',
        
        // 下载历史
        'download_history': 'Download History',
        'no_downloads': 'You haven\'t downloaded any files',
        'file_name': 'File Name',
        'download_time': 'Download Time',
        'file_size': 'File Size',
        'download_path_col': 'Download Path',
        'action': 'Action',
        'download_again': 'Download Again',
        'remove': 'Remove',
        'clear_history': 'Clear All History',
        
        // 错误信息
        'invalid_url': 'Please enter a valid video URL',
        'conversion_failed': 'Conversion failed: ',
        'no_file': 'No file to download, please convert a video first',
        'download_in_progress': 'A download is already in progress, please wait',
        
        // 质量描述
        'quality_low': '(Smallest File Size)',
        'quality_medium': '(Recommended Choice)',
        'quality_high': '(High Quality)',
        'quality_ultra': '(Lossless Quality)'
    },
    
    zh: {
        // 通用
        'app_name': 'ezmp3',
        'convert': '转换为MP3',
        'download': '下载MP3',
        'convert_another': '转换另一个视频',
        
        // 导航
        'nav_home': '首页',
        'nav_how_to_use': '使用方法',
        'nav_faq': '常见问题',
        'nav_contact': '联系我们',
        'nav_history': '下载历史',
        
        // 主页
        'hero_title': '几秒钟内将任何视频转换为MP3',
        'hero_subtitle': '将YouTube、Vimeo和其他视频平台的内容转换为高质量MP3文件的最快捷、最简单的方式。无需注册，完全免费！',
        'paste_url': '在此粘贴视频URL：',
        'supported_platforms': '支持的平台：',
        'platforms_note': '支持大多数流行视频网站的链接，包括长视频和短视频。',
        'restricted_note': '不支持年龄限制内容和付费内容。',
        
        // 转换进程
        'converting': '转换中... 请稍候',
        'conversion_complete': '转换完成！',
        
        // 下载相关
        'file_ready': '文件已准备好',
        'quality': '音质',
        'download_path': '文件将下载到您的默认下载文件夹',
        'cancel': '取消',
        'download_and_open': '下载并打开',
        'downloading': '下载中...',
        'file_downloaded': '文件已下载',
        'saved_to': '保存到',
        'open': '打开',
        'show_in_folder': '在文件夹中显示',
        'close': '关闭',
        
        // 音频剪辑
        'trim_audio': '音频剪辑（可选）',
        'start_time': '开始时间（秒）',
        'end_time': '结束时间（秒）',
        'apply_trim': '应用剪辑',
        
        // 分享
        'share_with_friends': '与朋友分享ezmp3：',
        
        // 设置和历史
        'settings': '设置',
        'download_settings': '下载设置',
        'prevent_duplicates': '防止重复下载',
        'prevent_duplicates_desc': '再次下载相同文件时提示确认',
        'auto_open_folder': '下载并打开文件夹',
        'auto_open_folder_desc': '自动打开包含已下载文件的文件夹',
        'default_quality': '默认音质',
        'notification_time': '通知显示时间',
        'seconds': '秒',
        'reset_default': '重置为默认值',
        'save_settings': '保存设置',
        
        // 下载历史
        'download_history': '下载历史',
        'no_downloads': '您尚未下载任何文件',
        'file_name': '文件名',
        'download_time': '下载时间',
        'file_size': '文件大小',
        'download_path_col': '下载路径',
        'action': '操作',
        'download_again': '再次下载',
        'remove': '删除',
        'clear_history': '清空所有历史记录',
        
        // 错误信息
        'invalid_url': '请输入有效的视频URL',
        'conversion_failed': '转换失败: ',
        'no_file': '没有可下载的文件，请先转换视频',
        'download_in_progress': '下载正在进行中，请等待当前下载完成',
        
        // 质量描述
        'quality_low': '（最小文件大小）',
        'quality_medium': '（推荐选择）',
        'quality_high': '（高质量）',
        'quality_ultra': '（无损质量）'
    }
};

/**
 * 获取指定键的翻译文本
 * @param {string} key - 翻译键
 * @param {Object} params - 替换参数对象 (可选)
 * @returns {string} 翻译后的文本
 */
function getTranslation(key, params = {}) {
    // 获取对应语言的翻译
    const text = translations[currentLanguage][key] || translations['en'][key] || key;
    
    // 如果有替换参数，进行文本替换
    if (Object.keys(params).length > 0) {
        return Object.keys(params).reduce((result, paramKey) => {
            return result.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
        }, text);
    }
    
    return text;
}

/**
 * 切换语言
 * @param {string} lang - 语言代码
 */
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('ezmp3_language', lang);
        
        // 更新页面上的文本
        updatePageTranslations();
        
        // 更新语言选择器显示
        const currentLangElem = document.querySelector('.current-lang');
        if (currentLangElem) {
            currentLangElem.textContent = lang === 'en' ? 'English' : '中文';
        }
    }
}

/**
 * 更新页面上的所有翻译文本
 */
function updatePageTranslations() {
    // 更新页面标题
    document.title = `${getTranslation('app_name')} - Free Video to MP3 Online Converter | Download MP3 Audio`;
    
    // 更新所有标记有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        if (key) {
            // 如果是输入框元素
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = getTranslation(key);
            }
            // 如果是按钮或其他元素
            else {
                element.textContent = getTranslation(key);
            }
        }
    });
}

/**
 * 在页面加载时初始化语言
 */
function initLanguage() {
    // 设置初始语言
    const savedLang = localStorage.getItem('ezmp3_language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    }
    
    // 绑定语言选择器事件
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // 更新语言选择器显示
    const currentLangElem = document.querySelector('.current-lang');
    if (currentLangElem) {
        currentLangElem.textContent = currentLanguage === 'en' ? 'English' : '中文';
    }
    
    // 初始应用翻译
    updatePageTranslations();
}

// 页面加载时初始化语言
document.addEventListener('DOMContentLoaded', initLanguage);

// 导出到全局对象
window.ezmp3I18n = {
    getTranslation,
    setLanguage,
    getCurrentLanguage: () => currentLanguage
}; 