/**
    * Shinkom - pkg
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region pkg/shinkore.js
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
		return wasm.compatengine_check_element(this.__wbg_ptr, ptr0, len0);
	}
	/**
	* Used for checking the compatibility of multiple elements and their attributes
	*
	* `depth_level` is used to control how far down in a nested HTML structure to go before
	* returning element tags.
	*
	* See [`helpers::pre_process_html`] to learn more about how `depth_level` works.
	* @param {string} html
	* @param {number} depth_level
	* @returns {any}
	*/
	check_elements(html, depth_level) {
		const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		return wasm.compatengine_check_elements(this.__wbg_ptr, ptr0, len0, depth_level);
	}
	/**
	* @param {string} html
	* @returns {any}
	*/
	full_inspect(html) {
		const ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		const len0 = WASM_VECTOR_LEN;
		return wasm.compatengine_full_inspect(this.__wbg_ptr, ptr0, len0);
	}
	/**
	* @param {any} bcd_html_data
	* @param {any} bcd_svg_data
	*/
	constructor(bcd_html_data, bcd_svg_data) {
		this.__wbg_ptr = wasm.compatengine_new(bcd_html_data, bcd_svg_data) >>> 0;
		CompatEngineFinalization.register(this, this.__wbg_ptr, this);
		return this;
	}
};
if (Symbol.dispose) CompatEngine.prototype[Symbol.dispose] = CompatEngine.prototype.free;
function __wbg_get_imports() {
	const import0 = {
		__proto__: null,
		__wbg_Error_83742b46f01ce22d: function(arg0, arg1) {
			return Error(getStringFromWasm0(arg0, arg1));
		},
		__wbg_String_8564e559799eccda: function(arg0, arg1) {
			const ptr1 = passStringToWasm0(String(arg1), wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			const len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_bigint_get_as_i64_447a76b5c6ef7bda: function(arg0, arg1) {
			const v = arg1;
			const ret = typeof v === "bigint" ? v : void 0;
			getDataViewMemory0().setBigInt64(arg0 + 8, isLikeNone(ret) ? BigInt(0) : ret, true);
			getDataViewMemory0().setInt32(arg0 + 0, !isLikeNone(ret), true);
		},
		__wbg___wbindgen_boolean_get_c0f3f60bac5a78d1: function(arg0) {
			const v = arg0;
			const ret = typeof v === "boolean" ? v : void 0;
			return isLikeNone(ret) ? 16777215 : ret ? 1 : 0;
		},
		__wbg___wbindgen_debug_string_5398f5bb970e0daa: function(arg0, arg1) {
			const ptr1 = passStringToWasm0(debugString(arg1), wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			const len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_in_41dbb8413020e076: function(arg0, arg1) {
			return arg0 in arg1;
		},
		__wbg___wbindgen_is_bigint_e2141d4f045b7eda: function(arg0) {
			return typeof arg0 === "bigint";
		},
		__wbg___wbindgen_is_function_3c846841762788c1: function(arg0) {
			return typeof arg0 === "function";
		},
		__wbg___wbindgen_is_object_781bc9f159099513: function(arg0) {
			const val = arg0;
			return typeof val === "object" && val !== null;
		},
		__wbg___wbindgen_is_undefined_52709e72fb9f179c: function(arg0) {
			return arg0 === void 0;
		},
		__wbg___wbindgen_jsval_eq_ee31bfad3e536463: function(arg0, arg1) {
			return arg0 === arg1;
		},
		__wbg___wbindgen_jsval_loose_eq_5bcc3bed3c69e72b: function(arg0, arg1) {
			return arg0 == arg1;
		},
		__wbg___wbindgen_number_get_34bb9d9dcfa21373: function(arg0, arg1) {
			const obj = arg1;
			const ret = typeof obj === "number" ? obj : void 0;
			getDataViewMemory0().setFloat64(arg0 + 8, isLikeNone(ret) ? 0 : ret, true);
			getDataViewMemory0().setInt32(arg0 + 0, !isLikeNone(ret), true);
		},
		__wbg___wbindgen_string_get_395e606bd0ee4427: function(arg0, arg1) {
			const obj = arg1;
			const ret = typeof obj === "string" ? obj : void 0;
			var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
			var len1 = WASM_VECTOR_LEN;
			getDataViewMemory0().setInt32(arg0 + 4, len1, true);
			getDataViewMemory0().setInt32(arg0 + 0, ptr1, true);
		},
		__wbg___wbindgen_throw_6ddd609b62940d55: function(arg0, arg1) {
			throw new Error(getStringFromWasm0(arg0, arg1));
		},
		__wbg_call_e133b57c9155d22c: function() {
			return handleError(function(arg0, arg1) {
				return arg0.call(arg1);
			}, arguments);
		},
		__wbg_done_08ce71ee07e3bd17: function(arg0) {
			return arg0.done;
		},
		__wbg_entries_e8a20ff8c9757101: function(arg0) {
			return Object.entries(arg0);
		},
		__wbg_error_8d9a8e04cd1d3588: function(arg0) {
			console.error(arg0);
		},
		__wbg_get_326e41e095fb2575: function() {
			return handleError(function(arg0, arg1) {
				return Reflect.get(arg0, arg1);
			}, arguments);
		},
		__wbg_get_a8ee5c45dabc1b3b: function(arg0, arg1) {
			return arg0[arg1 >>> 0];
		},
		__wbg_get_unchecked_329cfe50afab7352: function(arg0, arg1) {
			return arg0[arg1 >>> 0];
		},
		__wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
			return arg0[arg1];
		},
		__wbg_instanceof_ArrayBuffer_101e2bf31071a9f6: function(arg0) {
			let result;
			try {
				result = arg0 instanceof ArrayBuffer;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_instanceof_Map_f194b366846aca0c: function(arg0) {
			let result;
			try {
				result = arg0 instanceof Map;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_instanceof_Uint8Array_740438561a5b956d: function(arg0) {
			let result;
			try {
				result = arg0 instanceof Uint8Array;
			} catch (_) {
				result = false;
			}
			return result;
		},
		__wbg_isArray_33b91feb269ff46e: function(arg0) {
			return Array.isArray(arg0);
		},
		__wbg_isSafeInteger_ecd6a7f9c3e053cd: function(arg0) {
			return Number.isSafeInteger(arg0);
		},
		__wbg_iterator_d8f549ec8fb061b1: function() {
			return Symbol.iterator;
		},
		__wbg_length_b3416cf66a5452c8: function(arg0) {
			return arg0.length;
		},
		__wbg_length_ea16607d7b61445b: function(arg0) {
			return arg0.length;
		},
		__wbg_new_5f486cdf45a04d78: function(arg0) {
			return new Uint8Array(arg0);
		},
		__wbg_new_a70fbab9066b301f: function() {
			return new Array();
		},
		__wbg_new_ab79df5bd7c26067: function() {
			return /* @__PURE__ */ new Object();
		},
		__wbg_next_11b99ee6237339e3: function() {
			return handleError(function(arg0) {
				return arg0.next();
			}, arguments);
		},
		__wbg_next_e01a967809d1aa68: function(arg0) {
			return arg0.next;
		},
		__wbg_prototypesetcall_d62e5099504357e6: function(arg0, arg1, arg2) {
			Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
		},
		__wbg_set_282384002438957f: function(arg0, arg1, arg2) {
			arg0[arg1 >>> 0] = arg2;
		},
		__wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
			arg0[arg1] = arg2;
		},
		__wbg_value_21fc78aab0322612: function(arg0) {
			return arg0.value;
		},
		__wbindgen_cast_0000000000000001: function(arg0) {
			return arg0;
		},
		__wbindgen_cast_0000000000000002: function(arg0, arg1) {
			return getStringFromWasm0(arg0, arg1);
		},
		__wbindgen_cast_0000000000000003: function(arg0) {
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
