/**
    * Shinkom - pkg
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region pkg/shinkore.js
/**
* The [`CompatEngine`] struct stores the compatibility data
* and acts as an entry-point for the Rust/WASM engine.
*/
var CompatEngine = class {
	__destroy_into_raw() {
		const ptr = this.__wbg_ptr;
		this.__wbg_ptr = 0;
		CompatEngineFinalization.unregister(this);
		return ptr;
	}
	free() {
		const ptr = this.__destroy_into_raw();
		wasm.__wbg_compatengine_free(ptr, 0);
	}
	/**
	* Used for checking the compatibility of a single element and its attributes.
	* @param {string} html
	* @returns {any}
	*/
	check_element(html) {
		const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		const ret = wasm.compatengine_check_element(this.__wbg_ptr, ptr0, len0);
		if (ret[2]) throw takeFromExternrefTable0(ret[1]);
		return takeFromExternrefTable0(ret[0]);
	}
	/**
	* Used for checking the compatibility of multiple elements and their attributes
	*
	* `depth_level` is used to control how far down in a nested HTML structure to go before
	* returning element tags.
	*
	* See [`preprocess::pre_process_html`] to learn more about how `depth_level` works.
	* @param {string} html
	* @param {number} depth_level
	* @returns {any}
	*/
	check_elements(html, depth_level) {
		const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		const ret = wasm.compatengine_check_elements(this.__wbg_ptr, ptr0, len0, depth_level);
		if (ret[2]) throw takeFromExternrefTable0(ret[1]);
		return takeFromExternrefTable0(ret[0]);
	}
	/**
	* Used for performing a full page compatibility check.
	* @param {string} html
	* @returns {any}
	*/
	full_inspect(html) {
		const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		const ret = wasm.compatengine_full_inspect(this.__wbg_ptr, ptr0, len0);
		if (ret[2]) throw takeFromExternrefTable0(ret[1]);
		return takeFromExternrefTable0(ret[0]);
	}
	/**
	* Constructs an new engine instance
	* @param {any} bcd_html_data
	* @param {any} bcd_svg_data
	* @param {any} bcd_browser_data
	* @param {any} ciu_usage_data
	*/
	constructor(bcd_html_data, bcd_svg_data, bcd_browser_data, ciu_usage_data) {
		this.__wbg_ptr = wasm.compatengine_new(bcd_html_data, bcd_svg_data, bcd_browser_data, ciu_usage_data) >>> 0;
		CompatEngineFinalization.register(this, this.__wbg_ptr, this);
		return this;
	}
};
if (Symbol.dispose) CompatEngine.prototype[Symbol.dispose] = CompatEngine.prototype.free;
function __wbg_get_imports() {
	const import0 = {
		__proto__: null,
		__wbg_Error_960c155d3d49e4c2: function(arg0, arg1) {
			return Error(getStringFromWasm0(arg0, arg1));
		},
		__wbg_String_8564e559799eccda: function(arg0, arg1) {
			const ptr1 = passStringToWasm0(String(arg1), wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			const len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_bigint_get_as_i64_3d3aba5d616c6a51: function(arg0, arg1) {
			const v = arg1;
			const ret = typeof v === "bigint" ? v : void 0;
			getDataViewMemory0().setBigInt64(arg0 + 8, isLikeNone(ret) ? BigInt(0) : ret, true);
			getDataViewMemory0().setInt32(arg0 + 0, !isLikeNone(ret), true);
		},
		__wbg___wbindgen_boolean_get_6ea149f0a8dcc5ff: function(arg0) {
			const v = arg0;
			const ret = typeof v === "boolean" ? v : void 0;
			return isLikeNone(ret) ? 16777215 : ret ? 1 : 0;
		},
		__wbg___wbindgen_debug_string_ab4b34d23d6778bd: function(arg0, arg1) {
			const ptr1 = passStringToWasm0(debugString(arg1), wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			const len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_in_a5d8b22e52b24dd1: function(arg0, arg1) {
			return arg0 in arg1;
		},
		__wbg___wbindgen_is_bigint_ec25c7f91b4d9e93: function(arg0) {
			return typeof arg0 === "bigint";
		},
		__wbg___wbindgen_is_function_3baa9db1a987f47d: function(arg0) {
			return typeof arg0 === "function";
		},
		__wbg___wbindgen_is_object_63322ec0cd6ea4ef: function(arg0) {
			const val = arg0;
			return typeof val === "object" && val !== null;
		},
		__wbg___wbindgen_is_string_6df3bf7ef1164ed3: function(arg0) {
			return typeof arg0 === "string";
		},
		__wbg___wbindgen_is_undefined_29a43b4d42920abd: function(arg0) {
			return arg0 === void 0;
		},
		__wbg___wbindgen_jsval_eq_d3465d8a07697228: function(arg0, arg1) {
			return arg0 === arg1;
		},
		__wbg___wbindgen_jsval_loose_eq_cac3565e89b4134c: function(arg0, arg1) {
			return arg0 == arg1;
		},
		__wbg___wbindgen_number_get_c7f42aed0525c451: function(arg0, arg1) {
			const obj = arg1;
			const ret = typeof obj === "number" ? obj : void 0;
			getDataViewMemory0().setFloat64(arg0 + 8, isLikeNone(ret) ? 0 : ret, true);
			getDataViewMemory0().setInt32(arg0 + 0, !isLikeNone(ret), true);
		},
		__wbg___wbindgen_string_get_7ed5322991caaec5: function(arg0, arg1) {
			const obj = arg1;
			const ret = typeof obj === "string" ? obj : void 0;
			var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_throw_6b64449b9b9ed33c: function(arg0, arg1) {
			throw new Error(getStringFromWasm0(arg0, arg1));
		},
		__wbg_call_14b169f759b26747: function() {
			return handleError(function(arg0, arg1) {
				return arg0.call(arg1);
			}, arguments);
		},
		__wbg_done_9158f7cc8751ba32: function(arg0) {
			return arg0.done;
		},
		__wbg_entries_e0b73aa8571ddb56: function(arg0) {
			return Object.entries(arg0);
		},
		__wbg_error_2001591ad2463697: function(arg0) {
			console.error(arg0);
		},
		__wbg_get_1affdbdd5573b16a: function() {
			return handleError(function(arg0, arg1) {
				return Reflect.get(arg0, arg1);
			}, arguments);
		},
		__wbg_get_8360291721e2339f: function(arg0, arg1) {
			return arg0[arg1 >>> 0];
		},
		__wbg_get_unchecked_17f53dad852b9588: function(arg0, arg1) {
			return arg0[arg1 >>> 0];
		},
		__wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
			return arg0[arg1];
		},
		__wbg_instanceof_ArrayBuffer_7c8433c6ed14ffe3: function(arg0) {
			let result;
			try {
				result = arg0 instanceof ArrayBuffer;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_instanceof_Map_1b76fd4635be43eb: function(arg0) {
			let result;
			try {
				result = arg0 instanceof Map;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_instanceof_Uint8Array_152ba1f289edcf3f: function(arg0) {
			let result;
			try {
				result = arg0 instanceof Uint8Array;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_isArray_c3109d14ffc06469: function(arg0) {
			return Array.isArray(arg0);
		},
		__wbg_isSafeInteger_4fc213d1989d6d2a: function(arg0) {
			return Number.isSafeInteger(arg0);
		},
		__wbg_iterator_013bc09ec998c2a7: function() {
			return Symbol.iterator;
		},
		__wbg_length_3d4ecd04bd8d22f1: function(arg0) {
			return arg0.length;
		},
		__wbg_length_9f1775224cf1d815: function(arg0) {
			return arg0.length;
		},
		__wbg_new_0c7403db6e782f19: function(arg0) {
			return new Uint8Array(arg0);
		},
		__wbg_new_34d45cc8e36aaead: function() {
			return /* @__PURE__ */ new Map();
		},
		__wbg_new_682678e2f47e32bc: function() {
			return new Array();
		},
		__wbg_new_aa8d0fa9762c29bd: function() {
			return /* @__PURE__ */ new Object();
		},
		__wbg_next_0340c4ae324393c3: function() {
			return handleError(function(arg0) {
				return arg0.next();
			}, arguments);
		},
		__wbg_next_7646edaa39458ef7: function(arg0) {
			return arg0.next;
		},
		__wbg_prototypesetcall_a6b02eb00b0f4ce2: function(arg0, arg1, arg2) {
			Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
		},
		__wbg_set_3bf1de9fab0cd644: function(arg0, arg1, arg2) {
			arg0[arg1 >>> 0] = arg2;
		},
		__wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
			arg0[arg1] = arg2;
		},
		__wbg_set_fde2cec06c23692b: function(arg0, arg1, arg2) {
			return arg0.set(arg1, arg2);
		},
		__wbg_value_ee3a06f4579184fa: function(arg0) {
			return arg0.value;
		},
		__wbindgen_cast_0000000000000001: function(arg0) {
			return arg0;
		},
		__wbindgen_cast_0000000000000002: function(arg0) {
			return arg0;
		},
		__wbindgen_cast_0000000000000003: function(arg0, arg1) {
			return getStringFromWasm0(arg0, arg1);
		},
		__wbindgen_cast_0000000000000004: function(arg0) {
			return BigInt.asUintN(64, arg0);
		},
		__wbindgen_init_externref_table: function() {
			const table = wasm.__wbindgen_externrefs;
			const offset = table.grow(4);
			table.set(0, void 0);
			table.set(offset + 0, void 0);
			table.set(offset + 1, null);
			table.set(offset + 2, true);
			table.set(offset + 3, false);
		}
	};
	return {
		__proto__: null,
		"./shinkore_bg.js": import0
	};
}
const CompatEngineFinalization = typeof FinalizationRegistry === "undefined" ? {
	register: () => {},
	unregister: () => {}
} : new FinalizationRegistry((ptr) => wasm.__wbg_compatengine_free(ptr >>> 0, 1));
function addToExternrefTable0(obj) {
	const idx = wasm.__externref_table_alloc();
	wasm.__wbindgen_externrefs.set(idx, obj);
	return idx;
}
function debugString(val) {
	const type = typeof val;
	if (type == "number" || type == "boolean" || val == null) return `${val}`;
	if (type == "string") return `"${val}"`;
	if (type == "symbol") {
		const description = val.description;
		if (description == null) return "Symbol";
		else return `Symbol(${description})`;
	}
	if (type == "function") {
		const name = val.name;
		if (typeof name == "string" && name.length > 0) return `Function(${name})`;
		else return "Function";
	}
	if (Array.isArray(val)) {
		const length = val.length;
		let debug = "[";
		if (length > 0) debug += debugString(val[0]);
		for (let i = 1; i < length; i++) debug += ", " + debugString(val[i]);
		debug += "]";
		return debug;
	}
	const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
	let className;
	if (builtInMatches && builtInMatches.length > 1) className = builtInMatches[1];
	else return toString.call(val);
	if (className == "Object") try {
		return "Object(" + JSON.stringify(val) + ")";
	} catch (_) {
		return "Object";
	}
	if (val instanceof Error) return `${val.name}: ${val.message}\n${val.stack}`;
	return className;
}
function getArrayU8FromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
	if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
	return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return decodeText(ptr, len);
}
let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
	if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
	return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
	try {
		return f.apply(this, args);
	} catch (e) {
		const idx = addToExternrefTable0(e);
		wasm.__wbindgen_exn_store(idx);
	}
}
function isLikeNone(x) {
	return x === void 0 || x === null;
}
function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === void 0) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length, 1) >>> 0;
		getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}
	let len = arg.length;
	let ptr = malloc(len, 1) >>> 0;
	const mem = getUint8ArrayMemory0();
	let offset = 0;
	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 127) break;
		mem[ptr + offset] = code;
	}
	if (offset !== len) {
		if (offset !== 0) arg = arg.slice(offset);
		ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
		const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
		const ret = cachedTextEncoder.encodeInto(arg, view);
		offset += ret.written;
		ptr = realloc(ptr, len, offset, 1) >>> 0;
	}
	WASM_VECTOR_LEN = offset;
	return ptr;
}
function takeFromExternrefTable0(idx) {
	const value = wasm.__wbindgen_externrefs.get(idx);
	wasm.__externref_table_dealloc(idx);
	return value;
}
let cachedTextDecoder = new TextDecoder("utf-8", {
	ignoreBOM: true,
	fatal: true
});
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
	numBytesDecoded += len;
	if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
		cachedTextDecoder = new TextDecoder("utf-8", {
			ignoreBOM: true,
			fatal: true
		});
		cachedTextDecoder.decode();
		numBytesDecoded = len;
	}
	return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
const cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) cachedTextEncoder.encodeInto = function(arg, view) {
	const buf = cachedTextEncoder.encode(arg);
	view.set(buf);
	return {
		read: arg.length,
		written: buf.length
	};
};
let WASM_VECTOR_LEN = 0, wasm;
function __wbg_finalize_init(instance, module) {
	wasm = instance.exports;
	cachedDataViewMemory0 = null;
	cachedUint8ArrayMemory0 = null;
	wasm.__wbindgen_start();
	return wasm;
}
async function __wbg_load(module, imports) {
	if (typeof Response === "function" && module instanceof Response) {
		if (typeof WebAssembly.instantiateStreaming === "function") try {
			return await WebAssembly.instantiateStreaming(module, imports);
		} catch (e) {
			if (module.ok && expectedResponseType(module.type) && module.headers.get("Content-Type") !== "application/wasm") console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
			else throw e;
		}
		const bytes = await module.arrayBuffer();
		return await WebAssembly.instantiate(bytes, imports);
	} else {
		const instance = await WebAssembly.instantiate(module, imports);
		if (instance instanceof WebAssembly.Instance) return {
			instance,
			module
		};
		else return instance;
	}
	function expectedResponseType(type) {
		switch (type) {
			case "basic":
			case "cors":
			case "default": return true;
		}
		return false;
	}
}
async function __wbg_init(module_or_path) {
	if (wasm !== void 0) return wasm;
	if (module_or_path !== void 0) if (Object.getPrototypeOf(module_or_path) === Object.prototype) ({module_or_path} = module_or_path);
	else console.warn("using deprecated parameters for the initialization function; pass a single object instead");
	if (module_or_path === void 0) module_or_path = new URL("shinkore_bg.wasm", import.meta.url);
	const imports = __wbg_get_imports();
	if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) module_or_path = fetch(module_or_path);
	const { instance, module } = await __wbg_load(await module_or_path, imports);
	return __wbg_finalize_init(instance, module);
}
//#endregion
export { CompatEngine, __wbg_init };
