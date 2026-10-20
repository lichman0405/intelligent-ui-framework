# 插件、资源与适配器

[English](../en/PLUGINS_ADAPTERS.md) · [目录](README.md) · [完整示例](../examples/OptionalApp.tsx)

## 1. 注册表选择

| 注册方式 | Artifact 签名 | 组件数 |
| --- | --- | --- |
| 默认 coreRegistry | core@0.1.0 | 51 |
| mode="trusted-extras" 或 trustedRegistry | core-trusted@0.1.0 | 52 |
| upstreamRegistry 或 createUpstreamRegistration | upstream@0.1.0 | 55 |
| 自定义 createIuiRegistry | Host 定义的新 ID／版本 | 取决于定义 |

Artifact 不能自行提升权限；注册是可信应用代码。`createArtifact(source,id,state,{libraryId,libraryVersion})` 只创建声明，不会让 Renderer 自动加载该库。使用完整库还需要匹配的 Prompt。

## 2. 地图

```sh
npm install --ignore-scripts maplibre-gl@6.13.0
```

```tsx
import { createUpstreamRegistration } from "@intelligent-ui/framework/plugins/upstream";
import { createIuiRegistry } from "@intelligent-ui/framework/react";
import "@intelligent-ui/framework/styles.css";
import "@intelligent-ui/framework/plugins/map/styles.css";
const registration = createUpstreamRegistration({ map: { basemap: "blank", maxMarkers: 500 } });
const registry = createIuiRegistry(registration);
```

`OptionalApp.tsx` 包含 Artifact 和渲染调用。地理 Map 支持标记、分类筛选、选择绑定、适配视角、缩放、展开和路线。默认 blank 底图不请求远端地图；启用 `basemap:"openfreemap"` 才请求公共矢量瓦片／字体，并可回退到 Esri 栅格。生产部署可以配置自有 `style`／`fallbackStyle`（对象或 `(dark)=>style`）。这些配置不能来自模型。

| MapPluginOptions | 含义 |
| --- | --- |
| basemap | blank（默认）或 openfreemap |
| style / fallbackStyle | 自定义 MapLibre 样式，支持深浅主题函数 |
| workerUrl | 自定义 worker 资源 URL；默认使用包内资源 |
| maxMarkers | 默认 500，上限 2000 |

包包含 same-origin worker；Vite 验收已覆盖资源重写。其他打包器、Electron 自定义协议和 CSP 需要实际验收；必要时明确托管 worker 并传入 workerUrl。不能将 worker 返回成 SPA 的 index.html。地图 CSS 必须单独导入。WebGL 不可用时提供可选择地点列表。

Host `resolveRoute` 输入输出均为 `[latitude,longitude]`。无 resolver 或请求失败时显示直线概览；不要当作导航结果。插件接收 2–20,000 个合法返回点；公共 OSRM 适配器只接受 2–25 个输入地点。

## 3. HtmlView

```tsx
import { createHtmlPlugin } from "@intelligent-ui/framework/plugins/html";
// 用 createIuiLibrary({id:"my-ui",plugins:[createHtmlPlugin()]}) 注册；详见开发章节。
```

签名 `HtmlView(html,height?,title?)`；流式结束后运行。iframe 仅允许 `allow-scripts`，不允许同源、表单、弹窗、顶层导航、子 iframe 或 Host／IPC 通道。默认 CSP 禁止 fetch、XHR、WebSocket 和外部资源；允许内联脚本、canvas 与动画，不允许 unsafe-eval。

| HtmlPluginOptions | 含义 |
| --- | --- |
| scriptOrigins / styleOrigins / imageOrigins / fontOrigins | 可选精确 HTTPS origin；不能包含路径、凭据或通配符 |
| maxHtmlBytes | 默认 131072，上限 262144 |

固定和自动高度限定 80–2400px。自动高度消息只接受实际 frame 的 `origin="null"`，不转为业务事件。主题变更会更新 srcdoc，HTML 内部 JS 状态可能重置；它不是业务状态持久化组件。

**父页面 CSP 必需。** sandbox 本身不阻止 iframe 导航自身的浏览上下文。Demo 使用：

```html
<meta http-equiv="Content-Security-Policy"
  content="frame-src 'self' https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'">
```

这是 frame 约束示例，不是完整生产 CSP；合并进 Desktop 自有策略。无需 YouTube 时删去其 origin。Electron 保持 nodeIntegration 关闭、contextIsolation 开启，不给生成页面注入高权限 preload。CPU 密集脚本仍可能占用渲染线程。

## 4. 图片和路线服务

```ts
import { createWebResolvers } from "@intelligent-ui/framework/adapters";
const web = createWebResolvers({ timeoutMs: 10000, maxConcurrent: 4 });
const hostAdapter = { ...web };
```

仅创建对象不会联网；实际调用时才请求。Wikipedia 精确文章 → media-list → 搜索 → Commons 位图回退。拒绝非 HTTPS、带凭据、SVG／部分 logo 等结果。公开图片的授权与署名由应用处理。失败显示占位；不保证总能检索到图像。

WebResolverOptions：`fetch` 可注入；`wikipediaOrigin`、`commonsOrigin`、`routeOrigin` 为精确 HTTPS origin；默认超时 10 秒、并发 4、响应 2 MiB（上限 8 MiB）、cacheEntries 32（上限 256）。请求不带凭据、拒绝重定向、按流读取并检查大小；缓存返回防御性副本。公开服务的连通性、CORS、限流需要目标环境验证。`onDispose` 中止对应上下文的请求并停止图片回退。私有结果不要放入共享的公共结果 resolver 缓存。

## 5. 浏览器端口

```ts
import { createBrowserPorts } from "@intelligent-ui/framework/adapters";
const ports = createBrowserPorts({
  allowUrl: url => url.hostname === "example.org",
  open: url => { window.open(url, "_blank", "noopener,noreferrer"); },
  writeText: text => navigator.clipboard.writeText(text),
});
```

Host 必须明确导航策略和实现；剪贴板仍受用户激活／安全上下文约束，超长文本被拒绝。Desktop 可替换为窄原生能力，不应把整个 Electron 或 IPC 对象交给组件。
