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

### WebAssembly

It is important to mention that this project is made with **WebAssembly** through [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen).
Therefore, the engine will need to be initialized asynchronously and your server will need to accept the `application/wasm` MIME type.
It is recommended to read relevant documentation in whichever framework or bundler you are using to apply the correct configuration to accept
WASM files on your server or visit the [examples](/examples) directory, if your framework or bundler of choice is listed there for a working example.

### Server-side Rendering Applications

The core engine of Shinkom can be run in Node.js environments, but this is not true for the UI components and the Shinkom entry-point as they are browser-only.
If using a framework that uses SSR, make sure to initialize the library in hooks that perform side-effects (i.e. `useEffect` or `onMounted`) to prevent
`window is undefined` errors during SSR pre-rendering.

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

https://github.com/user-attachments/assets/fc0dda8d-1f1b-44cf-bcbe-db7a5f4c76c9

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
this can be particularly useful when using the engine in **SSR applications** to eliminate
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

## Compatibility Checks

### Schema

In order to discover potential compatibility issues, Shinkom implements a score metric for the result of the compatibility check.

The general schema that an average compatibility check will follow goes like this:

```javascript
{
    "lookup_results": [
        // results for each web feature
        {
            "name": "fake-element", // name of the web feature
            "mdn_url": "https://developer.mozilla.org/docs/web/HTML/Reference/Elements/fake-element", // link that leads to MDN documentation of the web feature
            "compat_score": "100.00", // score based on the sum of the browser_score and status_score over the max compat score
            "browser_score": "100.00", // score based on the sum of weighted scores in each browser
            "status_score": "100.00", // score based on the status object in compatibility data
            "browsers": [
                // results for each checked browser
                {
                    "browser_name": "edge", // name of the browser
                    "score": {
                        "raw_score": "100.00", // score based on the safety of feature in browser
                        "weighted_score": "5.74", // score based on the usage of edge over the total market share between checked browsers
                    },
                    "versions": {
                        "version_added": "34" // feature added in edge engine version 34
                    }
                }
            ]
        }
    ],
    // the overall score of the compatibility check
    "overall_score": 100
}
```

This object consists of the following:

- The `overall_score` property is a number that represents the final score of the compatibility check. It is a sum of each `compat_score` a
  web feature has been given.
- The `lookup_results` property is an array of objects that contains each web feature's individual compatibility results.
- The `name` property is a string representing the name of the web feature.
- The `mdn_url` property is a string containing a link to the MDN Web Docs documentation for the web feature.
- The `compat_score` property is a string representing the calculated score for the web feature. It is calculated by summing the `browser_score` and `status_score`
  and then dividing that sum by the total compatibility score a feature can get (currently 200).
- The `browser_score` property is a string representing the sum of the `weighted_score`'s between each browser for the web feature.
- The `status_score` property is a string representing the calculated score based on the current status of this web feature (standard_track, experimental, or deprecated).
- The `browsers` property is an array of objects that contains each browsers individual compatibility results.
- The `browser_name` property is a string representing the name of the checked browser.
- The `score` property is an object containing the `raw_score` and `weighted_score` for the web feature in a particular browser.
  - `raw_score` is the calculated score before weighting is applied, which can be interpreted as the *safety* of a web feature.
  - `weighted_score` is the raw score but with a weighting multiplier calculated as such: **total_browser_usage / market_share**.
- The `versions` property can be either an object or an array of objects depending on whether the web feature has been added, removed or partially implemented
  in many different versions or just one version.

### Scoring

The scoring for the compatibility check is an important feature to make sure that it gives fair and understandable results that won't leave you
guessing why a check resulted in a particular score.

The table below lists the score types and their respective formulas:

| Score Type     |                                           Formula                                           |
|----------------|:-------------------------------------------------------------------------------------------:|
| overall_score  |                (compat_score~1~ + compat_score~2~ + ... compat_score~n~) / N                |
| compat_score   |                  ((browser_score + status_score) / MAX_COMPAT_SCORE) * 100                  |
| browser_score  | ((weighted_score~1~ + weighted_score~2~ + ... weighted_score~n~) / MAX_BROWSER_SCORE) * 100 |
| status_score   |                           (status_score / MAX_STATUS_SCORE) * 100                           |
| raw_score      |                            Raw score calculation explained below                            |
| weighted_score |                           raw_score * (total_usage / market_share)                          |

Here are a few things to clarify about these formulas:

- In `overall_score`, *N* represents the number of lookup results returned.
- `MAX_COMPAT_SCORE` has a value of 200, whereas `MAX_BROWSER_SCORE` and `MAX_STATUS_SCORE` have a value of 100.
- The `raw_score` is calculated based on many different factors.
  - If the current version of the browser is greater than the `version_added` value, the score is 100. This is
    also the case if `version_added` is set to `true`.
  - If the `version_removed` value is greater than the `version_added` value, the score is 0 since it is a removed feature.
  - If the `partial_implementation` value is set to true, the score is 80.
- `total_usage` is the usage of a browser across all of its versions, and the `market_share` is the sum of `total_usage`
  between every browser.
- The `browser_score` is the sum of the weighted scores from each browser divided by the `MAX_BROWSER_SCORE`.

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
- Install `wasm-pack` via this command:

  ```bash
  cargo install wasm-pack
  ```

After that, make sure to run `npm i` to install project dependencies, create a branch **from the dev branch**, add your code,
and **create a pull request to the dev branch**.

After review and approval of the pull request, we can introduce your changes to the dev branch and eventually to the main branch.

---

## Development Scripts

When cloning or forking this library, refer to this table in regards to the NPM scripts:

| Scripts     |                                             Actions                                                 |
|-------------|:---------------------------------------------------------------------------------------------------:|
| dev:nobuild | Runs Vite dev server without running `build:wasm`                                                   |
| dev         | Runs Vite dev server and builds a new WASM files through `build:wasm`.                              |
| build       | Builds the WASM and JS through `build:wasm` and `build:js` and outputs files to `dist` folder.      |
| build:js    | Builds the ESM bundles and CJS modules for the Javascript library.                                  |
| build:wasm  | Builds the WASM files through `wasm-pack` and outputs files to a `pkg` directory.                   |
| test        | Runs tests through Vitest.                                                                          |
| type:check  | Runs `tsc` to check types in the `src` directory.                                                   |
| gen:data    | Generates JSON files for compatibility data and usage data and outputs them to the `gen` directory. |

---

## Credits

This project wouldn't be possible without amazing projects providing the data necessary to perform these compatibility checks.

The [browser-compat-data](https://github.com/mdn/browser-compat-data) project by [MDN](https://github.com/mdn) is the single reason why this project was made possible. Make sure to check out their project as it compiles a large majority of modern
web features across multiple different browser environments.

The [caniuse-db](https://github.com/Fyrd/caniuse) package also plays a big role in keeping up-to-date with the global usage data of browsers and their market share.

Make sure to check out both of these great projects!

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
