# View-based agent chat panel

A composable View-based native agent chat panel. The panel displays
a conversation, selected provider, project-item context, tool activity, proposed
changes, and provider permission requests. It delegates all model access, project
changes, credentials and process ownership to an application-supplied host.

Copy `packages/chatkit-0.1.0.buipkg` into a consumer project's `packages/` folder
and `Import chatkit`. The package has no external package dependencies. See the
[runnable panel example](examples/chatkit_demo.bui) and the
[Studio workbench](docs/API.md) for complete applications.

## Install

From a Buoy consumer project with BPM installed:

```sh
bpm add chatkit --git https://github.com/BuoyBay/chatkit.git --rev refs/heads/main
```

BPM records the resolved commit in its lockfile. Keep that lockfile with the
consumer project for reproducible installs.

## API entrypoints

- `View`
- `Import chatkit`
- `ChatPanel`
- `LayoutPanel(width,height)`
- `AttachHost(host)`

## Build from source

With the native `build-packages` driver from [devtools](https://github.com/BuoyBay/devtools)
on your `PATH`, run from this checkout:

```sh
build-packages --root "$PWD" --compile-consumer chatkit
```

The driver checks source targets and compiles an import consumer. See the
[API guide](docs/API.md) for behavior, limits and any host prerequisites.

## Contributing

[Contributing](CONTRIBUTING.md) · [License](LICENSE)
