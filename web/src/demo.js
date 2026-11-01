// Fake conversation that exercises every window.chat entry point.
// Loaded only for `npm run dev`, `#demo`, or a VITE_DEMO=1 build.

let fast = false;
const sleep = (ms) => (fast ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

const screenshot =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c6cf2"/><stop offset="1" stop-color="#3fb4d8"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="#f3f3f6"/><rect width="320" height="26" fill="#e3e3e9"/>' +
      '<circle cx="14" cy="13" r="5" fill="#ff5f57"/><circle cx="30" cy="13" r="5" fill="#febc2e"/><circle cx="46" cy="13" r="5" fill="#28c840"/>' +
      '<rect x="14" y="40" width="120" height="146" rx="6" fill="#fff"/><rect x="146" y="40" width="160" height="70" rx="6" fill="url(#g)"/>' +
      '<rect x="146" y="120" width="160" height="12" rx="4" fill="#d6d6de"/><rect x="146" y="140" width="110" height="12" rx="4" fill="#d6d6de"/>' +
      '<rect x="146" y="164" width="64" height="22" rx="6" fill="#7c6cf2"/>' +
      '<rect x="24" y="52" width="90" height="8" rx="3" fill="#cfcfd8"/><rect x="24" y="68" width="70" height="8" rx="3" fill="#cfcfd8"/><rect x="24" y="84" width="96" height="8" rx="3" fill="#cfcfd8"/>' +
      '</svg>'
  );

const REPLY = `I looked at \`SettingsWindow.bui\` and the screenshot. The layout breaks because the **Save** button is anchored to the window instead of the footer stack, so it overlaps the list when the window gets narrower than ~420px.

## What's going on

1. \`FooterStack\` uses a fixed \`Width\`, so it never shrinks.
2. \`SaveButton.Left\` is computed once in \`Opening\` and never updated.
   - Resizing doesn't re-run that code.
   - On Windows the DPI scale makes it worse.
3. The list has no bottom inset, so the last row hides under the footer.

> Tip: anchors are cheaper than recomputing frames in \`Resized\` - see the [layout guide](https://docs.example.com/buoy/layout).

## The fix

Anchor the footer to the bottom edge and let the button follow it:

\`\`\`buoy
' Keep the footer pinned and let the button float right.
Public Sub LayoutFooter()
    FooterStack.Anchors = Anchor.Left Or Anchor.Right Or Anchor.Bottom
    Dim inset As Integer = 12
    SaveButton.Left = FooterStack.Width - SaveButton.Width - inset
    If SaveButton.Left < inset Then
        SaveButton.Left = inset
    End If
    Return
End Sub
\`\`\`

The project settings stay the same, but I'd bump the minimum size:

\`\`\`json
{ "window": { "minWidth": 360, "minHeight": 280, "resizable": true } }
\`\`\`

| Width | Before | After |
| --- | :---: | ---: |
| 600px | OK | OK |
| 420px | Overlap | OK |
| 360px | Clipped | OK |

You can verify with \`buoy SettingsWindow.bui --check\`, then run:

\`\`\`bash
# rebuild and launch
buoy main.bui -o app && ./app --window settings
\`\`\`

I'll propose the edits now.`;

const DIFF_SETTINGS = `--- a/ui/SettingsWindow.bui
+++ b/ui/SettingsWindow.bui
@@ -12,8 +12,9 @@ Public Class SettingsWindow Inherits Window
     Public Sub Opening()
         Title = "Settings"
-        FooterStack.Width = 420
-        SaveButton.Left = 320
+        FooterStack.Anchors = Anchor.Left Or Anchor.Right Or Anchor.Bottom
+        LayoutFooter()
         OptionsList.BottomInset = FooterStack.Height
+        MinimumWidth = 360
     End Sub
 
     Public Sub Resized()
@@ -48,4 +49,13 @@ Public Class SettingsWindow Inherits Window
         Return True
     End Function
 
+    ' Keep the footer pinned and let the button float right.
+    Public Sub LayoutFooter()
+        Dim inset As Integer = 12
+        SaveButton.Left = FooterStack.Width - SaveButton.Width - inset
+        If SaveButton.Left < inset Then
+            SaveButton.Left = inset
+        End If
+    End Sub
+
 End Class
\\ No newline at end of file`;

const DIFF_JSON = `--- a/project.json
+++ b/project.json
@@ -3,7 +3,7 @@
   "version": "1.4.0",
   "window": {
-    "minWidth": 420,
-    "minHeight": 240,
+    "minWidth": 360,
+    "minHeight": 280,
     "resizable": true
   },
   "targets": ["macos", "windows", "linux"]`;

export async function runDemo(chat, opts = {}) {
  fast = !!opts.fast;
  chat.reset();
  chat.setEmpty({
    title: 'Buoy Studio agent',
    subtitle: 'Ask about your project, request a change, or start from a suggestion.',
    suggestions: ['Explain the selected file', 'Fix the failing --check errors', 'Add a dark-mode toggle to Settings'],
  });
  await sleep(1400);

  chat.addMessage({ id: 'n1', role: 'notice', author: 'Studio', text: 'Context: SettingsWindow.bui, project.json' });
  chat.addMessage({
    id: 'u1',
    role: 'user',
    author: 'You',
    text: 'The Save button overlaps the options list when I make the settings window narrow. Can you fix the layout?',
    attachments: [
      { name: 'settings-narrow.png', kind: 'image', dataUrl: screenshot },
      { name: 'SettingsWindow.bui', kind: 'file', detail: 'ui/ · rev 14' },
    ],
  });
  chat.setBusy({ busy: true, label: 'Thinking…' });
  await sleep(900);

  chat.setBusy({ busy: true, label: 'Reading project…' });
  chat.upsertTool({ id: 't1', name: 'read_project_item', status: 'running', detail: 'ui/SettingsWindow.bui', input: '{"id":"ui/SettingsWindow.bui","revision":14}' });
  await sleep(500);
  chat.upsertTool({ id: 't1', status: 'complete', output: 'Public Class SettingsWindow Inherits Window\n  ...\n(212 lines)' });
  chat.upsertTool({ id: 't2', name: 'search_project', status: 'running', detail: '"SaveButton.Left"', input: '{"query":"SaveButton.Left","regex":false}' });
  await sleep(600);
  chat.upsertTool({ id: 't2', status: 'complete', output: '{"matches":[{"path":"ui/SettingsWindow.bui","line":15},{"path":"ui/SettingsWindow.bui","line":31}]}' });
  chat.upsertTool({ id: 't3', name: 'check_file', status: 'running', detail: 'ui/Legacy.bui', input: '{"path":"ui/Legacy.bui","target":"x86_64-pc-windows-msvc"}' });
  await sleep(700);
  chat.upsertTool({ id: 't3', status: 'failed', output: 'E214: ui/Legacy.bui:8:5 unknown identifier \'OldLayout\'' });
  chat.upsertTool({ id: 't4', name: 'list_items', status: 'running', detail: 'ui/' });
  await sleep(350);
  chat.upsertTool({ id: 't4', status: 'complete', output: '["ui/SettingsWindow.bui","ui/MainWindow.bui","ui/Legacy.bui"]' });

  // stream the answer
  chat.setBusy({ busy: false });
  chat.addMessage({ id: 'a1', role: 'assistant', author: 'Claude', text: '' });
  const start = performance.now();
  let i = 0;
  let tokens = 0;
  while (i < REPLY.length) {
    const n = fast ? 400 : 2 + Math.floor(Math.random() * 6);
    chat.appendDelta({ id: 'a1', text: REPLY.slice(i, i + n) });
    i += n;
    tokens += 1;
    if (tokens % 4 === 0) {
      const el = performance.now() - start;
      chat.setStats({ id: 'a1', tokensOut: tokens, tokensIn: 3412, tokensPerSecond: tokens / Math.max(el / 1000, 0.05), elapsedMs: el, estimated: true });
    }
    await sleep(14);
  }
  chat.finishMessage({ id: 'a1' });
  const el = performance.now() - start;
  chat.setStats({ id: 'a1', tokensOut: tokens, tokensIn: 3412, tokensPerSecond: tokens / (el / 1000), elapsedMs: el, estimated: false });

  chat.setBusy({ busy: true, label: 'Preparing edits…' });
  chat.upsertTool({ id: 't5', name: 'propose_edits', status: 'running', detail: '2 files', input: '{"files":["ui/SettingsWindow.bui","project.json"]}' });
  await sleep(800);
  chat.upsertTool({ id: 't5', status: 'complete', output: '{"proposal":"p1"}' });
  chat.showProposal({
    id: 'p1',
    title: 'Pin the settings footer',
    canApply: true,
    files: [
      { path: 'ui/SettingsWindow.bui', revision: '14', added: 12, removed: 2, diff: DIFF_SETTINGS },
      { path: 'project.json', revision: '3', added: 2, removed: 2, diff: DIFF_JSON },
    ],
  });
  await sleep(500);
  chat.showPermission({
    id: 'perm1',
    title: 'Run "buoy --check" on 2 files',
    canAccept: true,
    details: '{"tool":"run_script","command":"buoy ui/SettingsWindow.bui --check --diagnostic-format json","cwd":"/projects/settings-demo","timeoutMs":30000}',
  });
  chat.setBusy({ busy: true, label: 'Waiting for approval' });

  window.chatDemoResolve = () => {
    chat.resolveCard({ id: 'perm1', outcome: 'allowed' });
    chat.resolveCard({ id: 'p1', outcome: 'applied' });
    chat.setBusy({ busy: false });
  };
}
