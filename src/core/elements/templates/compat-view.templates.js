import pkg from '../../../../package.json'

export const compatViewHTML = `
<button id="sk-toggle-compat-view" class="sk-toggle-compat-view sk-button-style">
    <svg style="pointer-events: none;" version="1.0" xmlns="http://www.w3.org/2000/svg" width="57" height="26"
        viewBox="0 0 251.000000 114.000000" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,114.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none">
            <path
                d="M625 1126 c-63 -20 -97 -41 -143 -87 -68 -68 -95 -129 -100 -225 -4 -72 -1 -89 21 -138 14 -31 38 -71 52 -90 28 -37 112 -97 155 -111 14 -5 215 -11 447 -14 l421 -6 26 -24 c48 -45 40 -132 -13 -161 -13 -6 -240 -10 -660 -10 -567 0 -641 -2 -641 -15 0 -14 74 -15 649 -13 l649 3 27 25 c36 33 58 85 50 120 -7 33 -59 88 -89 95 -11 3 -203 6 -426 7 l-405 3 -55 26 c-63 30 -122 86 -153 144 -19 34 -22 57 -22 145 0 89 3 111 22 145 27 51 86 107 143 137 l45 23 738 3 737 2 0 -35 0 -35 -738 -2 -739 -3 -42 -30 c-153 -105 -152 -303 1 -402 l43 -28 430 -5 430 -5 42 -24 c66 -38 97 -90 101 -170 4 -83 -23 -142 -86 -186 l-44 -30 -489 -3 c-427 -2 -489 -5 -489 -18 0 -13 59 -14 483 -12 473 3 483 3 523 25 52 28 108 90 124 138 20 60 8 145 -28 197 -38 55 -58 73 -107 95 -36 16 -85 19 -466 23 l-426 5 -40 28 c-125 86 -116 284 16 354 l44 23 729 0 728 0 0 -35 0 -35 -712 0 c-689 0 -714 -1 -745 -20 -86 -52 -89 -163 -6 -217 24 -16 68 -18 453 -23 424 -5 425 -5 474 -29 125 -62 196 -190 183 -331 -10 -112 -78 -209 -182 -261 l-50 -24 -758 -3 c-665 -2 -757 -4 -757 -17 0 -14 90 -15 758 -13 l757 3 52 23 c54 25 149 115 175 167 26 50 41 134 35 191 -13 122 -109 249 -224 296 -57 23 -65 23 -468 26 -301 2 -416 6 -434 15 -54 27 -61 114 -13 162 l25 25 854 0 c941 0 893 -3 961 62 51 50 41 90 -36 139 l-46 29 -865 -1 c-669 0 -875 -3 -906 -13z m1823 -43 c46 -34 37 -48 -33 -48 -70 0 -89 18 -61 59 20 31 41 29 94 -11z m-248 -73 c0 -68 -1 -70 -25 -70 -24 0 -25 2 -25 70 0 68 1 70 25 70 24 0 25 -2 25 -70z" />
        </g>
    </svg>
</button>
<div id="sk-compat-view-container" class="sk-compat-view-container" style="display: none;">
    <div class="sk-compat-view">
        <nav class="sk-compat-view-nav">
            <div class="sk-shinkom-logo">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="106" height="48"
                    viewBox="0 0 251.000000 114.000000" preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,114.000000) scale(0.100000,-0.100000)" fill="#ffffff"
                        stroke="none">
                        <path
                            d="M625 1126 c-63 -20 -97 -41 -143 -87 -68 -68 -95 -129 -100 -225 -4 -72 -1 -89 21 -138 14 -31 38 -71 52 -90 28 -37 112 -97 155 -111 14 -5 215 -11 447 -14 l421 -6 26 -24 c48 -45 40 -132 -13 -161 -13 -6 -240 -10 -660 -10 -567 0 -641 -2 -641 -15 0 -14 74 -15 649 -13 l649 3 27 25 c36 33 58 85 50 120 -7 33 -59 88 -89 95 -11 3 -203 6 -426 7 l-405 3 -55 26 c-63 30 -122 86 -153 144 -19 34 -22 57 -22 145 0 89 3 111 22 145 27 51 86 107 143 137 l45 23 738 3 737 2 0 -35 0 -35 -738 -2 -739 -3 -42 -30 c-153 -105 -152 -303 1 -402 l43 -28 430 -5 430 -5 42 -24 c66 -38 97 -90 101 -170 4 -83 -23 -142 -86 -186 l-44 -30 -489 -3 c-427 -2 -489 -5 -489 -18 0 -13 59 -14 483 -12 473 3 483 3 523 25 52 28 108 90 124 138 20 60 8 145 -28 197 -38 55 -58 73 -107 95 -36 16 -85 19 -466 23 l-426 5 -40 28 c-125 86 -116 284 16 354 l44 23 729 0 728 0 0 -35 0 -35 -712 0 c-689 0 -714 -1 -745 -20 -86 -52 -89 -163 -6 -217 24 -16 68 -18 453 -23 424 -5 425 -5 474 -29 125 -62 196 -190 183 -331 -10 -112 -78 -209 -182 -261 l-50 -24 -758 -3 c-665 -2 -757 -4 -757 -17 0 -14 90 -15 758 -13 l757 3 52 23 c54 25 149 115 175 167 26 50 41 134 35 191 -13 122 -109 249 -224 296 -57 23 -65 23 -468 26 -301 2 -416 6 -434 15 -54 27 -61 114 -13 162 l25 25 854 0 c941 0 893 -3 961 62 51 50 41 90 -36 139 l-46 29 -865 -1 c-669 0 -875 -3 -906 -13z m1823 -43 c46 -34 37 -48 -33 -48 -70 0 -89 18 -61 59 20 31 41 29 94 -11z m-248 -73 c0 -68 -1 -70 -25 -70 -24 0 -25 2 -25 70 0 68 1 70 25 70 24 0 25 -2 25 -70z" />
                    </g>
                </svg>
                <span style="font-size: var(--sk-text-3xl);">Shinkom</span>
            </div>
            <div class="sk-nav-tabs">
                <button id="sk-overview-tab" class="sk-nav-tab">Overview</button>
                <div class="sk-nav-line"></div>
                <button id="sk-results-tab" class="sk-nav-tab">Results</button>
                <div class="sk-nav-line"></div>
                <button id="sk-history-tab" class="sk-nav-tab">History</button>
            </div>
        </nav>
        <hr class="sk-hr-line">
        <main part="compat-view-main" id="sk-compat-view-main" class="sk-compat-view-main"></main>
    </div>
</div>
`

export const compatViewOverviewHTML = `
<header class="sk-compat-view-header">
    <div class="sk-full-inspect-container">
        <p>Perform a full page inspect</p>
        <button id="sk-full-inspect" class="sk-full-inspect sk-button-style">Full Inspect</button>
    </div>
    <div class="sk-shinkom-version-container doto-regular">
        <div class="sk-shinkom-version">
            <div id="sk-version-indicator" class="sk-version-indicator"></div>
            <p class="sk-shinkom-version-text">Railway version ${pkg.version}</p>
        </div>
        <div>
            <span>Make sure to give Shinkom a star on <a href="https://github.com/OneilNvM/shinkom" target="_blank">GitHub</a>. Any support for the project is much
                appreciated!</span><svg width="18px" height="16px" viewBox="0 0 35 34"
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                aria-hidden="true" role="img" class="iconify iconify--twemoji"
                preserveAspectRatio="xMidYMid meet">
                <path fill="#DD2E44"
                    d="M35.885 11.833c0-5.45-4.418-9.868-9.867-9.868c-3.308 0-6.227 1.633-8.018 4.129c-1.791-2.496-4.71-4.129-8.017-4.129c-5.45 0-9.868 4.417-9.868 9.868c0 .772.098 1.52.266 2.241C1.751 22.587 11.216 31.568 18 34.034c6.783-2.466 16.249-11.447 17.617-19.959c.17-.721.268-1.469.268-2.242z">
                </path>
            </svg>
        </div>
    </div>
</header>
<hr class="sk-hr-line">
<section class="sk-recent-results">
    <p style="font-size: var(--sk-text-3xl);">Most recent results</p>
    <div class="sk-recent-results-list-container">
        <div class="sk-list-headers">
            <p>Checked At</p>
            <p>Overall Score</p>
            <p>View Result</p>
        </div>
        <ul id="sk-recent-results-list" class="sk-recent-results-list"></ul>
    </div>
</section>
`

export const compatViewStyleSheet = new CSSStyleSheet()
compatViewStyleSheet.replaceSync(`
    .doto-regular {
      font-family: "Doto", sans-serif;
      font-optical-sizing: auto;
      font-weight: 700;
      font-style: normal;
      font-variation-settings:
        "ROND" 100;
    }
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    .sk-shadow-host {
        position: relative;
        font-family: Arial, Helvetica, sans-serif;
        z-index: 991;
    }
    .sk-shadow-host * {
        transition-property: color, background-color, border-color;
        transition-duration: 300ms;
        transition-timing-function: ease-in-out;
    }
    .sk-button-style {
        width: fit-content;
        font-size: var(--sk-text-md);
        color: white;
        background-color: var(--sk-background-variant-2);
        border: 1px solid var(--sk-secondary);
        border-radius: .5rem;
        padding-inline: 1.1rem;
        padding-block: .3rem;
        cursor: pointer;
    }
    .sk-button-style:hover {
        background-color: var(--sk-hover-color);
    }
    .sk-hr-line {
        width: 100%;
        border: 0px solid transparent;
        border-top: 1px solid var(--sk-accent);
    }
    .sk-toggle-compat-view {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translate(-50%, 0%);
        padding: .25rem;
    }
    .sk-compat-view-container {
        position: fixed;
        top: 5rem;
        left: 50%;
        width: 70rem;
        height: 45rem;
        transform: translate(-50%, 0%);
        color: white;
    }
    .sk-compat-view {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: var(--sk-background-variant-1);
        border: 1px solid var(--sk-secondary);
        border-radius: 1rem;
        overflow: hidden;
    }
    .sk-compat-view-nav {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-template-rows: auto;
        align-items: center;
        height: 5rem;
        padding-inline: 2rem;
        padding-block: .75rem;
    }
    .sk-shinkom-logo {
        display: flex;
        align-items: center;
        gap: .5rem;
    }
    .sk-nav-tabs {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        align-items: center;
        height: 100%;
    }
    .sk-nav-tab {
        height: 100%;
        background: none;
        border: none;
        color: white;
        font-size: var(--sk-text-lg);
        cursor: pointer;
    }
    .sk-nav-line {
        position: absolute;
        height: 100%;
        border-left: 1px solid var(--sk-accent);
    }
    .sk-nav-tabs .sk-nav-line:first-of-type {
        left: calc(1/3 * 100%);
    }
    .sk-nav-tabs .sk-nav-line:last-of-type {
        left: calc(2/3 * 100%);
    }
    .sk-compat-view-header {
        display: grid;
        grid-template-columns: 1.9fr 2fr;
        grid-template-rows: auto;
        padding-block: 3rem;
        padding-inline: 2rem;
        flex: calc(1/4 * 100%);
    }
    .sk-full-inspect-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: var(--sk-text-xl);
    }
    .sk-full-inspect {
        margin-left: 1rem;
    }
    .sk-compat-view-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 40rem;
    }
    .sk-shinkom-version-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: var(--sk-text-md);
        color: #ffe600;
    }
    .sk-version-indicator {
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        border-radius: .2rem;
        background-size: 4px 4px;
    }
    .sk-shinkom-version {
        display: flex;
        align-items: center;
        gap: .25rem;
    }
    .sk-shinkom-version-text {
        margin-left: .75rem;
        font-size: var(--sk-text-2xl);
    }
    .sk-recent-results {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 100%;
        padding-inline: 3rem;
        padding-block: 2rem;
        flex: calc(3/4 * 100%);
    }
    .sk-recent-results-list-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-self: center;
        width: 90%;
        font-size: var(--sk-text-lg);
    }
    .sk-list-headers {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        align-items: center;
        justify-items: center;
        padding-inline: 1rem;
    }
    .sk-recent-results-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-self: center;
        gap: 1.5rem;
        width: 100%;
    }
    .sk-recent-results-item-container {
        display: flex;
        flex-direction: column;
        gap: .3rem;
        width: 100%;
    }
    .sk-recent-results-item {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        align-items: center;
        justify-items: center;
        width: 100%;
        padding-inline: 1rem;
        list-style: none;
    }
    .sk-compat-result-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15rem;
        width: 95%;
        height: 90%;
        background-image: linear-gradient(to bottom, #020202 60%, #0C0C0C 100%);
        border-radius: 1rem;
        font-size: var(--sk-text-xl);
        overflow-x: hidden;
        overflow-y: auto;
    }
    .sk-compat-result-header {
        display: flex;
        flex-direction: column;
        gap: 10rem;
        width: 100%;
        padding-inline: 5rem;
        padding-block: 2rem;
        font-size: var(--sk-text-4xl);
        color: var(--sk-results-yellow-foreground);
    }
    .sk-compat-header-top {
        display: flex;
        justify-content: space-between;
    }
    .sk-compat-header-top p:last-child {
        color: var(--sk-results-green-foreground);
    }
    .sk-compat-result-header p:nth-child(2) {
        align-self: center;
    }
    .sk-compat-results {
        display: flex;
        flex-direction: column;
        gap: 4rem;
        width: 95%;
        padding-block: 1rem;
        color: var(--sk-results-yellow-foreground);
        font-size: var(--sk-text-2xl);
    }
    .sk-compat-result {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    .sk-general-result {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .sk-general-result div:last-child p:first-child a {
        font-size: var(--sk-text-base);
    }
    .sk-general-result-meta {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        justify-items: center;
    }
    .sk-general-result-meta p:first-child {
        justify-self: flex-start;
    }
    .sk-general-result-meta p:last-child {
        color: var(--sk-results-green-foreground);
        justify-self: flex-end;
    }
    .sk-browser-results {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding-left: 1rem;
    }
    .sk-browser-result {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .sk-browser-result-meta {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        justify-items: center;
    }
    .sk-browser-result-meta p:first-child {
        justify-self: flex-start;
    }
    .sk-browser-result-meta p:last-child {
        justify-self: flex-end;
    }
    .sk-history-container {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        width: 100%;
        height: 40rem;
        padding-inline: 4rem;
        padding-block: 2rem;
        overflow-x: hidden;
        overflow-y: auto;
    }
    .sk-history-item {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        padding-block: 1.5rem;
        background-color: var(--sk-background-variant-3);
        border: 1px solid var(--sk-secondary);
        border-radius: 1rem;
        font-size: var(--sk-text-2xl);
        cursor: pointer;
        user-select: none;
    }
    .sk-history-item:hover {
        background-color: var(--sk-primary);
    }`
)

export const compatViewTransitions = new CSSStyleSheet()
compatViewTransitions.replaceSync(`
    /* CompatView transition styles injected from Shinkom */

    ::part(compat-view) {
        view-transition-name: compat-view;
    }

    @keyframes move-fade-in-y { from { opacity: 0; transform: translateY(-2rem) } }
    @keyframes move-fade-out-y { to { opacity: 0; transform: translateY(-2rem); } }
    @keyframes move-out-left { to { transform: translateX(-5rem); opacity: 0 } }
    @keyframes move-in-right { from { transform: translateX(5rem); opacity: 0 } }
    @keyframes move-out-right { to { transform: translateX(5rem); opacity: 0 } }
    @keyframes move-in-left { from { transform: translateX(-5rem); opacity: 0 } }

    ::view-transition-old(compat-view) {
        animation: 150ms ease-out both move-fade-out-y;
    }
    ::view-transition-new(compat-view) {
        animation: 150ms ease-out both move-fade-in-y;
    }

    [data-transition="forward"]::view-transition-group(compat-view),
    [data-transition="backward"]::view-transition-group(compat-view) {
        clip-path: inset(0 0 0 0);
    }

    [data-transition="forward"]::view-transition-new(compat-view),
    [data-transition="backward"]::view-transition-old(compat-view) {
        width: 100%;
        height: 100%;
    }

    [data-transition="forward"]::view-transition-old(compat-view) {
        animation: 300ms ease-out both move-out-left;
    }

    [data-transition="forward"]::view-transition-new(compat-view) {
        animation: 300ms ease-out both move-in-right;
    }

    [data-transition="backward"]::view-transition-old(compat-view) {
        animation: 300ms ease-out both move-out-right;
    }

    [data-transition="backward"]::view-transition-new(compat-view) {
        animation: 300ms ease-out both move-in-left;
    }
`)