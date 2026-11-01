---
title: "ChatKit getting started"
summary: "Embed a local native panel and implement the host callbacks without invoking a model."
category: "Guides"
order: 10
keywords: ["window", "callbacks", "providers", "context", "detach"]
related: ["index.md", "api.md", "typed-api.md"]
---

# Getting started

Copy `chatkit-0.1.0.buipkg` into the consumer's `packages/` and `Import chatkit`. ChatKit has no external package dependency; its native controls still require the Buoy desktop runtime for the chosen platform.

## Run a local host

This complete desktop example echoes a message through the real host callback and supplies one context-item reference. It does not call a provider, execute a tool, or edit a project. Build it as a desktop application and run it in a graphical session.

```buoy
Import chatkit

Class LocalChatWindow Inherits Window Implements ChatPanelHost
    Public Property Panel As ChatPanel = New ChatPanel()

    Public Sub Constructor()
        Super.Constructor()
        Me.Title = "Local ChatKit example"
        Me.Move(100, 80, 560, 700)
        Me.Panel.Move(20, 20, 520, 660)
        Me.Panel.LayoutPanel(520, 660)
        Me.Panel.AttachHost(Me)
        Me.Panel.SetProviders([New ChatProvider("local", "Local example", True)])
        Me.Panel.SetContext([New ChatContext("main", "main.bui", 1)])
        Me.Panel.AppendMessage("Host", "Send a message to exercise the local callback.")
        Me.AddSubview(Me.Panel)
    End Sub

    Public Sub SendMessage(providerId As String, prompt As String, contextIds As Array Of String)
        Me.Panel.AppendMessage("You", prompt)
        Me.Panel.AppendMessage("Local host", "Received " + String.From(Array.Count(contextIds)) + " item references.")
    End Sub
    Public Sub CancelTurn()
        Me.Panel.SetBusy(False)
    End Sub
    Public Sub ApproveProposal(proposalId As String)
        Me.Panel.ClearProposal()
    End Sub
    Public Sub RejectProposal(proposalId As String)
        Me.Panel.ClearProposal()
    End Sub
    Public Sub ProviderChanged(providerId As String)
    End Sub
    Public Sub ResolvePermission(allow As Boolean)
        Me.Panel.ClearProposal()
    End Sub
    Public Sub SignInWithChatGPT()
        Me.Panel.AppendMessage("Host", "Connect a host-owned sign-in flow here.")
    End Sub
    Handle Closed()
        Me.Panel.DetachHost()
        Application.Quit()
    End Handle
End Class

Sub Main()
    Dim window As New LocalChatWindow()
    window.Show()
    Application.Run()
End Sub
```

## Connect the application model

Use stable provider IDs and authoritative project item IDs rather than filesystem guesses. `SendMessage` receives the selected provider, input text, and a detached array of context IDs. Resolve those IDs against your project's current buffers. Mark the panel busy during work, append arriving text/tool activity on the UI thread, and clear busy state when the host has a terminal turn outcome.

`ShowProposal` presents a preview; approval should call the project's revision-checked apply operation before clearing the card. `ShowPermission` presents a request; translate the boolean callback only to an option actually offered by that provider. Queue further proposals/permissions because the panel retains one card.

On resize, update the panel's frame and call `LayoutPanel` with the available dimensions. On close, detach the host before releasing the window/panel. The example uses a fixed window layout; a resizable host supplies its own resize handler.

Read the [API reference](api.md) for display and test-driving methods, or return to [ChatKit](index.md).
