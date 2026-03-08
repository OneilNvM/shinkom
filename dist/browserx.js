class o {
  #t = !1;
  #e = null;
  constructor(t = {}) {
    this.config = {
      disabled: !1,
      keyboardShortcuts: !1,
      ...t
    }, this.enableSwitching = !1, this.inspectorEl = null, this.frozenTarget = null;
  }
  #s = (t) => {
    if (t.preventDefault(), t.stopPropagation(), !this.#t) {
      this.#o(t.target);
      return;
    }
    if (this.#t && t.target === this.frozenTarget) {
      this.#l();
      return;
    } else
      this.#h(t.target);
  };
  #n = (t) => {
    this.#t || this.#i(t.target);
  };
  #r = (t) => {
    const e = t.ctrlKey, s = t.shiftKey, i = t.altKey;
    if (!this.inspectorEl && e && i && t.key === "c") {
      this.setup();
      return;
    }
    if (this.inspectorEl && e && s && t.key === "|") {
      this.reset();
      return;
    }
    if (this.inspectorEl && e && i && t.key === "\\") {
      this.destroy();
      return;
    }
    e && t.key === "\\" && (this.enableSwitching = !this.enableSwitching, console.log(`Switching is ${this.enableSwitching ? "enabled" : "disabled"}`));
  };
  #o(t) {
    this.#t = !0, this.frozenTarget = t, Object.assign(this.inspectorEl.style, {
      backgroundColor: "rgba(255,0,0,.3)",
      outlineColor: "rgb(255,0,0)"
    });
  }
  #l() {
    this.#t = !1, this.frozenTarget = null, Object.assign(this.inspectorEl.style, {
      backgroundColor: "rgba(0,255,0,.3)",
      outlineColor: "rgb(0,255,0)"
    });
  }
  #h(t) {
    this.enableSwitching && (this.#t = !0, this.frozenTarget = t, this.#i(t));
  }
  #a() {
    this.inspectorEl || (this.inspectorEl = document.createElement("div"), this.inspectorEl.id = "compat-inspector", Object.assign(this.inspectorEl.style, {
      position: "absolute",
      top: "0",
      backgroundColor: "rgba(0, 255, 0, .3)",
      outlineWidth: "1px",
      outlineStyle: "dashed",
      outlineColor: "rgb(0, 255, 0)",
      outlineOffset: "4px",
      zIndex: "9999",
      transitionProperty: "width, height, transform",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out",
      willChange: "width, height, transform",
      pointerEvents: "none"
    }), document.body.appendChild(this.inspectorEl));
  }
  setup() {
    if (this.inspectorEl || this.config.disabled) return;
    this.#e = this.#e === null && new AbortController();
    const { signal: t } = this.#e;
    window.addEventListener("pointerover", this.#n, { signal: t }), window.addEventListener("click", this.#s, { signal: t, capture: !0 }), window.addEventListener("keydown", this.#r), this.#a(), console.log(this.#e);
  }
  #i(t) {
    const { width: e, height: s, top: i, left: n } = t.getBoundingClientRect();
    Object.assign(this.inspectorEl.style, {
      width: `${e}px`,
      height: `${s}px`,
      transform: `translateX(${n}px) translateY(${i}px)`
    });
  }
  reset() {
    this.inspectorEl && (console.log("resetting inspector"), this.destroy(), this.setup());
  }
  destroy() {
    this.inspectorEl && (console.log("destroying inspector"), this.#e.abort(), document.body.removeChild(this.inspectorEl), this.inspectorEl = null, this.#e = null, this.#t = !1, this.enableSwitching = !0, this.frozenTarget = null);
  }
}
export {
  o as CompatInspector
};
