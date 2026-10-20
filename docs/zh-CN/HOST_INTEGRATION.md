# Host 与 MiQroForge Desktop 接入

[English](../en/HOST_INTEGRATION.md) · [目录](README.md) · [工具示例](../examples/ToolApp.tsx)

## 1. 职责与接线

```text
Desktop 现有模型／Agent → UIArtifactV1 → IntelligentUIRenderer
  ↑ 对话事件／状态                      ↓ 命名工具／数据请求
Desktop 会话／持久化 ← UIHostAdapter → Desktop 权限与计算服务
```

Framework 不需要额外 skill 进程。Desktop 应在自身启动路径注册组件、提供 Host Adapter，并由现有模型／工具服务处理请求。不要让模型生成 IPC 通道名、任意文件路径或可执行命令来替代受控工具参数。

## 2. wire DTO

```json
{
  "kind": "intelligent_ui",
  "protocolVersion": "1.0",
  "artifactId": "message-1",
  "language": "openui-lang",
  "libraryId": "core",
  "libraryVersion": "0.1.0",
  "source": "$x = 4\nroot = Col([Slider($x, 0, 10), Text($x + \"\")])",
  "state": {"$x": 8},
  "metadata": {"title": "Example", "provenance": "mock-data"}
}
```

调用 `validateArtifact(raw)`，成功时使用返回的防御性副本；失败时展示普通消息。默认只接受 core；完整库或自定义库需提供明确的 `supportedLibraries`。Renderer 以 `registry` 为最终可信支持表，不能通过 `validation.supportedLibraries` 绕过注册。

所有 wire 值必须为有限 JSON；不能携带函数、Date、DOM、循环引用、accessor、原型实例。会话／轮次放在可信 Renderer props，而不是修改 Artifact 增加未定义字段。完整契约见[协议原文](../03_CONTRACT_V1.md)。

## 3. Adapter 回调

| 字段 | 接入约定 |
| --- | --- |
| `allowedTools` | 明确工具名称；缺省为空，提供 invokeTool 不等于授权全部工具 |
| `invokeTool(name,args,ctx)` | 返回 Promise<JSONValue>；Host 校验参数、项目与资源所有权、权限、审批 |
| `onAction(action,ctx)` | `continue_conversation` 交给现有对话；`custom_action` 按注册的动作处理 |
| `onStateChange(state,ctx)` | 保存完整原始状态；回调是同步通知，异步持久化队列由 Host 管理 |
| `openUrl(url,ctx)` | Host 按站点／协议策略打开；框架仅进行基础 HTTP(S)／凭据过滤 |
| `copyText(text,ctx)` | 返回 Promise<boolean>；浏览器／桌面剪贴板能力由 Host 提供 |
| `resolveImage`／`resolveRoute` | 可选图片、路线服务；没有授权时不接入 |
| `onDispose(ctx)` | 取消该会话／轮次／artifact 的底层请求与监听 |

Host 调用上下文为 `{artifactId,hostSessionId?,hostTurnId?}`。多个消息不能共用缺失身份的同一存储键。保持 Adapter 对象稳定。

## 4. Query 与 Mutation

`ToolApp.tsx` 是完整本地教学示例，只有 `demo_read` 和 `demo_save`。不要直接改成可以转发任意工具名的代理。真实适配层还需实现：

1. 校验每个工具的参数 schema 和输出数据。
2. 依据可信用户／项目／任务上下文授权，不能相信表单中的身份字段。
3. 修改／提交任务先由 Host 审批，再调用真实服务。
4. 为副作用提供持久化幂等键及审计信息；框架只合并同时在途的相同调用。
5. 采用服务自身的取消和超时策略；不要将超时自动当成“操作未发生”。

默认每个 bridge：100 次调用、4 个并发、30 秒超时；工具结果 256 KiB／30,000 节点。通过稳定的 `toolOptions` 可调整。提高结果预算不会提高 Artifact 和状态预算，优先返回摘要和外部结果标识。

## 5. 生命周期与取消

wire v1 的 `invokeTool` 没有 AbortSignal。Host 可用上下文键维护 AbortController／IPC request ID，在 `onDispose` 时统一取消。框架超时只结束等待并丢弃迟到结果，不能撤销远端计算。旧请求不能覆盖新消息。

若组合 `createWebResolvers()`，保留其清理：

```ts
const web = createWebResolvers();
const adapter: UIHostAdapter = {
  ...web,
  onDispose(ctx) {
    web.onDispose?.(ctx);
    hostRequests.cancelFor(ctx); // Host 自有服务；不是框架 API
  },
};
```

上段是接线示意，`hostRequests` 需要 Desktop 自行实现。不能用空方法伪装已经实现计算取消。

## 6. 存储适配器

```ts
import { createArtifactStore } from "@intelligent-ui/framework/adapters";
const store = createArtifactStore(window.localStorage);
const ctx = { artifactId: "message-1", hostSessionId: "s1", hostTurnId: "t1" };
store.save(artifact, ctx);
store.saveState({ "$x": 8 }, ctx);
const restored = store.load(ctx); // invalid/missing/corrupt → null
store.remove(ctx);
```

仅在客户端执行 `window.localStorage`；SSR 或 Desktop 后端提供 Storage-like 实现。对于完整库：`createArtifactStore(storage,{supportedLibraries:registry.supportedLibraries})`。先 save Artifact 再 saveState；写入失败会抛出，Host 应反馈存储错误。`saveState` 使用对象方法的 `this`，不要脱离 store 解构调用。

生产持久化可以直接使用 Desktop 现有数据库，遵循相同验证、身份与版本规则；无需复制上游浏览器聊天线程机制。

## 7. 接入验收

- 两个会话复用相同 artifactId 时，状态和请求仍隔离。
- Markdown／未知库版本／非法源码有普通消息回退。
- Prompt 列出的工具和真实允许的工具一致。
- 恢复、重放、组件卸载不自动重复提交计算。
- 权限失败、服务超时、取消、资源失效均可反馈；敏感错误只进 Host 日志。
- 地图资源、图片、iframe 及离线部署按目标 Desktop 实际验收；当前 Framework 浏览器报告不能替代 Desktop 验收。
