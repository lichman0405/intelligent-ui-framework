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
| Maps | Map, MapMarker | Optional/blocked | MapLibre is separable; upstream street-route hook calls an app-local endpoint and must be replaced with a typed host resolver before enabling |
| Arbitrary HTML | HtmlView | Blocked/disabled | Evaluates untrusted markup/script and is not included in any default registry |
| Functions | List, number, text, color, date, and data shaping functions | Core | Reused deterministic functions; `Random`, `Pick`, `Shuffle`, `Now` are intentionally nondeterministic |
| Actions | `@ToAssistant`, OpenUrl, custom `CopyToClipboard` | Core through host ports | Events are structured and contain JSON data only; URLs are scheme-checked; no automatic LLM call |
| Query / Mutation | OpenUI Query/Mutation runtime | Core through host adapter | Default tool allowlist is empty; host must explicitly list and authorize tools; mutation approval and idempotency remain Host duties |
| Streaming | OpenUI Lang incremental parse and forward references | Core | Delegated directly to official Renderer with accumulated source and `isStreaming` |
| Prompt generation | Component/function/action signatures and prompt rules | Core | Official `generateSystemPrompt` over checked-in generated LibrarySpec; no model/network client |

The core registry has 51 components and 59 functions. Trusted extras add one component (52 total); Map, MapMarker and HtmlView are not shipped. Anything marked optional or blocked is omitted from `core` and does not prevent core installation or rendering. Actual consumer/browser evidence is described in `DELIVERY.md`.

