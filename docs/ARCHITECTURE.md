# Architecture

## Package shape

One independently versioned package, `@intelligent-ui/framework`, exposes:

- `@intelligent-ui/framework/protocol`: JSON DTOs and runtime artifact/state validation; imports no React or Zod.
- `@intelligent-ui/framework/react`: React wrapper, host adapter context, default component registry, and official OpenUI Renderer bridge.
- `@intelligent-ui/framework/prompt`: library spec and prompt generation using the official OpenUI Lang core API.
- `@intelligent-ui/framework/styles.css`: opt-in scoped visual tokens and component styles.

The demo imports the package as a consumer and has no model key or Forge dependency.

## Data flow

```text
Host message lifecycle
  -> UIArtifactV1 validation
  -> IntelligentUIRenderer(source, streaming, state)
  -> @openuidev/react-lang Renderer
      -> UI component library / OpenUI functions
      -> JSON-validated state changes -> Host adapter
      -> structured actions -> Host adapter
      -> allowlisted Query/Mutation -> Host invokeTool
```

OpenUI Lang is treated as untrusted source text. The Framework does not evaluate general JavaScript, select a model, call a model provider, or own conversation/session persistence. The official Renderer handles parsing, streaming, expression updates, and Query/Mutation scheduling. The Framework maps its actual events and props onto the stable host contract.

## Security boundaries

- The default tool allowlist is empty. The adapter only creates a `toolProvider` function for explicitly named entries and denies all other tool names.
- Host callback context is supplied through React props and never inferred from OpenUI Lang.
- State and tool results must be finite JSON values within configured limits before persistence/transport.
- HTML/JS execution is excluded from core; an explicit plugin provides an opaque CSP iframe sandbox. Network resolvers and public map styles require Host opt-in.
- CSS uses `iui` class names and scoped tokens; the package does not reset host styles or mutate global theme variables.
