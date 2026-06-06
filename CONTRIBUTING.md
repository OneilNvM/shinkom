# Contributing

This project is being developed with the `pnpm` package manager. You will need to install `pnpm` in order to install any dependencies
and run package scripts.

You can install pnpm globally using this command:

```bash
npm install -g pnpm
```

or you could follow their guide on different methods to installing pnpm by [visiting their website](https://pnpm.io/installation).

You will also need to install Rust in order to make changes and also build the WASM binary through `wasm-bindgen`.

First you will need to install the latest stable version of Rust on the [official Rust website](https://rust-lang.org/learn/get-started/).

Then install the `wasm-pack` binary through this cargo command:

```bash
cargo install wasm-pack
```

After that, make sure to run `pnpm install` to install project dependencies, create a branch **from the dev branch**, add your code,
and **create a pull request to the dev branch**.

After review and approval of the pull request, we can introduce your changes to the dev branch and eventually to the main branch.
