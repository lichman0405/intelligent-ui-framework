# Documentation site and GitHub Pages

[中文](../zh-CN/PAGES.md) · [Contents](README.md)

## 1. Local writing and preview

The site uses pinned VitePress 1.6.4 and the existing docs Markdown sources. Use Node >=22.12.0 and npm 11.19.0 (the packageManager version); CI pins both. Older npm versions can reject the optional-peer lockfile. No separate CMS, server or key is needed. Markdown remains readable on GitHub and in editors.

```sh
npm ci --ignore-scripts
npm run build
npm run docs:generate
npm run docs:check
npm run docs:dev
```

Use the development URL printed by the terminal. Production preview:

```sh
npm run docs:build
npm run docs:preview
```

Features include language switching, local full-text search, light/dark themes, page outlines, OpenUI highlighting/copy, and source downloads. Search requires no Algolia account or external search requests. TypeScript examples are downloads, not executable browser widgets.

## 2. Source locations

| Location | Purpose |
| --- | --- |
| docs/zh-CN/*.md / docs/en/*.md | Paired Chinese/English chapters |
| docs/index.md | Bilingual landing page |
| docs/.vitepress/config.mts | Navigation, locales, sidebar, search, base paths and links |
| docs/.vitepress/theme | Site theme styles |
| docs/examples/*.tsx | Shared complete React examples |
| scripts/build-docs.mjs | REFERENCE/GALLERY generation from actual signatures |
| .github/workflows/docs-pages.yml | GitHub Actions build and deployment |

Do not hand-edit generated REFERENCE/GALLERY pages. Update implementation/spec or generator translations and run docs:generate; build the library first after API changes. prepare-docs-site copies downloadable resources to ignored docs/public/downloads; do not maintain those copies by hand.

## 3. GitHub Pages paths

Actions reads GITHUB_REPOSITORY automatically. Project sites use `/<repo>/`; owner.github.io repositories use `/`. Configuration does not hardcode an account.

Simulate a project site locally in PowerShell:

```powershell
$env:DOCS_REPOSITORY = "owner/intelligent-ui-framework"
npm run docs:build
npm run docs:preview
```

Optional environment/repository variables:

| Variable | Purpose |
| --- | --- |
| DOCS_REPOSITORY | owner/repo override for project base and GitHub edit links |
| DOCS_BRANCH | Edit-link branch; Actions uses the default branch |
| DOCS_BASE | Override base path; usually `/` for a custom domain; otherwise inferred |

Never put tokens in source. A custom domain also requires Pages domain/DNS configuration; this workflow does not modify DNS.

## 4. Build and deployment

- PRs build the library, generate/check docs, build the site and upload a site artifact; they do not deploy production.
- Default-branch pushes perform the same build and deploy Pages.
- workflow_dispatch supports manual builds; deployment is restricted to the default branch.
- Build has contents:read; only deployment gets pages:write/id-token:write. No personal access token is needed.
- Only docs/.vitepress/dist is deployed, not artifacts, caches, reference repositories or consumer fixtures.

Initially select Settings → Pages → Build and deployment → Source → GitHub Actions. A site is live only after successful deployment; local build success is not publication.

## 5. Publication checks

1. Keep bilingual chapters aligned and distinguish plans from implemented features.
2. Run docs:generate, docs:check and docs:build; keep dead-link failures enabled.
3. Preview the project subpath, navigation, language switch, search and downloads.
4. Exclude credentials, private working data, node_modules, generated sites, logs and unauthorized files.
5. Check the actual Pages URL after Actions succeeds; investigate failures in Actions logs.

References: [VitePress deployment](https://vuejs.github.io/vitepress/v1/guide/deploy), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
