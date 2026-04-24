<h1 align="center">Shinkom</h1>

<p align="center">
    <strong><em><span style="font-style:italic;">Shinkom</span></em>, the high-speed rail for real-time cross-browser compatibility analysis for websites.<br>
    A JavaScript library powered by a Rust/WASM engine, providing native speed cross-browser compatibility data processing and analysis.<br>
    </strong>
</p>

## Introduction

**Shinkom** is a JavaScript library for real-time website cross-browser compatibility analysis.

It is *compatible* with many popular libraries and frameworks such as **React, Vue, NextJs, Nuxt** and Vanilla JS.
It is also accessible in **Node.Js**, [see more on Node.Js usage here](#nodejs).

---

## Purpose

The web has evolved a lot and so have browsers. Among the most popular browsers such as **Chrome, Firefox, Edge, Safari, Opera** and the like,
there are always new browsers being developed aiming to push the boundaries of what is capable of existing browser technology.
However, this causes a discrepency in the feature-set between modern browsers since they may use differing technology and architecture
when developing new browsers.
Web technology and languages such as **HTML, CSS and JavaScript** are constantly evolving which aids in the problem of features
either being widely supported or having limited support between browsers.

This makes cross-browser compatibility all the more important for a web developer to consider as neglecting this could lead
to users on other browsers having a poor experience visiting a website due to broken layouts, styling or functionality.
However, testing for compatibility on different browsers can often become tedious due to the volume of different browsers
and the many versions of each single one.

This is where **Shinkom** connects the rails!

The purpose of this library is to provide web developers an intuitive library for analysing the compatibility of a website in real-time during development.
This project depends heavily on the [@mdn/browser-compat-data](https://github.com/mdn/browser-compat-data/tree/main) project by MDN, which stores a large amount of compatibility data about
browsers and web features.

Most online browser compatibility websites usually require payment for the use of their services and don't often allow for
finer control of what specifically to test within the website.
Shinkom aims to provide that fine level of control, to allow web developers to discover the compatibility of their components
across many browsers during development.

This library can also make it easier to identify which specific browsers to test immediately without having to sift through documentation
to check if a feature works on a particular browser or test the website on every browser to discover potential issues.

**Shinkom conducts the analysis of the website content and browser compatibility data and delivers the compatibility result as fast as a bullet train.**

---

## IMPORTANT

It is important to mention that this project is made with **WebAssembly** through [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen).
Therefore, the engine will need to be initialized asynchronously and your server will need to accept the `application/wasm` MIME type.
It is recommended to read relevant documentation in whichever framework or bundler you are using to apply the correct configuration to accept
wasm files on your server or visit the [examples](/examples) directory, if your framework or bundler of choice is listed there for a working example.

---

## Getting Started

Shinkom can be installed from npm via the `shinkom` package

```bash
npm install -D shinkom
```

Once installed, you can then import the Shinkom package in JavaScript.
Shinkom can be used in frontend frameworks, bundlers and vanilla JS.

### Vanilla JS

```javascript
import { Shinkom } from 'shinkom'

const shinkom = new Shinkom()

shinkom.init()
```

### React

```javascript
import React, { useEffect } from 'react'
import { Shinkom } from 'shinkom'

export default function App() {
    useEffect(() => {
        const shinkom = new Shinkom()

        shinkom.init()

        return () => shinkom.destroy()
    }, [])
}
```

### Vue

```javascript
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Shinkom } from 'shinkom'
import wasm from 'shinkom/wasm?url'

const shinkom = new Shinkom({
    engine: {
        wasmURL: wasm
    }
})

onMounted(() => {
    shinkom.init()
})

onUnmounted(() => {
    shinkom.destroy()
})
</script>
```

You can also use Shinkom through the `require` statement in commonJS.

```javascript
const Shinkom = require('shinkom').Shinkom

const shinkom = new Shinkom()

shinkom.init()
```

If there are other frameworks or bundlers not listed here as being supported that you would like to use Shinkom with,
then consider contributing by creating a **pull request** on the **dev** branch to support it and make sure to **create an example for others!**

---

## Usage

### Basic

The simplest and **recommended** way to utilize Shinkom is through the main entry-point.

```javascript
import { Shinkom } from 'shinkom'

const shinkom = new Shinkom()

shinkom.init()
```

This enables the use of the **interactive UI and Rust/WASM engine** in order to inspect elements on a page.

### Modular

Shinkom was made to be **modular**, meaning you can also choose to use individual modules that you would
like to make use of for finer control.

```javascript
import { ShinkomBus, ShinkomState, SKEngine, CompatInspector, CompatUI } from 'shinkom'

const bus = new ShinkomBus()
const state = new ShinkomState()
const engine = new SKEngine(bus)
const inspector = new CompatInspector(bus, state)
const ui = new CompatUI(bus, state, [inspector])

ui.init()
engine.initEngine()
```

### Engine

The **Rust/WASM engine** can be used separately from the UI components in cases where you may want to automate
compatibility inspection without manually having to interact with a page.

```javascript
import { SKEngine } from 'shinkom/engine'

const engine = new SKEngine()

const run = async () => {
    await engine.initEngine()
}

await run()
```

If needed, you can also **preload** the WASM file for **lazy initialization** of the engine,
this can be particularly useful when using the engine in **SSR applications** to eliminate,
constant cold starts.

```javascript
import { SKEngine } from 'shinkom/engine'

const engine = new SKEngine()

const preLoad = async () => {
    await engine.loadWasm()
}

await preLoad()

// other operations //

await engine.initEngine()
```

---

## Node.js

Shinkom can be utilised in Node environments through its Engine module.
The UI components are strictly for browser environments, however the engine itself can be used independently in both environments.

### ESM Bundles

```javascript
import { SKEngine } from 'shinkom/engine'

const skEngine = new SKEngine()

await skEngine.initEngine()

skEngine.checkElement(`<div id="test-div" class="test-classes">Test Div</div>`)
```

### CommonJS Modules

```javascript
const SKEngine = require('shinkom/engine').SKEngine

const skEngine = new SKEngine()

const run = async () => {
    await skEngine.initEngine()

    skEngine.checkElement(`<div id="test-div" class="test-classes">Test Div</div>`)
}

run()
```

---

## Contributing

In order to contribute to this project, there are a few prerequisites before doing so:

- Install the latest stable version of Rust on the [official Rust website](https://rust-lang.org/learn/get-started/)
- Install `wasm-pack` via this command: `cargo install wasm-pack`
  
After that, make sure to run `npm i` to install project dependencies, create a branch **from the dev branch**, add your code,
and **create a pull request to the dev branch**.

After review and approval of the pull request, we can introduce your changes to the dev branch and eventually to the main branch.

---

## Development Scripts

When cloning or forking this library, refer to this table in regards to the NPM scripts:

| Scripts     |                                             Actions                                            |
|-------------|:----------------------------------------------------------------------------------------------:|
| dev:nobuild | Runs Vite dev server without running `build:wasm`                                              |
| dev         | Runs Vite dev server and builds a new WASM files through `build:wasm`.                         |
| build       | Builds the WASM and JS through `build:wasm` and `build:js` and outputs files to `dist` folder. |
| build:js    | Builds the ESM bundles and CJS modules for the Javascript library.                             |
| build:wasm  | Builds the WASM files through `wasm-pack` and outputs files to a `pkg` directory.              |
| test        | Runs tests through Vitest.                                                                     |
| type:check  | Runs `tsc` to check types in the `src` directory.                                              |
| gen:data    | Generates JSON files and outputs them to the `gen` directory.                                  |

---

## Package Features Checklist

- [x] Cross-browser compatibility based on MDN's browser-compat-data package
- [x] Configurable cross-browser compatibility DOM inspection
- [x] Full page cross-browser compatibility scan
- [x] HTML parsing and compatibility checks via Rust and WASM engine module
- [ ] Interactive side panel for viewing results of compatibility checks
- [ ] Hints for improving cross-browser compatibility based on checks
- [ ] Optional accessibility evaluation and hints based on WCAG guidelines
- [ ] CSS and Javascript file parsing and cross-browser compatibility checks
