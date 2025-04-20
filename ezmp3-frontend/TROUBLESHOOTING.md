# EZMP3 项目问题排查指南

## 已修复的问题

### 前端 URL 验证问题

我们已经修复了前端的 URL 验证问题，该问题导致了以下错误：
```
Uncaught TypeError: Failed to construct 'URL': Invalid URL
```

修复内容包括：

1. 增强 `safeURL()` 函数的验证逻辑：
   - 在尝试构造 URL 对象前检查 URL 是否为空或格式无效
   - 验证 URL 是否为 YouTube 链接
   - 更清晰的错误提示

2. 增强按钮禁用条件：
   - 禁用按钮当 URL 为空或不以 "http" 开头

3. 在 `handleConvert()` 函数开始添加额外验证：
   - 在调用 `safeURL()` 前先进行基本验证
   - 如果 URL 无效，显示错误消息并提前返回

## 待验证问题

以下问题需要在部署后继续验证：

### 1. Supabase Edge Function 调用

如果前端 URL 验证通过但转换仍不工作，可能是 Edge Function 存在问题。请检查：

- Edge Function 是否成功部署
- 浏览器控制台是否有 API 调用相关错误
- Supabase 控制台中是否有 Edge Function 的调用日志

可以使用以下命令直接测试 Edge Function：

```bash
curl -X POST https://你的-supabase-id.functions.supabase.co/convert-video \
  -H "Authorization: Bearer 匿名key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ", "quality": 192}'
```

### 2. 环境变量配置

确保 Vercel 部署中正确设置了以下环境变量：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

这些值应与 Supabase 控制台中显示的一致。

### 3. Vercel 部署配置

确认 Vercel 的部署配置：

- Root Directory: `ezmp3-frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

## 后续排查步骤

如果上述修复后仍有问题，请收集以下信息进行进一步排查：

1. 浏览器控制台中的任何错误信息
2. 网络请求选项卡中 API 调用的详细信息
3. Supabase Edge Function 的日志
4. Edge Function 的具体实现代码

## 参考资料

- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [Vercel 部署 Vite 应用文档](https://vercel.com/guides/deploying-vite-with-vercel)
- [React + TypeScript 最佳实践](https://react-typescript-cheatsheet.netlify.app/) 