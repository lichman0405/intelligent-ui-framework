import { defineConfig, type DefaultTheme } from "vitepress";
import { dirname, relative, resolve } from "node:path";

const repository = process.env.DOCS_REPOSITORY || process.env.GITHUB_REPOSITORY || "";
if (repository && !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("DOCS_REPOSITORY must be owner/repo");
const repositoryName = repository.split("/")[1] ?? "";
const configuredBase = process.env.DOCS_BASE || undefined;
const base = configuredBase ?? (repositoryName && !repositoryName.endsWith(".github.io") ? `/${repositoryName}/` : "/");
if (!/^\/(?:[\w.-]+\/)*$/.test(base)) throw new Error("DOCS_BASE must be / or a slash-delimited repository path");
const branch = process.env.DOCS_BRANCH || "main";
const origin = repository ? `https://github.com/${repository}` : "";
const docsRoot = resolve("docs");
const pageRewrites: Record<string, string> = { "README.md": "overview.md", "zh-CN/README.md": "zh-CN/index.md", "en/README.md": "en/index.md", "examples/README.md": "examples/index.md" };
const chapters = [
  ["QUICKSTART", "快速开始", "Quickstart"],
  ["STREAMING_STATE", "流式与状态", "Streaming & state"],
  ["HOST_INTEGRATION", "Host / Desktop 接入", "Host / Desktop integration"],
  ["PLUGINS_ADAPTERS", "插件与适配器", "Plugins & adapters"],
  ["PROMPT_BENCHMARK", "Prompt 与 Benchmark", "Prompt & benchmark"],
  ["DEVELOPMENT", "组件与插件开发", "Development"],
  ["DEPLOYMENT_TROUBLESHOOTING", "部署与排障", "Deployment & diagnostics"],
  ["PAGES", "文档站与 GitHub Pages", "Docs site & GitHub Pages"],
] as const;
function sidebar(locale: "zh-CN" | "en"): DefaultTheme.SidebarItem[] {
  const cn = locale === "zh-CN", prefix = `/${locale}/`;
  return [
    { text: cn ? "开发者手册" : "Developer handbook", items: [{ text: cn ? "总览" : "Overview", link: prefix }, ...chapters.map(([path, zh, en]) => ({ text: cn ? zh : en, link: `${prefix}${path}` }))] },
    { text: cn ? "API 与示例" : "API & examples", items: [
      { text: cn ? "55 个组件 / 59 个函数" : "55 components / 59 functions", link: `${prefix}REFERENCE` },
      { text: cn ? "45 个 OpenUI 示例" : "45 OpenUI examples", link: `${prefix}GALLERY` },
      { text: cn ? "完整 React 示例下载" : "Complete React examples", link: "/examples/" },
    ] },
    { text: cn ? "协议与演进" : "Contract & evolution", items: [
      { text: cn ? "原生科学 UI 路线" : "Native scientific UI roadmap", link: `${prefix}ROADMAP` },
      { text: "UIArtifactV1", link: "/03_CONTRACT_V1" },
      { text: cn ? "安全模型" : "Security model", link: "/SECURITY" },
      { text: cn ? "覆盖矩阵" : "Parity matrix", link: "/PARITY_MATRIX" },
      { text: cn ? "更新日志" : "Changelog", link: "/CHANGELOG" },
    ] },
  ];
}
function localizedTheme(locale: "zh-CN" | "en"): DefaultTheme.Config {
  const cn = locale === "zh-CN";
  return {
    nav: [
      { text: cn ? "指南" : "Guide", link: `/${locale}/QUICKSTART` },
      { text: "API", link: `/${locale}/REFERENCE` },
      { text: cn ? "示例" : "Examples", link: `/${locale}/GALLERY` },
      { text: cn ? "原生 UI 路线" : "Roadmap", link: `/${locale}/ROADMAP` },
    ],
    outline: { label: cn ? "本页目录" : "On this page", level: [2, 3] },
    docFooter: { prev: cn ? "上一篇" : "Previous", next: cn ? "下一篇" : "Next" },
    sidebarMenuLabel: cn ? "目录" : "Menu", returnToTopLabel: cn ? "返回顶部" : "Return to top",
    darkModeSwitchLabel: cn ? "外观" : "Appearance", lightModeSwitchTitle: cn ? "切换浅色主题" : "Switch to light theme", darkModeSwitchTitle: cn ? "切换深色主题" : "Switch to dark theme",
    langMenuLabel: cn ? "切换语言" : "Change language",
    editLink: origin ? { pattern: `${origin}/edit/${branch}/docs/:path`, text: cn ? "在 GitHub 编辑此页" : "Edit this page on GitHub" } : undefined,
  };
}

export default defineConfig({
  title: "Intelligent UI Framework",
  description: "Bilingual developer guides, API reference and native scientific UI roadmap / 中英文开发指南与 API 文档",
  lang: "en", base, cleanUrls: false, lastUpdated: false, ignoreDeadLinks: false,
  head: [["meta", { name: "theme-color", content: "#2563eb" }]],
  rewrites: pageRewrites,
  srcExclude: ["**/.npmignore"],
  locales: {
    "zh-CN": { label: "简体中文", lang: "zh-CN", description: "Intelligent UI Framework 开发指南、API 与原生科学 UI 路线", themeConfig: localizedTheme("zh-CN") },
    en: { label: "English", lang: "en", description: "Intelligent UI Framework developer guides, API and native science UI roadmap", themeConfig: localizedTheme("en") },
  },
  themeConfig: {
    siteTitle: "Intelligent UI", nav: [{ text: "简体中文", link: "/zh-CN/" }, { text: "English", link: "/en/" }],
    sidebar: { "/zh-CN/": sidebar("zh-CN"), "/en/": sidebar("en"), "/": sidebar("en") },
    outline: { level: [2, 3] }, search: { provider: "local", options: { locales: { "zh-CN": { translations: {
      button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
      modal: { noResultsText: "未找到结果", resetButtonTitle: "清除搜索", displayDetails: "显示详情", footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" } },
    } } } } },
    socialLinks: origin ? [{ icon: "github", link: origin }] : [],
    footer: { message: "MIT · Framework 0.2.0 · Protocol 1.0", copyright: "Developer documentation / 开发者文档" },
  },
  markdown: {
    html: false,
    languages: [{
      name: "openui", scopeName: "source.openui", aliases: ["oui"],
      patterns: [
        { name: "comment.line.double-slash.openui", match: "//.*$" },
        { name: "string.quoted.double.openui", begin: '"', end: '"', patterns: [{ name: "constant.character.escape.openui", match: "\\\\." }] },
        { name: "variable.other.openui", match: "\\$[A-Za-z_][A-Za-z0-9_]*" },
        { name: "entity.name.function.openui", match: "@[A-Za-z_][A-Za-z0-9_]*" },
        { name: "entity.name.type.openui", match: "\\b[A-Z][A-Za-z0-9_]*(?=\\s*\\()" },
        { name: "constant.language.openui", match: "\\b(?:true|false|null)\\b" },
        { name: "constant.numeric.openui", match: "\\b[0-9]+(?:\\.[0-9]+)?\\b" },
      ],
    }],
    config(md) {
      // TSX/JSON/license links are downloads, never Vue/React runtime imports.
      md.core.ruler.after("inline", "iui-downloads", state => {
        for (const token of state.tokens.flatMap(item => item.children ?? [])) {
          if (token.type !== "link_open") continue;
          const href = token.attrGet("href");
          if (!href || /^[a-z]+:/i.test(href) || href.startsWith("#")) continue;
          const target = resolve(dirname(state.env.realPath || state.env.path), decodeURIComponent(href.split("#")[0]));
          const path = relative(docsRoot, target).replaceAll("\\", "/");
          if (pageRewrites[path]) {
            const mapped = pageRewrites[path].replace(/index\.md$/, "").replace(/\.md$/, ".html");
            token.attrSet("href", "/" + mapped + (href.includes("#") ? "#" + href.split("#").slice(1).join("#") : ""));
            continue;
          }
          if (!/\.(tsx|json|txt)(?:#.*)?$/.test(href)) continue;
          if (path.startsWith("../")) throw new Error(`Documentation download escapes docs: ${href}`);
          token.attrSet("href", `${base}downloads/${path}`); token.attrSet("download", "");
        }
      });
    },
  },
});
