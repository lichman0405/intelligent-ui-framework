# 文档站与 GitHub Pages

[English](../en/PAGES.md) · [目录](README.md)

## 1. 本地写作与预览

本项目使用固定版本 VitePress 1.6.4，文档源文件直接保存在 docs。使用 Node >=22.12.0 和 npm 11.19.0（packageManager 指定版本）；CI 固定这两个版本，旧版 npm 可能无法识别可选 peer 依赖的锁文件。无需另一个 CMS、服务端或密钥。已有 Markdown 文件仍可在 GitHub 和本地编辑器阅读。

```sh
npm ci --ignore-scripts
npm run build
npm run docs:generate
npm run docs:check
npm run docs:dev
```

开发服务器地址以终端输出为准。生产预览：

```sh
npm run docs:build
npm run docs:preview
```

站点支持中英文切换、本地全文搜索、深浅主题、页面目录、OpenUI 代码高亮和复制、示例源码下载。搜索不依赖 Algolia 账号或第三方搜索请求。TypeScript 示例作为下载文件，不会被浏览器当作交互脚本执行。

## 2. 编辑哪些文件

| 位置 | 用途 |
| --- | --- |
| docs/zh-CN/*.md / docs/en/*.md | 对应的中文／英文手册；新章节应成对添加 |
| docs/index.md | 双语入口首页 |
| docs/.vitepress/config.mts | 导航、语言、侧栏、搜索、部署路径与链接处理 |
| docs/.vitepress/theme | 文档站主题样式 |
| docs/examples/*.tsx | 两种语言共用的完整 React 示例 |
| scripts/build-docs.mjs | 从真实签名生成 REFERENCE 与 GALLERY |
| .github/workflows/docs-pages.yml | GitHub Actions 构建和 Pages 部署 |

不要直接改生成的 REFERENCE/GALLERY；更新实现、生成数据或生成器里的中文说明，再运行 docs:generate。接口改动后先运行 build。文档下载资源由 prepare-docs-site 复制到忽略的 docs/public/downloads；不手动维护复制品。

## 3. GitHub Pages 路径

在 Actions 中自动读取 `GITHUB_REPOSITORY`，项目站点使用 `/<repo>/`；`owner.github.io` 仓库使用根路径。仓库无关配置不硬编码账号名。

本地模拟项目站点（PowerShell）：

```powershell
$env:DOCS_REPOSITORY = "owner/intelligent-ui-framework"
npm run docs:build
npm run docs:preview
```

可选环境／仓库变量：

| 变量 | 用途 |
| --- | --- |
| DOCS_REPOSITORY | owner/repo；覆盖自动识别，生成项目路径和 GitHub 编辑链接 |
| DOCS_BRANCH | 编辑链接目标分支；Actions 默认使用仓库默认分支 |
| DOCS_BASE | 自定义站点路径；自定义域名通常设为 `/`；未设置则自动推断 |

不要在源码中写 token。若改为自定义域名，需要额外配置 GitHub Pages 域名／DNS；当前工作流不会擅自修改 DNS。

## 4. 自动构建与部署

- PR：构建库、生成／检查文档、构建站点，上传站点 artifact；不部署生产站。
- 默认分支 push：执行相同构建并部署 GitHub Pages。
- workflow_dispatch：支持手动构建；只有默认分支可部署。
- 权限：构建只有 contents:read；部署 job 才有 pages:write、id-token:write；不用个人访问 token。
- 部署产物仅为 docs/.vitepress/dist。不会上传 artifacts、本地缓存、参考仓库或消费者 fixture。

首次在仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。站点只有成功部署后才算上线；本地 build 成功不能冒充已发布。

## 5. 发布前检查

1. 双语章节完整，规划功能与当前实现明确区分。
2. docs:generate、docs:check、docs:build 通过；不要关闭 dead-link 检查掩盖问题。
3. 在项目子路径预览侧栏、语言切换、搜索和示例下载。
4. 确认提交中没有密钥、工作目录敏感数据、node_modules、生成站点、日志或未授权文件。
5. Actions 成功后检查真实 Pages URL；失败时从 Actions 日志定位。

参考：[VitePress 部署文档](https://vuejs.github.io/vitepress/v1/guide/deploy)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
