var Lr = Object.defineProperty;
var qr = (t, s, l) => s in t ? Lr(t, s, { enumerable: !0, configurable: !0, writable: !0, value: l }) : t[s] = l;
var H = (t, s, l) => (qr(t, typeof s != "symbol" ? s + "" : s, l), l);
import { createPinia as Dr, defineStore as It } from "pinia";
async function Mr(t, s, l) {
  let e = t, h = [];
  for (; ; ) {
    const A = await l(s, e), { records: O } = A.data;
    if (h = h.concat(O), e += s, A.data._pagination.count <= e + s)
      break;
  }
  return h;
}
Dr();
const Ir = It("user", {
  state: () => ({
    users: [],
    current: {
      balance: null,
      user: null,
      financialMutations: {
        _pagination: {},
        records: []
      }
    }
  }),
  getters: {
    getUserById: (t) => (s) => t.users.find((l) => l.id === s),
    getActiveUsers() {
      return this.users.filter((t) => t.active);
    },
    getDeletedUsers() {
      return this.users.filter((t) => t.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(t) {
      this.users = await Mr(0, 500, (s, l) => t.user.getAllUsers(s, l));
    },
    async fetchCurrentUserBalance(t, s) {
      this.current.balance = (await s.balance.getBalanceId(t)).data;
    },
    async fetchUsersFinancialMutations(t, s, l, e) {
      this.current.financialMutations = (await s.user.getUsersFinancialMutations(t, l, e)).data;
    },
    setCurrentUser(t) {
      this.current.user = t;
    },
    addUser(t) {
      this.users.push(t);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(t) {
      const s = this.users.findIndex((l) => l.id === t);
      s !== -1 && this.users.splice(s, 1);
    }
  }
});
var Z = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, I = {}, Ht = {};
function Nt(t, s) {
  return function() {
    return t.apply(s, arguments);
  };
}
const { toString: Hr } = Object.prototype, { getPrototypeOf: it } = Object, Fe = ((t) => (s) => {
  const l = Hr.call(s);
  return t[l] || (t[l] = l.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), W = (t) => (t = t.toLowerCase(), (s) => Fe(s) === t), Be = (t) => (s) => typeof s === t, { isArray: ie } = Array, he = Be("undefined");
function Nr(t) {
  return t !== null && !he(t) && t.constructor !== null && !he(t.constructor) && K(t.constructor.isBuffer) && t.constructor.isBuffer(t);
}
const xt = W("ArrayBuffer");
function xr(t) {
  let s;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? s = ArrayBuffer.isView(t) : s = t && t.buffer && xt(t.buffer), s;
}
const $r = Be("string"), K = Be("function"), $t = Be("number"), ve = (t) => t !== null && typeof t == "object", kr = (t) => t === !0 || t === !1, be = (t) => {
  if (Fe(t) !== "object")
    return !1;
  const s = it(t);
  return (s === null || s === Object.prototype || Object.getPrototypeOf(s) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
}, zr = W("Date"), Kr = W("File"), Gr = W("Blob"), Qr = W("FileList"), Yr = (t) => ve(t) && K(t.pipe), Jr = (t) => {
  let s;
  return t && (typeof FormData == "function" && t instanceof FormData || K(t.append) && ((s = Fe(t)) === "formdata" || // detect form-data instance
  s === "object" && K(t.toString) && t.toString() === "[object FormData]"));
}, Wr = W("URLSearchParams"), Xr = (t) => t.trim ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Ae(t, s, { allOwnKeys: l = !1 } = {}) {
  if (t === null || typeof t > "u")
    return;
  let e, h;
  if (typeof t != "object" && (t = [t]), ie(t))
    for (e = 0, h = t.length; e < h; e++)
      s.call(null, t[e], e, t);
  else {
    const A = l ? Object.getOwnPropertyNames(t) : Object.keys(t), O = A.length;
    let b;
    for (e = 0; e < O; e++)
      b = A[e], s.call(null, t[b], b, t);
  }
}
function kt(t, s) {
  s = s.toLowerCase();
  const l = Object.keys(t);
  let e = l.length, h;
  for (; e-- > 0; )
    if (h = l[e], s === h.toLowerCase())
      return h;
  return null;
}
const zt = (() => typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : Z)(), Kt = (t) => !he(t) && t !== zt;
function Je() {
  const { caseless: t } = Kt(this) && this || {}, s = {}, l = (e, h) => {
    const A = t && kt(s, h) || h;
    be(s[A]) && be(e) ? s[A] = Je(s[A], e) : be(e) ? s[A] = Je({}, e) : ie(e) ? s[A] = e.slice() : s[A] = e;
  };
  for (let e = 0, h = arguments.length; e < h; e++)
    arguments[e] && Ae(arguments[e], l);
  return s;
}
const Zr = (t, s, l, { allOwnKeys: e } = {}) => (Ae(s, (h, A) => {
  l && K(h) ? t[A] = Nt(h, l) : t[A] = h;
}, { allOwnKeys: e }), t), ea = (t) => (t.charCodeAt(0) === 65279 && (t = t.slice(1)), t), ta = (t, s, l, e) => {
  t.prototype = Object.create(s.prototype, e), t.prototype.constructor = t, Object.defineProperty(t, "super", {
    value: s.prototype
  }), l && Object.assign(t.prototype, l);
}, sa = (t, s, l, e) => {
  let h, A, O;
  const b = {};
  if (s = s || {}, t == null)
    return s;
  do {
    for (h = Object.getOwnPropertyNames(t), A = h.length; A-- > 0; )
      O = h[A], (!e || e(O, t, s)) && !b[O] && (s[O] = t[O], b[O] = !0);
    t = l !== !1 && it(t);
  } while (t && (!l || l(t, s)) && t !== Object.prototype);
  return s;
}, ra = (t, s, l) => {
  t = String(t), (l === void 0 || l > t.length) && (l = t.length), l -= s.length;
  const e = t.indexOf(s, l);
  return e !== -1 && e === l;
}, aa = (t) => {
  if (!t)
    return null;
  if (ie(t))
    return t;
  let s = t.length;
  if (!$t(s))
    return null;
  const l = new Array(s);
  for (; s-- > 0; )
    l[s] = t[s];
  return l;
}, na = ((t) => (s) => t && s instanceof t)(typeof Uint8Array < "u" && it(Uint8Array)), ia = (t, s) => {
  const e = (t && t[Symbol.iterator]).call(t);
  let h;
  for (; (h = e.next()) && !h.done; ) {
    const A = h.value;
    s.call(t, A[0], A[1]);
  }
}, oa = (t, s) => {
  let l;
  const e = [];
  for (; (l = t.exec(s)) !== null; )
    e.push(l);
  return e;
}, ca = W("HTMLFormElement"), la = (t) => t.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(l, e, h) {
    return e.toUpperCase() + h;
  }
), bt = (({ hasOwnProperty: t }) => (s, l) => t.call(s, l))(Object.prototype), da = W("RegExp"), Gt = (t, s) => {
  const l = Object.getOwnPropertyDescriptors(t), e = {};
  Ae(l, (h, A) => {
    let O;
    (O = s(h, A, t)) !== !1 && (e[A] = O || h);
  }), Object.defineProperties(t, e);
}, ua = (t) => {
  Gt(t, (s, l) => {
    if (K(t) && ["arguments", "caller", "callee"].indexOf(l) !== -1)
      return !1;
    const e = t[l];
    if (K(e)) {
      if (s.enumerable = !1, "writable" in s) {
        s.writable = !1;
        return;
      }
      s.set || (s.set = () => {
        throw Error("Can not rewrite read-only method '" + l + "'");
      });
    }
  });
}, ha = (t, s) => {
  const l = {}, e = (h) => {
    h.forEach((A) => {
      l[A] = !0;
    });
  };
  return ie(t) ? e(t) : e(String(t).split(s)), l;
}, pa = () => {
}, Aa = (t, s) => (t = +t, Number.isFinite(t) ? t : s), xe = "abcdefghijklmnopqrstuvwxyz", mt = "0123456789", Qt = {
  DIGIT: mt,
  ALPHA: xe,
  ALPHA_DIGIT: xe + xe.toUpperCase() + mt
}, fa = (t = 16, s = Qt.ALPHA_DIGIT) => {
  let l = "";
  const { length: e } = s;
  for (; t--; )
    l += s[Math.random() * e | 0];
  return l;
};
function Oa(t) {
  return !!(t && K(t.append) && t[Symbol.toStringTag] === "FormData" && t[Symbol.iterator]);
}
const Pa = (t) => {
  const s = new Array(10), l = (e, h) => {
    if (ve(e)) {
      if (s.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        s[h] = e;
        const A = ie(e) ? [] : {};
        return Ae(e, (O, b) => {
          const R = l(O, h + 1);
          !he(R) && (A[b] = R);
        }), s[h] = void 0, A;
      }
    }
    return e;
  };
  return l(t, 0);
}, ba = W("AsyncFunction"), ma = (t) => t && (ve(t) || K(t)) && K(t.then) && K(t.catch);
var S = {
  isArray: ie,
  isArrayBuffer: xt,
  isBuffer: Nr,
  isFormData: Jr,
  isArrayBufferView: xr,
  isString: $r,
  isNumber: $t,
  isBoolean: kr,
  isObject: ve,
  isPlainObject: be,
  isUndefined: he,
  isDate: zr,
  isFile: Kr,
  isBlob: Gr,
  isRegExp: da,
  isFunction: K,
  isStream: Yr,
  isURLSearchParams: Wr,
  isTypedArray: na,
  isFileList: Qr,
  forEach: Ae,
  merge: Je,
  extend: Zr,
  trim: Xr,
  stripBOM: ea,
  inherits: ta,
  toFlatObject: sa,
  kindOf: Fe,
  kindOfTest: W,
  endsWith: ra,
  toArray: aa,
  forEachEntry: ia,
  matchAll: oa,
  isHTMLForm: ca,
  hasOwnProperty: bt,
  hasOwnProp: bt,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Gt,
  freezeMethods: ua,
  toObjectSet: ha,
  toCamelCase: la,
  noop: pa,
  toFiniteNumber: Aa,
  findKey: kt,
  global: zt,
  isContextDefined: Kt,
  ALPHABET: Qt,
  generateString: fa,
  isSpecCompliantForm: Oa,
  toJSONObject: Pa,
  isAsyncFn: ba,
  isThenable: ma
};
function _(t, s, l, e, h) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = t, this.name = "AxiosError", s && (this.code = s), l && (this.config = l), e && (this.request = e), h && (this.response = h);
}
S.inherits(_, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: S.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const Yt = _.prototype, Jt = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((t) => {
  Jt[t] = { value: t };
});
Object.defineProperties(_, Jt);
Object.defineProperty(Yt, "isAxiosError", { value: !0 });
_.from = (t, s, l, e, h, A) => {
  const O = Object.create(Yt);
  return S.toFlatObject(t, O, function(R) {
    return R !== Error.prototype;
  }, (b) => b !== "isAxiosError"), _.call(O, t.message, s, l, e, h), O.cause = t, O.name = t.name, A && Object.assign(O, A), O;
};
var ga = null;
function We(t) {
  return S.isPlainObject(t) || S.isArray(t);
}
function Wt(t) {
  return S.endsWith(t, "[]") ? t.slice(0, -2) : t;
}
function gt(t, s, l) {
  return t ? t.concat(s).map(function(h, A) {
    return h = Wt(h), !l && A ? "[" + h + "]" : h;
  }).join(l ? "." : "") : s;
}
function ya(t) {
  return S.isArray(t) && !t.some(We);
}
const Sa = S.toFlatObject(S, {}, null, function(s) {
  return /^is[A-Z]/.test(s);
});
function we(t, s, l) {
  if (!S.isObject(t))
    throw new TypeError("target must be an object");
  s = s || new FormData(), l = S.toFlatObject(l, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(V, M) {
    return !S.isUndefined(M[V]);
  });
  const e = l.metaTokens, h = l.visitor || g, A = l.dots, O = l.indexes, R = (l.Blob || typeof Blob < "u" && Blob) && S.isSpecCompliantForm(s);
  if (!S.isFunction(h))
    throw new TypeError("visitor must be a function");
  function m(U) {
    if (U === null)
      return "";
    if (S.isDate(U))
      return U.toISOString();
    if (!R && S.isBlob(U))
      throw new _("Blob is not supported. Use a Buffer instead.");
    return S.isArrayBuffer(U) || S.isTypedArray(U) ? R && typeof Blob == "function" ? new Blob([U]) : Buffer.from(U) : U;
  }
  function g(U, V, M) {
    let L = U;
    if (U && !M && typeof U == "object") {
      if (S.endsWith(V, "{}"))
        V = e ? V : V.slice(0, -2), U = JSON.stringify(U);
      else if (S.isArray(U) && ya(U) || (S.isFileList(U) || S.endsWith(V, "[]")) && (L = S.toArray(U)))
        return V = Wt(V), L.forEach(function(Q, ce) {
          !(S.isUndefined(Q) || Q === null) && s.append(
            // eslint-disable-next-line no-nested-ternary
            O === !0 ? gt([V], ce, A) : O === null ? V : V + "[]",
            m(Q)
          );
        }), !1;
    }
    return We(U) ? !0 : (s.append(gt(M, V, A), m(U)), !1);
  }
  const T = [], w = Object.assign(Sa, {
    defaultVisitor: g,
    convertValue: m,
    isVisitable: We
  });
  function E(U, V) {
    if (!S.isUndefined(U)) {
      if (T.indexOf(U) !== -1)
        throw Error("Circular reference detected in " + V.join("."));
      T.push(U), S.forEach(U, function(L, k) {
        (!(S.isUndefined(L) || L === null) && h.call(
          s,
          L,
          S.isString(k) ? k.trim() : k,
          V,
          w
        )) === !0 && E(L, V ? V.concat(k) : [k]);
      }), T.pop();
    }
  }
  if (!S.isObject(t))
    throw new TypeError("data must be an object");
  return E(t), s;
}
function yt(t) {
  const s = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(t).replace(/[!'()~]|%20|%00/g, function(e) {
    return s[e];
  });
}
function ot(t, s) {
  this._pairs = [], t && we(t, this, s);
}
const Xt = ot.prototype;
Xt.append = function(s, l) {
  this._pairs.push([s, l]);
};
Xt.toString = function(s) {
  const l = s ? function(e) {
    return s.call(this, e, yt);
  } : yt;
  return this._pairs.map(function(h) {
    return l(h[0]) + "=" + l(h[1]);
  }, "").join("&");
};
function Ua(t) {
  return encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function Zt(t, s, l) {
  if (!s)
    return t;
  const e = l && l.encode || Ua, h = l && l.serialize;
  let A;
  if (h ? A = h(s, l) : A = S.isURLSearchParams(s) ? s.toString() : new ot(s, l).toString(e), A) {
    const O = t.indexOf("#");
    O !== -1 && (t = t.slice(0, O)), t += (t.indexOf("?") === -1 ? "?" : "&") + A;
  }
  return t;
}
let ja = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(s, l, e) {
    return this.handlers.push({
      fulfilled: s,
      rejected: l,
      synchronous: e ? e.synchronous : !1,
      runWhen: e ? e.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(s) {
    this.handlers[s] && (this.handlers[s] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(s) {
    S.forEach(this.handlers, function(e) {
      e !== null && s(e);
    });
  }
};
var St = ja, es = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, Ra = typeof URLSearchParams < "u" ? URLSearchParams : ot, Ta = typeof FormData < "u" ? FormData : null, Va = typeof Blob < "u" ? Blob : null;
const Ea = (() => {
  let t;
  return typeof navigator < "u" && ((t = navigator.product) === "ReactNative" || t === "NativeScript" || t === "NS") ? !1 : typeof window < "u" && typeof document < "u";
})(), Fa = (() => typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function")();
var Y = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ra,
    FormData: Ta,
    Blob: Va
  },
  isStandardBrowserEnv: Ea,
  isStandardBrowserWebWorkerEnv: Fa,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function Ba(t, s) {
  return we(t, new Y.classes.URLSearchParams(), Object.assign({
    visitor: function(l, e, h, A) {
      return Y.isNode && S.isBuffer(l) ? (this.append(e, l.toString("base64")), !1) : A.defaultVisitor.apply(this, arguments);
    }
  }, s));
}
function va(t) {
  return S.matchAll(/\w+|\[(\w*)]/g, t).map((s) => s[0] === "[]" ? "" : s[1] || s[0]);
}
function wa(t) {
  const s = {}, l = Object.keys(t);
  let e;
  const h = l.length;
  let A;
  for (e = 0; e < h; e++)
    A = l[e], s[A] = t[A];
  return s;
}
function ts(t) {
  function s(l, e, h, A) {
    let O = l[A++];
    const b = Number.isFinite(+O), R = A >= l.length;
    return O = !O && S.isArray(h) ? h.length : O, R ? (S.hasOwnProp(h, O) ? h[O] = [h[O], e] : h[O] = e, !b) : ((!h[O] || !S.isObject(h[O])) && (h[O] = []), s(l, e, h[O], A) && S.isArray(h[O]) && (h[O] = wa(h[O])), !b);
  }
  if (S.isFormData(t) && S.isFunction(t.entries)) {
    const l = {};
    return S.forEachEntry(t, (e, h) => {
      s(va(e), h, l, 0);
    }), l;
  }
  return null;
}
function _a(t, s, l) {
  if (S.isString(t))
    try {
      return (s || JSON.parse)(t), S.trim(t);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (l || JSON.stringify)(t);
}
const ct = {
  transitional: es,
  adapter: Y.isNode ? "http" : "xhr",
  transformRequest: [function(s, l) {
    const e = l.getContentType() || "", h = e.indexOf("application/json") > -1, A = S.isObject(s);
    if (A && S.isHTMLForm(s) && (s = new FormData(s)), S.isFormData(s))
      return h && h ? JSON.stringify(ts(s)) : s;
    if (S.isArrayBuffer(s) || S.isBuffer(s) || S.isStream(s) || S.isFile(s) || S.isBlob(s))
      return s;
    if (S.isArrayBufferView(s))
      return s.buffer;
    if (S.isURLSearchParams(s))
      return l.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), s.toString();
    let b;
    if (A) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return Ba(s, this.formSerializer).toString();
      if ((b = S.isFileList(s)) || e.indexOf("multipart/form-data") > -1) {
        const R = this.env && this.env.FormData;
        return we(
          b ? { "files[]": s } : s,
          R && new R(),
          this.formSerializer
        );
      }
    }
    return A || h ? (l.setContentType("application/json", !1), _a(s)) : s;
  }],
  transformResponse: [function(s) {
    const l = this.transitional || ct.transitional, e = l && l.forcedJSONParsing, h = this.responseType === "json";
    if (s && S.isString(s) && (e && !this.responseType || h)) {
      const O = !(l && l.silentJSONParsing) && h;
      try {
        return JSON.parse(s);
      } catch (b) {
        if (O)
          throw b.name === "SyntaxError" ? _.from(b, _.ERR_BAD_RESPONSE, this, null, this.response) : b;
      }
    }
    return s;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: Y.classes.FormData,
    Blob: Y.classes.Blob
  },
  validateStatus: function(s) {
    return s >= 200 && s < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
S.forEach(["delete", "get", "head", "post", "put", "patch"], (t) => {
  ct.headers[t] = {};
});
var lt = ct;
const Ca = S.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var La = (t) => {
  const s = {};
  let l, e, h;
  return t && t.split(`
`).forEach(function(O) {
    h = O.indexOf(":"), l = O.substring(0, h).trim().toLowerCase(), e = O.substring(h + 1).trim(), !(!l || s[l] && Ca[l]) && (l === "set-cookie" ? s[l] ? s[l].push(e) : s[l] = [e] : s[l] = s[l] ? s[l] + ", " + e : e);
  }), s;
};
const Ut = Symbol("internals");
function de(t) {
  return t && String(t).trim().toLowerCase();
}
function me(t) {
  return t === !1 || t == null ? t : S.isArray(t) ? t.map(me) : String(t);
}
function qa(t) {
  const s = /* @__PURE__ */ Object.create(null), l = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = l.exec(t); )
    s[e[1]] = e[2];
  return s;
}
const Da = (t) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(t.trim());
function $e(t, s, l, e, h) {
  if (S.isFunction(e))
    return e.call(this, s, l);
  if (h && (s = l), !!S.isString(s)) {
    if (S.isString(e))
      return s.indexOf(e) !== -1;
    if (S.isRegExp(e))
      return e.test(s);
  }
}
function Ma(t) {
  return t.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (s, l, e) => l.toUpperCase() + e);
}
function Ia(t, s) {
  const l = S.toCamelCase(" " + s);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(t, e + l, {
      value: function(h, A, O) {
        return this[e].call(this, s, h, A, O);
      },
      configurable: !0
    });
  });
}
let _e = class {
  constructor(s) {
    s && this.set(s);
  }
  set(s, l, e) {
    const h = this;
    function A(b, R, m) {
      const g = de(R);
      if (!g)
        throw new Error("header name must be a non-empty string");
      const T = S.findKey(h, g);
      (!T || h[T] === void 0 || m === !0 || m === void 0 && h[T] !== !1) && (h[T || R] = me(b));
    }
    const O = (b, R) => S.forEach(b, (m, g) => A(m, g, R));
    return S.isPlainObject(s) || s instanceof this.constructor ? O(s, l) : S.isString(s) && (s = s.trim()) && !Da(s) ? O(La(s), l) : s != null && A(l, s, e), this;
  }
  get(s, l) {
    if (s = de(s), s) {
      const e = S.findKey(this, s);
      if (e) {
        const h = this[e];
        if (!l)
          return h;
        if (l === !0)
          return qa(h);
        if (S.isFunction(l))
          return l.call(this, h, e);
        if (S.isRegExp(l))
          return l.exec(h);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(s, l) {
    if (s = de(s), s) {
      const e = S.findKey(this, s);
      return !!(e && this[e] !== void 0 && (!l || $e(this, this[e], e, l)));
    }
    return !1;
  }
  delete(s, l) {
    const e = this;
    let h = !1;
    function A(O) {
      if (O = de(O), O) {
        const b = S.findKey(e, O);
        b && (!l || $e(e, e[b], b, l)) && (delete e[b], h = !0);
      }
    }
    return S.isArray(s) ? s.forEach(A) : A(s), h;
  }
  clear(s) {
    const l = Object.keys(this);
    let e = l.length, h = !1;
    for (; e--; ) {
      const A = l[e];
      (!s || $e(this, this[A], A, s, !0)) && (delete this[A], h = !0);
    }
    return h;
  }
  normalize(s) {
    const l = this, e = {};
    return S.forEach(this, (h, A) => {
      const O = S.findKey(e, A);
      if (O) {
        l[O] = me(h), delete l[A];
        return;
      }
      const b = s ? Ma(A) : String(A).trim();
      b !== A && delete l[A], l[b] = me(h), e[b] = !0;
    }), this;
  }
  concat(...s) {
    return this.constructor.concat(this, ...s);
  }
  toJSON(s) {
    const l = /* @__PURE__ */ Object.create(null);
    return S.forEach(this, (e, h) => {
      e != null && e !== !1 && (l[h] = s && S.isArray(e) ? e.join(", ") : e);
    }), l;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([s, l]) => s + ": " + l).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(s) {
    return s instanceof this ? s : new this(s);
  }
  static concat(s, ...l) {
    const e = new this(s);
    return l.forEach((h) => e.set(h)), e;
  }
  static accessor(s) {
    const e = (this[Ut] = this[Ut] = {
      accessors: {}
    }).accessors, h = this.prototype;
    function A(O) {
      const b = de(O);
      e[b] || (Ia(h, O), e[b] = !0);
    }
    return S.isArray(s) ? s.forEach(A) : A(s), this;
  }
};
_e.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
S.reduceDescriptors(_e.prototype, ({ value: t }, s) => {
  let l = s[0].toUpperCase() + s.slice(1);
  return {
    get: () => t,
    set(e) {
      this[l] = e;
    }
  };
});
S.freezeMethods(_e);
var ee = _e;
function ke(t, s) {
  const l = this || lt, e = s || l, h = ee.from(e.headers);
  let A = e.data;
  return S.forEach(t, function(b) {
    A = b.call(l, A, h.normalize(), s ? s.status : void 0);
  }), h.normalize(), A;
}
function ss(t) {
  return !!(t && t.__CANCEL__);
}
function fe(t, s, l) {
  _.call(this, t ?? "canceled", _.ERR_CANCELED, s, l), this.name = "CanceledError";
}
S.inherits(fe, _, {
  __CANCEL__: !0
});
function Ha(t, s, l) {
  const e = l.config.validateStatus;
  !l.status || !e || e(l.status) ? t(l) : s(new _(
    "Request failed with status code " + l.status,
    [_.ERR_BAD_REQUEST, _.ERR_BAD_RESPONSE][Math.floor(l.status / 100) - 4],
    l.config,
    l.request,
    l
  ));
}
var Na = Y.isStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  function() {
    return {
      write: function(l, e, h, A, O, b) {
        const R = [];
        R.push(l + "=" + encodeURIComponent(e)), S.isNumber(h) && R.push("expires=" + new Date(h).toGMTString()), S.isString(A) && R.push("path=" + A), S.isString(O) && R.push("domain=" + O), b === !0 && R.push("secure"), document.cookie = R.join("; ");
      },
      read: function(l) {
        const e = document.cookie.match(new RegExp("(^|;\\s*)(" + l + ")=([^;]*)"));
        return e ? decodeURIComponent(e[3]) : null;
      },
      remove: function(l) {
        this.write(l, "", Date.now() - 864e5);
      }
    };
  }()
) : (
  // Non standard browser env (web workers, react-native) lack needed support.
  function() {
    return {
      write: function() {
      },
      read: function() {
        return null;
      },
      remove: function() {
      }
    };
  }()
);
function xa(t) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(t);
}
function $a(t, s) {
  return s ? t.replace(/\/+$/, "") + "/" + s.replace(/^\/+/, "") : t;
}
function rs(t, s) {
  return t && !xa(s) ? $a(t, s) : s;
}
var ka = Y.isStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const s = /(msie|trident)/i.test(navigator.userAgent), l = document.createElement("a");
    let e;
    function h(A) {
      let O = A;
      return s && (l.setAttribute("href", O), O = l.href), l.setAttribute("href", O), {
        href: l.href,
        protocol: l.protocol ? l.protocol.replace(/:$/, "") : "",
        host: l.host,
        search: l.search ? l.search.replace(/^\?/, "") : "",
        hash: l.hash ? l.hash.replace(/^#/, "") : "",
        hostname: l.hostname,
        port: l.port,
        pathname: l.pathname.charAt(0) === "/" ? l.pathname : "/" + l.pathname
      };
    }
    return e = h(window.location.href), function(O) {
      const b = S.isString(O) ? h(O) : O;
      return b.protocol === e.protocol && b.host === e.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  function() {
    return function() {
      return !0;
    };
  }()
);
function za(t) {
  const s = /^([-+\w]{1,25})(:?\/\/|:)/.exec(t);
  return s && s[1] || "";
}
function Ka(t, s) {
  t = t || 10;
  const l = new Array(t), e = new Array(t);
  let h = 0, A = 0, O;
  return s = s !== void 0 ? s : 1e3, function(R) {
    const m = Date.now(), g = e[A];
    O || (O = m), l[h] = R, e[h] = m;
    let T = A, w = 0;
    for (; T !== h; )
      w += l[T++], T = T % t;
    if (h = (h + 1) % t, h === A && (A = (A + 1) % t), m - O < s)
      return;
    const E = g && m - g;
    return E ? Math.round(w * 1e3 / E) : void 0;
  };
}
function jt(t, s) {
  let l = 0;
  const e = Ka(50, 250);
  return (h) => {
    const A = h.loaded, O = h.lengthComputable ? h.total : void 0, b = A - l, R = e(b), m = A <= O;
    l = A;
    const g = {
      loaded: A,
      total: O,
      progress: O ? A / O : void 0,
      bytes: b,
      rate: R || void 0,
      estimated: R && O && m ? (O - A) / R : void 0,
      event: h
    };
    g[s ? "download" : "upload"] = !0, t(g);
  };
}
const Ga = typeof XMLHttpRequest < "u";
var Qa = Ga && function(t) {
  return new Promise(function(l, e) {
    let h = t.data;
    const A = ee.from(t.headers).normalize(), O = t.responseType;
    let b;
    function R() {
      t.cancelToken && t.cancelToken.unsubscribe(b), t.signal && t.signal.removeEventListener("abort", b);
    }
    S.isFormData(h) && (Y.isStandardBrowserEnv || Y.isStandardBrowserWebWorkerEnv ? A.setContentType(!1) : A.setContentType("multipart/form-data;", !1));
    let m = new XMLHttpRequest();
    if (t.auth) {
      const E = t.auth.username || "", U = t.auth.password ? unescape(encodeURIComponent(t.auth.password)) : "";
      A.set("Authorization", "Basic " + btoa(E + ":" + U));
    }
    const g = rs(t.baseURL, t.url);
    m.open(t.method.toUpperCase(), Zt(g, t.params, t.paramsSerializer), !0), m.timeout = t.timeout;
    function T() {
      if (!m)
        return;
      const E = ee.from(
        "getAllResponseHeaders" in m && m.getAllResponseHeaders()
      ), V = {
        data: !O || O === "text" || O === "json" ? m.responseText : m.response,
        status: m.status,
        statusText: m.statusText,
        headers: E,
        config: t,
        request: m
      };
      Ha(function(L) {
        l(L), R();
      }, function(L) {
        e(L), R();
      }, V), m = null;
    }
    if ("onloadend" in m ? m.onloadend = T : m.onreadystatechange = function() {
      !m || m.readyState !== 4 || m.status === 0 && !(m.responseURL && m.responseURL.indexOf("file:") === 0) || setTimeout(T);
    }, m.onabort = function() {
      m && (e(new _("Request aborted", _.ECONNABORTED, t, m)), m = null);
    }, m.onerror = function() {
      e(new _("Network Error", _.ERR_NETWORK, t, m)), m = null;
    }, m.ontimeout = function() {
      let U = t.timeout ? "timeout of " + t.timeout + "ms exceeded" : "timeout exceeded";
      const V = t.transitional || es;
      t.timeoutErrorMessage && (U = t.timeoutErrorMessage), e(new _(
        U,
        V.clarifyTimeoutError ? _.ETIMEDOUT : _.ECONNABORTED,
        t,
        m
      )), m = null;
    }, Y.isStandardBrowserEnv) {
      const E = (t.withCredentials || ka(g)) && t.xsrfCookieName && Na.read(t.xsrfCookieName);
      E && A.set(t.xsrfHeaderName, E);
    }
    h === void 0 && A.setContentType(null), "setRequestHeader" in m && S.forEach(A.toJSON(), function(U, V) {
      m.setRequestHeader(V, U);
    }), S.isUndefined(t.withCredentials) || (m.withCredentials = !!t.withCredentials), O && O !== "json" && (m.responseType = t.responseType), typeof t.onDownloadProgress == "function" && m.addEventListener("progress", jt(t.onDownloadProgress, !0)), typeof t.onUploadProgress == "function" && m.upload && m.upload.addEventListener("progress", jt(t.onUploadProgress)), (t.cancelToken || t.signal) && (b = (E) => {
      m && (e(!E || E.type ? new fe(null, t, m) : E), m.abort(), m = null);
    }, t.cancelToken && t.cancelToken.subscribe(b), t.signal && (t.signal.aborted ? b() : t.signal.addEventListener("abort", b)));
    const w = za(g);
    if (w && Y.protocols.indexOf(w) === -1) {
      e(new _("Unsupported protocol " + w + ":", _.ERR_BAD_REQUEST, t));
      return;
    }
    m.send(h || null);
  });
};
const ge = {
  http: ga,
  xhr: Qa
};
S.forEach(ge, (t, s) => {
  if (t) {
    try {
      Object.defineProperty(t, "name", { value: s });
    } catch {
    }
    Object.defineProperty(t, "adapterName", { value: s });
  }
});
var as = {
  getAdapter: (t) => {
    t = S.isArray(t) ? t : [t];
    const { length: s } = t;
    let l, e;
    for (let h = 0; h < s && (l = t[h], !(e = S.isString(l) ? ge[l.toLowerCase()] : l)); h++)
      ;
    if (!e)
      throw e === !1 ? new _(
        `Adapter ${l} is not supported by the environment`,
        "ERR_NOT_SUPPORT"
      ) : new Error(
        S.hasOwnProp(ge, l) ? `Adapter '${l}' is not available in the build` : `Unknown adapter '${l}'`
      );
    if (!S.isFunction(e))
      throw new TypeError("adapter is not a function");
    return e;
  },
  adapters: ge
};
function ze(t) {
  if (t.cancelToken && t.cancelToken.throwIfRequested(), t.signal && t.signal.aborted)
    throw new fe(null, t);
}
function Rt(t) {
  return ze(t), t.headers = ee.from(t.headers), t.data = ke.call(
    t,
    t.transformRequest
  ), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), as.getAdapter(t.adapter || lt.adapter)(t).then(function(e) {
    return ze(t), e.data = ke.call(
      t,
      t.transformResponse,
      e
    ), e.headers = ee.from(e.headers), e;
  }, function(e) {
    return ss(e) || (ze(t), e && e.response && (e.response.data = ke.call(
      t,
      t.transformResponse,
      e.response
    ), e.response.headers = ee.from(e.response.headers))), Promise.reject(e);
  });
}
const Tt = (t) => t instanceof ee ? t.toJSON() : t;
function ae(t, s) {
  s = s || {};
  const l = {};
  function e(m, g, T) {
    return S.isPlainObject(m) && S.isPlainObject(g) ? S.merge.call({ caseless: T }, m, g) : S.isPlainObject(g) ? S.merge({}, g) : S.isArray(g) ? g.slice() : g;
  }
  function h(m, g, T) {
    if (S.isUndefined(g)) {
      if (!S.isUndefined(m))
        return e(void 0, m, T);
    } else
      return e(m, g, T);
  }
  function A(m, g) {
    if (!S.isUndefined(g))
      return e(void 0, g);
  }
  function O(m, g) {
    if (S.isUndefined(g)) {
      if (!S.isUndefined(m))
        return e(void 0, m);
    } else
      return e(void 0, g);
  }
  function b(m, g, T) {
    if (T in s)
      return e(m, g);
    if (T in t)
      return e(void 0, m);
  }
  const R = {
    url: A,
    method: A,
    data: A,
    baseURL: O,
    transformRequest: O,
    transformResponse: O,
    paramsSerializer: O,
    timeout: O,
    timeoutMessage: O,
    withCredentials: O,
    adapter: O,
    responseType: O,
    xsrfCookieName: O,
    xsrfHeaderName: O,
    onUploadProgress: O,
    onDownloadProgress: O,
    decompress: O,
    maxContentLength: O,
    maxBodyLength: O,
    beforeRedirect: O,
    transport: O,
    httpAgent: O,
    httpsAgent: O,
    cancelToken: O,
    socketPath: O,
    responseEncoding: O,
    validateStatus: b,
    headers: (m, g) => h(Tt(m), Tt(g), !0)
  };
  return S.forEach(Object.keys(Object.assign({}, t, s)), function(g) {
    const T = R[g] || h, w = T(t[g], s[g], g);
    S.isUndefined(w) && T !== b || (l[g] = w);
  }), l;
}
const ns = "1.5.0", dt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((t, s) => {
  dt[t] = function(e) {
    return typeof e === t || "a" + (s < 1 ? "n " : " ") + t;
  };
});
const Vt = {};
dt.transitional = function(s, l, e) {
  function h(A, O) {
    return "[Axios v" + ns + "] Transitional option '" + A + "'" + O + (e ? ". " + e : "");
  }
  return (A, O, b) => {
    if (s === !1)
      throw new _(
        h(O, " has been removed" + (l ? " in " + l : "")),
        _.ERR_DEPRECATED
      );
    return l && !Vt[O] && (Vt[O] = !0, console.warn(
      h(
        O,
        " has been deprecated since v" + l + " and will be removed in the near future"
      )
    )), s ? s(A, O, b) : !0;
  };
};
function Ya(t, s, l) {
  if (typeof t != "object")
    throw new _("options must be an object", _.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(t);
  let h = e.length;
  for (; h-- > 0; ) {
    const A = e[h], O = s[A];
    if (O) {
      const b = t[A], R = b === void 0 || O(b, A, t);
      if (R !== !0)
        throw new _("option " + A + " must be " + R, _.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (l !== !0)
      throw new _("Unknown option " + A, _.ERR_BAD_OPTION);
  }
}
var Xe = {
  assertOptions: Ya,
  validators: dt
};
const se = Xe.validators;
let Te = class {
  constructor(s) {
    this.defaults = s, this.interceptors = {
      request: new St(),
      response: new St()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  request(s, l) {
    typeof s == "string" ? (l = l || {}, l.url = s) : l = s || {}, l = ae(this.defaults, l);
    const { transitional: e, paramsSerializer: h, headers: A } = l;
    e !== void 0 && Xe.assertOptions(e, {
      silentJSONParsing: se.transitional(se.boolean),
      forcedJSONParsing: se.transitional(se.boolean),
      clarifyTimeoutError: se.transitional(se.boolean)
    }, !1), h != null && (S.isFunction(h) ? l.paramsSerializer = {
      serialize: h
    } : Xe.assertOptions(h, {
      encode: se.function,
      serialize: se.function
    }, !0)), l.method = (l.method || this.defaults.method || "get").toLowerCase();
    let O = A && S.merge(
      A.common,
      A[l.method]
    );
    A && S.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (U) => {
        delete A[U];
      }
    ), l.headers = ee.concat(O, A);
    const b = [];
    let R = !0;
    this.interceptors.request.forEach(function(V) {
      typeof V.runWhen == "function" && V.runWhen(l) === !1 || (R = R && V.synchronous, b.unshift(V.fulfilled, V.rejected));
    });
    const m = [];
    this.interceptors.response.forEach(function(V) {
      m.push(V.fulfilled, V.rejected);
    });
    let g, T = 0, w;
    if (!R) {
      const U = [Rt.bind(this), void 0];
      for (U.unshift.apply(U, b), U.push.apply(U, m), w = U.length, g = Promise.resolve(l); T < w; )
        g = g.then(U[T++], U[T++]);
      return g;
    }
    w = b.length;
    let E = l;
    for (T = 0; T < w; ) {
      const U = b[T++], V = b[T++];
      try {
        E = U(E);
      } catch (M) {
        V.call(this, M);
        break;
      }
    }
    try {
      g = Rt.call(this, E);
    } catch (U) {
      return Promise.reject(U);
    }
    for (T = 0, w = m.length; T < w; )
      g = g.then(m[T++], m[T++]);
    return g;
  }
  getUri(s) {
    s = ae(this.defaults, s);
    const l = rs(s.baseURL, s.url);
    return Zt(l, s.params, s.paramsSerializer);
  }
};
S.forEach(["delete", "get", "head", "options"], function(s) {
  Te.prototype[s] = function(l, e) {
    return this.request(ae(e || {}, {
      method: s,
      url: l,
      data: (e || {}).data
    }));
  };
});
S.forEach(["post", "put", "patch"], function(s) {
  function l(e) {
    return function(A, O, b) {
      return this.request(ae(b || {}, {
        method: s,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: A,
        data: O
      }));
    };
  }
  Te.prototype[s] = l(), Te.prototype[s + "Form"] = l(!0);
});
var ye = Te;
let Ja = class is {
  constructor(s) {
    if (typeof s != "function")
      throw new TypeError("executor must be a function.");
    let l;
    this.promise = new Promise(function(A) {
      l = A;
    });
    const e = this;
    this.promise.then((h) => {
      if (!e._listeners)
        return;
      let A = e._listeners.length;
      for (; A-- > 0; )
        e._listeners[A](h);
      e._listeners = null;
    }), this.promise.then = (h) => {
      let A;
      const O = new Promise((b) => {
        e.subscribe(b), A = b;
      }).then(h);
      return O.cancel = function() {
        e.unsubscribe(A);
      }, O;
    }, s(function(A, O, b) {
      e.reason || (e.reason = new fe(A, O, b), l(e.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(s) {
    if (this.reason) {
      s(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(s) : this._listeners = [s];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(s) {
    if (!this._listeners)
      return;
    const l = this._listeners.indexOf(s);
    l !== -1 && this._listeners.splice(l, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let s;
    return {
      token: new is(function(h) {
        s = h;
      }),
      cancel: s
    };
  }
};
var Wa = Ja;
function Xa(t) {
  return function(l) {
    return t.apply(null, l);
  };
}
function Za(t) {
  return S.isObject(t) && t.isAxiosError === !0;
}
const Ze = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(Ze).forEach(([t, s]) => {
  Ze[s] = t;
});
var en = Ze;
function os(t) {
  const s = new ye(t), l = Nt(ye.prototype.request, s);
  return S.extend(l, ye.prototype, s, { allOwnKeys: !0 }), S.extend(l, s, null, { allOwnKeys: !0 }), l.create = function(h) {
    return os(ae(t, h));
  }, l;
}
const N = os(lt);
N.Axios = ye;
N.CanceledError = fe;
N.CancelToken = Wa;
N.isCancel = ss;
N.VERSION = ns;
N.toFormData = we;
N.AxiosError = _;
N.Cancel = N.CanceledError;
N.all = function(s) {
  return Promise.all(s);
};
N.spread = Xa;
N.isAxiosError = Za;
N.mergeConfig = ae;
N.AxiosHeaders = ee;
N.formToJSON = (t) => ts(S.isHTMLForm(t) ? new FormData(t) : t);
N.getAdapter = as.getAdapter;
N.HttpStatusCode = en;
N.default = N;
var cs = N, D = {}, ut = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.RequiredError = t.BaseAPI = t.COLLECTION_FORMATS = t.BASE_PATH = void 0;
  const s = cs;
  t.BASE_PATH = "http://localhost".replace(/\/+$/, ""), t.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class l {
    constructor(A, O = t.BASE_PATH, b = s.default) {
      this.basePath = O, this.axios = b, A && (this.configuration = A, this.basePath = A.basePath || this.basePath);
    }
  }
  t.BaseAPI = l;
  class e extends Error {
    constructor(A, O) {
      super(O), this.field = A, this.name = "RequiredError";
    }
  }
  t.RequiredError = e;
})(ut);
var ht = Z && Z.__awaiter || function(t, s, l, e) {
  function h(A) {
    return A instanceof l ? A : new l(function(O) {
      O(A);
    });
  }
  return new (l || (l = Promise))(function(A, O) {
    function b(g) {
      try {
        m(e.next(g));
      } catch (T) {
        O(T);
      }
    }
    function R(g) {
      try {
        m(e.throw(g));
      } catch (T) {
        O(T);
      }
    }
    function m(g) {
      g.done ? A(g.value) : h(g.value).then(b, R);
    }
    m((e = e.apply(t, s || [])).next());
  });
};
Object.defineProperty(D, "__esModule", { value: !0 });
D.createRequestFunction = D.toPathString = D.serializeDataIfNeeded = D.setSearchParams = D.setOAuthToObject = D.setBearerAuthToObject = D.setBasicAuthToObject = D.setApiKeyToObject = D.assertParamExists = D.DUMMY_BASE_URL = void 0;
const tn = ut;
D.DUMMY_BASE_URL = "https://example.com";
const sn = function(t, s, l) {
  if (l == null)
    throw new tn.RequiredError(s, `Required parameter ${s} was null or undefined when calling ${t}.`);
};
D.assertParamExists = sn;
const rn = function(t, s, l) {
  return ht(this, void 0, void 0, function* () {
    if (l && l.apiKey) {
      const e = typeof l.apiKey == "function" ? yield l.apiKey(s) : yield l.apiKey;
      t[s] = e;
    }
  });
};
D.setApiKeyToObject = rn;
const an = function(t, s) {
  s && (s.username || s.password) && (t.auth = { username: s.username, password: s.password });
};
D.setBasicAuthToObject = an;
const nn = function(t, s) {
  return ht(this, void 0, void 0, function* () {
    if (s && s.accessToken) {
      const l = typeof s.accessToken == "function" ? yield s.accessToken() : yield s.accessToken;
      t.Authorization = "Bearer " + l;
    }
  });
};
D.setBearerAuthToObject = nn;
const on = function(t, s, l, e) {
  return ht(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const h = typeof e.accessToken == "function" ? yield e.accessToken(s, l) : yield e.accessToken;
      t.Authorization = "Bearer " + h;
    }
  });
};
D.setOAuthToObject = on;
function et(t, s, l = "") {
  s != null && (typeof s == "object" ? Array.isArray(s) ? s.forEach((e) => et(t, e, l)) : Object.keys(s).forEach((e) => et(t, s[e], `${l}${l !== "" ? "." : ""}${e}`)) : t.has(l) ? t.append(l, s) : t.set(l, s));
}
const cn = function(t, ...s) {
  const l = new URLSearchParams(t.search);
  et(l, s), t.search = l.toString();
};
D.setSearchParams = cn;
const ln = function(t, s, l) {
  const e = typeof t != "string";
  return (e && l && l.isJsonMime ? l.isJsonMime(s.headers["Content-Type"]) : e) ? JSON.stringify(t !== void 0 ? t : {}) : t || "";
};
D.serializeDataIfNeeded = ln;
const dn = function(t) {
  return t.pathname + t.search + t.hash;
};
D.toPathString = dn;
const un = function(t, s, l, e) {
  return (h = s, A = l) => {
    const O = Object.assign(Object.assign({}, t.options), { url: ((e == null ? void 0 : e.basePath) || A) + t.url });
    return h.request(O);
  };
};
D.createRequestFunction = un;
(function(t) {
  var s = Z && Z.__awaiter || function(d, o, r, i) {
    function n(a) {
      return a instanceof r ? a : new r(function(c) {
        c(a);
      });
    }
    return new (r || (r = Promise))(function(a, c) {
      function u(P) {
        try {
          f(i.next(P));
        } catch (j) {
          c(j);
        }
      }
      function p(P) {
        try {
          f(i.throw(P));
        } catch (j) {
          c(j);
        }
      }
      function f(P) {
        P.done ? a(P.value) : n(P.value).then(u, p);
      }
      f((i = i.apply(d, o || [])).next());
    });
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), t.RootApiFp = t.RootApiAxiosParamCreator = t.RbacApi = t.RbacApiFactory = t.RbacApiFp = t.RbacApiAxiosParamCreator = t.ProductsApi = t.ProductsApiFactory = t.ProductsApiFp = t.ProductsApiAxiosParamCreator = t.ProductCategoriesApi = t.ProductCategoriesApiFactory = t.ProductCategoriesApiFp = t.ProductCategoriesApiAxiosParamCreator = t.PointofsaleApi = t.PointofsaleApiFactory = t.PointofsaleApiFp = t.PointofsaleApiAxiosParamCreator = t.PayoutRequestsApi = t.PayoutRequestsApiFactory = t.PayoutRequestsApiFp = t.PayoutRequestsApiAxiosParamCreator = t.InvoicesApi = t.InvoicesApiFactory = t.InvoicesApiFp = t.InvoicesApiAxiosParamCreator = t.FilesApi = t.FilesApiFactory = t.FilesApiFp = t.FilesApiAxiosParamCreator = t.ContainersApi = t.ContainersApiFactory = t.ContainersApiFp = t.ContainersApiAxiosParamCreator = t.BorrelkaartgroupsApi = t.BorrelkaartgroupsApiFactory = t.BorrelkaartgroupsApiFp = t.BorrelkaartgroupsApiAxiosParamCreator = t.BannersApi = t.BannersApiFactory = t.BannersApiFp = t.BannersApiAxiosParamCreator = t.BalanceApi = t.BalanceApiFactory = t.BalanceApiFp = t.BalanceApiAxiosParamCreator = t.AuthenticateApi = t.AuthenticateApiFactory = t.AuthenticateApiFp = t.AuthenticateApiAxiosParamCreator = void 0, t.VatGroupsApi = t.VatGroupsApiFactory = t.VatGroupsApiFp = t.VatGroupsApiAxiosParamCreator = t.UsersApi = t.UsersApiFactory = t.UsersApiFp = t.UsersApiAxiosParamCreator = t.TransfersApi = t.TransfersApiFactory = t.TransfersApiFp = t.TransfersApiAxiosParamCreator = t.TransactionsApi = t.TransactionsApiFactory = t.TransactionsApiFp = t.TransactionsApiAxiosParamCreator = t.TestApi = t.TestApiFactory = t.TestApiFp = t.TestApiAxiosParamCreator = t.StripeApi = t.StripeApiFactory = t.StripeApiFp = t.StripeApiAxiosParamCreator = t.RootApi = t.RootApiFactory = void 0;
  const l = cs, e = D, h = ut, A = function(d) {
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("eanAuthentication", "req", o);
        const i = "/authentication/ean", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "req", o);
        const i = "/authentication/GEWIS/LDAP", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisPinAuthentication", "req", o);
        const i = "/authentication/GEWIS/pin", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisWebAuthentication", "req", o);
        const i = "/authentication/gewisweb", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("keyAuthentication", "req", o);
        const i = "/authentication/key", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("ldapAuthentication", "req", o);
        const i = "/authentication/LDAP", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("localAuthentication", "req", o);
        const i = "/authentication/local", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("mockAuthentication", "req", o);
        const i = "/authentication/mock", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("nfcAuthentication", "req", o);
        const i = "/authentication/nfc", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("pinAuthentication", "req", o);
        const i = "/authentication/pin", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/authentication/refreshToken", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "GET" }, n), o), c = {}, u = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", d), (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      }),
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocal", "req", o);
        const i = "/authentication/local/reset", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocalWithToken", "req", o);
        const i = "/authentication/local", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "PUT" }, a), r), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      })
    };
  };
  t.AuthenticateApiAxiosParamCreator = A;
  const O = function(d) {
    const o = (0, t.AuthenticateApiAxiosParamCreator)(d);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.eanAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.gewisLDAPAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.gewisPinAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.gewisWebAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.keyAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.ldapAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.localAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.mockAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.nfcAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.pinAuthentication(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.refreshToken(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.resetLocal(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.resetLocalWithToken(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.AuthenticateApiFp = O;
  const b = function(d, o, r) {
    const i = (0, t.AuthenticateApiFp)(d);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(n, a) {
        return i.eanAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(n, a) {
        return i.gewisLDAPAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(n, a) {
        return i.gewisPinAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(n, a) {
        return i.gewisWebAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(n, a) {
        return i.keyAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(n, a) {
        return i.ldapAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(n, a) {
        return i.localAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(n, a) {
        return i.mockAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(n, a) {
        return i.nfcAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(n, a) {
        return i.pinAuthentication(n, a).then((c) => c(r, o));
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(n) {
        return i.refreshToken(n).then((a) => a(r, o));
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(n, a) {
        return i.resetLocal(n, a).then((c) => c(r, o));
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(n, a) {
        return i.resetLocalWithToken(n, a).then((c) => c(r, o));
      }
    };
  };
  t.AuthenticateApiFactory = b;
  class R extends h.BaseAPI {
    /**
     *  EAN login and hand out token
     * @param {AuthenticationEanRequest} req The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).eanAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Key login and hand out token.
     * @param {AuthenticationKeyRequest} req The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).keyAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).ldapAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Local login and hand out token
     * @param {AuthenticationLocalRequest} req The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).localAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Mock login and hand out token.
     * @param {AuthenticationMockRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).mockAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  NFC login and hand out token
     * @param {AuthenticationNfcRequest} req The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).nfcAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token
     * @param {AuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).pinAuthentication(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(o) {
      return (0, t.AuthenticateApiFp)(this.configuration).refreshToken(o).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Creates a reset token for the local authentication
     * @param {ResetLocalRequest} req The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).resetLocal(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} req The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(o, r) {
      return (0, t.AuthenticateApiFp)(this.configuration).resetLocalWithToken(o, r).then((i) => i(this.axios, this.basePath));
    }
  }
  t.AuthenticateApi = R;
  const m = function(d) {
    return {
      /**
       *  Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {'id' | 'amount'} [orderBy] Column to order balance by - eg: id,amount
       * @param {'ASC' | 'DESC'} [orderDirection] Order direction - eg: ASC,DESC
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance: (o, r, i, n, a, c, u, p = {}) => s(this, void 0, void 0, function* () {
        const f = "/balances/all", P = new URL(f, e.DUMMY_BASE_URL);
        let j;
        d && (j = d.baseOptions);
        const v = Object.assign(Object.assign({ method: "GET" }, j), p), F = {}, B = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", d), o !== void 0 && (B.date = o), r !== void 0 && (B.minBalance = r), i !== void 0 && (B.maxBalance = i), n !== void 0 && (B.orderBy = n), a !== void 0 && (B.orderDirection = a), c !== void 0 && (B.take = c), u !== void 0 && (B.skip = u), (0, e.setSearchParams)(P, B);
        let z = j && j.headers ? j.headers : {};
        return v.headers = Object.assign(Object.assign(Object.assign({}, F), z), p.headers), {
          url: (0, e.toPathString)(P),
          options: v
        };
      }),
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBalanceId", "id", o);
        const i = "/balances/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/balances", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "GET" }, n), o), c = {}, u = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", d), (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      })
    };
  };
  t.BalanceApiAxiosParamCreator = m;
  const g = function(d) {
    const o = (0, t.BalanceApiAxiosParamCreator)(d);
    return {
      /**
       *  Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {'id' | 'amount'} [orderBy] Column to order balance by - eg: id,amount
       * @param {'ASC' | 'DESC'} [orderDirection] Order direction - eg: ASC,DESC
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(r, i, n, a, c, u, p, f) {
        return s(this, void 0, void 0, function* () {
          const P = yield o.getAllBalance(r, i, n, a, c, u, p, f);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getBalanceId(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.getBalances(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.BalanceApiFp = g;
  const T = function(d, o, r) {
    const i = (0, t.BalanceApiFp)(d);
    return {
      /**
       *  Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {'id' | 'amount'} [orderBy] Column to order balance by - eg: id,amount
       * @param {'ASC' | 'DESC'} [orderDirection] Order direction - eg: ASC,DESC
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(n, a, c, u, p, f, P, j) {
        return i.getAllBalance(n, a, c, u, p, f, P, j).then((v) => v(r, o));
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(n, a) {
        return i.getBalanceId(n, a).then((c) => c(r, o));
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(n) {
        return i.getBalances(n).then((a) => a(r, o));
      }
    };
  };
  t.BalanceApiFactory = T;
  class w extends h.BaseAPI {
    /**
     *  Get balance of the current user
     * @param {string} [date] Timestamp to get balances for
     * @param {number} [minBalance] Minimum balance
     * @param {number} [maxBalance] Maximum balance
     * @param {'id' | 'amount'} [orderBy] Column to order balance by - eg: id,amount
     * @param {'ASC' | 'DESC'} [orderDirection] Order direction - eg: ASC,DESC
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getAllBalance(o, r, i, n, a, c, u, p) {
      return (0, t.BalanceApiFp)(this.configuration).getAllBalance(o, r, i, n, a, c, u, p).then((f) => f(this.axios, this.basePath));
    }
    /**
     *  Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(o, r) {
      return (0, t.BalanceApiFp)(this.configuration).getBalanceId(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(o) {
      return (0, t.BalanceApiFp)(this.configuration).getBalances(o).then((r) => r(this.axios, this.basePath));
    }
  }
  t.BalanceApi = w;
  const E = function(d) {
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("_delete", "id", o);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("create", "banner", o);
        const i = "/banners", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/banners/active", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/banners", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/open/banners", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBanner", "id", o);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("update", "id", o), (0, e.assertParamExists)("update", "banner", r);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateImage", "id", o);
        const n = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, c), i), p = {}, f = {}, P = new (d && d.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), r !== void 0 && P.append("file", r), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(a, f);
        let j = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), j), i.headers), u.data = P, {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.BannersApiAxiosParamCreator = E;
  const U = function(d) {
    const o = (0, t.BannersApiAxiosParamCreator)(d);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o._delete(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.create(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getActive(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllBanners(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllOpenBanners(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getBanner(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.update(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateImage(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.BannersApiFp = U;
  const V = function(d, o, r) {
    const i = (0, t.BannersApiFp)(d);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(n, a) {
        return i._delete(n, a).then((c) => c(r, o));
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(n, a) {
        return i.create(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(n, a, c) {
        return i.getActive(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(n, a, c) {
        return i.getAllBanners(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(n, a, c) {
        return i.getAllOpenBanners(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(n, a) {
        return i.getBanner(n, a).then((c) => c(r, o));
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(n, a, c) {
        return i.update(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(n, a, c) {
        return i.updateImage(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.BannersApiFactory = V;
  class M extends h.BaseAPI {
    /**
     *  Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(o, r) {
      return (0, t.BannersApiFp)(this.configuration)._delete(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Saves a banner to the database
     * @param {BannerRequest} banner The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(o, r) {
      return (0, t.BannersApiFp)(this.configuration).create(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all active banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getActive(o, r, i) {
      return (0, t.BannersApiFp)(this.configuration).getActive(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllBanners(o, r, i) {
      return (0, t.BannersApiFp)(this.configuration).getAllBanners(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllOpenBanners(o, r, i) {
      return (0, t.BannersApiFp)(this.configuration).getAllOpenBanners(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(o, r) {
      return (0, t.BannersApiFp)(this.configuration).getBanner(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Updates the requested banner
     * @param {number} id The id of the banner which should be updated
     * @param {BannerRequest} banner The updated banner
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    update(o, r, i) {
      return (0, t.BannersApiFp)(this.configuration).update(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Uploads a banner image to the given banner
     * @param {number} id The id of the banner
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    updateImage(o, r, i) {
      return (0, t.BannersApiFp)(this.configuration).updateImage(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.BannersApi = M;
  const L = function(d) {
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createBorrelkaartgroup", "borrelkaartgroup", o);
        const i = "/borrelkaartgroups", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/borrelkaartgroups", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBorrelkaartgroupId", "id", o);
        const i = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateBorrelkaartGroup", "id", o), (0, e.assertParamExists)("updateBorrelkaartGroup", "borrelkaartgroup", r);
        const n = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.BorrelkaartgroupsApiAxiosParamCreator = L;
  const k = function(d) {
    const o = (0, t.BorrelkaartgroupsApiAxiosParamCreator)(d);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createBorrelkaartgroup(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getALlBorrelkaartgroups(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getBorrelkaartgroupId(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateBorrelkaartGroup(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.BorrelkaartgroupsApiFp = k;
  const Q = function(d, o, r) {
    const i = (0, t.BorrelkaartgroupsApiFp)(d);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(n, a) {
        return i.createBorrelkaartgroup(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(n, a, c) {
        return i.getALlBorrelkaartgroups(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(n, a) {
        return i.getBorrelkaartgroupId(n, a).then((c) => c(r, o));
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(n, a, c) {
        return i.updateBorrelkaartGroup(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.BorrelkaartgroupsApiFactory = Q;
  class ce extends h.BaseAPI {
    /**
     *  Creates a new borrelkaart group
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    createBorrelkaartgroup(o, r) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).createBorrelkaartgroup(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all existing borrelkaart groups
     * @param {number} [take] How many borrelkaart groups the endpoint should return
     * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getALlBorrelkaartgroups(o, r, i) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).getALlBorrelkaartgroups(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getBorrelkaartgroupId(o, r) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).getBorrelkaartgroupId(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Updates the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be updated
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    updateBorrelkaartGroup(o, r, i) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).updateBorrelkaartGroup(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.BorrelkaartgroupsApi = ce;
  const Fs = function(d) {
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveContainer", "id", o);
        const i = "/containers/{id}/approve".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createContainer", "container", o);
        const i = "/containers", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/containers", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getProductsContainer", "id", o);
        const a = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/containers/public", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleContainer", "id", o);
        const i = "/containers/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedContainer", "id", o);
        const i = "/containers/{id}/update".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/containers/updated", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateContainer", "id", o), (0, e.assertParamExists)("updateContainer", "container", r);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.ContainersApiAxiosParamCreator = Fs;
  const Bs = function(d) {
    const o = (0, t.ContainersApiAxiosParamCreator)(d);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.approveContainer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createContainer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllContainers(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getProductsContainer(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getPublicContainers(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleContainer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleUpdatedContainer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getUpdatedContainers(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateContainer(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.ContainersApiFp = Bs;
  const vs = function(d, o, r) {
    const i = (0, t.ContainersApiFp)(d);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(n, a) {
        return i.approveContainer(n, a).then((c) => c(r, o));
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(n, a) {
        return i.createContainer(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(n, a, c) {
        return i.getAllContainers(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(n, a, c, u) {
        return i.getProductsContainer(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(n, a, c) {
        return i.getPublicContainers(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(n, a) {
        return i.getSingleContainer(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(n, a) {
        return i.getSingleUpdatedContainer(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(n, a, c) {
        return i.getUpdatedContainers(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(n, a, c) {
        return i.updateContainer(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.ContainersApiFactory = vs;
  class ws extends h.BaseAPI {
    /**
     *  Approve a container update.
     * @param {number} id The id of the container update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    approveContainer(o, r) {
      return (0, t.ContainersApiFp)(this.configuration).approveContainer(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Create a new container.
     * @param {CreateContainerRequest} container    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(o, r) {
      return (0, t.ContainersApiFp)(this.configuration).createContainer(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all existing containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getAllContainers(o, r, i) {
      return (0, t.ContainersApiFp)(this.configuration).getAllContainers(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all the products in the container
     * @param {number} id The id of the container which should be returned
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getProductsContainer(o, r, i, n) {
      return (0, t.ContainersApiFp)(this.configuration).getProductsContainer(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all public container
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getPublicContainers(o, r, i) {
      return (0, t.ContainersApiFp)(this.configuration).getPublicContainers(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(o, r) {
      return (0, t.ContainersApiFp)(this.configuration).getSingleContainer(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleUpdatedContainer(o, r) {
      return (0, t.ContainersApiFp)(this.configuration).getSingleUpdatedContainer(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all updated containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getUpdatedContainers(o, r, i) {
      return (0, t.ContainersApiFp)(this.configuration).getUpdatedContainers(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Update an existing container.
     * @param {number} id The id of the container which should be updated
     * @param {UpdateContainerRequest} container    The container which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    updateContainer(o, r, i) {
      return (0, t.ContainersApiFp)(this.configuration).updateContainer(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.ContainersApi = ws;
  const _s = function(d) {
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/files", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, c), i), p = {}, f = {}, P = new (d && d.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && P.append("file", o), r !== void 0 && P.append("name", r), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(a, f);
        let j = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), j), i.headers), u.data = P, {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteFile", "id", o);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getFile", "id", o);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      })
    };
  };
  t.FilesApiAxiosParamCreator = _s;
  const Cs = function(d) {
    const o = (0, t.FilesApiAxiosParamCreator)(d);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.createFile(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteFile(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getFile(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.FilesApiFp = Cs;
  const Ls = function(d, o, r) {
    const i = (0, t.FilesApiFp)(d);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(n, a, c) {
        return i.createFile(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(n, a) {
        return i.deleteFile(n, a).then((c) => c(r, o));
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(n, a) {
        return i.getFile(n, a).then((c) => c(r, o));
      }
    };
  };
  t.FilesApiFactory = Ls;
  class qs extends h.BaseAPI {
    /**
     *  Upload a file with the given name.
     * @param {File} [file] null
     * @param {string} [name] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(o, r, i) {
      return (0, t.FilesApiFp)(this.configuration).createFile(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(o, r) {
      return (0, t.FilesApiFp)(this.configuration).deleteFile(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(o, r) {
      return (0, t.FilesApiFp)(this.configuration).getFile(o, r).then((i) => i(this.axios, this.basePath));
    }
  }
  t.FilesApi = qs;
  const Ds = function(d) {
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createInvoice", "invoice", o);
        const i = "/invoices", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteInvoice", "id", o);
        const i = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices: (o, r, i, n, a, c, u = {}) => s(this, void 0, void 0, function* () {
        const p = "/invoices", f = new URL(p, e.DUMMY_BASE_URL);
        let P;
        d && (P = d.baseOptions);
        const j = Object.assign(Object.assign({ method: "GET" }, P), u), v = {}, F = {};
        yield (0, e.setApiKeyToObject)(v, "Authorization", d), o !== void 0 && (F.toId = o), r !== void 0 && (F.invoiceId = r), i !== void 0 && (F.state = i), n !== void 0 && (F.returnEntries = n), a !== void 0 && (F.fromDate = a), c !== void 0 && (F.tillDate = c), (0, e.setSearchParams)(f, F);
        let B = P && P.headers ? P.headers : {};
        return j.headers = Object.assign(Object.assign(Object.assign({}, v), B), u.headers), {
          url: (0, e.toPathString)(f),
          options: j
        };
      }),
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleInvoice", "id", o);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), r !== void 0 && (f.returnEntries = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateInvoice", "id", o), (0, e.assertParamExists)("updateInvoice", "invoice", r);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.InvoicesApiAxiosParamCreator = Ds;
  const Ms = function(d) {
    const o = (0, t.InvoicesApiAxiosParamCreator)(d);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createInvoice(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteInvoice(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(r, i, n, a, c, u, p) {
        return s(this, void 0, void 0, function* () {
          const f = yield o.getAllInvoices(r, i, n, a, c, u, p);
          return (0, e.createRequestFunction)(f, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getSingleInvoice(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateInvoice(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.InvoicesApiFp = Ms;
  const Is = function(d, o, r) {
    const i = (0, t.InvoicesApiFp)(d);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(n, a) {
        return i.createInvoice(n, a).then((c) => c(r, o));
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(n, a) {
        return i.deleteInvoice(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(n, a, c, u, p, f, P) {
        return i.getAllInvoices(n, a, c, u, p, f, P).then((j) => j(r, o));
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(n, a, c) {
        return i.getSingleInvoice(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(n, a, c) {
        return i.updateInvoice(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.InvoicesApiFactory = Is;
  class Hs extends h.BaseAPI {
    /**
     *  Adds an invoice to the system.
     * @param {CreateInvoiceRequest} invoice The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(o, r) {
      return (0, t.InvoicesApiFp)(this.configuration).createInvoice(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(o, r) {
      return (0, t.InvoicesApiFp)(this.configuration).deleteInvoice(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all invoices in the system.
     * @param {number} [toId] Filter on Id of the debtor
     * @param {number} [invoiceId] Filter on invoice ID
     * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
     * @param {string} [fromDate] Start date for selected invoices (inclusive)
     * @param {string} [tillDate] End date for selected invoices (exclusive)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getAllInvoices(o, r, i, n, a, c, u) {
      return (0, t.InvoicesApiFp)(this.configuration).getAllInvoices(o, r, i, n, a, c, u).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Returns a single invoice in the system.
     * @param {number} id The id of the requested invoice
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoice(o, r, i) {
      return (0, t.InvoicesApiFp)(this.configuration).getSingleInvoice(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} invoice The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(o, r, i) {
      return (0, t.InvoicesApiFp)(this.configuration).updateInvoice(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.InvoicesApi = Hs;
  const Ns = function(d) {
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequest", o);
        const i = "/payoutrequests", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all payout requests given the filter parameters
       * @param {string} [requestedById] ID of user(s) who requested a payout
       * @param {string} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests: (o, r, i, n, a, c, u, p = {}) => s(this, void 0, void 0, function* () {
        const f = "/payoutrequests", P = new URL(f, e.DUMMY_BASE_URL);
        let j;
        d && (j = d.baseOptions);
        const v = Object.assign(Object.assign({ method: "GET" }, j), p), F = {}, B = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", d), o !== void 0 && (B.requestedById = o), r !== void 0 && (B.approvedById = r), i !== void 0 && (B.fromDate = i), n !== void 0 && (B.tillDate = n), a !== void 0 && (B.status = a), c !== void 0 && (B.take = c), u !== void 0 && (B.skip = u), (0, e.setSearchParams)(P, B);
        let z = j && j.headers ? j.headers : {};
        return v.headers = Object.assign(Object.assign(Object.assign({}, F), z), p.headers), {
          url: (0, e.toPathString)(P),
          options: v
        };
      }),
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", o);
        const i = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", o), (0, e.assertParamExists)("setPayoutRequestStatus", "state", r);
        const n = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.PayoutRequestsApiAxiosParamCreator = Ns;
  const xs = function(d) {
    const o = (0, t.PayoutRequestsApiAxiosParamCreator)(d);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createPayoutRequest(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all payout requests given the filter parameters
       * @param {string} [requestedById] ID of user(s) who requested a payout
       * @param {string} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(r, i, n, a, c, u, p, f) {
        return s(this, void 0, void 0, function* () {
          const P = yield o.getAllPayoutRequests(r, i, n, a, c, u, p, f);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSinglePayoutRequest(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.setPayoutRequestStatus(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.PayoutRequestsApiFp = xs;
  const $s = function(d, o, r) {
    const i = (0, t.PayoutRequestsApiFp)(d);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(n, a) {
        return i.createPayoutRequest(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all payout requests given the filter parameters
       * @param {string} [requestedById] ID of user(s) who requested a payout
       * @param {string} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(n, a, c, u, p, f, P, j) {
        return i.getAllPayoutRequests(n, a, c, u, p, f, P, j).then((v) => v(r, o));
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(n, a) {
        return i.getSinglePayoutRequest(n, a).then((c) => c(r, o));
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(n, a, c) {
        return i.setPayoutRequestStatus(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.PayoutRequestsApiFactory = $s;
  class ks extends h.BaseAPI {
    /**
     *  Create a new payout request
     * @param {PayoutRequestRequest} payoutRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(o, r) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all payout requests given the filter parameters
     * @param {string} [requestedById] ID of user(s) who requested a payout
     * @param {string} [approvedById] ID of user(s) who approved a payout
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {string} [status] Status of the payout requests (OR relation)
     * @param {number} [take] How many payout requests the endpoint should return
     * @param {number} [skip] How many payout requests should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getAllPayoutRequests(o, r, i, n, a, c, u, p) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(o, r, i, n, a, c, u, p).then((f) => f(this.axios, this.basePath));
    }
    /**
     *  Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(o, r) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} state New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(o, r, i) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.PayoutRequestsApi = ks;
  const zs = function(d) {
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approvePointOfSale", "id", o);
        const i = "/pointsofsale/{id}/approve".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPointOfSale", "pointofsale", o);
        const i = "/pointsofsale", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", o);
        const a = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", o);
        const a = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/pointsofsale", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", o);
        const i = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedPointOfSale", "id", o);
        const i = "/pointsofsale/{id}/update".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns a Point of Sale transactions
       * @param {number} id          The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getTransactions", "id", o);
        const a = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/pointsofsale/updated", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updatePointOfSale", "id", o), (0, e.assertParamExists)("updatePointOfSale", "pointofsale", r);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.PointofsaleApiAxiosParamCreator = zs;
  const Ks = function(d) {
    const o = (0, t.PointofsaleApiAxiosParamCreator)(d);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.approvePointOfSale(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createPointOfSale(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getAllPointOfSaleContainers(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getAllPointOfSaleProducts(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllPointsOfSale(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSinglePointOfSale(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleUpdatedPointOfSale(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns a Point of Sale transactions
       * @param {number} id          The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getTransactions(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getUpdated(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updatePointOfSale(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.PointofsaleApiFp = Ks;
  const Gs = function(d, o, r) {
    const i = (0, t.PointofsaleApiFp)(d);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(n, a) {
        return i.approvePointOfSale(n, a).then((c) => c(r, o));
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(n, a) {
        return i.createPointOfSale(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(n, a, c, u) {
        return i.getAllPointOfSaleContainers(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(n, a, c, u) {
        return i.getAllPointOfSaleProducts(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(n, a, c) {
        return i.getAllPointsOfSale(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(n, a) {
        return i.getSinglePointOfSale(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(n, a) {
        return i.getSingleUpdatedPointOfSale(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns a Point of Sale transactions
       * @param {number} id          The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(n, a, c, u) {
        return i.getTransactions(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(n, a, c) {
        return i.getUpdated(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(n, a, c) {
        return i.updatePointOfSale(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.PointofsaleApiFactory = Gs;
  class Qs extends h.BaseAPI {
    /**
     *  Approve a Point of Sale update.
     * @param {number} id The id of the Point of Sale update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    approvePointOfSale(o, r) {
      return (0, t.PointofsaleApiFp)(this.configuration).approvePointOfSale(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(o, r) {
      return (0, t.PointofsaleApiFp)(this.configuration).createPointOfSale(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleContainers(o, r, i, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the products of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleProducts(o, r, i, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all existing Point of Sales
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointsOfSale(o, r, i) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(o, r) {
      return (0, t.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns a single Points of Sale update
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSingleUpdatedPointOfSale(o, r) {
      return (0, t.PointofsaleApiFp)(this.configuration).getSingleUpdatedPointOfSale(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns a Point of Sale transactions
     * @param {number} id          The id of the Point of Sale of which to get the transactions.
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getTransactions(o, r, i, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).getTransactions(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all updated Points of Sale
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getUpdated(o, r, i) {
      return (0, t.PointofsaleApiFp)(this.configuration).getUpdated(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(o, r, i) {
      return (0, t.PointofsaleApiFp)(this.configuration).updatePointOfSale(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.PointofsaleApi = Qs;
  const Ys = function(d) {
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProductCategory", "productCategory", o);
        const i = "/productcategories", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/productcategories", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProductCategory", "id", o);
        const i = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductCategory", "id", o), (0, e.assertParamExists)("updateProductCategory", "productCategory", r);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.ProductCategoriesApiAxiosParamCreator = Ys;
  const Js = function(d) {
    const o = (0, t.ProductCategoriesApiAxiosParamCreator)(d);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createProductCategory(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllProductCategories(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleProductCategory(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateProductCategory(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.ProductCategoriesApiFp = Js;
  const Ws = function(d, o, r) {
    const i = (0, t.ProductCategoriesApiFp)(d);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(n, a) {
        return i.createProductCategory(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(n, a, c) {
        return i.getAllProductCategories(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(n, a) {
        return i.getSingleProductCategory(n, a).then((c) => c(r, o));
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(n, a, c) {
        return i.updateProductCategory(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.ProductCategoriesApiFactory = Ws;
  class Xs extends h.BaseAPI {
    /**
     *  Post a new productCategory.
     * @param {ProductCategoryRequest} productCategory The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(o, r) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).createProductCategory(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all existing productcategories
     * @param {number} [take] How many product categories the endpoint should return
     * @param {number} [skip] How many product categories should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getAllProductCategories(o, r, i) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(o, r) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} productCategory The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(o, r, i) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).updateProductCategory(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.ProductCategoriesApi = Xs;
  const Zs = function(d) {
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveProduct", "id", o);
        const i = "/products/{id}/approve".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProduct", "product", o);
        const i = "/products", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/products", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProduct", "id", o);
        const i = "/products/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUpdateProduct", "id", o);
        const i = "/products/{id}/update".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/products/updated", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProduct", "id", o), (0, e.assertParamExists)("updateProduct", "product", r);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductImage", "id", o);
        const n = "/products/{id}/image".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, c), i), p = {}, f = {}, P = new (d && d.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), r !== void 0 && P.append("file", r), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(a, f);
        let j = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), j), i.headers), u.data = P, {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.ProductsApiAxiosParamCreator = Zs;
  const er = function(d) {
    const o = (0, t.ProductsApiAxiosParamCreator)(d);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.approveProduct(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createProduct(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllProducts(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleProduct(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getUpdateProduct(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getUpdatedProducts(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateProduct(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateProductImage(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.ProductsApiFp = er;
  const tr = function(d, o, r) {
    const i = (0, t.ProductsApiFp)(d);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(n, a) {
        return i.approveProduct(n, a).then((c) => c(r, o));
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(n, a) {
        return i.createProduct(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(n, a, c) {
        return i.getAllProducts(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(n, a) {
        return i.getSingleProduct(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(n, a) {
        return i.getUpdateProduct(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(n, a, c) {
        return i.getUpdatedProducts(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(n, a, c) {
        return i.updateProduct(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(n, a, c) {
        return i.updateProductImage(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.ProductsApiFactory = tr;
  class sr extends h.BaseAPI {
    /**
     *  Approve a product update.
     * @param {number} id The id of the product update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    approveProduct(o, r) {
      return (0, t.ProductsApiFp)(this.configuration).approveProduct(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Create a new product.
     * @param {CreateProductRequest} product The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(o, r) {
      return (0, t.ProductsApiFp)(this.configuration).createProduct(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all existing products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getAllProducts(o, r, i) {
      return (0, t.ProductsApiFp)(this.configuration).getAllProducts(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(o, r) {
      return (0, t.ProductsApiFp)(this.configuration).getSingleProduct(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdateProduct(o, r) {
      return (0, t.ProductsApiFp)(this.configuration).getUpdateProduct(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all updated products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdatedProducts(o, r, i) {
      return (0, t.ProductsApiFp)(this.configuration).getUpdatedProducts(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} product The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(o, r, i) {
      return (0, t.ProductsApiFp)(this.configuration).updateProduct(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Upload a new image for a product
     * @param {number} id The id of the product which should be returned
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProductImage(o, r, i) {
      return (0, t.ProductsApiFp)(this.configuration).updateProductImage(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.ProductsApi = sr;
  const rr = function(d) {
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/rbac/roles", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "GET" }, n), o), c = {}, u = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", d), (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      })
    };
  };
  t.RbacApiAxiosParamCreator = rr;
  const ar = function(d) {
    const o = (0, t.RbacApiAxiosParamCreator)(d);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.getAllRoles(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.RbacApiFp = ar;
  const nr = function(d, o, r) {
    const i = (0, t.RbacApiFp)(d);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(n) {
        return i.getAllRoles(n).then((a) => a(r, o));
      }
    };
  };
  t.RbacApiFactory = nr;
  class ir extends h.BaseAPI {
    /**
     *  Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(o) {
      return (0, t.RbacApiFp)(this.configuration).getAllRoles(o).then((r) => r(this.axios, this.basePath));
    }
  }
  t.RbacApi = ir;
  const or = function(d) {
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/ping", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "GET" }, n), o), c = {}, u = {};
        (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      })
    };
  };
  t.RootApiAxiosParamCreator = or;
  const cr = function(d) {
    const o = (0, t.RootApiAxiosParamCreator)(d);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.ping(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.RootApiFp = cr;
  const lr = function(d, o, r) {
    const i = (0, t.RootApiFp)(d);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(n) {
        return i.ping(n).then((a) => a(r, o));
      }
    };
  };
  t.RootApiFactory = lr;
  class dr extends h.BaseAPI {
    /**
     *  Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(o) {
      return (0, t.RootApiFp)(this.configuration).ping(o).then((r) => r(this.axios, this.basePath));
    }
  }
  t.RootApi = dr;
  const ur = function(d) {
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deposit", "stripe", o);
        const i = "/stripe/deposit", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/stripe/webhook", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "POST" }, n), o), c = {}, u = {};
        (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      })
    };
  };
  t.StripeApiAxiosParamCreator = ur;
  const hr = function(d) {
    const o = (0, t.StripeApiAxiosParamCreator)(d);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deposit(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.webhook(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.StripeApiFp = hr;
  const pr = function(d, o, r) {
    const i = (0, t.StripeApiFp)(d);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(n, a) {
        return i.deposit(n, a).then((c) => c(r, o));
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(n) {
        return i.webhook(n).then((a) => a(r, o));
      }
    };
  };
  t.StripeApiFactory = pr;
  class Ar extends h.BaseAPI {
    /**
     *  Start the stripe deposit flow
     * @param {StripeRequest} stripe The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(o, r) {
      return (0, t.StripeApiFp)(this.configuration).deposit(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Webhook for Stripe event updates
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    webhook(o) {
      return (0, t.StripeApiFp)(this.configuration).webhook(o).then((r) => r(this.axios, this.basePath));
    }
  }
  t.StripeApi = Ar;
  const fr = function(d) {
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (o = {}) => s(this, void 0, void 0, function* () {
        const r = "/test/helloworld", i = new URL(r, e.DUMMY_BASE_URL);
        let n;
        d && (n = d.baseOptions);
        const a = Object.assign(Object.assign({ method: "POST" }, n), o), c = {}, u = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", d), (0, e.setSearchParams)(i, u);
        let p = n && n.headers ? n.headers : {};
        return a.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(i),
          options: a
        };
      })
    };
  };
  t.TestApiAxiosParamCreator = fr;
  const Or = function(d) {
    const o = (0, t.TestApiAxiosParamCreator)(d);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(r) {
        return s(this, void 0, void 0, function* () {
          const i = yield o.helloworld(r);
          return (0, e.createRequestFunction)(i, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.TestApiFp = Or;
  const Pr = function(d, o, r) {
    const i = (0, t.TestApiFp)(d);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(n) {
        return i.helloworld(n).then((a) => a(r, o));
      }
    };
  };
  t.TestApiFactory = Pr;
  class br extends h.BaseAPI {
    /**
     *  Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestApi
     */
    helloworld(o) {
      return (0, t.TestApiFp)(this.configuration).helloworld(o).then((r) => r(this.axios, this.basePath));
    }
  }
  t.TestApi = br;
  const mr = function(d) {
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransaction", "transaction", o);
        const i = "/transactions", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteTransaction", "id", o);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions: (o, r, i, n, a, c, u, p, f, P, j = {}) => s(this, void 0, void 0, function* () {
        const v = "/transactions", F = new URL(v, e.DUMMY_BASE_URL);
        let B;
        d && (B = d.baseOptions);
        const z = Object.assign(Object.assign({ method: "GET" }, B), j), le = {}, q = {};
        yield (0, e.setApiKeyToObject)(le, "Authorization", d), o !== void 0 && (q.fromId = o), r !== void 0 && (q.createdById = r), i !== void 0 && (q.toId = i), n !== void 0 && (q.pointOfSaleId = n), a !== void 0 && (q.productId = a), c !== void 0 && (q.productRevision = c), u !== void 0 && (q.fromDate = u), p !== void 0 && (q.tillDate = p), f !== void 0 && (q.take = f), P !== void 0 && (q.skip = P), (0, e.setSearchParams)(F, q);
        let Ne = B && B.headers ? B.headers : {};
        return z.headers = Object.assign(Object.assign(Object.assign({}, le), Ne), j.headers), {
          url: (0, e.toPathString)(F),
          options: z
        };
      }),
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransaction", "id", o);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateTransaction", "id", o), (0, e.assertParamExists)("updateTransaction", "transaction", r);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("validateTransaction", "transaction", o);
        const i = "/transactions/validate", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      })
    };
  };
  t.TransactionsApiAxiosParamCreator = mr;
  const gr = function(d) {
    const o = (0, t.TransactionsApiAxiosParamCreator)(d);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createTransaction(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteTransaction(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions(r, i, n, a, c, u, p, f, P, j, v) {
        return s(this, void 0, void 0, function* () {
          const F = yield o.getAllTransactions(r, i, n, a, c, u, p, f, P, j, v);
          return (0, e.createRequestFunction)(F, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleTransaction(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateTransaction(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.validateTransaction(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.TransactionsApiFp = gr;
  const yr = function(d, o, r) {
    const i = (0, t.TransactionsApiFp)(d);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(n, a) {
        return i.createTransaction(n, a).then((c) => c(r, o));
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(n, a) {
        return i.deleteTransaction(n, a).then((c) => c(r, o));
      },
      /**
       *  Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions(n, a, c, u, p, f, P, j, v, F, B) {
        return i.getAllTransactions(n, a, c, u, p, f, P, j, v, F, B).then((z) => z(r, o));
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(n, a) {
        return i.getSingleTransaction(n, a).then((c) => c(r, o));
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(n, a, c) {
        return i.updateTransaction(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(n, a) {
        return i.validateTransaction(n, a).then((c) => c(r, o));
      }
    };
  };
  t.TransactionsApiFactory = yr;
  class Sr extends h.BaseAPI {
    /**
     *  Creates a new transaction
     * @param {TransactionRequest} transaction The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(o, r) {
      return (0, t.TransactionsApiFp)(this.configuration).createTransaction(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(o, r) {
      return (0, t.TransactionsApiFp)(this.configuration).deleteTransaction(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get a list of all transactions
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [createdById] User that created selected transaction
     * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
     * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
     * @param {number} [productId] Product ID for selected transactions
     * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getAllTransactions(o, r, i, n, a, c, u, p, f, P, j) {
      return (0, t.TransactionsApiFp)(this.configuration).getAllTransactions(o, r, i, n, a, c, u, p, f, P, j).then((v) => v(this.axios, this.basePath));
    }
    /**
     *  Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(o, r) {
      return (0, t.TransactionsApiFp)(this.configuration).getSingleTransaction(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} transaction The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(o, r, i) {
      return (0, t.TransactionsApiFp)(this.configuration).updateTransaction(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transaction The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(o, r) {
      return (0, t.TransactionsApiFp)(this.configuration).validateTransaction(o, r).then((i) => i(this.axios, this.basePath));
    }
  }
  t.TransactionsApi = Sr;
  const Ur = function(d) {
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransfer", "transfer", o);
        const i = "/transfers", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        const n = "/transfers", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.take = o), r !== void 0 && (f.skip = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransfer", "id", o);
        const i = "/transfers/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      })
    };
  };
  t.TransfersApiAxiosParamCreator = Ur;
  const jr = function(d) {
    const o = (0, t.TransfersApiAxiosParamCreator)(d);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createTransfer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getAllTransfers(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleTransfer(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.TransfersApiFp = jr;
  const Rr = function(d, o, r) {
    const i = (0, t.TransfersApiFp)(d);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(n, a) {
        return i.createTransfer(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(n, a, c) {
        return i.getAllTransfers(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(n, a) {
        return i.getSingleTransfer(n, a).then((c) => c(r, o));
      }
    };
  };
  t.TransfersApiFactory = Rr;
  class Tr extends h.BaseAPI {
    /**
     *  Post a new transfer.
     * @param {TransferRequest} transfer The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(o, r) {
      return (0, t.TransfersApiFp)(this.configuration).createTransfer(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns all existing transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getAllTransfers(o, r, i) {
      return (0, t.TransfersApiFp)(this.configuration).getAllTransfers(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(o, r) {
      return (0, t.TransfersApiFp)(this.configuration).getSingleTransfer(o, r).then((i) => i(this.axios, this.basePath));
    }
  }
  t.TransfersApi = Tr;
  const Vr = function(d) {
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("acceptTos", "params", o);
        const i = "/users/acceptTos", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("authenticateAs", "id", o);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createUser", "user", o);
        const i = "/users", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUser", "id", o);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserKey", "id", o);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserNfc", "id", o);
        const i = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {number} [type] {1,2,3,4,5,6,7} - Filter based on user type. Possible values:      1 (MEMBER), 2 (ORGAN), 3 (BORRELKAART), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers: (o, r, i, n, a, c, u, p = {}) => s(this, void 0, void 0, function* () {
        const f = "/users", P = new URL(f, e.DUMMY_BASE_URL);
        let j;
        d && (j = d.baseOptions);
        const v = Object.assign(Object.assign({ method: "GET" }, j), p), F = {}, B = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", d), o !== void 0 && (B.take = o), r !== void 0 && (B.skip = r), i !== void 0 && (B.search = i), n !== void 0 && (B.active = n), a !== void 0 && (B.ofAge = a), c !== void 0 && (B.id = c), u !== void 0 && (B.type = u), (0, e.setSearchParams)(P, B);
        let z = j && j.headers ? j.headers : {};
        return v.headers = Object.assign(Object.assign(Object.assign({}, F), z), p.headers), {
          url: (0, e.toPathString)(P),
          options: v
        };
      }),
      /**
       *  Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", o);
        const a = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getIndividualUser", "id", o);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getOrganMembers", "id", o);
        const i = "/users/{id}/members".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", o);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserRoles", "id", o);
        const i = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersContainers", "id", o);
        const a = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", o);
        const a = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", o);
        const a = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", o);
        const i = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProducts", "id", o);
        const a = "/users/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Get an user\'s transactions (from, to or created)
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions: (o, r, i, n, a, c, u, p, f, P, j = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactions", "id", o);
        const v = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(o))), F = new URL(v, e.DUMMY_BASE_URL);
        let B;
        d && (B = d.baseOptions);
        const z = Object.assign(Object.assign({ method: "GET" }, B), j), le = {}, q = {};
        yield (0, e.setApiKeyToObject)(le, "Authorization", d), r !== void 0 && (q.fromId = r), i !== void 0 && (q.createdById = i), n !== void 0 && (q.toId = n), a !== void 0 && (q.productId = a), c !== void 0 && (q.productRevision = c), u !== void 0 && (q.fromDate = u), p !== void 0 && (q.tillDate = p), f !== void 0 && (q.take = f), P !== void 0 && (q.skip = P), (0, e.setSearchParams)(F, q);
        let Ne = B && B.headers ? B.headers : {};
        return z.headers = Object.assign(Object.assign(Object.assign({}, le), Ne), j.headers), {
          url: (0, e.toPathString)(F),
          options: z
        };
      }),
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport: (o, r, i, n, a, c, u = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", o);
        const p = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(o))), f = new URL(p, e.DUMMY_BASE_URL);
        let P;
        d && (P = d.baseOptions);
        const j = Object.assign(Object.assign({ method: "GET" }, P), u), v = {}, F = {};
        yield (0, e.setApiKeyToObject)(v, "Authorization", d), r !== void 0 && (F.fromDate = r), i !== void 0 && (F.tillDate = i), n !== void 0 && (F.fromId = n), a !== void 0 && (F.toId = a), c !== void 0 && (F.exclusiveToId = c), (0, e.setSearchParams)(f, F);
        let B = P && P.headers ? P.headers : {};
        return j.headers = Object.assign(Object.assign(Object.assign({}, v), B), u.headers), {
          url: (0, e.toPathString)(f),
          options: j
        };
      }),
      /**
       *  Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers: (o, r, i, n, a, c, u = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransfers", "id", o);
        const p = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(o))), f = new URL(p, e.DUMMY_BASE_URL);
        let P;
        d && (P = d.baseOptions);
        const j = Object.assign(Object.assign({ method: "GET" }, P), u), v = {}, F = {};
        yield (0, e.setApiKeyToObject)(v, "Authorization", d), r !== void 0 && (F.take = r), i !== void 0 && (F.skip = i), n !== void 0 && (F.fromId = n), a !== void 0 && (F.toId = a), c !== void 0 && (F.id = c), (0, e.setSearchParams)(f, F);
        let B = P && P.headers ? P.headers : {};
        return j.headers = Object.assign(Object.assign(Object.assign({}, v), B), u.headers), {
          url: (0, e.toPathString)(f),
          options: j
        };
      }),
      /**
       *  Returns the user\'s updated containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedContainers: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedContainers", "id", o);
        const a = "/users/{id}/containers/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Returns the user\'s updated Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedPointsOfSale: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedPointsOfSale", "id", o);
        const a = "/users/{id}/pointsofsale/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Get an user\'s updated products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedProducts: (o, r, i, n = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedProducts", "id", o);
        const a = "/users/{id}/products/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(a, e.DUMMY_BASE_URL);
        let u;
        d && (u = d.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), n), f = {}, P = {};
        yield (0, e.setApiKeyToObject)(f, "Authorization", d), r !== void 0 && (P.take = r), i !== void 0 && (P.skip = i), (0, e.setSearchParams)(c, P);
        let j = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, f), j), n.headers), {
          url: (0, e.toPathString)(c),
          options: p
        };
      }),
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUser", "id", o), (0, e.assertParamExists)("updateUser", "user", r);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserKey", "id", o);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", o), (0, e.assertParamExists)("updateUserLocalPassword", "update", r);
        const n = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserNfc", "id", o), (0, e.assertParamExists)("updateUserNfc", "update", r);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserPin", "id", o), (0, e.assertParamExists)("updateUserPin", "update", r);
        const n = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.UsersApiAxiosParamCreator = Vr;
  const Er = function(d) {
    const o = (0, t.UsersApiAxiosParamCreator)(d);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.acceptTos(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.authenticateAs(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createUser(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteUser(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteUserKey(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.deleteUserNfc(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {number} [type] {1,2,3,4,5,6,7} - Filter based on user type. Possible values:      1 (MEMBER), 2 (ORGAN), 3 (BORRELKAART), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(r, i, n, a, c, u, p, f) {
        return s(this, void 0, void 0, function* () {
          const P = yield o.getAllUsers(r, i, n, a, c, u, p, f);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getAllUsersOfUserType(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getIndividualUser(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getOrganMembers(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getUserAuthenticatable(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getUserRoles(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersContainers(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersFinancialMutations(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersPointsOfSale(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getUsersProcessingDeposits(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersProducts(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an user\'s transactions (from, to or created)
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions(r, i, n, a, c, u, p, f, P, j, v) {
        return s(this, void 0, void 0, function* () {
          const F = yield o.getUsersTransactions(r, i, n, a, c, u, p, f, P, j, v);
          return (0, e.createRequestFunction)(F, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(r, i, n, a, c, u, p) {
        return s(this, void 0, void 0, function* () {
          const f = yield o.getUsersTransactionsReport(r, i, n, a, c, u, p);
          return (0, e.createRequestFunction)(f, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(r, i, n, a, c, u, p) {
        return s(this, void 0, void 0, function* () {
          const f = yield o.getUsersTransfers(r, i, n, a, c, u, p);
          return (0, e.createRequestFunction)(f, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the user\'s updated containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedContainers(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedContainers(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the user\'s updated Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedPointsOfSale(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedPointsOfSale(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get an user\'s updated products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedProducts(r, i, n, a) {
        return s(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedProducts(r, i, n, a);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateUser(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.updateUserKey(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateUserLocalPassword(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateUserNfc(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateUserPin(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.UsersApiFp = Er;
  const Fr = function(d, o, r) {
    const i = (0, t.UsersApiFp)(d);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(n, a) {
        return i.acceptTos(n, a).then((c) => c(r, o));
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(n, a) {
        return i.authenticateAs(n, a).then((c) => c(r, o));
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(n, a) {
        return i.createUser(n, a).then((c) => c(r, o));
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(n, a) {
        return i.deleteUser(n, a).then((c) => c(r, o));
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(n, a) {
        return i.deleteUserKey(n, a).then((c) => c(r, o));
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(n, a) {
        return i.deleteUserNfc(n, a).then((c) => c(r, o));
      },
      /**
       *  Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {number} [type] {1,2,3,4,5,6,7} - Filter based on user type. Possible values:      1 (MEMBER), 2 (ORGAN), 3 (BORRELKAART), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(n, a, c, u, p, f, P, j) {
        return i.getAllUsers(n, a, c, u, p, f, P, j).then((v) => v(r, o));
      },
      /**
       *  Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(n, a, c, u) {
        return i.getAllUsersOfUserType(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(n, a) {
        return i.getIndividualUser(n, a).then((c) => c(r, o));
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(n, a) {
        return i.getOrganMembers(n, a).then((c) => c(r, o));
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(n, a) {
        return i.getUserAuthenticatable(n, a).then((c) => c(r, o));
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(n, a) {
        return i.getUserRoles(n, a).then((c) => c(r, o));
      },
      /**
       *  Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(n, a, c, u) {
        return i.getUsersContainers(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(n, a, c, u) {
        return i.getUsersFinancialMutations(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(n, a, c, u) {
        return i.getUsersPointsOfSale(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(n, a) {
        return i.getUsersProcessingDeposits(n, a).then((c) => c(r, o));
      },
      /**
       *  Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(n, a, c, u) {
        return i.getUsersProducts(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Get an user\'s transactions (from, to or created)
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions(n, a, c, u, p, f, P, j, v, F, B) {
        return i.getUsersTransactions(n, a, c, u, p, f, P, j, v, F, B).then((z) => z(r, o));
      },
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(n, a, c, u, p, f, P) {
        return i.getUsersTransactionsReport(n, a, c, u, p, f, P).then((j) => j(r, o));
      },
      /**
       *  Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(n, a, c, u, p, f, P) {
        return i.getUsersTransfers(n, a, c, u, p, f, P).then((j) => j(r, o));
      },
      /**
       *  Returns the user\'s updated containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedContainers(n, a, c, u) {
        return i.getUsersUpdatedContainers(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Returns the user\'s updated Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedPointsOfSale(n, a, c, u) {
        return i.getUsersUpdatedPointsOfSale(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Get an user\'s updated products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedProducts(n, a, c, u) {
        return i.getUsersUpdatedProducts(n, a, c, u).then((p) => p(r, o));
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(n, a, c) {
        return i.updateUser(n, a, c).then((u) => u(r, o));
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(n, a) {
        return i.updateUserKey(n, a).then((c) => c(r, o));
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(n, a, c) {
        return i.updateUserLocalPassword(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(n, a, c) {
        return i.updateUserNfc(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(n, a, c) {
        return i.updateUserPin(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.UsersApiFactory = Fr;
  class Br extends h.BaseAPI {
    /**
     *  Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(o, r) {
      return (0, t.UsersApiFp)(this.configuration).acceptTos(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(o, r) {
      return (0, t.UsersApiFp)(this.configuration).authenticateAs(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Create a new user
     * @param {CreateUserRequest} user The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(o, r) {
      return (0, t.UsersApiFp)(this.configuration).createUser(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(o, r) {
      return (0, t.UsersApiFp)(this.configuration).deleteUser(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(o, r) {
      return (0, t.UsersApiFp)(this.configuration).deleteUserKey(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(o, r) {
      return (0, t.UsersApiFp)(this.configuration).deleteUserNfc(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get a list of all users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {string} [search] Filter based on first name
     * @param {boolean} [active] Filter based if the user is active
     * @param {boolean} [ofAge] Filter based if the user is 18+
     * @param {number} [id] Filter based on user ID
     * @param {number} [type] {1,2,3,4,5,6,7} - Filter based on user type. Possible values:      1 (MEMBER), 2 (ORGAN), 3 (BORRELKAART), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsers(o, r, i, n, a, c, u, p) {
      return (0, t.UsersApiFp)(this.configuration).getAllUsers(o, r, i, n, a, c, u, p).then((f) => f(this.axios, this.basePath));
    }
    /**
     *  Get all users of user type
     * @param {string} userType The userType of the requested users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsersOfUserType(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getAllUsersOfUserType(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(o, r) {
      return (0, t.UsersApiFp)(this.configuration).getIndividualUser(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get an organs members
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getOrganMembers(o, r) {
      return (0, t.UsersApiFp)(this.configuration).getOrganMembers(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(o, r) {
      return (0, t.UsersApiFp)(this.configuration).getUserAuthenticatable(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(o, r) {
      return (0, t.UsersApiFp)(this.configuration).getUserRoles(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Returns the user\'s containers
     * @param {number} id The id of the user
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersContainers(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersContainers(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Get all financial mutations of a user.
     * @param {number} id The id of the user to get the mutations from
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersFinancialMutations(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersFinancialMutations(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the user\'s Points of Sale
     * @param {number} id The id of the user
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersPointsOfSale(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersPointsOfSale(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(o, r) {
      return (0, t.UsersApiFp)(this.configuration).getUsersProcessingDeposits(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get an user\'s products
     * @param {number} id The id of the user
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProducts(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersProducts(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Get an user\'s transactions (from, to or created)
     * @param {number} id The id of the user that should be involved in all returned transactions
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [createdById] User that created selected transaction
     * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
     * @param {number} [productId] Product ID for selected transactions
     * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransactions(o, r, i, n, a, c, u, p, f, P, j) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransactions(o, r, i, n, a, c, u, p, f, P, j).then((v) => v(this.axios, this.basePath));
    }
    /**
     *  Get transaction report for the given user
     * @param {number} id The id of the user to get the transaction report from
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [toId] To-user for selected transactions
     * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransactionsReport(o, r, i, n, a, c, u) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransactionsReport(o, r, i, n, a, c, u).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Get an user\'s transfers
     * @param {number} id The id of the user that should be involved in all returned transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {number} [fromId] From-user for selected transfers
     * @param {number} [toId] To-user for selected transfers
     * @param {number} [id2] ID of selected transfers
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransfers(o, r, i, n, a, c, u) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransfers(o, r, i, n, a, c, u).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Returns the user\'s updated containers
     * @param {number} id The id of the user
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersUpdatedContainers(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedContainers(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the user\'s updated Points of Sale
     * @param {number} id The id of the user
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersUpdatedPointsOfSale(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedPointsOfSale(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Get an user\'s updated products
     * @param {number} id The id of the user
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersUpdatedProducts(o, r, i, n) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedProducts(o, r, i, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update a user
     * @param {number} id The id of the user
     * @param {UpdateUserRequest} user The user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUser(o, r, i) {
      return (0, t.UsersApiFp)(this.configuration).updateUser(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(o, r) {
      return (0, t.UsersApiFp)(this.configuration).updateUserKey(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} update    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(o, r, i) {
      return (0, t.UsersApiFp)(this.configuration).updateUserLocalPassword(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} update    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(o, r, i) {
      return (0, t.UsersApiFp)(this.configuration).updateUserNfc(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} update    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(o, r, i) {
      return (0, t.UsersApiFp)(this.configuration).updateUserPin(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.UsersApi = Br;
  const vr = function(d) {
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createVatGroup", "vatGroup", o);
        const i = "/vatgroups", n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), u["Content-Type"] = "application/json", (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, d), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups: (o, r, i, n, a, c, u = {}) => s(this, void 0, void 0, function* () {
        const p = "/vatgroups", f = new URL(p, e.DUMMY_BASE_URL);
        let P;
        d && (P = d.baseOptions);
        const j = Object.assign(Object.assign({ method: "GET" }, P), u), v = {}, F = {};
        yield (0, e.setApiKeyToObject)(v, "Authorization", d), o !== void 0 && (F.vatGroupId = o), r !== void 0 && (F.name = r), i !== void 0 && (F.percentage = i), n !== void 0 && (F.deleted = n), a !== void 0 && (F.take = a), c !== void 0 && (F.skip = c), (0, e.setSearchParams)(f, F);
        let B = P && P.headers ? P.headers : {};
        return j.headers = Object.assign(Object.assign(Object.assign({}, v), B), u.headers), {
          url: (0, e.toPathString)(f),
          options: j
        };
      }),
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (o, r = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleVatGroup", "id", o);
        const i = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(o))), n = new URL(i, e.DUMMY_BASE_URL);
        let a;
        d && (a = d.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, a), r), u = {}, p = {};
        yield (0, e.setApiKeyToObject)(u, "Authorization", d), (0, e.setSearchParams)(n, p);
        let f = a && a.headers ? a.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, u), f), r.headers), {
          url: (0, e.toPathString)(n),
          options: c
        };
      }),
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", o), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", r);
        const n = "/vatgroups/declaration", a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), o !== void 0 && (f.year = o), r !== void 0 && (f.period = r), (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), {
          url: (0, e.toPathString)(a),
          options: u
        };
      }),
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup: (o, r, i = {}) => s(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateVatGroup", "id", o), (0, e.assertParamExists)("updateVatGroup", "vatGroup", r);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let c;
        d && (c = d.baseOptions);
        const u = Object.assign(Object.assign({ method: "PATCH" }, c), i), p = {}, f = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", d), p["Content-Type"] = "application/json", (0, e.setSearchParams)(a, f);
        let P = c && c.headers ? c.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, p), P), i.headers), u.data = (0, e.serializeDataIfNeeded)(r, u, d), {
          url: (0, e.toPathString)(a),
          options: u
        };
      })
    };
  };
  t.VatGroupsApiAxiosParamCreator = vr;
  const wr = function(d) {
    const o = (0, t.VatGroupsApiAxiosParamCreator)(d);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.createVatGroup(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(r, i, n, a, c, u, p) {
        return s(this, void 0, void 0, function* () {
          const f = yield o.getAllVatGroups(r, i, n, a, c, u, p);
          return (0, e.createRequestFunction)(f, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(r, i) {
        return s(this, void 0, void 0, function* () {
          const n = yield o.getSingleVatGroup(r, i);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.getVatDeclarationAmounts(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(r, i, n) {
        return s(this, void 0, void 0, function* () {
          const a = yield o.updateVatGroup(r, i, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, d);
        });
      }
    };
  };
  t.VatGroupsApiFp = wr;
  const _r = function(d, o, r) {
    const i = (0, t.VatGroupsApiFp)(d);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(n, a) {
        return i.createVatGroup(n, a).then((c) => c(r, o));
      },
      /**
       *  Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(n, a, c, u, p, f, P) {
        return i.getAllVatGroups(n, a, c, u, p, f, P).then((j) => j(r, o));
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(n, a) {
        return i.getSingleVatGroup(n, a).then((c) => c(r, o));
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(n, a, c) {
        return i.getVatDeclarationAmounts(n, a, c).then((u) => u(r, o));
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(n, a, c) {
        return i.updateVatGroup(n, a, c).then((u) => u(r, o));
      }
    };
  };
  t.VatGroupsApiFactory = _r;
  class Cr extends h.BaseAPI {
    /**
     *  Create a new VAT group
     * @param {VatGroupRequest} vatGroup The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(o, r) {
      return (0, t.VatGroupsApiFp)(this.configuration).createVatGroup(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get a list of all VAT groups
     * @param {number} [vatGroupId] ID of the VAT group
     * @param {string} [name] Name of the VAT group
     * @param {number} [percentage] VAT percentage
     * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getAllVatGroups(o, r, i, n, a, c, u) {
      return (0, t.VatGroupsApiFp)(this.configuration).getAllVatGroups(o, r, i, n, a, c, u).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(o, r) {
      return (0, t.VatGroupsApiFp)(this.configuration).getSingleVatGroup(o, r).then((i) => i(this.axios, this.basePath));
    }
    /**
     *  Get the VAT collections needed for VAT declarations
     * @param {number} year Calendar year for VAT declarations
     * @param {string} period Period for VAT declarations
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getVatDeclarationAmounts(o, r, i) {
      return (0, t.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(o, r, i).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} vatGroup The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(o, r, i) {
      return (0, t.VatGroupsApiFp)(this.configuration).updateVatGroup(o, r, i).then((n) => n(this.axios, this.basePath));
    }
  }
  t.VatGroupsApi = Cr;
})(Ht);
var Ce = {};
Object.defineProperty(Ce, "__esModule", { value: !0 });
Ce.Configuration = void 0;
class hn {
  constructor(s = {}) {
    this.apiKey = s.apiKey, this.username = s.username, this.password = s.password, this.accessToken = s.accessToken, this.basePath = s.basePath, this.baseOptions = s.baseOptions, this.formDataCtor = s.formDataCtor;
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(s) {
    const l = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return s !== null && (l.test(s) || s.toLowerCase() === "application/json-patch+json");
  }
}
Ce.Configuration = hn;
(function(t) {
  var s = Z && Z.__createBinding || (Object.create ? function(e, h, A, O) {
    O === void 0 && (O = A);
    var b = Object.getOwnPropertyDescriptor(h, A);
    (!b || ("get" in b ? !h.__esModule : b.writable || b.configurable)) && (b = { enumerable: !0, get: function() {
      return h[A];
    } }), Object.defineProperty(e, O, b);
  } : function(e, h, A, O) {
    O === void 0 && (O = A), e[O] = h[A];
  }), l = Z && Z.__exportStar || function(e, h) {
    for (var A in e)
      A !== "default" && !Object.prototype.hasOwnProperty.call(h, A) && s(h, e, A);
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), l(Ht, t), l(Ce, t);
})(I);
function tt(t) {
  this.message = t;
}
tt.prototype = new Error(), tt.prototype.name = "InvalidCharacterError";
var Et = typeof window < "u" && window.atob && window.atob.bind(window) || function(t) {
  var s = String(t).replace(/=+$/, "");
  if (s.length % 4 == 1)
    throw new tt("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var l, e, h = 0, A = 0, O = ""; e = s.charAt(A++); ~e && (l = h % 4 ? 64 * l + e : e, h++ % 4) ? O += String.fromCharCode(255 & l >> (-2 * h & 6)) : 0)
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e);
  return O;
};
function pn(t) {
  var s = t.replace(/-/g, "+").replace(/_/g, "/");
  switch (s.length % 4) {
    case 0:
      break;
    case 2:
      s += "==";
      break;
    case 3:
      s += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(l) {
      return decodeURIComponent(Et(l).replace(/(.)/g, function(e, h) {
        var A = h.charCodeAt(0).toString(16).toUpperCase();
        return A.length < 2 && (A = "0" + A), "%" + A;
      }));
    }(s);
  } catch {
    return Et(s);
  }
}
function Ve(t) {
  this.message = t;
}
function An(t, s) {
  if (typeof t != "string")
    throw new Ve("Invalid token specified");
  var l = (s = s || {}).header === !0 ? 0 : 1;
  try {
    return JSON.parse(pn(t.split(".")[l]));
  } catch (e) {
    throw new Ve("Invalid token specified: " + e.message);
  }
}
Ve.prototype = new Error(), Ve.prototype.name = "InvalidTokenError";
function ls(t, s) {
  return function() {
    return t.apply(s, arguments);
  };
}
const { toString: fn } = Object.prototype, { getPrototypeOf: pt } = Object, Le = ((t) => (s) => {
  const l = fn.call(s);
  return t[l] || (t[l] = l.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), X = (t) => (t = t.toLowerCase(), (s) => Le(s) === t), qe = (t) => (s) => typeof s === t, { isArray: oe } = Array, pe = qe("undefined");
function On(t) {
  return t !== null && !pe(t) && t.constructor !== null && !pe(t.constructor) && G(t.constructor.isBuffer) && t.constructor.isBuffer(t);
}
const ds = X("ArrayBuffer");
function Pn(t) {
  let s;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? s = ArrayBuffer.isView(t) : s = t && t.buffer && ds(t.buffer), s;
}
const bn = qe("string"), G = qe("function"), us = qe("number"), De = (t) => t !== null && typeof t == "object", mn = (t) => t === !0 || t === !1, Se = (t) => {
  if (Le(t) !== "object")
    return !1;
  const s = pt(t);
  return (s === null || s === Object.prototype || Object.getPrototypeOf(s) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
}, gn = X("Date"), yn = X("File"), Sn = X("Blob"), Un = X("FileList"), jn = (t) => De(t) && G(t.pipe), Rn = (t) => {
  let s;
  return t && (typeof FormData == "function" && t instanceof FormData || G(t.append) && ((s = Le(t)) === "formdata" || // detect form-data instance
  s === "object" && G(t.toString) && t.toString() === "[object FormData]"));
}, Tn = X("URLSearchParams"), Vn = (t) => t.trim ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Oe(t, s, { allOwnKeys: l = !1 } = {}) {
  if (t === null || typeof t > "u")
    return;
  let e, h;
  if (typeof t != "object" && (t = [t]), oe(t))
    for (e = 0, h = t.length; e < h; e++)
      s.call(null, t[e], e, t);
  else {
    const A = l ? Object.getOwnPropertyNames(t) : Object.keys(t), O = A.length;
    let b;
    for (e = 0; e < O; e++)
      b = A[e], s.call(null, t[b], b, t);
  }
}
function hs(t, s) {
  s = s.toLowerCase();
  const l = Object.keys(t);
  let e = l.length, h;
  for (; e-- > 0; )
    if (h = l[e], s === h.toLowerCase())
      return h;
  return null;
}
const ps = (() => typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global)(), As = (t) => !pe(t) && t !== ps;
function st() {
  const { caseless: t } = As(this) && this || {}, s = {}, l = (e, h) => {
    const A = t && hs(s, h) || h;
    Se(s[A]) && Se(e) ? s[A] = st(s[A], e) : Se(e) ? s[A] = st({}, e) : oe(e) ? s[A] = e.slice() : s[A] = e;
  };
  for (let e = 0, h = arguments.length; e < h; e++)
    arguments[e] && Oe(arguments[e], l);
  return s;
}
const En = (t, s, l, { allOwnKeys: e } = {}) => (Oe(s, (h, A) => {
  l && G(h) ? t[A] = ls(h, l) : t[A] = h;
}, { allOwnKeys: e }), t), Fn = (t) => (t.charCodeAt(0) === 65279 && (t = t.slice(1)), t), Bn = (t, s, l, e) => {
  t.prototype = Object.create(s.prototype, e), t.prototype.constructor = t, Object.defineProperty(t, "super", {
    value: s.prototype
  }), l && Object.assign(t.prototype, l);
}, vn = (t, s, l, e) => {
  let h, A, O;
  const b = {};
  if (s = s || {}, t == null)
    return s;
  do {
    for (h = Object.getOwnPropertyNames(t), A = h.length; A-- > 0; )
      O = h[A], (!e || e(O, t, s)) && !b[O] && (s[O] = t[O], b[O] = !0);
    t = l !== !1 && pt(t);
  } while (t && (!l || l(t, s)) && t !== Object.prototype);
  return s;
}, wn = (t, s, l) => {
  t = String(t), (l === void 0 || l > t.length) && (l = t.length), l -= s.length;
  const e = t.indexOf(s, l);
  return e !== -1 && e === l;
}, _n = (t) => {
  if (!t)
    return null;
  if (oe(t))
    return t;
  let s = t.length;
  if (!us(s))
    return null;
  const l = new Array(s);
  for (; s-- > 0; )
    l[s] = t[s];
  return l;
}, Cn = ((t) => (s) => t && s instanceof t)(typeof Uint8Array < "u" && pt(Uint8Array)), Ln = (t, s) => {
  const e = (t && t[Symbol.iterator]).call(t);
  let h;
  for (; (h = e.next()) && !h.done; ) {
    const A = h.value;
    s.call(t, A[0], A[1]);
  }
}, qn = (t, s) => {
  let l;
  const e = [];
  for (; (l = t.exec(s)) !== null; )
    e.push(l);
  return e;
}, Dn = X("HTMLFormElement"), Mn = (t) => t.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(l, e, h) {
    return e.toUpperCase() + h;
  }
), Ft = (({ hasOwnProperty: t }) => (s, l) => t.call(s, l))(Object.prototype), In = X("RegExp"), fs = (t, s) => {
  const l = Object.getOwnPropertyDescriptors(t), e = {};
  Oe(l, (h, A) => {
    s(h, A, t) !== !1 && (e[A] = h);
  }), Object.defineProperties(t, e);
}, Hn = (t) => {
  fs(t, (s, l) => {
    if (G(t) && ["arguments", "caller", "callee"].indexOf(l) !== -1)
      return !1;
    const e = t[l];
    if (G(e)) {
      if (s.enumerable = !1, "writable" in s) {
        s.writable = !1;
        return;
      }
      s.set || (s.set = () => {
        throw Error("Can not rewrite read-only method '" + l + "'");
      });
    }
  });
}, Nn = (t, s) => {
  const l = {}, e = (h) => {
    h.forEach((A) => {
      l[A] = !0;
    });
  };
  return oe(t) ? e(t) : e(String(t).split(s)), l;
}, xn = () => {
}, $n = (t, s) => (t = +t, Number.isFinite(t) ? t : s), Ke = "abcdefghijklmnopqrstuvwxyz", Bt = "0123456789", Os = {
  DIGIT: Bt,
  ALPHA: Ke,
  ALPHA_DIGIT: Ke + Ke.toUpperCase() + Bt
}, kn = (t = 16, s = Os.ALPHA_DIGIT) => {
  let l = "";
  const { length: e } = s;
  for (; t--; )
    l += s[Math.random() * e | 0];
  return l;
};
function zn(t) {
  return !!(t && G(t.append) && t[Symbol.toStringTag] === "FormData" && t[Symbol.iterator]);
}
const Kn = (t) => {
  const s = new Array(10), l = (e, h) => {
    if (De(e)) {
      if (s.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        s[h] = e;
        const A = oe(e) ? [] : {};
        return Oe(e, (O, b) => {
          const R = l(O, h + 1);
          !pe(R) && (A[b] = R);
        }), s[h] = void 0, A;
      }
    }
    return e;
  };
  return l(t, 0);
}, Gn = X("AsyncFunction"), Qn = (t) => t && (De(t) || G(t)) && G(t.then) && G(t.catch), y = {
  isArray: oe,
  isArrayBuffer: ds,
  isBuffer: On,
  isFormData: Rn,
  isArrayBufferView: Pn,
  isString: bn,
  isNumber: us,
  isBoolean: mn,
  isObject: De,
  isPlainObject: Se,
  isUndefined: pe,
  isDate: gn,
  isFile: yn,
  isBlob: Sn,
  isRegExp: In,
  isFunction: G,
  isStream: jn,
  isURLSearchParams: Tn,
  isTypedArray: Cn,
  isFileList: Un,
  forEach: Oe,
  merge: st,
  extend: En,
  trim: Vn,
  stripBOM: Fn,
  inherits: Bn,
  toFlatObject: vn,
  kindOf: Le,
  kindOfTest: X,
  endsWith: wn,
  toArray: _n,
  forEachEntry: Ln,
  matchAll: qn,
  isHTMLForm: Dn,
  hasOwnProperty: Ft,
  hasOwnProp: Ft,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: fs,
  freezeMethods: Hn,
  toObjectSet: Nn,
  toCamelCase: Mn,
  noop: xn,
  toFiniteNumber: $n,
  findKey: hs,
  global: ps,
  isContextDefined: As,
  ALPHABET: Os,
  generateString: kn,
  isSpecCompliantForm: zn,
  toJSONObject: Kn,
  isAsyncFn: Gn,
  isThenable: Qn
};
function C(t, s, l, e, h) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = t, this.name = "AxiosError", s && (this.code = s), l && (this.config = l), e && (this.request = e), h && (this.response = h);
}
y.inherits(C, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: y.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const Ps = C.prototype, bs = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((t) => {
  bs[t] = { value: t };
});
Object.defineProperties(C, bs);
Object.defineProperty(Ps, "isAxiosError", { value: !0 });
C.from = (t, s, l, e, h, A) => {
  const O = Object.create(Ps);
  return y.toFlatObject(t, O, function(R) {
    return R !== Error.prototype;
  }, (b) => b !== "isAxiosError"), C.call(O, t.message, s, l, e, h), O.cause = t, O.name = t.name, A && Object.assign(O, A), O;
};
const Yn = null;
function rt(t) {
  return y.isPlainObject(t) || y.isArray(t);
}
function ms(t) {
  return y.endsWith(t, "[]") ? t.slice(0, -2) : t;
}
function vt(t, s, l) {
  return t ? t.concat(s).map(function(h, A) {
    return h = ms(h), !l && A ? "[" + h + "]" : h;
  }).join(l ? "." : "") : s;
}
function Jn(t) {
  return y.isArray(t) && !t.some(rt);
}
const Wn = y.toFlatObject(y, {}, null, function(s) {
  return /^is[A-Z]/.test(s);
});
function Me(t, s, l) {
  if (!y.isObject(t))
    throw new TypeError("target must be an object");
  s = s || new FormData(), l = y.toFlatObject(l, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(V, M) {
    return !y.isUndefined(M[V]);
  });
  const e = l.metaTokens, h = l.visitor || g, A = l.dots, O = l.indexes, R = (l.Blob || typeof Blob < "u" && Blob) && y.isSpecCompliantForm(s);
  if (!y.isFunction(h))
    throw new TypeError("visitor must be a function");
  function m(U) {
    if (U === null)
      return "";
    if (y.isDate(U))
      return U.toISOString();
    if (!R && y.isBlob(U))
      throw new C("Blob is not supported. Use a Buffer instead.");
    return y.isArrayBuffer(U) || y.isTypedArray(U) ? R && typeof Blob == "function" ? new Blob([U]) : Buffer.from(U) : U;
  }
  function g(U, V, M) {
    let L = U;
    if (U && !M && typeof U == "object") {
      if (y.endsWith(V, "{}"))
        V = e ? V : V.slice(0, -2), U = JSON.stringify(U);
      else if (y.isArray(U) && Jn(U) || (y.isFileList(U) || y.endsWith(V, "[]")) && (L = y.toArray(U)))
        return V = ms(V), L.forEach(function(Q, ce) {
          !(y.isUndefined(Q) || Q === null) && s.append(
            // eslint-disable-next-line no-nested-ternary
            O === !0 ? vt([V], ce, A) : O === null ? V : V + "[]",
            m(Q)
          );
        }), !1;
    }
    return rt(U) ? !0 : (s.append(vt(M, V, A), m(U)), !1);
  }
  const T = [], w = Object.assign(Wn, {
    defaultVisitor: g,
    convertValue: m,
    isVisitable: rt
  });
  function E(U, V) {
    if (!y.isUndefined(U)) {
      if (T.indexOf(U) !== -1)
        throw Error("Circular reference detected in " + V.join("."));
      T.push(U), y.forEach(U, function(L, k) {
        (!(y.isUndefined(L) || L === null) && h.call(
          s,
          L,
          y.isString(k) ? k.trim() : k,
          V,
          w
        )) === !0 && E(L, V ? V.concat(k) : [k]);
      }), T.pop();
    }
  }
  if (!y.isObject(t))
    throw new TypeError("data must be an object");
  return E(t), s;
}
function wt(t) {
  const s = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(t).replace(/[!'()~]|%20|%00/g, function(e) {
    return s[e];
  });
}
function At(t, s) {
  this._pairs = [], t && Me(t, this, s);
}
const gs = At.prototype;
gs.append = function(s, l) {
  this._pairs.push([s, l]);
};
gs.toString = function(s) {
  const l = s ? function(e) {
    return s.call(this, e, wt);
  } : wt;
  return this._pairs.map(function(h) {
    return l(h[0]) + "=" + l(h[1]);
  }, "").join("&");
};
function Xn(t) {
  return encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function ys(t, s, l) {
  if (!s)
    return t;
  const e = l && l.encode || Xn, h = l && l.serialize;
  let A;
  if (h ? A = h(s, l) : A = y.isURLSearchParams(s) ? s.toString() : new At(s, l).toString(e), A) {
    const O = t.indexOf("#");
    O !== -1 && (t = t.slice(0, O)), t += (t.indexOf("?") === -1 ? "?" : "&") + A;
  }
  return t;
}
class Zn {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(s, l, e) {
    return this.handlers.push({
      fulfilled: s,
      rejected: l,
      synchronous: e ? e.synchronous : !1,
      runWhen: e ? e.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(s) {
    this.handlers[s] && (this.handlers[s] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(s) {
    y.forEach(this.handlers, function(e) {
      e !== null && s(e);
    });
  }
}
const _t = Zn, Ss = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, ei = typeof URLSearchParams < "u" ? URLSearchParams : At, ti = typeof FormData < "u" ? FormData : null, si = typeof Blob < "u" ? Blob : null, ri = (() => {
  let t;
  return typeof navigator < "u" && ((t = navigator.product) === "ReactNative" || t === "NativeScript" || t === "NS") ? !1 : typeof window < "u" && typeof document < "u";
})(), ai = (() => typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function")(), J = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ei,
    FormData: ti,
    Blob: si
  },
  isStandardBrowserEnv: ri,
  isStandardBrowserWebWorkerEnv: ai,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function ni(t, s) {
  return Me(t, new J.classes.URLSearchParams(), Object.assign({
    visitor: function(l, e, h, A) {
      return J.isNode && y.isBuffer(l) ? (this.append(e, l.toString("base64")), !1) : A.defaultVisitor.apply(this, arguments);
    }
  }, s));
}
function ii(t) {
  return y.matchAll(/\w+|\[(\w*)]/g, t).map((s) => s[0] === "[]" ? "" : s[1] || s[0]);
}
function oi(t) {
  const s = {}, l = Object.keys(t);
  let e;
  const h = l.length;
  let A;
  for (e = 0; e < h; e++)
    A = l[e], s[A] = t[A];
  return s;
}
function Us(t) {
  function s(l, e, h, A) {
    let O = l[A++];
    const b = Number.isFinite(+O), R = A >= l.length;
    return O = !O && y.isArray(h) ? h.length : O, R ? (y.hasOwnProp(h, O) ? h[O] = [h[O], e] : h[O] = e, !b) : ((!h[O] || !y.isObject(h[O])) && (h[O] = []), s(l, e, h[O], A) && y.isArray(h[O]) && (h[O] = oi(h[O])), !b);
  }
  if (y.isFormData(t) && y.isFunction(t.entries)) {
    const l = {};
    return y.forEachEntry(t, (e, h) => {
      s(ii(e), h, l, 0);
    }), l;
  }
  return null;
}
const ci = {
  "Content-Type": void 0
};
function li(t, s, l) {
  if (y.isString(t))
    try {
      return (s || JSON.parse)(t), y.trim(t);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (l || JSON.stringify)(t);
}
const Ie = {
  transitional: Ss,
  adapter: ["xhr", "http"],
  transformRequest: [function(s, l) {
    const e = l.getContentType() || "", h = e.indexOf("application/json") > -1, A = y.isObject(s);
    if (A && y.isHTMLForm(s) && (s = new FormData(s)), y.isFormData(s))
      return h && h ? JSON.stringify(Us(s)) : s;
    if (y.isArrayBuffer(s) || y.isBuffer(s) || y.isStream(s) || y.isFile(s) || y.isBlob(s))
      return s;
    if (y.isArrayBufferView(s))
      return s.buffer;
    if (y.isURLSearchParams(s))
      return l.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), s.toString();
    let b;
    if (A) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return ni(s, this.formSerializer).toString();
      if ((b = y.isFileList(s)) || e.indexOf("multipart/form-data") > -1) {
        const R = this.env && this.env.FormData;
        return Me(
          b ? { "files[]": s } : s,
          R && new R(),
          this.formSerializer
        );
      }
    }
    return A || h ? (l.setContentType("application/json", !1), li(s)) : s;
  }],
  transformResponse: [function(s) {
    const l = this.transitional || Ie.transitional, e = l && l.forcedJSONParsing, h = this.responseType === "json";
    if (s && y.isString(s) && (e && !this.responseType || h)) {
      const O = !(l && l.silentJSONParsing) && h;
      try {
        return JSON.parse(s);
      } catch (b) {
        if (O)
          throw b.name === "SyntaxError" ? C.from(b, C.ERR_BAD_RESPONSE, this, null, this.response) : b;
      }
    }
    return s;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: J.classes.FormData,
    Blob: J.classes.Blob
  },
  validateStatus: function(s) {
    return s >= 200 && s < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*"
    }
  }
};
y.forEach(["delete", "get", "head"], function(s) {
  Ie.headers[s] = {};
});
y.forEach(["post", "put", "patch"], function(s) {
  Ie.headers[s] = y.merge(ci);
});
const ft = Ie, di = y.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), ui = (t) => {
  const s = {};
  let l, e, h;
  return t && t.split(`
`).forEach(function(O) {
    h = O.indexOf(":"), l = O.substring(0, h).trim().toLowerCase(), e = O.substring(h + 1).trim(), !(!l || s[l] && di[l]) && (l === "set-cookie" ? s[l] ? s[l].push(e) : s[l] = [e] : s[l] = s[l] ? s[l] + ", " + e : e);
  }), s;
}, Ct = Symbol("internals");
function ue(t) {
  return t && String(t).trim().toLowerCase();
}
function Ue(t) {
  return t === !1 || t == null ? t : y.isArray(t) ? t.map(Ue) : String(t);
}
function hi(t) {
  const s = /* @__PURE__ */ Object.create(null), l = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = l.exec(t); )
    s[e[1]] = e[2];
  return s;
}
const pi = (t) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(t.trim());
function Ge(t, s, l, e, h) {
  if (y.isFunction(e))
    return e.call(this, s, l);
  if (h && (s = l), !!y.isString(s)) {
    if (y.isString(e))
      return s.indexOf(e) !== -1;
    if (y.isRegExp(e))
      return e.test(s);
  }
}
function Ai(t) {
  return t.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (s, l, e) => l.toUpperCase() + e);
}
function fi(t, s) {
  const l = y.toCamelCase(" " + s);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(t, e + l, {
      value: function(h, A, O) {
        return this[e].call(this, s, h, A, O);
      },
      configurable: !0
    });
  });
}
class He {
  constructor(s) {
    s && this.set(s);
  }
  set(s, l, e) {
    const h = this;
    function A(b, R, m) {
      const g = ue(R);
      if (!g)
        throw new Error("header name must be a non-empty string");
      const T = y.findKey(h, g);
      (!T || h[T] === void 0 || m === !0 || m === void 0 && h[T] !== !1) && (h[T || R] = Ue(b));
    }
    const O = (b, R) => y.forEach(b, (m, g) => A(m, g, R));
    return y.isPlainObject(s) || s instanceof this.constructor ? O(s, l) : y.isString(s) && (s = s.trim()) && !pi(s) ? O(ui(s), l) : s != null && A(l, s, e), this;
  }
  get(s, l) {
    if (s = ue(s), s) {
      const e = y.findKey(this, s);
      if (e) {
        const h = this[e];
        if (!l)
          return h;
        if (l === !0)
          return hi(h);
        if (y.isFunction(l))
          return l.call(this, h, e);
        if (y.isRegExp(l))
          return l.exec(h);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(s, l) {
    if (s = ue(s), s) {
      const e = y.findKey(this, s);
      return !!(e && this[e] !== void 0 && (!l || Ge(this, this[e], e, l)));
    }
    return !1;
  }
  delete(s, l) {
    const e = this;
    let h = !1;
    function A(O) {
      if (O = ue(O), O) {
        const b = y.findKey(e, O);
        b && (!l || Ge(e, e[b], b, l)) && (delete e[b], h = !0);
      }
    }
    return y.isArray(s) ? s.forEach(A) : A(s), h;
  }
  clear(s) {
    const l = Object.keys(this);
    let e = l.length, h = !1;
    for (; e--; ) {
      const A = l[e];
      (!s || Ge(this, this[A], A, s, !0)) && (delete this[A], h = !0);
    }
    return h;
  }
  normalize(s) {
    const l = this, e = {};
    return y.forEach(this, (h, A) => {
      const O = y.findKey(e, A);
      if (O) {
        l[O] = Ue(h), delete l[A];
        return;
      }
      const b = s ? Ai(A) : String(A).trim();
      b !== A && delete l[A], l[b] = Ue(h), e[b] = !0;
    }), this;
  }
  concat(...s) {
    return this.constructor.concat(this, ...s);
  }
  toJSON(s) {
    const l = /* @__PURE__ */ Object.create(null);
    return y.forEach(this, (e, h) => {
      e != null && e !== !1 && (l[h] = s && y.isArray(e) ? e.join(", ") : e);
    }), l;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([s, l]) => s + ": " + l).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(s) {
    return s instanceof this ? s : new this(s);
  }
  static concat(s, ...l) {
    const e = new this(s);
    return l.forEach((h) => e.set(h)), e;
  }
  static accessor(s) {
    const e = (this[Ct] = this[Ct] = {
      accessors: {}
    }).accessors, h = this.prototype;
    function A(O) {
      const b = ue(O);
      e[b] || (fi(h, O), e[b] = !0);
    }
    return y.isArray(s) ? s.forEach(A) : A(s), this;
  }
}
He.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
y.freezeMethods(He.prototype);
y.freezeMethods(He);
const te = He;
function Qe(t, s) {
  const l = this || ft, e = s || l, h = te.from(e.headers);
  let A = e.data;
  return y.forEach(t, function(b) {
    A = b.call(l, A, h.normalize(), s ? s.status : void 0);
  }), h.normalize(), A;
}
function js(t) {
  return !!(t && t.__CANCEL__);
}
function Pe(t, s, l) {
  C.call(this, t ?? "canceled", C.ERR_CANCELED, s, l), this.name = "CanceledError";
}
y.inherits(Pe, C, {
  __CANCEL__: !0
});
function Oi(t, s, l) {
  const e = l.config.validateStatus;
  !l.status || !e || e(l.status) ? t(l) : s(new C(
    "Request failed with status code " + l.status,
    [C.ERR_BAD_REQUEST, C.ERR_BAD_RESPONSE][Math.floor(l.status / 100) - 4],
    l.config,
    l.request,
    l
  ));
}
const Pi = J.isStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  function() {
    return {
      write: function(l, e, h, A, O, b) {
        const R = [];
        R.push(l + "=" + encodeURIComponent(e)), y.isNumber(h) && R.push("expires=" + new Date(h).toGMTString()), y.isString(A) && R.push("path=" + A), y.isString(O) && R.push("domain=" + O), b === !0 && R.push("secure"), document.cookie = R.join("; ");
      },
      read: function(l) {
        const e = document.cookie.match(new RegExp("(^|;\\s*)(" + l + ")=([^;]*)"));
        return e ? decodeURIComponent(e[3]) : null;
      },
      remove: function(l) {
        this.write(l, "", Date.now() - 864e5);
      }
    };
  }()
) : (
  // Non standard browser env (web workers, react-native) lack needed support.
  function() {
    return {
      write: function() {
      },
      read: function() {
        return null;
      },
      remove: function() {
      }
    };
  }()
);
function bi(t) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(t);
}
function mi(t, s) {
  return s ? t.replace(/\/+$/, "") + "/" + s.replace(/^\/+/, "") : t;
}
function Rs(t, s) {
  return t && !bi(s) ? mi(t, s) : s;
}
const gi = J.isStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const s = /(msie|trident)/i.test(navigator.userAgent), l = document.createElement("a");
    let e;
    function h(A) {
      let O = A;
      return s && (l.setAttribute("href", O), O = l.href), l.setAttribute("href", O), {
        href: l.href,
        protocol: l.protocol ? l.protocol.replace(/:$/, "") : "",
        host: l.host,
        search: l.search ? l.search.replace(/^\?/, "") : "",
        hash: l.hash ? l.hash.replace(/^#/, "") : "",
        hostname: l.hostname,
        port: l.port,
        pathname: l.pathname.charAt(0) === "/" ? l.pathname : "/" + l.pathname
      };
    }
    return e = h(window.location.href), function(O) {
      const b = y.isString(O) ? h(O) : O;
      return b.protocol === e.protocol && b.host === e.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  function() {
    return function() {
      return !0;
    };
  }()
);
function yi(t) {
  const s = /^([-+\w]{1,25})(:?\/\/|:)/.exec(t);
  return s && s[1] || "";
}
function Si(t, s) {
  t = t || 10;
  const l = new Array(t), e = new Array(t);
  let h = 0, A = 0, O;
  return s = s !== void 0 ? s : 1e3, function(R) {
    const m = Date.now(), g = e[A];
    O || (O = m), l[h] = R, e[h] = m;
    let T = A, w = 0;
    for (; T !== h; )
      w += l[T++], T = T % t;
    if (h = (h + 1) % t, h === A && (A = (A + 1) % t), m - O < s)
      return;
    const E = g && m - g;
    return E ? Math.round(w * 1e3 / E) : void 0;
  };
}
function Lt(t, s) {
  let l = 0;
  const e = Si(50, 250);
  return (h) => {
    const A = h.loaded, O = h.lengthComputable ? h.total : void 0, b = A - l, R = e(b), m = A <= O;
    l = A;
    const g = {
      loaded: A,
      total: O,
      progress: O ? A / O : void 0,
      bytes: b,
      rate: R || void 0,
      estimated: R && O && m ? (O - A) / R : void 0,
      event: h
    };
    g[s ? "download" : "upload"] = !0, t(g);
  };
}
const Ui = typeof XMLHttpRequest < "u", ji = Ui && function(t) {
  return new Promise(function(l, e) {
    let h = t.data;
    const A = te.from(t.headers).normalize(), O = t.responseType;
    let b;
    function R() {
      t.cancelToken && t.cancelToken.unsubscribe(b), t.signal && t.signal.removeEventListener("abort", b);
    }
    y.isFormData(h) && (J.isStandardBrowserEnv || J.isStandardBrowserWebWorkerEnv ? A.setContentType(!1) : A.setContentType("multipart/form-data;", !1));
    let m = new XMLHttpRequest();
    if (t.auth) {
      const E = t.auth.username || "", U = t.auth.password ? unescape(encodeURIComponent(t.auth.password)) : "";
      A.set("Authorization", "Basic " + btoa(E + ":" + U));
    }
    const g = Rs(t.baseURL, t.url);
    m.open(t.method.toUpperCase(), ys(g, t.params, t.paramsSerializer), !0), m.timeout = t.timeout;
    function T() {
      if (!m)
        return;
      const E = te.from(
        "getAllResponseHeaders" in m && m.getAllResponseHeaders()
      ), V = {
        data: !O || O === "text" || O === "json" ? m.responseText : m.response,
        status: m.status,
        statusText: m.statusText,
        headers: E,
        config: t,
        request: m
      };
      Oi(function(L) {
        l(L), R();
      }, function(L) {
        e(L), R();
      }, V), m = null;
    }
    if ("onloadend" in m ? m.onloadend = T : m.onreadystatechange = function() {
      !m || m.readyState !== 4 || m.status === 0 && !(m.responseURL && m.responseURL.indexOf("file:") === 0) || setTimeout(T);
    }, m.onabort = function() {
      m && (e(new C("Request aborted", C.ECONNABORTED, t, m)), m = null);
    }, m.onerror = function() {
      e(new C("Network Error", C.ERR_NETWORK, t, m)), m = null;
    }, m.ontimeout = function() {
      let U = t.timeout ? "timeout of " + t.timeout + "ms exceeded" : "timeout exceeded";
      const V = t.transitional || Ss;
      t.timeoutErrorMessage && (U = t.timeoutErrorMessage), e(new C(
        U,
        V.clarifyTimeoutError ? C.ETIMEDOUT : C.ECONNABORTED,
        t,
        m
      )), m = null;
    }, J.isStandardBrowserEnv) {
      const E = (t.withCredentials || gi(g)) && t.xsrfCookieName && Pi.read(t.xsrfCookieName);
      E && A.set(t.xsrfHeaderName, E);
    }
    h === void 0 && A.setContentType(null), "setRequestHeader" in m && y.forEach(A.toJSON(), function(U, V) {
      m.setRequestHeader(V, U);
    }), y.isUndefined(t.withCredentials) || (m.withCredentials = !!t.withCredentials), O && O !== "json" && (m.responseType = t.responseType), typeof t.onDownloadProgress == "function" && m.addEventListener("progress", Lt(t.onDownloadProgress, !0)), typeof t.onUploadProgress == "function" && m.upload && m.upload.addEventListener("progress", Lt(t.onUploadProgress)), (t.cancelToken || t.signal) && (b = (E) => {
      m && (e(!E || E.type ? new Pe(null, t, m) : E), m.abort(), m = null);
    }, t.cancelToken && t.cancelToken.subscribe(b), t.signal && (t.signal.aborted ? b() : t.signal.addEventListener("abort", b)));
    const w = yi(g);
    if (w && J.protocols.indexOf(w) === -1) {
      e(new C("Unsupported protocol " + w + ":", C.ERR_BAD_REQUEST, t));
      return;
    }
    m.send(h || null);
  });
}, je = {
  http: Yn,
  xhr: ji
};
y.forEach(je, (t, s) => {
  if (t) {
    try {
      Object.defineProperty(t, "name", { value: s });
    } catch {
    }
    Object.defineProperty(t, "adapterName", { value: s });
  }
});
const Ri = {
  getAdapter: (t) => {
    t = y.isArray(t) ? t : [t];
    const { length: s } = t;
    let l, e;
    for (let h = 0; h < s && (l = t[h], !(e = y.isString(l) ? je[l.toLowerCase()] : l)); h++)
      ;
    if (!e)
      throw e === !1 ? new C(
        `Adapter ${l} is not supported by the environment`,
        "ERR_NOT_SUPPORT"
      ) : new Error(
        y.hasOwnProp(je, l) ? `Adapter '${l}' is not available in the build` : `Unknown adapter '${l}'`
      );
    if (!y.isFunction(e))
      throw new TypeError("adapter is not a function");
    return e;
  },
  adapters: je
};
function Ye(t) {
  if (t.cancelToken && t.cancelToken.throwIfRequested(), t.signal && t.signal.aborted)
    throw new Pe(null, t);
}
function qt(t) {
  return Ye(t), t.headers = te.from(t.headers), t.data = Qe.call(
    t,
    t.transformRequest
  ), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Ri.getAdapter(t.adapter || ft.adapter)(t).then(function(e) {
    return Ye(t), e.data = Qe.call(
      t,
      t.transformResponse,
      e
    ), e.headers = te.from(e.headers), e;
  }, function(e) {
    return js(e) || (Ye(t), e && e.response && (e.response.data = Qe.call(
      t,
      t.transformResponse,
      e.response
    ), e.response.headers = te.from(e.response.headers))), Promise.reject(e);
  });
}
const Dt = (t) => t instanceof te ? t.toJSON() : t;
function ne(t, s) {
  s = s || {};
  const l = {};
  function e(m, g, T) {
    return y.isPlainObject(m) && y.isPlainObject(g) ? y.merge.call({ caseless: T }, m, g) : y.isPlainObject(g) ? y.merge({}, g) : y.isArray(g) ? g.slice() : g;
  }
  function h(m, g, T) {
    if (y.isUndefined(g)) {
      if (!y.isUndefined(m))
        return e(void 0, m, T);
    } else
      return e(m, g, T);
  }
  function A(m, g) {
    if (!y.isUndefined(g))
      return e(void 0, g);
  }
  function O(m, g) {
    if (y.isUndefined(g)) {
      if (!y.isUndefined(m))
        return e(void 0, m);
    } else
      return e(void 0, g);
  }
  function b(m, g, T) {
    if (T in s)
      return e(m, g);
    if (T in t)
      return e(void 0, m);
  }
  const R = {
    url: A,
    method: A,
    data: A,
    baseURL: O,
    transformRequest: O,
    transformResponse: O,
    paramsSerializer: O,
    timeout: O,
    timeoutMessage: O,
    withCredentials: O,
    adapter: O,
    responseType: O,
    xsrfCookieName: O,
    xsrfHeaderName: O,
    onUploadProgress: O,
    onDownloadProgress: O,
    decompress: O,
    maxContentLength: O,
    maxBodyLength: O,
    beforeRedirect: O,
    transport: O,
    httpAgent: O,
    httpsAgent: O,
    cancelToken: O,
    socketPath: O,
    responseEncoding: O,
    validateStatus: b,
    headers: (m, g) => h(Dt(m), Dt(g), !0)
  };
  return y.forEach(Object.keys(Object.assign({}, t, s)), function(g) {
    const T = R[g] || h, w = T(t[g], s[g], g);
    y.isUndefined(w) && T !== b || (l[g] = w);
  }), l;
}
const Ts = "1.4.0", Ot = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((t, s) => {
  Ot[t] = function(e) {
    return typeof e === t || "a" + (s < 1 ? "n " : " ") + t;
  };
});
const Mt = {};
Ot.transitional = function(s, l, e) {
  function h(A, O) {
    return "[Axios v" + Ts + "] Transitional option '" + A + "'" + O + (e ? ". " + e : "");
  }
  return (A, O, b) => {
    if (s === !1)
      throw new C(
        h(O, " has been removed" + (l ? " in " + l : "")),
        C.ERR_DEPRECATED
      );
    return l && !Mt[O] && (Mt[O] = !0, console.warn(
      h(
        O,
        " has been deprecated since v" + l + " and will be removed in the near future"
      )
    )), s ? s(A, O, b) : !0;
  };
};
function Ti(t, s, l) {
  if (typeof t != "object")
    throw new C("options must be an object", C.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(t);
  let h = e.length;
  for (; h-- > 0; ) {
    const A = e[h], O = s[A];
    if (O) {
      const b = t[A], R = b === void 0 || O(b, A, t);
      if (R !== !0)
        throw new C("option " + A + " must be " + R, C.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (l !== !0)
      throw new C("Unknown option " + A, C.ERR_BAD_OPTION);
  }
}
const at = {
  assertOptions: Ti,
  validators: Ot
}, re = at.validators;
class Ee {
  constructor(s) {
    this.defaults = s, this.interceptors = {
      request: new _t(),
      response: new _t()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  request(s, l) {
    typeof s == "string" ? (l = l || {}, l.url = s) : l = s || {}, l = ne(this.defaults, l);
    const { transitional: e, paramsSerializer: h, headers: A } = l;
    e !== void 0 && at.assertOptions(e, {
      silentJSONParsing: re.transitional(re.boolean),
      forcedJSONParsing: re.transitional(re.boolean),
      clarifyTimeoutError: re.transitional(re.boolean)
    }, !1), h != null && (y.isFunction(h) ? l.paramsSerializer = {
      serialize: h
    } : at.assertOptions(h, {
      encode: re.function,
      serialize: re.function
    }, !0)), l.method = (l.method || this.defaults.method || "get").toLowerCase();
    let O;
    O = A && y.merge(
      A.common,
      A[l.method]
    ), O && y.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (U) => {
        delete A[U];
      }
    ), l.headers = te.concat(O, A);
    const b = [];
    let R = !0;
    this.interceptors.request.forEach(function(V) {
      typeof V.runWhen == "function" && V.runWhen(l) === !1 || (R = R && V.synchronous, b.unshift(V.fulfilled, V.rejected));
    });
    const m = [];
    this.interceptors.response.forEach(function(V) {
      m.push(V.fulfilled, V.rejected);
    });
    let g, T = 0, w;
    if (!R) {
      const U = [qt.bind(this), void 0];
      for (U.unshift.apply(U, b), U.push.apply(U, m), w = U.length, g = Promise.resolve(l); T < w; )
        g = g.then(U[T++], U[T++]);
      return g;
    }
    w = b.length;
    let E = l;
    for (T = 0; T < w; ) {
      const U = b[T++], V = b[T++];
      try {
        E = U(E);
      } catch (M) {
        V.call(this, M);
        break;
      }
    }
    try {
      g = qt.call(this, E);
    } catch (U) {
      return Promise.reject(U);
    }
    for (T = 0, w = m.length; T < w; )
      g = g.then(m[T++], m[T++]);
    return g;
  }
  getUri(s) {
    s = ne(this.defaults, s);
    const l = Rs(s.baseURL, s.url);
    return ys(l, s.params, s.paramsSerializer);
  }
}
y.forEach(["delete", "get", "head", "options"], function(s) {
  Ee.prototype[s] = function(l, e) {
    return this.request(ne(e || {}, {
      method: s,
      url: l,
      data: (e || {}).data
    }));
  };
});
y.forEach(["post", "put", "patch"], function(s) {
  function l(e) {
    return function(A, O, b) {
      return this.request(ne(b || {}, {
        method: s,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: A,
        data: O
      }));
    };
  }
  Ee.prototype[s] = l(), Ee.prototype[s + "Form"] = l(!0);
});
const Re = Ee;
class Pt {
  constructor(s) {
    if (typeof s != "function")
      throw new TypeError("executor must be a function.");
    let l;
    this.promise = new Promise(function(A) {
      l = A;
    });
    const e = this;
    this.promise.then((h) => {
      if (!e._listeners)
        return;
      let A = e._listeners.length;
      for (; A-- > 0; )
        e._listeners[A](h);
      e._listeners = null;
    }), this.promise.then = (h) => {
      let A;
      const O = new Promise((b) => {
        e.subscribe(b), A = b;
      }).then(h);
      return O.cancel = function() {
        e.unsubscribe(A);
      }, O;
    }, s(function(A, O, b) {
      e.reason || (e.reason = new Pe(A, O, b), l(e.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(s) {
    if (this.reason) {
      s(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(s) : this._listeners = [s];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(s) {
    if (!this._listeners)
      return;
    const l = this._listeners.indexOf(s);
    l !== -1 && this._listeners.splice(l, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let s;
    return {
      token: new Pt(function(h) {
        s = h;
      }),
      cancel: s
    };
  }
}
const Vi = Pt;
function Ei(t) {
  return function(l) {
    return t.apply(null, l);
  };
}
function Fi(t) {
  return y.isObject(t) && t.isAxiosError === !0;
}
const nt = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(nt).forEach(([t, s]) => {
  nt[s] = t;
});
const Bi = nt;
function Vs(t) {
  const s = new Re(t), l = ls(Re.prototype.request, s);
  return y.extend(l, Re.prototype, s, { allOwnKeys: !0 }), y.extend(l, s, null, { allOwnKeys: !0 }), l.create = function(h) {
    return Vs(ne(t, h));
  }, l;
}
const $ = Vs(ft);
$.Axios = Re;
$.CanceledError = Pe;
$.CancelToken = Vi;
$.isCancel = js;
$.VERSION = Ts;
$.toFormData = Me;
$.AxiosError = C;
$.Cancel = $.CanceledError;
$.all = function(s) {
  return Promise.all(s);
};
$.spread = Ei;
$.isAxiosError = Fi;
$.mergeConfig = ne;
$.AxiosHeaders = te;
$.formToJSON = (t) => Us(y.isHTMLForm(t) ? new FormData(t) : t);
$.HttpStatusCode = Bi;
$.default = $;
const vi = $, x = vi.create();
function wi(t) {
  if (t.headers.has("Set-Authorization")) {
    const s = t.headers.get("Set-Authorization");
    s && Es(s);
  }
}
function _i() {
  localStorage.removeItem("jwt_expires"), localStorage.removeItem("jwt_token");
}
function Es(t) {
  localStorage.setItem("jwt_expires", String(Number(An(t).exp) * 1e3)), localStorage.setItem("jwt_token", t);
}
function Ci() {
  return {
    jwtToken: localStorage.getItem("jwt_token"),
    jwtExpires: localStorage.getItem("jwt_expires")
  };
}
x.interceptors.response.use((t) => (wi(t), t));
class Hi {
  constructor(s) {
    H(this, "_authenticateApi");
    H(this, "_balanceApi");
    H(this, "_usersApi");
    H(this, "_posApi");
    H(this, "_categoryApi");
    H(this, "_transactionApi");
    H(this, "_bannerApi");
    H(this, "_rootApi");
    H(this, "_borrelkaartApi");
    H(this, "_containerApi");
    H(this, "_filesApi");
    H(this, "_invoicesApi");
    H(this, "_payoutsApi");
    H(this, "_productsApi");
    H(this, "_transfersApi");
    H(this, "_vatGroupsApi");
    H(this, "_stripeApi");
    H(this, "_rbacApi");
    H(this, "_openBannerApi");
    const l = new I.Configuration({
      apiKey: () => `Bearer ${Ci().jwtToken}`
    });
    this._authenticateApi = new I.AuthenticateApi(void 0, s, x), this._balanceApi = new I.BalanceApi(l, s, x), this._usersApi = new I.UsersApi(l, s, x), this._posApi = new I.PointofsaleApi(l, s, x), this._categoryApi = new I.ProductCategoriesApi(l, s, x), this._transactionApi = new I.TransactionsApi(l, s, x), this._bannerApi = new I.BannersApi(l, s, x), this._openBannerApi = new I.BannersApi(void 0, s, x), this._rootApi = new I.RootApi(), this._borrelkaartApi = new I.BorrelkaartgroupsApi(l, s, x), this._containerApi = new I.ContainersApi(l, s, x), this._filesApi = new I.FilesApi(l, s, x), this._invoicesApi = new I.InvoicesApi(l, s, x), this._payoutsApi = new I.PayoutRequestsApi(l, s, x), this._productsApi = new I.ProductsApi(l, s, x), this._transfersApi = new I.TransfersApi(l, s, x), this._vatGroupsApi = new I.VatGroupsApi(l, s, x), this._stripeApi = new I.StripeApi(l, s, x), this._rbacApi = new I.RbacApi(l, s, x);
  }
  get authenticate() {
    return this._authenticateApi;
  }
  get balance() {
    return this._balanceApi;
  }
  get pos() {
    return this._posApi;
  }
  get category() {
    return this._categoryApi;
  }
  get transaction() {
    return this._transactionApi;
  }
  get banner() {
    return this._bannerApi;
  }
  get rootApi() {
    return this._rootApi;
  }
  get borrelkaart() {
    return this._borrelkaartApi;
  }
  get container() {
    return this._containerApi;
  }
  get files() {
    return this._filesApi;
  }
  get invoices() {
    return this._invoicesApi;
  }
  get payouts() {
    return this._payoutsApi;
  }
  get products() {
    return this._productsApi;
  }
  get transfers() {
    return this._transfersApi;
  }
  get vatGroups() {
    return this._vatGroupsApi;
  }
  get stripe() {
    return this._stripeApi;
  }
  get rbac() {
    return this._rbacApi;
  }
  get user() {
    return this._usersApi;
  }
  get openBanner() {
    return this._openBannerApi;
  }
}
const Ni = It({
  id: "auth",
  state: () => ({
    user: null,
    roles: [],
    token: null,
    organs: [],
    acceptedToS: null
  }),
  getters: {
    getToken() {
      return this.token;
    },
    getToS() {
      return this.acceptedToS;
    },
    getUser() {
      return this.user;
    }
  },
  actions: {
    handleResponse(t, s) {
      const { user: l, token: e, roles: h, organs: A, acceptedToS: O } = t;
      !l || !e || !h || !A || !O || (this.user = l, this.token = e, Es(this.token), this.roles = h, this.organs = A, this.acceptedToS = O, s.user.getIndividualUser(this.user.id).then((b) => {
        Ir().setCurrentUser(b.data);
      }));
    },
    async gewisPinlogin(t, s, l) {
      const e = {
        gewisId: parseInt(t, 10),
        pin: s
      };
      await l.authenticate.gewisPinAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async ldapLogin(t, s, l) {
      const e = {
        accountName: t,
        password: s
      };
      await l.authenticate.ldapAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async gewisWebLogin(t, s, l) {
      const e = {
        nonce: t,
        token: s
      };
      await l.authenticate.gewisWebAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async externalPinLogin(t, s, l) {
      const e = {
        pin: s,
        userId: t
      };
      await l.authenticate.pinAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async eanLogin(t, s) {
      const l = {
        eanCode: t
      };
      await s.authenticate.eanAuthentication(l).then((e) => {
        this.handleResponse(e.data, s);
      });
    },
    async apiKeyLogin(t, s, l) {
      const e = {
        key: t,
        userId: s
      };
      await l.authenticate.keyAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async gewisLdapLogin(t, s, l) {
      const e = {
        accountName: t,
        password: s
      };
      await l.authenticate.gewisLDAPAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async updateUserPin(t, s) {
      if (!this.user)
        return;
      const l = {
        pin: t
      };
      await s.user.updateUserPin(this.user.id, l);
    },
    async updateUserLocalPassword(t, s) {
      if (!this.user)
        return;
      const l = {
        password: t
      };
      await s.user.updateUserLocalPassword(this.user.id, l);
    },
    async updateUserNfc(t, s) {
      if (!this.user)
        return;
      const l = {
        nfcCode: t
      };
      await s.user.updateUserNfc(this.user.id, l);
    },
    async updateUserKey(t) {
      if (this.user)
        return (await t.user.updateUserKey(this.user.id)).data;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, this.user = null, _i();
    }
  }
});
export {
  Hi as ApiService,
  Mr as fetchAllPages,
  Ni as useAuthStore,
  Ir as useUserStore
};
