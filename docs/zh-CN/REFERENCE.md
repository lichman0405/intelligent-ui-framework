# 完整 API 与组件／函数参考

[English](../en/REFERENCE.md) · [目录](README.md)

自动从 0.2.0 实际生成规格整理。规格 SHA-256：`89b5ff65a0c652f3bd1751d50cf2f1cacb65a3ee22bafa9ea97468eb88a6f31a`。更新命令：`node scripts/build-docs.mjs`（先构建运行时）。

位置参数次序以 signature 为准。schema 描述类型／必填／枚举，不代表所有运行时显示默认值；未声明默认值的可选参数不要推断为 0 或 false。默认外观与交互示例见 Gallery 和实际组件实现。`null` 只在 schema 或运行时调用约定允许时用作中间参数占位，不是任意参数的合法值。`$binding<T>` 表示可恢复绑定；Node、Color、Length、Radius 等为 OpenUI 语义类型。

## 公共模块

| Import | 类型入口 |
| --- | --- |
| `@intelligent-ui/framework` | `./dist/index.d.ts` |
| `@intelligent-ui/framework/react` | `./dist/react/index.d.ts` |
| `@intelligent-ui/framework/protocol` | `./dist/protocol/index.d.ts` |
| `@intelligent-ui/framework/prompt` | `./dist/prompt/index.d.ts` |
| `@intelligent-ui/framework/styles.css` | 显式 CSS |
| `@intelligent-ui/framework/adapters` | `./dist/adapters/index.d.ts` |
| `@intelligent-ui/framework/gallery` | `./dist/gallery/index.d.ts` |
| `@intelligent-ui/framework/benchmark` | `./dist/benchmark/index.d.ts` |
| `@intelligent-ui/framework/plugins/map` | `./dist/plugins/map/index.d.ts` |
| `@intelligent-ui/framework/plugins/html` | `./dist/plugins/html/index.d.ts` |
| `@intelligent-ui/framework/plugins/upstream` | `./dist/plugins/upstream.d.ts` |
| `@intelligent-ui/framework/map-worker` | `./dist/map-worker.d.ts` |
| `@intelligent-ui/framework/plugins/map/styles.css` | 显式 CSS |

## Renderer props

| Prop | Type | 约定 |
| --- | --- | --- |
| artifact | UIArtifactV1 \| unknown | 必填；先验证 envelope 和最终源码 |
| isStreaming | boolean | 默认 false；true 时预览累计源码 |
| hostAdapter | UIHostAdapter | 默认无权限空适配器；保持引用稳定 |
| hostSessionId / hostTurnId | string | 可信上下文，不能从模型文本提取 |
| theme | "light" \| "dark" | 默认 light |
| themeTokens | Record<--iui-*, string> | 局部 token，过滤不安全值 |
| mode | "core" \| "trusted-extras" | 默认 core；registry 可显式替换支持表 |
| registry | IuiRegistry | 可信精确注册表，保持引用稳定 |
| toolOptions | HostBridgeOptions 子集 / subset | 调用／并发／超时／结果大小与节点预算 |
| onError | (Diagnostic[]) => void | 错误诊断；不要依赖英文消息文本 |
| fallback | ReactNode | 默认安全提示 |
| className | string | 附加到 iui-root |
| validation | ArtifactValidationOptions | 大小等验证选项；不能绕过 registry |

## 函数入口

| API | 行为 |
| --- | --- |
| `createArtifact(source,id,state?,signature?)` | 构造并验证 Artifact；失败抛错 |
| `validateArtifact(value,options?)` | 返回 success/data 或 success/errors；不解析 OpenUI 文本语法 |
| `validateJSON(value,limits?) / validateState(value,limits?)` | 有限 JSON／对象状态验证和防御性副本 |
| `isJsonRecord(value)` | 仅判断普通对象，不替代完整深度验证 |
| `createIuiLibrary({id?,trustedExtras?,plugins?})` | 创建实际官方 Library；默认 core，插件需新 ID |
| `createIuiRegistry(...registrations)` | 精确 ID／版本查找，冻结注册元信息 |
| `createHostBridge(host,context,options?)` | 受控调用／动作／状态／retain/release/dispose；通常由 Renderer 管理 |
| `safeWebUrl(value)` | HTTP(S) 且无凭据返回标准 URL，否则 null |
| `getComponentSpec(modeOrSpec?)` | 返回防御性 LibrarySpec；默认 core |
| `createSystemPrompt(options?,modeOrSpec?,profile?)` | 纯 Prompt 生成；默认 core/chat |
| `createMapPlugin(options?) / createHtmlPlugin(options?)` | 可信应用代码构造可选插件 |
| `htmlContentSecurityPolicy(options?)` | 返回 HTML 子页面 CSP；不设置父页面 CSP |
| `createUpstreamRegistration({map?,html?}?)` | 全部 55 个原项目组件的注册 |
| `createWebResolvers(options?)` | 可选公开图片／路线／dispose 端口 |
| `createArtifactStore(storage,options?)` | save/load/saveState/remove；存储由 Host 提供 |
| `createBrowserPorts({allowUrl,open,writeText})` | 需 Host 策略的导航和剪贴板端口 |
| `createGalleryArtifact(id)` | 创建 upstream 签名示例，未知 ID 抛错 |
| `runBenchmark(cases,provider,options?)` | 顺序执行模型无关检查，返回逐例结果 |

其它公开值：library/trustedLibrary、coreRegistration/trustedRegistration、coreRegistry/trustedRegistry、upstreamRegistration/upstreamRegistry、MapMarker、mapWorkerUrl；Prompt 的原始 presets 和四个 example；Gallery 的 programs/compositionPrograms/toolPrograms/galleryPrograms/demoTools/demoToolSpecs。协议常量为 PROTOCOL_VERSION=1.0、LIBRARY_ID=core、LIBRARY_VERSION=0.1.0、PACKAGE_VERSION=0.2.0、DEFAULT_LIMITS。完整 TS DTO 见包内 `.d.ts` 与冻结契约；Host/适配器/Benchmark 参数及默认值见对应手册章节。

## 组件索引：55 个

[Col](#col) · [Row](#row) · [Box](#box) · [Grid](#grid) · [Card](#card) · [Carousel](#carousel) · [Popover](#popover) · [Divider](#divider) · [Spacer](#spacer) · [Title](#title) · [Text](#text) · [Caption](#caption) · [Label](#label) · [Badge](#badge) · [Link](#link) · [List](#list) · [ListItem](#listitem) · [Markdown](#markdown) · [Quote](#quote) · [Code](#code) · [Math](#math) · [Button](#button) · [IconButton](#iconbutton) · [Pressable](#pressable) · [Input](#input) · [TextArea](#textarea) · [Select](#select) · [SegmentedControl](#segmentedcontrol) · [Slider](#slider) · [Checkbox](#checkbox) · [RadioGroup](#radiogroup) · [DatePicker](#datepicker) · [Timer](#timer) · [Form](#form) · [SearchImage](#searchimage) · [Image](#image) · [Icon](#icon) · [Table](#table) · [Chart](#chart) · [Flashcard](#flashcard) · [Celebration](#celebration) · [Svg](#svg) · [Circle](#circle) · [Ellipse](#ellipse) · [Rect](#rect) · [Line](#line) · [Path](#path) · [Polyline](#polyline) · [Polygon](#polygon) · [G](#g) · [SvgText](#svgtext) · [YouTube](#youtube) · [MapMarker](#mapmarker) · [Map](#map) · [HtmlView](#htmlview)

### Col

纵向布局；根布局未指定 gap 时采用分层间距。

注册范围: core / core-trusted / upstream.

```text
Col(children: Node[], gap?: number, align?: "start" | "center" | "end" | "stretch")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| gap | 否 | `{"type":"number"}` |
| align | 否 | `{"type":"string","enum":["start","center","end","stretch"]}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Row

横向布局，可对齐、换行并设置间距。

注册范围: core / core-trusted / upstream.

```text
Row(children: Node[], gap?: number, align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between", wrap?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| gap | 否 | `{"type":"number"}` |
| align | 否 | `{"type":"string","enum":["start","center","end","stretch"]}` |
| justify | 否 | `{"type":"string","enum":["start","center","end","between"]}` |
| wrap | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Text](GALLERY.md#component-text)

### Box

通用容器，支持布局、尺寸、颜色、边框与圆角。

注册范围: core / core-trusted / upstream.

```text
Box(children?: Node[], direction?: "row" | "col", gap?: number, padding?: number, background?: Color, radius?: Radius, border?: boolean, width?: Length, height?: Length, flex?: number, align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between", wrap?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 否 | `{"type":"array","items":{}}` |
| direction | 否 | `{"type":"string","enum":["row","col"]}` |
| gap | 否 | `{"type":"number"}` |
| padding | 否 | `{"type":"number"}` |
| background | 否 | `{"type":"string"}` |
| radius | 否 | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| border | 否 | `{"type":"boolean"}` |
| width | 否 | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| height | 否 | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| flex | 否 | `{"type":"number"}` |
| align | 否 | `{"type":"string","enum":["start","center","end","stretch"]}` |
| justify | 否 | `{"type":"string","enum":["start","center","end","between"]}` |
| wrap | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Layout](GALLERY.md#component-layout)

### Grid

响应式网格，按列数与最小宽度布局。

注册范围: core / core-trusted / upstream.

```text
Grid(children: Node[], columns?: number, minChildWidth?: number, gap?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| columns | 否 | `{"type":"number"}` |
| minChildWidth | 否 | `{"type":"number"}` |
| gap | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Card

内容分组卡片。

注册范围: core / core-trusted / upstream.

```text
Card(children: Node[], variant?: "outline" | "soft", padding?: number, gap?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| variant | 否 | `{"type":"string","enum":["outline","soft"]}` |
| padding | 否 | `{"type":"number"}` |
| gap | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Carousel

横向浏览多个内容项。

注册范围: core / core-trusted / upstream.

```text
Carousel(children: Node[], itemWidth?: number, gap?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| itemWidth | 否 | `{"type":"number"}` |
| gap | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Popover

交互式补充内容浮层。

注册范围: core / core-trusted / upstream.

```text
Popover(trigger: string | Node[], content: string | Node[])
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| trigger | 是 | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| content | 是 | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |

[完整可运行 OpenUI 示例: New primitives](GALLERY.md#composition-primitives)

### Divider

分隔线。

注册范围: core / core-trusted / upstream.

```text
Divider()
```

无显式参数。

[完整可运行 OpenUI 示例: Text](GALLERY.md#component-text)

### Spacer

占据剩余布局空间。

注册范围: core / core-trusted / upstream.

```text
Spacer()
```

无显式参数。

[完整可运行 OpenUI 示例: Layout](GALLERY.md#component-layout)

### Title

标题文本。

注册范围: core / core-trusted / upstream.

```text
Title(text: string, size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", color?: Color)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| size | 否 | `{"type":"string","enum":["sm","md","lg","xl","2xl","3xl"]}` |
| color | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Text

正文，可包含文本与内联元素。

注册范围: core / core-trusted / upstream.

```text
Text(text: string | Node[], size?: "xs" | "sm" | "md" | "lg", color?: Color, weight?: "normal" | "medium" | "semibold", italic?: boolean, lineThrough?: boolean, tabularNums?: boolean, maxLines?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| size | 否 | `{"type":"string","enum":["xs","sm","md","lg"]}` |
| color | 否 | `{"type":"string"}` |
| weight | 否 | `{"type":"string","enum":["normal","medium","semibold"]}` |
| italic | 否 | `{"type":"boolean"}` |
| lineThrough | 否 | `{"type":"boolean"}` |
| tabularNums | 否 | `{"type":"boolean"}` |
| maxLines | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Caption

辅助说明文本。

注册范围: core / core-trusted / upstream.

```text
Caption(text: string, color?: Color)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| color | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Label

字段或区块标签。

注册范围: core / core-trusted / upstream.

```text
Label(text: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Text](GALLERY.md#component-text)

### Badge

紧凑状态／事实标签。

注册范围: core / core-trusted / upstream.

```text
Badge(text: string, color?: "neutral" | "info" | "success" | "warning" | "danger" | "purple" | "pink", icon?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| color | 否 | `{"type":"string","enum":["neutral","info","success","warning","danger","purple","pink"]}` |
| icon | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Text](GALLERY.md#component-text)

### Link

链接，导航经 Host 处理。

注册范围: core / core-trusted / upstream.

```text
Link(text: string, url: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| url | 是 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Text](GALLERY.md#component-text)

### List

列表容器。

注册范围: core / core-trusted / upstream.

```text
List(items: (string | ListItem)[], marker?: "bullet" | "number" | "none", timeline?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| items | 是 | `{"type":"array","items":{"anyOf":[{"type":"string"},{"$ref":"#/$defs/ListItem"}]}}` |
| marker | 否 | `{"type":"string","enum":["bullet","number","none"]}` |
| timeline | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Lists and timeline](GALLERY.md#component-lists)

### ListItem

列表项。

注册范围: core / core-trusted / upstream.

```text
ListItem(title: string, description?: string, marker?: string, children?: Node[])
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| title | 是 | `{"type":"string"}` |
| description | 否 | `{"type":"string"}` |
| marker | 否 | `{"type":"string"}` |
| children | 否 | `{"type":"array","items":{}}` |

[完整可运行 OpenUI 示例: Lists and timeline](GALLERY.md#component-lists)

### Markdown

Markdown 内容，链接及资源受安全规则约束。

注册范围: core / core-trusted / upstream.

```text
Markdown(text: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Quote

引文与来源。

注册范围: core / core-trusted / upstream.

```text
Quote(text: string, cite?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| cite | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: New primitives](GALLERY.md#composition-primitives)

### Code

代码显示，不执行代码。

注册范围: core / core-trusted / upstream.

```text
Code(code: string, language?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| code | 是 | `{"type":"string"}` |
| language | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: New primitives](GALLERY.md#composition-primitives)

### Math

KaTeX 公式，关闭信任扩展并限制展开。

注册范围: core / core-trusted / upstream.

```text
Math(tex: string, inline?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| tex | 是 | `{"type":"string"}` |
| inline | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: New primitives](GALLERY.md#composition-primitives)

### Button

动作按钮；未提供 action 时可把标签作为对话请求。

注册范围: core / core-trusted / upstream.

```text
Button(label: string, action?: ActionExpression, variant?: "solid" | "outline" | "soft" | "ghost", color?: "primary" | "danger" | "success", size?: "sm" | "md" | "lg", icon?: string, disabled?: boolean, block?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| label | 是 | `{"type":"string"}` |
| action | 否 | `{"$ref":"#/$defs/ActionExpression"}` |
| variant | 否 | `{"type":"string","enum":["solid","outline","soft","ghost"]}` |
| color | 否 | `{"type":"string","enum":["primary","danger","success"]}` |
| size | 否 | `{"type":"string","enum":["sm","md","lg"]}` |
| icon | 否 | `{"type":"string"}` |
| disabled | 否 | `{"type":"boolean"}` |
| block | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Buttons](GALLERY.md#component-buttons)

### IconButton

图标动作按钮。

注册范围: core / core-trusted / upstream.

```text
IconButton(icon: string, action?: ActionExpression, label?: string, variant?: "outline" | "ghost" | "solid")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| icon | 是 | `{"type":"string"}` |
| action | 否 | `{"$ref":"#/$defs/ActionExpression"}` |
| label | 否 | `{"type":"string"}` |
| variant | 否 | `{"type":"string","enum":["outline","ghost","solid"]}` |

[完整可运行 OpenUI 示例: Buttons](GALLERY.md#component-buttons)

### Pressable

可点击内容容器，支持选中态。

注册范围: core / core-trusted / upstream.

```text
Pressable(children: Node[], action?: ActionExpression, selected?: boolean, padding?: number, background?: Color, radius?: Radius)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| action | 否 | `{"$ref":"#/$defs/ActionExpression"}` |
| selected | 否 | `{"type":"boolean"}` |
| padding | 否 | `{"type":"number"}` |
| background | 否 | `{"type":"string"}` |
| radius | 否 | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |

[完整可运行 OpenUI 示例: Pressable grid](GALLERY.md#component-pressable)

### Input

绑定值的输入控件。

注册范围: core / core-trusted / upstream.

```text
Input(value: $binding<string | number>, label?: string, type?: "text" | "number", placeholder?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| label | 否 | `{"type":"string"}` |
| type | 否 | `{"type":"string","enum":["text","number"]}` |
| placeholder | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Segmented control](GALLERY.md#component-segmented)

### TextArea

绑定值的多行输入。

注册范围: core / core-trusted / upstream.

```text
TextArea(value: $binding<string>, label?: string, placeholder?: string, rows?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"string"}` |
| label | 否 | `{"type":"string"}` |
| placeholder | 否 | `{"type":"string"}` |
| rows | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Inputs and form](GALLERY.md#component-inputs)

### Select

单项下拉选择。

注册范围: core / core-trusted / upstream.

```text
Select(value: $binding<string>, options: (string | {value: string, label: string})[], label?: string, placeholder?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"string"}` |
| options | 是 | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| label | 否 | `{"type":"string"}` |
| placeholder | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Inputs and form](GALLERY.md#component-inputs)

### SegmentedControl

分段选择控件。

注册范围: core / core-trusted / upstream.

```text
SegmentedControl(value: $binding<string>, options: (string | {value: string, label: string})[], block?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"string"}` |
| options | 是 | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| block | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Segmented control](GALLERY.md#component-segmented)

### Slider

数值滑块；绑定值、范围、步长及可选单位。

注册范围: core / core-trusted / upstream.

```text
Slider(value: $binding<number>, min: number, max: number, step?: number, label?: string, unit?: string, marks?: {value: number, label: string}[])
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"number"}` |
| min | 是 | `{"type":"number"}` |
| max | 是 | `{"type":"number"}` |
| step | 否 | `{"type":"number"}` |
| label | 否 | `{"type":"string"}` |
| unit | 否 | `{"type":"string"}` |
| marks | 否 | `{"type":"array","items":{"type":"object","properties":{"value":{"type":"number"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}}` |

[完整可运行 OpenUI 示例: Sliders bound to state](GALLERY.md#component-gdp)

### Checkbox

布尔绑定复选框。

注册范围: core / core-trusted / upstream.

```text
Checkbox(checked: $binding<boolean>, label: string, lineThrough?: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| checked | 是 | `{"type":"boolean"}` |
| label | 是 | `{"type":"string"}` |
| lineThrough | 否 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Checkbox list](GALLERY.md#component-checklist)

### RadioGroup

单选组。

注册范围: core / core-trusted / upstream.

```text
RadioGroup(value: $binding<string>, options: (string | {value: string, label: string, description?: string})[], label?: string, variant?: "list" | "pills" | "cards")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"string"}` |
| options | 是 | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"},"description":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| label | 否 | `{"type":"string"}` |
| variant | 否 | `{"type":"string","enum":["list","pills","cards"]}` |

[完整可运行 OpenUI 示例: Inputs and form](GALLERY.md#component-inputs)

### DatePicker

日期输入。

注册范围: core / core-trusted / upstream.

```text
DatePicker(value: $binding<string>, label?: string, min?: string, max?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"string"}` |
| label | 否 | `{"type":"string"}` |
| min | 否 | `{"type":"string"}` |
| max | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Inputs and form](GALLERY.md#component-inputs)

### Timer

计时交互；不是 Host 任务调度器。

注册范围: core / core-trusted / upstream.

```text
Timer(seconds: $binding<number>, label?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| seconds | 是 | `{"type":"number"}` |
| label | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Timer](GALLERY.md#component-timer)

### Form

聚合表单值并支持结构化提交事件。

注册范围: core / core-trusted / upstream.

```text
Form(children: Node[])
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |

[完整可运行 OpenUI 示例: Inputs and form](GALLERY.md#component-inputs)

### SearchImage

使用可选 Host 图片 resolver，缺少能力时显示占位。

注册范围: core / core-trusted / upstream.

```text
SearchImage(query: string, aspectRatio?: number, radius?: Radius, fit?: "cover" | "contain")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| query | 是 | `{"type":"string"}` |
| aspectRatio | 否 | `{"type":"number"}` |
| radius | 否 | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| fit | 否 | `{"type":"string","enum":["cover","contain"]}` |

[完整可运行 OpenUI 示例: An answer, composed](GALLERY.md#component-answer)

### Image

HTTP(S) 图片；加载失败可按查询回退。

注册范围: core / core-trusted / upstream.

```text
Image(src: string, alt: string, aspectRatio?: number, radius?: Radius, fit?: "cover" | "contain")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| src | 是 | `{"type":"string"}` |
| alt | 是 | `{"type":"string"}` |
| aspectRatio | 否 | `{"type":"number"}` |
| radius | 否 | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| fit | 否 | `{"type":"string","enum":["cover","contain"]}` |

[完整可运行 OpenUI 示例: Images](GALLERY.md#component-images)

### Icon

按名称显示 Lucide 图标。

注册范围: core / core-trusted / upstream.

```text
Icon(name: string, size?: "sm" | "md" | "lg" | "xl", color?: Color)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| name | 是 | `{"type":"string"}` |
| size | 否 | `{"type":"string","enum":["sm","md","lg","xl"]}` |
| color | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Pressable grid](GALLERY.md#component-pressable)

### Table

通用数据表；不是完整科学数据网格。

注册范围: core / core-trusted / upstream.

```text
Table(columns: string[], rows: any[][])
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| columns | 是 | `{"type":"array","items":{"type":"string"}}` |
| rows | 是 | `{"type":"array","items":{"type":"array","items":{}}}` |

[完整可运行 OpenUI 示例: Table](GALLERY.md#component-table)

### Chart

通用图表；不等于科学图形交互套件。

注册范围: core / core-trusted / upstream.

```text
Chart(type: "bar" | "line" | "area" | "pie" | "donut" | "scatter", data: Record<string, string | number>[], x?: string, series?: string[], format?: "number" | "currency" | "percent", currency?: string, stacked?: boolean, height?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| type | 是 | `{"type":"string","enum":["bar","line","area","pie","donut","scatter"]}` |
| data | 是 | `{"type":"array","items":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"anyOf":[{"type":"string"},{"type":"number"}]}}}` |
| x | 否 | `{"type":"string"}` |
| series | 否 | `{"type":"array","items":{"type":"string"}}` |
| format | 否 | `{"type":"string","enum":["number","currency","percent"]}` |
| currency | 否 | `{"type":"string"}` |
| stacked | 否 | `{"type":"boolean"}` |
| height | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Charts](GALLERY.md#component-chart)

### Flashcard

翻转学习卡片。

注册范围: core / core-trusted / upstream.

```text
Flashcard(front: string | Node[], back: string | Node[], hint?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| front | 是 | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| back | 是 | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| hint | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Celebration

本地庆祝动效。

注册范围: core / core-trusted / upstream.

```text
Celebration(when: boolean)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| when | 是 | `{"type":"boolean"}` |

[完整可运行 OpenUI 示例: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Svg

声明式 SVG 容器，不执行脚本。

注册范围: core / core-trusted / upstream.

```text
Svg(children: Node[], viewBox: string, width?: Length, height?: Length)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| viewBox | 是 | `{"type":"string"}` |
| width | 否 | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| height | 否 | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Circle

SVG 圆。

注册范围: core / core-trusted / upstream.

```text
Circle(cx: number, cy: number, r: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| cx | 是 | `{"type":"number"}` |
| cy | 是 | `{"type":"number"}` |
| r | 是 | `{"type":"number"}` |
| fill | 否 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Ellipse

SVG 椭圆。

注册范围: core / core-trusted / upstream.

```text
Ellipse(cx: number, cy: number, rx: number, ry: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| cx | 是 | `{"type":"number"}` |
| cy | 是 | `{"type":"number"}` |
| rx | 是 | `{"type":"number"}` |
| ry | 是 | `{"type":"number"}` |
| fill | 否 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Rect

SVG 矩形。

注册范围: core / core-trusted / upstream.

```text
Rect(x: number, y: number, width: number, height: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number, rx?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| x | 是 | `{"type":"number"}` |
| y | 是 | `{"type":"number"}` |
| width | 是 | `{"type":"number"}` |
| height | 是 | `{"type":"number"}` |
| fill | 否 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |
| rx | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Line

SVG 线段。

注册范围: core / core-trusted / upstream.

```text
Line(x1: number, y1: number, x2: number, y2: number, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| x1 | 是 | `{"type":"number"}` |
| y1 | 是 | `{"type":"number"}` |
| x2 | 是 | `{"type":"number"}` |
| y2 | 是 | `{"type":"number"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Path

SVG 路径。

注册范围: core / core-trusted / upstream.

```text
Path(d: string, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| d | 是 | `{"type":"string"}` |
| fill | 否 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Polyline

SVG 折线。

注册范围: core / core-trusted / upstream.

```text
Polyline(points: string, stroke?: Color, strokeWidth?: number, fill?: Color, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| points | 是 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| fill | 否 | `{"type":"string"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### Polygon

SVG 多边形。

注册范围: core / core-trusted / upstream.

```text
Polygon(points: string, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| points | 是 | `{"type":"string"}` |
| fill | 否 | `{"type":"string"}` |
| stroke | 否 | `{"type":"string"}` |
| strokeWidth | 否 | `{"type":"number"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### G

SVG 元素分组。

注册范围: core / core-trusted / upstream.

```text
G(children: Node[], transform?: string, opacity?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| children | 是 | `{"type":"array","items":{}}` |
| transform | 否 | `{"type":"string"}` |
| opacity | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### SvgText

SVG 文本标签。

注册范围: core / core-trusted / upstream.

```text
SvgText(text: string, x: number, y: number, size?: number, fill?: Color, anchor?: "start" | "middle" | "end", weight?: "normal" | "medium" | "semibold")
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| x | 是 | `{"type":"number"}` |
| y | 是 | `{"type":"number"}` |
| size | 否 | `{"type":"number"}` |
| fill | 否 | `{"type":"string"}` |
| anchor | 否 | `{"type":"string","enum":["start","middle","end"]}` |
| weight | 否 | `{"type":"string","enum":["normal","medium","semibold"]}` |

[完整可运行 OpenUI 示例: Svg driven by a slider](GALLERY.md#component-svg)

### YouTube

固定 no-cookie origin 的视频嵌入，需显式注册。

注册范围: core-trusted / upstream / custom.

```text
YouTube(video: string, title?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| video | 是 | `{"type":"string"}` |
| title | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: New primitives](GALLERY.md#composition-primitives)

### MapMarker

地理地图标记，输入纬度／经度。

注册范围: upstream / custom.

```text
MapMarker(label: string, lat: number, lng: number, category?: string, icon?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| label | 是 | `{"type":"string"}` |
| lat | 是 | `{"type":"number"}` |
| lng | 是 | `{"type":"number"}` |
| category | 否 | `{"type":"string"}` |
| icon | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: Map with a route](GALLERY.md#component-map)

### Map

地理地图，支持标记选择、分类、路线、视角与展开；不是晶体视图。

注册范围: upstream / custom.

```text
Map(markers: MapMarker[], route?: boolean, selected?: $binding<string>, height?: number)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| markers | 是 | `{"type":"array","items":{"$ref":"#/$defs/MapMarker"}}` |
| route | 否 | `{"type":"boolean"}` |
| selected | 否 | `{"type":"string"}` |
| height | 否 | `{"type":"number"}` |

[完整可运行 OpenUI 示例: Map with a route](GALLERY.md#component-map)

### HtmlView

流结束后在 opaque origin iframe 运行受限 HTML／脚本。

注册范围: upstream / custom.

```text
HtmlView(html: string, height?: number, title?: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| html | 是 | `{"type":"string"}` |
| height | 否 | `{"type":"number"}` |
| title | 否 | `{"type":"string"}` |

[完整可运行 OpenUI 示例: HtmlView game](GALLERY.md#component-html)

## 库函数索引：59 个

[Append](#append) · [Prepend](#prepend) · [Concat](#concat) · [Remove](#remove) · [RemoveAt](#removeat) · [Update](#update) · [Toggle](#toggle) · [Includes](#includes) · [Find](#find) · [IndexOf](#indexof) · [Take](#take) · [Slice](#slice) · [Unique](#unique) · [Reverse](#reverse) · [Range](#range) · [Pick](#pick) · [Shuffle](#shuffle) · [Flatten](#flatten) · [Chunk](#chunk) · [Pow](#pow) · [Sqrt](#sqrt) · [Random](#random) · [Clamp](#clamp) · [Percent](#percent) · [Lerp](#lerp) · [Allocate](#allocate) · [Payment](#payment) · [Convert](#convert) · [Format](#format) · [Join](#join) · [Plural](#plural) · [Pad](#pad) · [Upper](#upper) · [Lower](#lower) · [Trim](#trim) · [Capitalize](#capitalize) · [Split](#split) · [Replace](#replace) · [Duration](#duration) · [Default](#default) · [MixColor](#mixcolor) · [Now](#now) · [Today](#today) · [FormatDate](#formatdate) · [AddDays](#adddays) · [AddMonths](#addmonths) · [DaysBetween](#daysbetween) · [MonthsBetween](#monthsbetween) · [StartOf](#startof) · [GroupBy](#groupby) · [Pivot](#pivot) · [Top](#top) · [Between](#between) · [Bucket](#bucket) · [Cumulative](#cumulative) · [MovingAvg](#movingavg) · [Change](#change) · [Histogram](#histogram) · [Stats](#stats)

### Append

返回末尾追加一项的列表副本。

```text
Append(list: any[], item: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| item | 是 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy of the list with item added at the end

### Prepend

返回开头增加一项的列表副本。

```text
Prepend(list: any[], item: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| item | 是 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy of the list with item added at the start

### Concat

连接两个列表。

```text
Concat(list: any[], more: any[]) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| more | 是 | `{"type":"array","items":{}}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Joins two lists

### Remove

按字段值移除；空字段表示比较项本身。

```text
Remove(list: any[], field: string, value: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| value | 是 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy without the items whose field equals value; field "" compares the items themselves

### RemoveAt

按索引删除；负索引从末尾计数。

```text
RemoveAt(list: any[], index: number) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| index | 是 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy without the item at index (0-based; negative counts from the end)

### Update

修改匹配项的指定字段。

```text
Update(list: any[], field: string, value: any, setField: string, setValue: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| value | 是 | `{}` |
| setField | 是 | `{"type":"string"}` |
| setValue | 是 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy where items whose field equals value get setField set to setValue

### Toggle

字符串／数字集合中添加或移除一项。

```text
Toggle(list: any[], item: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| item | 是 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Adds item if missing, removes it if present (a set of strings or numbers)

### Includes

判断列表包含项或文本包含子串。

```text
Includes(list: any[] | string, item: any) → boolean
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}` |
| item | 是 | `{}` |

返回 schema: `{"type":"boolean"}`.

上游精确约定（保留原文中的默认值／边界）: True if the list has item, or the text contains it

### Find

返回首个字段匹配项，无匹配返回 null。

```text
Find(list: any[], field: string, value: any) → any
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| value | 是 | `{}` |

返回 schema: `{}`.

上游精确约定（保留原文中的默认值／边界）: First item whose field equals value, or null

### IndexOf

返回项索引，无匹配返回 -1。

```text
IndexOf(list: any[], item: any) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| item | 是 | `{}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Index of item in the list, or -1

### Take

取前 n 项；负数取末尾项。

```text
Take(list: any[], n: number) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| n | 是 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: The first n items; a negative n takes the last n

### Slice

截取列表或文本，终点不包含，支持负索引。

```text
Slice(list: any[] | string, start: number, end?: number) → any[] | string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}` |
| start | 是 | `{"type":"number"}` |
| end | 否 | `{"type":"number"}` |

返回 schema: `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}`.

上游精确约定（保留原文中的默认值／边界）: Items, or characters of text, from start up to end (not included); negative counts from the end

### Unique

按首次出现顺序去重。

```text
Unique(list: any[]) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Distinct items in first-seen order

### Reverse

逆序副本。

```text
Reverse(list: any[]) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy in reverse order

### Range

生成终点不包含的数列，默认步长 1。

```text
Range(start: number, end: number, step?: number) → number[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| start | 是 | `{"type":"number"}` |
| end | 是 | `{"type":"number"}` |
| step | 否 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{"type":"number"}}`.

上游精确约定（保留原文中的默认值／边界）: Numbers from start up to end (not included) by step (default 1), e.g. @Range(0, 3) is [0, 1, 2]

### Pick

随机取项，空列表返回 null；在 @Set 内调用以固定一次抽取。

```text
Pick(list: any[]) → any
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |

返回 schema: `{}`.

上游精确约定（保留原文中的默认值／边界）: A random item, or null for an empty list; draws anew each time, so call it inside @Set

### Shuffle

随机排序副本，宜在 @Set 内调用。

```text
Shuffle(list: any[]) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy in random order; call it inside @Set

### Flatten

将一层嵌套列表展开。

```text
Flatten(list: any[]) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: One list from a list of lists, e.g. [[1, 2], [3]] is [1, 2, 3]

### Chunk

按大小分组。

```text
Chunk(list: any[], size: number) → any[][]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| size | 是 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{"type":"array","items":{}}}`.

上游精确约定（保留原文中的默认值／边界）: The list cut into lists of size items, e.g. for weeks of 7 days or pages

### Pow

幂运算。

```text
Pow(base: number, exponent: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| base | 是 | `{"type":"number"}` |
| exponent | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: base raised to exponent

### Sqrt

平方根，负数结果为 null。

```text
Sqrt(number: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| number | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Square root; null for a negative number

### Random

范围随机数；整数模式包含上界，宜在 @Set 内调用。

```text
Random(min: number, max: number, integer?: boolean) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| min | 是 | `{"type":"number"}` |
| max | 是 | `{"type":"number"}` |
| integer | 否 | `{"type":"boolean"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Random number from min to max (integer true: a whole number, max included); draws anew each time, so call it inside @Set

### Clamp

将值限制在 min/max 内。

```text
Clamp(number: number, min: number, max: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| number | 是 | `{"type":"number"}` |
| min | 是 | `{"type":"number"}` |
| max | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: number kept between min and max

### Percent

part/total*100；total 为零返回 0。

```text
Percent(part: number, total: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| part | 是 | `{"type":"number"}` |
| total | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: part / total * 100, e.g. @Percent(3, 4) is 75; 0 when total is 0

### Lerp

按比例在两值之间插值。

```text
Lerp(a: number, b: number, t: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| a | 是 | `{"type":"number"}` |
| b | 是 | `{"type":"number"}` |
| t | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: The value a fraction t of the way from a to b

### Allocate

按权重分配并舍入，保证分配总和。

```text
Allocate(total: number, weights: number[], decimals?: number) → number[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| total | 是 | `{"type":"number"}` |
| weights | 是 | `{"type":"array","items":{"type":"number"}}` |
| decimals | 否 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{"type":"number"}}`.

上游精确约定（保留原文中的默认值／边界）: Splits total in proportion to weights, rounded to decimals (default 2), so the parts add up to exactly total, e.g. @Allocate(100, [1, 1, 1]) is [33.34, 33.33, 33.33]

### Payment

按周期利率计算还款；不是科学计算求解器。

```text
Payment(principal: number, rate: number, periods: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| principal | 是 | `{"type":"number"}` |
| rate | 是 | `{"type":"number"}` |
| periods | 是 | `{"type":"number"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Payment per period that repays principal over periods at rate percent per period, e.g. a 30-year loan at 6% a year: @Payment(300000, 6 / 12, 360)

### Convert

仅支持实现列出的常用单位及温度，不支持任意科学单位或 eV/Hartree 转换。

```text
Convert(value: number, from: string, to: string) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"number"}` |
| from | 是 | `{"type":"string"}` |
| to | 是 | `{"type":"string"}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: value from one unit to another: mm cm m km in ft yd mi; mg g kg oz lb st; ml l tsp tbsp floz cup pt qt gal (US); m/s km/h mph kn; m2 km2 ft2 ha acre; c f k

### Format

数字、货币、百分比、紧凑数量格式化。

```text
Format(value: number, kind?: "number" | "currency" | "percent" | "compact", decimals?: number, currency?: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"type":"number"}` |
| kind | 否 | `{"type":"string","enum":["number","currency","percent","compact"]}` |
| decimals | 否 | `{"type":"number"}` |
| currency | 否 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Number as text: "number" 12,345.6, "currency" $12,345.68 (currency is a code like "EUR"), "percent" 45 -> 45%, "compact" 1.2M ($1.2M with a currency)

### Join

按分隔符连接项或字段，跳过 null。

```text
Join(list: any[], sep?: string, field?: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| list | 是 | `{"type":"array","items":{}}` |
| sep | 否 | `{"type":"string"}` |
| field | 否 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Joins the items (or their field) into text with sep (default ", "), skipping nulls

### Plural

英文数量与单复数词组；不是通用本地化引擎。

```text
Plural(n: number, word: string, plural?: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| n | 是 | `{"type":"number"}` |
| word | 是 | `{"type":"string"}` |
| plural | 否 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Count and word: @Plural(1, "guest") is "1 guest", 3 gives "3 guests"; plural defaults to word + "s"

### Pad

在开头补齐字符。

```text
Pad(value: string | number, length: number, char?: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| length | 是 | `{"type":"number"}` |
| char | 否 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Pads the start of value to length with char (default "0"), e.g. 7 -> "07"

### Upper

转大写。

```text
Upper(text: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Text in upper case

### Lower

转小写。

```text
Lower(text: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Text in lower case

### Trim

去除首尾空格。

```text
Trim(text: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Text without spaces at the start and end

### Capitalize

每个单词首字母大写。

```text
Capitalize(text: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Each word with a capital first letter, e.g. "new york" is "New York"

### Split

按分隔符切分、去空格、丢弃空项。

```text
Split(text: string, sep?: string) → string[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| sep | 否 | `{"type":"string"}` |

返回 schema: `{"type":"array","items":{"type":"string"}}`.

上游精确约定（保留原文中的默认值／边界）: List of the parts of text between sep (default ","), each trimmed, empty parts dropped, e.g. @Split("a, b,,c") is ["a", "b", "c"]

### Replace

替换所有匹配文本。

```text
Replace(text: string, find: string, replacement: string) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |
| find | 是 | `{"type":"string"}` |
| replacement | 是 | `{"type":"string"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Text with every find replaced by replacement

### Duration

将秒格式化为时长文本。

```text
Duration(seconds: number, style?: "short" | "clock") → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| seconds | 是 | `{"type":"number"}` |
| style | 否 | `{"type":"string","enum":["short","clock"]}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Seconds as text: "short" 1h 20m, 4m 05s, 45s (default); "clock" 1:20:00, 4:05

### Default

为空、空字符串或非数字输入时使用后备值；具体语义见原始描述。

```text
Default(value?: any, fallback: any) → any
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| value | 否 | `{}` |
| fallback | 是 | `{}` |

返回 schema: `{}`.

上游精确约定（保留原文中的默认值／边界）: value, or fallback when value is null, "" or not a number, e.g. an empty number input: @Default($weight, 0)

### MixColor

在两种十六进制颜色之间插值。

```text
MixColor(from: string, to: string, t: number) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| from | 是 | `{"type":"string"}` |
| to | 是 | `{"type":"string"}` |
| t | 是 | `{"type":"number"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: The hex color a fraction t of the way from one hex color to another, e.g. @MixColor("#ffffff", "#0285ff", 0.5) for a heatmap or a tint

### Now

当前时间 ISO 字符串；非确定性。

```text
Now() → string
```

无显式参数。

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: The current date and time as an ISO string

### Today

用户时区的今天日期；非确定性。

```text
Today() → string
```

无显式参数。

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: Today's date in the viewer's time zone, as "YYYY-MM-DD"

### FormatDate

日期／时间文本格式化。

```text
FormatDate(date: string | number, style?: "date" | "short" | "long" | "weekday" | "month" | "time" | "datetime" | "iso") → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| date | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| style | 否 | `{"type":"string","enum":["date","short","long","weekday","month","time","datetime","iso"]}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: A date as text: "date" Oct 9, 2026 (default), "short" Oct 9, "long" Friday, October 9, 2026, "weekday" Fri, "month" Oct 2026, "time" 9:30 PM, "datetime", "iso" 2026-10-09. Dates are "YYYY-MM-DD", ISO or a timestamp

### AddDays

增减日数并返回日期。

```text
AddDays(date: string | number, days: number) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| date | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| days | 是 | `{"type":"number"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: The date days later (negative: earlier), as "YYYY-MM-DD"

### AddMonths

增减月数，自动限制在目标月内。

```text
AddMonths(date: string | number, months: number) → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| date | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| months | 是 | `{"type":"number"}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: The date months later (negative: earlier), kept within the month (Jan 31 + 1 is Feb 28), as "YYYY-MM-DD"; 12 months is a year

### DaysBetween

日期间日历天数，可为负。

```text
DaysBetween(from: string | number, to: string | number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| from | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| to | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Calendar days from one date to another (negative if to is earlier)

### MonthsBetween

日期间完整月数，可为负。

```text
MonthsBetween(from: string | number, to: string | number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| from | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| to | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |

返回 schema: `{"type":"number"}`.

上游精确约定（保留原文中的默认值／边界）: Whole months from one date to another (negative if to is earlier); @Floor(@MonthsBetween(birthday, @Today()) / 12) is an age

### StartOf

周一／月／年的第一天。

```text
StartOf(date: string | number, unit: "week" | "month" | "year") → string
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| date | 是 | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| unit | 是 | `{"type":"string","enum":["week","month","year"]}` |

返回 schema: `{"type":"string"}`.

上游精确约定（保留原文中的默认值／边界）: First day of the date's "week" (Monday), "month" or "year", as "YYYY-MM-DD"

### GroupBy

按键分组聚合，保留首次出现顺序。

```text
GroupBy(rows: any[], key: string, field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → {key: string | number, value: number}[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| key | 是 | `{"type":"string"}` |
| field | 否 | `{"type":"string"}` |
| agg | 否 | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

返回 schema: `{"type":"array","items":{"type":"object","properties":{"key":{"anyOf":[{"type":"string"},{"type":"number"}]},"value":{"type":"number"}},"required":["key","value"],"additionalProperties":false}}`.

上游精确约定（保留原文中的默认值／边界）: One row per distinct key, in first-seen order; value is agg of field (default "sum"), or the row count without a field

### Pivot

按行列键进行透视聚合。

```text
Pivot(rows: any[], rowKey: string, colKey: string, field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → Record<string, string | number>[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| rowKey | 是 | `{"type":"string"}` |
| colKey | 是 | `{"type":"string"}` |
| field | 否 | `{"type":"string"}` |
| agg | 否 | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

返回 schema: `{"type":"array","items":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"anyOf":[{"type":"string"},{"type":"number"}]}}}`.

上游精确约定（保留原文中的默认值／边界）: One row per rowKey value with a column per colKey value holding agg of field, for stacked or grouped charts

### Top

按字段取最大或最小的 n 行。

```text
Top(rows: any[], field: string, n: number, direction?: "desc" | "asc") → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| n | 是 | `{"type":"number"}` |
| direction | 否 | `{"type":"string","enum":["desc","asc"]}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: The n rows with the largest field ("asc": the smallest)

### Between

闭区间范围筛选，支持数字或有序文本日期。

```text
Between(rows: any[], field: string, min?: any, max?: any) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| min | 否 | `{}` |
| max | 否 | `{}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Rows whose field is from min to max, both included; compares numbers, or text such as "YYYY-MM-DD" dates. Leave min or max null for an open end

### Bucket

按日／周／月分桶。

```text
Bucket(rows: any[], dateField: string, unit: "day" | "week" | "month", field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → {key: string | number, value: number}[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| dateField | 是 | `{"type":"string"}` |
| unit | 是 | `{"type":"string","enum":["day","week","month"]}` |
| field | 否 | `{"type":"string"}` |
| agg | 否 | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

返回 schema: `{"type":"array","items":{"type":"object","properties":{"key":{"anyOf":[{"type":"string"},{"type":"number"}]},"value":{"type":"number"}},"required":["key","value"],"additionalProperties":false}}`.

上游精确约定（保留原文中的默认值／边界）: Rows per day, week (from Monday) or month of dateField, in date order, empty periods 0 for sum and count; key is "YYYY-MM-DD", or "YYYY-MM" for months

### Cumulative

将字段替换为累计总和。

```text
Cumulative(rows: any[], field: string) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy of the rows with field replaced by its running total (field "" for a list of numbers)

### MovingAvg

按窗口计算移动平均。

```text
MovingAvg(rows: any[], field: string, window: number) → any[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| rows | 是 | `{"type":"array","items":{}}` |
| field | 是 | `{"type":"string"}` |
| window | 是 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{}}`.

上游精确约定（保留原文中的默认值／边界）: Copy of the rows with field replaced by the average of its last window values (field "" for a list of numbers)

### Change

相对前值的百分比变化；前值为零返回 null。

```text
Change(current: number, previous: number) → number
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| current | 是 | `{"type":"number"}` |
| previous | 是 | `{"type":"number"}` |

返回 schema: `{"anyOf":[{"type":"number"},{"type":"null"}]}`.

上游精确约定（保留原文中的默认值／边界）: Percent change from previous to current, e.g. @Change(120, 100) is 20; null when previous is 0

### Histogram

等宽区间计数。

```text
Histogram(values: number[], bins: number, min?: number, max?: number) → {key: string, value: number, start: number, end: number}[]
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| values | 是 | `{"type":"array","items":{"type":"number"}}` |
| bins | 是 | `{"type":"number"}` |
| min | 否 | `{"type":"number"}` |
| max | 否 | `{"type":"number"}` |

返回 schema: `{"type":"array","items":{"type":"object","properties":{"key":{"type":"string"},"value":{"type":"number"},"start":{"type":"number"},"end":{"type":"number"}},"required":["key","value","start","end"],"additionalProperties":false}}`.

上游精确约定（保留原文中的默认值／边界）: Counts numbers into equal-width bins (value is the count); min and max fix the range, default the data's

### Stats

数字统计摘要；空输入按函数约定返回零值。

```text
Stats(values: number[]) → {count: number, min: number, max: number, mean: number, median: number, stdev: number}
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| values | 是 | `{"type":"array","items":{"type":"number"}}` |

返回 schema: `{"type":"object","properties":{"count":{"type":"number"},"min":{"type":"number"},"max":{"type":"number"},"mean":{"type":"number"},"median":{"type":"number"},"stdev":{"type":"number"}},"required":["count","min","max","mean","median","stdev"],"additionalProperties":false}`.

上游精确约定（保留原文中的默认值／边界）: Summary of numbers, all zeros for an empty list

## 动作与内建能力

### CopyToClipboard

通过 Host 复制文本。

```text
CopyToClipboard(text: string)
```

| 参数 | 必填 | Schema |
| --- | --- | --- |
| text | 是 | `{"type":"string"}` |

@ToAssistant、@Set、@Reset、@Run 和 Query/Mutation 等由官方运行时提供。通过 Host 章节和 Gallery 学习用法；不得假定它们是当前库的自定义函数或可绕过权限。Random/Pick/Shuffle/Now/Today 不是确定性科学求解；Convert 支持的单位以描述为准，没有原生 eV/Hartree 或量子态转换。
