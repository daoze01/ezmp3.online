# ezmp3 部署指南

本文档提供了将 ezmp3 项目部署到生产环境的详细步骤。

## 系统要求

- Node.js v14+ (推荐 v16 或更高版本)
- NPM v6+ 或 Yarn v1.22+
- 足够的磁盘空间用于存储临时文件和转换后的音频文件 (推荐至少 1GB)
- 支持 HTTPS 的网络服务器 (如 Nginx, Apache)

## 前端部署

ezmp3 前端是一个静态网站，可以部署在任何支持静态文件托管的服务上，如 Netlify、Vercel、GitHub Pages 或传统的服务器。

### 部署到传统服务器

1. 将所有前端文件上传到您的服务器：
   ```
   scp -r index.html css/ js/ images/ user@your-server:/path/to/webroot/
   ```

2. 配置您的 Web 服务器指向正确的目录。

   对于 Nginx，示例配置：
   ```nginx
   server {
       listen 80;
       server_name ezmp3.yourdomain.com;
       root /path/to/webroot;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # 如果您的后端运行在同一服务器上
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. 设置 HTTPS (强烈推荐)：
   - 使用 Let's Encrypt 获取免费的 SSL 证书
   - 配置 Nginx/Apache 以使用 HTTPS

### 部署到静态托管服务

1. **Netlify/Vercel**：连接您的 Git 仓库，或直接上传构建文件夹。
   - 确保配置环境变量以指向您的后端 API

2. **GitHub Pages**：将代码推送到 GitHub 仓库，启用 GitHub Pages。

## 后端部署

后端服务需要一个支持 Node.js 的服务器或云服务。

### 传统服务器部署

1. 将后端代码上传到服务器：
   ```
   scp -r server/ user@your-server:/path/to/backend/
   ```

2. 在服务器上安装依赖：
   ```
   cd /path/to/backend
   npm install --production
   ```

3. 创建环境变量文件：
   ```
   cp .env.example .env
   nano .env  # 编辑配置
   ```

4. 使用进程管理器（如 PM2）运行应用：
   ```
   npm install -g pm2
   pm2 start server.js --name ezmp3-api
   pm2 save
   pm2 startup  # 设置开机自启
   ```

5. 确保服务器防火墙允许您选择的端口（默认 3000）。

### 云服务部署

1. **Heroku**：
   - 创建 `Procfile`：`web: node server.js`
   - 设置环境变量
   - 推送代码到 Heroku

2. **AWS Elastic Beanstalk**：
   - 准备部署包
   - 上传到 Elastic Beanstalk
   - 配置环境变量

3. **Google Cloud Run**：
   - 创建 Dockerfile
   - 构建并推送 Docker 镜像
   - 部署到 Cloud Run

## 配置前后端通信

1. 在前端代码的 `js/api.js` 文件中更新后端 API 地址：
   ```javascript
   const API_BASE_URL = 'https://api.ezmp3.yourdomain.com'; // 更改为您的API地址
   ```

2. 在后端的 `.env` 文件中更新 CORS 设置，允许您的前端域名：
   ```
   ALLOWED_ORIGINS=https://ezmp3.yourdomain.com
   ```

## 维护注意事项

1. **磁盘空间监控**：定期检查服务器存储空间，尤其是 `/server/output` 目录。
   - 后端服务有自动清理机制，但仍建议设置服务器级别的监控。

2. **性能监控**：在高负载情况下监控服务器性能，需要时考虑扩展资源。

3. **安全更新**：定期更新依赖包以修复潜在的安全漏洞：
   ```
   npm audit fix
   ```

4. **备份**：定期备份重要的配置文件和数据。

## 故障排除

1. **视频转换失败**：
   - 检查 `ffmpeg` 是否正确安装
   - 确认服务器有足够的内存和CPU资源
   - 检查服务器日志以获取详细错误信息

2. **API请求失败**：
   - 验证CORS设置是否正确
   - 检查网络连接和防火墙规则
   - 确认API服务正在运行

3. **高负载问题**：
   - 考虑实现请求队列系统
   - 限制并发转换数量
   - 增加服务器资源或实现负载均衡

## 联系支持

如果您在部署过程中遇到问题，请联系我们的技术支持团队：
- 电子邮件：support@ezmp3.yourdomain.com
- 问题跟踪：https://github.com/yourusername/ezmp3/issues 