# ChatKit

A composable native `View` for agent chat in Buoy applications. The panel displays
a conversation, selected provider, project-item context, tool activity, proposed
changes, and provider permission requests. It delegates all model access, project
changes, credentials and process ownership to an application-supplied host.

Copy `packages/chatkit-0.1.0.buipkg` into a consumer project's `packages/` folder
and `Import chatkit`. The package has no external package dependencies. See the
[runnable panel example](../examples/chatkit_demo.bui) and the
[Studio workbench](https://github.com/BuoyBay/studio/blob/main/src/README.md) for complete applications.

`ChatPanel` inherits `View`. Populate it before attaching it to the window, then
call `LayoutPanel(width,height)` after resizing. Its minimum usable size is
240×320. Tool activity and the proposal/permission card take space only while
they have content. All controls and host callbacks run on the UI thread. Network work
belongs on a worker; subprocess sessions can be advanced from a timer.

| API | Purpose |
| --- | --- |
| `AttachHost(host)` / `DetachHost()` | Install/release `ChatPanelHost` callbacks |
| `SetProviders(ChatProvider[])` / `SelectProvider(id)` | Configure provider identity, availability and status |
| `SetContext(ChatContext[])` | Show registered project-item IDs, titles and revisions |
| `ComposerText`, `ContextIds`, `SelectedProviderId` | Read input/context; context arrays are detached copies |
| `AppendMessage(role,text)` / `AppendAssistantDelta(text)` | Render conversation and arriving text |
| `AppendToolActivity(id,title,status)` | Add or update one tool activity by stable ID |
| `ShowProposal(id,preview)` / `ClearProposal()` | Display an edit preview with Apply/Reject actions |
| `ShowPermission(title,details)` | Present an agent permission request with Allow once/Deny actions |
| `SetBusy(Boolean)` / `SetStatus(text)` | Coordinate composer/provider state with the host |
| `RawTranscriptText` / `CopyTranscript()` | Whole conversation as Markdown text (messages, tool calls with input/output, proposal diffs, permissions, outcomes), identical in web and native modes; copy it to the clipboard |
| `LastReplyText` / `HasTranscript` | Last assistant reply; cheap emptiness check for menu enabling |
| `ToggleTranscriptMode()` | Switch web ↔ native transcript (also the panel's **Web view / Native view** button); notifies an optional `ChatPanelViewHost.TranscriptModeChanged(plain)` |
| `TranscriptHasFocus` / `CopyTranscriptSelection()` / `SelectAllTranscript()` | Route menu-bar Copy / Select All into the web transcript, which is not a native text responder |

Implement `ChatPanelHost.SendMessage(providerId,prompt,contextIds)`, `CancelTurn`,
`ApproveProposal(id)`, `RejectProposal(id)`, `ProviderChanged(id)`,
`ResolvePermission(allow)`, and `SignInWithChatGPT`. The permission callback is
only the user's decision; the host must translate it to a provider's offered
option ID and must not grant a capability the provider did not offer. Applying
project changes remains the responsibility of the host's revision-checked
project model. The panel never executes a tool or writes a file by itself.

Provider descriptors are explicit: an unavailable provider is shown as
“not configured” and cannot send. Changing provider during an active turn is
rejected. Prompts containing only whitespace are ignored. A pending provider
permission can be answered while the turn remains busy. The panel stores one
pending proposal or permission card; the host must queue additional requests.
The built-in transcript is a selectable plain-text native `TextArea`, not a
Markdown renderer or a terminal emulator.

`ChatPanel` retains its host. A host window retaining its panel must call
`DetachHost()` on close to break that ownership cycle. Child control callbacks
hold weak references to the panel. `PerformSend`, `PerformCancel`,
`PerformApprove`, `PerformReject`, and `PerformSignIn` drive the same native
button actions as a user for integration tests.
