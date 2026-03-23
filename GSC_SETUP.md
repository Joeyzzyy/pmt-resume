# GSC 数据同步配置指南

## 1. 申请 GSC API 访问权限

### 1.1 创建 Google Cloud 项目
1. 访问 https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 "Google Search Console API"

### 1.2 创建服务账号
1. 进入 "IAM 和管理" → "服务账号"
2. 点击 "创建服务账号"
3. 填写名称和描述
4. 角色选择 "Search Console 数据查看者"
5. 创建密钥（JSON 格式），下载保存

### 1.3 添加 GSC 权限
1. 访问 https://search.google.com/search-console
2. 选择网站 maidinhk.com
3. 设置 → 用户和权限
4. 添加服务账号邮箱（在 JSON 文件中的 `client_email`）
5. 权限选择 "完整"

## 2. 配置环境变量

将下载的 JSON 密钥文件重命名为 `gsc-key.json`，放在项目根目录。

添加到 `.env.local`：

```bash
# GSC 配置
GSC_SITE_URL=sc-domain:maidinhk.com
GSC_KEY_PATH=./gsc-key.json

# Cron 密钥（用于验证定时任务）
CRON_SECRET=your_random_secret_key_here
```

## 3. 安装依赖

```bash
npm install googleapis
```

## 4. 更新同步脚本

修改 `src/app/api/cron/sync-gsc/route.ts`，取消注释 GSC API 调用代码。

## 5. 部署到 Vercel

### 5.1 上传密钥文件
在 Vercel Dashboard → Project Settings → Environment Variables 中：
- 上传 `gsc-key.json` 内容作为环境变量，或
- 将文件内容转为 Base64 存储，运行时解码

### 5.2 配置 Cron 任务
`vercel.json` 已配置，会自动创建定时任务。

### 5.3 测试同步
```
https://your-domain.com/api/cron/sync-gsc?secret=your_cron_secret
```

## 6. 监控同步状态

数据管理大师页面底部会显示：
- 最新数据日期
- 上次同步时间
- 近7天数据覆盖情况
- 同步健康状态

## 常见问题

**Q: GSC 数据为什么有延迟？**
A: GSC API 数据通常滞后 1-3 天，这是正常现象。

**Q: 同步失败怎么办？**
A: 检查：
1. 服务账号是否有 GSC 权限
2. API 是否已启用
3. 密钥文件路径是否正确
4. Vercel 日志查看具体错误

**Q: 可以手动触发同步吗？**
A: 可以，访问 `/api/cron/sync-gsc` 即可手动触发。
