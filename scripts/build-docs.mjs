import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { galleryPrograms } from "../dist/gallery/index.js";
const specText = await readFile("src/generated/upstream-library-spec.json", "utf8");
const spec = JSON.parse(specText), manifest = JSON.parse(await readFile("package.json", "utf8"));
const hash = createHash("sha256").update(specText).digest("hex");
const zh = {
 Col:"纵向布局；根布局未指定 gap 时采用分层间距。",Row:"横向布局，可对齐、换行并设置间距。",Box:"通用容器，支持布局、尺寸、颜色、边框与圆角。",Grid:"响应式网格，按列数与最小宽度布局。",Card:"内容分组卡片。",Carousel:"横向浏览多个内容项。",Popover:"交互式补充内容浮层。",Divider:"分隔线。",Spacer:"占据剩余布局空间。",Title:"标题文本。",Text:"正文，可包含文本与内联元素。",Caption:"辅助说明文本。",Label:"字段或区块标签。",Badge:"紧凑状态／事实标签。",Link:"链接，导航经 Host 处理。",List:"列表容器。",ListItem:"列表项。",Markdown:"Markdown 内容，链接及资源受安全规则约束。",Quote:"引文与来源。",Code:"代码显示，不执行代码。",Math:"KaTeX 公式，关闭信任扩展并限制展开。",Button:"动作按钮；未提供 action 时可把标签作为对话请求。",IconButton:"图标动作按钮。",Pressable:"可点击内容容器，支持选中态。",Input:"绑定值的输入控件。",TextArea:"绑定值的多行输入。",Select:"单项下拉选择。",SegmentedControl:"分段选择控件。",Slider:"数值滑块；绑定值、范围、步长及可选单位。",Checkbox:"布尔绑定复选框。",RadioGroup:"单选组。",DatePicker:"日期输入。",Timer:"计时交互；不是 Host 任务调度器。",Form:"聚合表单值并支持结构化提交事件。",SearchImage:"使用可选 Host 图片 resolver，缺少能力时显示占位。",Image:"HTTP(S) 图片；加载失败可按查询回退。",Icon:"按名称显示 Lucide 图标。",Table:"通用数据表；不是完整科学数据网格。",Chart:"通用图表；不等于科学图形交互套件。",Flashcard:"翻转学习卡片。",Celebration:"本地庆祝动效。",Svg:"声明式 SVG 容器，不执行脚本。",Circle:"SVG 圆。",Ellipse:"SVG 椭圆。",Rect:"SVG 矩形。",Line:"SVG 线段。",Path:"SVG 路径。",Polyline:"SVG 折线。",Polygon:"SVG 多边形。",G:"SVG 元素分组。",SvgText:"SVG 文本标签。",YouTube:"固定 no-cookie origin 的视频嵌入，需显式注册。",MapMarker:"地理地图标记，输入纬度／经度。",Map:"地理地图，支持标记选择、分类、路线、视角与展开；不是晶体视图。",HtmlView:"流结束后在 opaque origin iframe 运行受限 HTML／脚本。",
 Append:"返回末尾追加一项的列表副本。",Prepend:"返回开头增加一项的列表副本。",Concat:"连接两个列表。",Remove:"按字段值移除；空字段表示比较项本身。",RemoveAt:"按索引删除；负索引从末尾计数。",Update:"修改匹配项的指定字段。",Toggle:"字符串／数字集合中添加或移除一项。",Includes:"判断列表包含项或文本包含子串。",Find:"返回首个字段匹配项，无匹配返回 null。",IndexOf:"返回项索引，无匹配返回 -1。",Take:"取前 n 项；负数取末尾项。",Slice:"截取列表或文本，终点不包含，支持负索引。",Unique:"按首次出现顺序去重。",Reverse:"逆序副本。",Range:"生成终点不包含的数列，默认步长 1。",Pick:"随机取项，空列表返回 null；在 @Set 内调用以固定一次抽取。",Shuffle:"随机排序副本，宜在 @Set 内调用。",Flatten:"将一层嵌套列表展开。",Chunk:"按大小分组。",Pow:"幂运算。",Sqrt:"平方根，负数结果为 null。",Random:"范围随机数；整数模式包含上界，宜在 @Set 内调用。",Clamp:"将值限制在 min/max 内。",Percent:"part/total*100；total 为零返回 0。",Lerp:"按比例在两值之间插值。",Allocate:"按权重分配并舍入，保证分配总和。",Payment:"按周期利率计算还款；不是科学计算求解器。",Convert:"仅支持实现列出的常用单位及温度，不支持任意科学单位或 eV/Hartree 转换。",Format:"数字、货币、百分比、紧凑数量格式化。",Join:"按分隔符连接项或字段，跳过 null。",Plural:"英文数量与单复数词组；不是通用本地化引擎。",Pad:"在开头补齐字符。",Upper:"转大写。",Lower:"转小写。",Trim:"去除首尾空格。",Capitalize:"每个单词首字母大写。",Split:"按分隔符切分、去空格、丢弃空项。",Replace:"替换所有匹配文本。",Duration:"将秒格式化为时长文本。",Default:"为空、空字符串或非数字输入时使用后备值；具体语义见原始描述。",MixColor:"在两种十六进制颜色之间插值。",Now:"当前时间 ISO 字符串；非确定性。",Today:"用户时区的今天日期；非确定性。",FormatDate:"日期／时间文本格式化。",AddDays:"增减日数并返回日期。",AddMonths:"增减月数，自动限制在目标月内。",DaysBetween:"日期间日历天数，可为负。",MonthsBetween:"日期间完整月数，可为负。",StartOf:"周一／月／年的第一天。",GroupBy:"按键分组聚合，保留首次出现顺序。",Pivot:"按行列键进行透视聚合。",Top:"按字段取最大或最小的 n 行。",Between:"闭区间范围筛选，支持数字或有序文本日期。",Bucket:"按日／周／月分桶。",Cumulative:"将字段替换为累计总和。",MovingAvg:"按窗口计算移动平均。",Change:"相对前值的百分比变化；前值为零返回 null。",Histogram:"等宽区间计数。",Stats:"数字统计摘要；空输入按函数约定返回零值。",CopyToClipboard:"通过 Host 复制文本。"
};
const rendererRows = [
 ["artifact","UIArtifactV1 | unknown","必填；先验证 envelope 和最终源码","Required; validates envelope and final source"],
 ["isStreaming","boolean","默认 false；true 时预览累计源码","Default false; previews accumulated source while true"],
 ["hostAdapter","UIHostAdapter","默认无权限空适配器；保持引用稳定","Default inert adapter; keep identity stable"],
 ["hostSessionId / hostTurnId","string","可信上下文，不能从模型文本提取","Trusted context, not model-supplied identity"],
 ["theme",'"light" | "dark"',"默认 light","Default light"],
 ["themeTokens","Record<--iui-*, string>","局部 token，过滤不安全值","Scoped tokens; unsafe values filtered"],
 ["mode",'"core" | "trusted-extras"',"默认 core；registry 可显式替换支持表","Default core; explicit registry selects supported signatures"],
 ["registry","IuiRegistry","可信精确注册表，保持引用稳定","Trusted exact registry; keep identity stable"],
 ["toolOptions","HostBridgeOptions 子集 / subset","调用／并发／超时／结果大小与节点预算","Call/concurrency/timeout/result-byte/node budgets"],
 ["onError","(Diagnostic[]) => void","错误诊断；不要依赖英文消息文本","Diagnostics; do not classify by English messages"],
 ["fallback","ReactNode","默认安全提示","Default safe status message"],
 ["className","string","附加到 iui-root","Added to iui-root"],
 ["validation","ArtifactValidationOptions","大小等验证选项；不能绕过 registry","Validation limits; cannot bypass registry"],
];
const api = [
 ["createArtifact(source,id,state?,signature?)","构造并验证 Artifact；失败抛错","Constructs and validates; throws on failure"],
 ["validateArtifact(value,options?)","返回 success/data 或 success/errors；不解析 OpenUI 文本语法","Returns success/data or success/errors; does not parse source syntax"],
 ["validateJSON(value,limits?) / validateState(value,limits?)","有限 JSON／对象状态验证和防御性副本","Finite JSON/object-state validation and defensive copies"],
 ["isJsonRecord(value)","仅判断普通对象，不替代完整深度验证","Plain-record predicate, not full deep validation"],
 ["createIuiLibrary({id?,trustedExtras?,plugins?})","创建实际官方 Library；默认 core，插件需新 ID","Creates an official Library; defaults to core, plugins require new ID"],
 ["createIuiRegistry(...registrations)","精确 ID／版本查找，冻结注册元信息","Exact ID/version lookup with frozen registration metadata"],
 ["createHostBridge(host,context,options?)","受控调用／动作／状态／retain/release/dispose；通常由 Renderer 管理","Controlled calls/actions/state/lifecycle, normally managed by Renderer"],
 ["safeWebUrl(value)","HTTP(S) 且无凭据返回标准 URL，否则 null","Normalized credential-free HTTP(S) URL or null"],
 ["getComponentSpec(modeOrSpec?)","返回防御性 LibrarySpec；默认 core","Defensive LibrarySpec copy, core by default"],
 ["createSystemPrompt(options?,modeOrSpec?,profile?)","纯 Prompt 生成；默认 core/chat","Pure Prompt generation, core/chat by default"],
 ["createMapPlugin(options?) / createHtmlPlugin(options?)","可信应用代码构造可选插件","Optional plugin definitions from trusted code"],
 ["htmlContentSecurityPolicy(options?)","返回 HTML 子页面 CSP；不设置父页面 CSP","Returns child CSP, does not configure parent CSP"],
 ["createUpstreamRegistration({map?,html?}?)","全部 55 个原项目组件的注册","Registration for all 55 original components"],
 ["createWebResolvers(options?)","可选公开图片／路线／dispose 端口","Optional public image/route/disposal ports"],
 ["createArtifactStore(storage,options?)","save/load/saveState/remove；存储由 Host 提供","save/load/saveState/remove over Host storage"],
 ["createBrowserPorts({allowUrl,open,writeText})","需 Host 策略的导航和剪贴板端口","Navigation/clipboard ports requiring Host policy"],
 ["createGalleryArtifact(id)","创建 upstream 签名示例，未知 ID 抛错","Creates upstream example; unknown ID throws"],
 ["runBenchmark(cases,provider,options?)","顺序执行模型无关检查，返回逐例结果","Sequential provider-neutral checks with per-case results"],
];
const clean = value => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const fence = (text, lang = "text") => `\n\`\`\`${lang}\n${text}\n\`\`\`\n`;
function argumentsTable(schema, cn) {
 const props = schema?.properties ?? {}, required = new Set(schema?.required ?? []);
 let out = `\n| ${cn?"参数":"Parameter"} | ${cn?"必填":"Required"} | Schema |\n| --- | --- | --- |\n`;
 for (const [name, def] of Object.entries(props)) out += `| ${name} | ${required.has(name)?(cn?"是":"yes"):(cn?"否":"no")} | \`${clean(JSON.stringify(def))}\` |\n`;
 return Object.keys(props).length ? out : (cn?"\n无显式参数。\n":"\nNo explicit parameters.\n");
}
for (const language of ["zh-CN", "en"]) {
 const cn = language === "zh-CN", other = cn ? "en" : "zh-CN";
 await mkdir(`docs/${language}`, { recursive: true });
 let out = `# ${cn?"完整 API 与组件／函数参考":"Complete API and component/function reference"}\n\n[${cn?"English":"中文"}](../${other}/REFERENCE.md) · [${cn?"目录":"Contents"}](README.md)\n\n`;
 out += cn ? `自动从 0.2.0 实际生成规格整理。规格 SHA-256：\`${hash}\`。更新命令：\`node scripts/build-docs.mjs\`（先构建运行时）。\n\n位置参数次序以 signature 为准。schema 描述类型／必填／枚举，不代表所有运行时显示默认值；未声明默认值的可选参数不要推断为 0 或 false。默认外观与交互示例见 Gallery 和实际组件实现。\`null\` 只在 schema 或运行时调用约定允许时用作中间参数占位，不是任意参数的合法值。\`$binding<T>\` 表示可恢复绑定；Node、Color、Length、Radius 等为 OpenUI 语义类型。\n` : `Generated from the actual 0.2.0 specification. Spec SHA-256: \`${hash}\`. Regenerate with \`node scripts/build-docs.mjs\` after building runtime.\n\nSignature defines positional order. Schema defines types/requiredness/enums, not every runtime visual default. Do not infer 0/false for optional props with no declared default; see Gallery/implementation for appearance and behavior. Use null placeholders only where accepted by schema/runtime conventions. $binding<T> denotes restorable bindings; Node/Color/Length/Radius are OpenUI semantic types.\n`;
 out += `\n## ${cn?"公共模块":"Public modules"}\n\n| Import | ${cn?"类型入口":"Type entry"} |\n| --- | --- |\n`;
 for (const [entry, value] of Object.entries(manifest.exports)) out += `| \`@intelligent-ui/framework${entry === "." ? "" : entry.slice(1)}\` | ${typeof value === "object" ? `\`${value.types}\`` : (cn?"显式 CSS":"explicit CSS")} |\n`;
 out += `\n## ${cn?"Renderer props":"Renderer props"}\n\n| Prop | Type | ${cn?"约定":"Contract"} |\n| --- | --- | --- |\n`;
 for (const row of rendererRows) out += `| ${row[0]} | ${clean(row[1])} | ${row[cn?2:3]} |\n`;
 out += `\n## ${cn?"函数入口":"API entry functions"}\n\n| API | ${cn?"行为":"Behavior"} |\n| --- | --- |\n`;
 for (const row of api) out += `| \`${row[0]}\` | ${row[cn?1:2]} |\n`;
 out += cn ? "\n其它公开值：library/trustedLibrary、coreRegistration/trustedRegistration、coreRegistry/trustedRegistry、upstreamRegistration/upstreamRegistry、MapMarker、mapWorkerUrl；Prompt 的原始 presets 和四个 example；Gallery 的 programs/compositionPrograms/toolPrograms/galleryPrograms/demoTools/demoToolSpecs。协议常量为 PROTOCOL_VERSION=1.0、LIBRARY_ID=core、LIBRARY_VERSION=0.1.0、PACKAGE_VERSION=0.2.0、DEFAULT_LIMITS。完整 TS DTO 见包内 `.d.ts` 与冻结契约；Host/适配器/Benchmark 参数及默认值见对应手册章节。\n" : "\nOther exports: library/trustedLibrary, coreRegistration/trustedRegistration, coreRegistry/trustedRegistry, upstreamRegistration/upstreamRegistry, MapMarker, mapWorkerUrl; raw Prompt presets/four examples; Gallery programs/compositionPrograms/toolPrograms/galleryPrograms/demoTools/demoToolSpecs. Protocol constants: PROTOCOL_VERSION=1.0, LIBRARY_ID=core, LIBRARY_VERSION=0.1.0, PACKAGE_VERSION=0.2.0, DEFAULT_LIMITS. Full DTO types are in packaged .d.ts and the frozen contract. Host/adapter/benchmark arguments/defaults are documented in their chapters.\n";
 out += `\n## ${cn?"组件索引：55 个":"Component index: 55"}\n\n` + Object.keys(spec.components).map(name => `[${name}](#${name.toLowerCase()})`).join(" · ") + "\n";
 for (const [name, def] of Object.entries(spec.components)) {
  if (cn && !zh[name]) throw Error(`Missing translation ${name}`);
  const mode = ["Map","MapMarker","HtmlView"].includes(name) ? "upstream / custom" : name === "YouTube" ? "core-trusted / upstream / custom" : "core / core-trusted / upstream";
  const example = galleryPrograms.find(p => new RegExp(`\\b${name}\\(`).test(p.code));
  out += `\n### ${name}\n\n${cn?zh[name]:def.description}\n\n${cn?"注册范围":"Registries"}: ${mode}.\n` + fence(def.signature);
  out += argumentsTable(spec.schema.$defs[name], cn);
  if (example) out += `\n[${cn?"完整可运行 OpenUI 示例":"Complete OpenUI example"}: ${example.title}](GALLERY.md#${example.id.toLowerCase()})\n`;
 }
 out += `\n## ${cn?"库函数索引：59 个":"Library function index: 59"}\n\n` + Object.keys(spec.functions).map(name=>`[${name}](#${name.toLowerCase()})`).join(" · ") + "\n";
 for (const [name, def] of Object.entries(spec.functions)) {
  if (cn && !zh[name]) throw Error(`Missing translation ${name}`);
  const schema = spec.schema.functions[name];
  out += `\n### ${name}\n\n${cn?zh[name]:def.description}\n` + fence(def.signature) + argumentsTable(schema.params, cn);
  out += `\n${cn?"返回 schema":"Return schema"}: \`${clean(JSON.stringify(schema.returns))}\`.\n`;
  if(cn) out += `\n${cn?"上游精确约定（保留原文中的默认值／边界）":""}: ${def.description}\n`;
 }
 out += `\n## ${cn?"动作与内建能力":"Actions and runtime capabilities"}\n\n### CopyToClipboard\n\n${cn?zh.CopyToClipboard:spec.actions.CopyToClipboard.description}\n` + fence(spec.actions.CopyToClipboard.signature) + argumentsTable(spec.schema.actions.CopyToClipboard.params, cn);
 out += cn ? "\n@ToAssistant、@Set、@Reset、@Run 和 Query/Mutation 等由官方运行时提供。通过 Host 章节和 Gallery 学习用法；不得假定它们是当前库的自定义函数或可绕过权限。Random/Pick/Shuffle/Now/Today 不是确定性科学求解；Convert 支持的单位以描述为准，没有原生 eV/Hartree 或量子态转换。\n" : "\n@ToAssistant/@Set/@Reset/@Run and Query/Mutation come from the official runtime; see Host/Gallery usage. They are not library-defined functions or permission bypasses. Random/Pick/Shuffle/Now/Today are not deterministic scientific solvers. Convert supports only its listed units, not native eV/Hartree or quantum state conversions.\n";
 await writeFile(`docs/${language}/REFERENCE.md`, out);
 let gallery = `# ${cn?"45 个原项目完整示例":"45 complete original examples"}\n\n[${cn?"English":"中文"}](../${other}/GALLERY.md) · [${cn?"目录":"Contents"}](README.md) · [${cn?"参考":"Reference"}](REFERENCE.md)\n\n`;
 gallery += cn ? "以下程序按原始示例保留英语 UI 文本，代码在两种语言手册中相同，可直接粘贴到 Demo 的 Edit program。所有程序使用 upstream@0.1.0；图片／地图／视频／工具需相应 Host 能力。工具数据是合成数据，不是科学结果。\n\n" : "Programs preserve their original English UI text and are identical across handbooks. Paste into the Demo's Edit program. They target upstream@0.1.0; image/map/video/tool behavior needs matching Host capabilities. Tool data is synthetic, not scientific results.\n\n";
 gallery += galleryPrograms.map(p=>`- [${p.id}: ${p.title}](#${p.id.toLowerCase()})`).join("\n") + "\n";
 for(const p of galleryPrograms) gallery += `\n## ${p.id}\n\n${p.title}\n\n${cn?"分类":"Category"}: ${p.category}; ${cn?"额外能力标记":"Capability markers"}: ${p.capabilities.join(", ") || (cn?"无额外标记":"none")}.\n` + fence(p.code, "openui");
 await writeFile(`docs/${language}/GALLERY.md`, gallery);
}
console.log("Generated bilingual reference: 55 components, 59 functions, 1 library action, and 45 complete Gallery examples per language");
