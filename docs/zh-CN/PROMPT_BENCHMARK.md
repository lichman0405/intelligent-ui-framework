# Prompt、Gallery 与 Benchmark

[English](../en/PROMPT_BENCHMARK.md) · [目录](README.md)

## 1. 后端 Prompt API

```ts
import { createSystemPrompt, getComponentSpec } from "@intelligent-ui/framework/prompt";
const spec = getComponentSpec("core");
const system = createSystemPrompt({ tools: [], additionalRules: ["Use supplied data only."] }, "core", "chat");
```

此入口不导入 React，不创建模型客户端或发送请求。参数二可为 core、trusted-extras、upstream 或调用者序列化的 LibrarySpec；参数三是 chat／dashboard。getComponentSpec 返回防御性副本。

默认包含完整上游组合、间距、响应式计算、SVG 绘制、日期规则及三个示例；dashboard 再加入示例工具 schema 和看板示例。接入真实业务时，**始终以实际 Host 工具覆盖 tools**，不能让 demo 的 get_orders 等误导模型。`promptOptions`、`dashboardPromptOptions` 和四个 example 字符串也可单独导入。

## 2. 模型输出与组件库保持一致

```ts
const system = createSystemPrompt({ tools: permittedToolSpecs }, "upstream", "chat");
// 将 system 传给 Desktop 已有模型通道；仅接收 OpenUI 源码部分。
```

上段 permittedToolSpecs 来自 Host。完整库的 Prompt 必须搭配 upstream Artifact 和对应 registry。自定义库用 `library.toSpec()` 导出 JSON，后端加载 JSON 后调用 Prompt API，避免为取 spec 导入前端组件。Prompt 声明不是权限，运行时仍由 allowedTools 和 Host 服务检查。

生产消息路由由 Desktop 判定何时使用 UI 模式；普通知识回答可以保持 Markdown。不要使用框架建立第二个 Agent loop。科学组件将来还需对应单位、结构、选择与数据引用规则，当前通用 Prompt 不等于专业科学 UI 支持。

## 3. Gallery

```ts
import { galleryPrograms, createGalleryArtifact, demoTools, demoToolSpecs } from "@intelligent-ui/framework/gallery";
const example = galleryPrograms[0];
const artifact = createGalleryArtifact(example.id);
```

45 个原项目程序：19 组件、4 组合、18 工具、4 Prompt。程序包含 id、title、note、code、category 和 capabilities；capabilities 标记 map／html／video／tools，不是完整权限描述（例如图片仍可能需要服务）。Artifact 默认 upstream 签名，需显式注册。

demoTools 是基于日期生成的合成数据，不应接入真实科研或商业结果。16 个框架验收样例位于源码 Demo，与 Gallery 不同。

## 4. 模型无关 Benchmark API

```ts
import { runBenchmark } from "@intelligent-ui/framework/benchmark";
const results = await runBenchmark([{ id: "hello", prompt: "Show a greeting" }],
  async function* ({ signal }) {
    if (signal.aborted) return;
    yield 'root = ';
    yield 'Text("Hello")';
  }, { library: "core", timeoutMs: 60000, maxSourceBytes: 262144 });
```

Provider 接收 `{prompt,system,signal}`，返回文本 Promise 或 AsyncIterable 文本。结果包含 id、source、passed、chunks、elapsedMs 和 errors。默认顺序执行，超时／超大输出／无效源码有诊断。自定义库必须提供匹配的 library spec、schema、root；可给 signal 和 onResult。

通过只表示官方语法检查成功，不代表科学正确、布局优秀或模型稳定。浏览器交互检查属于独立验收。

## 5. 源码仓库 CLI

```sh
npm run build
npm run bench:fixtures
npm run bench -- --answers ./saved-model-answers --only bicycle
npm run bench -- --provider ./my-provider.mjs --only bicycle
npm run bench -- --model MODEL_ID --base-url https://provider.example/v1 --key-env BENCH_API_KEY
```

真实模型 key 放在命名环境变量，不写进前端、Artifact、源码或结果。`--provider` 模块 default export 使用同一 Provider 签名。SSE CLI 适配 OpenAI-compatible chat/completions，不保证兼容每个供应商；其它协议使用 provider 模块。

原始 24 个模型场景在 `tools/bench/prompts.json`；fixture 模式使用 45 个 Gallery ID。saved-answers 需按选择的 case ID 命名 `<id>.oui`，不要混用 ID。`--only` 过滤 ID；`--out` 更改输出目录。默认结果／源码位于 artifacts/benchmark，忽略于 Git。CLI 在源码仓库提供，不是 npm 包中的可执行 bin。

现有 45 个 fixture 的结果是确定性 mock stream；没有配置 endpoint/key 就不能声称通过真实模型联调。
