# 部署、主题、诊断与交付

[English](../en/DEPLOYMENT_TROUBLESHOOTING.md) · [目录](README.md)

## 1. 已验证环境与资源

| 项目 | 当前范围 |
| --- | --- |
| 运行／构建 | 原生 Windows；Node 22.12.0 与 26.7.0 |
| 前端 | React／React DOM 19.2.3；Vite 生产消费者 |
| schema | Zod 3.25.76、4.4.3；组件使用 zod/v4 |
| 模块 | ESM；CommonJS require 不导出 |
| SSR | 公开模块导入和 renderToString smoke；不等同于全部服务端框架 hydration 验收 |
| 浏览器 | 已记录 Chrome 155；Electron／其它浏览器需单独验收 |

显式导入 styles.css；构建产物包括 KaTeX 字体。地图另需地图 CSS、MapLibre peer 和包内 worker。检查资源的 MIME、路径、CSP 和离线可用性。核心安装无需 MapLibre；只有地图路径需要加载它。

完整注册表保留组件、KaTeX、动态图标等能力，Demo 有大 chunk 警告。当前没有全面性能基准或截图差异基线；不要用“能构建”代替低内存、大数据或生产性能验收。

## 2. 主题

```tsx
<IntelligentUIRenderer artifact={artifact} theme="dark" themeTokens={{
  "--iui-chart-1": "#3d9dff",
  "--iui-focus": "#6cb6ff",
  "--iui-font": "system-ui, sans-serif",
}} />;
```

themeTokens 仅接受 `--iui-*` 键；资源 URL、分号／花括号等值被过滤。token 只作用于 `.iui-root`。不要假设 Framework 会设置 Desktop 的全局背景或主题。

常用 token：canvas／ink／muted／faint／border／focus／surface，success／warning／danger，chart-1 至 chart-6，font／mono，space-tight／inner／group／group-lg／section，radius-sm／md／lg／xl／2xl。颜色、长度、间距 prop 的合法类型在组件参考 schema；组件 padding/gap 的数值通常采用 4px 步长。完整默认 token 来自 src/react/components/theme.css。

## 3. 诊断与失败策略

`onError` 返回 Diagnostic[]，字段为 code/message/path?；不要按英文 message 文本判断业务。部分代码来自官方解析器，集合会随 SDK 演进。原始源码可能含用户数据，日志需按 Host 的隐私策略处理。

| code | 含义与处理 |
| --- | --- |
| invalid-json / json-limit | 非有限 JSON／原型／访问器／深度节点或字节超限；不要继续执行 |
| invalid-state / invalid-artifact / unknown-field | 状态或 envelope 格式错误；修正生产方 schema |
| unsupported-protocol / unsupported-library / invalid-version | 协议或库不匹配；选择正确注册或显式迁移 |
| invalid-source / source-limit / invalid-metadata | 源码／元信息格式或大小错误 |
| empty-source / incomplete-source | 流式结束后没有完整源码或仍有未解析引用 |
| parse-failed / render-error | 解析异常或组件异常；展示 fallback 并记录脱敏诊断 |
| host-action-error / host-state-error | Host 动作或状态回调失败；检查权限、实现与参数 |
| 其它解析／Query／Mutation 诊断 | 以 code 分类；数据源错误可以留在视图中，Host 决定重试 |

默认总 JSON 1 MiB；源码 256 KiB；状态 256 KiB；深度 32；节点 30,000。工具默认 100 次／4 并发／30 秒，结果 256 KiB／30,000 节点。二者预算不同。大结果应做分页或外部引用，不能只无限提高预算。

## 4. 常见问题

| 现象 | 排查 |
| --- | --- |
| fallback／未知组件 | 检查 libraryId/version、registry、Prompt 和最终语法 |
| 每个 chunk 都重置 | 固定 ID、React key、Host、registry、toolOptions；传累计文本 |
| 恢复不起作用 | 保留 `$` 键；在首次挂载前提供 state，恢复时显式 remount |
| 工具没有执行 | allowedTools 与 invokeTool 均要提供；Mutation 要显式 @Run |
| 工具重复／超时 | Host 持久化幂等；超时不等于远端未执行；清理底层请求 |
| 图片空白 | resolver／授权／CORS／图片 origin／服务失败；占位可能是预期行为 |
| 地图空白底色 | 默认 blank 是预期；需要地图 CSS、peer、worker、WebGL，显式启用底图 |
| HTML 不运行 | 是否已注册、是否仍在 streaming、父子 CSP 是否正确 |
| 模块找不到／Hooks 错误 | 使用公共 ESM 路径，核对 React 单实例、peer 和可选依赖 |
| Zod／GeoJSON 类型错误 | 使用支持 zod/v4 的版本；保持包内 GeoJSON 引用及依赖，勿复制不完整 d.ts |
| 离线环境失败 | 检查字体／worker／瓦片／图片资源，替换公开服务为 Host 本地能力 |

## 5. 从源码构建与重新验收

```sh
npm ci --ignore-scripts
npm run typecheck
npm run build
npm test
npm run demo:build
npm pack --ignore-scripts --pack-destination artifacts --json
npm run verify:consumers -- --both
npm run verify:browser
npm run verify:upstream-browser
npm run bench:fixtures
```

先创建 artifacts 目录。pack 使用 ignore-scripts 是因为前面已显式 build，可避免 prepack 日志混进 JSON。浏览器脚本需要本机 Chrome／Edge 路径（IUI_BROWSER_PATH）；报告只认证实际运行的浏览器。换了包内容或 tarball hash 就需要新的验收记录，不能套用旧 SHA 的结果。

## 6. 本次文档交付与原始证据

本次增加双语手册，不修改 0.2.0 运行时代码或已验收 tgz。原始 tarball SHA-256：

```text
16b333dcdbe2f0c071114ed9e078fe1498d276af8665c70b0ec22112249fdc15
```

交付压缩包包含：tgz、docs 双语目录与共用示例、许可证和基线证据。源码仓库另行交接。tarball 内仍保留发布时的文档，新版双语手册以压缩包和当前仓库 docs 为准；不要误称旧 tgz 已含新手册。文档检查报告与历史运行时验收报告分开。

原始 artifacts 被 Git 忽略，只发 Git 源码不会带上 tgz 和证据。交接时核对文件清单／哈希、双方契约、可选资源和已知限制。生产上线前补目标 Desktop 的真实模型／工具／权限／持久化／离线资源闭环。未来原生科学 UI 的阶段与门槛见[路线图](ROADMAP.md)。
