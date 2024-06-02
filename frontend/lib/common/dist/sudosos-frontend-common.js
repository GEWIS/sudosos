var Ys = Object.defineProperty;
var $s = (o, h, v) => h in o ? Ys(o, h, { enumerable: !0, configurable: !0, writable: !0, value: v }) : o[h] = v;
var k = (o, h, v) => ($s(o, typeof h != "symbol" ? h + "" : h, v), v);
import { createPinia as zs, defineStore as at } from "pinia";
async function Ks(o, h, v) {
  let e = o, O = [];
  for (; ; ) {
    const m = await v(h, e), { records: S } = m.data;
    if (O = O.concat(S), e += h, m.data._pagination.count <= e + h)
      break;
  }
  return O;
}
zs();
const rt = at("user", {
  state: () => ({
    users: [],
    current: {
      balance: null,
      user: null,
      financialMutations: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1
        },
        records: []
      }
    }
  }),
  getters: {
    getUserById: (o) => (h) => o.users.find((v) => v.id === h),
    getActiveUsers() {
      return this.users.filter((o) => o.active);
    },
    getDeletedUsers() {
      return this.users.filter((o) => o.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(o) {
      this.users = await Ks(0, 500, (h, v) => o.user.getAllUsers(h, v));
    },
    async fetchCurrentUserBalance(o, h) {
      this.current.balance = (await h.balance.getBalanceId(o)).data;
    },
    async fetchUsersFinancialMutations(o, h, v, e) {
      this.current.financialMutations = (await h.user.getUsersFinancialMutations(o, v, e)).data;
    },
    setCurrentUser(o) {
      this.current.user = o;
    },
    addUser(o) {
      this.users.push(o);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(o) {
      const h = this.users.findIndex((v) => v.id === o);
      h !== -1 && this.users.splice(h, 1);
    }
  }
});
class pe extends Error {
}
pe.prototype.name = "InvalidTokenError";
function Ws(o) {
  return decodeURIComponent(atob(o).replace(/(.)/g, (h, v) => {
    let e = v.charCodeAt(0).toString(16).toUpperCase();
    return e.length < 2 && (e = "0" + e), "%" + e;
  }));
}
function Js(o) {
  let h = o.replace(/-/g, "+").replace(/_/g, "/");
  switch (h.length % 4) {
    case 0:
      break;
    case 2:
      h += "==";
      break;
    case 3:
      h += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return Ws(h);
  } catch {
    return atob(h);
  }
}
function nt(o, h) {
  if (typeof o != "string")
    throw new pe("Invalid token specified: must be a string");
  h || (h = {});
  const v = h.header === !0 ? 0 : 1, e = o.split(".")[v];
  if (typeof e != "string")
    throw new pe(`Invalid token specified: missing part #${v + 1}`);
  let O;
  try {
    O = Js(e);
  } catch (m) {
    throw new pe(`Invalid token specified: invalid base64 for part #${v + 1} (${m.message})`);
  }
  try {
    return JSON.parse(O);
  } catch (m) {
    throw new pe(`Invalid token specified: invalid json for part #${v + 1} (${m.message})`);
  }
}
function Xs(o) {
  if (o.headers.has("Set-Authorization")) {
    const h = o.headers.get("Set-Authorization");
    h && it(h);
  }
}
function Zs() {
  localStorage.clear();
}
function ea(o) {
  const h = String(nt(o).exp);
  return { token: o, expires: h };
}
function it(o) {
  localStorage.setItem("jwt_token", JSON.stringify(ea(o)));
}
function Le() {
  const o = localStorage.getItem("jwt_token");
  let h = {};
  return o !== null && (h = JSON.parse(o)), {
    ...h
  };
}
function ta(o) {
  if (o > 1e12)
    return !0;
  const h = o * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > h;
}
function sa() {
  const o = Le();
  return !o.token || !o.expires ? !1 : !ta(Number(o.expires));
}
function Xr(o) {
  if (sa()) {
    const v = aa();
    v.extractStateFromToken();
    const e = v.getUser;
    if (e) {
      const O = rt();
      O.setCurrentUser(e), O.fetchCurrentUserBalance(e.id, o);
    }
  }
}
const aa = at({
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
    handleResponse(o, h) {
      const { user: v, token: e, roles: O, organs: m, acceptedToS: S } = o;
      !v || !e || !O || !m || !S || (this.user = v, this.token = e, it(this.token), this.roles = O, this.organs = m, this.acceptedToS = S, this.acceptedToS === "ACCEPTED" && h.user.getIndividualUser(this.user.id).then((j) => {
        rt().setCurrentUser(j.data);
      }));
    },
    async gewisPinlogin(o, h, v) {
      const e = {
        gewisId: parseInt(o, 10),
        pin: h
      };
      await v.authenticate.gewisPinAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async ldapLogin(o, h, v) {
      const e = {
        accountName: o,
        password: h
      };
      await v.authenticate.ldapAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async gewisWebLogin(o, h, v) {
      const e = {
        nonce: o,
        token: h
      };
      await v.authenticate.gewisWebAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async externalPinLogin(o, h, v) {
      const e = {
        pin: h,
        userId: o
      };
      await v.authenticate.pinAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async eanLogin(o, h) {
      const v = {
        eanCode: o
      };
      await h.authenticate.eanAuthentication(v).then((e) => {
        this.handleResponse(e.data, h);
      });
    },
    async apiKeyLogin(o, h, v) {
      const e = {
        key: o,
        userId: h
      };
      await v.authenticate.keyAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async gewisLdapLogin(o, h, v) {
      const e = {
        accountName: o,
        password: h
      };
      await v.authenticate.gewisLDAPAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async updateUserPin(o, h) {
      if (!this.user)
        return;
      const v = {
        pin: o
      };
      await h.user.updateUserPin(this.user.id, v);
    },
    async updateUserLocalPassword(o, h) {
      if (!this.user)
        return;
      const v = {
        password: o
      };
      await h.user.updateUserLocalPassword(this.user.id, v);
    },
    async updateUserNfc(o, h) {
      if (!this.user)
        return;
      const v = {
        nfcCode: o
      };
      await h.user.updateUserNfc(this.user.id, v);
    },
    async updateUserKey(o) {
      if (this.user)
        return (await o.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(o, h) {
      if (!this.user)
        return;
      const v = {
        extensiveDataProcessing: o
      };
      await h.user.acceptTos(v);
      const e = await h.authenticate.refreshToken();
      this.handleResponse(e.data, h);
    },
    extractStateFromToken() {
      const o = Le();
      if (!o.token)
        return;
      const h = nt(o.token);
      this.user = h.user, this.roles = h.roles, this.token = o.token, this.organs = h.organs, this.acceptedToS = h.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, Zs();
    }
  }
});
var le = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ra(o) {
  if (o.__esModule)
    return o;
  var h = o.default;
  if (typeof h == "function") {
    var v = function e() {
      return this instanceof e ? Reflect.construct(h, arguments, this.constructor) : h.apply(this, arguments);
    };
    v.prototype = h.prototype;
  } else
    v = {};
  return Object.defineProperty(v, "__esModule", { value: !0 }), Object.keys(o).forEach(function(e) {
    var O = Object.getOwnPropertyDescriptor(o, e);
    Object.defineProperty(v, e, O.get ? O : {
      enumerable: !0,
      get: function() {
        return o[e];
      }
    });
  }), v;
}
var H = {}, ot = {};
function lt(o, h) {
  return function() {
    return o.apply(h, arguments);
  };
}
const { toString: na } = Object.prototype, { getPrototypeOf: qe } = Object, fe = /* @__PURE__ */ ((o) => (h) => {
  const v = na.call(h);
  return o[v] || (o[v] = v.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), re = (o) => (o = o.toLowerCase(), (h) => fe(h) === o), ge = (o) => (h) => typeof h === o, { isArray: ue } = Array, Ae = ge("undefined");
function ia(o) {
  return o !== null && !Ae(o) && o.constructor !== null && !Ae(o.constructor) && Z(o.constructor.isBuffer) && o.constructor.isBuffer(o);
}
const ct = re("ArrayBuffer");
function oa(o) {
  let h;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? h = ArrayBuffer.isView(o) : h = o && o.buffer && ct(o.buffer), h;
}
const la = ge("string"), Z = ge("function"), dt = ge("number"), je = (o) => o !== null && typeof o == "object", ca = (o) => o === !0 || o === !1, Pe = (o) => {
  if (fe(o) !== "object")
    return !1;
  const h = qe(o);
  return (h === null || h === Object.prototype || Object.getPrototypeOf(h) === null) && !(Symbol.toStringTag in o) && !(Symbol.iterator in o);
}, da = re("Date"), ua = re("File"), ha = re("Blob"), pa = re("FileList"), Aa = (o) => je(o) && Z(o.pipe), va = (o) => {
  let h;
  return o && (typeof FormData == "function" && o instanceof FormData || Z(o.append) && ((h = fe(o)) === "formdata" || // detect form-data instance
  h === "object" && Z(o.toString) && o.toString() === "[object FormData]"));
}, Oa = re("URLSearchParams"), Pa = (o) => o.trim ? o.trim() : o.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function ve(o, h, { allOwnKeys: v = !1 } = {}) {
  if (o === null || typeof o > "u")
    return;
  let e, O;
  if (typeof o != "object" && (o = [o]), ue(o))
    for (e = 0, O = o.length; e < O; e++)
      h.call(null, o[e], e, o);
  else {
    const m = v ? Object.getOwnPropertyNames(o) : Object.keys(o), S = m.length;
    let j;
    for (e = 0; e < S; e++)
      j = m[e], h.call(null, o[j], j, o);
  }
}
function ut(o, h) {
  h = h.toLowerCase();
  const v = Object.keys(o);
  let e = v.length, O;
  for (; e-- > 0; )
    if (O = v[e], h === O.toLowerCase())
      return O;
  return null;
}
const ht = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, pt = (o) => !Ae(o) && o !== ht;
function Fe() {
  const { caseless: o } = pt(this) && this || {}, h = {}, v = (e, O) => {
    const m = o && ut(h, O) || O;
    Pe(h[m]) && Pe(e) ? h[m] = Fe(h[m], e) : Pe(e) ? h[m] = Fe({}, e) : ue(e) ? h[m] = e.slice() : h[m] = e;
  };
  for (let e = 0, O = arguments.length; e < O; e++)
    arguments[e] && ve(arguments[e], v);
  return h;
}
const ba = (o, h, v, { allOwnKeys: e } = {}) => (ve(h, (O, m) => {
  v && Z(O) ? o[m] = lt(O, v) : o[m] = O;
}, { allOwnKeys: e }), o), ma = (o) => (o.charCodeAt(0) === 65279 && (o = o.slice(1)), o), Sa = (o, h, v, e) => {
  o.prototype = Object.create(h.prototype, e), o.prototype.constructor = o, Object.defineProperty(o, "super", {
    value: h.prototype
  }), v && Object.assign(o.prototype, v);
}, fa = (o, h, v, e) => {
  let O, m, S;
  const j = {};
  if (h = h || {}, o == null)
    return h;
  do {
    for (O = Object.getOwnPropertyNames(o), m = O.length; m-- > 0; )
      S = O[m], (!e || e(S, o, h)) && !j[S] && (h[S] = o[S], j[S] = !0);
    o = v !== !1 && qe(o);
  } while (o && (!v || v(o, h)) && o !== Object.prototype);
  return h;
}, ga = (o, h, v) => {
  o = String(o), (v === void 0 || v > o.length) && (v = o.length), v -= h.length;
  const e = o.indexOf(h, v);
  return e !== -1 && e === v;
}, ja = (o) => {
  if (!o)
    return null;
  if (ue(o))
    return o;
  let h = o.length;
  if (!dt(h))
    return null;
  const v = new Array(h);
  for (; h-- > 0; )
    v[h] = o[h];
  return v;
}, Ua = /* @__PURE__ */ ((o) => (h) => o && h instanceof o)(typeof Uint8Array < "u" && qe(Uint8Array)), _a = (o, h) => {
  const e = (o && o[Symbol.iterator]).call(o);
  let O;
  for (; (O = e.next()) && !O.done; ) {
    const m = O.value;
    h.call(o, m[0], m[1]);
  }
}, Va = (o, h) => {
  let v;
  const e = [];
  for (; (v = o.exec(h)) !== null; )
    e.push(v);
  return e;
}, ya = re("HTMLFormElement"), Ea = (o) => o.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(v, e, O) {
    return e.toUpperCase() + O;
  }
), Ye = (({ hasOwnProperty: o }) => (h, v) => o.call(h, v))(Object.prototype), Ra = re("RegExp"), At = (o, h) => {
  const v = Object.getOwnPropertyDescriptors(o), e = {};
  ve(v, (O, m) => {
    let S;
    (S = h(O, m, o)) !== !1 && (e[m] = S || O);
  }), Object.defineProperties(o, e);
}, Ta = (o) => {
  At(o, (h, v) => {
    if (Z(o) && ["arguments", "caller", "callee"].indexOf(v) !== -1)
      return !1;
    const e = o[v];
    if (Z(e)) {
      if (h.enumerable = !1, "writable" in h) {
        h.writable = !1;
        return;
      }
      h.set || (h.set = () => {
        throw Error("Can not rewrite read-only method '" + v + "'");
      });
    }
  });
}, Ba = (o, h) => {
  const v = {}, e = (O) => {
    O.forEach((m) => {
      v[m] = !0;
    });
  };
  return ue(o) ? e(o) : e(String(o).split(h)), v;
}, Fa = () => {
}, Ca = (o, h) => (o = +o, Number.isFinite(o) ? o : h), Ee = "abcdefghijklmnopqrstuvwxyz", $e = "0123456789", vt = {
  DIGIT: $e,
  ALPHA: Ee,
  ALPHA_DIGIT: Ee + Ee.toUpperCase() + $e
}, Ia = (o = 16, h = vt.ALPHA_DIGIT) => {
  let v = "";
  const { length: e } = h;
  for (; o--; )
    v += h[Math.random() * e | 0];
  return v;
};
function Ma(o) {
  return !!(o && Z(o.append) && o[Symbol.toStringTag] === "FormData" && o[Symbol.iterator]);
}
const wa = (o) => {
  const h = new Array(10), v = (e, O) => {
    if (je(e)) {
      if (h.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        h[O] = e;
        const m = ue(e) ? [] : {};
        return ve(e, (S, j) => {
          const R = v(S, O + 1);
          !Ae(R) && (m[j] = R);
        }), h[O] = void 0, m;
      }
    }
    return e;
  };
  return v(o, 0);
}, xa = re("AsyncFunction"), La = (o) => o && (je(o) || Z(o)) && Z(o.then) && Z(o.catch), g = {
  isArray: ue,
  isArrayBuffer: ct,
  isBuffer: ia,
  isFormData: va,
  isArrayBufferView: oa,
  isString: la,
  isNumber: dt,
  isBoolean: ca,
  isObject: je,
  isPlainObject: Pe,
  isUndefined: Ae,
  isDate: da,
  isFile: ua,
  isBlob: ha,
  isRegExp: Ra,
  isFunction: Z,
  isStream: Aa,
  isURLSearchParams: Oa,
  isTypedArray: Ua,
  isFileList: pa,
  forEach: ve,
  merge: Fe,
  extend: ba,
  trim: Pa,
  stripBOM: ma,
  inherits: Sa,
  toFlatObject: fa,
  kindOf: fe,
  kindOfTest: re,
  endsWith: ga,
  toArray: ja,
  forEachEntry: _a,
  matchAll: Va,
  isHTMLForm: ya,
  hasOwnProperty: Ye,
  hasOwnProp: Ye,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: At,
  freezeMethods: Ta,
  toObjectSet: Ba,
  toCamelCase: Ea,
  noop: Fa,
  toFiniteNumber: Ca,
  findKey: ut,
  global: ht,
  isContextDefined: pt,
  ALPHABET: vt,
  generateString: Ia,
  isSpecCompliantForm: Ma,
  toJSONObject: wa,
  isAsyncFn: xa,
  isThenable: La
};
function x(o, h, v, e, O) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = o, this.name = "AxiosError", h && (this.code = h), v && (this.config = v), e && (this.request = e), O && (this.response = O);
}
g.inherits(x, Error, {
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
      config: g.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const Ot = x.prototype, Pt = {};
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
].forEach((o) => {
  Pt[o] = { value: o };
});
Object.defineProperties(x, Pt);
Object.defineProperty(Ot, "isAxiosError", { value: !0 });
x.from = (o, h, v, e, O, m) => {
  const S = Object.create(Ot);
  return g.toFlatObject(o, S, function(R) {
    return R !== Error.prototype;
  }, (j) => j !== "isAxiosError"), x.call(S, o.message, h, v, e, O), S.cause = o, S.name = o.name, m && Object.assign(S, m), S;
};
const qa = null;
function Ce(o) {
  return g.isPlainObject(o) || g.isArray(o);
}
function bt(o) {
  return g.endsWith(o, "[]") ? o.slice(0, -2) : o;
}
function ze(o, h, v) {
  return o ? o.concat(h).map(function(O, m) {
    return O = bt(O), !v && m ? "[" + O + "]" : O;
  }).join(v ? "." : "") : h;
}
function Da(o) {
  return g.isArray(o) && !o.some(Ce);
}
const Ha = g.toFlatObject(g, {}, null, function(h) {
  return /^is[A-Z]/.test(h);
});
function Ue(o, h, v) {
  if (!g.isObject(o))
    throw new TypeError("target must be an object");
  h = h || new FormData(), v = g.toFlatObject(v, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(B, $) {
    return !g.isUndefined($[B]);
  });
  const e = v.metaTokens, O = v.visitor || V, m = v.dots, S = v.indexes, R = (v.Blob || typeof Blob < "u" && Blob) && g.isSpecCompliantForm(h);
  if (!g.isFunction(O))
    throw new TypeError("visitor must be a function");
  function F(T) {
    if (T === null)
      return "";
    if (g.isDate(T))
      return T.toISOString();
    if (!R && g.isBlob(T))
      throw new x("Blob is not supported. Use a Buffer instead.");
    return g.isArrayBuffer(T) || g.isTypedArray(T) ? R && typeof Blob == "function" ? new Blob([T]) : Buffer.from(T) : T;
  }
  function V(T, B, $) {
    let K = T;
    if (T && !$ && typeof T == "object") {
      if (g.endsWith(B, "{}"))
        B = e ? B : B.slice(0, -2), T = JSON.stringify(T);
      else if (g.isArray(T) && Da(T) || (g.isFileList(T) || g.endsWith(B, "[]")) && (K = g.toArray(T)))
        return B = bt(B), K.forEach(function(se, ye) {
          !(g.isUndefined(se) || se === null) && h.append(
            // eslint-disable-next-line no-nested-ternary
            S === !0 ? ze([B], ye, m) : S === null ? B : B + "[]",
            F(se)
          );
        }), !1;
    }
    return Ce(T) ? !0 : (h.append(ze($, B, m), F(T)), !1);
  }
  const _ = [], Q = Object.assign(Ha, {
    defaultVisitor: V,
    convertValue: F,
    isVisitable: Ce
  });
  function J(T, B) {
    if (!g.isUndefined(T)) {
      if (_.indexOf(T) !== -1)
        throw Error("Circular reference detected in " + B.join("."));
      _.push(T), g.forEach(T, function(K, te) {
        (!(g.isUndefined(K) || K === null) && O.call(
          h,
          K,
          g.isString(te) ? te.trim() : te,
          B,
          Q
        )) === !0 && J(K, B ? B.concat(te) : [te]);
      }), _.pop();
    }
  }
  if (!g.isObject(o))
    throw new TypeError("data must be an object");
  return J(o), h;
}
function Ke(o) {
  const h = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(o).replace(/[!'()~]|%20|%00/g, function(e) {
    return h[e];
  });
}
function De(o, h) {
  this._pairs = [], o && Ue(o, this, h);
}
const mt = De.prototype;
mt.append = function(h, v) {
  this._pairs.push([h, v]);
};
mt.toString = function(h) {
  const v = h ? function(e) {
    return h.call(this, e, Ke);
  } : Ke;
  return this._pairs.map(function(O) {
    return v(O[0]) + "=" + v(O[1]);
  }, "").join("&");
};
function Na(o) {
  return encodeURIComponent(o).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function St(o, h, v) {
  if (!h)
    return o;
  const e = v && v.encode || Na, O = v && v.serialize;
  let m;
  if (O ? m = O(h, v) : m = g.isURLSearchParams(h) ? h.toString() : new De(h, v).toString(e), m) {
    const S = o.indexOf("#");
    S !== -1 && (o = o.slice(0, S)), o += (o.indexOf("?") === -1 ? "?" : "&") + m;
  }
  return o;
}
class We {
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
  use(h, v, e) {
    return this.handlers.push({
      fulfilled: h,
      rejected: v,
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
  eject(h) {
    this.handlers[h] && (this.handlers[h] = null);
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
  forEach(h) {
    g.forEach(this.handlers, function(e) {
      e !== null && h(e);
    });
  }
}
const ft = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, Ga = typeof URLSearchParams < "u" ? URLSearchParams : De, ka = typeof FormData < "u" ? FormData : null, Qa = typeof Blob < "u" ? Blob : null, Ya = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ga,
    FormData: ka,
    Blob: Qa
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, gt = typeof window < "u" && typeof document < "u", $a = ((o) => gt && ["ReactNative", "NativeScript", "NS"].indexOf(o) < 0)(typeof navigator < "u" && navigator.product), za = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Ka = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: gt,
  hasStandardBrowserEnv: $a,
  hasStandardBrowserWebWorkerEnv: za
}, Symbol.toStringTag, { value: "Module" })), ae = {
  ...Ka,
  ...Ya
};
function Wa(o, h) {
  return Ue(o, new ae.classes.URLSearchParams(), Object.assign({
    visitor: function(v, e, O, m) {
      return ae.isNode && g.isBuffer(v) ? (this.append(e, v.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments);
    }
  }, h));
}
function Ja(o) {
  return g.matchAll(/\w+|\[(\w*)]/g, o).map((h) => h[0] === "[]" ? "" : h[1] || h[0]);
}
function Xa(o) {
  const h = {}, v = Object.keys(o);
  let e;
  const O = v.length;
  let m;
  for (e = 0; e < O; e++)
    m = v[e], h[m] = o[m];
  return h;
}
function jt(o) {
  function h(v, e, O, m) {
    let S = v[m++];
    if (S === "__proto__")
      return !0;
    const j = Number.isFinite(+S), R = m >= v.length;
    return S = !S && g.isArray(O) ? O.length : S, R ? (g.hasOwnProp(O, S) ? O[S] = [O[S], e] : O[S] = e, !j) : ((!O[S] || !g.isObject(O[S])) && (O[S] = []), h(v, e, O[S], m) && g.isArray(O[S]) && (O[S] = Xa(O[S])), !j);
  }
  if (g.isFormData(o) && g.isFunction(o.entries)) {
    const v = {};
    return g.forEachEntry(o, (e, O) => {
      h(Ja(e), O, v, 0);
    }), v;
  }
  return null;
}
function Za(o, h, v) {
  if (g.isString(o))
    try {
      return (h || JSON.parse)(o), g.trim(o);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (v || JSON.stringify)(o);
}
const He = {
  transitional: ft,
  adapter: ["xhr", "http"],
  transformRequest: [function(h, v) {
    const e = v.getContentType() || "", O = e.indexOf("application/json") > -1, m = g.isObject(h);
    if (m && g.isHTMLForm(h) && (h = new FormData(h)), g.isFormData(h))
      return O ? JSON.stringify(jt(h)) : h;
    if (g.isArrayBuffer(h) || g.isBuffer(h) || g.isStream(h) || g.isFile(h) || g.isBlob(h))
      return h;
    if (g.isArrayBufferView(h))
      return h.buffer;
    if (g.isURLSearchParams(h))
      return v.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), h.toString();
    let j;
    if (m) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return Wa(h, this.formSerializer).toString();
      if ((j = g.isFileList(h)) || e.indexOf("multipart/form-data") > -1) {
        const R = this.env && this.env.FormData;
        return Ue(
          j ? { "files[]": h } : h,
          R && new R(),
          this.formSerializer
        );
      }
    }
    return m || O ? (v.setContentType("application/json", !1), Za(h)) : h;
  }],
  transformResponse: [function(h) {
    const v = this.transitional || He.transitional, e = v && v.forcedJSONParsing, O = this.responseType === "json";
    if (h && g.isString(h) && (e && !this.responseType || O)) {
      const S = !(v && v.silentJSONParsing) && O;
      try {
        return JSON.parse(h);
      } catch (j) {
        if (S)
          throw j.name === "SyntaxError" ? x.from(j, x.ERR_BAD_RESPONSE, this, null, this.response) : j;
      }
    }
    return h;
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
    FormData: ae.classes.FormData,
    Blob: ae.classes.Blob
  },
  validateStatus: function(h) {
    return h >= 200 && h < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
g.forEach(["delete", "get", "head", "post", "put", "patch"], (o) => {
  He.headers[o] = {};
});
const Ne = He, er = g.toObjectSet([
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
]), tr = (o) => {
  const h = {};
  let v, e, O;
  return o && o.split(`
`).forEach(function(S) {
    O = S.indexOf(":"), v = S.substring(0, O).trim().toLowerCase(), e = S.substring(O + 1).trim(), !(!v || h[v] && er[v]) && (v === "set-cookie" ? h[v] ? h[v].push(e) : h[v] = [e] : h[v] = h[v] ? h[v] + ", " + e : e);
  }), h;
}, Je = Symbol("internals");
function he(o) {
  return o && String(o).trim().toLowerCase();
}
function be(o) {
  return o === !1 || o == null ? o : g.isArray(o) ? o.map(be) : String(o);
}
function sr(o) {
  const h = /* @__PURE__ */ Object.create(null), v = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = v.exec(o); )
    h[e[1]] = e[2];
  return h;
}
const ar = (o) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(o.trim());
function Re(o, h, v, e, O) {
  if (g.isFunction(e))
    return e.call(this, h, v);
  if (O && (h = v), !!g.isString(h)) {
    if (g.isString(e))
      return h.indexOf(e) !== -1;
    if (g.isRegExp(e))
      return e.test(h);
  }
}
function rr(o) {
  return o.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (h, v, e) => v.toUpperCase() + e);
}
function nr(o, h) {
  const v = g.toCamelCase(" " + h);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(o, e + v, {
      value: function(O, m, S) {
        return this[e].call(this, h, O, m, S);
      },
      configurable: !0
    });
  });
}
let _e = class {
  constructor(h) {
    h && this.set(h);
  }
  set(h, v, e) {
    const O = this;
    function m(j, R, F) {
      const V = he(R);
      if (!V)
        throw new Error("header name must be a non-empty string");
      const _ = g.findKey(O, V);
      (!_ || O[_] === void 0 || F === !0 || F === void 0 && O[_] !== !1) && (O[_ || R] = be(j));
    }
    const S = (j, R) => g.forEach(j, (F, V) => m(F, V, R));
    return g.isPlainObject(h) || h instanceof this.constructor ? S(h, v) : g.isString(h) && (h = h.trim()) && !ar(h) ? S(tr(h), v) : h != null && m(v, h, e), this;
  }
  get(h, v) {
    if (h = he(h), h) {
      const e = g.findKey(this, h);
      if (e) {
        const O = this[e];
        if (!v)
          return O;
        if (v === !0)
          return sr(O);
        if (g.isFunction(v))
          return v.call(this, O, e);
        if (g.isRegExp(v))
          return v.exec(O);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(h, v) {
    if (h = he(h), h) {
      const e = g.findKey(this, h);
      return !!(e && this[e] !== void 0 && (!v || Re(this, this[e], e, v)));
    }
    return !1;
  }
  delete(h, v) {
    const e = this;
    let O = !1;
    function m(S) {
      if (S = he(S), S) {
        const j = g.findKey(e, S);
        j && (!v || Re(e, e[j], j, v)) && (delete e[j], O = !0);
      }
    }
    return g.isArray(h) ? h.forEach(m) : m(h), O;
  }
  clear(h) {
    const v = Object.keys(this);
    let e = v.length, O = !1;
    for (; e--; ) {
      const m = v[e];
      (!h || Re(this, this[m], m, h, !0)) && (delete this[m], O = !0);
    }
    return O;
  }
  normalize(h) {
    const v = this, e = {};
    return g.forEach(this, (O, m) => {
      const S = g.findKey(e, m);
      if (S) {
        v[S] = be(O), delete v[m];
        return;
      }
      const j = h ? rr(m) : String(m).trim();
      j !== m && delete v[m], v[j] = be(O), e[j] = !0;
    }), this;
  }
  concat(...h) {
    return this.constructor.concat(this, ...h);
  }
  toJSON(h) {
    const v = /* @__PURE__ */ Object.create(null);
    return g.forEach(this, (e, O) => {
      e != null && e !== !1 && (v[O] = h && g.isArray(e) ? e.join(", ") : e);
    }), v;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([h, v]) => h + ": " + v).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(h) {
    return h instanceof this ? h : new this(h);
  }
  static concat(h, ...v) {
    const e = new this(h);
    return v.forEach((O) => e.set(O)), e;
  }
  static accessor(h) {
    const e = (this[Je] = this[Je] = {
      accessors: {}
    }).accessors, O = this.prototype;
    function m(S) {
      const j = he(S);
      e[j] || (nr(O, S), e[j] = !0);
    }
    return g.isArray(h) ? h.forEach(m) : m(h), this;
  }
};
_e.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
g.reduceDescriptors(_e.prototype, ({ value: o }, h) => {
  let v = h[0].toUpperCase() + h.slice(1);
  return {
    get: () => o,
    set(e) {
      this[v] = e;
    }
  };
});
g.freezeMethods(_e);
const ne = _e;
function Te(o, h) {
  const v = this || Ne, e = h || v, O = ne.from(e.headers);
  let m = e.data;
  return g.forEach(o, function(j) {
    m = j.call(v, m, O.normalize(), h ? h.status : void 0);
  }), O.normalize(), m;
}
function Ut(o) {
  return !!(o && o.__CANCEL__);
}
function Oe(o, h, v) {
  x.call(this, o ?? "canceled", x.ERR_CANCELED, h, v), this.name = "CanceledError";
}
g.inherits(Oe, x, {
  __CANCEL__: !0
});
function ir(o, h, v) {
  const e = v.config.validateStatus;
  !v.status || !e || e(v.status) ? o(v) : h(new x(
    "Request failed with status code " + v.status,
    [x.ERR_BAD_REQUEST, x.ERR_BAD_RESPONSE][Math.floor(v.status / 100) - 4],
    v.config,
    v.request,
    v
  ));
}
const or = ae.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(o, h, v, e, O, m) {
      const S = [o + "=" + encodeURIComponent(h)];
      g.isNumber(v) && S.push("expires=" + new Date(v).toGMTString()), g.isString(e) && S.push("path=" + e), g.isString(O) && S.push("domain=" + O), m === !0 && S.push("secure"), document.cookie = S.join("; ");
    },
    read(o) {
      const h = document.cookie.match(new RegExp("(^|;\\s*)(" + o + ")=([^;]*)"));
      return h ? decodeURIComponent(h[3]) : null;
    },
    remove(o) {
      this.write(o, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function lr(o) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(o);
}
function cr(o, h) {
  return h ? o.replace(/\/?\/$/, "") + "/" + h.replace(/^\/+/, "") : o;
}
function _t(o, h) {
  return o && !lr(h) ? cr(o, h) : h;
}
const dr = ae.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const h = /(msie|trident)/i.test(navigator.userAgent), v = document.createElement("a");
    let e;
    function O(m) {
      let S = m;
      return h && (v.setAttribute("href", S), S = v.href), v.setAttribute("href", S), {
        href: v.href,
        protocol: v.protocol ? v.protocol.replace(/:$/, "") : "",
        host: v.host,
        search: v.search ? v.search.replace(/^\?/, "") : "",
        hash: v.hash ? v.hash.replace(/^#/, "") : "",
        hostname: v.hostname,
        port: v.port,
        pathname: v.pathname.charAt(0) === "/" ? v.pathname : "/" + v.pathname
      };
    }
    return e = O(window.location.href), function(S) {
      const j = g.isString(S) ? O(S) : S;
      return j.protocol === e.protocol && j.host === e.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  /* @__PURE__ */ function() {
    return function() {
      return !0;
    };
  }()
);
function ur(o) {
  const h = /^([-+\w]{1,25})(:?\/\/|:)/.exec(o);
  return h && h[1] || "";
}
function hr(o, h) {
  o = o || 10;
  const v = new Array(o), e = new Array(o);
  let O = 0, m = 0, S;
  return h = h !== void 0 ? h : 1e3, function(R) {
    const F = Date.now(), V = e[m];
    S || (S = F), v[O] = R, e[O] = F;
    let _ = m, Q = 0;
    for (; _ !== O; )
      Q += v[_++], _ = _ % o;
    if (O = (O + 1) % o, O === m && (m = (m + 1) % o), F - S < h)
      return;
    const J = V && F - V;
    return J ? Math.round(Q * 1e3 / J) : void 0;
  };
}
function Xe(o, h) {
  let v = 0;
  const e = hr(50, 250);
  return (O) => {
    const m = O.loaded, S = O.lengthComputable ? O.total : void 0, j = m - v, R = e(j), F = m <= S;
    v = m;
    const V = {
      loaded: m,
      total: S,
      progress: S ? m / S : void 0,
      bytes: j,
      rate: R || void 0,
      estimated: R && S && F ? (S - m) / R : void 0,
      event: O
    };
    V[h ? "download" : "upload"] = !0, o(V);
  };
}
const pr = typeof XMLHttpRequest < "u", Ar = pr && function(o) {
  return new Promise(function(v, e) {
    let O = o.data;
    const m = ne.from(o.headers).normalize();
    let { responseType: S, withXSRFToken: j } = o, R;
    function F() {
      o.cancelToken && o.cancelToken.unsubscribe(R), o.signal && o.signal.removeEventListener("abort", R);
    }
    let V;
    if (g.isFormData(O)) {
      if (ae.hasStandardBrowserEnv || ae.hasStandardBrowserWebWorkerEnv)
        m.setContentType(!1);
      else if ((V = m.getContentType()) !== !1) {
        const [B, ...$] = V ? V.split(";").map((K) => K.trim()).filter(Boolean) : [];
        m.setContentType([B || "multipart/form-data", ...$].join("; "));
      }
    }
    let _ = new XMLHttpRequest();
    if (o.auth) {
      const B = o.auth.username || "", $ = o.auth.password ? unescape(encodeURIComponent(o.auth.password)) : "";
      m.set("Authorization", "Basic " + btoa(B + ":" + $));
    }
    const Q = _t(o.baseURL, o.url);
    _.open(o.method.toUpperCase(), St(Q, o.params, o.paramsSerializer), !0), _.timeout = o.timeout;
    function J() {
      if (!_)
        return;
      const B = ne.from(
        "getAllResponseHeaders" in _ && _.getAllResponseHeaders()
      ), K = {
        data: !S || S === "text" || S === "json" ? _.responseText : _.response,
        status: _.status,
        statusText: _.statusText,
        headers: B,
        config: o,
        request: _
      };
      ir(function(se) {
        v(se), F();
      }, function(se) {
        e(se), F();
      }, K), _ = null;
    }
    if ("onloadend" in _ ? _.onloadend = J : _.onreadystatechange = function() {
      !_ || _.readyState !== 4 || _.status === 0 && !(_.responseURL && _.responseURL.indexOf("file:") === 0) || setTimeout(J);
    }, _.onabort = function() {
      _ && (e(new x("Request aborted", x.ECONNABORTED, o, _)), _ = null);
    }, _.onerror = function() {
      e(new x("Network Error", x.ERR_NETWORK, o, _)), _ = null;
    }, _.ontimeout = function() {
      let $ = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const K = o.transitional || ft;
      o.timeoutErrorMessage && ($ = o.timeoutErrorMessage), e(new x(
        $,
        K.clarifyTimeoutError ? x.ETIMEDOUT : x.ECONNABORTED,
        o,
        _
      )), _ = null;
    }, ae.hasStandardBrowserEnv && (j && g.isFunction(j) && (j = j(o)), j || j !== !1 && dr(Q))) {
      const B = o.xsrfHeaderName && o.xsrfCookieName && or.read(o.xsrfCookieName);
      B && m.set(o.xsrfHeaderName, B);
    }
    O === void 0 && m.setContentType(null), "setRequestHeader" in _ && g.forEach(m.toJSON(), function($, K) {
      _.setRequestHeader(K, $);
    }), g.isUndefined(o.withCredentials) || (_.withCredentials = !!o.withCredentials), S && S !== "json" && (_.responseType = o.responseType), typeof o.onDownloadProgress == "function" && _.addEventListener("progress", Xe(o.onDownloadProgress, !0)), typeof o.onUploadProgress == "function" && _.upload && _.upload.addEventListener("progress", Xe(o.onUploadProgress)), (o.cancelToken || o.signal) && (R = (B) => {
      _ && (e(!B || B.type ? new Oe(null, o, _) : B), _.abort(), _ = null);
    }, o.cancelToken && o.cancelToken.subscribe(R), o.signal && (o.signal.aborted ? R() : o.signal.addEventListener("abort", R)));
    const T = ur(Q);
    if (T && ae.protocols.indexOf(T) === -1) {
      e(new x("Unsupported protocol " + T + ":", x.ERR_BAD_REQUEST, o));
      return;
    }
    _.send(O || null);
  });
}, Ie = {
  http: qa,
  xhr: Ar
};
g.forEach(Ie, (o, h) => {
  if (o) {
    try {
      Object.defineProperty(o, "name", { value: h });
    } catch {
    }
    Object.defineProperty(o, "adapterName", { value: h });
  }
});
const Ze = (o) => `- ${o}`, vr = (o) => g.isFunction(o) || o === null || o === !1, Vt = {
  getAdapter: (o) => {
    o = g.isArray(o) ? o : [o];
    const { length: h } = o;
    let v, e;
    const O = {};
    for (let m = 0; m < h; m++) {
      v = o[m];
      let S;
      if (e = v, !vr(v) && (e = Ie[(S = String(v)).toLowerCase()], e === void 0))
        throw new x(`Unknown adapter '${S}'`);
      if (e)
        break;
      O[S || "#" + m] = e;
    }
    if (!e) {
      const m = Object.entries(O).map(
        ([j, R]) => `adapter ${j} ` + (R === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let S = h ? m.length > 1 ? `since :
` + m.map(Ze).join(`
`) : " " + Ze(m[0]) : "as no adapter specified";
      throw new x(
        "There is no suitable adapter to dispatch the request " + S,
        "ERR_NOT_SUPPORT"
      );
    }
    return e;
  },
  adapters: Ie
};
function Be(o) {
  if (o.cancelToken && o.cancelToken.throwIfRequested(), o.signal && o.signal.aborted)
    throw new Oe(null, o);
}
function et(o) {
  return Be(o), o.headers = ne.from(o.headers), o.data = Te.call(
    o,
    o.transformRequest
  ), ["post", "put", "patch"].indexOf(o.method) !== -1 && o.headers.setContentType("application/x-www-form-urlencoded", !1), Vt.getAdapter(o.adapter || Ne.adapter)(o).then(function(e) {
    return Be(o), e.data = Te.call(
      o,
      o.transformResponse,
      e
    ), e.headers = ne.from(e.headers), e;
  }, function(e) {
    return Ut(e) || (Be(o), e && e.response && (e.response.data = Te.call(
      o,
      o.transformResponse,
      e.response
    ), e.response.headers = ne.from(e.response.headers))), Promise.reject(e);
  });
}
const tt = (o) => o instanceof ne ? { ...o } : o;
function de(o, h) {
  h = h || {};
  const v = {};
  function e(F, V, _) {
    return g.isPlainObject(F) && g.isPlainObject(V) ? g.merge.call({ caseless: _ }, F, V) : g.isPlainObject(V) ? g.merge({}, V) : g.isArray(V) ? V.slice() : V;
  }
  function O(F, V, _) {
    if (g.isUndefined(V)) {
      if (!g.isUndefined(F))
        return e(void 0, F, _);
    } else
      return e(F, V, _);
  }
  function m(F, V) {
    if (!g.isUndefined(V))
      return e(void 0, V);
  }
  function S(F, V) {
    if (g.isUndefined(V)) {
      if (!g.isUndefined(F))
        return e(void 0, F);
    } else
      return e(void 0, V);
  }
  function j(F, V, _) {
    if (_ in h)
      return e(F, V);
    if (_ in o)
      return e(void 0, F);
  }
  const R = {
    url: m,
    method: m,
    data: m,
    baseURL: S,
    transformRequest: S,
    transformResponse: S,
    paramsSerializer: S,
    timeout: S,
    timeoutMessage: S,
    withCredentials: S,
    withXSRFToken: S,
    adapter: S,
    responseType: S,
    xsrfCookieName: S,
    xsrfHeaderName: S,
    onUploadProgress: S,
    onDownloadProgress: S,
    decompress: S,
    maxContentLength: S,
    maxBodyLength: S,
    beforeRedirect: S,
    transport: S,
    httpAgent: S,
    httpsAgent: S,
    cancelToken: S,
    socketPath: S,
    responseEncoding: S,
    validateStatus: j,
    headers: (F, V) => O(tt(F), tt(V), !0)
  };
  return g.forEach(Object.keys(Object.assign({}, o, h)), function(V) {
    const _ = R[V] || O, Q = _(o[V], h[V], V);
    g.isUndefined(Q) && _ !== j || (v[V] = Q);
  }), v;
}
const yt = "1.6.8", Ge = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((o, h) => {
  Ge[o] = function(e) {
    return typeof e === o || "a" + (h < 1 ? "n " : " ") + o;
  };
});
const st = {};
Ge.transitional = function(h, v, e) {
  function O(m, S) {
    return "[Axios v" + yt + "] Transitional option '" + m + "'" + S + (e ? ". " + e : "");
  }
  return (m, S, j) => {
    if (h === !1)
      throw new x(
        O(S, " has been removed" + (v ? " in " + v : "")),
        x.ERR_DEPRECATED
      );
    return v && !st[S] && (st[S] = !0, console.warn(
      O(
        S,
        " has been deprecated since v" + v + " and will be removed in the near future"
      )
    )), h ? h(m, S, j) : !0;
  };
};
function Or(o, h, v) {
  if (typeof o != "object")
    throw new x("options must be an object", x.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(o);
  let O = e.length;
  for (; O-- > 0; ) {
    const m = e[O], S = h[m];
    if (S) {
      const j = o[m], R = j === void 0 || S(j, m, o);
      if (R !== !0)
        throw new x("option " + m + " must be " + R, x.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (v !== !0)
      throw new x("Unknown option " + m, x.ERR_BAD_OPTION);
  }
}
const Me = {
  assertOptions: Or,
  validators: Ge
}, oe = Me.validators;
let Se = class {
  constructor(h) {
    this.defaults = h, this.interceptors = {
      request: new We(),
      response: new We()
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
  async request(h, v) {
    try {
      return await this._request(h, v);
    } catch (e) {
      if (e instanceof Error) {
        let O;
        Error.captureStackTrace ? Error.captureStackTrace(O = {}) : O = new Error();
        const m = O.stack ? O.stack.replace(/^.+\n/, "") : "";
        e.stack ? m && !String(e.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (e.stack += `
` + m) : e.stack = m;
      }
      throw e;
    }
  }
  _request(h, v) {
    typeof h == "string" ? (v = v || {}, v.url = h) : v = h || {}, v = de(this.defaults, v);
    const { transitional: e, paramsSerializer: O, headers: m } = v;
    e !== void 0 && Me.assertOptions(e, {
      silentJSONParsing: oe.transitional(oe.boolean),
      forcedJSONParsing: oe.transitional(oe.boolean),
      clarifyTimeoutError: oe.transitional(oe.boolean)
    }, !1), O != null && (g.isFunction(O) ? v.paramsSerializer = {
      serialize: O
    } : Me.assertOptions(O, {
      encode: oe.function,
      serialize: oe.function
    }, !0)), v.method = (v.method || this.defaults.method || "get").toLowerCase();
    let S = m && g.merge(
      m.common,
      m[v.method]
    );
    m && g.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (T) => {
        delete m[T];
      }
    ), v.headers = ne.concat(S, m);
    const j = [];
    let R = !0;
    this.interceptors.request.forEach(function(B) {
      typeof B.runWhen == "function" && B.runWhen(v) === !1 || (R = R && B.synchronous, j.unshift(B.fulfilled, B.rejected));
    });
    const F = [];
    this.interceptors.response.forEach(function(B) {
      F.push(B.fulfilled, B.rejected);
    });
    let V, _ = 0, Q;
    if (!R) {
      const T = [et.bind(this), void 0];
      for (T.unshift.apply(T, j), T.push.apply(T, F), Q = T.length, V = Promise.resolve(v); _ < Q; )
        V = V.then(T[_++], T[_++]);
      return V;
    }
    Q = j.length;
    let J = v;
    for (_ = 0; _ < Q; ) {
      const T = j[_++], B = j[_++];
      try {
        J = T(J);
      } catch ($) {
        B.call(this, $);
        break;
      }
    }
    try {
      V = et.call(this, J);
    } catch (T) {
      return Promise.reject(T);
    }
    for (_ = 0, Q = F.length; _ < Q; )
      V = V.then(F[_++], F[_++]);
    return V;
  }
  getUri(h) {
    h = de(this.defaults, h);
    const v = _t(h.baseURL, h.url);
    return St(v, h.params, h.paramsSerializer);
  }
};
g.forEach(["delete", "get", "head", "options"], function(h) {
  Se.prototype[h] = function(v, e) {
    return this.request(de(e || {}, {
      method: h,
      url: v,
      data: (e || {}).data
    }));
  };
});
g.forEach(["post", "put", "patch"], function(h) {
  function v(e) {
    return function(m, S, j) {
      return this.request(de(j || {}, {
        method: h,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: m,
        data: S
      }));
    };
  }
  Se.prototype[h] = v(), Se.prototype[h + "Form"] = v(!0);
});
const me = Se;
let Pr = class Et {
  constructor(h) {
    if (typeof h != "function")
      throw new TypeError("executor must be a function.");
    let v;
    this.promise = new Promise(function(m) {
      v = m;
    });
    const e = this;
    this.promise.then((O) => {
      if (!e._listeners)
        return;
      let m = e._listeners.length;
      for (; m-- > 0; )
        e._listeners[m](O);
      e._listeners = null;
    }), this.promise.then = (O) => {
      let m;
      const S = new Promise((j) => {
        e.subscribe(j), m = j;
      }).then(O);
      return S.cancel = function() {
        e.unsubscribe(m);
      }, S;
    }, h(function(m, S, j) {
      e.reason || (e.reason = new Oe(m, S, j), v(e.reason));
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
  subscribe(h) {
    if (this.reason) {
      h(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(h) : this._listeners = [h];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(h) {
    if (!this._listeners)
      return;
    const v = this._listeners.indexOf(h);
    v !== -1 && this._listeners.splice(v, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let h;
    return {
      token: new Et(function(O) {
        h = O;
      }),
      cancel: h
    };
  }
};
const br = Pr;
function mr(o) {
  return function(v) {
    return o.apply(null, v);
  };
}
function Sr(o) {
  return g.isObject(o) && o.isAxiosError === !0;
}
const we = {
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
Object.entries(we).forEach(([o, h]) => {
  we[h] = o;
});
const fr = we;
function Rt(o) {
  const h = new me(o), v = lt(me.prototype.request, h);
  return g.extend(v, me.prototype, h, { allOwnKeys: !0 }), g.extend(v, h, null, { allOwnKeys: !0 }), v.create = function(O) {
    return Rt(de(o, O));
  }, v;
}
const G = Rt(Ne);
G.Axios = me;
G.CanceledError = Oe;
G.CancelToken = br;
G.isCancel = Ut;
G.VERSION = yt;
G.toFormData = Ue;
G.AxiosError = x;
G.Cancel = G.CanceledError;
G.all = function(h) {
  return Promise.all(h);
};
G.spread = mr;
G.isAxiosError = Sr;
G.mergeConfig = de;
G.AxiosHeaders = ne;
G.formToJSON = (o) => jt(g.isHTMLForm(o) ? new FormData(o) : o);
G.getAdapter = Vt.getAdapter;
G.HttpStatusCode = fr;
G.default = G;
const {
  Axios: gr,
  AxiosError: jr,
  CanceledError: Ur,
  isCancel: _r,
  CancelToken: Vr,
  VERSION: yr,
  all: Er,
  Cancel: Rr,
  isAxiosError: Tr,
  spread: Br,
  toFormData: Fr,
  AxiosHeaders: Cr,
  HttpStatusCode: Ir,
  formToJSON: Mr,
  getAdapter: wr,
  mergeConfig: xr
} = G, Lr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: gr,
  AxiosError: jr,
  AxiosHeaders: Cr,
  Cancel: Rr,
  CancelToken: Vr,
  CanceledError: Ur,
  HttpStatusCode: Ir,
  VERSION: yr,
  all: Er,
  default: G,
  formToJSON: Mr,
  getAdapter: wr,
  isAxiosError: Tr,
  isCancel: _r,
  mergeConfig: xr,
  spread: Br,
  toFormData: Fr
}, Symbol.toStringTag, { value: "Module" })), Tt = /* @__PURE__ */ ra(Lr);
var N = {}, ke = {};
(function(o) {
  Object.defineProperty(o, "__esModule", { value: !0 }), o.operationServerMap = o.RequiredError = o.BaseAPI = o.COLLECTION_FORMATS = o.BASE_PATH = void 0;
  const h = Tt;
  o.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), o.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class v {
    constructor(m, S = o.BASE_PATH, j = h.default) {
      var R;
      this.basePath = S, this.axios = j, m && (this.configuration = m, this.basePath = (R = m.basePath) !== null && R !== void 0 ? R : S);
    }
  }
  o.BaseAPI = v;
  class e extends Error {
    constructor(m, S) {
      super(S), this.field = m, this.name = "RequiredError";
    }
  }
  o.RequiredError = e, o.operationServerMap = {};
})(ke);
var Qe = le && le.__awaiter || function(o, h, v, e) {
  function O(m) {
    return m instanceof v ? m : new v(function(S) {
      S(m);
    });
  }
  return new (v || (v = Promise))(function(m, S) {
    function j(V) {
      try {
        F(e.next(V));
      } catch (_) {
        S(_);
      }
    }
    function R(V) {
      try {
        F(e.throw(V));
      } catch (_) {
        S(_);
      }
    }
    function F(V) {
      V.done ? m(V.value) : O(V.value).then(j, R);
    }
    F((e = e.apply(o, h || [])).next());
  });
};
Object.defineProperty(N, "__esModule", { value: !0 });
N.createRequestFunction = N.toPathString = N.serializeDataIfNeeded = N.setSearchParams = N.setOAuthToObject = N.setBearerAuthToObject = N.setBasicAuthToObject = N.setApiKeyToObject = N.assertParamExists = N.DUMMY_BASE_URL = void 0;
const qr = ke;
N.DUMMY_BASE_URL = "https://example.com";
const Dr = function(o, h, v) {
  if (v == null)
    throw new qr.RequiredError(h, `Required parameter ${h} was null or undefined when calling ${o}.`);
};
N.assertParamExists = Dr;
const Hr = function(o, h, v) {
  return Qe(this, void 0, void 0, function* () {
    if (v && v.apiKey) {
      const e = typeof v.apiKey == "function" ? yield v.apiKey(h) : yield v.apiKey;
      o[h] = e;
    }
  });
};
N.setApiKeyToObject = Hr;
const Nr = function(o, h) {
  h && (h.username || h.password) && (o.auth = { username: h.username, password: h.password });
};
N.setBasicAuthToObject = Nr;
const Gr = function(o, h) {
  return Qe(this, void 0, void 0, function* () {
    if (h && h.accessToken) {
      const v = typeof h.accessToken == "function" ? yield h.accessToken() : yield h.accessToken;
      o.Authorization = "Bearer " + v;
    }
  });
};
N.setBearerAuthToObject = Gr;
const kr = function(o, h, v, e) {
  return Qe(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const O = typeof e.accessToken == "function" ? yield e.accessToken(h, v) : yield e.accessToken;
      o.Authorization = "Bearer " + O;
    }
  });
};
N.setOAuthToObject = kr;
function xe(o, h, v = "") {
  h != null && (typeof h == "object" ? Array.isArray(h) ? h.forEach((e) => xe(o, e, v)) : Object.keys(h).forEach((e) => xe(o, h[e], `${v}${v !== "" ? "." : ""}${e}`)) : o.has(v) ? o.append(v, h) : o.set(v, h));
}
const Qr = function(o, ...h) {
  const v = new URLSearchParams(o.search);
  xe(v, h), o.search = v.toString();
};
N.setSearchParams = Qr;
const Yr = function(o, h, v) {
  const e = typeof o != "string";
  return (e && v && v.isJsonMime ? v.isJsonMime(h.headers["Content-Type"]) : e) ? JSON.stringify(o !== void 0 ? o : {}) : o || "";
};
N.serializeDataIfNeeded = Yr;
const $r = function(o) {
  return o.pathname + o.search + o.hash;
};
N.toPathString = $r;
const zr = function(o, h, v, e) {
  return (O = h, m = v) => {
    var S;
    const j = Object.assign(Object.assign({}, o.options), { url: (O.defaults.baseURL ? "" : (S = e == null ? void 0 : e.basePath) !== null && S !== void 0 ? S : m) + o.url });
    return O.request(j);
  };
};
N.createRequestFunction = zr;
(function(o) {
  var h = le && le.__awaiter || function(r, c, l, i) {
    function t(a) {
      return a instanceof l ? a : new l(function(s) {
        s(a);
      });
    }
    return new (l || (l = Promise))(function(a, s) {
      function n(p) {
        try {
          d(i.next(p));
        } catch (A) {
          s(A);
        }
      }
      function u(p) {
        try {
          d(i.throw(p));
        } catch (A) {
          s(A);
        }
      }
      function d(p) {
        p.done ? a(p.value) : t(p.value).then(n, u);
      }
      d((i = i.apply(r, c || [])).next());
    });
  };
  Object.defineProperty(o, "__esModule", { value: !0 }), o.ProductCategoriesApiFactory = o.ProductCategoriesApiFp = o.ProductCategoriesApiAxiosParamCreator = o.PointofsaleApi = o.PointofsaleApiFactory = o.PointofsaleApiFp = o.PointofsaleApiAxiosParamCreator = o.PayoutRequestsApi = o.PayoutRequestsApiFactory = o.PayoutRequestsApiFp = o.PayoutRequestsApiAxiosParamCreator = o.GetAllInvoicesCurrentStateEnum = o.InvoicesApi = o.InvoicesApiFactory = o.InvoicesApiFp = o.InvoicesApiAxiosParamCreator = o.FilesApi = o.FilesApiFactory = o.FilesApiFp = o.FilesApiAxiosParamCreator = o.EventsApi = o.EventsApiFactory = o.EventsApiFp = o.EventsApiAxiosParamCreator = o.DebtorsApi = o.DebtorsApiFactory = o.DebtorsApiFp = o.DebtorsApiAxiosParamCreator = o.ContainersApi = o.ContainersApiFactory = o.ContainersApiFp = o.ContainersApiAxiosParamCreator = o.BannersApi = o.BannersApiFactory = o.BannersApiFp = o.BannersApiAxiosParamCreator = o.GetAllBalanceOrderDirectionEnum = o.GetAllBalanceUserTypesEnum = o.BalanceApi = o.BalanceApiFactory = o.BalanceApiFp = o.BalanceApiAxiosParamCreator = o.AuthenticateApi = o.AuthenticateApiFactory = o.AuthenticateApiFp = o.AuthenticateApiAxiosParamCreator = o.UpdateInvoiceRequestStateEnum = o.PayoutRequestStatusRequestStateEnum = o.InvoiceStatusResponseStateEnum = o.FinancialMutationResponseTypeEnum = void 0, o.VouchergroupsApi = o.VouchergroupsApiFactory = o.VouchergroupsApiFp = o.VouchergroupsApiAxiosParamCreator = o.VatGroupsApi = o.VatGroupsApiFactory = o.VatGroupsApiFp = o.VatGroupsApiAxiosParamCreator = o.GetAllUsersTypeEnum = o.UsersApi = o.UsersApiFactory = o.UsersApiFp = o.UsersApiAxiosParamCreator = o.TransfersApi = o.TransfersApiFactory = o.TransfersApiFp = o.TransfersApiAxiosParamCreator = o.TransactionsApi = o.TransactionsApiFactory = o.TransactionsApiFp = o.TransactionsApiAxiosParamCreator = o.TestOperationsOfTheTestControllerApi = o.TestOperationsOfTheTestControllerApiFactory = o.TestOperationsOfTheTestControllerApiFp = o.TestOperationsOfTheTestControllerApiAxiosParamCreator = o.StripeApi = o.StripeApiFactory = o.StripeApiFp = o.StripeApiAxiosParamCreator = o.RootApi = o.RootApiFactory = o.RootApiFp = o.RootApiAxiosParamCreator = o.RbacApi = o.RbacApiFactory = o.RbacApiFp = o.RbacApiAxiosParamCreator = o.ProductsApi = o.ProductsApiFactory = o.ProductsApiFp = o.ProductsApiAxiosParamCreator = o.ProductCategoriesApi = void 0;
  const v = Tt, e = N, O = ke;
  o.FinancialMutationResponseTypeEnum = {
    Transfer: "transfer",
    Transaction: "transaction"
  }, o.InvoiceStatusResponseStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, o.PayoutRequestStatusRequestStateEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
  }, o.UpdateInvoiceRequestStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  };
  const m = function(r) {
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("eanAuthentication", "authenticationEanRequest", i);
        const a = "/authentication/ean", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/GEWIS/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", i);
        const a = "/authentication/GEWIS/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", i);
        const a = "/authentication/gewisweb", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("keyAuthentication", "authenticationKeyRequest", i);
        const a = "/authentication/key", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("localAuthentication", "authenticationLocalRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("mockAuthentication", "authenticationMockRequest", i);
        const a = "/authentication/mock", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", i);
        const a = "/authentication/nfc", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("pinAuthentication", "authenticationPinRequest", i);
        const a = "/authentication/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (...c) => h(this, [...c], void 0, function* (l = {}) {
        const i = "/authentication/refreshToken", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      }),
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocal", "resetLocalRequest", i);
        const a = "/authentication/local/reset", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.AuthenticateApiAxiosParamCreator = m;
  const S = function(r) {
    const c = (0, o.AuthenticateApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.eanAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisLDAPAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisPinAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisWebAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.keyAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.ldapAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.localAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.localAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.mockAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.nfcAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.pinAuthentication(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(l) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.refreshToken(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = O.operationServerMap["AuthenticateApi.refreshToken"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(d, u || p);
        });
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.resetLocal(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.resetLocal"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.resetLocalWithToken(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.AuthenticateApiFp = S;
  const j = function(r, c, l) {
    const i = (0, o.AuthenticateApiFp)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(t, a) {
        return i.eanAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(t, a) {
        return i.gewisLDAPAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(t, a) {
        return i.gewisPinAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(t, a) {
        return i.gewisWebAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(t, a) {
        return i.keyAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(t, a) {
        return i.ldapAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(t, a) {
        return i.localAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(t, a) {
        return i.mockAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(t, a) {
        return i.nfcAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(t, a) {
        return i.pinAuthentication(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(t) {
        return i.refreshToken(t).then((a) => a(l, c));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(t, a) {
        return i.resetLocal(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(t, a) {
        return i.resetLocalWithToken(t, a).then((s) => s(l, c));
      }
    };
  };
  o.AuthenticateApiFactory = j;
  class R extends O.BaseAPI {
    /**
     *
     * @summary EAN login and hand out token
     * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).eanAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Key login and hand out token.
     * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).keyAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).ldapAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Local login and hand out token
     * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).localAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Mock login and hand out token.
     * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).mockAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary NFC login and hand out token
     * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).nfcAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token
     * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).pinAuthentication(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(c) {
      return (0, o.AuthenticateApiFp)(this.configuration).refreshToken(c).then((l) => l(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a reset token for the local authentication
     * @param {ResetLocalRequest} resetLocalRequest The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).resetLocal(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(c, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).resetLocalWithToken(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.AuthenticateApi = R;
  const F = function(r) {
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance: (c, l, i, t, a, s, n, u, d, p, A, ...P) => h(this, [c, l, i, t, a, s, n, u, d, p, A, ...P], void 0, function* (b, f, U, y, E, w, I, C, L, M, W, D = {}) {
        const z = "/balances/all", ie = new URL(z, e.DUMMY_BASE_URL);
        let ee;
        r && (ee = r.baseOptions);
        const q = Object.assign(Object.assign({ method: "GET" }, ee), D), ce = {}, X = {};
        yield (0, e.setBearerAuthToObject)(ce, r), b !== void 0 && (X.date = b), f !== void 0 && (X.minBalance = f), U !== void 0 && (X.maxBalance = U), y !== void 0 && (X.hasFine = y), E !== void 0 && (X.minFine = E), w !== void 0 && (X.maxFine = w), I && (X.userTypes = I), C !== void 0 && (X.orderBy = C), L !== void 0 && (X.orderDirection = L), M !== void 0 && (X.take = M), W !== void 0 && (X.skip = W), (0, e.setSearchParams)(ie, X);
        let Qs = ee && ee.headers ? ee.headers : {};
        return q.headers = Object.assign(Object.assign(Object.assign({}, ce), Qs), D.headers), {
          url: (0, e.toPathString)(ie),
          options: q
        };
      }),
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBalanceId", "id", i);
        const a = "/balances/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (...c) => h(this, [...c], void 0, function* (l = {}) {
        const i = "/balances", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.BalanceApiAxiosParamCreator = F;
  const V = function(r) {
    const c = (0, o.BalanceApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(l, i, t, a, s, n, u, d, p, A, P, b) {
        return h(this, void 0, void 0, function* () {
          var f, U, y;
          const E = yield c.getAllBalance(l, i, t, a, s, n, u, d, p, A, P, b), w = (f = r == null ? void 0 : r.serverIndex) !== null && f !== void 0 ? f : 0, I = (y = (U = O.operationServerMap["BalanceApi.getAllBalance"]) === null || U === void 0 ? void 0 : U[w]) === null || y === void 0 ? void 0 : y.url;
          return (C, L) => (0, e.createRequestFunction)(E, v.default, O.BASE_PATH, r)(C, I || L);
        });
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getBalanceId(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["BalanceApi.getBalanceId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(l) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.getBalances(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = O.operationServerMap["BalanceApi.getBalances"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  o.BalanceApiFp = V;
  const _ = function(r, c, l) {
    const i = (0, o.BalanceApiFp)(r);
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(t, a, s, n, u, d, p, A, P, b, f, U) {
        return i.getAllBalance(t, a, s, n, u, d, p, A, P, b, f, U).then((y) => y(l, c));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(t, a) {
        return i.getBalanceId(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(t) {
        return i.getBalances(t).then((a) => a(l, c));
      }
    };
  };
  o.BalanceApiFactory = _;
  class Q extends O.BaseAPI {
    /**
     *
     * @summary Get balance of the current user
     * @param {string} [date] Timestamp to get balances for
     * @param {number} [minBalance] Minimum balance
     * @param {number} [maxBalance] Maximum balance
     * @param {boolean} [hasFine] Only users with(out) fines
     * @param {number} [minFine] Minimum fine
     * @param {number} [maxFine] Maximum fine
     * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
     * @param {string} [orderBy] Column to order balance by - eg: id,amount
     * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getAllBalance(c, l, i, t, a, s, n, u, d, p, A, P) {
      return (0, o.BalanceApiFp)(this.configuration).getAllBalance(c, l, i, t, a, s, n, u, d, p, A, P).then((b) => b(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(c, l) {
      return (0, o.BalanceApiFp)(this.configuration).getBalanceId(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(c) {
      return (0, o.BalanceApiFp)(this.configuration).getBalances(c).then((l) => l(this.axios, this.basePath));
    }
  }
  o.BalanceApi = Q, o.GetAllBalanceUserTypesEnum = {}, o.GetAllBalanceOrderDirectionEnum = {
    Asc: "ASC",
    Desc: "DESC"
  };
  const J = function(r) {
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("_delete", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("create", "bannerRequest", i);
        const a = "/banners", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners/active", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/open/banners", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBanner", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("update", "id", t), (0, e.assertParamExists)("update", "bannerRequest", a);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateImage", "id", t);
        const n = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.BannersApiAxiosParamCreator = J;
  const T = function(r) {
    const c = (0, o.BannersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c._delete(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["BannersApi._delete"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.create(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["BannersApi.create"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getActive(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getActive"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllBanners(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getAllBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllOpenBanners(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getAllOpenBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getBanner(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["BannersApi.getBanner"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.update(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.update"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateImage(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.updateImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.BannersApiFp = T;
  const B = function(r, c, l) {
    const i = (0, o.BannersApiFp)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(t, a) {
        return i._delete(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(t, a) {
        return i.create(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(t, a, s) {
        return i.getActive(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(t, a, s) {
        return i.getAllBanners(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(t, a, s) {
        return i.getAllOpenBanners(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(t, a) {
        return i.getBanner(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(t, a, s) {
        return i.update(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(t, a, s) {
        return i.updateImage(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.BannersApiFactory = B;
  class $ extends O.BaseAPI {
    /**
     *
     * @summary Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(c, l) {
      return (0, o.BannersApiFp)(this.configuration)._delete(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Saves a banner to the database
     * @param {BannerRequest} bannerRequest The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(c, l) {
      return (0, o.BannersApiFp)(this.configuration).create(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all active banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getActive(c, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getActive(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllBanners(c, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getAllBanners(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllOpenBanners(c, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getAllOpenBanners(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(c, l) {
      return (0, o.BannersApiFp)(this.configuration).getBanner(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested banner
     * @param {number} id The id of the banner which should be updated
     * @param {BannerRequest} bannerRequest The updated banner
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    update(c, l, i) {
      return (0, o.BannersApiFp)(this.configuration).update(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Uploads a banner image to the given banner
     * @param {number} id The id of the banner
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    updateImage(c, l, i) {
      return (0, o.BannersApiFp)(this.configuration).updateImage(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.BannersApi = $;
  const K = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createContainer", "createContainerRequest", i);
        const a = "/containers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getProductsContainer", "id", a);
        const d = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers/public", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateContainer", "id", t), (0, e.assertParamExists)("updateContainer", "updateContainerRequest", a);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.ContainersApiAxiosParamCreator = K;
  const te = function(r) {
    const c = (0, o.ContainersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createContainer(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ContainersApi.createContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllContainers(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.getAllContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getProductsContainer(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["ContainersApi.getProductsContainer"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getPublicContainers(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.getPublicContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleContainer(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ContainersApi.getSingleContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateContainer(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.updateContainer"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ContainersApiFp = te;
  const se = function(r, c, l) {
    const i = (0, o.ContainersApiFp)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(t, a) {
        return i.createContainer(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(t, a, s) {
        return i.getAllContainers(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(t, a, s, n) {
        return i.getProductsContainer(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(t, a, s) {
        return i.getPublicContainers(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(t, a) {
        return i.getSingleContainer(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(t, a, s) {
        return i.updateContainer(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.ContainersApiFactory = se;
  class ye extends O.BaseAPI {
    /**
     *
     * @summary Create a new container.
     * @param {CreateContainerRequest} createContainerRequest    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(c, l) {
      return (0, o.ContainersApiFp)(this.configuration).createContainer(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getAllContainers(c, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).getAllContainers(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all the products in the container
     * @param {number} id The id of the container which should be returned
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getProductsContainer(c, l, i, t) {
      return (0, o.ContainersApiFp)(this.configuration).getProductsContainer(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all public container
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getPublicContainers(c, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).getPublicContainers(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(c, l) {
      return (0, o.ContainersApiFp)(this.configuration).getSingleContainer(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing container.
     * @param {number} id The id of the container which should be updated
     * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    updateContainer(c, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).updateContainer(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ContainersApi = ye;
  const Bt = function(r) {
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("calculateFines", "referenceDates", t);
        const n = "/fines/eligible", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), a && (P.userTypes = a), t && (P.referenceDates = t), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFine", "id", i);
        const a = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("handoutFines", "handoutFinesRequest", i);
        const a = "/fines/handout", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", i);
        const a = "/fines/notify", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/fines", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("returnSingleFineHandoutEvent", "id", i);
        const a = "/fines/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.DebtorsApiAxiosParamCreator = Bt;
  const Ft = function(r) {
    const c = (0, o.DebtorsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.calculateFines(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["DebtorsApi.calculateFines"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteFine(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["DebtorsApi.deleteFine"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.handoutFines(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["DebtorsApi.handoutFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.notifyAboutFutureFines(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.returnAllFineHandoutEvents(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.returnSingleFineHandoutEvent(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.DebtorsApiFp = Ft;
  const Ct = function(r, c, l) {
    const i = (0, o.DebtorsApiFp)(r);
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines(t, a, s) {
        return i.calculateFines(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(t, a) {
        return i.deleteFine(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(t, a) {
        return i.handoutFines(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(t, a) {
        return i.notifyAboutFutureFines(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(t, a, s) {
        return i.returnAllFineHandoutEvents(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(t, a) {
        return i.returnSingleFineHandoutEvent(t, a).then((s) => s(l, c));
      }
    };
  };
  o.DebtorsApiFactory = Ct;
  class It extends O.BaseAPI {
    /**
     *
     * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
     * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
     * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    calculateFines(c, l, i) {
      return (0, o.DebtorsApiFp)(this.configuration).calculateFines(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine
     * @param {number} id The id of the fine which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    deleteFine(c, l) {
      return (0, o.DebtorsApiFp)(this.configuration).deleteFine(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    handoutFines(c, l) {
      return (0, o.DebtorsApiFp)(this.configuration).handoutFines(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Send an email to all given users about their possible future fine.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    notifyAboutFutureFines(c, l) {
      return (0, o.DebtorsApiFp)(this.configuration).notifyAboutFutureFines(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnAllFineHandoutEvents(c, l, i) {
      return (0, o.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} id The id of the fine handout event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnSingleFineHandoutEvent(c, l) {
      return (0, o.DebtorsApiFp)(this.configuration).returnSingleFineHandoutEvent(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.DebtorsApi = It;
  const Mt = function(r) {
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift: (c, l, i, t, ...a) => h(this, [c, l, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("assignEventShift", "eventId", s), (0, e.assertParamExists)("assignEventShift", "shiftId", n), (0, e.assertParamExists)("assignEventShift", "userId", u), (0, e.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", d);
        const A = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "PUT" }, b), p), U = {}, y = {};
        yield (0, e.setBearerAuthToObject)(U, r), U["Content-Type"] = "application/json", (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), f.data = (0, e.serializeDataIfNeeded)(d, f, r), {
          url: (0, e.toPathString)(P),
          options: f
        };
      }),
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEvent", "createEventRequest", i);
        const a = "/events", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEventShift", "createShiftRequest", i);
        const a = "/eventshifts", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEventShift", "id", i);
        const a = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/eventshifts", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents: (c, l, i, t, a, s, n, ...u) => h(this, [c, l, i, t, a, s, n, ...u], void 0, function* (d, p, A, P, b, f, U, y = {}) {
        const E = "/events", w = new URL(E, e.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), y), L = {}, M = {};
        yield (0, e.setBearerAuthToObject)(L, r), d !== void 0 && (M.name = d), p !== void 0 && (M.createdById = p), A !== void 0 && (M.beforeDate = A), P !== void 0 && (M.afterDate = P), b !== void 0 && (M.type = b), f !== void 0 && (M.take = f), U !== void 0 && (M.skip = U), (0, e.setSearchParams)(w, M);
        let W = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, L), W), y.headers), {
          url: (0, e.toPathString)(w),
          options: C
        };
      }),
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount: (c, l, i, t, ...a) => h(this, [c, l, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("getEventShiftCount", "id", s);
        const A = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(s))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "GET" }, b), p), U = {}, y = {};
        yield (0, e.setBearerAuthToObject)(U, r), n !== void 0 && (y.eventType = n), u !== void 0 && (y.afterDate = u), d !== void 0 && (y.beforeDate = d), (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), {
          url: (0, e.toPathString)(P),
          options: f
        };
      }),
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEvent", "id", t), (0, e.assertParamExists)("updateEvent", "updateEventRequest", a);
        const n = "/events/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEventShift", "id", t), (0, e.assertParamExists)("updateEventShift", "updateShiftRequest", a);
        const n = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability: (c, l, i, t, ...a) => h(this, [c, l, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("updateEventShiftAvailability", "eventId", s), (0, e.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, e.assertParamExists)("updateEventShiftAvailability", "userId", u), (0, e.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", d);
        const A = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "POST" }, b), p), U = {}, y = {};
        yield (0, e.setBearerAuthToObject)(U, r), U["Content-Type"] = "application/json", (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), f.data = (0, e.serializeDataIfNeeded)(d, f, r), {
          url: (0, e.toPathString)(P),
          options: f
        };
      })
    };
  };
  o.EventsApiAxiosParamCreator = Mt;
  const wt = function(r) {
    const c = (0, o.EventsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift(l, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.assignEventShift(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = O.operationServerMap["EventsApi.assignEventShift"]) === null || u === void 0 ? void 0 : u[A]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || f);
        });
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createEvent(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["EventsApi.createEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createEventShift(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["EventsApi.createEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteEvent(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["EventsApi.deleteEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteEventShift(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["EventsApi.deleteEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllEventShifts(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.getAllEventShifts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents(l, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield c.getAllEvents(l, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (A = O.operationServerMap["EventsApi.getAllEvents"]) === null || A === void 0 ? void 0 : A[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(y, U || E);
        });
      },
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount(l, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.getEventShiftCount(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = O.operationServerMap["EventsApi.getEventShiftCount"]) === null || u === void 0 ? void 0 : u[A]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || f);
        });
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleEvent(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["EventsApi.getSingleEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEvent(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.updateEvent"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEventShift(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.updateEventShift"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability(l, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.updateEventShiftAvailability(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = O.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || u === void 0 ? void 0 : u[A]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || f);
        });
      }
    };
  };
  o.EventsApiFp = wt;
  const xt = function(r, c, l) {
    const i = (0, o.EventsApiFp)(r);
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift(t, a, s, n, u) {
        return i.assignEventShift(t, a, s, n, u).then((d) => d(l, c));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(t, a) {
        return i.createEvent(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(t, a) {
        return i.createEventShift(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(t, a) {
        return i.deleteEvent(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(t, a) {
        return i.deleteEventShift(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(t, a, s) {
        return i.getAllEventShifts(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents(t, a, s, n, u, d, p, A) {
        return i.getAllEvents(t, a, s, n, u, d, p, A).then((P) => P(l, c));
      },
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount(t, a, s, n, u) {
        return i.getEventShiftCount(t, a, s, n, u).then((d) => d(l, c));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(t, a) {
        return i.getSingleEvent(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(t, a, s) {
        return i.updateEvent(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(t, a, s) {
        return i.updateEventShift(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability(t, a, s, n, u) {
        return i.updateEventShiftAvailability(t, a, s, n, u).then((d) => d(l, c));
      }
    };
  };
  o.EventsApiFactory = xt;
  class Lt extends O.BaseAPI {
    /**
     *
     * @summary Change the assignment of users to shifts on an event
     * @param {number} eventId The id of the event
     * @param {number} shiftId The id of the shift
     * @param {number} userId The id of the user
     * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    assignEventShift(c, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).assignEventShift(c, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event with its corresponding answers objects
     * @param {CreateEventRequest} createEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEvent(c, l) {
      return (0, o.EventsApiFp)(this.configuration).createEvent(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event shift
     * @param {CreateShiftRequest} createShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEventShift(c, l) {
      return (0, o.EventsApiFp)(this.configuration).createEventShift(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEvent(c, l) {
      return (0, o.EventsApiFp)(this.configuration).deleteEvent(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event shift with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEventShift(c, l) {
      return (0, o.EventsApiFp)(this.configuration).deleteEventShift(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all event shifts
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getAllEventShifts(c, l, i) {
      return (0, o.EventsApiFp)(this.configuration).getAllEventShifts(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all events
     * @param {string} [name] Name of the event
     * @param {number} [createdById] ID of user that created the event
     * @param {string} [beforeDate] Get only events that start after this date
     * @param {string} [afterDate] Get only events that start before this date
     * @param {string} [type] Get only events that are this type
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getAllEvents(c, l, i, t, a, s, n, u) {
      return (0, o.EventsApiFp)(this.configuration).getAllEvents(c, l, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get the number of times a user has been selected for the given shift
     * @param {number} id The id of the event shift
     * @param {string} [eventType] Only include events of this type
     * @param {string} [afterDate] Only include events after this date
     * @param {string} [beforeDate] Only include events before this date
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getEventShiftCount(c, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).getEventShiftCount(c, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single event with its answers and shifts
     * @param {number} id The id of the event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getSingleEvent(c, l) {
      return (0, o.EventsApiFp)(this.configuration).getSingleEvent(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an event with its corresponding answers objects
     * @param {number} id The id of the event which should be returned
     * @param {UpdateEventRequest} updateEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEvent(c, l, i) {
      return (0, o.EventsApiFp)(this.configuration).updateEvent(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an event shift
     * @param {number} id The id of the event which should be returned
     * @param {UpdateShiftRequest} updateShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEventShift(c, l, i) {
      return (0, o.EventsApiFp)(this.configuration).updateEventShift(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update the availability of a user for a shift in an event
     * @param {number} eventId The id of the event
     * @param {number} shiftId The id of the shift
     * @param {number} userId The id of the user
     * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEventShiftAvailability(c, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).updateEventShiftAvailability(c, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
  }
  o.EventsApi = Lt;
  const qt = function(r) {
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("createFile", "name", t);
        const n = "/files", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && b.append("name", t), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.FilesApiAxiosParamCreator = qt;
  const Dt = function(r) {
    const c = (0, o.FilesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.createFile(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["FilesApi.createFile"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteFile(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["FilesApi.deleteFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getFile(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["FilesApi.getFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.FilesApiFp = Dt;
  const Ht = function(r, c, l) {
    const i = (0, o.FilesApiFp)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(t, a, s) {
        return i.createFile(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(t, a) {
        return i.deleteFile(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(t, a) {
        return i.getFile(t, a).then((s) => s(l, c));
      }
    };
  };
  o.FilesApiFactory = Ht;
  class Nt extends O.BaseAPI {
    /**
     *
     * @summary Upload a file with the given name.
     * @param {string} name The name of the file
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(c, l, i) {
      return (0, o.FilesApiFp)(this.configuration).createFile(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(c, l) {
      return (0, o.FilesApiFp)(this.configuration).deleteFile(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(c, l) {
      return (0, o.FilesApiFp)(this.configuration).getFile(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.FilesApi = Nt;
  const Gt = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createInvoice", "createInvoiceRequest", i);
        const a = "/invoices", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteInvoice", "id", i);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices: (c, l, i, t, a, s, n, u, ...d) => h(this, [c, l, i, t, a, s, n, u, ...d], void 0, function* (p, A, P, b, f, U, y, E, w = {}) {
        const I = "/invoices", C = new URL(I, e.DUMMY_BASE_URL);
        let L;
        r && (L = r.baseOptions);
        const M = Object.assign(Object.assign({ method: "GET" }, L), w), W = {}, D = {};
        yield (0, e.setBearerAuthToObject)(W, r), p !== void 0 && (D.toId = p), A !== void 0 && (D.invoiceId = A), P && (D.currentState = P), b !== void 0 && (D.returnEntries = b), f !== void 0 && (D.fromDate = f), U !== void 0 && (D.tillDate = U), y !== void 0 && (D.take = y), E !== void 0 && (D.skip = E), (0, e.setSearchParams)(C, D);
        let z = L && L.headers ? L.headers : {};
        return M.headers = Object.assign(Object.assign(Object.assign({}, W), z), w.headers), {
          url: (0, e.toPathString)(C),
          options: M
        };
      }),
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getSingleInvoice", "id", t);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && (P.returnEntries = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateInvoice", "id", t), (0, e.assertParamExists)("updateInvoice", "updateInvoiceRequest", a);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.InvoicesApiAxiosParamCreator = Gt;
  const kt = function(r) {
    const c = (0, o.InvoicesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createInvoice(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["InvoicesApi.createInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteInvoice(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["InvoicesApi.deleteInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(l, i, t, a, s, n, u, d, p) {
        return h(this, void 0, void 0, function* () {
          var A, P, b;
          const f = yield c.getAllInvoices(l, i, t, a, s, n, u, d, p), U = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, y = (b = (P = O.operationServerMap["InvoicesApi.getAllInvoices"]) === null || P === void 0 ? void 0 : P[U]) === null || b === void 0 ? void 0 : b.url;
          return (E, w) => (0, e.createRequestFunction)(f, v.default, O.BASE_PATH, r)(E, y || w);
        });
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getSingleInvoice(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateInvoice(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["InvoicesApi.updateInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.InvoicesApiFp = kt;
  const Qt = function(r, c, l) {
    const i = (0, o.InvoicesApiFp)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(t, a) {
        return i.createInvoice(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(t, a) {
        return i.deleteInvoice(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(t, a, s, n, u, d, p, A, P) {
        return i.getAllInvoices(t, a, s, n, u, d, p, A, P).then((b) => b(l, c));
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(t, a, s) {
        return i.getSingleInvoice(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(t, a, s) {
        return i.updateInvoice(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.InvoicesApiFactory = Qt;
  class Yt extends O.BaseAPI {
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(c, l) {
      return (0, o.InvoicesApiFp)(this.configuration).createInvoice(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(c, l) {
      return (0, o.InvoicesApiFp)(this.configuration).deleteInvoice(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all invoices in the system.
     * @param {number} [toId] Filter on Id of the debtor
     * @param {number} [invoiceId] Filter on invoice ID
     * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
     * @param {string} [fromDate] Start date for selected invoices (inclusive)
     * @param {string} [tillDate] End date for selected invoices (exclusive)
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getAllInvoices(c, l, i, t, a, s, n, u, d) {
      return (0, o.InvoicesApiFp)(this.configuration).getAllInvoices(c, l, i, t, a, s, n, u, d).then((p) => p(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a single invoice in the system.
     * @param {number} id The id of the requested invoice
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoice(c, l, i) {
      return (0, o.InvoicesApiFp)(this.configuration).getSingleInvoice(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(c, l, i) {
      return (0, o.InvoicesApiFp)(this.configuration).updateInvoice(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.InvoicesApi = Yt, o.GetAllInvoicesCurrentStateEnum = {};
  const $t = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequestRequest", i);
        const a = "/payoutrequests", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests: (c, l, i, t, a, s, n, ...u) => h(this, [c, l, i, t, a, s, n, ...u], void 0, function* (d, p, A, P, b, f, U, y = {}) {
        const E = "/payoutrequests", w = new URL(E, e.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), y), L = {}, M = {};
        if (yield (0, e.setBearerAuthToObject)(L, r), d !== void 0)
          for (const [D, z] of Object.entries(d))
            M[D] = z;
        if (p !== void 0)
          for (const [D, z] of Object.entries(p))
            M[D] = z;
        A !== void 0 && (M.fromDate = A), P !== void 0 && (M.tillDate = P), b !== void 0 && (M.status = b), f !== void 0 && (M.take = f), U !== void 0 && (M.skip = U), (0, e.setSearchParams)(w, M);
        let W = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, L), W), y.headers), {
          url: (0, e.toPathString)(w),
          options: C
        };
      }),
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", i);
        const a = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", t), (0, e.assertParamExists)("setPayoutRequestStatus", "payoutRequestStatusRequest", a);
        const n = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.PayoutRequestsApiAxiosParamCreator = $t;
  const zt = function(r) {
    const c = (0, o.PayoutRequestsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createPayoutRequest(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(l, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield c.getAllPayoutRequests(l, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (A = O.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || A === void 0 ? void 0 : A[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(y, U || E);
        });
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSinglePayoutRequest(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.setPayoutRequestStatus(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.PayoutRequestsApiFp = zt;
  const Kt = function(r, c, l) {
    const i = (0, o.PayoutRequestsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(t, a) {
        return i.createPayoutRequest(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(t, a, s, n, u, d, p, A) {
        return i.getAllPayoutRequests(t, a, s, n, u, d, p, A).then((P) => P(l, c));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(t, a) {
        return i.getSinglePayoutRequest(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(t, a, s) {
        return i.setPayoutRequestStatus(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.PayoutRequestsApiFactory = Kt;
  class Wt extends O.BaseAPI {
    /**
     *
     * @summary Create a new payout request
     * @param {PayoutRequestRequest} payoutRequestRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(c, l) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all payout requests given the filter parameters
     * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
     * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {string} [status] Status of the payout requests (OR relation)
     * @param {number} [take] How many payout requests the endpoint should return
     * @param {number} [skip] How many payout requests should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getAllPayoutRequests(c, l, i, t, a, s, n, u) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(c, l, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(c, l) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(c, l, i) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.PayoutRequestsApi = Wt;
  const Jt = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPointOfSale", "createPointOfSaleRequest", i);
        const a = "/pointsofsale", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", a);
        const d = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", a);
        const d = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/pointsofsale", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getTransactions", "id", a);
        const d = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updatePointOfSale", "id", t), (0, e.assertParamExists)("updatePointOfSale", "updatePointOfSaleRequest", a);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.PointofsaleApiAxiosParamCreator = Jt;
  const Xt = function(r) {
    const c = (0, o.PointofsaleApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createPointOfSale(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllPointOfSaleContainers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllPointOfSaleProducts(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllPointsOfSale(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSinglePointOfSale(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getTransactions(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["PointofsaleApi.getTransactions"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updatePointOfSale(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.PointofsaleApiFp = Xt;
  const Zt = function(r, c, l) {
    const i = (0, o.PointofsaleApiFp)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(t, a) {
        return i.createPointOfSale(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(t, a, s, n) {
        return i.getAllPointOfSaleContainers(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(t, a, s, n) {
        return i.getAllPointOfSaleProducts(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(t, a, s) {
        return i.getAllPointsOfSale(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(t, a) {
        return i.getSinglePointOfSale(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(t, a, s, n) {
        return i.getTransactions(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(t, a, s) {
        return i.updatePointOfSale(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.PointofsaleApiFactory = Zt;
  class es extends O.BaseAPI {
    /**
     *
     * @summary Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(c, l) {
      return (0, o.PointofsaleApiFp)(this.configuration).createPointOfSale(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleContainers(c, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleProducts(c, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing Point of Sales
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointsOfSale(c, l, i) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(c, l) {
      return (0, o.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a Point of Sale transactions
     * @param {number} id The id of the Point of Sale of which to get the transactions.
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getTransactions(c, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getTransactions(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(c, l, i) {
      return (0, o.PointofsaleApiFp)(this.configuration).updatePointOfSale(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.PointofsaleApi = es;
  const ts = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProductCategory", "productCategoryRequest", i);
        const a = "/productcategories", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/productcategories", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProductCategory", "id", i);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductCategory", "id", t), (0, e.assertParamExists)("updateProductCategory", "productCategoryRequest", a);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.ProductCategoriesApiAxiosParamCreator = ts;
  const ss = function(r) {
    const c = (0, o.ProductCategoriesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createProductCategory(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProductCategories(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleProductCategory(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductCategory(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ProductCategoriesApiFp = ss;
  const as = function(r, c, l) {
    const i = (0, o.ProductCategoriesApiFp)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(t, a) {
        return i.createProductCategory(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(t, a, s) {
        return i.getAllProductCategories(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(t, a) {
        return i.getSingleProductCategory(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(t, a, s) {
        return i.updateProductCategory(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.ProductCategoriesApiFactory = as;
  class rs extends O.BaseAPI {
    /**
     *
     * @summary Post a new productCategory.
     * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(c, l) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).createProductCategory(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing productcategories
     * @param {number} [take] How many product categories the endpoint should return
     * @param {number} [skip] How many product categories should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getAllProductCategories(c, l, i) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(c, l) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(c, l, i) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).updateProductCategory(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ProductCategoriesApi = rs;
  const ns = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProduct", "createProductRequest", i);
        const a = "/products", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/products", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProduct", "id", t), (0, e.assertParamExists)("updateProduct", "updateProductRequest", a);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductImage", "id", t);
        const n = "/products/{id}/image".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.ProductsApiAxiosParamCreator = ns;
  const is = function(r) {
    const c = (0, o.ProductsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createProduct(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ProductsApi.createProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProducts(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.getAllProducts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleProduct(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["ProductsApi.getSingleProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProduct(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.updateProduct"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductImage(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.updateProductImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ProductsApiFp = is;
  const os = function(r, c, l) {
    const i = (0, o.ProductsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(t, a) {
        return i.createProduct(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(t, a, s) {
        return i.getAllProducts(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(t, a) {
        return i.getSingleProduct(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(t, a, s) {
        return i.updateProduct(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(t, a, s) {
        return i.updateProductImage(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.ProductsApiFactory = os;
  class ls extends O.BaseAPI {
    /**
     *
     * @summary Create a new product.
     * @param {CreateProductRequest} createProductRequest The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(c, l) {
      return (0, o.ProductsApiFp)(this.configuration).createProduct(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getAllProducts(c, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).getAllProducts(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(c, l) {
      return (0, o.ProductsApiFp)(this.configuration).getSingleProduct(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} updateProductRequest The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(c, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).updateProduct(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a new image for a product
     * @param {number} id The id of the product which should be returned
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProductImage(c, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).updateProductImage(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ProductsApi = ls;
  const cs = function(r) {
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (...c) => h(this, [...c], void 0, function* (l = {}) {
        const i = "/rbac/roles", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.RbacApiAxiosParamCreator = cs;
  const ds = function(r) {
    const c = (0, o.RbacApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(l) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.getAllRoles(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = O.operationServerMap["RbacApi.getAllRoles"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  o.RbacApiFp = ds;
  const us = function(r, c, l) {
    const i = (0, o.RbacApiFp)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(t) {
        return i.getAllRoles(t).then((a) => a(l, c));
      }
    };
  };
  o.RbacApiFactory = us;
  class hs extends O.BaseAPI {
    /**
     *
     * @summary Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(c) {
      return (0, o.RbacApiFp)(this.configuration).getAllRoles(c).then((l) => l(this.axios, this.basePath));
    }
  }
  o.RbacApi = hs;
  const ps = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (...c) => h(this, [...c], void 0, function* (l = {}) {
        const i = "/ping", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, u = {};
        (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.RootApiAxiosParamCreator = ps;
  const As = function(r) {
    const c = (0, o.RootApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(l) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.ping(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = O.operationServerMap["RootApi.ping"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  o.RootApiFp = As;
  const vs = function(r, c, l) {
    const i = (0, o.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(t) {
        return i.ping(t).then((a) => a(l, c));
      }
    };
  };
  o.RootApiFactory = vs;
  class Os extends O.BaseAPI {
    /**
     *
     * @summary Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(c) {
      return (0, o.RootApiFp)(this.configuration).ping(c).then((l) => l(this.axios, this.basePath));
    }
  }
  o.RootApi = Os;
  const Ps = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deposit", "stripeRequest", i);
        const a = "/stripe/deposit", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.StripeApiAxiosParamCreator = Ps;
  const bs = function(r) {
    const c = (0, o.StripeApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deposit(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["StripeApi.deposit"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.StripeApiFp = bs;
  const ms = function(r, c, l) {
    const i = (0, o.StripeApiFp)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(t, a) {
        return i.deposit(t, a).then((s) => s(l, c));
      }
    };
  };
  o.StripeApiFactory = ms;
  class Ss extends O.BaseAPI {
    /**
     *
     * @summary Start the stripe deposit flow
     * @param {StripeRequest} stripeRequest The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(c, l) {
      return (0, o.StripeApiFp)(this.configuration).deposit(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.StripeApi = Ss;
  const fs = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (...c) => h(this, [...c], void 0, function* (l = {}) {
        const i = "/test/helloworld", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), l), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.TestOperationsOfTheTestControllerApiAxiosParamCreator = fs;
  const gs = function(r) {
    const c = (0, o.TestOperationsOfTheTestControllerApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(l) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.helloworld(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = O.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  o.TestOperationsOfTheTestControllerApiFp = gs;
  const js = function(r, c, l) {
    const i = (0, o.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(t) {
        return i.helloworld(t).then((a) => a(l, c));
      }
    };
  };
  o.TestOperationsOfTheTestControllerApiFactory = js;
  class Us extends O.BaseAPI {
    /**
     *
     * @summary Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestOperationsOfTheTestControllerApi
     */
    helloworld(c) {
      return (0, o.TestOperationsOfTheTestControllerApiFp)(this.configuration).helloworld(c).then((l) => l(this.axios, this.basePath));
    }
  }
  o.TestOperationsOfTheTestControllerApi = Us;
  const _s = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransaction", "transactionRequest", i);
        const a = "/transactions", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all transactions
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
      getAllTransactions: (c, l, i, t, a, s, n, u, d, p, ...A) => h(this, [c, l, i, t, a, s, n, u, d, p, ...A], void 0, function* (P, b, f, U, y, E, w, I, C, L, M = {}) {
        const W = "/transactions", D = new URL(W, e.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const ie = Object.assign(Object.assign({ method: "GET" }, z), M), ee = {}, q = {};
        yield (0, e.setBearerAuthToObject)(ee, r), P !== void 0 && (q.fromId = P), b !== void 0 && (q.createdById = b), f !== void 0 && (q.toId = f), U !== void 0 && (q.pointOfSaleId = U), y !== void 0 && (q.productId = y), E !== void 0 && (q.productRevision = E), w !== void 0 && (q.fromDate = w), I !== void 0 && (q.tillDate = I), C !== void 0 && (q.take = C), L !== void 0 && (q.skip = L), (0, e.setSearchParams)(D, q);
        let ce = z && z.headers ? z.headers : {};
        return ie.headers = Object.assign(Object.assign(Object.assign({}, ee), ce), M.headers), {
          url: (0, e.toPathString)(D),
          options: ie
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateTransaction", "id", t), (0, e.assertParamExists)("updateTransaction", "transactionRequest", a);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("validateTransaction", "transactionRequest", i);
        const a = "/transactions/validate", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.TransactionsApiAxiosParamCreator = _s;
  const Vs = function(r) {
    const c = (0, o.TransactionsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createTransaction(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransactionsApi.createTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteTransaction(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransactionsApi.deleteTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get a list of all transactions
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
      getAllTransactions(l, i, t, a, s, n, u, d, p, A, P) {
        return h(this, void 0, void 0, function* () {
          var b, f, U;
          const y = yield c.getAllTransactions(l, i, t, a, s, n, u, d, p, A, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, w = (U = (f = O.operationServerMap["TransactionsApi.getAllTransactions"]) === null || f === void 0 ? void 0 : f[E]) === null || U === void 0 ? void 0 : U.url;
          return (I, C) => (0, e.createRequestFunction)(y, v.default, O.BASE_PATH, r)(I, w || C);
        });
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleTransaction(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateTransaction(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["TransactionsApi.updateTransaction"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.validateTransaction(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransactionsApi.validateTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.TransactionsApiFp = Vs;
  const ys = function(r, c, l) {
    const i = (0, o.TransactionsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(t, a) {
        return i.createTransaction(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(t, a) {
        return i.deleteTransaction(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get a list of all transactions
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
      getAllTransactions(t, a, s, n, u, d, p, A, P, b, f) {
        return i.getAllTransactions(t, a, s, n, u, d, p, A, P, b, f).then((U) => U(l, c));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(t, a) {
        return i.getSingleTransaction(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(t, a, s) {
        return i.updateTransaction(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(t, a) {
        return i.validateTransaction(t, a).then((s) => s(l, c));
      }
    };
  };
  o.TransactionsApiFactory = ys;
  class Es extends O.BaseAPI {
    /**
     *
     * @summary Creates a new transaction
     * @param {TransactionRequest} transactionRequest The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(c, l) {
      return (0, o.TransactionsApiFp)(this.configuration).createTransaction(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(c, l) {
      return (0, o.TransactionsApiFp)(this.configuration).deleteTransaction(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all transactions
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
    getAllTransactions(c, l, i, t, a, s, n, u, d, p, A) {
      return (0, o.TransactionsApiFp)(this.configuration).getAllTransactions(c, l, i, t, a, s, n, u, d, p, A).then((P) => P(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(c, l) {
      return (0, o.TransactionsApiFp)(this.configuration).getSingleTransaction(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} transactionRequest The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(c, l, i) {
      return (0, o.TransactionsApiFp)(this.configuration).updateTransaction(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transactionRequest The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(c, l) {
      return (0, o.TransactionsApiFp)(this.configuration).validateTransaction(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.TransactionsApi = Es;
  const Rs = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransfer", "transferRequest", i);
        const a = "/transfers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/transfers", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransfer", "id", i);
        const a = "/transfers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.TransfersApiAxiosParamCreator = Rs;
  const Ts = function(r) {
    const c = (0, o.TransfersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createTransfer(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransfersApi.createTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllTransfers(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["TransfersApi.getAllTransfers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleTransfer(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["TransfersApi.getSingleTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.TransfersApiFp = Ts;
  const Bs = function(r, c, l) {
    const i = (0, o.TransfersApiFp)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(t, a) {
        return i.createTransfer(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(t, a, s) {
        return i.getAllTransfers(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(t, a) {
        return i.getSingleTransfer(t, a).then((s) => s(l, c));
      }
    };
  };
  o.TransfersApiFactory = Bs;
  class Fs extends O.BaseAPI {
    /**
     *
     * @summary Post a new transfer.
     * @param {TransferRequest} transferRequest The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(c, l) {
      return (0, o.TransfersApiFp)(this.configuration).createTransfer(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getAllTransfers(c, l, i) {
      return (0, o.TransfersApiFp)(this.configuration).getAllTransfers(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(c, l) {
      return (0, o.TransfersApiFp)(this.configuration).getSingleTransfer(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.TransfersApi = Fs;
  const Cs = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("acceptTos", "acceptTosRequest", i);
        const a = "/users/acceptTos", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("authenticateAs", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createUser", "createUserRequest", i);
        const a = "/users", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserNfc", "id", i);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers: (c, l, i, t, a, s, n, ...u) => h(this, [c, l, i, t, a, s, n, ...u], void 0, function* (d, p, A, P, b, f, U, y = {}) {
        const E = "/users", w = new URL(E, e.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), y), L = {}, M = {};
        yield (0, e.setBearerAuthToObject)(L, r), d !== void 0 && (M.take = d), p !== void 0 && (M.skip = p), A !== void 0 && (M.search = A), P !== void 0 && (M.active = P), b !== void 0 && (M.ofAge = b), f !== void 0 && (M.id = f), U !== void 0 && (M.type = U), (0, e.setSearchParams)(w, M);
        let W = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, L), W), y.headers), {
          url: (0, e.toPathString)(w),
          options: C
        };
      }),
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", a);
        const d = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getIndividualUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getOrganMembers", "id", a);
        const d = "/users/{id}/members".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserRoles", "id", i);
        const a = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersContainers", "id", a);
        const d = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", a);
        const d = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", a);
        const d = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", i);
        const a = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts: (c, l, i, ...t) => h(this, [c, l, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersProducts", "id", a);
        const d = "/users/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let U = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get an user\'s transactions (from, to or created)
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
      getUsersTransactions: (c, l, i, t, a, s, n, u, d, p, ...A) => h(this, [c, l, i, t, a, s, n, u, d, p, ...A], void 0, function* (P, b, f, U, y, E, w, I, C, L, M = {}) {
        (0, e.assertParamExists)("getUsersTransactions", "id", P);
        const W = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(P))), D = new URL(W, e.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const ie = Object.assign(Object.assign({ method: "GET" }, z), M), ee = {}, q = {};
        yield (0, e.setBearerAuthToObject)(ee, r), b !== void 0 && (q.fromId = b), f !== void 0 && (q.createdById = f), U !== void 0 && (q.toId = U), y !== void 0 && (q.productId = y), E !== void 0 && (q.productRevision = E), w !== void 0 && (q.fromDate = w), I !== void 0 && (q.tillDate = I), C !== void 0 && (q.take = C), L !== void 0 && (q.skip = L), (0, e.setSearchParams)(D, q);
        let ce = z && z.headers ? z.headers : {};
        return ie.headers = Object.assign(Object.assign(Object.assign({}, ee), ce), M.headers), {
          url: (0, e.toPathString)(D),
          options: ie
        };
      }),
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport: (c, l, i, t, a, s, ...n) => h(this, [c, l, i, t, a, s, ...n], void 0, function* (u, d, p, A, P, b, f = {}) {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", u);
        const U = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(u))), y = new URL(U, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const w = Object.assign(Object.assign({ method: "GET" }, E), f), I = {}, C = {};
        yield (0, e.setBearerAuthToObject)(I, r), d !== void 0 && (C.fromDate = d), p !== void 0 && (C.tillDate = p), A !== void 0 && (C.fromId = A), P !== void 0 && (C.toId = P), b !== void 0 && (C.exclusiveToId = b), (0, e.setSearchParams)(y, C);
        let L = E && E.headers ? E.headers : {};
        return w.headers = Object.assign(Object.assign(Object.assign({}, I), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: w
        };
      }),
      /**
       *
       * @summary Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers: (c, l, i, t, a, s, ...n) => h(this, [c, l, i, t, a, s, ...n], void 0, function* (u, d, p, A, P, b, f = {}) {
        (0, e.assertParamExists)("getUsersTransfers", "id", u);
        const U = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(u))), y = new URL(U, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const w = Object.assign(Object.assign({ method: "GET" }, E), f), I = {}, C = {};
        yield (0, e.setBearerAuthToObject)(I, r), d !== void 0 && (C.take = d), p !== void 0 && (C.skip = p), A !== void 0 && (C.fromId = A), P !== void 0 && (C.toId = P), b !== void 0 && (C.id = b), (0, e.setSearchParams)(y, C);
        let L = E && E.headers ? E.headers : {};
        return w.headers = Object.assign(Object.assign(Object.assign({}, I), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: w
        };
      }),
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUser", "id", t), (0, e.assertParamExists)("updateUser", "updateUserRequest", a);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("updateUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", t), (0, e.assertParamExists)("updateUserLocalPassword", "updateLocalRequest", a);
        const n = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserNfc", "id", t), (0, e.assertParamExists)("updateUserNfc", "updateNfcRequest", a);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserPin", "id", t), (0, e.assertParamExists)("updateUserPin", "updatePinRequest", a);
        const n = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("waiveUserFines", "id", i);
        const a = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  o.UsersApiAxiosParamCreator = Cs;
  const Is = function(r) {
    const c = (0, o.UsersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.acceptTos(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.acceptTos"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.authenticateAs(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.authenticateAs"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createUser(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.createUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUser(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.deleteUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUserKey(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.deleteUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUserNfc(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.deleteUserNfc"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(l, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield c.getAllUsers(l, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (A = O.operationServerMap["UsersApi.getAllUsers"]) === null || A === void 0 ? void 0 : A[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(y, U || E);
        });
      },
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllUsersOfUserType(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getIndividualUser(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.getIndividualUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getOrganMembers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getOrganMembers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUserAuthenticatable(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUserRoles(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.getUserRoles"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersContainers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getUsersContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersFinancialMutations(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersPointsOfSale(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUsersProcessingDeposits(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(l, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersProducts(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (u = (n = O.operationServerMap["UsersApi.getUsersProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, v.default, O.BASE_PATH, r)(P, A || b);
        });
      },
      /**
       *
       * @summary Get an user\'s transactions (from, to or created)
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
      getUsersTransactions(l, i, t, a, s, n, u, d, p, A, P) {
        return h(this, void 0, void 0, function* () {
          var b, f, U;
          const y = yield c.getUsersTransactions(l, i, t, a, s, n, u, d, p, A, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, w = (U = (f = O.operationServerMap["UsersApi.getUsersTransactions"]) === null || f === void 0 ? void 0 : f[E]) === null || U === void 0 ? void 0 : U.url;
          return (I, C) => (0, e.createRequestFunction)(y, v.default, O.BASE_PATH, r)(I, w || C);
        });
      },
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(l, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, A;
          const P = yield c.getUsersTransactionsReport(l, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (A = (p = O.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (U, y) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(U, f || y);
        });
      },
      /**
       *
       * @summary Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(l, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, A;
          const P = yield c.getUsersTransfers(l, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (A = (p = O.operationServerMap["UsersApi.getUsersTransfers"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (U, y) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(U, f || y);
        });
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUser(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUser"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.updateUserKey(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.updateUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserLocalPassword(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserNfc(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserNfc"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserPin(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserPin"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.waiveUserFines(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["UsersApi.waiveUserFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      }
    };
  };
  o.UsersApiFp = Is;
  const Ms = function(r, c, l) {
    const i = (0, o.UsersApiFp)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(t, a) {
        return i.acceptTos(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(t, a) {
        return i.authenticateAs(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(t, a) {
        return i.createUser(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(t, a) {
        return i.deleteUser(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(t, a) {
        return i.deleteUserKey(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(t, a) {
        return i.deleteUserNfc(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(t, a, s, n, u, d, p, A) {
        return i.getAllUsers(t, a, s, n, u, d, p, A).then((P) => P(l, c));
      },
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(t, a, s, n) {
        return i.getAllUsersOfUserType(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(t, a) {
        return i.getIndividualUser(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(t, a, s, n) {
        return i.getOrganMembers(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(t, a) {
        return i.getUserAuthenticatable(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(t, a) {
        return i.getUserRoles(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(t, a, s, n) {
        return i.getUsersContainers(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(t, a, s, n) {
        return i.getUsersFinancialMutations(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(t, a, s, n) {
        return i.getUsersPointsOfSale(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(t, a) {
        return i.getUsersProcessingDeposits(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(t, a, s, n) {
        return i.getUsersProducts(t, a, s, n).then((u) => u(l, c));
      },
      /**
       *
       * @summary Get an user\'s transactions (from, to or created)
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
      getUsersTransactions(t, a, s, n, u, d, p, A, P, b, f) {
        return i.getUsersTransactions(t, a, s, n, u, d, p, A, P, b, f).then((U) => U(l, c));
      },
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(t, a, s, n, u, d, p) {
        return i.getUsersTransactionsReport(t, a, s, n, u, d, p).then((A) => A(l, c));
      },
      /**
       *
       * @summary Get an user\'s transfers
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(t, a, s, n, u, d, p) {
        return i.getUsersTransfers(t, a, s, n, u, d, p).then((A) => A(l, c));
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(t, a, s) {
        return i.updateUser(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(t, a) {
        return i.updateUserKey(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(t, a, s) {
        return i.updateUserLocalPassword(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(t, a, s) {
        return i.updateUserNfc(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(t, a, s) {
        return i.updateUserPin(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(t, a) {
        return i.waiveUserFines(t, a).then((s) => s(l, c));
      }
    };
  };
  o.UsersApiFactory = Ms;
  class ws extends O.BaseAPI {
    /**
     *
     * @summary Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(c, l) {
      return (0, o.UsersApiFp)(this.configuration).acceptTos(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(c, l) {
      return (0, o.UsersApiFp)(this.configuration).authenticateAs(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(c, l) {
      return (0, o.UsersApiFp)(this.configuration).createUser(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(c, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUser(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(c, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUserKey(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(c, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUserNfc(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {string} [search] Filter based on first name
     * @param {boolean} [active] Filter based if the user is active
     * @param {boolean} [ofAge] Filter based if the user is 18+
     * @param {number} [id] Filter based on user ID
     * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsers(c, l, i, t, a, s, n, u) {
      return (0, o.UsersApiFp)(this.configuration).getAllUsers(c, l, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users of user type
     * @param {string} userType The userType of the requested users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsersOfUserType(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getAllUsersOfUserType(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(c, l) {
      return (0, o.UsersApiFp)(this.configuration).getIndividualUser(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an organs members
     * @param {number} id The id of the user
     * @param {number} [take] How many members the endpoint should return
     * @param {number} [skip] How many members should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getOrganMembers(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getOrganMembers(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(c, l) {
      return (0, o.UsersApiFp)(this.configuration).getUserAuthenticatable(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(c, l) {
      return (0, o.UsersApiFp)(this.configuration).getUserRoles(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the user\'s containers
     * @param {number} id The id of the user
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersContainers(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersContainers(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all financial mutations of a user.
     * @param {number} id The id of the user to get the mutations from
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersFinancialMutations(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersFinancialMutations(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the user\'s Points of Sale
     * @param {number} id The id of the user
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersPointsOfSale(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersPointsOfSale(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(c, l) {
      return (0, o.UsersApiFp)(this.configuration).getUsersProcessingDeposits(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an user\'s products
     * @param {number} id The id of the user
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProducts(c, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersProducts(c, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an user\'s transactions (from, to or created)
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
    getUsersTransactions(c, l, i, t, a, s, n, u, d, p, A) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransactions(c, l, i, t, a, s, n, u, d, p, A).then((P) => P(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get transaction report for the given user
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
    getUsersTransactionsReport(c, l, i, t, a, s, n) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransactionsReport(c, l, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an user\'s transfers
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
    getUsersTransfers(c, l, i, t, a, s, n) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransfers(c, l, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update a user
     * @param {number} id The id of the user
     * @param {UpdateUserRequest} updateUserRequest The user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUser(c, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUser(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(c, l) {
      return (0, o.UsersApiFp)(this.configuration).updateUserKey(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} updateLocalRequest    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(c, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserLocalPassword(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(c, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserNfc(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(c, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserPin(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Waive all given user\'s fines
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    waiveUserFines(c, l) {
      return (0, o.UsersApiFp)(this.configuration).waiveUserFines(c, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.UsersApi = ws, o.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const xs = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVatGroup", "vatGroupRequest", i);
        const a = "/vatgroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups: (c, l, i, t, a, s, ...n) => h(this, [c, l, i, t, a, s, ...n], void 0, function* (u, d, p, A, P, b, f = {}) {
        const U = "/vatgroups", y = new URL(U, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const w = Object.assign(Object.assign({ method: "GET" }, E), f), I = {}, C = {};
        yield (0, e.setBearerAuthToObject)(I, r), u !== void 0 && (C.vatGroupId = u), d !== void 0 && (C.name = d), p !== void 0 && (C.percentage = p), A !== void 0 && (C.deleted = A), P !== void 0 && (C.take = P), b !== void 0 && (C.skip = b), (0, e.setSearchParams)(y, C);
        let L = E && E.headers ? E.headers : {};
        return w.headers = Object.assign(Object.assign(Object.assign({}, I), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: w
        };
      }),
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleVatGroup", "id", i);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", t), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", a);
        const n = "/vatgroups/declaration", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.year = t), a !== void 0 && (P.period = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVatGroup", "id", t), (0, e.assertParamExists)("updateVatGroup", "updateVatGroupRequest", a);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.VatGroupsApiAxiosParamCreator = xs;
  const Ls = function(r) {
    const c = (0, o.VatGroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createVatGroup(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["VatGroupsApi.createVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(l, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, A;
          const P = yield c.getAllVatGroups(l, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (A = (p = O.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (U, y) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(U, f || y);
        });
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleVatGroup(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getVatDeclarationAmounts(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVatGroup(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.VatGroupsApiFp = Ls;
  const qs = function(r, c, l) {
    const i = (0, o.VatGroupsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(t, a) {
        return i.createVatGroup(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(t, a, s, n, u, d, p) {
        return i.getAllVatGroups(t, a, s, n, u, d, p).then((A) => A(l, c));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(t, a) {
        return i.getSingleVatGroup(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(t, a, s) {
        return i.getVatDeclarationAmounts(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(t, a, s) {
        return i.updateVatGroup(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.VatGroupsApiFactory = qs;
  class Ds extends O.BaseAPI {
    /**
     *
     * @summary Create a new VAT group
     * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(c, l) {
      return (0, o.VatGroupsApiFp)(this.configuration).createVatGroup(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all VAT groups
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
    getAllVatGroups(c, l, i, t, a, s, n) {
      return (0, o.VatGroupsApiFp)(this.configuration).getAllVatGroups(c, l, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(c, l) {
      return (0, o.VatGroupsApiFp)(this.configuration).getSingleVatGroup(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get the VAT collections needed for VAT declarations
     * @param {number} year Calendar year for VAT declarations
     * @param {string} period Period for VAT declarations
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getVatDeclarationAmounts(c, l, i) {
      return (0, o.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(c, l, i) {
      return (0, o.VatGroupsApiFp)(this.configuration).updateVatGroup(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.VatGroupsApi = Ds;
  const Hs = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVouchergroup", "voucherGroupRequest", i);
        const a = "/vouchergroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/vouchergroups", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId: (c, ...l) => h(this, [c, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getVouchergroupId", "id", i);
        const a = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup: (c, l, ...i) => h(this, [c, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVoucherGroup", "id", t), (0, e.assertParamExists)("updateVoucherGroup", "voucherGroupRequest", a);
        const n = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  o.VouchergroupsApiAxiosParamCreator = Hs;
  const Ns = function(r) {
    const c = (0, o.VouchergroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createVouchergroup(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllVouchergroups(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(l, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getVouchergroupId(l, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = O.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, d || A);
        });
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(l, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVoucherGroup(l, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.VouchergroupsApiFp = Ns;
  const Gs = function(r, c, l) {
    const i = (0, o.VouchergroupsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(t, a) {
        return i.createVouchergroup(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(t, a, s) {
        return i.getAllVouchergroups(t, a, s).then((n) => n(l, c));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(t, a) {
        return i.getVouchergroupId(t, a).then((s) => s(l, c));
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(t, a, s) {
        return i.updateVoucherGroup(t, a, s).then((n) => n(l, c));
      }
    };
  };
  o.VouchergroupsApiFactory = Gs;
  class ks extends O.BaseAPI {
    /**
     *
     * @summary Creates a new voucher group
     * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    createVouchergroup(c, l) {
      return (0, o.VouchergroupsApiFp)(this.configuration).createVouchergroup(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing voucher groups
     * @param {number} [take] How many voucher groups the endpoint should return
     * @param {number} [skip] How many voucher groups should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getAllVouchergroups(c, l, i) {
      return (0, o.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(c, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested voucher group
     * @param {number} id The id of the voucher group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getVouchergroupId(c, l) {
      return (0, o.VouchergroupsApiFp)(this.configuration).getVouchergroupId(c, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested voucher group
     * @param {number} id The id of the voucher group which should be updated
     * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    updateVoucherGroup(c, l, i) {
      return (0, o.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(c, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.VouchergroupsApi = ks;
})(ot);
var Ve = {};
Object.defineProperty(Ve, "__esModule", { value: !0 });
Ve.Configuration = void 0;
class Kr {
  constructor(h = {}) {
    this.apiKey = h.apiKey, this.username = h.username, this.password = h.password, this.accessToken = h.accessToken, this.basePath = h.basePath, this.serverIndex = h.serverIndex, this.baseOptions = h.baseOptions, this.formDataCtor = h.formDataCtor;
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
  isJsonMime(h) {
    const v = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return h !== null && (v.test(h) || h.toLowerCase() === "application/json-patch+json");
  }
}
Ve.Configuration = Kr;
(function(o) {
  var h = le && le.__createBinding || (Object.create ? function(e, O, m, S) {
    S === void 0 && (S = m);
    var j = Object.getOwnPropertyDescriptor(O, m);
    (!j || ("get" in j ? !O.__esModule : j.writable || j.configurable)) && (j = { enumerable: !0, get: function() {
      return O[m];
    } }), Object.defineProperty(e, S, j);
  } : function(e, O, m, S) {
    S === void 0 && (S = m), e[S] = O[m];
  }), v = le && le.__exportStar || function(e, O) {
    for (var m in e)
      m !== "default" && !Object.prototype.hasOwnProperty.call(O, m) && h(O, e, m);
  };
  Object.defineProperty(o, "__esModule", { value: !0 }), v(ot, o), v(Ve, o);
})(H);
const Y = G.create();
Y.interceptors.response.use((o) => (Xs(o), o));
class tn {
  constructor(h) {
    k(this, "_authenticateApi");
    k(this, "_balanceApi");
    k(this, "_debtorsApi");
    k(this, "_usersApi");
    k(this, "_posApi");
    k(this, "_categoryApi");
    k(this, "_transactionApi");
    k(this, "_bannerApi");
    k(this, "_rootApi");
    k(this, "_voucherGroupApi");
    k(this, "_containerApi");
    k(this, "_filesApi");
    k(this, "_invoicesApi");
    k(this, "_payoutsApi");
    k(this, "_productsApi");
    k(this, "_transfersApi");
    k(this, "_vatGroupsApi");
    k(this, "_stripeApi");
    k(this, "_rbacApi");
    k(this, "_openBannerApi");
    const v = new H.Configuration({
      accessToken: () => Le().token
    });
    this._authenticateApi = new H.AuthenticateApi(v, h, Y), this._balanceApi = new H.BalanceApi(v, h, Y), this._debtorsApi = new H.DebtorsApi(v, h, Y), this._usersApi = new H.UsersApi(v, h, Y), this._posApi = new H.PointofsaleApi(v, h, Y), this._categoryApi = new H.ProductCategoriesApi(v, h, Y), this._transactionApi = new H.TransactionsApi(v, h, Y), this._bannerApi = new H.BannersApi(v, h, Y), this._openBannerApi = new H.BannersApi(void 0, h, Y), this._rootApi = new H.RootApi(), this._voucherGroupApi = new H.VouchergroupsApi(v, h, Y), this._containerApi = new H.ContainersApi(v, h, Y), this._filesApi = new H.FilesApi(v, h, Y), this._invoicesApi = new H.InvoicesApi(v, h, Y), this._payoutsApi = new H.PayoutRequestsApi(v, h, Y), this._productsApi = new H.ProductsApi(v, h, Y), this._transfersApi = new H.TransfersApi(v, h, Y), this._vatGroupsApi = new H.VatGroupsApi(v, h, Y), this._stripeApi = new H.StripeApi(v, h, Y), this._rbacApi = new H.RbacApi(v, h, Y);
  }
  get authenticate() {
    return this._authenticateApi;
  }
  get balance() {
    return this._balanceApi;
  }
  get debtor() {
    return this._debtorsApi;
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
    return this._voucherGroupApi;
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
function sn(o) {
  o.mask.addEventListener("click", function(h) {
    h.target === o.mask && o.close();
  });
}
export {
  tn as ApiService,
  sn as addListenerOnDialogueOverlay,
  Zs as clearTokenInStorage,
  Ks as fetchAllPages,
  Le as getTokenFromStorage,
  sa as isAuthenticated,
  ta as isTokenExpired,
  ea as parseToken,
  Xr as populateStoresFromToken,
  it as setTokenInStorage,
  Xs as updateTokenIfNecessary,
  aa as useAuthStore,
  rt as useUserStore
};
