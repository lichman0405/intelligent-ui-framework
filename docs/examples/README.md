# Shared examples / 共用示例

These complete React modules are used by both language handbooks. Copy one into the consumer's `src/App.tsx`; retain its imports. `CustomPlugin.tsx` additionally exports a custom library/spec. No example invokes a scientific engine or proves that a planned domain widget already exists.

这些完整 React 模块由中英文手册共用。任选一个复制到消费者的 `src/App.tsx`，保留导入。`CustomPlugin.tsx` 还导出自定义库和规格。示例不会运行科学计算引擎，也不代表路线图中的领域组件已经实现。

| File / 文件 | Purpose / 用途 |
| --- | --- |
| [BasicApp.tsx](BasicApp.tsx) | Slider, reactive text and Host action / 滑块、响应式文本与 Host 事件 |
| [StreamingState.tsx](StreamingState.tsx) | Mock deltas, cancellation and memory state restore / 分块、取消、内存状态恢复 |
| [ToolApp.tsx](ToolApp.tsx) | Named mock Query and explicitly run Mutation / 命名 Mock 查询与显式执行修改 |
| [CustomPlugin.tsx](CustomPlugin.tsx) | Component/function/action extension / 组件、函数、动作扩展 |
| [OptionalApp.tsx](OptionalApp.tsx) | Explicit map/HTML registration and optional web resolvers / 地图、HTML 注册和可选网络适配 |

Base dependencies / 基础依赖：React 19, React DOM 19, Zod 3.25.76 or 4, local framework tarball. OptionalApp needs `maplibre-gl@6.13.0`. Custom definitions use the official `@openuidev/react-lang@1.0.0` API and `zod/v4`; declare that SDK directly in your project if you import it directly.

基础示例不需要模型密钥。`OptionalApp` 使用的 OSRM resolver 会在地图完整渲染后请求公开服务；移除 `resolvers` 即可关闭。HTML 需要宿主父页面 CSP，见插件章节。

Basic examples need no model key. OptionalApp's OSRM resolver requests a public service after the map completes; omit `resolvers` to disable that capability. HTML requires a parent-page CSP, documented in the plugin chapter.
