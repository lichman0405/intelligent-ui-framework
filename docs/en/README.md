# Intelligent UI Framework developer handbook

[中文](../zh-CN/README.md) · [Documentation index](../README.md)

Applies to package `0.2.0`, wire protocol `1.0`, and library version `0.1.0` for `core`, `core-trusted`, and `upstream`. Updated: 2026-10-20.

## Read by role

| Task | Reading order |
| --- | --- |
| Embed UI in React | Quickstart → Streaming/state → Reference |
| Integrate MiQroForge Desktop | Quickstart → Host integration → Plugins/services → Deployment |
| Extend components/functions/actions | Development → Reference → Prompt/model → Native UI roadmap |
| Integrate an Agent/model backend | Host integration → Prompt/model → Version and delivery checks |
| Accept and release | Deployment → Handoff checklist and existing evidence |

## Chapters

1. [Quickstart: installation, complete React example and Demo](QUICKSTART.md)
2. [OpenUI, streaming, cancellation and state restoration](STREAMING_STATE.md)
3. [Host Adapter, tools, authorization and persistence](HOST_INTEGRATION.md)
4. [Maps, HTML, images, routes and browser ports](PLUGINS_ADAPTERS.md)
5. [Prompt, Gallery and model benchmark](PROMPT_BENCHMARK.md)
6. [Custom components, functions, actions and library versions](DEVELOPMENT.md)
7. [Deployment, themes, diagnostics, compatibility and handoff](DEPLOYMENT_TROUBLESHOOTING.md)
8. [Complete API and component/function reference](REFERENCE.md)
9. [Native materials/chemistry/quantum/biology UI roadmap](ROADMAP.md)

Appendices: [45 complete OpenUI examples](GALLERY.md); [shared React modules](../examples/README.md).

Documentation maintenance: [local writing and GitHub Pages publication](PAGES.md).

## Implemented scope

- 51 core components and 59 library functions; `core-trusted` adds YouTube; explicit `upstream` registration provides all 55 original components.
- Official OpenUI Lang parser and React Renderer, reactive variables/expressions, streaming, Query/Mutation and state restoration.
- JSON protocol, controlled Host tools, Prompt generation, custom registries, optional image/route/storage adapters, 16 framework examples and 45 original programs.
- 0.2.0 has no specialized native crystal, molecule, protein or quantum circuit components. Geographic `Map` is not a crystal viewer. Those additions are specified in the roadmap.

The Framework owns UI and its interaction contract. Desktop supplies its existing model, job, data and authorization services. Future scientific UI is intended to ship as built-in Desktop product functionality with automatic registration; end users will not need additional skills.

## Recorded validation scope

Existing evidence records 353 tests, 3 independent consumers, React 19.2.3, Zod 3.25.76/4.4.3, Node 22.12.0/26.7.0 and Chrome 155. Actual Desktop, non-Chromium browsers and a live model workflow have not completed acceptance. See the [delivery record](../DELIVERY.md). These are executed checks, not certification of every production environment.
