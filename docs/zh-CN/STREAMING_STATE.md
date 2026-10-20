# OpenUI、流式与状态

[English](../en/STREAMING_STATE.md) · [目录](README.md) · [完整示例](../examples/StreamingState.tsx)

## 1. OpenUI 基础

```text
$count = 4
root = Col([Slider($count, 0, 10), Text("Count: " + $count), Button("More", @Set($count, @Clamp($count + 1, 0, 10)))])
```

- `$count` 是可变绑定；默认值应为字面量。事件使用 `@Set` 修改，派生表达式自动更新。
- `root` 是展示入口；声明可以前向引用。组件使用位置参数，次序见[参考](REFERENCE.md)。
- `@` 标记函数／动作；本地表达式不触发模型推理。
- `@Set`、`@Each`、`@Filter`、`@Run` 等部分能力由官方运行时提供，不包含在本库 59 个自定义函数的计数中。
- `Query` 是外部读取；`Mutation` 需要显式 `@Run`。真实副作用仍由 Host 授权。

## 2. 分块输入规则

Renderer 接收**累计源码**。传输如果输出 delta，需要累计；如果输出完整快照，应直接替换，不能再次拼接。不要逐块创建不同 artifact ID，也不要用源码作 React `key`。

```ts
let accumulated = "";
for await (const delta of hostTextStream) {
  accumulated += delta;
  updateArtifact({ ...currentArtifact, source: accumulated });
}
```

这是传输伪代码；完整可运行逻辑见 `StreamingState.tsx`。开始时设置 `isStreaming=true`，结束时设置 false。完整源码会接受最终解析检查；语法错误、未知组件、未解析前向引用会进入 fallback。部分输入可以预览；HtmlView 脚本在流结束前不会运行。

## 3. 身份与生命周期

同一消息内保持 `(artifactId, libraryId, libraryVersion, hostSessionId, hostTurnId, mode)` 稳定。切换消息／会话使用新的可信身份。`hostAdapter`、`registry`、`toolOptions` 使用模块常量或 `useMemo`，不要每个流式帧重新构造。

修改 Host Adapter 会替换 capability bridge 并清理旧请求；更换 registry 实例也会替换 bridge。同一库 ID／版本不应悄悄改变组件签名。新配置需要重载组件时，使用显式 React key。

## 4. 取消、乱序与卸载

Host 负责终止其 SSE／IPC 订阅，框架不会建立第二条模型传输。使用 `AbortController` 和递增 generation，防止旧流的迟到 chunk 写入新消息。卸载时解除订阅并中止请求。完整示例实现了这两个检查。

取消后的不完整源码设为非 streaming 会 fallback；产品也可保留上一份完整快照，或显示普通文本。不要将截断源码伪装成成功完成。`onDispose(ctx)` 用于取消 Host 工具／resolver 工作，不等于自动取消 Host 的文本流。

## 5. 保存与恢复

`onStateChange` 返回可序列化对象。保留**整个对象和原始键名**，例如 `{"$count":8}`；不要改成 `{"count":8}`，也不要只保留输入控件的一部分字段。

状态应与会话／轮次／artifact 一起保存。`artifact.state` 是首次挂载的初始值，不是受控状态 prop。恢复同一条消息时：加载状态 → 构造 Artifact → 用新的 React key 重挂载。后续仅修改 `state` prop 不能保证重新 hydration。

```tsx
const restored = createArtifact(source, artifactId, savedState);
<IntelligentUIRenderer key={restoreRevision} artifact={restored} hostAdapter={stableHost} />;
```

内存示例刷新页面后会丢失；真实持久化见 Host 章节的 `createArtifactStore`。表单状态不是登录凭据或权限依据。恢复状态不应自动运行 Mutation；Host 仍需为重试、重复点击和跨进程重放实现操作幂等。

## 6. 大数据与科学场景

默认源码 256 KiB、状态 256 KiB、总 JSON 1 MiB。不要把轨迹、矩阵、体数据或整个科研文件序列化进状态。未来科学原生组件应保存选择、相机、帧号、筛选和数据引用，由 Host 提供分页／范围读取。该外部数据引用机制属于路线图，0.2.0 尚无通用科学数据 resolver API。
