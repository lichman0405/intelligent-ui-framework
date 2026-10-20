# Complete API and component/function reference

[中文](../zh-CN/REFERENCE.md) · [Contents](README.md)

Generated from the actual 0.2.0 specification. Spec SHA-256: `89b5ff65a0c652f3bd1751d50cf2f1cacb65a3ee22bafa9ea97468eb88a6f31a`. Regenerate with `node scripts/build-docs.mjs` after building runtime.

Signature defines positional order. Schema defines types/requiredness/enums, not every runtime visual default. Do not infer 0/false for optional props with no declared default; see Gallery/implementation for appearance and behavior. Use null placeholders only where accepted by schema/runtime conventions. $binding<T> denotes restorable bindings; Node/Color/Length/Radius are OpenUI semantic types.

## Public modules

| Import | Type entry |
| --- | --- |
| `@intelligent-ui/framework` | `./dist/index.d.ts` |
| `@intelligent-ui/framework/react` | `./dist/react/index.d.ts` |
| `@intelligent-ui/framework/protocol` | `./dist/protocol/index.d.ts` |
| `@intelligent-ui/framework/prompt` | `./dist/prompt/index.d.ts` |
| `@intelligent-ui/framework/styles.css` | explicit CSS |
| `@intelligent-ui/framework/adapters` | `./dist/adapters/index.d.ts` |
| `@intelligent-ui/framework/gallery` | `./dist/gallery/index.d.ts` |
| `@intelligent-ui/framework/benchmark` | `./dist/benchmark/index.d.ts` |
| `@intelligent-ui/framework/plugins/map` | `./dist/plugins/map/index.d.ts` |
| `@intelligent-ui/framework/plugins/html` | `./dist/plugins/html/index.d.ts` |
| `@intelligent-ui/framework/plugins/upstream` | `./dist/plugins/upstream.d.ts` |
| `@intelligent-ui/framework/map-worker` | `./dist/map-worker.d.ts` |
| `@intelligent-ui/framework/plugins/map/styles.css` | explicit CSS |

## Renderer props

| Prop | Type | Contract |
| --- | --- | --- |
| artifact | UIArtifactV1 \| unknown | Required; validates envelope and final source |
| isStreaming | boolean | Default false; previews accumulated source while true |
| hostAdapter | UIHostAdapter | Default inert adapter; keep identity stable |
| hostSessionId / hostTurnId | string | Trusted context, not model-supplied identity |
| theme | "light" \| "dark" | Default light |
| themeTokens | Record<--iui-*, string> | Scoped tokens; unsafe values filtered |
| mode | "core" \| "trusted-extras" | Default core; explicit registry selects supported signatures |
| registry | IuiRegistry | Trusted exact registry; keep identity stable |
| toolOptions | HostBridgeOptions 子集 / subset | Call/concurrency/timeout/result-byte/node budgets |
| onError | (Diagnostic[]) => void | Diagnostics; do not classify by English messages |
| fallback | ReactNode | Default safe status message |
| className | string | Added to iui-root |
| validation | ArtifactValidationOptions | Validation limits; cannot bypass registry |

## API entry functions

| API | Behavior |
| --- | --- |
| `createArtifact(source,id,state?,signature?)` | Constructs and validates; throws on failure |
| `validateArtifact(value,options?)` | Returns success/data or success/errors; does not parse source syntax |
| `validateJSON(value,limits?) / validateState(value,limits?)` | Finite JSON/object-state validation and defensive copies |
| `isJsonRecord(value)` | Plain-record predicate, not full deep validation |
| `createIuiLibrary({id?,trustedExtras?,plugins?})` | Creates an official Library; defaults to core, plugins require new ID |
| `createIuiRegistry(...registrations)` | Exact ID/version lookup with frozen registration metadata |
| `createHostBridge(host,context,options?)` | Controlled calls/actions/state/lifecycle, normally managed by Renderer |
| `safeWebUrl(value)` | Normalized credential-free HTTP(S) URL or null |
| `getComponentSpec(modeOrSpec?)` | Defensive LibrarySpec copy, core by default |
| `createSystemPrompt(options?,modeOrSpec?,profile?)` | Pure Prompt generation, core/chat by default |
| `createMapPlugin(options?) / createHtmlPlugin(options?)` | Optional plugin definitions from trusted code |
| `htmlContentSecurityPolicy(options?)` | Returns child CSP, does not configure parent CSP |
| `createUpstreamRegistration({map?,html?}?)` | Registration for all 55 original components |
| `createWebResolvers(options?)` | Optional public image/route/disposal ports |
| `createArtifactStore(storage,options?)` | save/load/saveState/remove over Host storage |
| `createBrowserPorts({allowUrl,open,writeText})` | Navigation/clipboard ports requiring Host policy |
| `createGalleryArtifact(id)` | Creates upstream example; unknown ID throws |
| `runBenchmark(cases,provider,options?)` | Sequential provider-neutral checks with per-case results |

Other exports: library/trustedLibrary, coreRegistration/trustedRegistration, coreRegistry/trustedRegistry, upstreamRegistration/upstreamRegistry, MapMarker, mapWorkerUrl; raw Prompt presets/four examples; Gallery programs/compositionPrograms/toolPrograms/galleryPrograms/demoTools/demoToolSpecs. Protocol constants: PROTOCOL_VERSION=1.0, LIBRARY_ID=core, LIBRARY_VERSION=0.1.0, PACKAGE_VERSION=0.2.0, DEFAULT_LIMITS. Full DTO types are in packaged .d.ts and the frozen contract. Host/adapter/benchmark arguments/defaults are documented in their chapters.

## Component index: 55

[Col](#col) · [Row](#row) · [Box](#box) · [Grid](#grid) · [Card](#card) · [Carousel](#carousel) · [Popover](#popover) · [Divider](#divider) · [Spacer](#spacer) · [Title](#title) · [Text](#text) · [Caption](#caption) · [Label](#label) · [Badge](#badge) · [Link](#link) · [List](#list) · [ListItem](#listitem) · [Markdown](#markdown) · [Quote](#quote) · [Code](#code) · [Math](#math) · [Button](#button) · [IconButton](#iconbutton) · [Pressable](#pressable) · [Input](#input) · [TextArea](#textarea) · [Select](#select) · [SegmentedControl](#segmentedcontrol) · [Slider](#slider) · [Checkbox](#checkbox) · [RadioGroup](#radiogroup) · [DatePicker](#datepicker) · [Timer](#timer) · [Form](#form) · [SearchImage](#searchimage) · [Image](#image) · [Icon](#icon) · [Table](#table) · [Chart](#chart) · [Flashcard](#flashcard) · [Celebration](#celebration) · [Svg](#svg) · [Circle](#circle) · [Ellipse](#ellipse) · [Rect](#rect) · [Line](#line) · [Path](#path) · [Polyline](#polyline) · [Polygon](#polygon) · [G](#g) · [SvgText](#svgtext) · [YouTube](#youtube) · [MapMarker](#mapmarker) · [Map](#map) · [HtmlView](#htmlview)

### Col

Vertical layout. Without gap it spaces blocks like an article.

Registries: core / core-trusted / upstream.

```text
Col(children: Node[], gap?: number, align?: "start" | "center" | "end" | "stretch")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| gap | no | `{"type":"number"}` |
| align | no | `{"type":"string","enum":["start","center","end","stretch"]}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Row

Horizontal layout; items are vertically centered.

Registries: core / core-trusted / upstream.

```text
Row(children: Node[], gap?: number, align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between", wrap?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| gap | no | `{"type":"number"}` |
| align | no | `{"type":"string","enum":["start","center","end","stretch"]}` |
| justify | no | `{"type":"string","enum":["start","center","end","between"]}` |
| wrap | no | `{"type":"boolean"}` |

[Complete OpenUI example: Text](GALLERY.md#component-text)

### Box

Flex container, a column by default. radius also clips the content.

Registries: core / core-trusted / upstream.

```text
Box(children?: Node[], direction?: "row" | "col", gap?: number, padding?: number, background?: Color, radius?: Radius, border?: boolean, width?: Length, height?: Length, flex?: number, align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between", wrap?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | no | `{"type":"array","items":{}}` |
| direction | no | `{"type":"string","enum":["row","col"]}` |
| gap | no | `{"type":"number"}` |
| padding | no | `{"type":"number"}` |
| background | no | `{"type":"string"}` |
| radius | no | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| border | no | `{"type":"boolean"}` |
| width | no | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| height | no | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| flex | no | `{"type":"number"}` |
| align | no | `{"type":"string","enum":["start","center","end","stretch"]}` |
| justify | no | `{"type":"string","enum":["start","center","end","between"]}` |
| wrap | no | `{"type":"boolean"}` |

[Complete OpenUI example: Layout](GALLERY.md#component-layout)

### Grid

Equal columns (default 2). With minChildWidth (px), columns drop on narrow screens.

Registries: core / core-trusted / upstream.

```text
Grid(children: Node[], columns?: number, minChildWidth?: number, gap?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| columns | no | `{"type":"number"}` |
| minChildWidth | no | `{"type":"number"}` |
| gap | no | `{"type":"number"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Card

Panel with a border; soft is a filled panel for summaries.

Registries: core / core-trusted / upstream.

```text
Card(children: Node[], variant?: "outline" | "soft", padding?: number, gap?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| variant | no | `{"type":"string","enum":["outline","soft"]}` |
| padding | no | `{"type":"number"}` |
| gap | no | `{"type":"number"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Carousel

Horizontal row that scrolls and snaps, each child an item itemWidth px wide (default 240): photos, cards, options, days.

Registries: core / core-trusted / upstream.

```text
Carousel(children: Node[], itemWidth?: number, gap?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| itemWidth | no | `{"type":"number"}` |
| gap | no | `{"type":"number"}` |

[Complete OpenUI example: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Popover

Shows content in a small panel when the trigger is clicked: a definition, a source, details behind an Icon("info", "sm").

Registries: core / core-trusted / upstream.

```text
Popover(trigger: string | Node[], content: string | Node[])
```

| Parameter | Required | Schema |
| --- | --- | --- |
| trigger | yes | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| content | yes | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |

[Complete OpenUI example: New primitives](GALLERY.md#composition-primitives)

### Divider



Registries: core / core-trusted / upstream.

```text
Divider()
```

No explicit parameters.

[Complete OpenUI example: Text](GALLERY.md#component-text)

### Spacer

Fills the free space in a Row.

Registries: core / core-trusted / upstream.

```text
Spacer()
```

No explicit parameters.

[Complete OpenUI example: Layout](GALLERY.md#component-layout)

### Title

Heading; md for a card title, lg for a section, 2xl for a big number.

Registries: core / core-trusted / upstream.

```text
Title(text: string, size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", color?: Color)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| size | no | `{"type":"string","enum":["sm","md","lg","xl","2xl","3xl"]}` |
| color | no | `{"type":"string"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Text

Paragraph; supports **bold**, *italic*, `code` and [links](https://…). text may be a list mixing strings and inline components: [Icon("clock", "sm"), " 25 min · ", Badge("Easy")].

Registries: core / core-trusted / upstream.

```text
Text(text: string | Node[], size?: "xs" | "sm" | "md" | "lg", color?: Color, weight?: "normal" | "medium" | "semibold", italic?: boolean, lineThrough?: boolean, tabularNums?: boolean, maxLines?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| size | no | `{"type":"string","enum":["xs","sm","md","lg"]}` |
| color | no | `{"type":"string"}` |
| weight | no | `{"type":"string","enum":["normal","medium","semibold"]}` |
| italic | no | `{"type":"boolean"}` |
| lineThrough | no | `{"type":"boolean"}` |
| tabularNums | no | `{"type":"boolean"}` |
| maxLines | no | `{"type":"number"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Caption

Small secondary text.

Registries: core / core-trusted / upstream.

```text
Caption(text: string, color?: Color)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| color | no | `{"type":"string"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Label

Field or group label.

Registries: core / core-trusted / upstream.

```text
Label(text: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

[Complete OpenUI example: Text](GALLERY.md#component-text)

### Badge

Pill tag; icon is an optional leading lucide name.

Registries: core / core-trusted / upstream.

```text
Badge(text: string, color?: "neutral" | "info" | "success" | "warning" | "danger" | "purple" | "pink", icon?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| color | no | `{"type":"string","enum":["neutral","info","success","warning","danger","purple","pink"]}` |
| icon | no | `{"type":"string"}` |

[Complete OpenUI example: Text](GALLERY.md#component-text)

### Link

Opens an http(s) URL in a new tab.

Registries: core / core-trusted / upstream.

```text
Link(text: string, url: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| url | yes | `{"type":"string"}` |

[Complete OpenUI example: Text](GALLERY.md#component-text)

### List

timeline joins the markers with a line.

Registries: core / core-trusted / upstream.

```text
List(items: (string | ListItem)[], marker?: "bullet" | "number" | "none", timeline?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| items | yes | `{"type":"array","items":{"anyOf":[{"type":"string"},{"$ref":"#/$defs/ListItem"}]}}` |
| marker | no | `{"type":"string","enum":["bullet","number","none"]}` |
| timeline | no | `{"type":"boolean"}` |

[Complete OpenUI example: Lists and timeline](GALLERY.md#component-lists)

### ListItem

marker replaces the bullet or number, e.g. a time or an emoji.

Registries: core / core-trusted / upstream.

```text
ListItem(title: string, description?: string, marker?: string, children?: Node[])
```

| Parameter | Required | Schema |
| --- | --- | --- |
| title | yes | `{"type":"string"}` |
| description | no | `{"type":"string"}` |
| marker | no | `{"type":"string"}` |
| children | no | `{"type":"array","items":{}}` |

[Complete OpenUI example: Lists and timeline](GALLERY.md#component-lists)

### Markdown

Prose with headings, lists, quotes, code and tables.

Registries: core / core-trusted / upstream.

```text
Markdown(text: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Quote

A quotation or a callout with a side rule; cite names the source.

Registries: core / core-trusted / upstream.

```text
Quote(text: string, cite?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| cite | no | `{"type":"string"}` |

[Complete OpenUI example: New primitives](GALLERY.md#composition-primitives)

### Code

Code block with a copy button.

Registries: core / core-trusted / upstream.

```text
Code(code: string, language?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| code | yes | `{"type":"string"}` |
| language | no | `{"type":"string"}` |

[Complete OpenUI example: New primitives](GALLERY.md#composition-primitives)

### Math

LaTeX formula, e.g. Math("E = mc^2"); inline true to sit in a Text list.

Registries: core / core-trusted / upstream.

```text
Math(tex: string, inline?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| tex | yes | `{"type":"string"}` |
| inline | no | `{"type":"boolean"}` |

[Complete OpenUI example: New primitives](GALLERY.md#composition-primitives)

### Button

icon is a lucide name.

Registries: core / core-trusted / upstream.

```text
Button(label: string, action?: ActionExpression, variant?: "solid" | "outline" | "soft" | "ghost", color?: "primary" | "danger" | "success", size?: "sm" | "md" | "lg", icon?: string, disabled?: boolean, block?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| label | yes | `{"type":"string"}` |
| action | no | `{"$ref":"#/$defs/ActionExpression"}` |
| variant | no | `{"type":"string","enum":["solid","outline","soft","ghost"]}` |
| color | no | `{"type":"string","enum":["primary","danger","success"]}` |
| size | no | `{"type":"string","enum":["sm","md","lg"]}` |
| icon | no | `{"type":"string"}` |
| disabled | no | `{"type":"boolean"}` |
| block | no | `{"type":"boolean"}` |

[Complete OpenUI example: Buttons](GALLERY.md#component-buttons)

### IconButton

Round icon-only button; label is read aloud.

Registries: core / core-trusted / upstream.

```text
IconButton(icon: string, action?: ActionExpression, label?: string, variant?: "outline" | "ghost" | "solid")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| icon | yes | `{"type":"string"}` |
| action | no | `{"$ref":"#/$defs/ActionExpression"}` |
| label | no | `{"type":"string"}` |
| variant | no | `{"type":"string","enum":["outline","ghost","solid"]}` |

[Complete OpenUI example: Buttons](GALLERY.md#component-buttons)

### Pressable

Makes any content clickable, such as a tile or a swatch.

Registries: core / core-trusted / upstream.

```text
Pressable(children: Node[], action?: ActionExpression, selected?: boolean, padding?: number, background?: Color, radius?: Radius)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| action | no | `{"$ref":"#/$defs/ActionExpression"}` |
| selected | no | `{"type":"boolean"}` |
| padding | no | `{"type":"number"}` |
| background | no | `{"type":"string"}` |
| radius | no | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |

[Complete OpenUI example: Pressable grid](GALLERY.md#component-pressable)

### Input

Text or number field; a number field stores numbers.

Registries: core / core-trusted / upstream.

```text
Input(value: $binding<string | number>, label?: string, type?: "text" | "number", placeholder?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| label | no | `{"type":"string"}` |
| type | no | `{"type":"string","enum":["text","number"]}` |
| placeholder | no | `{"type":"string"}` |

[Complete OpenUI example: Segmented control](GALLERY.md#component-segmented)

### TextArea



Registries: core / core-trusted / upstream.

```text
TextArea(value: $binding<string>, label?: string, placeholder?: string, rows?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"string"}` |
| label | no | `{"type":"string"}` |
| placeholder | no | `{"type":"string"}` |
| rows | no | `{"type":"number"}` |

[Complete OpenUI example: Inputs and form](GALLERY.md#component-inputs)

### Select

Dropdown, for long option lists.

Registries: core / core-trusted / upstream.

```text
Select(value: $binding<string>, options: (string | {value: string, label: string})[], label?: string, placeholder?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"string"}` |
| options | yes | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| label | no | `{"type":"string"}` |
| placeholder | no | `{"type":"string"}` |

[Complete OpenUI example: Inputs and form](GALLERY.md#component-inputs)

### SegmentedControl

2 to 4 short choices in a row.

Registries: core / core-trusted / upstream.

```text
SegmentedControl(value: $binding<string>, options: (string | {value: string, label: string})[], block?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"string"}` |
| options | yes | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| block | no | `{"type":"boolean"}` |

[Complete OpenUI example: Segmented control](GALLERY.md#component-segmented)

### Slider

Shows label and value; unit like "%" or "$" formats the value.

Registries: core / core-trusted / upstream.

```text
Slider(value: $binding<number>, min: number, max: number, step?: number, label?: string, unit?: string, marks?: {value: number, label: string}[])
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"number"}` |
| min | yes | `{"type":"number"}` |
| max | yes | `{"type":"number"}` |
| step | no | `{"type":"number"}` |
| label | no | `{"type":"string"}` |
| unit | no | `{"type":"string"}` |
| marks | no | `{"type":"array","items":{"type":"object","properties":{"value":{"type":"number"},"label":{"type":"string"}},"required":["value","label"],"additionalProperties":false}}` |

[Complete OpenUI example: Sliders bound to state](GALLERY.md#component-gdp)

### Checkbox

lineThrough strikes the label when checked, for to-do lists.

Registries: core / core-trusted / upstream.

```text
Checkbox(checked: $binding<boolean>, label: string, lineThrough?: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| checked | yes | `{"type":"boolean"}` |
| label | yes | `{"type":"string"}` |
| lineThrough | no | `{"type":"boolean"}` |

[Complete OpenUI example: Checkbox list](GALLERY.md#component-checklist)

### RadioGroup

pills for short choices; cards for choices that need a description line.

Registries: core / core-trusted / upstream.

```text
RadioGroup(value: $binding<string>, options: (string | {value: string, label: string, description?: string})[], label?: string, variant?: "list" | "pills" | "cards")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"string"}` |
| options | yes | `{"type":"array","items":{"anyOf":[{"type":"string"},{"type":"object","properties":{"value":{"type":"string"},"label":{"type":"string"},"description":{"type":"string"}},"required":["value","label"],"additionalProperties":false}]}}` |
| label | no | `{"type":"string"}` |
| variant | no | `{"type":"string","enum":["list","pills","cards"]}` |

[Complete OpenUI example: Inputs and form](GALLERY.md#component-inputs)

### DatePicker

Dates are "YYYY-MM-DD".

Registries: core / core-trusted / upstream.

```text
DatePicker(value: $binding<string>, label?: string, min?: string, max?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"string"}` |
| label | no | `{"type":"string"}` |
| min | no | `{"type":"string"}` |
| max | no | `{"type":"string"}` |

[Complete OpenUI example: Inputs and form](GALLERY.md#component-inputs)

### Timer

Countdown with start, pause and reset. It counts the bound seconds down to 0, so other statements can react, e.g. $left == 0.

Registries: core / core-trusted / upstream.

```text
Timer(seconds: $binding<number>, label?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| seconds | yes | `{"type":"number"}` |
| label | no | `{"type":"string"}` |

[Complete OpenUI example: Timer](GALLERY.md#component-timer)

### Form

Groups fields; their values go with any @ToAssistant inside.

Registries: core / core-trusted / upstream.

```text
Form(children: Node[])
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |

[Complete OpenUI example: Inputs and form](GALLERY.md#component-inputs)

### SearchImage

An image from the optional Host image resolver. Without a resolver a labeled placeholder is shown. Name the exact subject.

Registries: core / core-trusted / upstream.

```text
SearchImage(query: string, aspectRatio?: number, radius?: Radius, fit?: "cover" | "contain")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| query | yes | `{"type":"string"}` |
| aspectRatio | no | `{"type":"number"}` |
| radius | no | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| fit | no | `{"type":"string","enum":["cover","contain"]}` |

[Complete OpenUI example: An answer, composed](GALLERY.md#component-answer)

### Image

Photo from a URL the user or a tool gave; if it fails, a photo is found for alt.

Registries: core / core-trusted / upstream.

```text
Image(src: string, alt: string, aspectRatio?: number, radius?: Radius, fit?: "cover" | "contain")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| src | yes | `{"type":"string"}` |
| alt | yes | `{"type":"string"}` |
| aspectRatio | no | `{"type":"number"}` |
| radius | no | `{"anyOf":[{"type":"string","enum":["sm","md","lg","xl","full"]},{"type":"number"}]}` |
| fit | no | `{"type":"string","enum":["cover","contain"]}` |

[Complete OpenUI example: Images](GALLERY.md#component-images)

### Icon

Lucide icon by name, e.g. "map-pin".

Registries: core / core-trusted / upstream.

```text
Icon(name: string, size?: "sm" | "md" | "lg" | "xl", color?: Color)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| name | yes | `{"type":"string"}` |
| size | no | `{"type":"string","enum":["sm","md","lg","xl"]}` |
| color | no | `{"type":"string"}` |

[Complete OpenUI example: Pressable grid](GALLERY.md#component-pressable)

### Table

Each row lists its cells in column order; a cell may be a component. Number columns align right.

Registries: core / core-trusted / upstream.

```text
Table(columns: string[], rows: any[][])
```

| Parameter | Required | Schema |
| --- | --- | --- |
| columns | yes | `{"type":"array","items":{"type":"string"}}` |
| rows | yes | `{"type":"array","items":{"type":"array","items":{}}}` |

[Complete OpenUI example: Table](GALLERY.md#component-table)

### Chart

Rows of data; x is the category key (a number key for scatter), series the value keys (default: every number key). percent values are like 45; currency is a code like "EUR".

Registries: core / core-trusted / upstream.

```text
Chart(type: "bar" | "line" | "area" | "pie" | "donut" | "scatter", data: Record<string, string | number>[], x?: string, series?: string[], format?: "number" | "currency" | "percent", currency?: string, stacked?: boolean, height?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| type | yes | `{"type":"string","enum":["bar","line","area","pie","donut","scatter"]}` |
| data | yes | `{"type":"array","items":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"anyOf":[{"type":"string"},{"type":"number"}]}}}` |
| x | no | `{"type":"string"}` |
| series | no | `{"type":"array","items":{"type":"string"}}` |
| format | no | `{"type":"string","enum":["number","currency","percent"]}` |
| currency | no | `{"type":"string"}` |
| stacked | no | `{"type":"boolean"}` |
| height | no | `{"type":"number"}` |

[Complete OpenUI example: Charts](GALLERY.md#component-chart)

### Flashcard

Card that flips between front and back when tapped. Put several in a Carousel or Grid.

Registries: core / core-trusted / upstream.

```text
Flashcard(front: string | Node[], back: string | Node[], hint?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| front | yes | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| back | yes | `{"anyOf":[{"type":"string"},{"type":"array","items":{}}]}` |
| hint | no | `{"type":"string"}` |

[Complete OpenUI example: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Celebration

Bursts confetti when its condition turns true, e.g. Celebration($score == 5) at the end of a quiz.

Registries: core / core-trusted / upstream.

```text
Celebration(when: boolean)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| when | yes | `{"type":"boolean"}` |

[Complete OpenUI example: Spanish flashcards and a quiz](GALLERY.md#composition-flashcards)

### Svg

A drawing for steps, parts, mechanisms, diagrams and layouts. Scales to its width; its shapes take expressions, so state can move them.

Registries: core / core-trusted / upstream.

```text
Svg(children: Node[], viewBox: string, width?: Length, height?: Length)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| viewBox | yes | `{"type":"string"}` |
| width | no | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| height | no | `{"anyOf":[{"type":"number"},{"type":"string"}]}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Circle



Registries: core / core-trusted / upstream.

```text
Circle(cx: number, cy: number, r: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| cx | yes | `{"type":"number"}` |
| cy | yes | `{"type":"number"}` |
| r | yes | `{"type":"number"}` |
| fill | no | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Ellipse



Registries: core / core-trusted / upstream.

```text
Ellipse(cx: number, cy: number, rx: number, ry: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| cx | yes | `{"type":"number"}` |
| cy | yes | `{"type":"number"}` |
| rx | yes | `{"type":"number"}` |
| ry | yes | `{"type":"number"}` |
| fill | no | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Rect



Registries: core / core-trusted / upstream.

```text
Rect(x: number, y: number, width: number, height: number, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number, rx?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| x | yes | `{"type":"number"}` |
| y | yes | `{"type":"number"}` |
| width | yes | `{"type":"number"}` |
| height | yes | `{"type":"number"}` |
| fill | no | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |
| rx | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Line



Registries: core / core-trusted / upstream.

```text
Line(x1: number, y1: number, x2: number, y2: number, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| x1 | yes | `{"type":"number"}` |
| y1 | yes | `{"type":"number"}` |
| x2 | yes | `{"type":"number"}` |
| y2 | yes | `{"type":"number"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Path



Registries: core / core-trusted / upstream.

```text
Path(d: string, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| d | yes | `{"type":"string"}` |
| fill | no | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Polyline

points like "0,0 10,5 20,0".

Registries: core / core-trusted / upstream.

```text
Polyline(points: string, stroke?: Color, strokeWidth?: number, fill?: Color, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| points | yes | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| fill | no | `{"type":"string"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### Polygon



Registries: core / core-trusted / upstream.

```text
Polygon(points: string, fill?: Color, stroke?: Color, strokeWidth?: number, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| points | yes | `{"type":"string"}` |
| fill | no | `{"type":"string"}` |
| stroke | no | `{"type":"string"}` |
| strokeWidth | no | `{"type":"number"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### G

Group; transform like "rotate(30 50 50)" or "translate(10 0)".

Registries: core / core-trusted / upstream.

```text
G(children: Node[], transform?: string, opacity?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| children | yes | `{"type":"array","items":{}}` |
| transform | no | `{"type":"string"}` |
| opacity | no | `{"type":"number"}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### SvgText



Registries: core / core-trusted / upstream.

```text
SvgText(text: string, x: number, y: number, size?: number, fill?: Color, anchor?: "start" | "middle" | "end", weight?: "normal" | "medium" | "semibold")
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| x | yes | `{"type":"number"}` |
| y | yes | `{"type":"number"}` |
| size | no | `{"type":"number"}` |
| fill | no | `{"type":"string"}` |
| anchor | no | `{"type":"string","enum":["start","middle","end"]}` |
| weight | no | `{"type":"string","enum":["normal","medium","semibold"]}` |

[Complete OpenUI example: Svg driven by a slider](GALLERY.md#component-svg)

### YouTube

Embedded YouTube video by id or URL. Only a video you know exists.

Registries: core-trusted / upstream / custom.

```text
YouTube(video: string, title?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| video | yes | `{"type":"string"}` |
| title | no | `{"type":"string"}` |

[Complete OpenUI example: New primitives](GALLERY.md#composition-primitives)

### MapMarker

A place on a Map; icon is one emoji, else the pin shows its number.

Registries: upstream / custom.

```text
MapMarker(label: string, lat: number, lng: number, category?: string, icon?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| label | yes | `{"type":"string"}` |
| lat | yes | `{"type":"number"}` |
| lng | yes | `{"type":"number"}` |
| category | no | `{"type":"string"}` |
| icon | no | `{"type":"string"}` |

[Complete OpenUI example: Map with a route](GALLERY.md#component-map)

### Map

Street map fitted to its markers. route draws the road path in marker order; selected holds the clicked marker's label.

Registries: upstream / custom.

```text
Map(markers: MapMarker[], route?: boolean, selected?: $binding<string>, height?: number)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| markers | yes | `{"type":"array","items":{"$ref":"#/$defs/MapMarker"}}` |
| route | no | `{"type":"boolean"}` |
| selected | no | `{"type":"string"}` |
| height | no | `{"type":"number"}` |

[Complete OpenUI example: Map with a route](GALLERY.md#component-map)

### HtmlView

Opaque-origin sandboxed HTML/inline JS for games, canvas and animation. No Host access, network, forms, popups or child frames by default. Runs after streaming completes.

Registries: upstream / custom.

```text
HtmlView(html: string, height?: number, title?: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| html | yes | `{"type":"string"}` |
| height | no | `{"type":"number"}` |
| title | no | `{"type":"string"}` |

[Complete OpenUI example: HtmlView game](GALLERY.md#component-html)

## Library function index: 59

[Append](#append) · [Prepend](#prepend) · [Concat](#concat) · [Remove](#remove) · [RemoveAt](#removeat) · [Update](#update) · [Toggle](#toggle) · [Includes](#includes) · [Find](#find) · [IndexOf](#indexof) · [Take](#take) · [Slice](#slice) · [Unique](#unique) · [Reverse](#reverse) · [Range](#range) · [Pick](#pick) · [Shuffle](#shuffle) · [Flatten](#flatten) · [Chunk](#chunk) · [Pow](#pow) · [Sqrt](#sqrt) · [Random](#random) · [Clamp](#clamp) · [Percent](#percent) · [Lerp](#lerp) · [Allocate](#allocate) · [Payment](#payment) · [Convert](#convert) · [Format](#format) · [Join](#join) · [Plural](#plural) · [Pad](#pad) · [Upper](#upper) · [Lower](#lower) · [Trim](#trim) · [Capitalize](#capitalize) · [Split](#split) · [Replace](#replace) · [Duration](#duration) · [Default](#default) · [MixColor](#mixcolor) · [Now](#now) · [Today](#today) · [FormatDate](#formatdate) · [AddDays](#adddays) · [AddMonths](#addmonths) · [DaysBetween](#daysbetween) · [MonthsBetween](#monthsbetween) · [StartOf](#startof) · [GroupBy](#groupby) · [Pivot](#pivot) · [Top](#top) · [Between](#between) · [Bucket](#bucket) · [Cumulative](#cumulative) · [MovingAvg](#movingavg) · [Change](#change) · [Histogram](#histogram) · [Stats](#stats)

### Append

Copy of the list with item added at the end

```text
Append(list: any[], item: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| item | yes | `{}` |

Return schema: `{"type":"array","items":{}}`.

### Prepend

Copy of the list with item added at the start

```text
Prepend(list: any[], item: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| item | yes | `{}` |

Return schema: `{"type":"array","items":{}}`.

### Concat

Joins two lists

```text
Concat(list: any[], more: any[]) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| more | yes | `{"type":"array","items":{}}` |

Return schema: `{"type":"array","items":{}}`.

### Remove

Copy without the items whose field equals value; field "" compares the items themselves

```text
Remove(list: any[], field: string, value: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| value | yes | `{}` |

Return schema: `{"type":"array","items":{}}`.

### RemoveAt

Copy without the item at index (0-based; negative counts from the end)

```text
RemoveAt(list: any[], index: number) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| index | yes | `{"type":"number"}` |

Return schema: `{"type":"array","items":{}}`.

### Update

Copy where items whose field equals value get setField set to setValue

```text
Update(list: any[], field: string, value: any, setField: string, setValue: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| value | yes | `{}` |
| setField | yes | `{"type":"string"}` |
| setValue | yes | `{}` |

Return schema: `{"type":"array","items":{}}`.

### Toggle

Adds item if missing, removes it if present (a set of strings or numbers)

```text
Toggle(list: any[], item: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| item | yes | `{}` |

Return schema: `{"type":"array","items":{}}`.

### Includes

True if the list has item, or the text contains it

```text
Includes(list: any[] | string, item: any) → boolean
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}` |
| item | yes | `{}` |

Return schema: `{"type":"boolean"}`.

### Find

First item whose field equals value, or null

```text
Find(list: any[], field: string, value: any) → any
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| value | yes | `{}` |

Return schema: `{}`.

### IndexOf

Index of item in the list, or -1

```text
IndexOf(list: any[], item: any) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| item | yes | `{}` |

Return schema: `{"type":"number"}`.

### Take

The first n items; a negative n takes the last n

```text
Take(list: any[], n: number) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| n | yes | `{"type":"number"}` |

Return schema: `{"type":"array","items":{}}`.

### Slice

Items, or characters of text, from start up to end (not included); negative counts from the end

```text
Slice(list: any[] | string, start: number, end?: number) → any[] | string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}` |
| start | yes | `{"type":"number"}` |
| end | no | `{"type":"number"}` |

Return schema: `{"anyOf":[{"type":"array","items":{}},{"type":"string"}]}`.

### Unique

Distinct items in first-seen order

```text
Unique(list: any[]) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |

Return schema: `{"type":"array","items":{}}`.

### Reverse

Copy in reverse order

```text
Reverse(list: any[]) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |

Return schema: `{"type":"array","items":{}}`.

### Range

Numbers from start up to end (not included) by step (default 1), e.g. @Range(0, 3) is [0, 1, 2]

```text
Range(start: number, end: number, step?: number) → number[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| start | yes | `{"type":"number"}` |
| end | yes | `{"type":"number"}` |
| step | no | `{"type":"number"}` |

Return schema: `{"type":"array","items":{"type":"number"}}`.

### Pick

A random item, or null for an empty list; draws anew each time, so call it inside @Set

```text
Pick(list: any[]) → any
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |

Return schema: `{}`.

### Shuffle

Copy in random order; call it inside @Set

```text
Shuffle(list: any[]) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |

Return schema: `{"type":"array","items":{}}`.

### Flatten

One list from a list of lists, e.g. [[1, 2], [3]] is [1, 2, 3]

```text
Flatten(list: any[]) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |

Return schema: `{"type":"array","items":{}}`.

### Chunk

The list cut into lists of size items, e.g. for weeks of 7 days or pages

```text
Chunk(list: any[], size: number) → any[][]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| size | yes | `{"type":"number"}` |

Return schema: `{"type":"array","items":{"type":"array","items":{}}}`.

### Pow

base raised to exponent

```text
Pow(base: number, exponent: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| base | yes | `{"type":"number"}` |
| exponent | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Sqrt

Square root; null for a negative number

```text
Sqrt(number: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| number | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Random

Random number from min to max (integer true: a whole number, max included); draws anew each time, so call it inside @Set

```text
Random(min: number, max: number, integer?: boolean) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| min | yes | `{"type":"number"}` |
| max | yes | `{"type":"number"}` |
| integer | no | `{"type":"boolean"}` |

Return schema: `{"type":"number"}`.

### Clamp

number kept between min and max

```text
Clamp(number: number, min: number, max: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| number | yes | `{"type":"number"}` |
| min | yes | `{"type":"number"}` |
| max | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Percent

part / total * 100, e.g. @Percent(3, 4) is 75; 0 when total is 0

```text
Percent(part: number, total: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| part | yes | `{"type":"number"}` |
| total | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Lerp

The value a fraction t of the way from a to b

```text
Lerp(a: number, b: number, t: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| a | yes | `{"type":"number"}` |
| b | yes | `{"type":"number"}` |
| t | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Allocate

Splits total in proportion to weights, rounded to decimals (default 2), so the parts add up to exactly total, e.g. @Allocate(100, [1, 1, 1]) is [33.34, 33.33, 33.33]

```text
Allocate(total: number, weights: number[], decimals?: number) → number[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| total | yes | `{"type":"number"}` |
| weights | yes | `{"type":"array","items":{"type":"number"}}` |
| decimals | no | `{"type":"number"}` |

Return schema: `{"type":"array","items":{"type":"number"}}`.

### Payment

Payment per period that repays principal over periods at rate percent per period, e.g. a 30-year loan at 6% a year: @Payment(300000, 6 / 12, 360)

```text
Payment(principal: number, rate: number, periods: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| principal | yes | `{"type":"number"}` |
| rate | yes | `{"type":"number"}` |
| periods | yes | `{"type":"number"}` |

Return schema: `{"type":"number"}`.

### Convert

value from one unit to another: mm cm m km in ft yd mi; mg g kg oz lb st; ml l tsp tbsp floz cup pt qt gal (US); m/s km/h mph kn; m2 km2 ft2 ha acre; c f k

```text
Convert(value: number, from: string, to: string) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"number"}` |
| from | yes | `{"type":"string"}` |
| to | yes | `{"type":"string"}` |

Return schema: `{"type":"number"}`.

### Format

Number as text: "number" 12,345.6, "currency" $12,345.68 (currency is a code like "EUR"), "percent" 45 -> 45%, "compact" 1.2M ($1.2M with a currency)

```text
Format(value: number, kind?: "number" | "currency" | "percent" | "compact", decimals?: number, currency?: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"type":"number"}` |
| kind | no | `{"type":"string","enum":["number","currency","percent","compact"]}` |
| decimals | no | `{"type":"number"}` |
| currency | no | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Join

Joins the items (or their field) into text with sep (default ", "), skipping nulls

```text
Join(list: any[], sep?: string, field?: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| list | yes | `{"type":"array","items":{}}` |
| sep | no | `{"type":"string"}` |
| field | no | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Plural

Count and word: @Plural(1, "guest") is "1 guest", 3 gives "3 guests"; plural defaults to word + "s"

```text
Plural(n: number, word: string, plural?: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| n | yes | `{"type":"number"}` |
| word | yes | `{"type":"string"}` |
| plural | no | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Pad

Pads the start of value to length with char (default "0"), e.g. 7 -> "07"

```text
Pad(value: string | number, length: number, char?: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| length | yes | `{"type":"number"}` |
| char | no | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Upper

Text in upper case

```text
Upper(text: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Lower

Text in lower case

```text
Lower(text: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Trim

Text without spaces at the start and end

```text
Trim(text: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Capitalize

Each word with a capital first letter, e.g. "new york" is "New York"

```text
Capitalize(text: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Split

List of the parts of text between sep (default ","), each trimmed, empty parts dropped, e.g. @Split("a, b,,c") is ["a", "b", "c"]

```text
Split(text: string, sep?: string) → string[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| sep | no | `{"type":"string"}` |

Return schema: `{"type":"array","items":{"type":"string"}}`.

### Replace

Text with every find replaced by replacement

```text
Replace(text: string, find: string, replacement: string) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |
| find | yes | `{"type":"string"}` |
| replacement | yes | `{"type":"string"}` |

Return schema: `{"type":"string"}`.

### Duration

Seconds as text: "short" 1h 20m, 4m 05s, 45s (default); "clock" 1:20:00, 4:05

```text
Duration(seconds: number, style?: "short" | "clock") → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| seconds | yes | `{"type":"number"}` |
| style | no | `{"type":"string","enum":["short","clock"]}` |

Return schema: `{"type":"string"}`.

### Default

value, or fallback when value is null, "" or not a number, e.g. an empty number input: @Default($weight, 0)

```text
Default(value?: any, fallback: any) → any
```

| Parameter | Required | Schema |
| --- | --- | --- |
| value | no | `{}` |
| fallback | yes | `{}` |

Return schema: `{}`.

### MixColor

The hex color a fraction t of the way from one hex color to another, e.g. @MixColor("#ffffff", "#0285ff", 0.5) for a heatmap or a tint

```text
MixColor(from: string, to: string, t: number) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| from | yes | `{"type":"string"}` |
| to | yes | `{"type":"string"}` |
| t | yes | `{"type":"number"}` |

Return schema: `{"type":"string"}`.

### Now

The current date and time as an ISO string

```text
Now() → string
```

No explicit parameters.

Return schema: `{"type":"string"}`.

### Today

Today's date in the viewer's time zone, as "YYYY-MM-DD"

```text
Today() → string
```

No explicit parameters.

Return schema: `{"type":"string"}`.

### FormatDate

A date as text: "date" Oct 9, 2026 (default), "short" Oct 9, "long" Friday, October 9, 2026, "weekday" Fri, "month" Oct 2026, "time" 9:30 PM, "datetime", "iso" 2026-10-09. Dates are "YYYY-MM-DD", ISO or a timestamp

```text
FormatDate(date: string | number, style?: "date" | "short" | "long" | "weekday" | "month" | "time" | "datetime" | "iso") → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| date | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| style | no | `{"type":"string","enum":["date","short","long","weekday","month","time","datetime","iso"]}` |

Return schema: `{"type":"string"}`.

### AddDays

The date days later (negative: earlier), as "YYYY-MM-DD"

```text
AddDays(date: string | number, days: number) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| date | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| days | yes | `{"type":"number"}` |

Return schema: `{"type":"string"}`.

### AddMonths

The date months later (negative: earlier), kept within the month (Jan 31 + 1 is Feb 28), as "YYYY-MM-DD"; 12 months is a year

```text
AddMonths(date: string | number, months: number) → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| date | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| months | yes | `{"type":"number"}` |

Return schema: `{"type":"string"}`.

### DaysBetween

Calendar days from one date to another (negative if to is earlier)

```text
DaysBetween(from: string | number, to: string | number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| from | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| to | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |

Return schema: `{"type":"number"}`.

### MonthsBetween

Whole months from one date to another (negative if to is earlier); @Floor(@MonthsBetween(birthday, @Today()) / 12) is an age

```text
MonthsBetween(from: string | number, to: string | number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| from | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| to | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |

Return schema: `{"type":"number"}`.

### StartOf

First day of the date's "week" (Monday), "month" or "year", as "YYYY-MM-DD"

```text
StartOf(date: string | number, unit: "week" | "month" | "year") → string
```

| Parameter | Required | Schema |
| --- | --- | --- |
| date | yes | `{"anyOf":[{"type":"string"},{"type":"number"}]}` |
| unit | yes | `{"type":"string","enum":["week","month","year"]}` |

Return schema: `{"type":"string"}`.

### GroupBy

One row per distinct key, in first-seen order; value is agg of field (default "sum"), or the row count without a field

```text
GroupBy(rows: any[], key: string, field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → {key: string | number, value: number}[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| key | yes | `{"type":"string"}` |
| field | no | `{"type":"string"}` |
| agg | no | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

Return schema: `{"type":"array","items":{"type":"object","properties":{"key":{"anyOf":[{"type":"string"},{"type":"number"}]},"value":{"type":"number"}},"required":["key","value"],"additionalProperties":false}}`.

### Pivot

One row per rowKey value with a column per colKey value holding agg of field, for stacked or grouped charts

```text
Pivot(rows: any[], rowKey: string, colKey: string, field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → Record<string, string | number>[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| rowKey | yes | `{"type":"string"}` |
| colKey | yes | `{"type":"string"}` |
| field | no | `{"type":"string"}` |
| agg | no | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

Return schema: `{"type":"array","items":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"anyOf":[{"type":"string"},{"type":"number"}]}}}`.

### Top

The n rows with the largest field ("asc": the smallest)

```text
Top(rows: any[], field: string, n: number, direction?: "desc" | "asc") → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| n | yes | `{"type":"number"}` |
| direction | no | `{"type":"string","enum":["desc","asc"]}` |

Return schema: `{"type":"array","items":{}}`.

### Between

Rows whose field is from min to max, both included; compares numbers, or text such as "YYYY-MM-DD" dates. Leave min or max null for an open end

```text
Between(rows: any[], field: string, min?: any, max?: any) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| min | no | `{}` |
| max | no | `{}` |

Return schema: `{"type":"array","items":{}}`.

### Bucket

Rows per day, week (from Monday) or month of dateField, in date order, empty periods 0 for sum and count; key is "YYYY-MM-DD", or "YYYY-MM" for months

```text
Bucket(rows: any[], dateField: string, unit: "day" | "week" | "month", field?: string, agg?: "sum" | "avg" | "count" | "min" | "max") → {key: string | number, value: number}[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| dateField | yes | `{"type":"string"}` |
| unit | yes | `{"type":"string","enum":["day","week","month"]}` |
| field | no | `{"type":"string"}` |
| agg | no | `{"type":"string","enum":["sum","avg","count","min","max"]}` |

Return schema: `{"type":"array","items":{"type":"object","properties":{"key":{"anyOf":[{"type":"string"},{"type":"number"}]},"value":{"type":"number"}},"required":["key","value"],"additionalProperties":false}}`.

### Cumulative

Copy of the rows with field replaced by its running total (field "" for a list of numbers)

```text
Cumulative(rows: any[], field: string) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |

Return schema: `{"type":"array","items":{}}`.

### MovingAvg

Copy of the rows with field replaced by the average of its last window values (field "" for a list of numbers)

```text
MovingAvg(rows: any[], field: string, window: number) → any[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| rows | yes | `{"type":"array","items":{}}` |
| field | yes | `{"type":"string"}` |
| window | yes | `{"type":"number"}` |

Return schema: `{"type":"array","items":{}}`.

### Change

Percent change from previous to current, e.g. @Change(120, 100) is 20; null when previous is 0

```text
Change(current: number, previous: number) → number
```

| Parameter | Required | Schema |
| --- | --- | --- |
| current | yes | `{"type":"number"}` |
| previous | yes | `{"type":"number"}` |

Return schema: `{"anyOf":[{"type":"number"},{"type":"null"}]}`.

### Histogram

Counts numbers into equal-width bins (value is the count); min and max fix the range, default the data's

```text
Histogram(values: number[], bins: number, min?: number, max?: number) → {key: string, value: number, start: number, end: number}[]
```

| Parameter | Required | Schema |
| --- | --- | --- |
| values | yes | `{"type":"array","items":{"type":"number"}}` |
| bins | yes | `{"type":"number"}` |
| min | no | `{"type":"number"}` |
| max | no | `{"type":"number"}` |

Return schema: `{"type":"array","items":{"type":"object","properties":{"key":{"type":"string"},"value":{"type":"number"},"start":{"type":"number"},"end":{"type":"number"}},"required":["key","value","start","end"],"additionalProperties":false}}`.

### Stats

Summary of numbers, all zeros for an empty list

```text
Stats(values: number[]) → {count: number, min: number, max: number, mean: number, median: number, stdev: number}
```

| Parameter | Required | Schema |
| --- | --- | --- |
| values | yes | `{"type":"array","items":{"type":"number"}}` |

Return schema: `{"type":"object","properties":{"count":{"type":"number"},"min":{"type":"number"},"max":{"type":"number"},"mean":{"type":"number"},"median":{"type":"number"},"stdev":{"type":"number"}},"required":["count","min","max","mean","median","stdev"],"additionalProperties":false}`.

## Actions and runtime capabilities

### CopyToClipboard

Copy text to the clipboard, e.g. a shopping list built with @Join

```text
CopyToClipboard(text: string)
```

| Parameter | Required | Schema |
| --- | --- | --- |
| text | yes | `{"type":"string"}` |

@ToAssistant/@Set/@Reset/@Run and Query/Mutation come from the official runtime; see Host/Gallery usage. They are not library-defined functions or permission bypasses. Random/Pick/Shuffle/Now/Today are not deterministic scientific solvers. Convert supports only its listed units, not native eV/Hartree or quantum state conversions.
