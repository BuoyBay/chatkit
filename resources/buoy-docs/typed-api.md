---
title: "chatkit typed API"
summary: "Source-derived public signatures, properties, parameters, defaults, and return values."
category: "Reference"
order: 21
types: ["ChatAttachment", "ChatContext", "ChatFileChange", "ChatPanel", "ChatPanelAccountHost", "ChatPanelHost", "ChatProvider"]
dependencies: []
symbols: ["ChatAttachment", "ChatContext", "ChatFileChange", "ChatPanel", "ChatPanelAccountHost", "ChatPanelHost", "ChatProvider"]
related: ["api.md", "getting-started.md", "index.md"]
---

# chatkit typed API

Generated from the package source declarations. Platform guards are shown where present; inherited members are documented on the base type. See the [API contracts](api.md) for behavior and limitations.

## ChatProvider

`Public Class ChatProvider`

An application-supplied provider descriptor; unavailable providers remain visible but cannot send.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `Id` | `String` | Yes | No | — | — |
| `Title` | `String` | Yes | No | — | — |
| `Available` | `Boolean` | Yes | No | — | — |
| `Detail` | `String` | Yes | No | — | — |

### Constructor

`Public Sub Constructor(providerId As String, title As String, available As Boolean, detail As String = "")`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `providerId` | `String` | `ByVal` | Required |
| `title` | `String` | `ByVal` | Required |
| `available` | `Boolean` | `ByVal` | Required |
| `detail` | `String` | `ByVal` | `""` |

Returns: no value.

## ChatContext

`Public Class ChatContext`

A project-item reference, not a copied file on disk. The host resolves its current revision.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `ItemId` | `String` | Yes | No | — | — |
| `Title` | `String` | Yes | No | — | — |
| `Version` | `Integer` | Yes | No | — | — |

### Constructor

`Public Sub Constructor(itemId As String, title As String, version As Integer)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `itemId` | `String` | `ByVal` | Required |
| `title` | `String` | `ByVal` | Required |
| `version` | `Integer` | `ByVal` | Required |

Returns: no value.

## ChatAttachment

`Public Class ChatAttachment`

A user-chosen file (image or document) attached to the next prompt. Images up to ImagePreviewLimit bytes carry an inline data URL for the transcript thumbnail.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `Path` | `String` | Yes | No | — | — |
| `Name` | `String` | Yes | No | — | — |
| `Kind` | `String` | Yes | No | — | "image" or "file". |
| `MimeType` | `String` | Yes | No | — | — |
| `Size` | `Integer` | Yes | No | — | — |
| `DataUrl` | `String` | Yes | No | — | — |

### Constants

| Name | Type | Value / Default | Description |
| --- | --- | --- | --- |
| `ImagePreviewLimit` | `Integer` | `6291456` | — |

### Constructor

`Public Sub Constructor(filePath As String, name As String, kind As String, mimeType As String, size As Integer, dataUrl As String = "")`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `filePath` | `String` | `ByVal` | Required |
| `name` | `String` | `ByVal` | Required |
| `kind` | `String` | `ByVal` | Required |
| `mimeType` | `String` | `ByVal` | Required |
| `size` | `Integer` | `ByVal` | Required |
| `dataUrl` | `String` | `ByVal` | `""` |

Returns: no value.

### FromFile

`Public Shared Function FromFile(item As FileSystemItem) As ChatAttachment`

Reads metadata (and a thumbnail for small images) from an existing file.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `item` | `FileSystemItem` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `ChatAttachment` |

## ChatFileChange

`Public Class ChatFileChange`

One file inside a proposal card; DiffText is a unified diff the host computed.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `Path` | `String` | Yes | No | — | — |
| `Revision` | `Integer` | Yes | No | — | — |
| `DiffText` | `String` | Yes | No | — | — |
| `Added` | `Integer` | Yes | No | — | — |
| `Removed` | `Integer` | Yes | No | — | — |

### Constructor

`Public Sub Constructor(filePath As String, revision As Integer, diffText As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `filePath` | `String` | `ByVal` | Required |
| `revision` | `Integer` | `ByVal` | Required |
| `diffText` | `String` | `ByVal` | Required |

Returns: no value.

## ChatPanelHost

`Public Interface ChatPanelHost`

### SendMessage

`Sub SendMessage(providerId As String, prompt As String, contextIds As Array Of String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `providerId` | `String` | `ByVal` | Required |
| `prompt` | `String` | `ByVal` | Required |
| `contextIds` | `Array Of String` | `ByVal` | Required |

Returns: no value.

### CancelTurn

`Sub CancelTurn()`

No parameters.

Returns: no value.

### ApproveProposal

`Sub ApproveProposal(proposalId As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `proposalId` | `String` | `ByVal` | Required |

Returns: no value.

### RejectProposal

`Sub RejectProposal(proposalId As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `proposalId` | `String` | `ByVal` | Required |

Returns: no value.

### ProviderChanged

`Sub ProviderChanged(providerId As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `providerId` | `String` | `ByVal` | Required |

Returns: no value.

### ResolvePermission

`Sub ResolvePermission(allow As Boolean)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `allow` | `Boolean` | `ByVal` | Required |

Returns: no value.

### SignInWithChatGPT

`Sub SignInWithChatGPT()`

No parameters.

Returns: no value.

## ChatPanelAccountHost

`Public Interface ChatPanelAccountHost`

Optional host capabilities. When the host implements this interface the account button toggles between sign-in and sign-out, and transcript links/files open in the host.

### SignOutOfChatGPT

`Sub SignOutOfChatGPT()`

No parameters.

Returns: no value.

### OpenChatFile

`Sub OpenChatFile(filePath As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `filePath` | `String` | `ByVal` | Required |

Returns: no value.

### OpenChatLink

`Sub OpenChatLink(url As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `url` | `String` | `ByVal` | Required |

Returns: no value.

### ChatMimeType

`Public Function ChatMimeType(fileExt As String) As String`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `fileExt` | `String` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

### ChatByteSize

`Public Function ChatByteSize(size As Integer) As String`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `size` | `Integer` | `ByVal` | Required |

#### Returns

| Type |
| --- |
| `String` |

### ChatTranscriptHTML

`Public Function ChatTranscriptHTML() As String`

The bundled transcript document (Svelte build, single file, no network).

No parameters.

#### Returns

| Type |
| --- |
| `String` |

## ChatPanel

`Public Class ChatPanel Inherits View`

A native, main-thread-only panel. The host owns transport, project edits and authentication. The transcript renders in an embedded HTMLView (markdown, inline tool calls, diff and approval cards, attachments, turn stats) and falls back to plain native text when no web engine is available. Set BUOY_CHATKIT_PLAIN=1 to force the plain transcript.

### Properties

| Name | Type | Read-Only | Shared | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `RichTranscriptActive` | `Boolean` | Yes | No | — | True once the HTML transcript has loaded and is receiving updates. |
| `PlainTranscript` | `Boolean` | Yes | No | — | True when the panel shows the plain native transcript (no web engine, or forced). |
| `AuthenticationCaption` | `String` | Yes | No | — | — |
| `AuthenticationVisible` | `Boolean` | Yes | No | — | — |
| `SelectedModel` | `String` | Yes | No | — | — |
| `SelectedProviderId` | `String` | Yes | No | — | — |
| `SelectedProviderAvailable` | `Boolean` | Yes | No | — | — |
| `ContextIds` | `Array Of String` | Yes | No | — | — |
| `ComposerText` | `String` | No | No | — | — |
| `TranscriptText` | `String` | Yes | No | — | — |
| `IsBusy` | `Boolean` | Yes | No | — | — |
| `ProposalId` | `String` | Yes | No | — | — |
| `PendingAttachments` | `Array Of ChatAttachment` | Yes | No | — | Files queued for the next prompt. Hosts read this inside SendMessage; the panel clears it after a successful send and shows the files on the user's message. |

### Constants

| Name | Type | Value / Default | Description |
| --- | --- | --- | --- |
| `RichTimeoutMicroseconds` | `Integer` | `6000000` | — |

### Constructor

`Public Sub Constructor()`

No parameters.

Returns: no value.

### AttachHost

`Public Sub AttachHost(host As ChatPanelHost)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `host` | `ChatPanelHost` | `ByVal` | Required |

Returns: no value.

### UsePlainTranscript

`Public Sub UsePlainTranscript()`

Switch to the plain native transcript (also used when the web engine never starts).

No parameters.

Returns: no value.

### WebTranscriptBlocker

`Public Shared Function WebTranscriptBlocker() As String`

Why the web transcript cannot run here, or "" when it can. WebKitGTK aborts the whole process when its bubblewrap sandbox cannot create user namespaces (containers, hosts with max_user_namespaces=0), so those hosts use the native transcript instead. BUOY_CHATKIT_PLAIN=1 forces native; WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS skips the check.

No parameters.

#### Returns

| Type |
| --- |
| `String` |

### UseRichTranscript

`Public Sub UseRichTranscript()`

Switch (back) to the web transcript. The full conversation is replayed once the page reports ready; if it never does, the panel returns to the plain transcript.

No parameters.

Returns: no value.

### SetDarkAppearance

`Public Sub SetDarkAppearance(dark As Boolean)`

Forces the transcript palette; by default it follows the system appearance.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `dark` | `Boolean` | `ByVal` | Required |

Returns: no value.

### SetEmptyState

`Public Sub SetEmptyState(title As String, subtitle As String, suggestions As Array Of String)`

Hero shown while the transcript is empty; suggestion chips fill the composer.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `title` | `String` | `ByVal` | Required |
| `subtitle` | `String` | `ByVal` | Required |
| `suggestions` | `Array Of String` | `ByVal` | Required |

Returns: no value.

### ClearTranscript

`Public Sub ClearTranscript()`

Clears the conversation (transcript, tool activity, statistics).

No parameters.

Returns: no value.

### SetAuthenticationState

`Public Sub SetAuthenticationState(signedIn As Boolean, busy As Boolean = False)`

The host publishes verified identity and pending authentication independently of chat turns. One button toggles: "Sign in with ChatGPT" while signed out, "Sign out" while signed in.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `signedIn` | `Boolean` | `ByVal` | Required |
| `busy` | `Boolean` | `ByVal` | `False` |

Returns: no value.

### SetAuthenticationVisible

`Public Sub SetAuthenticationVisible(visible As Boolean)`

Show account actions only for the backend that owns this authentication flow.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `visible` | `Boolean` | `ByVal` | Required |

Returns: no value.

### DetachHost

`Public Sub DetachHost()`

Call when closing the host window to release callbacks and stop accepting sends.

No parameters.

Returns: no value.

### SetProviders

`Public Sub SetProviders(providers As Array Of ChatProvider)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `providers` | `Array Of ChatProvider` | `ByVal` | Required |

Returns: no value.

### SetModels

`Public Sub SetModels(models As JSONItem, selectedModel As String = "")`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `models` | `JSONItem` | `ByVal` | Required |
| `selectedModel` | `String` | `ByVal` | `""` |

Returns: no value.

### SelectModel

`Public Sub SelectModel(model As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `model` | `String` | `ByVal` | Required |

Returns: no value.

### SelectProvider

`Public Sub SelectProvider(providerId As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `providerId` | `String` | `ByVal` | Required |

Returns: no value.

### SetContext

`Public Sub SetContext(items As Array Of ChatContext)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `items` | `Array Of ChatContext` | `ByVal` | Required |

Returns: no value.

### AddAttachment

`Public Sub AddAttachment(attachment As ChatAttachment)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `attachment` | `ChatAttachment` | `ByVal` | Required |

Returns: no value.

### AttachFile

`Public Sub AttachFile(item As FileSystemItem)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `item` | `FileSystemItem` | `ByVal` | Required |

Returns: no value.

### ClearAttachments

`Public Sub ClearAttachments()`

No parameters.

Returns: no value.

### SetBusy

`Public Sub SetBusy(busy As Boolean)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `busy` | `Boolean` | `ByVal` | Required |

Returns: no value.

### SetStatus

`Public Sub SetStatus(message As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `message` | `String` | `ByVal` | Required |

Returns: no value.

### SetUsage

`Public Sub SetUsage(inputTokens As Integer, outputTokens As Integer)`

Real token counts from the provider replace the streamed-character estimate.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `inputTokens` | `Integer` | `ByVal` | Required |
| `outputTokens` | `Integer` | `ByVal` | Required |

Returns: no value.

### AppendMessage

`Public Sub AppendMessage(role As String, text As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `role` | `String` | `ByVal` | Required |
| `text` | `String` | `ByVal` | Required |

Returns: no value.

### AppendChatMessage

`Public Sub AppendChatMessage(kind As String, author As String, text As String, attachments As Array Of ChatAttachment, transcriptRole As String = "")`

Adds a message with an explicit kind ("user", "assistant", "system", "notice", "error").

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `kind` | `String` | `ByVal` | Required |
| `author` | `String` | `ByVal` | Required |
| `text` | `String` | `ByVal` | Required |
| `attachments` | `Array Of ChatAttachment` | `ByVal` | Required |
| `transcriptRole` | `String` | `ByVal` | `""` |

Returns: no value.

### AppendAssistantDelta

`Public Sub AppendAssistantDelta(text As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `text` | `String` | `ByVal` | Required |

Returns: no value.

### AppendToolActivity

`Public Sub AppendToolActivity(toolId As String, title As String, status As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `toolId` | `String` | `ByVal` | Required |
| `title` | `String` | `ByVal` | Required |
| `status` | `String` | `ByVal` | Required |

Returns: no value.

### AppendToolCall

`Public Sub AppendToolCall(toolId As String, name As String, status As String, detail As String, input As String, output As String)`

Inline tool row. Later calls with the same toolId update the row in place. status: "running", "complete" or "failed" (other text is shown as detail).

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `toolId` | `String` | `ByVal` | Required |
| `name` | `String` | `ByVal` | Required |
| `status` | `String` | `ByVal` | Required |
| `detail` | `String` | `ByVal` | Required |
| `input` | `String` | `ByVal` | Required |
| `output` | `String` | `ByVal` | Required |

Returns: no value.

### ShowProposal

`Public Sub ShowProposal(proposalId As String, preview As String)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `proposalId` | `String` | `ByVal` | Required |
| `preview` | `String` | `ByVal` | Required |

Returns: no value.

### ShowProposalChanges

`Public Sub ShowProposalChanges(proposalId As String, title As String, preview As String, files As Array Of ChatFileChange)`

Proposal card with per-file unified diffs. `preview` is the plain-text fallback.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `proposalId` | `String` | `ByVal` | Required |
| `title` | `String` | `ByVal` | Required |
| `preview` | `String` | `ByVal` | Required |
| `files` | `Array Of ChatFileChange` | `ByVal` | Required |

Returns: no value.

### ShowPermission

`Public Sub ShowPermission(title As String, details As String, canAccept As Boolean = True)`

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `title` | `String` | `ByVal` | Required |
| `details` | `String` | `ByVal` | Required |
| `canAccept` | `Boolean` | `ByVal` | `True` |

Returns: no value.

### ClearProposal

`Public Sub ClearProposal()`

No parameters.

Returns: no value.

### PerformSignIn

`Public Sub PerformSignIn()`

No parameters.

Returns: no value.

### PerformSend

`Public Sub PerformSend()`

No parameters.

Returns: no value.

### PerformCancel

`Public Sub PerformCancel()`

No parameters.

Returns: no value.

### PerformApprove

`Public Sub PerformApprove()`

No parameters.

Returns: no value.

### PerformReject

`Public Sub PerformReject()`

No parameters.

Returns: no value.

### PerformPageMessage

`Public Sub PerformPageMessage(message As String)`

Test hook: deliver a page message as if the transcript posted it.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `message` | `String` | `ByVal` | Required |

Returns: no value.

### LayoutFrames

`Public Function LayoutFrames() As Array Of JSONItem`

No parameters.

#### Returns

| Type |
| --- |
| `Array Of JSONItem` |

### LayoutPanel

`Public Sub LayoutPanel(width As Integer, height As Integer)`

Invoke after resizing the surrounding View. Minimum usable panel is 240 by 320. In rich mode tool activity and proposal/permission cards render inline in the transcript; the plain fallback gives them native areas while they have content.

#### Parameters

| Name | Type | Passing | Default |
| --- | --- | --- | --- |
| `width` | `Integer` | `ByVal` | Required |
| `height` | `Integer` | `ByVal` | Required |

Returns: no value.
