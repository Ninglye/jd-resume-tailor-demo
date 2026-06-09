# AI 简历定制 Demo

这是一个面向个人求职场景的 AI 简历定制工具公开演示版。用户可以维护自己的经历素材库，粘贴目标岗位 JD，系统会用 mock workflow 展示 JD 解析、经历匹配、经历润色和定制简历生成流程。

## 项目背景

真实项目目标是帮助用户把已有经历更自然地表达成适合目标岗位的简历内容。公开 demo 版本用于展示产品流程和交互，不连接真实 AI 服务，也不消耗任何 API 余额。

## 核心功能

- 经历素材库：新增、编辑、删除和查看经历。
- JD 管理：保存目标公司、岗位、方向和完整 JD。
- Mock AI workflow：解析 JD、匹配经历、润色经历、生成简历草稿。
- 结果管理：查看历史 JD 和最近一次生成结果。
- 复制功能：复制完整简历或单个模块。
- 示例数据：一键加载示例经历、示例 JD，并生成 mock 简历结果。

## 技术栈

- React
- TypeScript
- Vite
- localStorage
- Vercel 静态部署

## 为什么公开 demo 默认使用 mock

公开链接面向任何访问者，如果直接连接真实 AI API，会带来 API key 泄露和余额消耗风险。因此本 demo 默认只使用前端 mock workflow：

- 不读取 DeepSeek API key
- 不请求本地后端
- 不请求 `localhost:3001`
- 不需要数据库或登录系统
- 可以安全部署到 Vercel 公开展示

私有本地版本可以保留 DeepSeek API 后端代理；公开 demo 版本只展示产品体验。

## 本地运行

安装依赖：

```bash
npm install
```

启动前端：

```bash
npm run dev
```

构建：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## 环境变量

公开 demo 不需要配置环境变量。仓库中不要提交 `.env`。

`.env.example` 仅保留前端开关示例：

```env
VITE_USE_REAL_AI=false
VITE_API_BASE_URL=
```

当 `VITE_API_BASE_URL` 为空时，应用不会请求真实 AI 后端，所有 AI workflow 都使用 mock。

## 部署到 Vercel

1. 将 demo 副本推送到 GitHub。
2. 在 Vercel 新建项目并选择该仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```bash
dist
```

6. 不配置 `VITE_API_BASE_URL`，保持公开 demo 为 mock 模式。

部署后，访问公开链接即可通过顶部按钮加载示例数据并体验完整流程。
