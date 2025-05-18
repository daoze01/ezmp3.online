# ezMP3 - YouTube视频转MP3工具

## 项目概述
ezMP3是一个基于Flask的Web应用，允许用户从YouTube视频中提取音频并转换为MP3格式。用户可以通过提供YouTube视频链接，下载视频并将其转换为高质量的MP3文件，无需注册，完全免费。

## 目录结构
```
ezmp3/
├── .git/                 # Git版本控制
├── src/                  # 源代码目录
│   ├── __init__.py       # Python包标识
│   ├── main.py           # Flask应用主文件
│   ├── __pycache__/      # Python编译缓存
│   ├── templates/        # HTML模板
│   │   ├── base.html     # 基础模板
│   │   ├── batch.html    # 批量处理页面
│   │   ├── convert.html  # 转换页面
│   │   ├── download.html # 下载页面
│   │   └── index.html    # 主页
│   ├── static/           # 静态资源
│   │   ├── css/          # CSS样式
│   │   ├── js/           # JavaScript文件
│   │   ├── images/       # 图像资源
│   │   ├── temp/         # 临时文件
│   │   └── index.html    # 静态页面入口
│   ├── routes/           # 路由定义
│   │   ├── api.py        # API路由
│   │   └── user.py       # 用户相关路由
│   └── models/           # 数据模型
│       └── user.py       # 用户模型
├── requirements.txt      # 项目依赖
└── vercel.json           # Vercel部署配置
```

## 主要功能
1. **视频信息获取**：获取YouTube视频的标题、时长、缩略图等信息
2. **视频下载**：支持多种格式下载YouTube视频
3. **MP3转换**：将视频文件转换为不同质量的MP3音频
4. **文件上传**：支持本地视频文件上传并转换
5. **批量处理**：一次性处理多个视频链接
6. **临时文件管理**：自动清理24小时前的临时文件

## 技术栈
- **后端框架**：Flask 3.1.0
- **视频处理**：yt-dlp 2025.4.30
- **音频转换**：ffmpeg-python 0.2.0
- **跨域支持**：flask-cors 6.0.0
- **部署环境**：Vercel

## API接口
- `/api/info` - 获取视频信息
- `/api/download` - 下载视频
- `/api/convert` - 转换为MP3
- `/api/upload` - 上传文件
- `/api/batch` - 批量处理
- `/api/file/<file_id>/<filename>` - 获取文件

## 页面路由
- `/` - 主页
- `/download` - 下载页面
- `/convert` - 转换页面
- `/batch` - 批量处理页面
- `/tutorials` - 教程页面
- `/faq` - 常见问题
- `/blog` - 博客页面
- `/about` - 关于我们
- `/contact` - 联系我们
- `/privacy-policy` - 隐私政策
- `/terms-of-service` - 服务条款

## 部署信息
项目使用Vercel进行部署，配置在vercel.json文件中定义。入口文件为src/main.py。

## 版本历史
- **v2.0** - 完全重构为Flask应用（当前版本）
- **v0.9** - 早期Next.js版本（已归档）

## 未来计划
- 添加更多视频源支持
- 改进音频转换质量
- 实现用户账户系统
- 添加历史记录功能
- 优化移动端体验 