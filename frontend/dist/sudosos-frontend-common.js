var ws = Object.defineProperty;
var xs = (c, d, p) => d in c ? ws(c, d, { enumerable: !0, configurable: !0, writable: !0, value: p }) : c[d] = p;
var q = (c, d, p) => (xs(c, typeof d != "symbol" ? d + "" : d, p), p);
import { createPinia as Ls, defineStore as $e } from "pinia";
async function qs(c, d, p) {
  let s = c, v = [];
  for (; ; ) {
    const P = await p(d, s), { records: b } = P.data;
    if (v = v.concat(b), s += d, P.data._pagination.count <= s + d)
      break;
  }
  return v;
}
Ls();
const ze = $e("user", {
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
    getUserById: (c) => (d) => c.users.find((p) => p.id === d),
    getActiveUsers() {
      return this.users.filter((c) => c.active);
    },
    getDeletedUsers() {
      return this.users.filter((c) => c.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(c) {
      this.users = await qs(0, 500, (d, p) => c.user.getAllUsers(d, p));
    },
    async fetchCurrentUserBalance(c, d) {
      this.current.balance = (await d.balance.getBalanceId(c)).data;
    },
    async fetchUsersFinancialMutations(c, d, p, s) {
      this.current.financialMutations = (await d.user.getUsersFinancialMutations(c, p, s)).data;
    },
    setCurrentUser(c) {
      this.current.user = c;
    },
    addUser(c) {
      this.users.push(c);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(c) {
      const d = this.users.findIndex((p) => p.id === c);
      d !== -1 && this.users.splice(d, 1);
    }
  }
});
class ae extends Error {
}
ae.prototype.name = "InvalidTokenError";
function Ds(c) {
  return decodeURIComponent(atob(c).replace(/(.)/g, (d, p) => {
    let s = p.charCodeAt(0).toString(16).toUpperCase();
    return s.length < 2 && (s = "0" + s), "%" + s;
  }));
}
function Hs(c) {
  let d = c.replace(/-/g, "+").replace(/_/g, "/");
  switch (d.length % 4) {
    case 0:
      break;
    case 2:
      d += "==";
      break;
    case 3:
      d += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return Ds(d);
  } catch {
    return atob(d);
  }
}
function Ke(c, d) {
  if (typeof c != "string")
    throw new ae("Invalid token specified: must be a string");
  d || (d = {});
  const p = d.header === !0 ? 0 : 1, s = c.split(".")[p];
  if (typeof s != "string")
    throw new ae(`Invalid token specified: missing part #${p + 1}`);
  let v;
  try {
    v = Hs(s);
  } catch (P) {
    throw new ae(`Invalid token specified: invalid base64 for part #${p + 1} (${P.message})`);
  }
  try {
    return JSON.parse(v);
  } catch (P) {
    throw new ae(`Invalid token specified: invalid json for part #${p + 1} (${P.message})`);
  }
}
function Ns(c) {
  if (c.headers.has("Set-Authorization")) {
    const d = c.headers.get("Set-Authorization");
    d && We(d);
  }
}
function Gs() {
  localStorage.clear();
}
function ks(c) {
  const d = String(Ke(c).exp);
  return { token: c, expires: d };
}
function We(c) {
  localStorage.setItem("jwt_token", JSON.stringify(ks(c)));
}
function Re() {
  const c = localStorage.getItem("jwt_token");
  let d = {};
  return c !== null && (d = JSON.parse(c)), {
    ...d
  };
}
function Qs(c) {
  const d = c * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > d;
}
function Ys() {
  const c = Re();
  return !c.token || !c.expires ? !1 : !Qs(Number(c.expires));
}
function Nr(c) {
  if (Ys()) {
    const p = $s();
    p.extractStateFromToken();
    const s = p.getUser;
    if (s) {
      const v = ze();
      v.setCurrentUser(s), v.fetchCurrentUserBalance(s.id, c);
    }
  }
}
const $s = $e({
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
    handleResponse(c, d) {
      const { user: p, token: s, roles: v, organs: P, acceptedToS: b } = c;
      !p || !s || !v || !P || !b || (this.user = p, this.token = s, We(this.token), this.roles = v, this.organs = P, this.acceptedToS = b, this.acceptedToS === "ACCEPTED" && d.user.getIndividualUser(this.user.id).then((g) => {
        ze().setCurrentUser(g.data);
      }));
    },
    async gewisPinlogin(c, d, p) {
      const s = {
        gewisId: parseInt(c, 10),
        pin: d
      };
      await p.authenticate.gewisPinAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async ldapLogin(c, d, p) {
      const s = {
        accountName: c,
        password: d
      };
      await p.authenticate.ldapAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async gewisWebLogin(c, d, p) {
      const s = {
        nonce: c,
        token: d
      };
      await p.authenticate.gewisWebAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async externalPinLogin(c, d, p) {
      const s = {
        pin: d,
        userId: c
      };
      await p.authenticate.pinAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async eanLogin(c, d) {
      const p = {
        eanCode: c
      };
      await d.authenticate.eanAuthentication(p).then((s) => {
        this.handleResponse(s.data, d);
      });
    },
    async apiKeyLogin(c, d, p) {
      const s = {
        key: c,
        userId: d
      };
      await p.authenticate.keyAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async gewisLdapLogin(c, d, p) {
      const s = {
        accountName: c,
        password: d
      };
      await p.authenticate.gewisLDAPAuthentication(s).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async updateUserPin(c, d) {
      if (!this.user)
        return;
      const p = {
        pin: c
      };
      await d.user.updateUserPin(this.user.id, p);
    },
    async updateUserLocalPassword(c, d) {
      if (!this.user)
        return;
      const p = {
        password: c
      };
      await d.user.updateUserLocalPassword(this.user.id, p);
    },
    async updateUserNfc(c, d) {
      if (!this.user)
        return;
      const p = {
        nfcCode: c
      };
      await d.user.updateUserNfc(this.user.id, p);
    },
    async updateUserKey(c) {
      if (this.user)
        return (await c.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(c, d) {
      if (!this.user)
        return;
      const p = {
        extensiveDataProcessing: c
      };
      await d.user.acceptTos(p);
      const s = await d.authenticate.refreshToken();
      this.handleResponse(s.data, d);
    },
    extractStateFromToken() {
      const c = Re();
      if (!c.token)
        return;
      const d = Ke(c.token);
      this.user = d.user, this.roles = d.roles, this.token = c.token, this.organs = d.organs, this.acceptedToS = d.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, Gs();
    }
  }
});
var J = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function zs(c) {
  if (c.__esModule)
    return c;
  var d = c.default;
  if (typeof d == "function") {
    var p = function s() {
      return this instanceof s ? Reflect.construct(d, arguments, this.constructor) : d.apply(this, arguments);
    };
    p.prototype = d.prototype;
  } else
    p = {};
  return Object.defineProperty(p, "__esModule", { value: !0 }), Object.keys(c).forEach(function(s) {
    var v = Object.getOwnPropertyDescriptor(c, s);
    Object.defineProperty(p, s, v.get ? v : {
      enumerable: !0,
      get: function() {
        return c[s];
      }
    });
  }), p;
}
var x = {}, Je = {};
function Xe(c, d) {
  return function() {
    return c.apply(d, arguments);
  };
}
const { toString: Ks } = Object.prototype, { getPrototypeOf: Ee } = Object, ue = /* @__PURE__ */ ((c) => (d) => {
  const p = Ks.call(d);
  return c[p] || (c[p] = p.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), z = (c) => (c = c.toLowerCase(), (d) => ue(d) === c), he = (c) => (d) => typeof d === c, { isArray: ee } = Array, re = he("undefined");
function Ws(c) {
  return c !== null && !re(c) && c.constructor !== null && !re(c.constructor) && k(c.constructor.isBuffer) && c.constructor.isBuffer(c);
}
const Ze = z("ArrayBuffer");
function Js(c) {
  let d;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? d = ArrayBuffer.isView(c) : d = c && c.buffer && Ze(c.buffer), d;
}
const Xs = he("string"), k = he("function"), et = he("number"), pe = (c) => c !== null && typeof c == "object", Zs = (c) => c === !0 || c === !1, oe = (c) => {
  if (ue(c) !== "object")
    return !1;
  const d = Ee(c);
  return (d === null || d === Object.prototype || Object.getPrototypeOf(d) === null) && !(Symbol.toStringTag in c) && !(Symbol.iterator in c);
}, ea = z("Date"), ta = z("File"), sa = z("Blob"), aa = z("FileList"), ra = (c) => pe(c) && k(c.pipe), na = (c) => {
  let d;
  return c && (typeof FormData == "function" && c instanceof FormData || k(c.append) && ((d = ue(c)) === "formdata" || // detect form-data instance
  d === "object" && k(c.toString) && c.toString() === "[object FormData]"));
}, ia = z("URLSearchParams"), oa = (c) => c.trim ? c.trim() : c.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function ne(c, d, { allOwnKeys: p = !1 } = {}) {
  if (c === null || typeof c > "u")
    return;
  let s, v;
  if (typeof c != "object" && (c = [c]), ee(c))
    for (s = 0, v = c.length; s < v; s++)
      d.call(null, c[s], s, c);
  else {
    const P = p ? Object.getOwnPropertyNames(c) : Object.keys(c), b = P.length;
    let g;
    for (s = 0; s < b; s++)
      g = P[s], d.call(null, c[g], g, c);
  }
}
function tt(c, d) {
  d = d.toLowerCase();
  const p = Object.keys(c);
  let s = p.length, v;
  for (; s-- > 0; )
    if (v = p[s], d === v.toLowerCase())
      return v;
  return null;
}
const st = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, at = (c) => !re(c) && c !== st;
function ge() {
  const { caseless: c } = at(this) && this || {}, d = {}, p = (s, v) => {
    const P = c && tt(d, v) || v;
    oe(d[P]) && oe(s) ? d[P] = ge(d[P], s) : oe(s) ? d[P] = ge({}, s) : ee(s) ? d[P] = s.slice() : d[P] = s;
  };
  for (let s = 0, v = arguments.length; s < v; s++)
    arguments[s] && ne(arguments[s], p);
  return d;
}
const la = (c, d, p, { allOwnKeys: s } = {}) => (ne(d, (v, P) => {
  p && k(v) ? c[P] = Xe(v, p) : c[P] = v;
}, { allOwnKeys: s }), c), ca = (c) => (c.charCodeAt(0) === 65279 && (c = c.slice(1)), c), da = (c, d, p, s) => {
  c.prototype = Object.create(d.prototype, s), c.prototype.constructor = c, Object.defineProperty(c, "super", {
    value: d.prototype
  }), p && Object.assign(c.prototype, p);
}, ua = (c, d, p, s) => {
  let v, P, b;
  const g = {};
  if (d = d || {}, c == null)
    return d;
  do {
    for (v = Object.getOwnPropertyNames(c), P = v.length; P-- > 0; )
      b = v[P], (!s || s(b, c, d)) && !g[b] && (d[b] = c[b], g[b] = !0);
    c = p !== !1 && Ee(c);
  } while (c && (!p || p(c, d)) && c !== Object.prototype);
  return d;
}, ha = (c, d, p) => {
  c = String(c), (p === void 0 || p > c.length) && (p = c.length), p -= d.length;
  const s = c.indexOf(d, p);
  return s !== -1 && s === p;
}, pa = (c) => {
  if (!c)
    return null;
  if (ee(c))
    return c;
  let d = c.length;
  if (!et(d))
    return null;
  const p = new Array(d);
  for (; d-- > 0; )
    p[d] = c[d];
  return p;
}, va = /* @__PURE__ */ ((c) => (d) => c && d instanceof c)(typeof Uint8Array < "u" && Ee(Uint8Array)), Aa = (c, d) => {
  const s = (c && c[Symbol.iterator]).call(c);
  let v;
  for (; (v = s.next()) && !v.done; ) {
    const P = v.value;
    d.call(c, P[0], P[1]);
  }
}, Oa = (c, d) => {
  let p;
  const s = [];
  for (; (p = c.exec(d)) !== null; )
    s.push(p);
  return s;
}, Pa = z("HTMLFormElement"), ba = (c) => c.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(p, s, v) {
    return s.toUpperCase() + v;
  }
), we = (({ hasOwnProperty: c }) => (d, p) => c.call(d, p))(Object.prototype), ma = z("RegExp"), rt = (c, d) => {
  const p = Object.getOwnPropertyDescriptors(c), s = {};
  ne(p, (v, P) => {
    let b;
    (b = d(v, P, c)) !== !1 && (s[P] = b || v);
  }), Object.defineProperties(c, s);
}, Sa = (c) => {
  rt(c, (d, p) => {
    if (k(c) && ["arguments", "caller", "callee"].indexOf(p) !== -1)
      return !1;
    const s = c[p];
    if (k(s)) {
      if (d.enumerable = !1, "writable" in d) {
        d.writable = !1;
        return;
      }
      d.set || (d.set = () => {
        throw Error("Can not rewrite read-only method '" + p + "'");
      });
    }
  });
}, fa = (c, d) => {
  const p = {}, s = (v) => {
    v.forEach((P) => {
      p[P] = !0;
    });
  };
  return ee(c) ? s(c) : s(String(c).split(d)), p;
}, ga = () => {
}, ja = (c, d) => (c = +c, Number.isFinite(c) ? c : d), be = "abcdefghijklmnopqrstuvwxyz", xe = "0123456789", nt = {
  DIGIT: xe,
  ALPHA: be,
  ALPHA_DIGIT: be + be.toUpperCase() + xe
}, Ua = (c = 16, d = nt.ALPHA_DIGIT) => {
  let p = "";
  const { length: s } = d;
  for (; c--; )
    p += d[Math.random() * s | 0];
  return p;
};
function Va(c) {
  return !!(c && k(c.append) && c[Symbol.toStringTag] === "FormData" && c[Symbol.iterator]);
}
const _a = (c) => {
  const d = new Array(10), p = (s, v) => {
    if (pe(s)) {
      if (d.indexOf(s) >= 0)
        return;
      if (!("toJSON" in s)) {
        d[v] = s;
        const P = ee(s) ? [] : {};
        return ne(s, (b, g) => {
          const y = p(b, v + 1);
          !re(y) && (P[g] = y);
        }), d[v] = void 0, P;
      }
    }
    return s;
  };
  return p(c, 0);
}, ya = z("AsyncFunction"), Ra = (c) => c && (pe(c) || k(c)) && k(c.then) && k(c.catch), S = {
  isArray: ee,
  isArrayBuffer: Ze,
  isBuffer: Ws,
  isFormData: na,
  isArrayBufferView: Js,
  isString: Xs,
  isNumber: et,
  isBoolean: Zs,
  isObject: pe,
  isPlainObject: oe,
  isUndefined: re,
  isDate: ea,
  isFile: ta,
  isBlob: sa,
  isRegExp: ma,
  isFunction: k,
  isStream: ra,
  isURLSearchParams: ia,
  isTypedArray: va,
  isFileList: aa,
  forEach: ne,
  merge: ge,
  extend: la,
  trim: oa,
  stripBOM: ca,
  inherits: da,
  toFlatObject: ua,
  kindOf: ue,
  kindOfTest: z,
  endsWith: ha,
  toArray: pa,
  forEachEntry: Aa,
  matchAll: Oa,
  isHTMLForm: Pa,
  hasOwnProperty: we,
  hasOwnProp: we,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: rt,
  freezeMethods: Sa,
  toObjectSet: fa,
  toCamelCase: ba,
  noop: ga,
  toFiniteNumber: ja,
  findKey: tt,
  global: st,
  isContextDefined: at,
  ALPHABET: nt,
  generateString: Ua,
  isSpecCompliantForm: Va,
  toJSONObject: _a,
  isAsyncFn: ya,
  isThenable: Ra
};
function C(c, d, p, s, v) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = c, this.name = "AxiosError", d && (this.code = d), p && (this.config = p), s && (this.request = s), v && (this.response = v);
}
S.inherits(C, Error, {
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
const it = C.prototype, ot = {};
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
].forEach((c) => {
  ot[c] = { value: c };
});
Object.defineProperties(C, ot);
Object.defineProperty(it, "isAxiosError", { value: !0 });
C.from = (c, d, p, s, v, P) => {
  const b = Object.create(it);
  return S.toFlatObject(c, b, function(y) {
    return y !== Error.prototype;
  }, (g) => g !== "isAxiosError"), C.call(b, c.message, d, p, s, v), b.cause = c, b.name = c.name, P && Object.assign(b, P), b;
};
const Ea = null;
function je(c) {
  return S.isPlainObject(c) || S.isArray(c);
}
function lt(c) {
  return S.endsWith(c, "[]") ? c.slice(0, -2) : c;
}
function Le(c, d, p) {
  return c ? c.concat(d).map(function(v, P) {
    return v = lt(v), !p && P ? "[" + v + "]" : v;
  }).join(p ? "." : "") : d;
}
function Ta(c) {
  return S.isArray(c) && !c.some(je);
}
const Ba = S.toFlatObject(S, {}, null, function(d) {
  return /^is[A-Z]/.test(d);
});
function ve(c, d, p) {
  if (!S.isObject(c))
    throw new TypeError("target must be an object");
  d = d || new FormData(), p = S.toFlatObject(p, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(E, D) {
    return !S.isUndefined(D[E]);
  });
  const s = p.metaTokens, v = p.visitor || V, P = p.dots, b = p.indexes, y = (p.Blob || typeof Blob < "u" && Blob) && S.isSpecCompliantForm(d);
  if (!S.isFunction(v))
    throw new TypeError("visitor must be a function");
  function T(R) {
    if (R === null)
      return "";
    if (S.isDate(R))
      return R.toISOString();
    if (!y && S.isBlob(R))
      throw new C("Blob is not supported. Use a Buffer instead.");
    return S.isArrayBuffer(R) || S.isTypedArray(R) ? y && typeof Blob == "function" ? new Blob([R]) : Buffer.from(R) : R;
  }
  function V(R, E, D) {
    let N = R;
    if (R && !D && typeof R == "object") {
      if (S.endsWith(E, "{}"))
        E = s ? E : E.slice(0, -2), R = JSON.stringify(R);
      else if (S.isArray(R) && Ta(R) || (S.isFileList(R) || S.endsWith(E, "[]")) && (N = S.toArray(R)))
        return E = lt(E), N.forEach(function(Y, Pe) {
          !(S.isUndefined(Y) || Y === null) && d.append(
            // eslint-disable-next-line no-nested-ternary
            b === !0 ? Le([E], Pe, P) : b === null ? E : E + "[]",
            T(Y)
          );
        }), !1;
    }
    return je(R) ? !0 : (d.append(Le(D, E, P), T(R)), !1);
  }
  const U = [], L = Object.assign(Ba, {
    defaultVisitor: V,
    convertValue: T,
    isVisitable: je
  });
  function G(R, E) {
    if (!S.isUndefined(R)) {
      if (U.indexOf(R) !== -1)
        throw Error("Circular reference detected in " + E.join("."));
      U.push(R), S.forEach(R, function(N, Q) {
        (!(S.isUndefined(N) || N === null) && v.call(
          d,
          N,
          S.isString(Q) ? Q.trim() : Q,
          E,
          L
        )) === !0 && G(N, E ? E.concat(Q) : [Q]);
      }), U.pop();
    }
  }
  if (!S.isObject(c))
    throw new TypeError("data must be an object");
  return G(c), d;
}
function qe(c) {
  const d = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(c).replace(/[!'()~]|%20|%00/g, function(s) {
    return d[s];
  });
}
function Te(c, d) {
  this._pairs = [], c && ve(c, this, d);
}
const ct = Te.prototype;
ct.append = function(d, p) {
  this._pairs.push([d, p]);
};
ct.toString = function(d) {
  const p = d ? function(s) {
    return d.call(this, s, qe);
  } : qe;
  return this._pairs.map(function(v) {
    return p(v[0]) + "=" + p(v[1]);
  }, "").join("&");
};
function Fa(c) {
  return encodeURIComponent(c).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function dt(c, d, p) {
  if (!d)
    return c;
  const s = p && p.encode || Fa, v = p && p.serialize;
  let P;
  if (v ? P = v(d, p) : P = S.isURLSearchParams(d) ? d.toString() : new Te(d, p).toString(s), P) {
    const b = c.indexOf("#");
    b !== -1 && (c = c.slice(0, b)), c += (c.indexOf("?") === -1 ? "?" : "&") + P;
  }
  return c;
}
class De {
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
  use(d, p, s) {
    return this.handlers.push({
      fulfilled: d,
      rejected: p,
      synchronous: s ? s.synchronous : !1,
      runWhen: s ? s.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(d) {
    this.handlers[d] && (this.handlers[d] = null);
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
  forEach(d) {
    S.forEach(this.handlers, function(s) {
      s !== null && d(s);
    });
  }
}
const ut = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, Ca = typeof URLSearchParams < "u" ? URLSearchParams : Te, Ia = typeof FormData < "u" ? FormData : null, Ma = typeof Blob < "u" ? Blob : null, wa = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ca,
    FormData: Ia,
    Blob: Ma
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, ht = typeof window < "u" && typeof document < "u", xa = ((c) => ht && ["ReactNative", "NativeScript", "NS"].indexOf(c) < 0)(typeof navigator < "u" && navigator.product), La = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", qa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: ht,
  hasStandardBrowserEnv: xa,
  hasStandardBrowserWebWorkerEnv: La
}, Symbol.toStringTag, { value: "Module" })), $ = {
  ...qa,
  ...wa
};
function Da(c, d) {
  return ve(c, new $.classes.URLSearchParams(), Object.assign({
    visitor: function(p, s, v, P) {
      return $.isNode && S.isBuffer(p) ? (this.append(s, p.toString("base64")), !1) : P.defaultVisitor.apply(this, arguments);
    }
  }, d));
}
function Ha(c) {
  return S.matchAll(/\w+|\[(\w*)]/g, c).map((d) => d[0] === "[]" ? "" : d[1] || d[0]);
}
function Na(c) {
  const d = {}, p = Object.keys(c);
  let s;
  const v = p.length;
  let P;
  for (s = 0; s < v; s++)
    P = p[s], d[P] = c[P];
  return d;
}
function pt(c) {
  function d(p, s, v, P) {
    let b = p[P++];
    const g = Number.isFinite(+b), y = P >= p.length;
    return b = !b && S.isArray(v) ? v.length : b, y ? (S.hasOwnProp(v, b) ? v[b] = [v[b], s] : v[b] = s, !g) : ((!v[b] || !S.isObject(v[b])) && (v[b] = []), d(p, s, v[b], P) && S.isArray(v[b]) && (v[b] = Na(v[b])), !g);
  }
  if (S.isFormData(c) && S.isFunction(c.entries)) {
    const p = {};
    return S.forEachEntry(c, (s, v) => {
      d(Ha(s), v, p, 0);
    }), p;
  }
  return null;
}
function Ga(c, d, p) {
  if (S.isString(c))
    try {
      return (d || JSON.parse)(c), S.trim(c);
    } catch (s) {
      if (s.name !== "SyntaxError")
        throw s;
    }
  return (p || JSON.stringify)(c);
}
const Be = {
  transitional: ut,
  adapter: ["xhr", "http"],
  transformRequest: [function(d, p) {
    const s = p.getContentType() || "", v = s.indexOf("application/json") > -1, P = S.isObject(d);
    if (P && S.isHTMLForm(d) && (d = new FormData(d)), S.isFormData(d))
      return v && v ? JSON.stringify(pt(d)) : d;
    if (S.isArrayBuffer(d) || S.isBuffer(d) || S.isStream(d) || S.isFile(d) || S.isBlob(d))
      return d;
    if (S.isArrayBufferView(d))
      return d.buffer;
    if (S.isURLSearchParams(d))
      return p.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), d.toString();
    let g;
    if (P) {
      if (s.indexOf("application/x-www-form-urlencoded") > -1)
        return Da(d, this.formSerializer).toString();
      if ((g = S.isFileList(d)) || s.indexOf("multipart/form-data") > -1) {
        const y = this.env && this.env.FormData;
        return ve(
          g ? { "files[]": d } : d,
          y && new y(),
          this.formSerializer
        );
      }
    }
    return P || v ? (p.setContentType("application/json", !1), Ga(d)) : d;
  }],
  transformResponse: [function(d) {
    const p = this.transitional || Be.transitional, s = p && p.forcedJSONParsing, v = this.responseType === "json";
    if (d && S.isString(d) && (s && !this.responseType || v)) {
      const b = !(p && p.silentJSONParsing) && v;
      try {
        return JSON.parse(d);
      } catch (g) {
        if (b)
          throw g.name === "SyntaxError" ? C.from(g, C.ERR_BAD_RESPONSE, this, null, this.response) : g;
      }
    }
    return d;
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
    FormData: $.classes.FormData,
    Blob: $.classes.Blob
  },
  validateStatus: function(d) {
    return d >= 200 && d < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
S.forEach(["delete", "get", "head", "post", "put", "patch"], (c) => {
  Be.headers[c] = {};
});
const Fe = Be, ka = S.toObjectSet([
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
]), Qa = (c) => {
  const d = {};
  let p, s, v;
  return c && c.split(`
`).forEach(function(b) {
    v = b.indexOf(":"), p = b.substring(0, v).trim().toLowerCase(), s = b.substring(v + 1).trim(), !(!p || d[p] && ka[p]) && (p === "set-cookie" ? d[p] ? d[p].push(s) : d[p] = [s] : d[p] = d[p] ? d[p] + ", " + s : s);
  }), d;
}, He = Symbol("internals");
function se(c) {
  return c && String(c).trim().toLowerCase();
}
function le(c) {
  return c === !1 || c == null ? c : S.isArray(c) ? c.map(le) : String(c);
}
function Ya(c) {
  const d = /* @__PURE__ */ Object.create(null), p = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let s;
  for (; s = p.exec(c); )
    d[s[1]] = s[2];
  return d;
}
const $a = (c) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(c.trim());
function me(c, d, p, s, v) {
  if (S.isFunction(s))
    return s.call(this, d, p);
  if (v && (d = p), !!S.isString(d)) {
    if (S.isString(s))
      return d.indexOf(s) !== -1;
    if (S.isRegExp(s))
      return s.test(d);
  }
}
function za(c) {
  return c.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (d, p, s) => p.toUpperCase() + s);
}
function Ka(c, d) {
  const p = S.toCamelCase(" " + d);
  ["get", "set", "has"].forEach((s) => {
    Object.defineProperty(c, s + p, {
      value: function(v, P, b) {
        return this[s].call(this, d, v, P, b);
      },
      configurable: !0
    });
  });
}
let Ae = class {
  constructor(d) {
    d && this.set(d);
  }
  set(d, p, s) {
    const v = this;
    function P(g, y, T) {
      const V = se(y);
      if (!V)
        throw new Error("header name must be a non-empty string");
      const U = S.findKey(v, V);
      (!U || v[U] === void 0 || T === !0 || T === void 0 && v[U] !== !1) && (v[U || y] = le(g));
    }
    const b = (g, y) => S.forEach(g, (T, V) => P(T, V, y));
    return S.isPlainObject(d) || d instanceof this.constructor ? b(d, p) : S.isString(d) && (d = d.trim()) && !$a(d) ? b(Qa(d), p) : d != null && P(p, d, s), this;
  }
  get(d, p) {
    if (d = se(d), d) {
      const s = S.findKey(this, d);
      if (s) {
        const v = this[s];
        if (!p)
          return v;
        if (p === !0)
          return Ya(v);
        if (S.isFunction(p))
          return p.call(this, v, s);
        if (S.isRegExp(p))
          return p.exec(v);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(d, p) {
    if (d = se(d), d) {
      const s = S.findKey(this, d);
      return !!(s && this[s] !== void 0 && (!p || me(this, this[s], s, p)));
    }
    return !1;
  }
  delete(d, p) {
    const s = this;
    let v = !1;
    function P(b) {
      if (b = se(b), b) {
        const g = S.findKey(s, b);
        g && (!p || me(s, s[g], g, p)) && (delete s[g], v = !0);
      }
    }
    return S.isArray(d) ? d.forEach(P) : P(d), v;
  }
  clear(d) {
    const p = Object.keys(this);
    let s = p.length, v = !1;
    for (; s--; ) {
      const P = p[s];
      (!d || me(this, this[P], P, d, !0)) && (delete this[P], v = !0);
    }
    return v;
  }
  normalize(d) {
    const p = this, s = {};
    return S.forEach(this, (v, P) => {
      const b = S.findKey(s, P);
      if (b) {
        p[b] = le(v), delete p[P];
        return;
      }
      const g = d ? za(P) : String(P).trim();
      g !== P && delete p[P], p[g] = le(v), s[g] = !0;
    }), this;
  }
  concat(...d) {
    return this.constructor.concat(this, ...d);
  }
  toJSON(d) {
    const p = /* @__PURE__ */ Object.create(null);
    return S.forEach(this, (s, v) => {
      s != null && s !== !1 && (p[v] = d && S.isArray(s) ? s.join(", ") : s);
    }), p;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([d, p]) => d + ": " + p).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(d) {
    return d instanceof this ? d : new this(d);
  }
  static concat(d, ...p) {
    const s = new this(d);
    return p.forEach((v) => s.set(v)), s;
  }
  static accessor(d) {
    const s = (this[He] = this[He] = {
      accessors: {}
    }).accessors, v = this.prototype;
    function P(b) {
      const g = se(b);
      s[g] || (Ka(v, b), s[g] = !0);
    }
    return S.isArray(d) ? d.forEach(P) : P(d), this;
  }
};
Ae.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
S.reduceDescriptors(Ae.prototype, ({ value: c }, d) => {
  let p = d[0].toUpperCase() + d.slice(1);
  return {
    get: () => c,
    set(s) {
      this[p] = s;
    }
  };
});
S.freezeMethods(Ae);
const K = Ae;
function Se(c, d) {
  const p = this || Fe, s = d || p, v = K.from(s.headers);
  let P = s.data;
  return S.forEach(c, function(g) {
    P = g.call(p, P, v.normalize(), d ? d.status : void 0);
  }), v.normalize(), P;
}
function vt(c) {
  return !!(c && c.__CANCEL__);
}
function ie(c, d, p) {
  C.call(this, c ?? "canceled", C.ERR_CANCELED, d, p), this.name = "CanceledError";
}
S.inherits(ie, C, {
  __CANCEL__: !0
});
function Wa(c, d, p) {
  const s = p.config.validateStatus;
  !p.status || !s || s(p.status) ? c(p) : d(new C(
    "Request failed with status code " + p.status,
    [C.ERR_BAD_REQUEST, C.ERR_BAD_RESPONSE][Math.floor(p.status / 100) - 4],
    p.config,
    p.request,
    p
  ));
}
const Ja = $.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(c, d, p, s, v, P) {
      const b = [c + "=" + encodeURIComponent(d)];
      S.isNumber(p) && b.push("expires=" + new Date(p).toGMTString()), S.isString(s) && b.push("path=" + s), S.isString(v) && b.push("domain=" + v), P === !0 && b.push("secure"), document.cookie = b.join("; ");
    },
    read(c) {
      const d = document.cookie.match(new RegExp("(^|;\\s*)(" + c + ")=([^;]*)"));
      return d ? decodeURIComponent(d[3]) : null;
    },
    remove(c) {
      this.write(c, "", Date.now() - 864e5);
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
function Xa(c) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(c);
}
function Za(c, d) {
  return d ? c.replace(/\/?\/$/, "") + "/" + d.replace(/^\/+/, "") : c;
}
function At(c, d) {
  return c && !Xa(d) ? Za(c, d) : d;
}
const er = $.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const d = /(msie|trident)/i.test(navigator.userAgent), p = document.createElement("a");
    let s;
    function v(P) {
      let b = P;
      return d && (p.setAttribute("href", b), b = p.href), p.setAttribute("href", b), {
        href: p.href,
        protocol: p.protocol ? p.protocol.replace(/:$/, "") : "",
        host: p.host,
        search: p.search ? p.search.replace(/^\?/, "") : "",
        hash: p.hash ? p.hash.replace(/^#/, "") : "",
        hostname: p.hostname,
        port: p.port,
        pathname: p.pathname.charAt(0) === "/" ? p.pathname : "/" + p.pathname
      };
    }
    return s = v(window.location.href), function(b) {
      const g = S.isString(b) ? v(b) : b;
      return g.protocol === s.protocol && g.host === s.host;
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
function tr(c) {
  const d = /^([-+\w]{1,25})(:?\/\/|:)/.exec(c);
  return d && d[1] || "";
}
function sr(c, d) {
  c = c || 10;
  const p = new Array(c), s = new Array(c);
  let v = 0, P = 0, b;
  return d = d !== void 0 ? d : 1e3, function(y) {
    const T = Date.now(), V = s[P];
    b || (b = T), p[v] = y, s[v] = T;
    let U = P, L = 0;
    for (; U !== v; )
      L += p[U++], U = U % c;
    if (v = (v + 1) % c, v === P && (P = (P + 1) % c), T - b < d)
      return;
    const G = V && T - V;
    return G ? Math.round(L * 1e3 / G) : void 0;
  };
}
function Ne(c, d) {
  let p = 0;
  const s = sr(50, 250);
  return (v) => {
    const P = v.loaded, b = v.lengthComputable ? v.total : void 0, g = P - p, y = s(g), T = P <= b;
    p = P;
    const V = {
      loaded: P,
      total: b,
      progress: b ? P / b : void 0,
      bytes: g,
      rate: y || void 0,
      estimated: y && b && T ? (b - P) / y : void 0,
      event: v
    };
    V[d ? "download" : "upload"] = !0, c(V);
  };
}
const ar = typeof XMLHttpRequest < "u", rr = ar && function(c) {
  return new Promise(function(p, s) {
    let v = c.data;
    const P = K.from(c.headers).normalize();
    let { responseType: b, withXSRFToken: g } = c, y;
    function T() {
      c.cancelToken && c.cancelToken.unsubscribe(y), c.signal && c.signal.removeEventListener("abort", y);
    }
    let V;
    if (S.isFormData(v)) {
      if ($.hasStandardBrowserEnv || $.hasStandardBrowserWebWorkerEnv)
        P.setContentType(!1);
      else if ((V = P.getContentType()) !== !1) {
        const [E, ...D] = V ? V.split(";").map((N) => N.trim()).filter(Boolean) : [];
        P.setContentType([E || "multipart/form-data", ...D].join("; "));
      }
    }
    let U = new XMLHttpRequest();
    if (c.auth) {
      const E = c.auth.username || "", D = c.auth.password ? unescape(encodeURIComponent(c.auth.password)) : "";
      P.set("Authorization", "Basic " + btoa(E + ":" + D));
    }
    const L = At(c.baseURL, c.url);
    U.open(c.method.toUpperCase(), dt(L, c.params, c.paramsSerializer), !0), U.timeout = c.timeout;
    function G() {
      if (!U)
        return;
      const E = K.from(
        "getAllResponseHeaders" in U && U.getAllResponseHeaders()
      ), N = {
        data: !b || b === "text" || b === "json" ? U.responseText : U.response,
        status: U.status,
        statusText: U.statusText,
        headers: E,
        config: c,
        request: U
      };
      Wa(function(Y) {
        p(Y), T();
      }, function(Y) {
        s(Y), T();
      }, N), U = null;
    }
    if ("onloadend" in U ? U.onloadend = G : U.onreadystatechange = function() {
      !U || U.readyState !== 4 || U.status === 0 && !(U.responseURL && U.responseURL.indexOf("file:") === 0) || setTimeout(G);
    }, U.onabort = function() {
      U && (s(new C("Request aborted", C.ECONNABORTED, c, U)), U = null);
    }, U.onerror = function() {
      s(new C("Network Error", C.ERR_NETWORK, c, U)), U = null;
    }, U.ontimeout = function() {
      let D = c.timeout ? "timeout of " + c.timeout + "ms exceeded" : "timeout exceeded";
      const N = c.transitional || ut;
      c.timeoutErrorMessage && (D = c.timeoutErrorMessage), s(new C(
        D,
        N.clarifyTimeoutError ? C.ETIMEDOUT : C.ECONNABORTED,
        c,
        U
      )), U = null;
    }, $.hasStandardBrowserEnv && (g && S.isFunction(g) && (g = g(c)), g || g !== !1 && er(L))) {
      const E = c.xsrfHeaderName && c.xsrfCookieName && Ja.read(c.xsrfCookieName);
      E && P.set(c.xsrfHeaderName, E);
    }
    v === void 0 && P.setContentType(null), "setRequestHeader" in U && S.forEach(P.toJSON(), function(D, N) {
      U.setRequestHeader(N, D);
    }), S.isUndefined(c.withCredentials) || (U.withCredentials = !!c.withCredentials), b && b !== "json" && (U.responseType = c.responseType), typeof c.onDownloadProgress == "function" && U.addEventListener("progress", Ne(c.onDownloadProgress, !0)), typeof c.onUploadProgress == "function" && U.upload && U.upload.addEventListener("progress", Ne(c.onUploadProgress)), (c.cancelToken || c.signal) && (y = (E) => {
      U && (s(!E || E.type ? new ie(null, c, U) : E), U.abort(), U = null);
    }, c.cancelToken && c.cancelToken.subscribe(y), c.signal && (c.signal.aborted ? y() : c.signal.addEventListener("abort", y)));
    const R = tr(L);
    if (R && $.protocols.indexOf(R) === -1) {
      s(new C("Unsupported protocol " + R + ":", C.ERR_BAD_REQUEST, c));
      return;
    }
    U.send(v || null);
  });
}, Ue = {
  http: Ea,
  xhr: rr
};
S.forEach(Ue, (c, d) => {
  if (c) {
    try {
      Object.defineProperty(c, "name", { value: d });
    } catch {
    }
    Object.defineProperty(c, "adapterName", { value: d });
  }
});
const Ge = (c) => `- ${c}`, nr = (c) => S.isFunction(c) || c === null || c === !1, Ot = {
  getAdapter: (c) => {
    c = S.isArray(c) ? c : [c];
    const { length: d } = c;
    let p, s;
    const v = {};
    for (let P = 0; P < d; P++) {
      p = c[P];
      let b;
      if (s = p, !nr(p) && (s = Ue[(b = String(p)).toLowerCase()], s === void 0))
        throw new C(`Unknown adapter '${b}'`);
      if (s)
        break;
      v[b || "#" + P] = s;
    }
    if (!s) {
      const P = Object.entries(v).map(
        ([g, y]) => `adapter ${g} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let b = d ? P.length > 1 ? `since :
` + P.map(Ge).join(`
`) : " " + Ge(P[0]) : "as no adapter specified";
      throw new C(
        "There is no suitable adapter to dispatch the request " + b,
        "ERR_NOT_SUPPORT"
      );
    }
    return s;
  },
  adapters: Ue
};
function fe(c) {
  if (c.cancelToken && c.cancelToken.throwIfRequested(), c.signal && c.signal.aborted)
    throw new ie(null, c);
}
function ke(c) {
  return fe(c), c.headers = K.from(c.headers), c.data = Se.call(
    c,
    c.transformRequest
  ), ["post", "put", "patch"].indexOf(c.method) !== -1 && c.headers.setContentType("application/x-www-form-urlencoded", !1), Ot.getAdapter(c.adapter || Fe.adapter)(c).then(function(s) {
    return fe(c), s.data = Se.call(
      c,
      c.transformResponse,
      s
    ), s.headers = K.from(s.headers), s;
  }, function(s) {
    return vt(s) || (fe(c), s && s.response && (s.response.data = Se.call(
      c,
      c.transformResponse,
      s.response
    ), s.response.headers = K.from(s.response.headers))), Promise.reject(s);
  });
}
const Qe = (c) => c instanceof K ? c.toJSON() : c;
function Z(c, d) {
  d = d || {};
  const p = {};
  function s(T, V, U) {
    return S.isPlainObject(T) && S.isPlainObject(V) ? S.merge.call({ caseless: U }, T, V) : S.isPlainObject(V) ? S.merge({}, V) : S.isArray(V) ? V.slice() : V;
  }
  function v(T, V, U) {
    if (S.isUndefined(V)) {
      if (!S.isUndefined(T))
        return s(void 0, T, U);
    } else
      return s(T, V, U);
  }
  function P(T, V) {
    if (!S.isUndefined(V))
      return s(void 0, V);
  }
  function b(T, V) {
    if (S.isUndefined(V)) {
      if (!S.isUndefined(T))
        return s(void 0, T);
    } else
      return s(void 0, V);
  }
  function g(T, V, U) {
    if (U in d)
      return s(T, V);
    if (U in c)
      return s(void 0, T);
  }
  const y = {
    url: P,
    method: P,
    data: P,
    baseURL: b,
    transformRequest: b,
    transformResponse: b,
    paramsSerializer: b,
    timeout: b,
    timeoutMessage: b,
    withCredentials: b,
    withXSRFToken: b,
    adapter: b,
    responseType: b,
    xsrfCookieName: b,
    xsrfHeaderName: b,
    onUploadProgress: b,
    onDownloadProgress: b,
    decompress: b,
    maxContentLength: b,
    maxBodyLength: b,
    beforeRedirect: b,
    transport: b,
    httpAgent: b,
    httpsAgent: b,
    cancelToken: b,
    socketPath: b,
    responseEncoding: b,
    validateStatus: g,
    headers: (T, V) => v(Qe(T), Qe(V), !0)
  };
  return S.forEach(Object.keys(Object.assign({}, c, d)), function(V) {
    const U = y[V] || v, L = U(c[V], d[V], V);
    S.isUndefined(L) && U !== g || (p[V] = L);
  }), p;
}
const Pt = "1.6.3", Ce = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((c, d) => {
  Ce[c] = function(s) {
    return typeof s === c || "a" + (d < 1 ? "n " : " ") + c;
  };
});
const Ye = {};
Ce.transitional = function(d, p, s) {
  function v(P, b) {
    return "[Axios v" + Pt + "] Transitional option '" + P + "'" + b + (s ? ". " + s : "");
  }
  return (P, b, g) => {
    if (d === !1)
      throw new C(
        v(b, " has been removed" + (p ? " in " + p : "")),
        C.ERR_DEPRECATED
      );
    return p && !Ye[b] && (Ye[b] = !0, console.warn(
      v(
        b,
        " has been deprecated since v" + p + " and will be removed in the near future"
      )
    )), d ? d(P, b, g) : !0;
  };
};
function ir(c, d, p) {
  if (typeof c != "object")
    throw new C("options must be an object", C.ERR_BAD_OPTION_VALUE);
  const s = Object.keys(c);
  let v = s.length;
  for (; v-- > 0; ) {
    const P = s[v], b = d[P];
    if (b) {
      const g = c[P], y = g === void 0 || b(g, P, c);
      if (y !== !0)
        throw new C("option " + P + " must be " + y, C.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (p !== !0)
      throw new C("Unknown option " + P, C.ERR_BAD_OPTION);
  }
}
const Ve = {
  assertOptions: ir,
  validators: Ce
}, W = Ve.validators;
let de = class {
  constructor(d) {
    this.defaults = d, this.interceptors = {
      request: new De(),
      response: new De()
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
  request(d, p) {
    typeof d == "string" ? (p = p || {}, p.url = d) : p = d || {}, p = Z(this.defaults, p);
    const { transitional: s, paramsSerializer: v, headers: P } = p;
    s !== void 0 && Ve.assertOptions(s, {
      silentJSONParsing: W.transitional(W.boolean),
      forcedJSONParsing: W.transitional(W.boolean),
      clarifyTimeoutError: W.transitional(W.boolean)
    }, !1), v != null && (S.isFunction(v) ? p.paramsSerializer = {
      serialize: v
    } : Ve.assertOptions(v, {
      encode: W.function,
      serialize: W.function
    }, !0)), p.method = (p.method || this.defaults.method || "get").toLowerCase();
    let b = P && S.merge(
      P.common,
      P[p.method]
    );
    P && S.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (R) => {
        delete P[R];
      }
    ), p.headers = K.concat(b, P);
    const g = [];
    let y = !0;
    this.interceptors.request.forEach(function(E) {
      typeof E.runWhen == "function" && E.runWhen(p) === !1 || (y = y && E.synchronous, g.unshift(E.fulfilled, E.rejected));
    });
    const T = [];
    this.interceptors.response.forEach(function(E) {
      T.push(E.fulfilled, E.rejected);
    });
    let V, U = 0, L;
    if (!y) {
      const R = [ke.bind(this), void 0];
      for (R.unshift.apply(R, g), R.push.apply(R, T), L = R.length, V = Promise.resolve(p); U < L; )
        V = V.then(R[U++], R[U++]);
      return V;
    }
    L = g.length;
    let G = p;
    for (U = 0; U < L; ) {
      const R = g[U++], E = g[U++];
      try {
        G = R(G);
      } catch (D) {
        E.call(this, D);
        break;
      }
    }
    try {
      V = ke.call(this, G);
    } catch (R) {
      return Promise.reject(R);
    }
    for (U = 0, L = T.length; U < L; )
      V = V.then(T[U++], T[U++]);
    return V;
  }
  getUri(d) {
    d = Z(this.defaults, d);
    const p = At(d.baseURL, d.url);
    return dt(p, d.params, d.paramsSerializer);
  }
};
S.forEach(["delete", "get", "head", "options"], function(d) {
  de.prototype[d] = function(p, s) {
    return this.request(Z(s || {}, {
      method: d,
      url: p,
      data: (s || {}).data
    }));
  };
});
S.forEach(["post", "put", "patch"], function(d) {
  function p(s) {
    return function(P, b, g) {
      return this.request(Z(g || {}, {
        method: d,
        headers: s ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: P,
        data: b
      }));
    };
  }
  de.prototype[d] = p(), de.prototype[d + "Form"] = p(!0);
});
const ce = de;
let or = class bt {
  constructor(d) {
    if (typeof d != "function")
      throw new TypeError("executor must be a function.");
    let p;
    this.promise = new Promise(function(P) {
      p = P;
    });
    const s = this;
    this.promise.then((v) => {
      if (!s._listeners)
        return;
      let P = s._listeners.length;
      for (; P-- > 0; )
        s._listeners[P](v);
      s._listeners = null;
    }), this.promise.then = (v) => {
      let P;
      const b = new Promise((g) => {
        s.subscribe(g), P = g;
      }).then(v);
      return b.cancel = function() {
        s.unsubscribe(P);
      }, b;
    }, d(function(P, b, g) {
      s.reason || (s.reason = new ie(P, b, g), p(s.reason));
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
  subscribe(d) {
    if (this.reason) {
      d(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(d) : this._listeners = [d];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(d) {
    if (!this._listeners)
      return;
    const p = this._listeners.indexOf(d);
    p !== -1 && this._listeners.splice(p, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let d;
    return {
      token: new bt(function(v) {
        d = v;
      }),
      cancel: d
    };
  }
};
const lr = or;
function cr(c) {
  return function(p) {
    return c.apply(null, p);
  };
}
function dr(c) {
  return S.isObject(c) && c.isAxiosError === !0;
}
const _e = {
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
Object.entries(_e).forEach(([c, d]) => {
  _e[d] = c;
});
const ur = _e;
function mt(c) {
  const d = new ce(c), p = Xe(ce.prototype.request, d);
  return S.extend(p, ce.prototype, d, { allOwnKeys: !0 }), S.extend(p, d, null, { allOwnKeys: !0 }), p.create = function(v) {
    return mt(Z(c, v));
  }, p;
}
const w = mt(Fe);
w.Axios = ce;
w.CanceledError = ie;
w.CancelToken = lr;
w.isCancel = vt;
w.VERSION = Pt;
w.toFormData = ve;
w.AxiosError = C;
w.Cancel = w.CanceledError;
w.all = function(d) {
  return Promise.all(d);
};
w.spread = cr;
w.isAxiosError = dr;
w.mergeConfig = Z;
w.AxiosHeaders = K;
w.formToJSON = (c) => pt(S.isHTMLForm(c) ? new FormData(c) : c);
w.getAdapter = Ot.getAdapter;
w.HttpStatusCode = ur;
w.default = w;
const {
  Axios: hr,
  AxiosError: pr,
  CanceledError: vr,
  isCancel: Ar,
  CancelToken: Or,
  VERSION: Pr,
  all: br,
  Cancel: mr,
  isAxiosError: Sr,
  spread: fr,
  toFormData: gr,
  AxiosHeaders: jr,
  HttpStatusCode: Ur,
  formToJSON: Vr,
  getAdapter: _r,
  mergeConfig: yr
} = w, Rr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: hr,
  AxiosError: pr,
  AxiosHeaders: jr,
  Cancel: mr,
  CancelToken: Or,
  CanceledError: vr,
  HttpStatusCode: Ur,
  VERSION: Pr,
  all: br,
  default: w,
  formToJSON: Vr,
  getAdapter: _r,
  isAxiosError: Sr,
  isCancel: Ar,
  mergeConfig: yr,
  spread: fr,
  toFormData: gr
}, Symbol.toStringTag, { value: "Module" })), St = /* @__PURE__ */ zs(Rr);
var M = {}, Ie = {};
(function(c) {
  Object.defineProperty(c, "__esModule", { value: !0 }), c.operationServerMap = c.RequiredError = c.BaseAPI = c.COLLECTION_FORMATS = c.BASE_PATH = void 0;
  const d = St;
  c.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), c.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class p {
    constructor(P, b = c.BASE_PATH, g = d.default) {
      var y;
      this.basePath = b, this.axios = g, P && (this.configuration = P, this.basePath = (y = P.basePath) !== null && y !== void 0 ? y : b);
    }
  }
  c.BaseAPI = p;
  class s extends Error {
    constructor(P, b) {
      super(b), this.field = P, this.name = "RequiredError";
    }
  }
  c.RequiredError = s, c.operationServerMap = {};
})(Ie);
var Me = J && J.__awaiter || function(c, d, p, s) {
  function v(P) {
    return P instanceof p ? P : new p(function(b) {
      b(P);
    });
  }
  return new (p || (p = Promise))(function(P, b) {
    function g(V) {
      try {
        T(s.next(V));
      } catch (U) {
        b(U);
      }
    }
    function y(V) {
      try {
        T(s.throw(V));
      } catch (U) {
        b(U);
      }
    }
    function T(V) {
      V.done ? P(V.value) : v(V.value).then(g, y);
    }
    T((s = s.apply(c, d || [])).next());
  });
};
Object.defineProperty(M, "__esModule", { value: !0 });
M.createRequestFunction = M.toPathString = M.serializeDataIfNeeded = M.setSearchParams = M.setOAuthToObject = M.setBearerAuthToObject = M.setBasicAuthToObject = M.setApiKeyToObject = M.assertParamExists = M.DUMMY_BASE_URL = void 0;
const Er = Ie;
M.DUMMY_BASE_URL = "https://example.com";
const Tr = function(c, d, p) {
  if (p == null)
    throw new Er.RequiredError(d, `Required parameter ${d} was null or undefined when calling ${c}.`);
};
M.assertParamExists = Tr;
const Br = function(c, d, p) {
  return Me(this, void 0, void 0, function* () {
    if (p && p.apiKey) {
      const s = typeof p.apiKey == "function" ? yield p.apiKey(d) : yield p.apiKey;
      c[d] = s;
    }
  });
};
M.setApiKeyToObject = Br;
const Fr = function(c, d) {
  d && (d.username || d.password) && (c.auth = { username: d.username, password: d.password });
};
M.setBasicAuthToObject = Fr;
const Cr = function(c, d) {
  return Me(this, void 0, void 0, function* () {
    if (d && d.accessToken) {
      const p = typeof d.accessToken == "function" ? yield d.accessToken() : yield d.accessToken;
      c.Authorization = "Bearer " + p;
    }
  });
};
M.setBearerAuthToObject = Cr;
const Ir = function(c, d, p, s) {
  return Me(this, void 0, void 0, function* () {
    if (s && s.accessToken) {
      const v = typeof s.accessToken == "function" ? yield s.accessToken(d, p) : yield s.accessToken;
      c.Authorization = "Bearer " + v;
    }
  });
};
M.setOAuthToObject = Ir;
function ye(c, d, p = "") {
  d != null && (typeof d == "object" ? Array.isArray(d) ? d.forEach((s) => ye(c, s, p)) : Object.keys(d).forEach((s) => ye(c, d[s], `${p}${p !== "" ? "." : ""}${s}`)) : c.has(p) ? c.append(p, d) : c.set(p, d));
}
const Mr = function(c, ...d) {
  const p = new URLSearchParams(c.search);
  ye(p, d), c.search = p.toString();
};
M.setSearchParams = Mr;
const wr = function(c, d, p) {
  const s = typeof c != "string";
  return (s && p && p.isJsonMime ? p.isJsonMime(d.headers["Content-Type"]) : s) ? JSON.stringify(c !== void 0 ? c : {}) : c || "";
};
M.serializeDataIfNeeded = wr;
const xr = function(c) {
  return c.pathname + c.search + c.hash;
};
M.toPathString = xr;
const Lr = function(c, d, p, s) {
  return (v = d, P = p) => {
    var b;
    const g = Object.assign(Object.assign({}, c.options), { url: (v.defaults.baseURL ? "" : (b = s == null ? void 0 : s.basePath) !== null && b !== void 0 ? b : P) + c.url });
    return v.request(g);
  };
};
M.createRequestFunction = Lr;
(function(c) {
  var d = J && J.__awaiter || function(r, l, n, i) {
    function a(e) {
      return e instanceof n ? e : new n(function(t) {
        t(e);
      });
    }
    return new (n || (n = Promise))(function(e, t) {
      function o(A) {
        try {
          h(i.next(A));
        } catch (O) {
          t(O);
        }
      }
      function u(A) {
        try {
          h(i.throw(A));
        } catch (O) {
          t(O);
        }
      }
      function h(A) {
        A.done ? e(A.value) : a(A.value).then(o, u);
      }
      h((i = i.apply(r, l || [])).next());
    });
  };
  Object.defineProperty(c, "__esModule", { value: !0 }), c.ProductCategoriesApi = c.ProductCategoriesApiFactory = c.ProductCategoriesApiFp = c.ProductCategoriesApiAxiosParamCreator = c.PointofsaleApi = c.PointofsaleApiFactory = c.PointofsaleApiFp = c.PointofsaleApiAxiosParamCreator = c.PayoutRequestsApi = c.PayoutRequestsApiFactory = c.PayoutRequestsApiFp = c.PayoutRequestsApiAxiosParamCreator = c.InvoicesApi = c.InvoicesApiFactory = c.InvoicesApiFp = c.InvoicesApiAxiosParamCreator = c.FilesApi = c.FilesApiFactory = c.FilesApiFp = c.FilesApiAxiosParamCreator = c.EventsApi = c.EventsApiFactory = c.EventsApiFp = c.EventsApiAxiosParamCreator = c.DebtorsApi = c.DebtorsApiFactory = c.DebtorsApiFp = c.DebtorsApiAxiosParamCreator = c.ContainersApi = c.ContainersApiFactory = c.ContainersApiFp = c.ContainersApiAxiosParamCreator = c.BannersApi = c.BannersApiFactory = c.BannersApiFp = c.BannersApiAxiosParamCreator = c.GetAllBalanceOrderDirectionEnum = c.GetAllBalanceUserTypeEnum = c.BalanceApi = c.BalanceApiFactory = c.BalanceApiFp = c.BalanceApiAxiosParamCreator = c.AuthenticateApi = c.AuthenticateApiFactory = c.AuthenticateApiFp = c.AuthenticateApiAxiosParamCreator = c.UpdateInvoiceRequestStateEnum = c.PayoutRequestStatusRequestStateEnum = c.InvoiceStatusResponseStateEnum = c.FinancialMutationResponseTypeEnum = void 0, c.VouchergroupsApi = c.VouchergroupsApiFactory = c.VouchergroupsApiFp = c.VouchergroupsApiAxiosParamCreator = c.VatGroupsApi = c.VatGroupsApiFactory = c.VatGroupsApiFp = c.VatGroupsApiAxiosParamCreator = c.GetAllUsersTypeEnum = c.UsersApi = c.UsersApiFactory = c.UsersApiFp = c.UsersApiAxiosParamCreator = c.TransfersApi = c.TransfersApiFactory = c.TransfersApiFp = c.TransfersApiAxiosParamCreator = c.TransactionsApi = c.TransactionsApiFactory = c.TransactionsApiFp = c.TransactionsApiAxiosParamCreator = c.TestOperationsOfTheTestControllerApi = c.TestOperationsOfTheTestControllerApiFactory = c.TestOperationsOfTheTestControllerApiFp = c.TestOperationsOfTheTestControllerApiAxiosParamCreator = c.StripeApi = c.StripeApiFactory = c.StripeApiFp = c.StripeApiAxiosParamCreator = c.RootApi = c.RootApiFactory = c.RootApiFp = c.RootApiAxiosParamCreator = c.RbacApi = c.RbacApiFactory = c.RbacApiFp = c.RbacApiAxiosParamCreator = c.ProductsApi = c.ProductsApiFactory = c.ProductsApiFp = c.ProductsApiAxiosParamCreator = void 0;
  const p = St, s = M, v = Ie;
  c.FinancialMutationResponseTypeEnum = {
    Transfer: "transfer",
    Transaction: "transaction"
  }, c.InvoiceStatusResponseStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, c.PayoutRequestStatusRequestStateEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
  }, c.UpdateInvoiceRequestStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  };
  const P = function(r) {
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("eanAuthentication", "authenticationEanRequest", l);
        const i = "/authentication/ean", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", l);
        const i = "/authentication/GEWIS/LDAP", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", l);
        const i = "/authentication/GEWIS/pin", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", l);
        const i = "/authentication/gewisweb", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("keyAuthentication", "authenticationKeyRequest", l);
        const i = "/authentication/key", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", l);
        const i = "/authentication/LDAP", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("localAuthentication", "authenticationLocalRequest", l);
        const i = "/authentication/local", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("mockAuthentication", "authenticationMockRequest", l);
        const i = "/authentication/mock", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", l);
        const i = "/authentication/nfc", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("pinAuthentication", "authenticationPinRequest", l);
        const i = "/authentication/pin", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (l = {}) => d(this, void 0, void 0, function* () {
        const n = "/authentication/refreshToken", i = new URL(n, s.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, a), l), t = {}, o = {};
        yield (0, s.setBearerAuthToObject)(t, r), (0, s.setSearchParams)(i, o);
        let u = a && a.headers ? a.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), l.headers), {
          url: (0, s.toPathString)(i),
          options: e
        };
      }),
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("resetLocal", "resetLocalRequest", l);
        const i = "/authentication/local/reset", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", l);
        const i = "/authentication/local", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "PUT" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.AuthenticateApiAxiosParamCreator = P;
  const b = function(r) {
    const l = (0, c.AuthenticateApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.eanAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.gewisLDAPAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.gewisPinAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.gewisWebAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.keyAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.ldapAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.localAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.localAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.mockAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.nfcAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.pinAuthentication(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(n) {
        var i, a, e;
        return d(this, void 0, void 0, function* () {
          const t = yield l.refreshToken(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (a = v.operationServerMap["AuthenticateApi.refreshToken"]) === null || a === void 0 ? void 0 : a[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, s.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.resetLocal(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.resetLocal"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.resetLocalWithToken(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.AuthenticateApiFp = b;
  const g = function(r, l, n) {
    const i = (0, c.AuthenticateApiFp)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(a, e) {
        return i.eanAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(a, e) {
        return i.gewisLDAPAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(a, e) {
        return i.gewisPinAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(a, e) {
        return i.gewisWebAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(a, e) {
        return i.keyAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(a, e) {
        return i.ldapAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(a, e) {
        return i.localAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(a, e) {
        return i.mockAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(a, e) {
        return i.nfcAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(a, e) {
        return i.pinAuthentication(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(a) {
        return i.refreshToken(a).then((e) => e(n, l));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(a, e) {
        return i.resetLocal(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(a, e) {
        return i.resetLocalWithToken(a, e).then((t) => t(n, l));
      }
    };
  };
  c.AuthenticateApiFactory = g;
  class y extends v.BaseAPI {
    /**
     *
     * @summary EAN login and hand out token
     * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).eanAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Key login and hand out token.
     * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).keyAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).ldapAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Local login and hand out token
     * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).localAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Mock login and hand out token.
     * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).mockAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary NFC login and hand out token
     * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).nfcAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token
     * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).pinAuthentication(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(l) {
      return (0, c.AuthenticateApiFp)(this.configuration).refreshToken(l).then((n) => n(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a reset token for the local authentication
     * @param {ResetLocalRequest} resetLocalRequest The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).resetLocal(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(l, n) {
      return (0, c.AuthenticateApiFp)(this.configuration).resetLocalWithToken(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.AuthenticateApi = y;
  const T = function(r) {
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
       * @param {GetAllBalanceUserTypeEnum} [userType] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance: (l, n, i, a, e, t, o, u, h, A, O, m = {}) => d(this, void 0, void 0, function* () {
        const f = "/balances/all", j = new URL(f, s.DUMMY_BASE_URL);
        let _;
        r && (_ = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, _), m), B = {}, I = {};
        yield (0, s.setBearerAuthToObject)(B, r), l !== void 0 && (I.date = l), n !== void 0 && (I.minBalance = n), i !== void 0 && (I.maxBalance = i), a !== void 0 && (I.hasFine = a), e !== void 0 && (I.minFine = e), t !== void 0 && (I.maxFine = t), o !== void 0 && (I.userType = o), u !== void 0 && (I.orderBy = u), h !== void 0 && (I.orderDirection = h), A !== void 0 && (I.take = A), O !== void 0 && (I.skip = O), (0, s.setSearchParams)(j, I);
        let X = _ && _.headers ? _.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, B), X), m.headers), {
          url: (0, s.toPathString)(j),
          options: F
        };
      }),
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getBalanceId", "id", l);
        const i = "/balances/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (l = {}) => d(this, void 0, void 0, function* () {
        const n = "/balances", i = new URL(n, s.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, a), l), t = {}, o = {};
        yield (0, s.setBearerAuthToObject)(t, r), (0, s.setSearchParams)(i, o);
        let u = a && a.headers ? a.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), l.headers), {
          url: (0, s.toPathString)(i),
          options: e
        };
      })
    };
  };
  c.BalanceApiAxiosParamCreator = T;
  const V = function(r) {
    const l = (0, c.BalanceApiAxiosParamCreator)(r);
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
       * @param {GetAllBalanceUserTypeEnum} [userType] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(n, i, a, e, t, o, u, h, A, O, m, f) {
        var j, _, F;
        return d(this, void 0, void 0, function* () {
          const B = yield l.getAllBalance(n, i, a, e, t, o, u, h, A, O, m, f), I = (j = r == null ? void 0 : r.serverIndex) !== null && j !== void 0 ? j : 0, X = (F = (_ = v.operationServerMap["BalanceApi.getAllBalance"]) === null || _ === void 0 ? void 0 : _[I]) === null || F === void 0 ? void 0 : F.url;
          return (te, Ms) => (0, s.createRequestFunction)(B, p.default, v.BASE_PATH, r)(te, X || Ms);
        });
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getBalanceId(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["BalanceApi.getBalanceId"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(n) {
        var i, a, e;
        return d(this, void 0, void 0, function* () {
          const t = yield l.getBalances(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (a = v.operationServerMap["BalanceApi.getBalances"]) === null || a === void 0 ? void 0 : a[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, s.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  c.BalanceApiFp = V;
  const U = function(r, l, n) {
    const i = (0, c.BalanceApiFp)(r);
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
       * @param {GetAllBalanceUserTypeEnum} [userType] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(a, e, t, o, u, h, A, O, m, f, j, _) {
        return i.getAllBalance(a, e, t, o, u, h, A, O, m, f, j, _).then((F) => F(n, l));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(a, e) {
        return i.getBalanceId(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(a) {
        return i.getBalances(a).then((e) => e(n, l));
      }
    };
  };
  c.BalanceApiFactory = U;
  class L extends v.BaseAPI {
    /**
     *
     * @summary Get balance of the current user
     * @param {string} [date] Timestamp to get balances for
     * @param {number} [minBalance] Minimum balance
     * @param {number} [maxBalance] Maximum balance
     * @param {boolean} [hasFine] Only users with(out) fines
     * @param {number} [minFine] Minimum fine
     * @param {number} [maxFine] Maximum fine
     * @param {GetAllBalanceUserTypeEnum} [userType] Filter based on user type.
     * @param {string} [orderBy] Column to order balance by - eg: id,amount
     * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getAllBalance(l, n, i, a, e, t, o, u, h, A, O, m) {
      return (0, c.BalanceApiFp)(this.configuration).getAllBalance(l, n, i, a, e, t, o, u, h, A, O, m).then((f) => f(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(l, n) {
      return (0, c.BalanceApiFp)(this.configuration).getBalanceId(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(l) {
      return (0, c.BalanceApiFp)(this.configuration).getBalances(l).then((n) => n(this.axios, this.basePath));
    }
  }
  c.BalanceApi = L, c.GetAllBalanceUserTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  }, c.GetAllBalanceOrderDirectionEnum = {
    Asc: "ASC",
    Desc: "DESC"
  };
  const G = function(r) {
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("_delete", "id", l);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("create", "bannerRequest", l);
        const i = "/banners", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getActive: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/banners/active", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      getAllBanners: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/banners", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      getAllOpenBanners: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/open/banners", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getBanner", "id", l);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      update: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("update", "id", l), (0, s.assertParamExists)("update", "bannerRequest", n);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateImage: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateImage", "id", l);
        const a = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, s.setBearerAuthToObject)(u, r), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, s.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.BannersApiAxiosParamCreator = G;
  const R = function(r) {
    const l = (0, c.BannersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l._delete(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["BannersApi._delete"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.create(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["BannersApi.create"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getActive(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getActive(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getActive"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllBanners(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllBanners(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getAllBanners"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllOpenBanners(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllOpenBanners(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getAllOpenBanners"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getBanner(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["BannersApi.getBanner"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      update(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.update(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.update"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateImage(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateImage(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.updateImage"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.BannersApiFp = R;
  const E = function(r, l, n) {
    const i = (0, c.BannersApiFp)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(a, e) {
        return i._delete(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(a, e) {
        return i.create(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(a, e, t) {
        return i.getActive(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(a, e, t) {
        return i.getAllBanners(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(a, e, t) {
        return i.getAllOpenBanners(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(a, e) {
        return i.getBanner(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(a, e, t) {
        return i.update(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(a, e, t) {
        return i.updateImage(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.BannersApiFactory = E;
  class D extends v.BaseAPI {
    /**
     *
     * @summary Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(l, n) {
      return (0, c.BannersApiFp)(this.configuration)._delete(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Saves a banner to the database
     * @param {BannerRequest} bannerRequest The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(l, n) {
      return (0, c.BannersApiFp)(this.configuration).create(l, n).then((i) => i(this.axios, this.basePath));
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
    getActive(l, n, i) {
      return (0, c.BannersApiFp)(this.configuration).getActive(l, n, i).then((a) => a(this.axios, this.basePath));
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
    getAllBanners(l, n, i) {
      return (0, c.BannersApiFp)(this.configuration).getAllBanners(l, n, i).then((a) => a(this.axios, this.basePath));
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
    getAllOpenBanners(l, n, i) {
      return (0, c.BannersApiFp)(this.configuration).getAllOpenBanners(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(l, n) {
      return (0, c.BannersApiFp)(this.configuration).getBanner(l, n).then((i) => i(this.axios, this.basePath));
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
    update(l, n, i) {
      return (0, c.BannersApiFp)(this.configuration).update(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateImage(l, n, i) {
      return (0, c.BannersApiFp)(this.configuration).updateImage(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.BannersApi = D;
  const N = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createContainer", "createContainerRequest", l);
        const i = "/containers", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllContainers: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/containers", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      getProductsContainer: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getProductsContainer", "id", l);
        const e = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getPublicContainers: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/containers/public", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleContainer", "id", l);
        const i = "/containers/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateContainer: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateContainer", "id", l), (0, s.assertParamExists)("updateContainer", "updateContainerRequest", n);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.ContainersApiAxiosParamCreator = N;
  const Q = function(r) {
    const l = (0, c.ContainersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createContainer(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ContainersApi.createContainer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllContainers(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllContainers(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.getAllContainers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getProductsContainer(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getProductsContainer(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["ContainersApi.getProductsContainer"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getPublicContainers(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getPublicContainers(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.getPublicContainers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleContainer(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ContainersApi.getSingleContainer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateContainer(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateContainer(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.updateContainer"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.ContainersApiFp = Q;
  const Y = function(r, l, n) {
    const i = (0, c.ContainersApiFp)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(a, e) {
        return i.createContainer(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(a, e, t) {
        return i.getAllContainers(a, e, t).then((o) => o(n, l));
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
      getProductsContainer(a, e, t, o) {
        return i.getProductsContainer(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(a, e, t) {
        return i.getPublicContainers(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(a, e) {
        return i.getSingleContainer(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(a, e, t) {
        return i.updateContainer(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.ContainersApiFactory = Y;
  class Pe extends v.BaseAPI {
    /**
     *
     * @summary Create a new container.
     * @param {CreateContainerRequest} createContainerRequest    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(l, n) {
      return (0, c.ContainersApiFp)(this.configuration).createContainer(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllContainers(l, n, i) {
      return (0, c.ContainersApiFp)(this.configuration).getAllContainers(l, n, i).then((a) => a(this.axios, this.basePath));
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
    getProductsContainer(l, n, i, a) {
      return (0, c.ContainersApiFp)(this.configuration).getProductsContainer(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getPublicContainers(l, n, i) {
      return (0, c.ContainersApiFp)(this.configuration).getPublicContainers(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(l, n) {
      return (0, c.ContainersApiFp)(this.configuration).getSingleContainer(l, n).then((i) => i(this.axios, this.basePath));
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
    updateContainer(l, n, i) {
      return (0, c.ContainersApiFp)(this.configuration).updateContainer(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.ContainersApi = Pe;
  const ft = function(r) {
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteFine", "id", l);
        const i = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("handoutFines", "handoutFinesRequest", l);
        const i = "/fines/handout", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", l);
        const i = "/fines/notify", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      returnAllFineHandoutEvents: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/fines", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("returnSingleFineHandoutEvent", "id", l);
        const i = "/fines/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.DebtorsApiAxiosParamCreator = ft;
  const gt = function(r) {
    const l = (0, c.DebtorsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteFine(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["DebtorsApi.deleteFine"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.handoutFines(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["DebtorsApi.handoutFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.notifyAboutFutureFines(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      returnAllFineHandoutEvents(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.returnAllFineHandoutEvents(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.returnSingleFineHandoutEvent(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.DebtorsApiFp = gt;
  const jt = function(r, l, n) {
    const i = (0, c.DebtorsApiFp)(r);
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(a, e) {
        return i.deleteFine(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(a, e) {
        return i.handoutFines(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(a, e) {
        return i.notifyAboutFutureFines(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(a, e, t) {
        return i.returnAllFineHandoutEvents(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(a, e) {
        return i.returnSingleFineHandoutEvent(a, e).then((t) => t(n, l));
      }
    };
  };
  c.DebtorsApiFactory = jt;
  class Ut extends v.BaseAPI {
    /**
     *
     * @summary Delete a fine
     * @param {number} id The id of the fine which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    deleteFine(l, n) {
      return (0, c.DebtorsApiFp)(this.configuration).deleteFine(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    handoutFines(l, n) {
      return (0, c.DebtorsApiFp)(this.configuration).handoutFines(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Send an email to all given users about their possible future fine.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    notifyAboutFutureFines(l, n) {
      return (0, c.DebtorsApiFp)(this.configuration).notifyAboutFutureFines(l, n).then((i) => i(this.axios, this.basePath));
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
    returnAllFineHandoutEvents(l, n, i) {
      return (0, c.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} id The id of the fine handout event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnSingleFineHandoutEvent(l, n) {
      return (0, c.DebtorsApiFp)(this.configuration).returnSingleFineHandoutEvent(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.DebtorsApi = Ut;
  const Vt = function(r) {
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
      assignEventShift: (l, n, i, a, e = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("assignEventShift", "eventId", l), (0, s.assertParamExists)("assignEventShift", "shiftId", n), (0, s.assertParamExists)("assignEventShift", "userId", i), (0, s.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", a);
        const t = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(l))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(i))), o = new URL(t, s.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "PUT" }, u), e), A = {}, O = {};
        yield (0, s.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, s.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), h.data = (0, s.serializeDataIfNeeded)(a, h, r), {
          url: (0, s.toPathString)(o),
          options: h
        };
      }),
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createEvent", "createEventRequest", l);
        const i = "/events", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createEventShift", "createShiftRequest", l);
        const i = "/eventshifts", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteEvent", "id", l);
        const i = "/events/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteEventShift", "id", l);
        const i = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllEventShifts: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/eventshifts", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      getAllEvents: (l, n, i, a, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/events", A = new URL(h, s.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        yield (0, s.setBearerAuthToObject)(f, r), l !== void 0 && (j.name = l), n !== void 0 && (j.createdById = n), i !== void 0 && (j.beforeDate = i), a !== void 0 && (j.afterDate = a), e !== void 0 && (j.type = e), t !== void 0 && (j.take = t), o !== void 0 && (j.skip = o), (0, s.setSearchParams)(A, j);
        let _ = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), _), u.headers), {
          url: (0, s.toPathString)(A),
          options: m
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
      getEventShiftCount: (l, n, i, a, e = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getEventShiftCount", "id", l);
        const t = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(l))), o = new URL(t, s.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, u), e), A = {}, O = {};
        yield (0, s.setBearerAuthToObject)(A, r), n !== void 0 && (O.eventType = n), i !== void 0 && (O.afterDate = i), a !== void 0 && (O.beforeDate = a), (0, s.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), {
          url: (0, s.toPathString)(o),
          options: h
        };
      }),
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleEvent", "id", l);
        const i = "/events/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateEvent: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateEvent", "id", l), (0, s.assertParamExists)("updateEvent", "updateEventRequest", n);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateEventShift: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateEventShift", "id", l), (0, s.assertParamExists)("updateEventShift", "updateShiftRequest", n);
        const a = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateEventShiftAvailability: (l, n, i, a, e = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateEventShiftAvailability", "eventId", l), (0, s.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, s.assertParamExists)("updateEventShiftAvailability", "userId", i), (0, s.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", a);
        const t = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(l))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(i))), o = new URL(t, s.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, u), e), A = {}, O = {};
        yield (0, s.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, s.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), h.data = (0, s.serializeDataIfNeeded)(a, h, r), {
          url: (0, s.toPathString)(o),
          options: h
        };
      })
    };
  };
  c.EventsApiAxiosParamCreator = Vt;
  const _t = function(r) {
    const l = (0, c.EventsApiAxiosParamCreator)(r);
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
      assignEventShift(n, i, a, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield l.assignEventShift(n, i, a, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.assignEventShift"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, s.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
        });
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createEvent(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["EventsApi.createEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createEventShift(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["EventsApi.createEventShift"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteEvent(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["EventsApi.deleteEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteEventShift(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["EventsApi.deleteEventShift"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllEventShifts(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllEventShifts(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.getAllEventShifts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllEvents(n, i, a, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield l.getAllEvents(n, i, a, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, _ = (m = (O = v.operationServerMap["EventsApi.getAllEvents"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, s.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, _ || B);
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
      getEventShiftCount(n, i, a, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield l.getEventShiftCount(n, i, a, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.getEventShiftCount"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, s.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
        });
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleEvent(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["EventsApi.getSingleEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateEvent(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateEvent(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.updateEvent"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateEventShift(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateEventShift(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.updateEventShift"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateEventShiftAvailability(n, i, a, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield l.updateEventShiftAvailability(n, i, a, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, s.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
        });
      }
    };
  };
  c.EventsApiFp = _t;
  const yt = function(r, l, n) {
    const i = (0, c.EventsApiFp)(r);
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
      assignEventShift(a, e, t, o, u) {
        return i.assignEventShift(a, e, t, o, u).then((h) => h(n, l));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(a, e) {
        return i.createEvent(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(a, e) {
        return i.createEventShift(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(a, e) {
        return i.deleteEvent(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(a, e) {
        return i.deleteEventShift(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(a, e, t) {
        return i.getAllEventShifts(a, e, t).then((o) => o(n, l));
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
      getAllEvents(a, e, t, o, u, h, A, O) {
        return i.getAllEvents(a, e, t, o, u, h, A, O).then((m) => m(n, l));
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
      getEventShiftCount(a, e, t, o, u) {
        return i.getEventShiftCount(a, e, t, o, u).then((h) => h(n, l));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(a, e) {
        return i.getSingleEvent(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(a, e, t) {
        return i.updateEvent(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(a, e, t) {
        return i.updateEventShift(a, e, t).then((o) => o(n, l));
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
      updateEventShiftAvailability(a, e, t, o, u) {
        return i.updateEventShiftAvailability(a, e, t, o, u).then((h) => h(n, l));
      }
    };
  };
  c.EventsApiFactory = yt;
  class Rt extends v.BaseAPI {
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
    assignEventShift(l, n, i, a, e) {
      return (0, c.EventsApiFp)(this.configuration).assignEventShift(l, n, i, a, e).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event with its corresponding answers objects
     * @param {CreateEventRequest} createEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEvent(l, n) {
      return (0, c.EventsApiFp)(this.configuration).createEvent(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event shift
     * @param {CreateShiftRequest} createShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEventShift(l, n) {
      return (0, c.EventsApiFp)(this.configuration).createEventShift(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEvent(l, n) {
      return (0, c.EventsApiFp)(this.configuration).deleteEvent(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event shift with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEventShift(l, n) {
      return (0, c.EventsApiFp)(this.configuration).deleteEventShift(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllEventShifts(l, n, i) {
      return (0, c.EventsApiFp)(this.configuration).getAllEventShifts(l, n, i).then((a) => a(this.axios, this.basePath));
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
    getAllEvents(l, n, i, a, e, t, o, u) {
      return (0, c.EventsApiFp)(this.configuration).getAllEvents(l, n, i, a, e, t, o, u).then((h) => h(this.axios, this.basePath));
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
    getEventShiftCount(l, n, i, a, e) {
      return (0, c.EventsApiFp)(this.configuration).getEventShiftCount(l, n, i, a, e).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single event with its answers and shifts
     * @param {number} id The id of the event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getSingleEvent(l, n) {
      return (0, c.EventsApiFp)(this.configuration).getSingleEvent(l, n).then((i) => i(this.axios, this.basePath));
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
    updateEvent(l, n, i) {
      return (0, c.EventsApiFp)(this.configuration).updateEvent(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateEventShift(l, n, i) {
      return (0, c.EventsApiFp)(this.configuration).updateEventShift(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateEventShiftAvailability(l, n, i, a, e) {
      return (0, c.EventsApiFp)(this.configuration).updateEventShiftAvailability(l, n, i, a, e).then((t) => t(this.axios, this.basePath));
    }
  }
  c.EventsApi = Rt;
  const Et = function(r) {
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createFile", "name", l);
        const a = "/files", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && A.append("name", l), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, s.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteFile", "id", l);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getFile", "id", l);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.FilesApiAxiosParamCreator = Et;
  const Tt = function(r) {
    const l = (0, c.FilesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.createFile(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["FilesApi.createFile"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteFile(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["FilesApi.deleteFile"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getFile(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["FilesApi.getFile"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.FilesApiFp = Tt;
  const Bt = function(r, l, n) {
    const i = (0, c.FilesApiFp)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(a, e, t) {
        return i.createFile(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(a, e) {
        return i.deleteFile(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(a, e) {
        return i.getFile(a, e).then((t) => t(n, l));
      }
    };
  };
  c.FilesApiFactory = Bt;
  class Ft extends v.BaseAPI {
    /**
     *
     * @summary Upload a file with the given name.
     * @param {string} name The name of the file
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(l, n, i) {
      return (0, c.FilesApiFp)(this.configuration).createFile(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(l, n) {
      return (0, c.FilesApiFp)(this.configuration).deleteFile(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(l, n) {
      return (0, c.FilesApiFp)(this.configuration).getFile(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.FilesApi = Ft;
  const Ct = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createInvoice", "createInvoiceRequest", l);
        const i = "/invoices", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteInvoice", "id", l);
        const i = "/invoices/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices: (l, n, i, a, e, t, o, u, h = {}) => d(this, void 0, void 0, function* () {
        const A = "/invoices", O = new URL(A, s.DUMMY_BASE_URL);
        let m;
        r && (m = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "GET" }, m), h), j = {}, _ = {};
        yield (0, s.setBearerAuthToObject)(j, r), l !== void 0 && (_.toId = l), n !== void 0 && (_.invoiceId = n), i !== void 0 && (_.state = i), a !== void 0 && (_.returnEntries = a), e !== void 0 && (_.fromDate = e), t !== void 0 && (_.tillDate = t), o !== void 0 && (_.take = o), u !== void 0 && (_.skip = u), (0, s.setSearchParams)(O, _);
        let F = m && m.headers ? m.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, j), F), h.headers), {
          url: (0, s.toPathString)(O),
          options: f
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
      getSingleInvoice: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleInvoice", "id", l);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), n !== void 0 && (h.returnEntries = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateInvoice: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateInvoice", "id", l), (0, s.assertParamExists)("updateInvoice", "updateInvoiceRequest", n);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.InvoicesApiAxiosParamCreator = Ct;
  const It = function(r) {
    const l = (0, c.InvoicesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createInvoice(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["InvoicesApi.createInvoice"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteInvoice(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["InvoicesApi.deleteInvoice"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(n, i, a, e, t, o, u, h, A) {
        var O, m, f;
        return d(this, void 0, void 0, function* () {
          const j = yield l.getAllInvoices(n, i, a, e, t, o, u, h, A), _ = (O = r == null ? void 0 : r.serverIndex) !== null && O !== void 0 ? O : 0, F = (f = (m = v.operationServerMap["InvoicesApi.getAllInvoices"]) === null || m === void 0 ? void 0 : m[_]) === null || f === void 0 ? void 0 : f.url;
          return (B, I) => (0, s.createRequestFunction)(j, p.default, v.BASE_PATH, r)(B, F || I);
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
      getSingleInvoice(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getSingleInvoice(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateInvoice(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateInvoice(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["InvoicesApi.updateInvoice"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.InvoicesApiFp = It;
  const Mt = function(r, l, n) {
    const i = (0, c.InvoicesApiFp)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(a, e) {
        return i.createInvoice(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(a, e) {
        return i.deleteInvoice(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(a, e, t, o, u, h, A, O, m) {
        return i.getAllInvoices(a, e, t, o, u, h, A, O, m).then((f) => f(n, l));
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(a, e, t) {
        return i.getSingleInvoice(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(a, e, t) {
        return i.updateInvoice(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.InvoicesApiFactory = Mt;
  class wt extends v.BaseAPI {
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(l, n) {
      return (0, c.InvoicesApiFp)(this.configuration).createInvoice(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(l, n) {
      return (0, c.InvoicesApiFp)(this.configuration).deleteInvoice(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all invoices in the system.
     * @param {number} [toId] Filter on Id of the debtor
     * @param {number} [invoiceId] Filter on invoice ID
     * @param {number} [state] {1,2,3,4} - Filter based on Invoice State.    Possible values: 1 (CREATED), 2 (SENT), 3 (PAID), 4 (DELETED)
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
     * @param {string} [fromDate] Start date for selected invoices (inclusive)
     * @param {string} [tillDate] End date for selected invoices (exclusive)
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getAllInvoices(l, n, i, a, e, t, o, u, h) {
      return (0, c.InvoicesApiFp)(this.configuration).getAllInvoices(l, n, i, a, e, t, o, u, h).then((A) => A(this.axios, this.basePath));
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
    getSingleInvoice(l, n, i) {
      return (0, c.InvoicesApiFp)(this.configuration).getSingleInvoice(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateInvoice(l, n, i) {
      return (0, c.InvoicesApiFp)(this.configuration).updateInvoice(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.InvoicesApi = wt;
  const xt = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createPayoutRequest", "payoutRequestRequest", l);
        const i = "/payoutrequests", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllPayoutRequests: (l, n, i, a, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/payoutrequests", A = new URL(h, s.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        if (yield (0, s.setBearerAuthToObject)(f, r), l !== void 0)
          for (const [F, B] of Object.entries(l))
            j[F] = B;
        if (n !== void 0)
          for (const [F, B] of Object.entries(n))
            j[F] = B;
        i !== void 0 && (j.fromDate = i), a !== void 0 && (j.tillDate = a), e !== void 0 && (j.status = e), t !== void 0 && (j.take = t), o !== void 0 && (j.skip = o), (0, s.setSearchParams)(A, j);
        let _ = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), _), u.headers), {
          url: (0, s.toPathString)(A),
          options: m
        };
      }),
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSinglePayoutRequest", "id", l);
        const i = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      setPayoutRequestStatus: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("setPayoutRequestStatus", "id", l), (0, s.assertParamExists)("setPayoutRequestStatus", "payoutRequestStatusRequest", n);
        const a = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.PayoutRequestsApiAxiosParamCreator = xt;
  const Lt = function(r) {
    const l = (0, c.PayoutRequestsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createPayoutRequest(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllPayoutRequests(n, i, a, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield l.getAllPayoutRequests(n, i, a, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, _ = (m = (O = v.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, s.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, _ || B);
        });
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSinglePayoutRequest(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      setPayoutRequestStatus(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.setPayoutRequestStatus(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.PayoutRequestsApiFp = Lt;
  const qt = function(r, l, n) {
    const i = (0, c.PayoutRequestsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(a, e) {
        return i.createPayoutRequest(a, e).then((t) => t(n, l));
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
      getAllPayoutRequests(a, e, t, o, u, h, A, O) {
        return i.getAllPayoutRequests(a, e, t, o, u, h, A, O).then((m) => m(n, l));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(a, e) {
        return i.getSinglePayoutRequest(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(a, e, t) {
        return i.setPayoutRequestStatus(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.PayoutRequestsApiFactory = qt;
  class Dt extends v.BaseAPI {
    /**
     *
     * @summary Create a new payout request
     * @param {PayoutRequestRequest} payoutRequestRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(l, n) {
      return (0, c.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllPayoutRequests(l, n, i, a, e, t, o, u) {
      return (0, c.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(l, n, i, a, e, t, o, u).then((h) => h(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(l, n) {
      return (0, c.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(l, n).then((i) => i(this.axios, this.basePath));
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
    setPayoutRequestStatus(l, n, i) {
      return (0, c.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.PayoutRequestsApi = Dt;
  const Ht = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createPointOfSale", "createPointOfSaleRequest", l);
        const i = "/pointsofsale", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllPointOfSaleContainers: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getAllPointOfSaleContainers", "id", l);
        const e = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getAllPointOfSaleProducts: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getAllPointOfSaleProducts", "id", l);
        const e = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getAllPointsOfSale: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/pointsofsale", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSinglePointOfSale", "id", l);
        const i = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getTransactions: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getTransactions", "id", l);
        const e = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      updatePointOfSale: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updatePointOfSale", "id", l), (0, s.assertParamExists)("updatePointOfSale", "updatePointOfSaleRequest", n);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.PointofsaleApiAxiosParamCreator = Ht;
  const Nt = function(r) {
    const l = (0, c.PointofsaleApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createPointOfSale(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllPointOfSaleContainers(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getAllPointOfSaleContainers(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getAllPointOfSaleProducts(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getAllPointOfSaleProducts(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getAllPointsOfSale(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllPointsOfSale(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSinglePointOfSale(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getTransactions(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getTransactions(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getTransactions"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      updatePointOfSale(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updatePointOfSale(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.PointofsaleApiFp = Nt;
  const Gt = function(r, l, n) {
    const i = (0, c.PointofsaleApiFp)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(a, e) {
        return i.createPointOfSale(a, e).then((t) => t(n, l));
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
      getAllPointOfSaleContainers(a, e, t, o) {
        return i.getAllPointOfSaleContainers(a, e, t, o).then((u) => u(n, l));
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
      getAllPointOfSaleProducts(a, e, t, o) {
        return i.getAllPointOfSaleProducts(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(a, e, t) {
        return i.getAllPointsOfSale(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(a, e) {
        return i.getSinglePointOfSale(a, e).then((t) => t(n, l));
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
      getTransactions(a, e, t, o) {
        return i.getTransactions(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(a, e, t) {
        return i.updatePointOfSale(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.PointofsaleApiFactory = Gt;
  class kt extends v.BaseAPI {
    /**
     *
     * @summary Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(l, n) {
      return (0, c.PointofsaleApiFp)(this.configuration).createPointOfSale(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllPointOfSaleContainers(l, n, i, a) {
      return (0, c.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getAllPointOfSaleProducts(l, n, i, a) {
      return (0, c.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getAllPointsOfSale(l, n, i) {
      return (0, c.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(l, n) {
      return (0, c.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(l, n).then((i) => i(this.axios, this.basePath));
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
    getTransactions(l, n, i, a) {
      return (0, c.PointofsaleApiFp)(this.configuration).getTransactions(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    updatePointOfSale(l, n, i) {
      return (0, c.PointofsaleApiFp)(this.configuration).updatePointOfSale(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.PointofsaleApi = kt;
  const Qt = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createProductCategory", "productCategoryRequest", l);
        const i = "/productcategories", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllProductCategories: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/productcategories", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleProductCategory", "id", l);
        const i = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateProductCategory: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateProductCategory", "id", l), (0, s.assertParamExists)("updateProductCategory", "productCategoryRequest", n);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.ProductCategoriesApiAxiosParamCreator = Qt;
  const Yt = function(r) {
    const l = (0, c.ProductCategoriesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createProductCategory(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllProductCategories(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllProductCategories(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleProductCategory(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateProductCategory(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateProductCategory(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.ProductCategoriesApiFp = Yt;
  const $t = function(r, l, n) {
    const i = (0, c.ProductCategoriesApiFp)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(a, e) {
        return i.createProductCategory(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(a, e, t) {
        return i.getAllProductCategories(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(a, e) {
        return i.getSingleProductCategory(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(a, e, t) {
        return i.updateProductCategory(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.ProductCategoriesApiFactory = $t;
  class zt extends v.BaseAPI {
    /**
     *
     * @summary Post a new productCategory.
     * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(l, n) {
      return (0, c.ProductCategoriesApiFp)(this.configuration).createProductCategory(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllProductCategories(l, n, i) {
      return (0, c.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(l, n) {
      return (0, c.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(l, n).then((i) => i(this.axios, this.basePath));
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
    updateProductCategory(l, n, i) {
      return (0, c.ProductCategoriesApiFp)(this.configuration).updateProductCategory(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.ProductCategoriesApi = zt;
  const Kt = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createProduct", "createProductRequest", l);
        const i = "/products", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllProducts: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/products", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleProduct", "id", l);
        const i = "/products/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateProduct: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateProduct", "id", l), (0, s.assertParamExists)("updateProduct", "updateProductRequest", n);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateProductImage: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateProductImage", "id", l);
        const a = "/products/{id}/image".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, s.setBearerAuthToObject)(u, r), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, s.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.ProductsApiAxiosParamCreator = Kt;
  const Wt = function(r) {
    const l = (0, c.ProductsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createProduct(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ProductsApi.createProduct"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllProducts(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllProducts(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.getAllProducts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleProduct(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["ProductsApi.getSingleProduct"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateProduct(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateProduct(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.updateProduct"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateProductImage(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateProductImage(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.updateProductImage"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.ProductsApiFp = Wt;
  const Jt = function(r, l, n) {
    const i = (0, c.ProductsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(a, e) {
        return i.createProduct(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(a, e, t) {
        return i.getAllProducts(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(a, e) {
        return i.getSingleProduct(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(a, e, t) {
        return i.updateProduct(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(a, e, t) {
        return i.updateProductImage(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.ProductsApiFactory = Jt;
  class Xt extends v.BaseAPI {
    /**
     *
     * @summary Create a new product.
     * @param {CreateProductRequest} createProductRequest The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(l, n) {
      return (0, c.ProductsApiFp)(this.configuration).createProduct(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllProducts(l, n, i) {
      return (0, c.ProductsApiFp)(this.configuration).getAllProducts(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(l, n) {
      return (0, c.ProductsApiFp)(this.configuration).getSingleProduct(l, n).then((i) => i(this.axios, this.basePath));
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
    updateProduct(l, n, i) {
      return (0, c.ProductsApiFp)(this.configuration).updateProduct(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateProductImage(l, n, i) {
      return (0, c.ProductsApiFp)(this.configuration).updateProductImage(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.ProductsApi = Xt;
  const Zt = function(r) {
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (l = {}) => d(this, void 0, void 0, function* () {
        const n = "/rbac/roles", i = new URL(n, s.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, a), l), t = {}, o = {};
        yield (0, s.setBearerAuthToObject)(t, r), (0, s.setSearchParams)(i, o);
        let u = a && a.headers ? a.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), l.headers), {
          url: (0, s.toPathString)(i),
          options: e
        };
      })
    };
  };
  c.RbacApiAxiosParamCreator = Zt;
  const es = function(r) {
    const l = (0, c.RbacApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(n) {
        var i, a, e;
        return d(this, void 0, void 0, function* () {
          const t = yield l.getAllRoles(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (a = v.operationServerMap["RbacApi.getAllRoles"]) === null || a === void 0 ? void 0 : a[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, s.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  c.RbacApiFp = es;
  const ts = function(r, l, n) {
    const i = (0, c.RbacApiFp)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(a) {
        return i.getAllRoles(a).then((e) => e(n, l));
      }
    };
  };
  c.RbacApiFactory = ts;
  class ss extends v.BaseAPI {
    /**
     *
     * @summary Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(l) {
      return (0, c.RbacApiFp)(this.configuration).getAllRoles(l).then((n) => n(this.axios, this.basePath));
    }
  }
  c.RbacApi = ss;
  const as = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (l = {}) => d(this, void 0, void 0, function* () {
        const n = "/ping", i = new URL(n, s.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, a), l), t = {}, o = {};
        (0, s.setSearchParams)(i, o);
        let u = a && a.headers ? a.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), l.headers), {
          url: (0, s.toPathString)(i),
          options: e
        };
      })
    };
  };
  c.RootApiAxiosParamCreator = as;
  const rs = function(r) {
    const l = (0, c.RootApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(n) {
        var i, a, e;
        return d(this, void 0, void 0, function* () {
          const t = yield l.ping(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (a = v.operationServerMap["RootApi.ping"]) === null || a === void 0 ? void 0 : a[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, s.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  c.RootApiFp = rs;
  const ns = function(r, l, n) {
    const i = (0, c.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(a) {
        return i.ping(a).then((e) => e(n, l));
      }
    };
  };
  c.RootApiFactory = ns;
  class is extends v.BaseAPI {
    /**
     *
     * @summary Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(l) {
      return (0, c.RootApiFp)(this.configuration).ping(l).then((n) => n(this.axios, this.basePath));
    }
  }
  c.RootApi = is;
  const os = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deposit", "stripeRequest", l);
        const i = "/stripe/deposit", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.StripeApiAxiosParamCreator = os;
  const ls = function(r) {
    const l = (0, c.StripeApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deposit(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["StripeApi.deposit"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.StripeApiFp = ls;
  const cs = function(r, l, n) {
    const i = (0, c.StripeApiFp)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(a, e) {
        return i.deposit(a, e).then((t) => t(n, l));
      }
    };
  };
  c.StripeApiFactory = cs;
  class ds extends v.BaseAPI {
    /**
     *
     * @summary Start the stripe deposit flow
     * @param {StripeRequest} stripeRequest The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(l, n) {
      return (0, c.StripeApiFp)(this.configuration).deposit(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.StripeApi = ds;
  const us = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (l = {}) => d(this, void 0, void 0, function* () {
        const n = "/test/helloworld", i = new URL(n, s.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "POST" }, a), l), t = {}, o = {};
        yield (0, s.setBearerAuthToObject)(t, r), (0, s.setSearchParams)(i, o);
        let u = a && a.headers ? a.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), l.headers), {
          url: (0, s.toPathString)(i),
          options: e
        };
      })
    };
  };
  c.TestOperationsOfTheTestControllerApiAxiosParamCreator = us;
  const hs = function(r) {
    const l = (0, c.TestOperationsOfTheTestControllerApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(n) {
        var i, a, e;
        return d(this, void 0, void 0, function* () {
          const t = yield l.helloworld(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (a = v.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || a === void 0 ? void 0 : a[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, s.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  c.TestOperationsOfTheTestControllerApiFp = hs;
  const ps = function(r, l, n) {
    const i = (0, c.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(a) {
        return i.helloworld(a).then((e) => e(n, l));
      }
    };
  };
  c.TestOperationsOfTheTestControllerApiFactory = ps;
  class vs extends v.BaseAPI {
    /**
     *
     * @summary Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestOperationsOfTheTestControllerApi
     */
    helloworld(l) {
      return (0, c.TestOperationsOfTheTestControllerApiFp)(this.configuration).helloworld(l).then((n) => n(this.axios, this.basePath));
    }
  }
  c.TestOperationsOfTheTestControllerApi = vs;
  const As = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createTransaction", "transactionRequest", l);
        const i = "/transactions", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteTransaction", "id", l);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllTransactions: (l, n, i, a, e, t, o, u, h, A, O = {}) => d(this, void 0, void 0, function* () {
        const m = "/transactions", f = new URL(m, s.DUMMY_BASE_URL);
        let j;
        r && (j = r.baseOptions);
        const _ = Object.assign(Object.assign({ method: "GET" }, j), O), F = {}, B = {};
        yield (0, s.setBearerAuthToObject)(F, r), l !== void 0 && (B.fromId = l), n !== void 0 && (B.createdById = n), i !== void 0 && (B.toId = i), a !== void 0 && (B.pointOfSaleId = a), e !== void 0 && (B.productId = e), t !== void 0 && (B.productRevision = t), o !== void 0 && (B.fromDate = o), u !== void 0 && (B.tillDate = u), h !== void 0 && (B.take = h), A !== void 0 && (B.skip = A), (0, s.setSearchParams)(f, B);
        let I = j && j.headers ? j.headers : {};
        return _.headers = Object.assign(Object.assign(Object.assign({}, F), I), O.headers), {
          url: (0, s.toPathString)(f),
          options: _
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleTransaction", "id", l);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateTransaction: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateTransaction", "id", l), (0, s.assertParamExists)("updateTransaction", "transactionRequest", n);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("validateTransaction", "transactionRequest", l);
        const i = "/transactions/validate", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.TransactionsApiAxiosParamCreator = As;
  const Os = function(r) {
    const l = (0, c.TransactionsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createTransaction(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransactionsApi.createTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteTransaction(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransactionsApi.deleteTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllTransactions(n, i, a, e, t, o, u, h, A, O, m) {
        var f, j, _;
        return d(this, void 0, void 0, function* () {
          const F = yield l.getAllTransactions(n, i, a, e, t, o, u, h, A, O, m), B = (f = r == null ? void 0 : r.serverIndex) !== null && f !== void 0 ? f : 0, I = (_ = (j = v.operationServerMap["TransactionsApi.getAllTransactions"]) === null || j === void 0 ? void 0 : j[B]) === null || _ === void 0 ? void 0 : _.url;
          return (X, te) => (0, s.createRequestFunction)(F, p.default, v.BASE_PATH, r)(X, I || te);
        });
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleTransaction(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateTransaction(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateTransaction(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["TransactionsApi.updateTransaction"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.validateTransaction(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransactionsApi.validateTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.TransactionsApiFp = Os;
  const Ps = function(r, l, n) {
    const i = (0, c.TransactionsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(a, e) {
        return i.createTransaction(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(a, e) {
        return i.deleteTransaction(a, e).then((t) => t(n, l));
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
      getAllTransactions(a, e, t, o, u, h, A, O, m, f, j) {
        return i.getAllTransactions(a, e, t, o, u, h, A, O, m, f, j).then((_) => _(n, l));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(a, e) {
        return i.getSingleTransaction(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(a, e, t) {
        return i.updateTransaction(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(a, e) {
        return i.validateTransaction(a, e).then((t) => t(n, l));
      }
    };
  };
  c.TransactionsApiFactory = Ps;
  class bs extends v.BaseAPI {
    /**
     *
     * @summary Creates a new transaction
     * @param {TransactionRequest} transactionRequest The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(l, n) {
      return (0, c.TransactionsApiFp)(this.configuration).createTransaction(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(l, n) {
      return (0, c.TransactionsApiFp)(this.configuration).deleteTransaction(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllTransactions(l, n, i, a, e, t, o, u, h, A, O) {
      return (0, c.TransactionsApiFp)(this.configuration).getAllTransactions(l, n, i, a, e, t, o, u, h, A, O).then((m) => m(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(l, n) {
      return (0, c.TransactionsApiFp)(this.configuration).getSingleTransaction(l, n).then((i) => i(this.axios, this.basePath));
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
    updateTransaction(l, n, i) {
      return (0, c.TransactionsApiFp)(this.configuration).updateTransaction(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transactionRequest The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(l, n) {
      return (0, c.TransactionsApiFp)(this.configuration).validateTransaction(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.TransactionsApi = bs;
  const ms = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createTransfer", "transferRequest", l);
        const i = "/transfers", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllTransfers: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/transfers", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleTransfer", "id", l);
        const i = "/transfers/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.TransfersApiAxiosParamCreator = ms;
  const Ss = function(r) {
    const l = (0, c.TransfersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createTransfer(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransfersApi.createTransfer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllTransfers(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllTransfers(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["TransfersApi.getAllTransfers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleTransfer(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["TransfersApi.getSingleTransfer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.TransfersApiFp = Ss;
  const fs = function(r, l, n) {
    const i = (0, c.TransfersApiFp)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(a, e) {
        return i.createTransfer(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(a, e, t) {
        return i.getAllTransfers(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(a, e) {
        return i.getSingleTransfer(a, e).then((t) => t(n, l));
      }
    };
  };
  c.TransfersApiFactory = fs;
  class gs extends v.BaseAPI {
    /**
     *
     * @summary Post a new transfer.
     * @param {TransferRequest} transferRequest The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(l, n) {
      return (0, c.TransfersApiFp)(this.configuration).createTransfer(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllTransfers(l, n, i) {
      return (0, c.TransfersApiFp)(this.configuration).getAllTransfers(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(l, n) {
      return (0, c.TransfersApiFp)(this.configuration).getSingleTransfer(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.TransfersApi = gs;
  const js = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("acceptTos", "acceptTosRequest", l);
        const i = "/users/acceptTos", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("authenticateAs", "id", l);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createUser", "createUserRequest", l);
        const i = "/users", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteUser", "id", l);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteUserKey", "id", l);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("deleteUserNfc", "id", l);
        const i = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllUsers: (l, n, i, a, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/users", A = new URL(h, s.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        yield (0, s.setBearerAuthToObject)(f, r), l !== void 0 && (j.take = l), n !== void 0 && (j.skip = n), i !== void 0 && (j.search = i), a !== void 0 && (j.active = a), e !== void 0 && (j.ofAge = e), t !== void 0 && (j.id = t), o !== void 0 && (j.type = o), (0, s.setSearchParams)(A, j);
        let _ = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), _), u.headers), {
          url: (0, s.toPathString)(A),
          options: m
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
      getAllUsersOfUserType: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getAllUsersOfUserType", "userType", l);
        const e = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
        };
      }),
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getIndividualUser", "id", l);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getOrganMembers: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getOrganMembers", "id", l);
        const e = "/users/{id}/members".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
        };
      }),
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUserAuthenticatable", "id", l);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      }),
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUserRoles", "id", l);
        const i = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getUsersContainers: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersContainers", "id", l);
        const e = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getUsersFinancialMutations: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersFinancialMutations", "id", l);
        const e = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getUsersPointsOfSale: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersPointsOfSale", "id", l);
        const e = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
        };
      }),
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersProcessingDeposits", "id", l);
        const i = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getUsersProducts: (l, n, i, a = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersProducts", "id", l);
        const e = "/users/{id}/products".replace("{id}", encodeURIComponent(String(l))), t = new URL(e, s.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), a), h = {}, A = {};
        yield (0, s.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, s.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), a.headers), {
          url: (0, s.toPathString)(t),
          options: u
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
      getUsersTransactions: (l, n, i, a, e, t, o, u, h, A, O = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersTransactions", "id", l);
        const m = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(l))), f = new URL(m, s.DUMMY_BASE_URL);
        let j;
        r && (j = r.baseOptions);
        const _ = Object.assign(Object.assign({ method: "GET" }, j), O), F = {}, B = {};
        yield (0, s.setBearerAuthToObject)(F, r), n !== void 0 && (B.fromId = n), i !== void 0 && (B.createdById = i), a !== void 0 && (B.toId = a), e !== void 0 && (B.productId = e), t !== void 0 && (B.productRevision = t), o !== void 0 && (B.fromDate = o), u !== void 0 && (B.tillDate = u), h !== void 0 && (B.take = h), A !== void 0 && (B.skip = A), (0, s.setSearchParams)(f, B);
        let I = j && j.headers ? j.headers : {};
        return _.headers = Object.assign(Object.assign(Object.assign({}, F), I), O.headers), {
          url: (0, s.toPathString)(f),
          options: _
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
      getUsersTransactionsReport: (l, n, i, a, e, t, o = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersTransactionsReport", "id", l);
        const u = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(l))), h = new URL(u, s.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, s.setBearerAuthToObject)(m, r), n !== void 0 && (f.fromDate = n), i !== void 0 && (f.tillDate = i), a !== void 0 && (f.fromId = a), e !== void 0 && (f.toId = e), t !== void 0 && (f.exclusiveToId = t), (0, s.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, s.toPathString)(h),
          options: O
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
      getUsersTransfers: (l, n, i, a, e, t, o = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getUsersTransfers", "id", l);
        const u = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(l))), h = new URL(u, s.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, s.setBearerAuthToObject)(m, r), n !== void 0 && (f.take = n), i !== void 0 && (f.skip = i), a !== void 0 && (f.fromId = a), e !== void 0 && (f.toId = e), t !== void 0 && (f.id = t), (0, s.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, s.toPathString)(h),
          options: O
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
      updateUser: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateUser", "id", l), (0, s.assertParamExists)("updateUser", "updateUserRequest", n);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateUserKey", "id", l);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateUserLocalPassword: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateUserLocalPassword", "id", l), (0, s.assertParamExists)("updateUserLocalPassword", "updateLocalRequest", n);
        const a = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateUserNfc: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateUserNfc", "id", l), (0, s.assertParamExists)("updateUserNfc", "updateNfcRequest", n);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateUserPin: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateUserPin", "id", l), (0, s.assertParamExists)("updateUserPin", "updatePinRequest", n);
        const a = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("waiveUserFines", "id", l);
        const i = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
        };
      })
    };
  };
  c.UsersApiAxiosParamCreator = js;
  const Us = function(r) {
    const l = (0, c.UsersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.acceptTos(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.acceptTos"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.authenticateAs(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.authenticateAs"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createUser(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.createUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteUser(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteUserKey(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUserKey"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.deleteUserNfc(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUserNfc"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllUsers(n, i, a, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield l.getAllUsers(n, i, a, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, _ = (m = (O = v.operationServerMap["UsersApi.getAllUsers"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, s.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, _ || B);
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
      getAllUsersOfUserType(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getAllUsersOfUserType(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
        });
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getIndividualUser(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.getIndividualUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getOrganMembers(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getOrganMembers(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getOrganMembers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
        });
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getUserAuthenticatable(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getUserRoles(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.getUserRoles"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getUsersContainers(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getUsersContainers(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersContainers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersFinancialMutations(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getUsersFinancialMutations(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersPointsOfSale(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getUsersPointsOfSale(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
        });
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getUsersProcessingDeposits(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getUsersProducts(n, i, a, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield l.getUsersProducts(n, i, a, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersProducts"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, s.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersTransactions(n, i, a, e, t, o, u, h, A, O, m) {
        var f, j, _;
        return d(this, void 0, void 0, function* () {
          const F = yield l.getUsersTransactions(n, i, a, e, t, o, u, h, A, O, m), B = (f = r == null ? void 0 : r.serverIndex) !== null && f !== void 0 ? f : 0, I = (_ = (j = v.operationServerMap["UsersApi.getUsersTransactions"]) === null || j === void 0 ? void 0 : j[B]) === null || _ === void 0 ? void 0 : _.url;
          return (X, te) => (0, s.createRequestFunction)(F, p.default, v.BASE_PATH, r)(X, I || te);
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
      getUsersTransactionsReport(n, i, a, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield l.getUsersTransactionsReport(n, i, a, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (_, F) => (0, s.createRequestFunction)(m, p.default, v.BASE_PATH, r)(_, j || F);
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
      getUsersTransfers(n, i, a, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield l.getUsersTransfers(n, i, a, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["UsersApi.getUsersTransfers"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (_, F) => (0, s.createRequestFunction)(m, p.default, v.BASE_PATH, r)(_, j || F);
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
      updateUser(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateUser(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUser"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.updateUserKey(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.updateUserKey"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateUserLocalPassword(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateUserLocalPassword(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateUserNfc(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateUserNfc(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserNfc"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateUserPin(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateUserPin(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserPin"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.waiveUserFines(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["UsersApi.waiveUserFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  c.UsersApiFp = Us;
  const Vs = function(r, l, n) {
    const i = (0, c.UsersApiFp)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(a, e) {
        return i.acceptTos(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(a, e) {
        return i.authenticateAs(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(a, e) {
        return i.createUser(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(a, e) {
        return i.deleteUser(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(a, e) {
        return i.deleteUserKey(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(a, e) {
        return i.deleteUserNfc(a, e).then((t) => t(n, l));
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
      getAllUsers(a, e, t, o, u, h, A, O) {
        return i.getAllUsers(a, e, t, o, u, h, A, O).then((m) => m(n, l));
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
      getAllUsersOfUserType(a, e, t, o) {
        return i.getAllUsersOfUserType(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(a, e) {
        return i.getIndividualUser(a, e).then((t) => t(n, l));
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
      getOrganMembers(a, e, t, o) {
        return i.getOrganMembers(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(a, e) {
        return i.getUserAuthenticatable(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(a, e) {
        return i.getUserRoles(a, e).then((t) => t(n, l));
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
      getUsersContainers(a, e, t, o) {
        return i.getUsersContainers(a, e, t, o).then((u) => u(n, l));
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
      getUsersFinancialMutations(a, e, t, o) {
        return i.getUsersFinancialMutations(a, e, t, o).then((u) => u(n, l));
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
      getUsersPointsOfSale(a, e, t, o) {
        return i.getUsersPointsOfSale(a, e, t, o).then((u) => u(n, l));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(a, e) {
        return i.getUsersProcessingDeposits(a, e).then((t) => t(n, l));
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
      getUsersProducts(a, e, t, o) {
        return i.getUsersProducts(a, e, t, o).then((u) => u(n, l));
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
      getUsersTransactions(a, e, t, o, u, h, A, O, m, f, j) {
        return i.getUsersTransactions(a, e, t, o, u, h, A, O, m, f, j).then((_) => _(n, l));
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
      getUsersTransactionsReport(a, e, t, o, u, h, A) {
        return i.getUsersTransactionsReport(a, e, t, o, u, h, A).then((O) => O(n, l));
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
      getUsersTransfers(a, e, t, o, u, h, A) {
        return i.getUsersTransfers(a, e, t, o, u, h, A).then((O) => O(n, l));
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(a, e, t) {
        return i.updateUser(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(a, e) {
        return i.updateUserKey(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(a, e, t) {
        return i.updateUserLocalPassword(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(a, e, t) {
        return i.updateUserNfc(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(a, e, t) {
        return i.updateUserPin(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(a, e) {
        return i.waiveUserFines(a, e).then((t) => t(n, l));
      }
    };
  };
  c.UsersApiFactory = Vs;
  class _s extends v.BaseAPI {
    /**
     *
     * @summary Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(l, n) {
      return (0, c.UsersApiFp)(this.configuration).acceptTos(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(l, n) {
      return (0, c.UsersApiFp)(this.configuration).authenticateAs(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(l, n) {
      return (0, c.UsersApiFp)(this.configuration).createUser(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(l, n) {
      return (0, c.UsersApiFp)(this.configuration).deleteUser(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(l, n) {
      return (0, c.UsersApiFp)(this.configuration).deleteUserKey(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(l, n) {
      return (0, c.UsersApiFp)(this.configuration).deleteUserNfc(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllUsers(l, n, i, a, e, t, o, u) {
      return (0, c.UsersApiFp)(this.configuration).getAllUsers(l, n, i, a, e, t, o, u).then((h) => h(this.axios, this.basePath));
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
    getAllUsersOfUserType(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getAllUsersOfUserType(l, n, i, a).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(l, n) {
      return (0, c.UsersApiFp)(this.configuration).getIndividualUser(l, n).then((i) => i(this.axios, this.basePath));
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
    getOrganMembers(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getOrganMembers(l, n, i, a).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(l, n) {
      return (0, c.UsersApiFp)(this.configuration).getUserAuthenticatable(l, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(l, n) {
      return (0, c.UsersApiFp)(this.configuration).getUserRoles(l, n).then((i) => i(this.axios, this.basePath));
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
    getUsersContainers(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getUsersContainers(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getUsersFinancialMutations(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getUsersFinancialMutations(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getUsersPointsOfSale(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getUsersPointsOfSale(l, n, i, a).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(l, n) {
      return (0, c.UsersApiFp)(this.configuration).getUsersProcessingDeposits(l, n).then((i) => i(this.axios, this.basePath));
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
    getUsersProducts(l, n, i, a) {
      return (0, c.UsersApiFp)(this.configuration).getUsersProducts(l, n, i, a).then((e) => e(this.axios, this.basePath));
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
    getUsersTransactions(l, n, i, a, e, t, o, u, h, A, O) {
      return (0, c.UsersApiFp)(this.configuration).getUsersTransactions(l, n, i, a, e, t, o, u, h, A, O).then((m) => m(this.axios, this.basePath));
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
    getUsersTransactionsReport(l, n, i, a, e, t, o) {
      return (0, c.UsersApiFp)(this.configuration).getUsersTransactionsReport(l, n, i, a, e, t, o).then((u) => u(this.axios, this.basePath));
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
    getUsersTransfers(l, n, i, a, e, t, o) {
      return (0, c.UsersApiFp)(this.configuration).getUsersTransfers(l, n, i, a, e, t, o).then((u) => u(this.axios, this.basePath));
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
    updateUser(l, n, i) {
      return (0, c.UsersApiFp)(this.configuration).updateUser(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(l, n) {
      return (0, c.UsersApiFp)(this.configuration).updateUserKey(l, n).then((i) => i(this.axios, this.basePath));
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
    updateUserLocalPassword(l, n, i) {
      return (0, c.UsersApiFp)(this.configuration).updateUserLocalPassword(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateUserNfc(l, n, i) {
      return (0, c.UsersApiFp)(this.configuration).updateUserNfc(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateUserPin(l, n, i) {
      return (0, c.UsersApiFp)(this.configuration).updateUserPin(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Waive all given user\'s fines
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    waiveUserFines(l, n) {
      return (0, c.UsersApiFp)(this.configuration).waiveUserFines(l, n).then((i) => i(this.axios, this.basePath));
    }
  }
  c.UsersApi = _s, c.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const ys = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createVatGroup", "vatGroupRequest", l);
        const i = "/vatgroups", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllVatGroups: (l, n, i, a, e, t, o = {}) => d(this, void 0, void 0, function* () {
        const u = "/vatgroups", h = new URL(u, s.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, s.setBearerAuthToObject)(m, r), l !== void 0 && (f.vatGroupId = l), n !== void 0 && (f.name = n), i !== void 0 && (f.percentage = i), a !== void 0 && (f.deleted = a), e !== void 0 && (f.take = e), t !== void 0 && (f.skip = t), (0, s.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, s.toPathString)(h),
          options: O
        };
      }),
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getSingleVatGroup", "id", l);
        const i = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      getVatDeclarationAmounts: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getVatDeclarationAmounts", "year", l), (0, s.assertParamExists)("getVatDeclarationAmounts", "period", n);
        const a = "/vatgroups/declaration", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.year = l), n !== void 0 && (h.period = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
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
      updateVatGroup: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateVatGroup", "id", l), (0, s.assertParamExists)("updateVatGroup", "updateVatGroupRequest", n);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.VatGroupsApiAxiosParamCreator = ys;
  const Rs = function(r) {
    const l = (0, c.VatGroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createVatGroup(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["VatGroupsApi.createVatGroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllVatGroups(n, i, a, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield l.getAllVatGroups(n, i, a, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (_, F) => (0, s.createRequestFunction)(m, p.default, v.BASE_PATH, r)(_, j || F);
        });
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getSingleVatGroup(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getVatDeclarationAmounts(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getVatDeclarationAmounts(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateVatGroup(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateVatGroup(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.VatGroupsApiFp = Rs;
  const Es = function(r, l, n) {
    const i = (0, c.VatGroupsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(a, e) {
        return i.createVatGroup(a, e).then((t) => t(n, l));
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
      getAllVatGroups(a, e, t, o, u, h, A) {
        return i.getAllVatGroups(a, e, t, o, u, h, A).then((O) => O(n, l));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(a, e) {
        return i.getSingleVatGroup(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(a, e, t) {
        return i.getVatDeclarationAmounts(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(a, e, t) {
        return i.updateVatGroup(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.VatGroupsApiFactory = Es;
  class Ts extends v.BaseAPI {
    /**
     *
     * @summary Create a new VAT group
     * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(l, n) {
      return (0, c.VatGroupsApiFp)(this.configuration).createVatGroup(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllVatGroups(l, n, i, a, e, t, o) {
      return (0, c.VatGroupsApiFp)(this.configuration).getAllVatGroups(l, n, i, a, e, t, o).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(l, n) {
      return (0, c.VatGroupsApiFp)(this.configuration).getSingleVatGroup(l, n).then((i) => i(this.axios, this.basePath));
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
    getVatDeclarationAmounts(l, n, i) {
      return (0, c.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(l, n, i).then((a) => a(this.axios, this.basePath));
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
    updateVatGroup(l, n, i) {
      return (0, c.VatGroupsApiFp)(this.configuration).updateVatGroup(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.VatGroupsApi = Ts;
  const Bs = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("createVouchergroup", "voucherGroupRequest", l);
        const i = "/vouchergroups", a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, s.serializeDataIfNeeded)(l, t, r), {
          url: (0, s.toPathString)(a),
          options: t
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
      getAllVouchergroups: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        const a = "/vouchergroups", e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), l !== void 0 && (h.take = l), n !== void 0 && (h.skip = n), (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, s.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId: (l, n = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("getVouchergroupId", "id", l);
        const i = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(l))), a = new URL(i, s.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, s.setBearerAuthToObject)(o, r), (0, s.setSearchParams)(a, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, s.toPathString)(a),
          options: t
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
      updateVoucherGroup: (l, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, s.assertParamExists)("updateVoucherGroup", "id", l), (0, s.assertParamExists)("updateVoucherGroup", "voucherGroupRequest", n);
        const a = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(l))), e = new URL(a, s.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, s.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, s.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, s.serializeDataIfNeeded)(n, o, r), {
          url: (0, s.toPathString)(e),
          options: o
        };
      })
    };
  };
  c.VouchergroupsApiAxiosParamCreator = Bs;
  const Fs = function(r) {
    const l = (0, c.VouchergroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.createVouchergroup(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllVouchergroups(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.getAllVouchergroups(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(n, i) {
        var a, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield l.getVouchergroupId(n, i), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, h = (t = (e = v.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, s.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateVoucherGroup(n, i, a) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield l.updateVoucherGroup(n, i, a), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, s.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  c.VouchergroupsApiFp = Fs;
  const Cs = function(r, l, n) {
    const i = (0, c.VouchergroupsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(a, e) {
        return i.createVouchergroup(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(a, e, t) {
        return i.getAllVouchergroups(a, e, t).then((o) => o(n, l));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(a, e) {
        return i.getVouchergroupId(a, e).then((t) => t(n, l));
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(a, e, t) {
        return i.updateVoucherGroup(a, e, t).then((o) => o(n, l));
      }
    };
  };
  c.VouchergroupsApiFactory = Cs;
  class Is extends v.BaseAPI {
    /**
     *
     * @summary Creates a new voucher group
     * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    createVouchergroup(l, n) {
      return (0, c.VouchergroupsApiFp)(this.configuration).createVouchergroup(l, n).then((i) => i(this.axios, this.basePath));
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
    getAllVouchergroups(l, n, i) {
      return (0, c.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(l, n, i).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested voucher group
     * @param {number} id The id of the voucher group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getVouchergroupId(l, n) {
      return (0, c.VouchergroupsApiFp)(this.configuration).getVouchergroupId(l, n).then((i) => i(this.axios, this.basePath));
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
    updateVoucherGroup(l, n, i) {
      return (0, c.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(l, n, i).then((a) => a(this.axios, this.basePath));
    }
  }
  c.VouchergroupsApi = Is;
})(Je);
var Oe = {};
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.Configuration = void 0;
class qr {
  constructor(d = {}) {
    this.apiKey = d.apiKey, this.username = d.username, this.password = d.password, this.accessToken = d.accessToken, this.basePath = d.basePath, this.serverIndex = d.serverIndex, this.baseOptions = d.baseOptions, this.formDataCtor = d.formDataCtor;
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
  isJsonMime(d) {
    const p = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return d !== null && (p.test(d) || d.toLowerCase() === "application/json-patch+json");
  }
}
Oe.Configuration = qr;
(function(c) {
  var d = J && J.__createBinding || (Object.create ? function(s, v, P, b) {
    b === void 0 && (b = P);
    var g = Object.getOwnPropertyDescriptor(v, P);
    (!g || ("get" in g ? !v.__esModule : g.writable || g.configurable)) && (g = { enumerable: !0, get: function() {
      return v[P];
    } }), Object.defineProperty(s, b, g);
  } : function(s, v, P, b) {
    b === void 0 && (b = P), s[b] = v[P];
  }), p = J && J.__exportStar || function(s, v) {
    for (var P in s)
      P !== "default" && !Object.prototype.hasOwnProperty.call(v, P) && d(v, s, P);
  };
  Object.defineProperty(c, "__esModule", { value: !0 }), p(Je, c), p(Oe, c);
})(x);
const H = w.create();
H.interceptors.response.use((c) => (Ns(c), c));
class Qr {
  constructor(d) {
    q(this, "_authenticateApi");
    q(this, "_balanceApi");
    q(this, "_usersApi");
    q(this, "_posApi");
    q(this, "_categoryApi");
    q(this, "_transactionApi");
    q(this, "_bannerApi");
    q(this, "_rootApi");
    q(this, "_voucherGroupApi");
    q(this, "_containerApi");
    q(this, "_filesApi");
    q(this, "_invoicesApi");
    q(this, "_payoutsApi");
    q(this, "_productsApi");
    q(this, "_transfersApi");
    q(this, "_vatGroupsApi");
    q(this, "_stripeApi");
    q(this, "_rbacApi");
    q(this, "_openBannerApi");
    const p = new x.Configuration({
      apiKey: () => `Bearer ${Re().token}`
    });
    this._authenticateApi = new x.AuthenticateApi(p, d, H), this._balanceApi = new x.BalanceApi(p, d, H), this._usersApi = new x.UsersApi(p, d, H), this._posApi = new x.PointofsaleApi(p, d, H), this._categoryApi = new x.ProductCategoriesApi(p, d, H), this._transactionApi = new x.TransactionsApi(p, d, H), this._bannerApi = new x.BannersApi(p, d, H), this._openBannerApi = new x.BannersApi(void 0, d, H), this._rootApi = new x.RootApi(), this._voucherGroupApi = new x.VouchergroupsApi(p, d, H), this._containerApi = new x.ContainersApi(p, d, H), this._filesApi = new x.FilesApi(p, d, H), this._invoicesApi = new x.InvoicesApi(p, d, H), this._payoutsApi = new x.PayoutRequestsApi(p, d, H), this._productsApi = new x.ProductsApi(p, d, H), this._transfersApi = new x.TransfersApi(p, d, H), this._vatGroupsApi = new x.VatGroupsApi(p, d, H), this._stripeApi = new x.StripeApi(p, d, H), this._rbacApi = new x.RbacApi(p, d, H);
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
export {
  Qr as ApiService,
  Gs as clearTokenInStorage,
  qs as fetchAllPages,
  Re as getTokenFromStorage,
  Ys as isAuthenticated,
  Qs as isTokenExpired,
  ks as parseToken,
  Nr as populateStoresFromToken,
  We as setTokenInStorage,
  Ns as updateTokenIfNecessary,
  $s as useAuthStore,
  ze as useUserStore
};
