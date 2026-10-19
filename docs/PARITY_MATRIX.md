# Component and function parity

Status is relative to the upstream application at commit `03213439358bf3408ad61a46ec9e3230c5572e48`.

| Area | Upstream surface | Status | Dependency / safety notes |
| --- | --- | --- | --- |
| Layout | Box, Row, Col, Grid, Card, Divider, Spacer, Form | Core | Reused React primitives; no app-shell dependency |
| Text | Title, Text, Caption, Label, Badge, Link, List, ListItem, Markdown, Quote, Code, Math | Core | KaTeX is an explicit runtime dependency for Math; links restricted to HTTP(S) |
| Inputs | Button, IconButton, Pressable, Input, TextArea, Select, SegmentedControl, Slider, Checkbox, RadioGroup, DatePicker, Timer | Core | Reactive fields use OpenUI `useStateField`; persisted state passes JSON/size validation |
| Data display | Table, Chart | Core | Chart is native SVG/DOM and responsive; no remote data source |
| Media | Icon, Image, SearchImage | Core with host resolver | `SearchImage` has no built-in network endpoint; host `resolveImage` is opt-in |
| Third-party video | YouTube | Trusted extras | Fixed embed origin; requires `core-trusted@0.1.0` plus `mode="trusted-extras"` |
| Drawing | Svg, G, Circle, Ellipse, Rect, Line, Path, Polyline, Polygon, SvgText | Core | Declarative SVG only; no script or external resource loading |
| Play | Carousel, Popover, Flashcard, Celebration | Core | DOM portals are created on interaction; cleanup is component-scoped |
| Maps | Map, MapMarker | Implemented plugin | Separate MapLibre peer/CSS/worker; reactive pins, filter, fit, expansion, streaming, themes and Host route resolver |
| Arbitrary HTML | HtmlView | Implemented plugin | Opaque sandbox/CSP, bounded auto-height and deferred script execution; parent CSP required |
| Functions | List, number, text, color, date, and data shaping functions | Core | Reused deterministic functions; `Random`, `Pick`, `Shuffle`, `Now` are intentionally nondeterministic |
| Actions | `@ToAssistant`, OpenUrl, custom `CopyToClipboard` | Core through host ports | Events are structured and contain JSON data only; URLs are scheme-checked; no automatic LLM call |
| Query / Mutation | OpenUI Query/Mutation runtime | Core through host adapter | Default tool allowlist is empty; host must explicitly list and authorize tools; mutation approval and idempotency remain Host duties |
| Streaming | OpenUI Lang incremental parse and forward references | Core | Delegated directly to official Renderer with accumulated source and `isStreaming` |
| Prompt generation | Component/function/action signatures and prompt rules | Core | Official `generateSystemPrompt` over checked-in generated LibrarySpec; no model/network client |

Core has 51 components and 59 functions; trusted extras add YouTube (52). Explicit `upstream@0.1.0` provides all 55 original components. Plugin registration, external services and storage are Host opt-ins.

| Additional surface | 0.2 implementation |
| --- | --- |
| Full prompt strategy | Complete composition/reactivity/drawing rules, chat/dashboard presets and four examples; custom LibrarySpec |
| Gallery | All 19 component, 4 composition, 18 tool and 4 prompt programs (45 total), plus 16 framework examples |
| Extensible libraries | Host component/function/action registration, distinct IDs/versions, duplicate detection |
| Images/routes | Wikipedia summary/media/search, Commons fallback and OSRM; bounded optional adapters, no Next.js API dependency |
| Storage/browser ports | Validated snapshots by session/turn/artifact, caller-supplied storage/navigation/clipboard |
| Benchmark | Original 24 prompts, provider-neutral stream API, fixture/saved/live SSE CLI, separate real browser checks |

Original Next.js chat/model proxy/auth/deployment and Forge integration are outside the standalone scope. Live model execution requires caller credentials; fixture success does not claim live model quality. See `OPTIONAL_CAPABILITIES.md` and `DELIVERY.md`.
