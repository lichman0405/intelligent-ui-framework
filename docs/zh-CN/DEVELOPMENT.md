# 二次开发与版本管理

[English](../en/DEVELOPMENT.md) · [目录](README.md) · [完整扩展示例](../examples/CustomPlugin.tsx)

## 1. 目录与公共边界

| 目录 | 职责 |
| --- | --- |
| src/protocol | 纯 JSON DTO、验证、版本常量 |
| src/react | Renderer、Host bridge、核心库、函数与组件 |
| src/plugins | 地图、隔离 HTML 和完整上游注册 |
| src/prompt / src/generated | Prompt API、真实库生成的规格与 schema |
| src/adapters | 可选网络、存储、浏览器端口 |
| src/gallery / src/benchmark | 示例数据与模型无关检查接口 |
| examples/vite-react-demo | 按公共包导入的交互 Demo |
| tests / scripts | 自动化检查、构建、独立消费者和浏览器验收 |

消费者仅导入 package exports，不从 src、dist/chunk-* 或 .build 私有路径取功能。插件也不能通过内部 HostContext 获取高权限对象。共享 SDK 类型使用官方依赖；若应用直接导入 defineComponent 等，应在应用 manifest 明确声明 `@openuidev/react-lang@1.0.0`，避免依赖包管理器的偶然提升。

## 2. 新组件、函数与动作

`CustomPlugin.tsx` 可直接作为 App 运行，示范 Measurement、Twice 和 Inspect。Measurement 只是显示已提供单位的教学组件，**不代表已实现科学单位引擎或原生材料组件**。

1. 用官方 `defineComponent` 和 `zod/v4` 定义 props。
2. 本地纯计算用 `defineFunction`；函数应限制输入规模、处理空值／非法值，避免阻塞渲染。
3. Host 业务请求用 `defineAction` 注册名字和 JSON 参数；通过已有 Button 的动作计划触发。
4. 将定义放入 `IuiPlugin` 的 components/functions/actions，调用 `createIuiLibrary({id,plugins})`。
5. 用 `createIuiRegistry({id,version,library})` 明确注册；创建同签名的 Artifact。
6. 导出匹配的 spec／schema、Prompt 和可运行 Gallery。

插件是可信应用代码，不能来自 Artifact、模型输出或网络 JSON。重复名称会拒绝。注册函数和动作名称应避免与组件及官方运行时的内建名称冲突。

## 3. 自定义交互绑定

输入需要 `reactive` schema 和 `useStateField`；仅用 React useState 不会进入 OpenUI 状态恢复。下面是定义片段（与完整示例的插件注册方式配合）：

```tsx
import { defineComponent, reactive, useStateField } from "@openuidev/react-lang";
import { useId } from "react";
import { z } from "zod/v4";
const Stepper = defineComponent({
  name: "Stepper", description: "Increase a bound value locally",
  props: z.object({ value: reactive(z.number()) }),
  component: ({ props, statementId }) => {
    const fallback = useId();
    const field = useStateField(statementId ?? fallback, props.value);
    return <button onClick={() => field.setValue(Number(field.value ?? 0) + 1)}>{String(field.value)}</button>;
  },
});
```

注册后使用 `$n = 0` 和 `Stepper($n)`。让选择、缩放、帧索引等可恢复 UI 状态有明确绑定；不要把任务状态或授权结论当作可由控件修改的普通本地变量。

处理副作用时使用官方动作机制或 Host 的受控接口，不自行创建工具循环。第三方渲染器应在 effect 中初始化，卸载时销毁监听、WebGL、worker、定时器，丢弃旧数据请求的迟到结果。

## 4. 自定义 Prompt 与后端

```ts
const spec = customLibrary.toSpec();
const schema = customLibrary.toJSONSchema();
// 将 spec/schema 序列化到 Host 可加载的资源；不要传函数或 React 组件。
```

后端导入 `/prompt` 并用 `createSystemPrompt(options,spec)`；自定义 Benchmark 同时传入对应 schema/root/spec。更改 props 次序、枚举、单位语义或返回数据结构时同步更新组件说明、Prompt、schema、例子和版本。`npm run build` 会重新生成默认库规格，不会自动把任意外部库写成新的默认 core。

## 5. 版本原则

- 包版本描述 npm API／构建分发；协议版本描述 wire 字段语义；库 ID／版本描述 OpenUI 签名。
- 自定义库用独立 ID；不能把增加组件的库继续标为 core@0.1.0。
- 当前 registry 对版本精确匹配，不自动接受兼容范围或最新版本；旧 Artifact 要保留旧注册或显式迁移。
- 协议破坏性变更需与接入方确认，不向冻结 v1 静默添加业务字段。
- 未来科学数据 schema 独立版本化；新类型不得破坏已保存会话。

## 6. 开发命令与验收

在 Framework 仓库执行 `npm ci --ignore-scripts`、`npm run typecheck`、`npm run build`、`npm test`。使用 `npm run demo` 交互检查。发布前 npm pack，并运行独立消费者／浏览器验收，命令见部署章节。

新增组件必须覆盖正常、空、非法、超大、流式中间态、恢复、卸载、主题、键盘和 Host 失败场景。科学组件还需校验单位、坐标、选择 ID、采样／精度及来源；UI 不得将测试 fixture 的结果冒充真实计算。

## 7. 内置科学 UI 的开发约束

开发者可在实现层分包／延迟加载，但 Desktop 安装包应自带所需代码、字体、worker、schema 和默认注册。用户打开结果即可交互，无需 skill、MCP 插件或额外云站点。计算由 Desktop 原有服务执行；UI 提供参数编辑、可视化、选择、对比、导出和受控任务操作。具体升级见[路线图](ROADMAP.md)。
