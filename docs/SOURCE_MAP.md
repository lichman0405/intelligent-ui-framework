# Upstream source map

## Reference baseline

- Repository: <https://github.com/thesysdev/open-intelligent-ui>
- Local read-only clone: `../reference/open-intelligent-ui/`
- Commit: `03213439358bf3408ad61a46ec9e3230c5572e48`
- License: MIT (`LICENSE` in the reference repository)

The reference is an OpenUI-powered Next.js application. This project uses its reusable UI library as source material while keeping the official OpenUI parser and React Renderer as runtime dependencies. It does not copy the Next.js chat shell, model proxy, authentication, storage, routes, or deployment setup.

## Mapped source areas

| Upstream path | Purpose | Framework disposition |
| --- | --- | --- |
| `src/lib/library.ts` | Component/function/action registry and category notes | Adapted as `createIuiLibrary`; configurable trusted extras and host-bound services |
| `src/lib/components/layout.tsx` | Box, Row, Col, Grid, Card, Divider, Spacer, Form | Reused and adapted |
| `src/lib/components/text.tsx`, `markdown.tsx`, `glyph.tsx`, `style.ts`, `scheme.ts` | Text, markdown, icon and safe styling helpers | Reused/adapted; URLs and theme tokens reviewed |
| `src/lib/components/controls.tsx` | Buttons, fields, reactive inputs and timers | Reused; renderer state remains owned by official OpenUI runtime |
| `src/lib/components/table.tsx`, `chart.tsx` | Table and responsive chart primitives | Reused; no external chart service |
| `src/lib/components/svg.tsx` | Declarative SVG drawing primitives | Reused with SVG-only shapes; never evaluates arbitrary script |
| `src/lib/components/extra.tsx` | Carousel, Popover, Code, Quote, Math, YouTube, Flashcard, Celebration | Reused selectively; iframe URLs are fixed to YouTube embed origin |
| `src/lib/components/media.tsx` | Icon, Image, SearchImage | Adapted so search is a host resolver, not a hard-coded local API |
| `src/lib/components/map/*` | MapLibre map and street-route behavior | Optional/blocked from the core registry pending resolver-only route implementation and isolated dependency packaging |
| `src/lib/components/html-view.tsx` | Generated HTML/JS view | Excluded from core and trusted extras; unsafe execution remains disabled |
| `src/lib/functions/*` | Data, date, list, number, color, and text functions | Reused with original upstream tests plus boundary checks |
| `src/lib/actions.ts` | Clipboard and OpenUI action events | Adapted to explicit host ports; browser clipboard fallback remains user-gesture scoped |
| `src/lib/prompt-options.ts` | Prompt rules and worked examples | Reused/adapted; prompt generation uses official `generateSystemPrompt` over generated spec |
| `src/generated/spec.json` | Serialized component/function/action spec | Regenerated from this package's registry; no Next.js dependencies |
| `src/app/gallery/*` | Runnable hand-authored OpenUI examples | Rebuilt as a Vite React demo; examples are tested with the real Renderer |
| `scripts/bench/*` | Upstream model/API benchmark | Not copied; Framework does not call an LLM. A deterministic gallery/mock-stream check replaces it |
| `src/app/page.tsx`, `src/app/api/*`, `chat-storage.tsx` | Chat, model API, app storage, and app routes | Excluded by design |

## Provenance

The component and function implementations adapted from the MIT reference retain their upstream copyright notices where present. `THIRD_PARTY_NOTICES.md` records the reference repository and reuse scope. New protocol, host adapter, package wrapper, tests, demo shell, and documentation are original Framework files. The OpenUI Lang parser and Renderer are loaded from their official npm packages, not copied or reimplemented.

