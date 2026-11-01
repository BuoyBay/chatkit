---
title: "ChatKit API"
summary: "Native chat descriptors, host callbacks, display updates, and explicit lifecycle methods."
category: "Reference"
order: 20
keywords: ["ChatPanel", "ChatPanelHost", "proposal", "permission", "transcript", "HTMLView", "diff", "attachment", "tokens"]
symbols: ["ChatProvider", "ChatContext", "ChatPanelHost", "ChatPanel", "ChatPanel.AttachHost", "ChatPanel.DetachHost", "ChatPanel.SetProviders", "ChatPanel.SelectProvider", "ChatPanel.SetContext", "ChatPanel.LayoutPanel", "ChatPanel.AppendMessage", "ChatPanel.AppendAssistantDelta", "ChatPanel.AppendToolActivity", "ChatPanel.ShowProposal", "ChatPanel.ShowPermission", "ChatPanel.ClearProposal", "ChatPanel.PerformSend", "ChatPanel.PerformCancel", "ChatPanel.PerformApprove", "ChatPanel.PerformReject", "ChatPanel.PerformSignIn", "ChatAttachment", "ChatFileChange", "ChatPanelAccountHost", "ChatPanel.AppendToolCall", "ChatPanel.ShowProposalChanges", "ChatPanel.SetUsage", "ChatPanel.SetEmptyState", "ChatPanel.SetDarkAppearance", "ChatPanel.UseRichTranscript", "ChatPanel.UsePlainTranscript", "ChatPanel.WebTranscriptBlocker", "ChatPanel.PendingAttachments", "ChatPanel.AddAttachment"]
related: ["index.md", "getting-started.md", "typed-api.md"]
---

# API reference

## Descriptors and host contract

`ChatProvider(providerId, title, available, detail = "")` exposes read-only `Id`, `Title`, `Available`, and `Detail`. It explicitly describes host configuration; it does not discover a provider. `ChatContext(itemId, title, version)` exposes immutable item identity, display title, and revision.

Implement every `ChatPanelHost` method:

| Callback | Host responsibility |
| --- | --- |
| `SendMessage(providerId, prompt, contextIds)` | Resolve current context, start the selected provider, own asynchronous work |
| `CancelTurn()` | Request cancellation through the actual provider/session |
| `ApproveProposal(proposalId)` / `RejectProposal(proposalId)` | Apply a revision-checked proposal or reject it |
| `ProviderChanged(providerId)` | Update host provider state |
| `ResolvePermission(allow)` | Map a decision to a valid offered provider option |
| `SignInWithChatGPT()` | Start a host-owned authentication flow |

Optionally implement `ChatPanelAccountHost` as well. The panel then shows one account button that toggles between **Sign in with ChatGPT** and **Sign out** (`SignOutOfChatGPT()`), and transcript links call `OpenChatFile(filePath)` / `OpenChatLink(url)`. Without it, a signed-in panel shows a disabled "Signed in with ChatGPT" button.

## Panel configuration and state

| Member | Contract |
| --- | --- |
| `AttachHost(host)` / `DetachHost()` | Retain/release host callbacks; detach on host close |
| `SetProviders(providers)` / `SelectProvider(providerId)` | Set provider descriptors and explicit selection |
| `SelectedProviderId` / `SelectedProviderAvailable` | Read selected identity and availability |
| `SetContext(items)` / `ContextIds` | Show context descriptors; read a detached ID array |
| `ComposerText` | Get/set input text |
| `TranscriptText`, `IsBusy`, `ProposalId` | Read display/lifecycle state |
| `SetBusy(busy)` / `SetStatus(message)` | Coordinate composer/provider state and host status text |
| `LayoutPanel(width, height)` | Recompute child layout after frame changes |
| `LayoutFrames()` | Return JSON frame snapshots useful to layout verification |

## Transcript surfaces

The transcript renders in an embedded `HTMLView`: markdown with highlighted code blocks, inline tool-call rows, proposal cards with unified diffs and Apply/Reject, permission cards, attachment thumbnails, a busy indicator and per-turn token statistics. The page is bundled (generated from `web/`, no network) and only in-memory content may load. A native plain-text transcript is the fallback and a development toggle:

| Member | Contract |
| --- | --- |
| `UseRichTranscript()` / `UsePlainTranscript()` | Switch surfaces at any time; the web surface replays the whole conversation when it reports ready |
| `RichTranscriptActive` / `PlainTranscript` | Web page loaded and live / native transcript shown |
| `Shared WebTranscriptBlocker()` | Why the web surface cannot run here, or `""`. Linux containers and hosts without user namespaces stay native, because WebKitGTK aborts the process when its sandbox cannot start. `BUOY_CHATKIT_PLAIN=1` forces native; `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS` skips the check |
| `SetEmptyState(title, subtitle, suggestions)` | Hero shown only while the transcript is empty; suggestion chips fill the composer and never send |
| `SetDarkAppearance(dark)` | Force the web palette; by default it follows the system |
| `ClearTranscript()` | Start a new conversation (not during a turn) |

If the web page never reports ready within six seconds the panel switches to the native transcript.

## Conversation and request display

`AppendMessage(role, text)` appends a labelled message. `AppendAssistantDelta(text)` appends arriving assistant text. `AppendToolActivity(toolId, title, status)` adds or updates a tool row by stable ID.

`AppendToolCall(toolId, name, status, detail, input, output)` is the structured form: `status` is `running`, `complete` or `failed`; `input`/`output` (for example JSON arguments) appear when the row is expanded.

`ShowProposal(proposalId, preview)` displays Apply/Reject actions; `ShowProposalChanges(proposalId, title, preview, files)` does the same with one `ChatFileChange(filePath, revision, unifiedDiff)` per file, rendered as a diff with line numbers and +/- counts (`preview` is the native fallback text). `ShowPermission(title, details, canAccept)` displays Allow once/Deny. `ClearProposal()` clears the pending card. Neither display operation mutates the project or resolves provider permission itself. Cards stay in the transcript with their outcome; buttons on a stale card are ignored.

`SetUsage(inputTokens, outputTokens)` replaces the streamed-character estimate (about four characters per token) shown under the assistant reply with real counts.

## Attachments

Users attach files with **Attach…** or by dropping files on the composer. `ChatAttachment.FromFile(item)` records path, name, MIME type and size, plus an inline thumbnail for images up to 6 MB. Hosts read `PendingAttachments` inside `SendMessage`; after a successful send the panel clears them and shows them on the user's message. The panel never uploads attachment bytes: the host decides how a provider receives them (Buoy Studio lists the paths in the prompt). `AddAttachment`, `AttachFile` and `ClearAttachments` manage the queue programmatically.

## Integration-test actions

`PerformSend`, `PerformCancel`, `PerformApprove`, `PerformReject`, and `PerformSignIn` drive the same action paths as native buttons (or inline cards in the web transcript). `PerformPageMessage(json)` delivers a message as if the page posted it. They do not bypass availability, busy, or prompt validation. Use them with an explicit test host instead of real providers.

All UI updates and host callbacks run on the UI thread. Hosts should marshal worker results back to that thread and maintain turn/proposal queues outside the panel.

See [Getting started](getting-started.md) for a complete host and [ChatKit](index.md) for ownership boundaries.


[Full typed API: properties, parameters, defaults, and returns](typed-api.md)
