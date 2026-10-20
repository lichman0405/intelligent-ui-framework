# 快速开始

[English](../en/QUICKSTART.md) · [目录](README.md)

## 1. 前提与安装方式

使用 React 19、ESM 和支持 CSS 导入的构建工具。项目构建所用 Node 最低已验证版本为 22.12.0。现有验收使用 Vite；不要根据本手册推断 React 18、CommonJS 或所有 SSR 平台已受支持。

包通过本地 tarball 交付，尚未发布到 npm registry。将文件复制到消费者项目 `vendor/`：

```sh
npm install --ignore-scripts ./vendor/intelligent-ui-framework-0.2.0.tgz react@19 react-dom@19 zod@4
```

已使用 Zod 3.25.76 的项目可以保留该版本，因为它提供 `zod/v4` 子路径。自定义组件仍使用 v4 schema；不能把 v3 schema 对象传入需要 v4 schema 的定义。`--ignore-scripts` 避免依赖安装脚本；依赖的安装遥测也可通过 `OPENUI_TELEMETRY_DISABLED=1` 关闭。

## 2. 从空 React 项目启动

如果已有 React 19 项目，跳过创建步骤。以下创建命令需要联网下载 Vite 模板，并不是 Framework 的运行服务：

```sh
npm create vite@7 iui-consumer -- --template react-ts
cd iui-consumer
npm install
```

复制 tarball 到 `vendor/` 并执行上面的包安装命令。将 [BasicApp.tsx](../examples/BasicApp.tsx) 完整复制为 `src/App.tsx`。模板的 `src/main.tsx` 保留以下入口即可：

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
```

移除模板 `App.css`／`index.css` 中用于演示的居中、固定宽度等规则，避免影响布局。Framework 不需要模板样式。运行：

```sh
npm run dev
```

验收：滑块改变 `Selected` 文本；点击 Continue，页面日志出现 `continue_conversation`，携带表单状态及 Host 上下文；没有模型请求。

## 3. 最小接入含义

```tsx
import { IntelligentUIRenderer, createArtifact } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";
const artifact = createArtifact('root = Text("Hello")', "message-1");
// 在 React render 中使用：
<IntelligentUIRenderer artifact={artifact} hostSessionId="session-1" hostTurnId="turn-1" />;
```

`artifact.source` 是 OpenUI Lang 文本，不是 JSX、HTML 或任意 JavaScript。协议外壳是 JSON。不要将 Markdown 代码块自动当作可执行 UI。`artifactId`、会话和轮次由可信 Host 决定。

## 4. 运行交付源码中的完整 Demo

在独立 Framework 仓库根目录执行：

```sh
npm ci --ignore-scripts
npm run build
npm run demo
```

打开 `http://127.0.0.1:5173`。默认页包含 16 个框架示例；Original gallery 链接进入 45 个原项目程序。可测试主题、源码编辑、Mock 流式、状态保存恢复、Query/Mutation。图片／路线与公共底图有独立启用开关。

Demo 和构建脚本属于源码交付；仅安装 npm 包不会把它们复制到消费者项目。不要在消费者目录运行 Framework 仓库的 npm scripts。

## 5. 按需选择完整示例

- [StreamingState](../examples/StreamingState.tsx)：无需模型的分块、取消、保存和恢复。
- [ToolApp](../examples/ToolApp.tsx)：查询自动加载；点击按钮才执行 Mock Mutation。
- [CustomPlugin](../examples/CustomPlugin.tsx)：定义并注册自有组件、函数、动作。
- [OptionalApp](../examples/OptionalApp.tsx)：完整库、地图与 HTML；需要额外地图依赖和父页面 CSP。

这些是教学模块，Mock 工具不代表 Desktop 权限策略。接入真实服务前继续阅读 [Host 接入](HOST_INTEGRATION.md)。
