# 03 — Framework ⇄ Host 公共契约草案（UIArtifactV1）

日期：2026-10-19  
状态：**建议的初版 contract / RFC**，并非上游 OpenUI 或 MiQroForge 已存在的正式 API。A 必须在 F0 实现并通过测试；B 可以基于此 Mock 并行开发。冻结后如需 breaking change，双方通过协议版本显式演进。

## 1. 分层与设计原则

- **Wire Contract**：跨 Agent、IPC、存储、UI 传输的 JSON 结构，**完全无 React / Zod 实例 / 函数引用**。
- **Framework API**：负责解析、渲染、组件状态、错误回调、Host 调用适配，不决定模型和工具策略。
- **Host Adapter**：负责消息格式转换、允许哪些工具调用、存储、IPC、鉴权、审批、重试和审计。
- **OpenUI Lang** 是 UI 源码，并不代表 JSON schema；JSON 契约只是包裹这段源码及关联元数据。

## 2. 建议的公共 TypeScript DTO

```ts
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface UIArtifactV1 {
  kind: "intelligent_ui";
  protocolVersion: "1.0";
  artifactId: string;               // 同一消息中的唯一稳定 ID
  language: "openui-lang";
  libraryId: string;                // 所需组件库身份，例如 core
  libraryVersion: string;           // 完整语义化版本，用于兼容性判定
  source: string;                   // OpenUI Lang 1.0 文本；不能是任意 JS
  state?: Record<string, JSONValue>;// 可序列化 UI field state
  metadata?: {
    title?: string;
    provenance?: string;            // 来源摘要，不含凭据
  };
}

export interface UIActionContext {
  artifactId: string;
  hostSessionId?: string;  // 内存上下文，非 Artifact 固有字段
  hostTurnId?: string;
}

export type UIHostAction =
  | { kind: "continue_conversation"; message: string; formState?: Record<string, JSONValue> }
  | { kind: "custom_action"; name: string; params: Record<string, JSONValue> };

export interface UIHostAdapter {
  onAction?(action: UIHostAction, ctx: UIActionContext): void | Promise<void>;
  onStateChange?(state: Record<string, JSONValue>, ctx: UIActionContext): void;
  invokeTool?(
    name: string,
    args: Record<string, JSONValue>,
    ctx: UIActionContext
  ): Promise<JSONValue>;
  openUrl?(url: string, ctx: UIActionContext): void | Promise<void>;
  copyText?(text: string, ctx: UIActionContext): Promise<boolean>;
  // 图片/路线等可选 data resolvers 由 Framework 自己定义严格返回类型。
}
```

**这是接口草案，不是照搬 `@openuidev/react-lang` 的 exact types。** A 要负责将其映射至真实的 `Renderer` props/`toolProvider`，包括实际的 ActionEvent、`onStateUpdate` 等。需明确 API 中何处保存宿主上下文：`hostSessionId` 和 `hostTurnId` 不应从不可信的 OpenUI Lang 自动推断；只能从 Host 的消息生命周期获取。

## 3. 提供给 A/B 同时开发的 Mock Artifact

```json
{
  "kind": "intelligent_ui",
  "protocolVersion": "1.0",
  "artifactId": "demo-chart-001",
  "language": "openui-lang",
  "libraryId": "core",
  "libraryVersion": "0.1.0",
  "source": "$x = 4
root = Col([Title("Interactive example", "md"), Slider($x, 0, 10), Text("Choose a value")])",
  "state": { "x": 4 },
  "metadata": { "title": "Interactive example" }
}
```

注：示例 `source` 是**示意字符串**，不保证与 A 最终组件签名完全一致。A 在 F0/F1 必须用真实 library 编译通过的 OpenUI Lang 替换并同步 fixture；B 用它测试 JSON 封套时无需先运行 Renderer。

## 4. 事件生命周期与职责

1. Agent/Host 产生 Artifact 或按流式增量累积 `source`（增量 transport 可以由 Host 原有协议提供，不强制引入第二条 SSE 通道）。
2. Host **确定性地**选择并校验 `kind` / `protocolVersion`，不能把普通 Markdown fence 中可疑代码自动作为可信 UI。
3. React Renderer 按 `source + isStreaming + initialState` 渲染，读取/更新局部 `$variables`，通过 `onStateChange` 回报由 Host 持久化。
4. `@ToAssistant` 等外部动作由 Host 的 `onAction` 消费；框架不自行启动 LLM。
5. `Query()` / `Mutation()` 调用 Framework 的 `toolProvider` 适配器，再进入 Host `invokeTool`，Host 执行权限校验与审批后返回数据。**Mutation 的批准和幂等控制在 Host**。
6. 如果 Artifact schema 不匹配、Renderer 报错或组件不存在，应向 Host 报诊断并呈现安全回退；不得执行未知 action。

## 5. 版本策略

- `protocolVersion`：JSON 封套语义版本；1.0 开发期间禁止静默 breaking change。
- `libraryId/libraryVersion`：具体组件签名版本；UIArtifact 必须记录生成时使用的库版本。
- `packageVersion`：Framework npm 包版本，不等价于 `libraryVersion`。任何组件参数签名变更必须更新 libraryVersion 并提供迁移或旧消息降级。
- 组件库可多 registry 配置，但默认拒绝未知 libraryId/未支持的 major version。

## 6. 安全和不变量

- `source` 和 `state` 均是**不可信输入**；限制总字节、最大嵌套、允许的组件/函数与 URL scheme。
- 禁止任意 `eval`、Node.js/Electron API 暴露，禁用任意 JS 执行；如果插件 `HtmlView` 启用则必须受独立沙箱和 CSP 约束，默认关闭。
- ToolProvider 的默认实现应**拒绝所有调用**；没有 allowlist 的工具不得自动可用。权限最终由 Host Runtime 强制执行。
- 不得把 API 密钥、系统环境变量、主进程对象、真实工作目录权限或隐私数据通过 Framework 注入模型生成的任意 JS。
- Query 允许缓存刷新但需防止资源耗尽；Mutation 需处理重复点击和幂等/审批。
- 状态保存前检查类型和体积；UI 可以降级为纯文本，但不可以静默伪造科研数值。

## 7. 双方协议验收（必须在联调前通过）

| 检测 | A：Framework | B：Forge |
|---|---|---|
| JSON round-trip | `serialize -> parse -> validate` | 已有历史消息存储/重载 |
| Render | CLI/React demo 实际渲染 | 现有聊天气泡使用 Framework 公共 API |
| Streaming | 分块输入 + 完结 + 中断 | 保留 session/turn 过滤，绝不串流 |
| State | `onStateChange`/`initialState` | 同会话恢复、切会话隔离 |
| Query | 只调用命名的 Mock tool | 白名单读取数据 |
| Mutation | 默认拒绝/结构化事件 | 必经权限审批，避免重复执行 |
| Errors | 无效 schema/组件可回退 | 恢复旧版 Markdown 路径 |
| Packaging | `npm pack` / clean consumer | 只从 tarball/发布包导入 |
| Compatibility | React 19 / Zod 双版本验证 | Electron/Vite 生产 bundle 回归 |

## 8. 同步变更流程

A 对 schema、组件名称、Renderer 入参等提出更改时，更新 `docs/CHANGELOG.md` 并提供新的 fixture、类型声明与 migration note；B 不依赖非公开路径。A/B 必须各自提交本地 commit；禁止 push；双方仅交换协议文本、tarball、测试结果及 bug 复现，不互相接管对方 Git 仓库。
