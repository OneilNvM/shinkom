<h1 align="center">Shinkom</h1>

<p align="center">
    <strong><em><span style="font-style:italic;">Shinkom</span></em>, the high-speed rail for real-time cross-browser compatibility analysis for websites.<br>
    A JavaScript library powered by a Rust/WASM engine, providing native speed cross-browser compatibility data processing and analysis.<br>
    </strong>
</p>

---

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

## Usage

**\*\*WIP\*\***
Package is currently still being developed. When core features have been created, proper usage for the library will be written.

---

## Node.js

Shinkom can be utilised in Node environments through its Engine module.
The UI components are strictly for browser environments, however the engine itself can be used independently in both environments.

### Example

```javascript
import { SKEngine } from 'shinkom/engine'

const skEngine = new SKEngine()

await skEngine.initEngine()

skEngine.checkElement(`<div id="test-div" class="test-classes">Test Div</div>`)
```

---

## Package Features

- Cross-browser compatibility based on MDN's browser-compat-data package
- Configurable cross-browser compatibility DOM inspection
- Full page cross-browser compatibility scan
- HTML parsing and compatibility checks via Rust and WASM engine module
- Interactive side panel for viewing results of compatibility checks
- Hints for improving cross-browser compatibility based on checks
- Optional accessibility evaluation and hints based on WCAG guidelines
- CSS and Javascript file parsing and cross-browser compatibility checks
