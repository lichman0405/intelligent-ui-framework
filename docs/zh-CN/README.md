# Intelligent UI Framework 开发者手册

[English](../en/README.md) · [文档入口](../README.md)

适用版本：包 `0.2.0`；协议 `1.0`；`core`、`core-trusted`、`upstream` 库版本均为 `0.1.0`。更新时间：2026-10-20。

## 按角色阅读

| 你要做的事情 | 阅读顺序 |
| --- | --- |
| 将 UI 嵌入 React 页面 | 快速开始 → 流式与状态 → API 参考 |
| 接入 MiQroForge Desktop | 快速开始 → Host 接入 → 插件与服务 → 部署排障 |
| 增加组件、函数、动作 | 二次开发 → API 参考 → Prompt 与模型 → 原生 UI 路线 |
| 接入 Agent/模型后端 | Host 接入 → Prompt 与模型 → 版本与交付检查 |
| 验收和发布 | 部署排障 → 交付清单与历史证据 |

## 章节

1. [快速开始：安装、完整 React 示例、运行 Demo](QUICKSTART.md)
2. [OpenUI、流式输入、取消与状态恢复](STREAMING_STATE.md)
3. [Host Adapter、工具调用、权限与持久化](HOST_INTEGRATION.md)
4. [地图、HTML、图片、路线与浏览器端口](PLUGINS_ADAPTERS.md)
5. [Prompt、Gallery 与模型 Benchmark](PROMPT_BENCHMARK.md)
6. [自定义组件、函数、动作及库版本](DEVELOPMENT.md)
7. [部署、主题、诊断、兼容性与交付](DEPLOYMENT_TROUBLESHOOTING.md)
8. [完整 API 与组件／函数参考](REFERENCE.md)
9. [材料／化学／量子计算／生物原生 UI 路线](ROADMAP.md)

附录：[45 个完整 OpenUI 示例](GALLERY.md)；[共用 React 模块](../examples/README.md)。

## 已实现边界

- 核心 51 个组件、59 个库函数；`core-trusted` 增加 YouTube；显式 `upstream` 注册全部 55 个原项目组件。
- 官方 OpenUI Lang 解析器和 React Renderer；响应式变量、表达式、流式渲染、Query/Mutation、状态恢复。
- JSON 协议、Host 受控工具、Prompt、插件注册、可选图片／路线／存储适配器；16 个框架示例和 45 个原项目程序。
- 0.2.0 没有晶体、分子、蛋白质、量子电路等专用原生组件。地理 `Map` 也不是晶体结构视图。原生科学组件见路线图。

本框架负责 UI 与交互协议。Desktop 通过本身已有的模型、任务、数据和权限能力提供运行上下文。未来的科学 UI 将作为正式产品功能随 Desktop 交付并自动注册，无需终端用户安装 skill。

## 当前验证范围

已记录 353 项测试、3 个独立消费者、React 19.2.3、Zod 3.25.76／4.4.3、Node 22.12.0／26.7.0、Chrome 155。真实 Desktop、非 Chromium 浏览器和真实模型闭环尚未完成验收。详情见[交付记录](../DELIVERY.md)。该记录是已执行检查的范围，不等同于全部生产环境认证。
