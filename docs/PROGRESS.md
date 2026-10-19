# Development progress

Last updated: 2026-10-19

## Baseline

- Upstream reference: `thesysdev/open-intelligent-ui`
- Upstream commit: `03213439358bf3408ad61a46ec9e3230c5572e48` (cloned into the sibling `reference/open-intelligent-ui/`; read-only)
- Framework repository: local Git repository on `feat/standalone-framework`; no remote configured
- Scope: standalone Intelligent UI Framework only. No MiQroForge source was cloned, opened, or modified.
- Frozen wire contract: `docs/03_CONTRACT_V1.md`, copied from the workspace handoff without changing field meanings.

## Stage status

- [x] F0: source map, parity inventory, architecture, and contract freeze recorded.
- [ ] F1: publishable core, renderer wrapper, theme, and independent demo.
- [ ] F2: state, components, actions, tool boundary, streaming, and safety coverage.
- [ ] F3: generated component spec and model-independent prompt API; gallery/mock-stream verification.
- [ ] F4: compatibility/security checks, clean npm consumer, package tarball, docs, and final local commit.

## Commands and evidence

- `git --version`: `2.56.0.windows.2`
- `node --version`: `v26.7.0`
- `npm --version`: `11.19.0`
- `git clone --filter=blob:none https://github.com/thesysdev/open-intelligent-ui.git reference/open-intelligent-ui`: passed after network access approval.
- Reference SHA: `03213439358bf3408ad61a46ec9e3230c5572e48`.
- No package tests or builds have run yet.

## Next

1. Build a single npm package with `/protocol`, `/react`, `/prompt`, and `/styles.css` subpaths.
2. Reuse `@openuidev/lang-core` and `@openuidev/react-lang`; keep React as a peer dependency.
3. Port the reusable upstream components/functions, adapt host services, and omit untrusted HTML from the default registry.
4. Generate and run actual typecheck, unit, build, package, demo, and clean-consumer checks.

