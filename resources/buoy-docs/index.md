---
title: "ChatKit"
summary: "Compose a native agent chat panel whose host owns models, tools, and project changes."
category: "Overview"
order: 0
keywords: ["chat", "panel", "native", "ui", "host", "agent"]
related: ["getting-started.md", "api.md", "typed-api.md"]
---

# ChatKit

ChatKit is a composable native `View` for agent chat. `ChatPanel` displays conversation text, provider selection, project-item context, tool activity, proposed changes, and permission requests. An application-supplied `ChatPanelHost` owns model access, credentials, processes, tool policy, and project mutations.

## UI composition

Install the standalone package and embed `ChatPanel` in an existing window. Populate providers and context before attachment, then call `LayoutPanel(width, height)` after resizing. The minimum usable panel size is 240 by 320. Tool activity and the proposal/permission card consume space only when they contain content.

The transcript is a selectable native plain-text `TextArea`. It is not a Markdown renderer or terminal. All controls and callbacks run on the UI thread. Network calls belong on a worker; subprocess sessions can advance from a timer.

## Host ownership

An unavailable provider appears as not configured and cannot send. Provider changes are rejected during an active turn. Whitespace-only prompts are ignored. A pending permission can be answered while busy, but the panel holds one pending proposal or permission card: the host queues additional requests.

`ChatPanel` retains its host. A host window that retains its panel must call `DetachHost()` on close to break the ownership cycle. Child control callbacks use weak references to the panel.

The panel never executes tools or writes files. Apply/Reject and Allow once/Deny are decisions delivered to your host, which must validate provider options and apply edits through the revision-checked project model.

Build a local example with [Getting started](getting-started.md), or browse the [API reference](api.md).
