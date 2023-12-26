var Ls = Object.defineProperty;
var xs = (l, d, p) => d in l ? Ls(l, d, { enumerable: !0, configurable: !0, writable: !0, value: p }) : l[d] = p;
var x = (l, d, p) => (xs(l, typeof d != "symbol" ? d + "" : d, p), p);
import { createPinia as qs, defineStore as ze } from "pinia";
async function Ds(l, d, p) {
  let a = l, v = [];
  for (; ; ) {
    const P = await p(d, a), { records: b } = P.data;
    if (v = v.concat(b), a += d, P.data._pagination.count <= a + d)
      break;
  }
  return v;
}
qs();
const Ke = ze("user", {
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
    getUserById: (l) => (d) => l.users.find((p) => p.id === d),
    getActiveUsers() {
      return this.users.filter((l) => l.active);
    },
    getDeletedUsers() {
      return this.users.filter((l) => l.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(l) {
      this.users = await Ds(0, 500, (d, p) => l.user.getAllUsers(d, p));
    },
    async fetchCurrentUserBalance(l, d) {
      this.current.balance = (await d.balance.getBalanceId(l)).data;
    },
    async fetchUsersFinancialMutations(l, d, p, a) {
      this.current.financialMutations = (await d.user.getUsersFinancialMutations(l, p, a)).data;
    },
    setCurrentUser(l) {
      this.current.user = l;
    },
    addUser(l) {
      this.users.push(l);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(l) {
      const d = this.users.findIndex((p) => p.id === l);
      d !== -1 && this.users.splice(d, 1);
    }
  }
});
class ae extends Error {
}
ae.prototype.name = "InvalidTokenError";
function Hs(l) {
  return decodeURIComponent(atob(l).replace(/(.)/g, (d, p) => {
    let a = p.charCodeAt(0).toString(16).toUpperCase();
    return a.length < 2 && (a = "0" + a), "%" + a;
  }));
}
function Ns(l) {
  let d = l.replace(/-/g, "+").replace(/_/g, "/");
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
    return Hs(d);
  } catch {
    return atob(d);
  }
}
function We(l, d) {
  if (typeof l != "string")
    throw new ae("Invalid token specified: must be a string");
  d || (d = {});
  const p = d.header === !0 ? 0 : 1, a = l.split(".")[p];
  if (typeof a != "string")
    throw new ae(`Invalid token specified: missing part #${p + 1}`);
  let v;
  try {
    v = Ns(a);
  } catch (P) {
    throw new ae(`Invalid token specified: invalid base64 for part #${p + 1} (${P.message})`);
  }
  try {
    return JSON.parse(v);
  } catch (P) {
    throw new ae(`Invalid token specified: invalid json for part #${p + 1} (${P.message})`);
  }
}
function Gs(l) {
  if (l.headers.has("Set-Authorization")) {
    const d = l.headers.get("Set-Authorization");
    d && Je(d);
  }
}
function ks() {
  localStorage.clear();
}
function Qs(l) {
  const d = String(We(l).exp);
  return { token: l, expires: d };
}
function Je(l) {
  localStorage.setItem("jwt_token", JSON.stringify(Qs(l)));
}
function Re() {
  const l = localStorage.getItem("jwt_token");
  let d = {};
  return l !== null && (d = JSON.parse(l)), {
    ...d
  };
}
function Ys(l) {
  const d = l * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > d;
}
function $s() {
  const l = Re();
  return !l.token || !l.expires ? !1 : !Ys(Number(l.expires));
}
function kr(l) {
  if ($s()) {
    const p = zs();
    p.extractStateFromToken();
    const a = p.getUser;
    if (a) {
      const v = Ke();
      v.setCurrentUser(a), v.fetchCurrentUserBalance(a.id, l);
    }
  }
}
const zs = ze({
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
    handleResponse(l, d) {
      const { user: p, token: a, roles: v, organs: P, acceptedToS: b } = l;
      !p || !a || !v || !P || !b || (this.user = p, this.token = a, Je(this.token), this.roles = v, this.organs = P, this.acceptedToS = b, this.acceptedToS === "ACCEPTED" && d.user.getIndividualUser(this.user.id).then((g) => {
        Ke().setCurrentUser(g.data);
      }));
    },
    async gewisPinlogin(l, d, p) {
      const a = {
        gewisId: parseInt(l, 10),
        pin: d
      };
      await p.authenticate.gewisPinAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async ldapLogin(l, d, p) {
      const a = {
        accountName: l,
        password: d
      };
      await p.authenticate.ldapAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async gewisWebLogin(l, d, p) {
      const a = {
        nonce: l,
        token: d
      };
      await p.authenticate.gewisWebAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async externalPinLogin(l, d, p) {
      const a = {
        pin: d,
        userId: l
      };
      await p.authenticate.pinAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async eanLogin(l, d) {
      const p = {
        eanCode: l
      };
      await d.authenticate.eanAuthentication(p).then((a) => {
        this.handleResponse(a.data, d);
      });
    },
    async apiKeyLogin(l, d, p) {
      const a = {
        key: l,
        userId: d
      };
      await p.authenticate.keyAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async gewisLdapLogin(l, d, p) {
      const a = {
        accountName: l,
        password: d
      };
      await p.authenticate.gewisLDAPAuthentication(a).then((v) => {
        this.handleResponse(v.data, p);
      });
    },
    async updateUserPin(l, d) {
      if (!this.user)
        return;
      const p = {
        pin: l
      };
      await d.user.updateUserPin(this.user.id, p);
    },
    async updateUserLocalPassword(l, d) {
      if (!this.user)
        return;
      const p = {
        password: l
      };
      await d.user.updateUserLocalPassword(this.user.id, p);
    },
    async updateUserNfc(l, d) {
      if (!this.user)
        return;
      const p = {
        nfcCode: l
      };
      await d.user.updateUserNfc(this.user.id, p);
    },
    async updateUserKey(l) {
      if (this.user)
        return (await l.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(l, d) {
      if (!this.user)
        return;
      const p = {
        extensiveDataProcessing: l
      };
      await d.user.acceptTos(p);
      const a = await d.authenticate.refreshToken();
      this.handleResponse(a.data, d);
    },
    extractStateFromToken() {
      const l = Re();
      if (!l.token)
        return;
      const d = We(l.token);
      this.user = d.user, this.roles = d.roles, this.token = l.token, this.organs = d.organs, this.acceptedToS = d.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, ks();
    }
  }
});
var J = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ks(l) {
  if (l.__esModule)
    return l;
  var d = l.default;
  if (typeof d == "function") {
    var p = function a() {
      return this instanceof a ? Reflect.construct(d, arguments, this.constructor) : d.apply(this, arguments);
    };
    p.prototype = d.prototype;
  } else
    p = {};
  return Object.defineProperty(p, "__esModule", { value: !0 }), Object.keys(l).forEach(function(a) {
    var v = Object.getOwnPropertyDescriptor(l, a);
    Object.defineProperty(p, a, v.get ? v : {
      enumerable: !0,
      get: function() {
        return l[a];
      }
    });
  }), p;
}
var w = {}, Xe = {};
function Ze(l, d) {
  return function() {
    return l.apply(d, arguments);
  };
}
const { toString: Ws } = Object.prototype, { getPrototypeOf: Te } = Object, ue = /* @__PURE__ */ ((l) => (d) => {
  const p = Ws.call(d);
  return l[p] || (l[p] = p.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), z = (l) => (l = l.toLowerCase(), (d) => ue(d) === l), he = (l) => (d) => typeof d === l, { isArray: ee } = Array, re = he("undefined");
function Js(l) {
  return l !== null && !re(l) && l.constructor !== null && !re(l.constructor) && k(l.constructor.isBuffer) && l.constructor.isBuffer(l);
}
const et = z("ArrayBuffer");
function Xs(l) {
  let d;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? d = ArrayBuffer.isView(l) : d = l && l.buffer && et(l.buffer), d;
}
const Zs = he("string"), k = he("function"), tt = he("number"), pe = (l) => l !== null && typeof l == "object", ea = (l) => l === !0 || l === !1, oe = (l) => {
  if (ue(l) !== "object")
    return !1;
  const d = Te(l);
  return (d === null || d === Object.prototype || Object.getPrototypeOf(d) === null) && !(Symbol.toStringTag in l) && !(Symbol.iterator in l);
}, ta = z("Date"), sa = z("File"), aa = z("Blob"), ra = z("FileList"), na = (l) => pe(l) && k(l.pipe), ia = (l) => {
  let d;
  return l && (typeof FormData == "function" && l instanceof FormData || k(l.append) && ((d = ue(l)) === "formdata" || // detect form-data instance
  d === "object" && k(l.toString) && l.toString() === "[object FormData]"));
}, oa = z("URLSearchParams"), la = (l) => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function ne(l, d, { allOwnKeys: p = !1 } = {}) {
  if (l === null || typeof l > "u")
    return;
  let a, v;
  if (typeof l != "object" && (l = [l]), ee(l))
    for (a = 0, v = l.length; a < v; a++)
      d.call(null, l[a], a, l);
  else {
    const P = p ? Object.getOwnPropertyNames(l) : Object.keys(l), b = P.length;
    let g;
    for (a = 0; a < b; a++)
      g = P[a], d.call(null, l[g], g, l);
  }
}
function st(l, d) {
  d = d.toLowerCase();
  const p = Object.keys(l);
  let a = p.length, v;
  for (; a-- > 0; )
    if (v = p[a], d === v.toLowerCase())
      return v;
  return null;
}
const at = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, rt = (l) => !re(l) && l !== at;
function ge() {
  const { caseless: l } = rt(this) && this || {}, d = {}, p = (a, v) => {
    const P = l && st(d, v) || v;
    oe(d[P]) && oe(a) ? d[P] = ge(d[P], a) : oe(a) ? d[P] = ge({}, a) : ee(a) ? d[P] = a.slice() : d[P] = a;
  };
  for (let a = 0, v = arguments.length; a < v; a++)
    arguments[a] && ne(arguments[a], p);
  return d;
}
const ca = (l, d, p, { allOwnKeys: a } = {}) => (ne(d, (v, P) => {
  p && k(v) ? l[P] = Ze(v, p) : l[P] = v;
}, { allOwnKeys: a }), l), da = (l) => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), ua = (l, d, p, a) => {
  l.prototype = Object.create(d.prototype, a), l.prototype.constructor = l, Object.defineProperty(l, "super", {
    value: d.prototype
  }), p && Object.assign(l.prototype, p);
}, ha = (l, d, p, a) => {
  let v, P, b;
  const g = {};
  if (d = d || {}, l == null)
    return d;
  do {
    for (v = Object.getOwnPropertyNames(l), P = v.length; P-- > 0; )
      b = v[P], (!a || a(b, l, d)) && !g[b] && (d[b] = l[b], g[b] = !0);
    l = p !== !1 && Te(l);
  } while (l && (!p || p(l, d)) && l !== Object.prototype);
  return d;
}, pa = (l, d, p) => {
  l = String(l), (p === void 0 || p > l.length) && (p = l.length), p -= d.length;
  const a = l.indexOf(d, p);
  return a !== -1 && a === p;
}, va = (l) => {
  if (!l)
    return null;
  if (ee(l))
    return l;
  let d = l.length;
  if (!tt(d))
    return null;
  const p = new Array(d);
  for (; d-- > 0; )
    p[d] = l[d];
  return p;
}, Aa = /* @__PURE__ */ ((l) => (d) => l && d instanceof l)(typeof Uint8Array < "u" && Te(Uint8Array)), Oa = (l, d) => {
  const a = (l && l[Symbol.iterator]).call(l);
  let v;
  for (; (v = a.next()) && !v.done; ) {
    const P = v.value;
    d.call(l, P[0], P[1]);
  }
}, Pa = (l, d) => {
  let p;
  const a = [];
  for (; (p = l.exec(d)) !== null; )
    a.push(p);
  return a;
}, ba = z("HTMLFormElement"), ma = (l) => l.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(p, a, v) {
    return a.toUpperCase() + v;
  }
), Le = (({ hasOwnProperty: l }) => (d, p) => l.call(d, p))(Object.prototype), Sa = z("RegExp"), nt = (l, d) => {
  const p = Object.getOwnPropertyDescriptors(l), a = {};
  ne(p, (v, P) => {
    let b;
    (b = d(v, P, l)) !== !1 && (a[P] = b || v);
  }), Object.defineProperties(l, a);
}, fa = (l) => {
  nt(l, (d, p) => {
    if (k(l) && ["arguments", "caller", "callee"].indexOf(p) !== -1)
      return !1;
    const a = l[p];
    if (k(a)) {
      if (d.enumerable = !1, "writable" in d) {
        d.writable = !1;
        return;
      }
      d.set || (d.set = () => {
        throw Error("Can not rewrite read-only method '" + p + "'");
      });
    }
  });
}, ga = (l, d) => {
  const p = {}, a = (v) => {
    v.forEach((P) => {
      p[P] = !0;
    });
  };
  return ee(l) ? a(l) : a(String(l).split(d)), p;
}, ja = () => {
}, Ua = (l, d) => (l = +l, Number.isFinite(l) ? l : d), be = "abcdefghijklmnopqrstuvwxyz", xe = "0123456789", it = {
  DIGIT: xe,
  ALPHA: be,
  ALPHA_DIGIT: be + be.toUpperCase() + xe
}, _a = (l = 16, d = it.ALPHA_DIGIT) => {
  let p = "";
  const { length: a } = d;
  for (; l--; )
    p += d[Math.random() * a | 0];
  return p;
};
function Va(l) {
  return !!(l && k(l.append) && l[Symbol.toStringTag] === "FormData" && l[Symbol.iterator]);
}
const ya = (l) => {
  const d = new Array(10), p = (a, v) => {
    if (pe(a)) {
      if (d.indexOf(a) >= 0)
        return;
      if (!("toJSON" in a)) {
        d[v] = a;
        const P = ee(a) ? [] : {};
        return ne(a, (b, g) => {
          const y = p(b, v + 1);
          !re(y) && (P[g] = y);
        }), d[v] = void 0, P;
      }
    }
    return a;
  };
  return p(l, 0);
}, Ra = z("AsyncFunction"), Ta = (l) => l && (pe(l) || k(l)) && k(l.then) && k(l.catch), S = {
  isArray: ee,
  isArrayBuffer: et,
  isBuffer: Js,
  isFormData: ia,
  isArrayBufferView: Xs,
  isString: Zs,
  isNumber: tt,
  isBoolean: ea,
  isObject: pe,
  isPlainObject: oe,
  isUndefined: re,
  isDate: ta,
  isFile: sa,
  isBlob: aa,
  isRegExp: Sa,
  isFunction: k,
  isStream: na,
  isURLSearchParams: oa,
  isTypedArray: Aa,
  isFileList: ra,
  forEach: ne,
  merge: ge,
  extend: ca,
  trim: la,
  stripBOM: da,
  inherits: ua,
  toFlatObject: ha,
  kindOf: ue,
  kindOfTest: z,
  endsWith: pa,
  toArray: va,
  forEachEntry: Oa,
  matchAll: Pa,
  isHTMLForm: ba,
  hasOwnProperty: Le,
  hasOwnProp: Le,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: nt,
  freezeMethods: fa,
  toObjectSet: ga,
  toCamelCase: ma,
  noop: ja,
  toFiniteNumber: Ua,
  findKey: st,
  global: at,
  isContextDefined: rt,
  ALPHABET: it,
  generateString: _a,
  isSpecCompliantForm: Va,
  toJSONObject: ya,
  isAsyncFn: Ra,
  isThenable: Ta
};
function C(l, d, p, a, v) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", d && (this.code = d), p && (this.config = p), a && (this.request = a), v && (this.response = v);
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
const ot = C.prototype, lt = {};
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
].forEach((l) => {
  lt[l] = { value: l };
});
Object.defineProperties(C, lt);
Object.defineProperty(ot, "isAxiosError", { value: !0 });
C.from = (l, d, p, a, v, P) => {
  const b = Object.create(ot);
  return S.toFlatObject(l, b, function(y) {
    return y !== Error.prototype;
  }, (g) => g !== "isAxiosError"), C.call(b, l.message, d, p, a, v), b.cause = l, b.name = l.name, P && Object.assign(b, P), b;
};
const Ea = null;
function je(l) {
  return S.isPlainObject(l) || S.isArray(l);
}
function ct(l) {
  return S.endsWith(l, "[]") ? l.slice(0, -2) : l;
}
function qe(l, d, p) {
  return l ? l.concat(d).map(function(v, P) {
    return v = ct(v), !p && P ? "[" + v + "]" : v;
  }).join(p ? "." : "") : d;
}
function Ba(l) {
  return S.isArray(l) && !l.some(je);
}
const Fa = S.toFlatObject(S, {}, null, function(d) {
  return /^is[A-Z]/.test(d);
});
function ve(l, d, p) {
  if (!S.isObject(l))
    throw new TypeError("target must be an object");
  d = d || new FormData(), p = S.toFlatObject(p, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(T, D) {
    return !S.isUndefined(D[T]);
  });
  const a = p.metaTokens, v = p.visitor || _, P = p.dots, b = p.indexes, y = (p.Blob || typeof Blob < "u" && Blob) && S.isSpecCompliantForm(d);
  if (!S.isFunction(v))
    throw new TypeError("visitor must be a function");
  function E(R) {
    if (R === null)
      return "";
    if (S.isDate(R))
      return R.toISOString();
    if (!y && S.isBlob(R))
      throw new C("Blob is not supported. Use a Buffer instead.");
    return S.isArrayBuffer(R) || S.isTypedArray(R) ? y && typeof Blob == "function" ? new Blob([R]) : Buffer.from(R) : R;
  }
  function _(R, T, D) {
    let N = R;
    if (R && !D && typeof R == "object") {
      if (S.endsWith(T, "{}"))
        T = a ? T : T.slice(0, -2), R = JSON.stringify(R);
      else if (S.isArray(R) && Ba(R) || (S.isFileList(R) || S.endsWith(T, "[]")) && (N = S.toArray(R)))
        return T = ct(T), N.forEach(function(Y, Pe) {
          !(S.isUndefined(Y) || Y === null) && d.append(
            // eslint-disable-next-line no-nested-ternary
            b === !0 ? qe([T], Pe, P) : b === null ? T : T + "[]",
            E(Y)
          );
        }), !1;
    }
    return je(R) ? !0 : (d.append(qe(D, T, P), E(R)), !1);
  }
  const U = [], L = Object.assign(Fa, {
    defaultVisitor: _,
    convertValue: E,
    isVisitable: je
  });
  function G(R, T) {
    if (!S.isUndefined(R)) {
      if (U.indexOf(R) !== -1)
        throw Error("Circular reference detected in " + T.join("."));
      U.push(R), S.forEach(R, function(N, Q) {
        (!(S.isUndefined(N) || N === null) && v.call(
          d,
          N,
          S.isString(Q) ? Q.trim() : Q,
          T,
          L
        )) === !0 && G(N, T ? T.concat(Q) : [Q]);
      }), U.pop();
    }
  }
  if (!S.isObject(l))
    throw new TypeError("data must be an object");
  return G(l), d;
}
function De(l) {
  const d = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function(a) {
    return d[a];
  });
}
function Ee(l, d) {
  this._pairs = [], l && ve(l, this, d);
}
const dt = Ee.prototype;
dt.append = function(d, p) {
  this._pairs.push([d, p]);
};
dt.toString = function(d) {
  const p = d ? function(a) {
    return d.call(this, a, De);
  } : De;
  return this._pairs.map(function(v) {
    return p(v[0]) + "=" + p(v[1]);
  }, "").join("&");
};
function Ca(l) {
  return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function ut(l, d, p) {
  if (!d)
    return l;
  const a = p && p.encode || Ca, v = p && p.serialize;
  let P;
  if (v ? P = v(d, p) : P = S.isURLSearchParams(d) ? d.toString() : new Ee(d, p).toString(a), P) {
    const b = l.indexOf("#");
    b !== -1 && (l = l.slice(0, b)), l += (l.indexOf("?") === -1 ? "?" : "&") + P;
  }
  return l;
}
class Ia {
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
  use(d, p, a) {
    return this.handlers.push({
      fulfilled: d,
      rejected: p,
      synchronous: a ? a.synchronous : !1,
      runWhen: a ? a.runWhen : null
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
    S.forEach(this.handlers, function(a) {
      a !== null && d(a);
    });
  }
}
const He = Ia, ht = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, Ma = typeof URLSearchParams < "u" ? URLSearchParams : Ee, wa = typeof FormData < "u" ? FormData : null, La = typeof Blob < "u" ? Blob : null, xa = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ma,
    FormData: wa,
    Blob: La
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, pt = typeof window < "u" && typeof document < "u", qa = ((l) => pt && ["ReactNative", "NativeScript", "NS"].indexOf(l) < 0)(typeof navigator < "u" && navigator.product), Da = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Ha = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: pt,
  hasStandardBrowserEnv: qa,
  hasStandardBrowserWebWorkerEnv: Da
}, Symbol.toStringTag, { value: "Module" })), $ = {
  ...Ha,
  ...xa
};
function Na(l, d) {
  return ve(l, new $.classes.URLSearchParams(), Object.assign({
    visitor: function(p, a, v, P) {
      return $.isNode && S.isBuffer(p) ? (this.append(a, p.toString("base64")), !1) : P.defaultVisitor.apply(this, arguments);
    }
  }, d));
}
function Ga(l) {
  return S.matchAll(/\w+|\[(\w*)]/g, l).map((d) => d[0] === "[]" ? "" : d[1] || d[0]);
}
function ka(l) {
  const d = {}, p = Object.keys(l);
  let a;
  const v = p.length;
  let P;
  for (a = 0; a < v; a++)
    P = p[a], d[P] = l[P];
  return d;
}
function vt(l) {
  function d(p, a, v, P) {
    let b = p[P++];
    const g = Number.isFinite(+b), y = P >= p.length;
    return b = !b && S.isArray(v) ? v.length : b, y ? (S.hasOwnProp(v, b) ? v[b] = [v[b], a] : v[b] = a, !g) : ((!v[b] || !S.isObject(v[b])) && (v[b] = []), d(p, a, v[b], P) && S.isArray(v[b]) && (v[b] = ka(v[b])), !g);
  }
  if (S.isFormData(l) && S.isFunction(l.entries)) {
    const p = {};
    return S.forEachEntry(l, (a, v) => {
      d(Ga(a), v, p, 0);
    }), p;
  }
  return null;
}
function Qa(l, d, p) {
  if (S.isString(l))
    try {
      return (d || JSON.parse)(l), S.trim(l);
    } catch (a) {
      if (a.name !== "SyntaxError")
        throw a;
    }
  return (p || JSON.stringify)(l);
}
const Be = {
  transitional: ht,
  adapter: ["xhr", "http"],
  transformRequest: [function(d, p) {
    const a = p.getContentType() || "", v = a.indexOf("application/json") > -1, P = S.isObject(d);
    if (P && S.isHTMLForm(d) && (d = new FormData(d)), S.isFormData(d))
      return v && v ? JSON.stringify(vt(d)) : d;
    if (S.isArrayBuffer(d) || S.isBuffer(d) || S.isStream(d) || S.isFile(d) || S.isBlob(d))
      return d;
    if (S.isArrayBufferView(d))
      return d.buffer;
    if (S.isURLSearchParams(d))
      return p.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), d.toString();
    let g;
    if (P) {
      if (a.indexOf("application/x-www-form-urlencoded") > -1)
        return Na(d, this.formSerializer).toString();
      if ((g = S.isFileList(d)) || a.indexOf("multipart/form-data") > -1) {
        const y = this.env && this.env.FormData;
        return ve(
          g ? { "files[]": d } : d,
          y && new y(),
          this.formSerializer
        );
      }
    }
    return P || v ? (p.setContentType("application/json", !1), Qa(d)) : d;
  }],
  transformResponse: [function(d) {
    const p = this.transitional || Be.transitional, a = p && p.forcedJSONParsing, v = this.responseType === "json";
    if (d && S.isString(d) && (a && !this.responseType || v)) {
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
S.forEach(["delete", "get", "head", "post", "put", "patch"], (l) => {
  Be.headers[l] = {};
});
const Fe = Be, Ya = S.toObjectSet([
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
]), $a = (l) => {
  const d = {};
  let p, a, v;
  return l && l.split(`
`).forEach(function(b) {
    v = b.indexOf(":"), p = b.substring(0, v).trim().toLowerCase(), a = b.substring(v + 1).trim(), !(!p || d[p] && Ya[p]) && (p === "set-cookie" ? d[p] ? d[p].push(a) : d[p] = [a] : d[p] = d[p] ? d[p] + ", " + a : a);
  }), d;
}, Ne = Symbol("internals");
function se(l) {
  return l && String(l).trim().toLowerCase();
}
function le(l) {
  return l === !1 || l == null ? l : S.isArray(l) ? l.map(le) : String(l);
}
function za(l) {
  const d = /* @__PURE__ */ Object.create(null), p = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let a;
  for (; a = p.exec(l); )
    d[a[1]] = a[2];
  return d;
}
const Ka = (l) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function me(l, d, p, a, v) {
  if (S.isFunction(a))
    return a.call(this, d, p);
  if (v && (d = p), !!S.isString(d)) {
    if (S.isString(a))
      return d.indexOf(a) !== -1;
    if (S.isRegExp(a))
      return a.test(d);
  }
}
function Wa(l) {
  return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (d, p, a) => p.toUpperCase() + a);
}
function Ja(l, d) {
  const p = S.toCamelCase(" " + d);
  ["get", "set", "has"].forEach((a) => {
    Object.defineProperty(l, a + p, {
      value: function(v, P, b) {
        return this[a].call(this, d, v, P, b);
      },
      configurable: !0
    });
  });
}
let Ae = class {
  constructor(d) {
    d && this.set(d);
  }
  set(d, p, a) {
    const v = this;
    function P(g, y, E) {
      const _ = se(y);
      if (!_)
        throw new Error("header name must be a non-empty string");
      const U = S.findKey(v, _);
      (!U || v[U] === void 0 || E === !0 || E === void 0 && v[U] !== !1) && (v[U || y] = le(g));
    }
    const b = (g, y) => S.forEach(g, (E, _) => P(E, _, y));
    return S.isPlainObject(d) || d instanceof this.constructor ? b(d, p) : S.isString(d) && (d = d.trim()) && !Ka(d) ? b($a(d), p) : d != null && P(p, d, a), this;
  }
  get(d, p) {
    if (d = se(d), d) {
      const a = S.findKey(this, d);
      if (a) {
        const v = this[a];
        if (!p)
          return v;
        if (p === !0)
          return za(v);
        if (S.isFunction(p))
          return p.call(this, v, a);
        if (S.isRegExp(p))
          return p.exec(v);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(d, p) {
    if (d = se(d), d) {
      const a = S.findKey(this, d);
      return !!(a && this[a] !== void 0 && (!p || me(this, this[a], a, p)));
    }
    return !1;
  }
  delete(d, p) {
    const a = this;
    let v = !1;
    function P(b) {
      if (b = se(b), b) {
        const g = S.findKey(a, b);
        g && (!p || me(a, a[g], g, p)) && (delete a[g], v = !0);
      }
    }
    return S.isArray(d) ? d.forEach(P) : P(d), v;
  }
  clear(d) {
    const p = Object.keys(this);
    let a = p.length, v = !1;
    for (; a--; ) {
      const P = p[a];
      (!d || me(this, this[P], P, d, !0)) && (delete this[P], v = !0);
    }
    return v;
  }
  normalize(d) {
    const p = this, a = {};
    return S.forEach(this, (v, P) => {
      const b = S.findKey(a, P);
      if (b) {
        p[b] = le(v), delete p[P];
        return;
      }
      const g = d ? Wa(P) : String(P).trim();
      g !== P && delete p[P], p[g] = le(v), a[g] = !0;
    }), this;
  }
  concat(...d) {
    return this.constructor.concat(this, ...d);
  }
  toJSON(d) {
    const p = /* @__PURE__ */ Object.create(null);
    return S.forEach(this, (a, v) => {
      a != null && a !== !1 && (p[v] = d && S.isArray(a) ? a.join(", ") : a);
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
    const a = new this(d);
    return p.forEach((v) => a.set(v)), a;
  }
  static accessor(d) {
    const a = (this[Ne] = this[Ne] = {
      accessors: {}
    }).accessors, v = this.prototype;
    function P(b) {
      const g = se(b);
      a[g] || (Ja(v, b), a[g] = !0);
    }
    return S.isArray(d) ? d.forEach(P) : P(d), this;
  }
};
Ae.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
S.reduceDescriptors(Ae.prototype, ({ value: l }, d) => {
  let p = d[0].toUpperCase() + d.slice(1);
  return {
    get: () => l,
    set(a) {
      this[p] = a;
    }
  };
});
S.freezeMethods(Ae);
const K = Ae;
function Se(l, d) {
  const p = this || Fe, a = d || p, v = K.from(a.headers);
  let P = a.data;
  return S.forEach(l, function(g) {
    P = g.call(p, P, v.normalize(), d ? d.status : void 0);
  }), v.normalize(), P;
}
function At(l) {
  return !!(l && l.__CANCEL__);
}
function ie(l, d, p) {
  C.call(this, l ?? "canceled", C.ERR_CANCELED, d, p), this.name = "CanceledError";
}
S.inherits(ie, C, {
  __CANCEL__: !0
});
function Xa(l, d, p) {
  const a = p.config.validateStatus;
  !p.status || !a || a(p.status) ? l(p) : d(new C(
    "Request failed with status code " + p.status,
    [C.ERR_BAD_REQUEST, C.ERR_BAD_RESPONSE][Math.floor(p.status / 100) - 4],
    p.config,
    p.request,
    p
  ));
}
const Za = $.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(l, d, p, a, v, P) {
      const b = [l + "=" + encodeURIComponent(d)];
      S.isNumber(p) && b.push("expires=" + new Date(p).toGMTString()), S.isString(a) && b.push("path=" + a), S.isString(v) && b.push("domain=" + v), P === !0 && b.push("secure"), document.cookie = b.join("; ");
    },
    read(l) {
      const d = document.cookie.match(new RegExp("(^|;\\s*)(" + l + ")=([^;]*)"));
      return d ? decodeURIComponent(d[3]) : null;
    },
    remove(l) {
      this.write(l, "", Date.now() - 864e5);
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
function er(l) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l);
}
function tr(l, d) {
  return d ? l.replace(/\/+$/, "") + "/" + d.replace(/^\/+/, "") : l;
}
function Ot(l, d) {
  return l && !er(d) ? tr(l, d) : d;
}
const sr = $.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const d = /(msie|trident)/i.test(navigator.userAgent), p = document.createElement("a");
    let a;
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
    return a = v(window.location.href), function(b) {
      const g = S.isString(b) ? v(b) : b;
      return g.protocol === a.protocol && g.host === a.host;
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
function ar(l) {
  const d = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l);
  return d && d[1] || "";
}
function rr(l, d) {
  l = l || 10;
  const p = new Array(l), a = new Array(l);
  let v = 0, P = 0, b;
  return d = d !== void 0 ? d : 1e3, function(y) {
    const E = Date.now(), _ = a[P];
    b || (b = E), p[v] = y, a[v] = E;
    let U = P, L = 0;
    for (; U !== v; )
      L += p[U++], U = U % l;
    if (v = (v + 1) % l, v === P && (P = (P + 1) % l), E - b < d)
      return;
    const G = _ && E - _;
    return G ? Math.round(L * 1e3 / G) : void 0;
  };
}
function Ge(l, d) {
  let p = 0;
  const a = rr(50, 250);
  return (v) => {
    const P = v.loaded, b = v.lengthComputable ? v.total : void 0, g = P - p, y = a(g), E = P <= b;
    p = P;
    const _ = {
      loaded: P,
      total: b,
      progress: b ? P / b : void 0,
      bytes: g,
      rate: y || void 0,
      estimated: y && b && E ? (b - P) / y : void 0,
      event: v
    };
    _[d ? "download" : "upload"] = !0, l(_);
  };
}
const nr = typeof XMLHttpRequest < "u", ir = nr && function(l) {
  return new Promise(function(p, a) {
    let v = l.data;
    const P = K.from(l.headers).normalize();
    let { responseType: b, withXSRFToken: g } = l, y;
    function E() {
      l.cancelToken && l.cancelToken.unsubscribe(y), l.signal && l.signal.removeEventListener("abort", y);
    }
    let _;
    if (S.isFormData(v)) {
      if ($.hasStandardBrowserEnv || $.hasStandardBrowserWebWorkerEnv)
        P.setContentType(!1);
      else if ((_ = P.getContentType()) !== !1) {
        const [T, ...D] = _ ? _.split(";").map((N) => N.trim()).filter(Boolean) : [];
        P.setContentType([T || "multipart/form-data", ...D].join("; "));
      }
    }
    let U = new XMLHttpRequest();
    if (l.auth) {
      const T = l.auth.username || "", D = l.auth.password ? unescape(encodeURIComponent(l.auth.password)) : "";
      P.set("Authorization", "Basic " + btoa(T + ":" + D));
    }
    const L = Ot(l.baseURL, l.url);
    U.open(l.method.toUpperCase(), ut(L, l.params, l.paramsSerializer), !0), U.timeout = l.timeout;
    function G() {
      if (!U)
        return;
      const T = K.from(
        "getAllResponseHeaders" in U && U.getAllResponseHeaders()
      ), N = {
        data: !b || b === "text" || b === "json" ? U.responseText : U.response,
        status: U.status,
        statusText: U.statusText,
        headers: T,
        config: l,
        request: U
      };
      Xa(function(Y) {
        p(Y), E();
      }, function(Y) {
        a(Y), E();
      }, N), U = null;
    }
    if ("onloadend" in U ? U.onloadend = G : U.onreadystatechange = function() {
      !U || U.readyState !== 4 || U.status === 0 && !(U.responseURL && U.responseURL.indexOf("file:") === 0) || setTimeout(G);
    }, U.onabort = function() {
      U && (a(new C("Request aborted", C.ECONNABORTED, l, U)), U = null);
    }, U.onerror = function() {
      a(new C("Network Error", C.ERR_NETWORK, l, U)), U = null;
    }, U.ontimeout = function() {
      let D = l.timeout ? "timeout of " + l.timeout + "ms exceeded" : "timeout exceeded";
      const N = l.transitional || ht;
      l.timeoutErrorMessage && (D = l.timeoutErrorMessage), a(new C(
        D,
        N.clarifyTimeoutError ? C.ETIMEDOUT : C.ECONNABORTED,
        l,
        U
      )), U = null;
    }, $.hasStandardBrowserEnv && (g && S.isFunction(g) && (g = g(l)), g || g !== !1 && sr(L))) {
      const T = l.xsrfHeaderName && l.xsrfCookieName && Za.read(l.xsrfCookieName);
      T && P.set(l.xsrfHeaderName, T);
    }
    v === void 0 && P.setContentType(null), "setRequestHeader" in U && S.forEach(P.toJSON(), function(D, N) {
      U.setRequestHeader(N, D);
    }), S.isUndefined(l.withCredentials) || (U.withCredentials = !!l.withCredentials), b && b !== "json" && (U.responseType = l.responseType), typeof l.onDownloadProgress == "function" && U.addEventListener("progress", Ge(l.onDownloadProgress, !0)), typeof l.onUploadProgress == "function" && U.upload && U.upload.addEventListener("progress", Ge(l.onUploadProgress)), (l.cancelToken || l.signal) && (y = (T) => {
      U && (a(!T || T.type ? new ie(null, l, U) : T), U.abort(), U = null);
    }, l.cancelToken && l.cancelToken.subscribe(y), l.signal && (l.signal.aborted ? y() : l.signal.addEventListener("abort", y)));
    const R = ar(L);
    if (R && $.protocols.indexOf(R) === -1) {
      a(new C("Unsupported protocol " + R + ":", C.ERR_BAD_REQUEST, l));
      return;
    }
    U.send(v || null);
  });
}, Ue = {
  http: Ea,
  xhr: ir
};
S.forEach(Ue, (l, d) => {
  if (l) {
    try {
      Object.defineProperty(l, "name", { value: d });
    } catch {
    }
    Object.defineProperty(l, "adapterName", { value: d });
  }
});
const ke = (l) => `- ${l}`, or = (l) => S.isFunction(l) || l === null || l === !1, Pt = {
  getAdapter: (l) => {
    l = S.isArray(l) ? l : [l];
    const { length: d } = l;
    let p, a;
    const v = {};
    for (let P = 0; P < d; P++) {
      p = l[P];
      let b;
      if (a = p, !or(p) && (a = Ue[(b = String(p)).toLowerCase()], a === void 0))
        throw new C(`Unknown adapter '${b}'`);
      if (a)
        break;
      v[b || "#" + P] = a;
    }
    if (!a) {
      const P = Object.entries(v).map(
        ([g, y]) => `adapter ${g} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let b = d ? P.length > 1 ? `since :
` + P.map(ke).join(`
`) : " " + ke(P[0]) : "as no adapter specified";
      throw new C(
        "There is no suitable adapter to dispatch the request " + b,
        "ERR_NOT_SUPPORT"
      );
    }
    return a;
  },
  adapters: Ue
};
function fe(l) {
  if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new ie(null, l);
}
function Qe(l) {
  return fe(l), l.headers = K.from(l.headers), l.data = Se.call(
    l,
    l.transformRequest
  ), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), Pt.getAdapter(l.adapter || Fe.adapter)(l).then(function(a) {
    return fe(l), a.data = Se.call(
      l,
      l.transformResponse,
      a
    ), a.headers = K.from(a.headers), a;
  }, function(a) {
    return At(a) || (fe(l), a && a.response && (a.response.data = Se.call(
      l,
      l.transformResponse,
      a.response
    ), a.response.headers = K.from(a.response.headers))), Promise.reject(a);
  });
}
const Ye = (l) => l instanceof K ? l.toJSON() : l;
function Z(l, d) {
  d = d || {};
  const p = {};
  function a(E, _, U) {
    return S.isPlainObject(E) && S.isPlainObject(_) ? S.merge.call({ caseless: U }, E, _) : S.isPlainObject(_) ? S.merge({}, _) : S.isArray(_) ? _.slice() : _;
  }
  function v(E, _, U) {
    if (S.isUndefined(_)) {
      if (!S.isUndefined(E))
        return a(void 0, E, U);
    } else
      return a(E, _, U);
  }
  function P(E, _) {
    if (!S.isUndefined(_))
      return a(void 0, _);
  }
  function b(E, _) {
    if (S.isUndefined(_)) {
      if (!S.isUndefined(E))
        return a(void 0, E);
    } else
      return a(void 0, _);
  }
  function g(E, _, U) {
    if (U in d)
      return a(E, _);
    if (U in l)
      return a(void 0, E);
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
    headers: (E, _) => v(Ye(E), Ye(_), !0)
  };
  return S.forEach(Object.keys(Object.assign({}, l, d)), function(_) {
    const U = y[_] || v, L = U(l[_], d[_], _);
    S.isUndefined(L) && U !== g || (p[_] = L);
  }), p;
}
const bt = "1.6.2", Ce = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, d) => {
  Ce[l] = function(a) {
    return typeof a === l || "a" + (d < 1 ? "n " : " ") + l;
  };
});
const $e = {};
Ce.transitional = function(d, p, a) {
  function v(P, b) {
    return "[Axios v" + bt + "] Transitional option '" + P + "'" + b + (a ? ". " + a : "");
  }
  return (P, b, g) => {
    if (d === !1)
      throw new C(
        v(b, " has been removed" + (p ? " in " + p : "")),
        C.ERR_DEPRECATED
      );
    return p && !$e[b] && ($e[b] = !0, console.warn(
      v(
        b,
        " has been deprecated since v" + p + " and will be removed in the near future"
      )
    )), d ? d(P, b, g) : !0;
  };
};
function lr(l, d, p) {
  if (typeof l != "object")
    throw new C("options must be an object", C.ERR_BAD_OPTION_VALUE);
  const a = Object.keys(l);
  let v = a.length;
  for (; v-- > 0; ) {
    const P = a[v], b = d[P];
    if (b) {
      const g = l[P], y = g === void 0 || b(g, P, l);
      if (y !== !0)
        throw new C("option " + P + " must be " + y, C.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (p !== !0)
      throw new C("Unknown option " + P, C.ERR_BAD_OPTION);
  }
}
const _e = {
  assertOptions: lr,
  validators: Ce
}, W = _e.validators;
let de = class {
  constructor(d) {
    this.defaults = d, this.interceptors = {
      request: new He(),
      response: new He()
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
    const { transitional: a, paramsSerializer: v, headers: P } = p;
    a !== void 0 && _e.assertOptions(a, {
      silentJSONParsing: W.transitional(W.boolean),
      forcedJSONParsing: W.transitional(W.boolean),
      clarifyTimeoutError: W.transitional(W.boolean)
    }, !1), v != null && (S.isFunction(v) ? p.paramsSerializer = {
      serialize: v
    } : _e.assertOptions(v, {
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
    this.interceptors.request.forEach(function(T) {
      typeof T.runWhen == "function" && T.runWhen(p) === !1 || (y = y && T.synchronous, g.unshift(T.fulfilled, T.rejected));
    });
    const E = [];
    this.interceptors.response.forEach(function(T) {
      E.push(T.fulfilled, T.rejected);
    });
    let _, U = 0, L;
    if (!y) {
      const R = [Qe.bind(this), void 0];
      for (R.unshift.apply(R, g), R.push.apply(R, E), L = R.length, _ = Promise.resolve(p); U < L; )
        _ = _.then(R[U++], R[U++]);
      return _;
    }
    L = g.length;
    let G = p;
    for (U = 0; U < L; ) {
      const R = g[U++], T = g[U++];
      try {
        G = R(G);
      } catch (D) {
        T.call(this, D);
        break;
      }
    }
    try {
      _ = Qe.call(this, G);
    } catch (R) {
      return Promise.reject(R);
    }
    for (U = 0, L = E.length; U < L; )
      _ = _.then(E[U++], E[U++]);
    return _;
  }
  getUri(d) {
    d = Z(this.defaults, d);
    const p = Ot(d.baseURL, d.url);
    return ut(p, d.params, d.paramsSerializer);
  }
};
S.forEach(["delete", "get", "head", "options"], function(d) {
  de.prototype[d] = function(p, a) {
    return this.request(Z(a || {}, {
      method: d,
      url: p,
      data: (a || {}).data
    }));
  };
});
S.forEach(["post", "put", "patch"], function(d) {
  function p(a) {
    return function(P, b, g) {
      return this.request(Z(g || {}, {
        method: d,
        headers: a ? {
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
let cr = class mt {
  constructor(d) {
    if (typeof d != "function")
      throw new TypeError("executor must be a function.");
    let p;
    this.promise = new Promise(function(P) {
      p = P;
    });
    const a = this;
    this.promise.then((v) => {
      if (!a._listeners)
        return;
      let P = a._listeners.length;
      for (; P-- > 0; )
        a._listeners[P](v);
      a._listeners = null;
    }), this.promise.then = (v) => {
      let P;
      const b = new Promise((g) => {
        a.subscribe(g), P = g;
      }).then(v);
      return b.cancel = function() {
        a.unsubscribe(P);
      }, b;
    }, d(function(P, b, g) {
      a.reason || (a.reason = new ie(P, b, g), p(a.reason));
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
      token: new mt(function(v) {
        d = v;
      }),
      cancel: d
    };
  }
};
const dr = cr;
function ur(l) {
  return function(p) {
    return l.apply(null, p);
  };
}
function hr(l) {
  return S.isObject(l) && l.isAxiosError === !0;
}
const Ve = {
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
Object.entries(Ve).forEach(([l, d]) => {
  Ve[d] = l;
});
const pr = Ve;
function St(l) {
  const d = new ce(l), p = Ze(ce.prototype.request, d);
  return S.extend(p, ce.prototype, d, { allOwnKeys: !0 }), S.extend(p, d, null, { allOwnKeys: !0 }), p.create = function(v) {
    return St(Z(l, v));
  }, p;
}
const q = St(Fe);
q.Axios = ce;
q.CanceledError = ie;
q.CancelToken = dr;
q.isCancel = At;
q.VERSION = bt;
q.toFormData = ve;
q.AxiosError = C;
q.Cancel = q.CanceledError;
q.all = function(d) {
  return Promise.all(d);
};
q.spread = ur;
q.isAxiosError = hr;
q.mergeConfig = Z;
q.AxiosHeaders = K;
q.formToJSON = (l) => vt(S.isHTMLForm(l) ? new FormData(l) : l);
q.getAdapter = Pt.getAdapter;
q.HttpStatusCode = pr;
q.default = q;
const Ie = q, {
  Axios: vr,
  AxiosError: Ar,
  CanceledError: Or,
  isCancel: Pr,
  CancelToken: br,
  VERSION: mr,
  all: Sr,
  Cancel: fr,
  isAxiosError: gr,
  spread: jr,
  toFormData: Ur,
  AxiosHeaders: _r,
  HttpStatusCode: Vr,
  formToJSON: yr,
  getAdapter: Rr,
  mergeConfig: Tr
} = Ie, Er = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: vr,
  AxiosError: Ar,
  AxiosHeaders: _r,
  Cancel: fr,
  CancelToken: br,
  CanceledError: Or,
  HttpStatusCode: Vr,
  VERSION: mr,
  all: Sr,
  default: Ie,
  formToJSON: yr,
  getAdapter: Rr,
  isAxiosError: gr,
  isCancel: Pr,
  mergeConfig: Tr,
  spread: jr,
  toFormData: Ur
}, Symbol.toStringTag, { value: "Module" })), ft = /* @__PURE__ */ Ks(Er);
var M = {}, Me = {};
(function(l) {
  Object.defineProperty(l, "__esModule", { value: !0 }), l.operationServerMap = l.RequiredError = l.BaseAPI = l.COLLECTION_FORMATS = l.BASE_PATH = void 0;
  const d = ft;
  l.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), l.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class p {
    constructor(P, b = l.BASE_PATH, g = d.default) {
      var y;
      this.basePath = b, this.axios = g, P && (this.configuration = P, this.basePath = (y = P.basePath) !== null && y !== void 0 ? y : b);
    }
  }
  l.BaseAPI = p;
  class a extends Error {
    constructor(P, b) {
      super(b), this.field = P, this.name = "RequiredError";
    }
  }
  l.RequiredError = a, l.operationServerMap = {};
})(Me);
var we = J && J.__awaiter || function(l, d, p, a) {
  function v(P) {
    return P instanceof p ? P : new p(function(b) {
      b(P);
    });
  }
  return new (p || (p = Promise))(function(P, b) {
    function g(_) {
      try {
        E(a.next(_));
      } catch (U) {
        b(U);
      }
    }
    function y(_) {
      try {
        E(a.throw(_));
      } catch (U) {
        b(U);
      }
    }
    function E(_) {
      _.done ? P(_.value) : v(_.value).then(g, y);
    }
    E((a = a.apply(l, d || [])).next());
  });
};
Object.defineProperty(M, "__esModule", { value: !0 });
M.createRequestFunction = M.toPathString = M.serializeDataIfNeeded = M.setSearchParams = M.setOAuthToObject = M.setBearerAuthToObject = M.setBasicAuthToObject = M.setApiKeyToObject = M.assertParamExists = M.DUMMY_BASE_URL = void 0;
const Br = Me;
M.DUMMY_BASE_URL = "https://example.com";
const Fr = function(l, d, p) {
  if (p == null)
    throw new Br.RequiredError(d, `Required parameter ${d} was null or undefined when calling ${l}.`);
};
M.assertParamExists = Fr;
const Cr = function(l, d, p) {
  return we(this, void 0, void 0, function* () {
    if (p && p.apiKey) {
      const a = typeof p.apiKey == "function" ? yield p.apiKey(d) : yield p.apiKey;
      l[d] = a;
    }
  });
};
M.setApiKeyToObject = Cr;
const Ir = function(l, d) {
  d && (d.username || d.password) && (l.auth = { username: d.username, password: d.password });
};
M.setBasicAuthToObject = Ir;
const Mr = function(l, d) {
  return we(this, void 0, void 0, function* () {
    if (d && d.accessToken) {
      const p = typeof d.accessToken == "function" ? yield d.accessToken() : yield d.accessToken;
      l.Authorization = "Bearer " + p;
    }
  });
};
M.setBearerAuthToObject = Mr;
const wr = function(l, d, p, a) {
  return we(this, void 0, void 0, function* () {
    if (a && a.accessToken) {
      const v = typeof a.accessToken == "function" ? yield a.accessToken(d, p) : yield a.accessToken;
      l.Authorization = "Bearer " + v;
    }
  });
};
M.setOAuthToObject = wr;
function ye(l, d, p = "") {
  d != null && (typeof d == "object" ? Array.isArray(d) ? d.forEach((a) => ye(l, a, p)) : Object.keys(d).forEach((a) => ye(l, d[a], `${p}${p !== "" ? "." : ""}${a}`)) : l.has(p) ? l.append(p, d) : l.set(p, d));
}
const Lr = function(l, ...d) {
  const p = new URLSearchParams(l.search);
  ye(p, d), l.search = p.toString();
};
M.setSearchParams = Lr;
const xr = function(l, d, p) {
  const a = typeof l != "string";
  return (a && p && p.isJsonMime ? p.isJsonMime(d.headers["Content-Type"]) : a) ? JSON.stringify(l !== void 0 ? l : {}) : l || "";
};
M.serializeDataIfNeeded = xr;
const qr = function(l) {
  return l.pathname + l.search + l.hash;
};
M.toPathString = qr;
const Dr = function(l, d, p, a) {
  return (v = d, P = p) => {
    var b;
    const g = Object.assign(Object.assign({}, l.options), { url: (v.defaults.baseURL ? "" : (b = a == null ? void 0 : a.basePath) !== null && b !== void 0 ? b : P) + l.url });
    return v.request(g);
  };
};
M.createRequestFunction = Dr;
(function(l) {
  var d = J && J.__awaiter || function(r, c, n, i) {
    function s(e) {
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
        A.done ? e(A.value) : s(A.value).then(o, u);
      }
      h((i = i.apply(r, c || [])).next());
    });
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), l.ProductCategoriesApiFactory = l.ProductCategoriesApiFp = l.ProductCategoriesApiAxiosParamCreator = l.PointofsaleApi = l.PointofsaleApiFactory = l.PointofsaleApiFp = l.PointofsaleApiAxiosParamCreator = l.PayoutRequestsApi = l.PayoutRequestsApiFactory = l.PayoutRequestsApiFp = l.PayoutRequestsApiAxiosParamCreator = l.InvoicesApi = l.InvoicesApiFactory = l.InvoicesApiFp = l.InvoicesApiAxiosParamCreator = l.FilesApi = l.FilesApiFactory = l.FilesApiFp = l.FilesApiAxiosParamCreator = l.EventsApi = l.EventsApiFactory = l.EventsApiFp = l.EventsApiAxiosParamCreator = l.DebtorsApi = l.DebtorsApiFactory = l.DebtorsApiFp = l.DebtorsApiAxiosParamCreator = l.ContainersApi = l.ContainersApiFactory = l.ContainersApiFp = l.ContainersApiAxiosParamCreator = l.BannersApi = l.BannersApiFactory = l.BannersApiFp = l.BannersApiAxiosParamCreator = l.GetAllBalanceOrderDirectionEnum = l.GetAllBalanceUserTypeEnum = l.BalanceApi = l.BalanceApiFactory = l.BalanceApiFp = l.BalanceApiAxiosParamCreator = l.AuthenticateApi = l.AuthenticateApiFactory = l.AuthenticateApiFp = l.AuthenticateApiAxiosParamCreator = l.UserTypeEnum = l.UpdateInvoiceRequestStateEnum = l.PayoutRequestStatusRequestStateEnum = l.InvoiceStatusResponseStateEnum = l.FinancialMutationResponseTypeEnum = void 0, l.VouchergroupsApi = l.VouchergroupsApiFactory = l.VouchergroupsApiFp = l.VouchergroupsApiAxiosParamCreator = l.VatGroupsApi = l.VatGroupsApiFactory = l.VatGroupsApiFp = l.VatGroupsApiAxiosParamCreator = l.GetAllUsersTypeEnum = l.UsersApi = l.UsersApiFactory = l.UsersApiFp = l.UsersApiAxiosParamCreator = l.TransfersApi = l.TransfersApiFactory = l.TransfersApiFp = l.TransfersApiAxiosParamCreator = l.TransactionsApi = l.TransactionsApiFactory = l.TransactionsApiFp = l.TransactionsApiAxiosParamCreator = l.TestOperationsOfTheTestControllerApi = l.TestOperationsOfTheTestControllerApiFactory = l.TestOperationsOfTheTestControllerApiFp = l.TestOperationsOfTheTestControllerApiAxiosParamCreator = l.StripeApi = l.StripeApiFactory = l.StripeApiFp = l.StripeApiAxiosParamCreator = l.RootApi = l.RootApiFactory = l.RootApiFp = l.RootApiAxiosParamCreator = l.RbacApi = l.RbacApiFactory = l.RbacApiFp = l.RbacApiAxiosParamCreator = l.ProductsApi = l.ProductsApiFactory = l.ProductsApiFp = l.ProductsApiAxiosParamCreator = l.ProductCategoriesApi = void 0;
  const p = ft, a = M, v = Me;
  l.FinancialMutationResponseTypeEnum = {
    Transfer: "transfer",
    Transaction: "transaction"
  }, l.InvoiceStatusResponseStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, l.PayoutRequestStatusRequestStateEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
  }, l.UpdateInvoiceRequestStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, l.UserTypeEnum = {
    _1: "1",
    _2: "2",
    _3: "3",
    _4: "4",
    _5: "5",
    _6: "6",
    _7: "7"
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
      eanAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("eanAuthentication", "authenticationEanRequest", c);
        const i = "/authentication/ean", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      gewisLDAPAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", c);
        const i = "/authentication/GEWIS/LDAP", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      gewisPinAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", c);
        const i = "/authentication/GEWIS/pin", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      gewisWebAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", c);
        const i = "/authentication/gewisweb", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      keyAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("keyAuthentication", "authenticationKeyRequest", c);
        const i = "/authentication/key", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      ldapAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", c);
        const i = "/authentication/LDAP", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      localAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("localAuthentication", "authenticationLocalRequest", c);
        const i = "/authentication/local", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      mockAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("mockAuthentication", "authenticationMockRequest", c);
        const i = "/authentication/mock", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      nfcAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", c);
        const i = "/authentication/nfc", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      pinAuthentication: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("pinAuthentication", "authenticationPinRequest", c);
        const i = "/authentication/pin", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (c = {}) => d(this, void 0, void 0, function* () {
        const n = "/authentication/refreshToken", i = new URL(n, a.DUMMY_BASE_URL);
        let s;
        r && (s = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, s), c), t = {}, o = {};
        yield (0, a.setBearerAuthToObject)(t, r), (0, a.setSearchParams)(i, o);
        let u = s && s.headers ? s.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), c.headers), {
          url: (0, a.toPathString)(i),
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
      resetLocal: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("resetLocal", "resetLocalRequest", c);
        const i = "/authentication/local/reset", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      resetLocalWithToken: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", c);
        const i = "/authentication/local", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "PUT" }, e), n), o = {}, u = {};
        o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.AuthenticateApiAxiosParamCreator = P;
  const b = function(r) {
    const c = (0, l.AuthenticateApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.eanAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.gewisLDAPAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.gewisPinAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.gewisWebAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.keyAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.ldapAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.localAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.localAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.mockAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.nfcAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.pinAuthentication(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(n) {
        var i, s, e;
        return d(this, void 0, void 0, function* () {
          const t = yield c.refreshToken(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (s = v.operationServerMap["AuthenticateApi.refreshToken"]) === null || s === void 0 ? void 0 : s[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, a.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.resetLocal(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.resetLocal"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.resetLocalWithToken(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.AuthenticateApiFp = b;
  const g = function(r, c, n) {
    const i = (0, l.AuthenticateApiFp)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(s, e) {
        return i.eanAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(s, e) {
        return i.gewisLDAPAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(s, e) {
        return i.gewisPinAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(s, e) {
        return i.gewisWebAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(s, e) {
        return i.keyAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(s, e) {
        return i.ldapAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(s, e) {
        return i.localAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(s, e) {
        return i.mockAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(s, e) {
        return i.nfcAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(s, e) {
        return i.pinAuthentication(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(s) {
        return i.refreshToken(s).then((e) => e(n, c));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(s, e) {
        return i.resetLocal(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(s, e) {
        return i.resetLocalWithToken(s, e).then((t) => t(n, c));
      }
    };
  };
  l.AuthenticateApiFactory = g;
  class y extends v.BaseAPI {
    /**
     *
     * @summary EAN login and hand out token
     * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).eanAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Key login and hand out token.
     * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).keyAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).ldapAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Local login and hand out token
     * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).localAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Mock login and hand out token.
     * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).mockAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary NFC login and hand out token
     * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).nfcAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token
     * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).pinAuthentication(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(c) {
      return (0, l.AuthenticateApiFp)(this.configuration).refreshToken(c).then((n) => n(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a reset token for the local authentication
     * @param {ResetLocalRequest} resetLocalRequest The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).resetLocal(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(c, n) {
      return (0, l.AuthenticateApiFp)(this.configuration).resetLocalWithToken(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.AuthenticateApi = y;
  const E = function(r) {
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
      getAllBalance: (c, n, i, s, e, t, o, u, h, A, O, m = {}) => d(this, void 0, void 0, function* () {
        const f = "/balances/all", j = new URL(f, a.DUMMY_BASE_URL);
        let V;
        r && (V = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, V), m), B = {}, I = {};
        yield (0, a.setBearerAuthToObject)(B, r), c !== void 0 && (I.date = c), n !== void 0 && (I.minBalance = n), i !== void 0 && (I.maxBalance = i), s !== void 0 && (I.hasFine = s), e !== void 0 && (I.minFine = e), t !== void 0 && (I.maxFine = t), o !== void 0 && (I.userType = o), u !== void 0 && (I.orderBy = u), h !== void 0 && (I.orderDirection = h), A !== void 0 && (I.take = A), O !== void 0 && (I.skip = O), (0, a.setSearchParams)(j, I);
        let X = V && V.headers ? V.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, B), X), m.headers), {
          url: (0, a.toPathString)(j),
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
      getBalanceId: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getBalanceId", "id", c);
        const i = "/balances/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (c = {}) => d(this, void 0, void 0, function* () {
        const n = "/balances", i = new URL(n, a.DUMMY_BASE_URL);
        let s;
        r && (s = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, s), c), t = {}, o = {};
        yield (0, a.setBearerAuthToObject)(t, r), (0, a.setSearchParams)(i, o);
        let u = s && s.headers ? s.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), c.headers), {
          url: (0, a.toPathString)(i),
          options: e
        };
      })
    };
  };
  l.BalanceApiAxiosParamCreator = E;
  const _ = function(r) {
    const c = (0, l.BalanceApiAxiosParamCreator)(r);
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
      getAllBalance(n, i, s, e, t, o, u, h, A, O, m, f) {
        var j, V, F;
        return d(this, void 0, void 0, function* () {
          const B = yield c.getAllBalance(n, i, s, e, t, o, u, h, A, O, m, f), I = (j = r == null ? void 0 : r.serverIndex) !== null && j !== void 0 ? j : 0, X = (F = (V = v.operationServerMap["BalanceApi.getAllBalance"]) === null || V === void 0 ? void 0 : V[I]) === null || F === void 0 ? void 0 : F.url;
          return (te, ws) => (0, a.createRequestFunction)(B, p.default, v.BASE_PATH, r)(te, X || ws);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getBalanceId(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["BalanceApi.getBalanceId"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(n) {
        var i, s, e;
        return d(this, void 0, void 0, function* () {
          const t = yield c.getBalances(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (s = v.operationServerMap["BalanceApi.getBalances"]) === null || s === void 0 ? void 0 : s[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, a.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  l.BalanceApiFp = _;
  const U = function(r, c, n) {
    const i = (0, l.BalanceApiFp)(r);
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
      getAllBalance(s, e, t, o, u, h, A, O, m, f, j, V) {
        return i.getAllBalance(s, e, t, o, u, h, A, O, m, f, j, V).then((F) => F(n, c));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(s, e) {
        return i.getBalanceId(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(s) {
        return i.getBalances(s).then((e) => e(n, c));
      }
    };
  };
  l.BalanceApiFactory = U;
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
    getAllBalance(c, n, i, s, e, t, o, u, h, A, O, m) {
      return (0, l.BalanceApiFp)(this.configuration).getAllBalance(c, n, i, s, e, t, o, u, h, A, O, m).then((f) => f(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(c, n) {
      return (0, l.BalanceApiFp)(this.configuration).getBalanceId(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(c) {
      return (0, l.BalanceApiFp)(this.configuration).getBalances(c).then((n) => n(this.axios, this.basePath));
    }
  }
  l.BalanceApi = L, l.GetAllBalanceUserTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  }, l.GetAllBalanceOrderDirectionEnum = {
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
      _delete: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("_delete", "id", c);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      create: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("create", "bannerRequest", c);
        const i = "/banners", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getActive: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/banners/active", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getAllBanners: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/banners", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getAllOpenBanners: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/open/banners", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getBanner: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getBanner", "id", c);
        const i = "/banners/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      update: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("update", "id", c), (0, a.assertParamExists)("update", "bannerRequest", n);
        const s = "/banners/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      updateImage: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateImage", "id", c);
        const s = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, a.setBearerAuthToObject)(u, r), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, a.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.BannersApiAxiosParamCreator = G;
  const R = function(r) {
    const c = (0, l.BannersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c._delete(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["BannersApi._delete"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.create(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["BannersApi.create"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getActive(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getActive(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getActive"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllBanners(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllBanners(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getAllBanners"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllOpenBanners(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllOpenBanners(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.getAllOpenBanners"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getBanner(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["BannersApi.getBanner"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      update(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.update(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.update"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateImage(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateImage(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["BannersApi.updateImage"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.BannersApiFp = R;
  const T = function(r, c, n) {
    const i = (0, l.BannersApiFp)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(s, e) {
        return i._delete(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(s, e) {
        return i.create(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(s, e, t) {
        return i.getActive(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(s, e, t) {
        return i.getAllBanners(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(s, e, t) {
        return i.getAllOpenBanners(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(s, e) {
        return i.getBanner(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(s, e, t) {
        return i.update(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(s, e, t) {
        return i.updateImage(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.BannersApiFactory = T;
  class D extends v.BaseAPI {
    /**
     *
     * @summary Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(c, n) {
      return (0, l.BannersApiFp)(this.configuration)._delete(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Saves a banner to the database
     * @param {BannerRequest} bannerRequest The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(c, n) {
      return (0, l.BannersApiFp)(this.configuration).create(c, n).then((i) => i(this.axios, this.basePath));
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
    getActive(c, n, i) {
      return (0, l.BannersApiFp)(this.configuration).getActive(c, n, i).then((s) => s(this.axios, this.basePath));
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
    getAllBanners(c, n, i) {
      return (0, l.BannersApiFp)(this.configuration).getAllBanners(c, n, i).then((s) => s(this.axios, this.basePath));
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
    getAllOpenBanners(c, n, i) {
      return (0, l.BannersApiFp)(this.configuration).getAllOpenBanners(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(c, n) {
      return (0, l.BannersApiFp)(this.configuration).getBanner(c, n).then((i) => i(this.axios, this.basePath));
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
    update(c, n, i) {
      return (0, l.BannersApiFp)(this.configuration).update(c, n, i).then((s) => s(this.axios, this.basePath));
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
    updateImage(c, n, i) {
      return (0, l.BannersApiFp)(this.configuration).updateImage(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.BannersApi = D;
  const N = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("createContainer", "createContainerRequest", c);
        const i = "/containers", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllContainers: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/containers", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getProductsContainer: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getProductsContainer", "id", c);
        const e = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getPublicContainers: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/containers/public", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getSingleContainer: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleContainer", "id", c);
        const i = "/containers/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      updateContainer: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateContainer", "id", c), (0, a.assertParamExists)("updateContainer", "updateContainerRequest", n);
        const s = "/containers/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.ContainersApiAxiosParamCreator = N;
  const Q = function(r) {
    const c = (0, l.ContainersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createContainer(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ContainersApi.createContainer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllContainers(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllContainers(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.getAllContainers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getProductsContainer(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getProductsContainer(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["ContainersApi.getProductsContainer"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getPublicContainers(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getPublicContainers(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.getPublicContainers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleContainer(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ContainersApi.getSingleContainer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateContainer(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateContainer(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ContainersApi.updateContainer"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.ContainersApiFp = Q;
  const Y = function(r, c, n) {
    const i = (0, l.ContainersApiFp)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(s, e) {
        return i.createContainer(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(s, e, t) {
        return i.getAllContainers(s, e, t).then((o) => o(n, c));
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
      getProductsContainer(s, e, t, o) {
        return i.getProductsContainer(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(s, e, t) {
        return i.getPublicContainers(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(s, e) {
        return i.getSingleContainer(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(s, e, t) {
        return i.updateContainer(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.ContainersApiFactory = Y;
  class Pe extends v.BaseAPI {
    /**
     *
     * @summary Create a new container.
     * @param {CreateContainerRequest} createContainerRequest    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(c, n) {
      return (0, l.ContainersApiFp)(this.configuration).createContainer(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllContainers(c, n, i) {
      return (0, l.ContainersApiFp)(this.configuration).getAllContainers(c, n, i).then((s) => s(this.axios, this.basePath));
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
    getProductsContainer(c, n, i, s) {
      return (0, l.ContainersApiFp)(this.configuration).getProductsContainer(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getPublicContainers(c, n, i) {
      return (0, l.ContainersApiFp)(this.configuration).getPublicContainers(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(c, n) {
      return (0, l.ContainersApiFp)(this.configuration).getSingleContainer(c, n).then((i) => i(this.axios, this.basePath));
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
    updateContainer(c, n, i) {
      return (0, l.ContainersApiFp)(this.configuration).updateContainer(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.ContainersApi = Pe;
  const gt = function(r) {
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteFine", "id", c);
        const i = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      handoutFines: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("handoutFines", "handoutFinesRequest", c);
        const i = "/fines/handout", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      notifyAboutFutureFines: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", c);
        const i = "/fines/notify", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      returnAllFineHandoutEvents: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/fines", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      returnSingleFineHandoutEvent: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("returnSingleFineHandoutEvent", "id", c);
        const i = "/fines/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.DebtorsApiAxiosParamCreator = gt;
  const jt = function(r) {
    const c = (0, l.DebtorsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteFine(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["DebtorsApi.deleteFine"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.handoutFines(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["DebtorsApi.handoutFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.notifyAboutFutureFines(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      returnAllFineHandoutEvents(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.returnAllFineHandoutEvents(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.returnSingleFineHandoutEvent(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.DebtorsApiFp = jt;
  const Ut = function(r, c, n) {
    const i = (0, l.DebtorsApiFp)(r);
    return {
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(s, e) {
        return i.deleteFine(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(s, e) {
        return i.handoutFines(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(s, e) {
        return i.notifyAboutFutureFines(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(s, e, t) {
        return i.returnAllFineHandoutEvents(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(s, e) {
        return i.returnSingleFineHandoutEvent(s, e).then((t) => t(n, c));
      }
    };
  };
  l.DebtorsApiFactory = Ut;
  class _t extends v.BaseAPI {
    /**
     *
     * @summary Delete a fine
     * @param {number} id The id of the fine which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    deleteFine(c, n) {
      return (0, l.DebtorsApiFp)(this.configuration).deleteFine(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    handoutFines(c, n) {
      return (0, l.DebtorsApiFp)(this.configuration).handoutFines(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Send an email to all given users about their possible future fine.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    notifyAboutFutureFines(c, n) {
      return (0, l.DebtorsApiFp)(this.configuration).notifyAboutFutureFines(c, n).then((i) => i(this.axios, this.basePath));
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
    returnAllFineHandoutEvents(c, n, i) {
      return (0, l.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} id The id of the fine handout event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnSingleFineHandoutEvent(c, n) {
      return (0, l.DebtorsApiFp)(this.configuration).returnSingleFineHandoutEvent(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.DebtorsApi = _t;
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
      assignEventShift: (c, n, i, s, e = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("assignEventShift", "eventId", c), (0, a.assertParamExists)("assignEventShift", "shiftId", n), (0, a.assertParamExists)("assignEventShift", "userId", i), (0, a.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", s);
        const t = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(c))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(i))), o = new URL(t, a.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "PUT" }, u), e), A = {}, O = {};
        yield (0, a.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, a.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), h.data = (0, a.serializeDataIfNeeded)(s, h, r), {
          url: (0, a.toPathString)(o),
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
      createEvent: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("createEvent", "createEventRequest", c);
        const i = "/events", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      createEventShift: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("createEventShift", "createShiftRequest", c);
        const i = "/eventshifts", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      deleteEvent: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteEvent", "id", c);
        const i = "/events/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      deleteEventShift: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteEventShift", "id", c);
        const i = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getAllEventShifts: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/eventshifts", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getAllEvents: (c, n, i, s, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/events", A = new URL(h, a.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        yield (0, a.setBearerAuthToObject)(f, r), c !== void 0 && (j.name = c), n !== void 0 && (j.createdById = n), i !== void 0 && (j.beforeDate = i), s !== void 0 && (j.afterDate = s), e !== void 0 && (j.type = e), t !== void 0 && (j.take = t), o !== void 0 && (j.skip = o), (0, a.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), V), u.headers), {
          url: (0, a.toPathString)(A),
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
      getEventShiftCount: (c, n, i, s, e = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getEventShiftCount", "id", c);
        const t = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(c))), o = new URL(t, a.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, u), e), A = {}, O = {};
        yield (0, a.setBearerAuthToObject)(A, r), n !== void 0 && (O.eventType = n), i !== void 0 && (O.afterDate = i), s !== void 0 && (O.beforeDate = s), (0, a.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), {
          url: (0, a.toPathString)(o),
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
      getSingleEvent: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleEvent", "id", c);
        const i = "/events/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      updateEvent: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateEvent", "id", c), (0, a.assertParamExists)("updateEvent", "updateEventRequest", n);
        const s = "/events/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      updateEventShift: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateEventShift", "id", c), (0, a.assertParamExists)("updateEventShift", "updateShiftRequest", n);
        const s = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      updateEventShiftAvailability: (c, n, i, s, e = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateEventShiftAvailability", "eventId", c), (0, a.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, a.assertParamExists)("updateEventShiftAvailability", "userId", i), (0, a.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", s);
        const t = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(c))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(i))), o = new URL(t, a.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, u), e), A = {}, O = {};
        yield (0, a.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, a.setSearchParams)(o, O);
        let m = u && u.headers ? u.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), m), e.headers), h.data = (0, a.serializeDataIfNeeded)(s, h, r), {
          url: (0, a.toPathString)(o),
          options: h
        };
      })
    };
  };
  l.EventsApiAxiosParamCreator = Vt;
  const yt = function(r) {
    const c = (0, l.EventsApiAxiosParamCreator)(r);
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
      assignEventShift(n, i, s, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield c.assignEventShift(n, i, s, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.assignEventShift"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, a.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createEvent(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["EventsApi.createEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createEventShift(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["EventsApi.createEventShift"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteEvent(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["EventsApi.deleteEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteEventShift(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["EventsApi.deleteEventShift"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllEventShifts(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllEventShifts(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.getAllEventShifts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      getAllEvents(n, i, s, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield c.getAllEvents(n, i, s, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, V = (m = (O = v.operationServerMap["EventsApi.getAllEvents"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, a.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, V || B);
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
      getEventShiftCount(n, i, s, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield c.getEventShiftCount(n, i, s, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.getEventShiftCount"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, a.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleEvent(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["EventsApi.getSingleEvent"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      updateEvent(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateEvent(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.updateEvent"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateEventShift(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateEventShift(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["EventsApi.updateEventShift"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateEventShiftAvailability(n, i, s, e, t) {
        var o, u, h;
        return d(this, void 0, void 0, function* () {
          const A = yield c.updateEventShiftAvailability(n, i, s, e, t), O = (o = r == null ? void 0 : r.serverIndex) !== null && o !== void 0 ? o : 0, m = (h = (u = v.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || u === void 0 ? void 0 : u[O]) === null || h === void 0 ? void 0 : h.url;
          return (f, j) => (0, a.createRequestFunction)(A, p.default, v.BASE_PATH, r)(f, m || j);
        });
      }
    };
  };
  l.EventsApiFp = yt;
  const Rt = function(r, c, n) {
    const i = (0, l.EventsApiFp)(r);
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
      assignEventShift(s, e, t, o, u) {
        return i.assignEventShift(s, e, t, o, u).then((h) => h(n, c));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(s, e) {
        return i.createEvent(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(s, e) {
        return i.createEventShift(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(s, e) {
        return i.deleteEvent(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(s, e) {
        return i.deleteEventShift(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(s, e, t) {
        return i.getAllEventShifts(s, e, t).then((o) => o(n, c));
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
      getAllEvents(s, e, t, o, u, h, A, O) {
        return i.getAllEvents(s, e, t, o, u, h, A, O).then((m) => m(n, c));
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
      getEventShiftCount(s, e, t, o, u) {
        return i.getEventShiftCount(s, e, t, o, u).then((h) => h(n, c));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(s, e) {
        return i.getSingleEvent(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(s, e, t) {
        return i.updateEvent(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(s, e, t) {
        return i.updateEventShift(s, e, t).then((o) => o(n, c));
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
      updateEventShiftAvailability(s, e, t, o, u) {
        return i.updateEventShiftAvailability(s, e, t, o, u).then((h) => h(n, c));
      }
    };
  };
  l.EventsApiFactory = Rt;
  class Tt extends v.BaseAPI {
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
    assignEventShift(c, n, i, s, e) {
      return (0, l.EventsApiFp)(this.configuration).assignEventShift(c, n, i, s, e).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event with its corresponding answers objects
     * @param {CreateEventRequest} createEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEvent(c, n) {
      return (0, l.EventsApiFp)(this.configuration).createEvent(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event shift
     * @param {CreateShiftRequest} createShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEventShift(c, n) {
      return (0, l.EventsApiFp)(this.configuration).createEventShift(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEvent(c, n) {
      return (0, l.EventsApiFp)(this.configuration).deleteEvent(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event shift with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEventShift(c, n) {
      return (0, l.EventsApiFp)(this.configuration).deleteEventShift(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllEventShifts(c, n, i) {
      return (0, l.EventsApiFp)(this.configuration).getAllEventShifts(c, n, i).then((s) => s(this.axios, this.basePath));
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
    getAllEvents(c, n, i, s, e, t, o, u) {
      return (0, l.EventsApiFp)(this.configuration).getAllEvents(c, n, i, s, e, t, o, u).then((h) => h(this.axios, this.basePath));
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
    getEventShiftCount(c, n, i, s, e) {
      return (0, l.EventsApiFp)(this.configuration).getEventShiftCount(c, n, i, s, e).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single event with its answers and shifts
     * @param {number} id The id of the event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getSingleEvent(c, n) {
      return (0, l.EventsApiFp)(this.configuration).getSingleEvent(c, n).then((i) => i(this.axios, this.basePath));
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
    updateEvent(c, n, i) {
      return (0, l.EventsApiFp)(this.configuration).updateEvent(c, n, i).then((s) => s(this.axios, this.basePath));
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
    updateEventShift(c, n, i) {
      return (0, l.EventsApiFp)(this.configuration).updateEventShift(c, n, i).then((s) => s(this.axios, this.basePath));
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
    updateEventShiftAvailability(c, n, i, s, e) {
      return (0, l.EventsApiFp)(this.configuration).updateEventShiftAvailability(c, n, i, s, e).then((t) => t(this.axios, this.basePath));
    }
  }
  l.EventsApi = Tt;
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
      createFile: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("createFile", "name", c);
        const s = "/files", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && A.append("name", c), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, a.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, a.toPathString)(e),
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
      deleteFile: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteFile", "id", c);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getFile: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getFile", "id", c);
        const i = "/files/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.FilesApiAxiosParamCreator = Et;
  const Bt = function(r) {
    const c = (0, l.FilesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.createFile(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["FilesApi.createFile"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteFile(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["FilesApi.deleteFile"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getFile(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["FilesApi.getFile"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.FilesApiFp = Bt;
  const Ft = function(r, c, n) {
    const i = (0, l.FilesApiFp)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(s, e, t) {
        return i.createFile(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(s, e) {
        return i.deleteFile(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(s, e) {
        return i.getFile(s, e).then((t) => t(n, c));
      }
    };
  };
  l.FilesApiFactory = Ft;
  class Ct extends v.BaseAPI {
    /**
     *
     * @summary Upload a file with the given name.
     * @param {string} name The name of the file
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(c, n, i) {
      return (0, l.FilesApiFp)(this.configuration).createFile(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(c, n) {
      return (0, l.FilesApiFp)(this.configuration).deleteFile(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(c, n) {
      return (0, l.FilesApiFp)(this.configuration).getFile(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.FilesApi = Ct;
  const It = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} [createInvoiceRequest] The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/invoices", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      deleteInvoice: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteInvoice", "id", c);
        const i = "/invoices/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getAllInvoices: (c, n, i, s, e, t, o, u, h = {}) => d(this, void 0, void 0, function* () {
        const A = "/invoices", O = new URL(A, a.DUMMY_BASE_URL);
        let m;
        r && (m = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "GET" }, m), h), j = {}, V = {};
        yield (0, a.setBearerAuthToObject)(j, r), c !== void 0 && (V.toId = c), n !== void 0 && (V.invoiceId = n), i !== void 0 && (V.state = i), s !== void 0 && (V.returnEntries = s), e !== void 0 && (V.fromDate = e), t !== void 0 && (V.tillDate = t), o !== void 0 && (V.take = o), u !== void 0 && (V.skip = u), (0, a.setSearchParams)(O, V);
        let F = m && m.headers ? m.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, j), F), h.headers), {
          url: (0, a.toPathString)(O),
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
      getSingleInvoice: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleInvoice", "id", c);
        const s = "/invoices/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), n !== void 0 && (h.returnEntries = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} [updateInvoiceRequest] The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateInvoice", "id", c);
        const s = "/invoices/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.InvoicesApiAxiosParamCreator = It;
  const Mt = function(r) {
    const c = (0, l.InvoicesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} [createInvoiceRequest] The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createInvoice(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["InvoicesApi.createInvoice"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteInvoice(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["InvoicesApi.deleteInvoice"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllInvoices(n, i, s, e, t, o, u, h, A) {
        var O, m, f;
        return d(this, void 0, void 0, function* () {
          const j = yield c.getAllInvoices(n, i, s, e, t, o, u, h, A), V = (O = r == null ? void 0 : r.serverIndex) !== null && O !== void 0 ? O : 0, F = (f = (m = v.operationServerMap["InvoicesApi.getAllInvoices"]) === null || m === void 0 ? void 0 : m[V]) === null || f === void 0 ? void 0 : f.url;
          return (B, I) => (0, a.createRequestFunction)(j, p.default, v.BASE_PATH, r)(B, F || I);
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
      getSingleInvoice(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getSingleInvoice(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} [updateInvoiceRequest] The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateInvoice(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["InvoicesApi.updateInvoice"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.InvoicesApiFp = Mt;
  const wt = function(r, c, n) {
    const i = (0, l.InvoicesApiFp)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} [createInvoiceRequest] The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(s, e) {
        return i.createInvoice(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(s, e) {
        return i.deleteInvoice(s, e).then((t) => t(n, c));
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
      getAllInvoices(s, e, t, o, u, h, A, O, m) {
        return i.getAllInvoices(s, e, t, o, u, h, A, O, m).then((f) => f(n, c));
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(s, e, t) {
        return i.getSingleInvoice(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} [updateInvoiceRequest] The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(s, e, t) {
        return i.updateInvoice(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.InvoicesApiFactory = wt;
  class Lt extends v.BaseAPI {
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {CreateInvoiceRequest} [createInvoiceRequest] The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(c, n) {
      return (0, l.InvoicesApiFp)(this.configuration).createInvoice(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(c, n) {
      return (0, l.InvoicesApiFp)(this.configuration).deleteInvoice(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllInvoices(c, n, i, s, e, t, o, u, h) {
      return (0, l.InvoicesApiFp)(this.configuration).getAllInvoices(c, n, i, s, e, t, o, u, h).then((A) => A(this.axios, this.basePath));
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
    getSingleInvoice(c, n, i) {
      return (0, l.InvoicesApiFp)(this.configuration).getSingleInvoice(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} [updateInvoiceRequest] The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(c, n, i) {
      return (0, l.InvoicesApiFp)(this.configuration).updateInvoice(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.InvoicesApi = Lt;
  const xt = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} [payoutRequestRequest] New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/payoutrequests", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllPayoutRequests: (c, n, i, s, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/payoutrequests", A = new URL(h, a.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        if (yield (0, a.setBearerAuthToObject)(f, r), c !== void 0)
          for (const [F, B] of Object.entries(c))
            j[F] = B;
        if (n !== void 0)
          for (const [F, B] of Object.entries(n))
            j[F] = B;
        i !== void 0 && (j.fromDate = i), s !== void 0 && (j.tillDate = s), e !== void 0 && (j.status = e), t !== void 0 && (j.take = t), o !== void 0 && (j.skip = o), (0, a.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), V), u.headers), {
          url: (0, a.toPathString)(A),
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
      getSinglePayoutRequest: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSinglePayoutRequest", "id", c);
        const i = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} [payoutRequestStatusRequest] New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("setPayoutRequestStatus", "id", c);
        const s = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.PayoutRequestsApiAxiosParamCreator = xt;
  const qt = function(r) {
    const c = (0, l.PayoutRequestsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} [payoutRequestRequest] New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createPayoutRequest(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllPayoutRequests(n, i, s, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield c.getAllPayoutRequests(n, i, s, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, V = (m = (O = v.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, a.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, V || B);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSinglePayoutRequest(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} [payoutRequestStatusRequest] New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.setPayoutRequestStatus(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.PayoutRequestsApiFp = qt;
  const Dt = function(r, c, n) {
    const i = (0, l.PayoutRequestsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} [payoutRequestRequest] New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(s, e) {
        return i.createPayoutRequest(s, e).then((t) => t(n, c));
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
      getAllPayoutRequests(s, e, t, o, u, h, A, O) {
        return i.getAllPayoutRequests(s, e, t, o, u, h, A, O).then((m) => m(n, c));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(s, e) {
        return i.getSinglePayoutRequest(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} [payoutRequestStatusRequest] New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(s, e, t) {
        return i.setPayoutRequestStatus(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.PayoutRequestsApiFactory = Dt;
  class Ht extends v.BaseAPI {
    /**
     *
     * @summary Create a new payout request
     * @param {PayoutRequestRequest} [payoutRequestRequest] New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(c, n) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllPayoutRequests(c, n, i, s, e, t, o, u) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(c, n, i, s, e, t, o, u).then((h) => h(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(c, n) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} [payoutRequestStatusRequest] New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(c, n, i) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.PayoutRequestsApi = Ht;
  const Nt = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} [createPointOfSaleRequest] The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/pointsofsale", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllPointOfSaleContainers: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getAllPointOfSaleContainers", "id", c);
        const e = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getAllPointOfSaleProducts: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getAllPointOfSaleProducts", "id", c);
        const e = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getAllPointsOfSale: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/pointsofsale", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getSinglePointOfSale: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSinglePointOfSale", "id", c);
        const i = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getTransactions: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getTransactions", "id", c);
        const e = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} [updatePointOfSaleRequest]    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updatePointOfSale", "id", c);
        const s = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.PointofsaleApiAxiosParamCreator = Nt;
  const Gt = function(r) {
    const c = (0, l.PointofsaleApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} [createPointOfSaleRequest] The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createPointOfSale(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllPointOfSaleContainers(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getAllPointOfSaleContainers(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getAllPointOfSaleProducts(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getAllPointOfSaleProducts(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getAllPointsOfSale(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllPointsOfSale(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSinglePointOfSale(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getTransactions(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getTransactions(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["PointofsaleApi.getTransactions"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
        });
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} [updatePointOfSaleRequest]    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updatePointOfSale(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.PointofsaleApiFp = Gt;
  const kt = function(r, c, n) {
    const i = (0, l.PointofsaleApiFp)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} [createPointOfSaleRequest] The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(s, e) {
        return i.createPointOfSale(s, e).then((t) => t(n, c));
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
      getAllPointOfSaleContainers(s, e, t, o) {
        return i.getAllPointOfSaleContainers(s, e, t, o).then((u) => u(n, c));
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
      getAllPointOfSaleProducts(s, e, t, o) {
        return i.getAllPointOfSaleProducts(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(s, e, t) {
        return i.getAllPointsOfSale(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(s, e) {
        return i.getSinglePointOfSale(s, e).then((t) => t(n, c));
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
      getTransactions(s, e, t, o) {
        return i.getTransactions(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} [updatePointOfSaleRequest]    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(s, e, t) {
        return i.updatePointOfSale(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.PointofsaleApiFactory = kt;
  class Qt extends v.BaseAPI {
    /**
     *
     * @summary Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} [createPointOfSaleRequest] The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(c, n) {
      return (0, l.PointofsaleApiFp)(this.configuration).createPointOfSale(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllPointOfSaleContainers(c, n, i, s) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getAllPointOfSaleProducts(c, n, i, s) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getAllPointsOfSale(c, n, i) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(c, n) {
      return (0, l.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(c, n).then((i) => i(this.axios, this.basePath));
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
    getTransactions(c, n, i, s) {
      return (0, l.PointofsaleApiFp)(this.configuration).getTransactions(c, n, i, s).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} [updatePointOfSaleRequest]    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(c, n, i) {
      return (0, l.PointofsaleApiFp)(this.configuration).updatePointOfSale(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.PointofsaleApi = Qt;
  const Yt = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} [productCategoryRequest] The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/productcategories", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllProductCategories: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/productcategories", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getSingleProductCategory: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleProductCategory", "id", c);
        const i = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} [productCategoryRequest] The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateProductCategory", "id", c);
        const s = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.ProductCategoriesApiAxiosParamCreator = Yt;
  const $t = function(r) {
    const c = (0, l.ProductCategoriesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} [productCategoryRequest] The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createProductCategory(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllProductCategories(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllProductCategories(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleProductCategory(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} [productCategoryRequest] The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateProductCategory(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.ProductCategoriesApiFp = $t;
  const zt = function(r, c, n) {
    const i = (0, l.ProductCategoriesApiFp)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} [productCategoryRequest] The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(s, e) {
        return i.createProductCategory(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(s, e, t) {
        return i.getAllProductCategories(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(s, e) {
        return i.getSingleProductCategory(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} [productCategoryRequest] The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(s, e, t) {
        return i.updateProductCategory(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.ProductCategoriesApiFactory = zt;
  class Kt extends v.BaseAPI {
    /**
     *
     * @summary Post a new productCategory.
     * @param {ProductCategoryRequest} [productCategoryRequest] The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(c, n) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).createProductCategory(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllProductCategories(c, n, i) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(c, n) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} [productCategoryRequest] The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(c, n, i) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).updateProductCategory(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.ProductCategoriesApi = Kt;
  const Wt = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} [createProductRequest] The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/products", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllProducts: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/products", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getSingleProduct: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleProduct", "id", c);
        const i = "/products/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} [updateProductRequest] The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateProduct", "id", c);
        const s = "/products/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      updateProductImage: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateProductImage", "id", c);
        const s = "/products/{id}/image".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, t), i), u = {}, h = {}, A = new (r && r.formDataCtor || FormData)();
        yield (0, a.setBearerAuthToObject)(u, r), n !== void 0 && A.append("file", n), u["Content-Type"] = "multipart/form-data", (0, a.setSearchParams)(e, h);
        let O = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), O), i.headers), o.data = A, {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.ProductsApiAxiosParamCreator = Wt;
  const Jt = function(r) {
    const c = (0, l.ProductsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} [createProductRequest] The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createProduct(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ProductsApi.createProduct"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllProducts(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllProducts(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.getAllProducts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleProduct(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["ProductsApi.getSingleProduct"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} [updateProductRequest] The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateProduct(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.updateProduct"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
      updateProductImage(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateProductImage(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["ProductsApi.updateProductImage"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.ProductsApiFp = Jt;
  const Xt = function(r, c, n) {
    const i = (0, l.ProductsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} [createProductRequest] The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(s, e) {
        return i.createProduct(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(s, e, t) {
        return i.getAllProducts(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(s, e) {
        return i.getSingleProduct(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} [updateProductRequest] The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(s, e, t) {
        return i.updateProduct(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(s, e, t) {
        return i.updateProductImage(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.ProductsApiFactory = Xt;
  class Zt extends v.BaseAPI {
    /**
     *
     * @summary Create a new product.
     * @param {CreateProductRequest} [createProductRequest] The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(c, n) {
      return (0, l.ProductsApiFp)(this.configuration).createProduct(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllProducts(c, n, i) {
      return (0, l.ProductsApiFp)(this.configuration).getAllProducts(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(c, n) {
      return (0, l.ProductsApiFp)(this.configuration).getSingleProduct(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} [updateProductRequest] The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(c, n, i) {
      return (0, l.ProductsApiFp)(this.configuration).updateProduct(c, n, i).then((s) => s(this.axios, this.basePath));
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
    updateProductImage(c, n, i) {
      return (0, l.ProductsApiFp)(this.configuration).updateProductImage(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.ProductsApi = Zt;
  const es = function(r) {
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (c = {}) => d(this, void 0, void 0, function* () {
        const n = "/rbac/roles", i = new URL(n, a.DUMMY_BASE_URL);
        let s;
        r && (s = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, s), c), t = {}, o = {};
        yield (0, a.setBearerAuthToObject)(t, r), (0, a.setSearchParams)(i, o);
        let u = s && s.headers ? s.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), c.headers), {
          url: (0, a.toPathString)(i),
          options: e
        };
      })
    };
  };
  l.RbacApiAxiosParamCreator = es;
  const ts = function(r) {
    const c = (0, l.RbacApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(n) {
        var i, s, e;
        return d(this, void 0, void 0, function* () {
          const t = yield c.getAllRoles(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (s = v.operationServerMap["RbacApi.getAllRoles"]) === null || s === void 0 ? void 0 : s[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, a.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  l.RbacApiFp = ts;
  const ss = function(r, c, n) {
    const i = (0, l.RbacApiFp)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(s) {
        return i.getAllRoles(s).then((e) => e(n, c));
      }
    };
  };
  l.RbacApiFactory = ss;
  class as extends v.BaseAPI {
    /**
     *
     * @summary Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(c) {
      return (0, l.RbacApiFp)(this.configuration).getAllRoles(c).then((n) => n(this.axios, this.basePath));
    }
  }
  l.RbacApi = as;
  const rs = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (c = {}) => d(this, void 0, void 0, function* () {
        const n = "/ping", i = new URL(n, a.DUMMY_BASE_URL);
        let s;
        r && (s = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "GET" }, s), c), t = {}, o = {};
        (0, a.setSearchParams)(i, o);
        let u = s && s.headers ? s.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), c.headers), {
          url: (0, a.toPathString)(i),
          options: e
        };
      })
    };
  };
  l.RootApiAxiosParamCreator = rs;
  const ns = function(r) {
    const c = (0, l.RootApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(n) {
        var i, s, e;
        return d(this, void 0, void 0, function* () {
          const t = yield c.ping(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (s = v.operationServerMap["RootApi.ping"]) === null || s === void 0 ? void 0 : s[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, a.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  l.RootApiFp = ns;
  const is = function(r, c, n) {
    const i = (0, l.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(s) {
        return i.ping(s).then((e) => e(n, c));
      }
    };
  };
  l.RootApiFactory = is;
  class os extends v.BaseAPI {
    /**
     *
     * @summary Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(c) {
      return (0, l.RootApiFp)(this.configuration).ping(c).then((n) => n(this.axios, this.basePath));
    }
  }
  l.RootApi = os;
  const ls = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} [stripeRequest] The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/stripe/deposit", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.StripeApiAxiosParamCreator = ls;
  const cs = function(r) {
    const c = (0, l.StripeApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} [stripeRequest] The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deposit(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["StripeApi.deposit"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.StripeApiFp = cs;
  const ds = function(r, c, n) {
    const i = (0, l.StripeApiFp)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} [stripeRequest] The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(s, e) {
        return i.deposit(s, e).then((t) => t(n, c));
      }
    };
  };
  l.StripeApiFactory = ds;
  class us extends v.BaseAPI {
    /**
     *
     * @summary Start the stripe deposit flow
     * @param {StripeRequest} [stripeRequest] The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(c, n) {
      return (0, l.StripeApiFp)(this.configuration).deposit(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.StripeApi = us;
  const hs = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (c = {}) => d(this, void 0, void 0, function* () {
        const n = "/test/helloworld", i = new URL(n, a.DUMMY_BASE_URL);
        let s;
        r && (s = r.baseOptions);
        const e = Object.assign(Object.assign({ method: "POST" }, s), c), t = {}, o = {};
        yield (0, a.setBearerAuthToObject)(t, r), (0, a.setSearchParams)(i, o);
        let u = s && s.headers ? s.headers : {};
        return e.headers = Object.assign(Object.assign(Object.assign({}, t), u), c.headers), {
          url: (0, a.toPathString)(i),
          options: e
        };
      })
    };
  };
  l.TestOperationsOfTheTestControllerApiAxiosParamCreator = hs;
  const ps = function(r) {
    const c = (0, l.TestOperationsOfTheTestControllerApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(n) {
        var i, s, e;
        return d(this, void 0, void 0, function* () {
          const t = yield c.helloworld(n), o = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (e = (s = v.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || s === void 0 ? void 0 : s[o]) === null || e === void 0 ? void 0 : e.url;
          return (h, A) => (0, a.createRequestFunction)(t, p.default, v.BASE_PATH, r)(h, u || A);
        });
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFp = ps;
  const vs = function(r, c, n) {
    const i = (0, l.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(s) {
        return i.helloworld(s).then((e) => e(n, c));
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFactory = vs;
  class As extends v.BaseAPI {
    /**
     *
     * @summary Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestOperationsOfTheTestControllerApi
     */
    helloworld(c) {
      return (0, l.TestOperationsOfTheTestControllerApiFp)(this.configuration).helloworld(c).then((n) => n(this.axios, this.basePath));
    }
  }
  l.TestOperationsOfTheTestControllerApi = As;
  const Os = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} [transactionRequest] The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/transactions", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      deleteTransaction: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteTransaction", "id", c);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getAllTransactions: (c, n, i, s, e, t, o, u, h, A, O = {}) => d(this, void 0, void 0, function* () {
        const m = "/transactions", f = new URL(m, a.DUMMY_BASE_URL);
        let j;
        r && (j = r.baseOptions);
        const V = Object.assign(Object.assign({ method: "GET" }, j), O), F = {}, B = {};
        yield (0, a.setBearerAuthToObject)(F, r), c !== void 0 && (B.fromId = c), n !== void 0 && (B.createdById = n), i !== void 0 && (B.toId = i), s !== void 0 && (B.pointOfSaleId = s), e !== void 0 && (B.productId = e), t !== void 0 && (B.productRevision = t), o !== void 0 && (B.fromDate = o), u !== void 0 && (B.tillDate = u), h !== void 0 && (B.take = h), A !== void 0 && (B.skip = A), (0, a.setSearchParams)(f, B);
        let I = j && j.headers ? j.headers : {};
        return V.headers = Object.assign(Object.assign(Object.assign({}, F), I), O.headers), {
          url: (0, a.toPathString)(f),
          options: V
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleTransaction", "id", c);
        const i = "/transactions/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} [transactionRequest] The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateTransaction", "id", c);
        const s = "/transactions/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} [transactionRequest] The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/transactions/validate", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.TransactionsApiAxiosParamCreator = Os;
  const Ps = function(r) {
    const c = (0, l.TransactionsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} [transactionRequest] The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createTransaction(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransactionsApi.createTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteTransaction(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransactionsApi.deleteTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllTransactions(n, i, s, e, t, o, u, h, A, O, m) {
        var f, j, V;
        return d(this, void 0, void 0, function* () {
          const F = yield c.getAllTransactions(n, i, s, e, t, o, u, h, A, O, m), B = (f = r == null ? void 0 : r.serverIndex) !== null && f !== void 0 ? f : 0, I = (V = (j = v.operationServerMap["TransactionsApi.getAllTransactions"]) === null || j === void 0 ? void 0 : j[B]) === null || V === void 0 ? void 0 : V.url;
          return (X, te) => (0, a.createRequestFunction)(F, p.default, v.BASE_PATH, r)(X, I || te);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleTransaction(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} [transactionRequest] The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateTransaction(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["TransactionsApi.updateTransaction"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} [transactionRequest] The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.validateTransaction(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransactionsApi.validateTransaction"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.TransactionsApiFp = Ps;
  const bs = function(r, c, n) {
    const i = (0, l.TransactionsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} [transactionRequest] The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(s, e) {
        return i.createTransaction(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(s, e) {
        return i.deleteTransaction(s, e).then((t) => t(n, c));
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
      getAllTransactions(s, e, t, o, u, h, A, O, m, f, j) {
        return i.getAllTransactions(s, e, t, o, u, h, A, O, m, f, j).then((V) => V(n, c));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(s, e) {
        return i.getSingleTransaction(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} [transactionRequest] The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(s, e, t) {
        return i.updateTransaction(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} [transactionRequest] The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(s, e) {
        return i.validateTransaction(s, e).then((t) => t(n, c));
      }
    };
  };
  l.TransactionsApiFactory = bs;
  class ms extends v.BaseAPI {
    /**
     *
     * @summary Creates a new transaction
     * @param {TransactionRequest} [transactionRequest] The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(c, n) {
      return (0, l.TransactionsApiFp)(this.configuration).createTransaction(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(c, n) {
      return (0, l.TransactionsApiFp)(this.configuration).deleteTransaction(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllTransactions(c, n, i, s, e, t, o, u, h, A, O) {
      return (0, l.TransactionsApiFp)(this.configuration).getAllTransactions(c, n, i, s, e, t, o, u, h, A, O).then((m) => m(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(c, n) {
      return (0, l.TransactionsApiFp)(this.configuration).getSingleTransaction(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} [transactionRequest] The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(c, n, i) {
      return (0, l.TransactionsApiFp)(this.configuration).updateTransaction(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} [transactionRequest] The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(c, n) {
      return (0, l.TransactionsApiFp)(this.configuration).validateTransaction(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.TransactionsApi = ms;
  const Ss = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} [transferRequest] The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/transfers", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllTransfers: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/transfers", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getSingleTransfer: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleTransfer", "id", c);
        const i = "/transfers/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.TransfersApiAxiosParamCreator = Ss;
  const fs = function(r) {
    const c = (0, l.TransfersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} [transferRequest] The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createTransfer(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransfersApi.createTransfer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllTransfers(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllTransfers(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["TransfersApi.getAllTransfers"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleTransfer(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["TransfersApi.getSingleTransfer"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.TransfersApiFp = fs;
  const gs = function(r, c, n) {
    const i = (0, l.TransfersApiFp)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} [transferRequest] The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(s, e) {
        return i.createTransfer(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(s, e, t) {
        return i.getAllTransfers(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(s, e) {
        return i.getSingleTransfer(s, e).then((t) => t(n, c));
      }
    };
  };
  l.TransfersApiFactory = gs;
  class js extends v.BaseAPI {
    /**
     *
     * @summary Post a new transfer.
     * @param {TransferRequest} [transferRequest] The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(c, n) {
      return (0, l.TransfersApiFp)(this.configuration).createTransfer(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllTransfers(c, n, i) {
      return (0, l.TransfersApiFp)(this.configuration).getAllTransfers(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(c, n) {
      return (0, l.TransfersApiFp)(this.configuration).getSingleTransfer(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.TransfersApi = js;
  const Us = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} [acceptTosRequest] \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/users/acceptTos", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      authenticateAs: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("authenticateAs", "id", c);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} [createUserRequest] The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/users", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      deleteUser: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteUser", "id", c);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      deleteUserKey: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteUserKey", "id", c);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      deleteUserNfc: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("deleteUserNfc", "id", c);
        const i = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "DELETE" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getAllUsers: (c, n, i, s, e, t, o, u = {}) => d(this, void 0, void 0, function* () {
        const h = "/users", A = new URL(h, a.DUMMY_BASE_URL);
        let O;
        r && (O = r.baseOptions);
        const m = Object.assign(Object.assign({ method: "GET" }, O), u), f = {}, j = {};
        yield (0, a.setBearerAuthToObject)(f, r), c !== void 0 && (j.take = c), n !== void 0 && (j.skip = n), i !== void 0 && (j.search = i), s !== void 0 && (j.active = s), e !== void 0 && (j.ofAge = e), t !== void 0 && (j.id = t), o !== void 0 && (j.type = o), (0, a.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return m.headers = Object.assign(Object.assign(Object.assign({}, f), V), u.headers), {
          url: (0, a.toPathString)(A),
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
      getAllUsersOfUserType: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getAllUsersOfUserType", "userType", c);
        const e = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getIndividualUser: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getIndividualUser", "id", c);
        const i = "/users/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getOrganMembers: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getOrganMembers", "id", c);
        const e = "/users/{id}/members".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getUserAuthenticatable: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUserAuthenticatable", "id", c);
        const i = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getUserRoles: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUserRoles", "id", c);
        const i = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getUsersContainers: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersContainers", "id", c);
        const e = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getUsersFinancialMutations: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersFinancialMutations", "id", c);
        const e = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getUsersPointsOfSale: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersPointsOfSale", "id", c);
        const e = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getUsersProcessingDeposits: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersProcessingDeposits", "id", c);
        const i = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getUsersProducts: (c, n, i, s = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersProducts", "id", c);
        const e = "/users/{id}/products".replace("{id}", encodeURIComponent(String(c))), t = new URL(e, a.DUMMY_BASE_URL);
        let o;
        r && (o = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, o), s), h = {}, A = {};
        yield (0, a.setBearerAuthToObject)(h, r), n !== void 0 && (A.take = n), i !== void 0 && (A.skip = i), (0, a.setSearchParams)(t, A);
        let O = o && o.headers ? o.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, h), O), s.headers), {
          url: (0, a.toPathString)(t),
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
      getUsersTransactions: (c, n, i, s, e, t, o, u, h, A, O = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersTransactions", "id", c);
        const m = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(c))), f = new URL(m, a.DUMMY_BASE_URL);
        let j;
        r && (j = r.baseOptions);
        const V = Object.assign(Object.assign({ method: "GET" }, j), O), F = {}, B = {};
        yield (0, a.setBearerAuthToObject)(F, r), n !== void 0 && (B.fromId = n), i !== void 0 && (B.createdById = i), s !== void 0 && (B.toId = s), e !== void 0 && (B.productId = e), t !== void 0 && (B.productRevision = t), o !== void 0 && (B.fromDate = o), u !== void 0 && (B.tillDate = u), h !== void 0 && (B.take = h), A !== void 0 && (B.skip = A), (0, a.setSearchParams)(f, B);
        let I = j && j.headers ? j.headers : {};
        return V.headers = Object.assign(Object.assign(Object.assign({}, F), I), O.headers), {
          url: (0, a.toPathString)(f),
          options: V
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
      getUsersTransactionsReport: (c, n, i, s, e, t, o = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersTransactionsReport", "id", c);
        const u = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(c))), h = new URL(u, a.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, a.setBearerAuthToObject)(m, r), n !== void 0 && (f.fromDate = n), i !== void 0 && (f.tillDate = i), s !== void 0 && (f.fromId = s), e !== void 0 && (f.toId = e), t !== void 0 && (f.exclusiveToId = t), (0, a.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, a.toPathString)(h),
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
      getUsersTransfers: (c, n, i, s, e, t, o = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getUsersTransfers", "id", c);
        const u = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(c))), h = new URL(u, a.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, a.setBearerAuthToObject)(m, r), n !== void 0 && (f.take = n), i !== void 0 && (f.skip = i), s !== void 0 && (f.fromId = s), e !== void 0 && (f.toId = e), t !== void 0 && (f.id = t), (0, a.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, a.toPathString)(h),
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
      updateUser: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateUser", "id", c), (0, a.assertParamExists)("updateUser", "updateUserRequest", n);
        const s = "/users/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      updateUserKey: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateUserKey", "id", c);
        const i = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} [updateLocalRequest]    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateUserLocalPassword", "id", c);
        const s = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} [updateNfcRequest]    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateUserNfc", "id", c);
        const s = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} [updatePinRequest]    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateUserPin", "id", c);
        const s = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
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
      waiveUserFines: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("waiveUserFines", "id", c);
        const i = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      })
    };
  };
  l.UsersApiAxiosParamCreator = Us;
  const _s = function(r) {
    const c = (0, l.UsersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} [acceptTosRequest] \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.acceptTos(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.acceptTos"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.authenticateAs(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.authenticateAs"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} [createUserRequest] The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createUser(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.createUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteUser(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteUserKey(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUserKey"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.deleteUserNfc(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.deleteUserNfc"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllUsers(n, i, s, e, t, o, u, h) {
        var A, O, m;
        return d(this, void 0, void 0, function* () {
          const f = yield c.getAllUsers(n, i, s, e, t, o, u, h), j = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, V = (m = (O = v.operationServerMap["UsersApi.getAllUsers"]) === null || O === void 0 ? void 0 : O[j]) === null || m === void 0 ? void 0 : m.url;
          return (F, B) => (0, a.createRequestFunction)(f, p.default, v.BASE_PATH, r)(F, V || B);
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
      getAllUsersOfUserType(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getAllUsersOfUserType(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getIndividualUser(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.getIndividualUser"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getOrganMembers(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getOrganMembers(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getOrganMembers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getUserAuthenticatable(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getUserRoles(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.getUserRoles"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getUsersContainers(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getUsersContainers(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersContainers"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersFinancialMutations(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getUsersFinancialMutations(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersPointsOfSale(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getUsersPointsOfSale(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getUsersProcessingDeposits(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getUsersProducts(n, i, s, e) {
        var t, o, u;
        return d(this, void 0, void 0, function* () {
          const h = yield c.getUsersProducts(n, i, s, e), A = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, O = (u = (o = v.operationServerMap["UsersApi.getUsersProducts"]) === null || o === void 0 ? void 0 : o[A]) === null || u === void 0 ? void 0 : u.url;
          return (m, f) => (0, a.createRequestFunction)(h, p.default, v.BASE_PATH, r)(m, O || f);
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
      getUsersTransactions(n, i, s, e, t, o, u, h, A, O, m) {
        var f, j, V;
        return d(this, void 0, void 0, function* () {
          const F = yield c.getUsersTransactions(n, i, s, e, t, o, u, h, A, O, m), B = (f = r == null ? void 0 : r.serverIndex) !== null && f !== void 0 ? f : 0, I = (V = (j = v.operationServerMap["UsersApi.getUsersTransactions"]) === null || j === void 0 ? void 0 : j[B]) === null || V === void 0 ? void 0 : V.url;
          return (X, te) => (0, a.createRequestFunction)(F, p.default, v.BASE_PATH, r)(X, I || te);
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
      getUsersTransactionsReport(n, i, s, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield c.getUsersTransactionsReport(n, i, s, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (V, F) => (0, a.createRequestFunction)(m, p.default, v.BASE_PATH, r)(V, j || F);
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
      getUsersTransfers(n, i, s, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield c.getUsersTransfers(n, i, s, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["UsersApi.getUsersTransfers"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (V, F) => (0, a.createRequestFunction)(m, p.default, v.BASE_PATH, r)(V, j || F);
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
      updateUser(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateUser(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUser"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.updateUserKey(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.updateUserKey"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} [updateLocalRequest]    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateUserLocalPassword(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} [updateNfcRequest]    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateUserNfc(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserNfc"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} [updatePinRequest]    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateUserPin(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["UsersApi.updateUserPin"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.waiveUserFines(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["UsersApi.waiveUserFines"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      }
    };
  };
  l.UsersApiFp = _s;
  const Vs = function(r, c, n) {
    const i = (0, l.UsersApiFp)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} [acceptTosRequest] \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(s, e) {
        return i.acceptTos(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(s, e) {
        return i.authenticateAs(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} [createUserRequest] The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(s, e) {
        return i.createUser(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(s, e) {
        return i.deleteUser(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(s, e) {
        return i.deleteUserKey(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(s, e) {
        return i.deleteUserNfc(s, e).then((t) => t(n, c));
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
      getAllUsers(s, e, t, o, u, h, A, O) {
        return i.getAllUsers(s, e, t, o, u, h, A, O).then((m) => m(n, c));
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
      getAllUsersOfUserType(s, e, t, o) {
        return i.getAllUsersOfUserType(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(s, e) {
        return i.getIndividualUser(s, e).then((t) => t(n, c));
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
      getOrganMembers(s, e, t, o) {
        return i.getOrganMembers(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(s, e) {
        return i.getUserAuthenticatable(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(s, e) {
        return i.getUserRoles(s, e).then((t) => t(n, c));
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
      getUsersContainers(s, e, t, o) {
        return i.getUsersContainers(s, e, t, o).then((u) => u(n, c));
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
      getUsersFinancialMutations(s, e, t, o) {
        return i.getUsersFinancialMutations(s, e, t, o).then((u) => u(n, c));
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
      getUsersPointsOfSale(s, e, t, o) {
        return i.getUsersPointsOfSale(s, e, t, o).then((u) => u(n, c));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(s, e) {
        return i.getUsersProcessingDeposits(s, e).then((t) => t(n, c));
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
      getUsersProducts(s, e, t, o) {
        return i.getUsersProducts(s, e, t, o).then((u) => u(n, c));
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
      getUsersTransactions(s, e, t, o, u, h, A, O, m, f, j) {
        return i.getUsersTransactions(s, e, t, o, u, h, A, O, m, f, j).then((V) => V(n, c));
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
      getUsersTransactionsReport(s, e, t, o, u, h, A) {
        return i.getUsersTransactionsReport(s, e, t, o, u, h, A).then((O) => O(n, c));
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
      getUsersTransfers(s, e, t, o, u, h, A) {
        return i.getUsersTransfers(s, e, t, o, u, h, A).then((O) => O(n, c));
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(s, e, t) {
        return i.updateUser(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(s, e) {
        return i.updateUserKey(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} [updateLocalRequest]    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(s, e, t) {
        return i.updateUserLocalPassword(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} [updateNfcRequest]    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(s, e, t) {
        return i.updateUserNfc(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} [updatePinRequest]    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(s, e, t) {
        return i.updateUserPin(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(s, e) {
        return i.waiveUserFines(s, e).then((t) => t(n, c));
      }
    };
  };
  l.UsersApiFactory = Vs;
  class ys extends v.BaseAPI {
    /**
     *
     * @summary Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} [acceptTosRequest] \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(c, n) {
      return (0, l.UsersApiFp)(this.configuration).acceptTos(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(c, n) {
      return (0, l.UsersApiFp)(this.configuration).authenticateAs(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new user
     * @param {CreateUserRequest} [createUserRequest] The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(c, n) {
      return (0, l.UsersApiFp)(this.configuration).createUser(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(c, n) {
      return (0, l.UsersApiFp)(this.configuration).deleteUser(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(c, n) {
      return (0, l.UsersApiFp)(this.configuration).deleteUserKey(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(c, n) {
      return (0, l.UsersApiFp)(this.configuration).deleteUserNfc(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllUsers(c, n, i, s, e, t, o, u) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsers(c, n, i, s, e, t, o, u).then((h) => h(this.axios, this.basePath));
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
    getAllUsersOfUserType(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsersOfUserType(c, n, i, s).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(c, n) {
      return (0, l.UsersApiFp)(this.configuration).getIndividualUser(c, n).then((i) => i(this.axios, this.basePath));
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
    getOrganMembers(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getOrganMembers(c, n, i, s).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(c, n) {
      return (0, l.UsersApiFp)(this.configuration).getUserAuthenticatable(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(c, n) {
      return (0, l.UsersApiFp)(this.configuration).getUserRoles(c, n).then((i) => i(this.axios, this.basePath));
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
    getUsersContainers(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersContainers(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getUsersFinancialMutations(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersFinancialMutations(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getUsersPointsOfSale(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersPointsOfSale(c, n, i, s).then((e) => e(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(c, n) {
      return (0, l.UsersApiFp)(this.configuration).getUsersProcessingDeposits(c, n).then((i) => i(this.axios, this.basePath));
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
    getUsersProducts(c, n, i, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersProducts(c, n, i, s).then((e) => e(this.axios, this.basePath));
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
    getUsersTransactions(c, n, i, s, e, t, o, u, h, A, O) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactions(c, n, i, s, e, t, o, u, h, A, O).then((m) => m(this.axios, this.basePath));
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
    getUsersTransactionsReport(c, n, i, s, e, t, o) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactionsReport(c, n, i, s, e, t, o).then((u) => u(this.axios, this.basePath));
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
    getUsersTransfers(c, n, i, s, e, t, o) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransfers(c, n, i, s, e, t, o).then((u) => u(this.axios, this.basePath));
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
    updateUser(c, n, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUser(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(c, n) {
      return (0, l.UsersApiFp)(this.configuration).updateUserKey(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} [updateLocalRequest]    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(c, n, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserLocalPassword(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} [updateNfcRequest]    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(c, n, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserNfc(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} [updatePinRequest]    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(c, n, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserPin(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Waive all given user\'s fines
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    waiveUserFines(c, n) {
      return (0, l.UsersApiFp)(this.configuration).waiveUserFines(c, n).then((i) => i(this.axios, this.basePath));
    }
  }
  l.UsersApi = ys, l.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const Rs = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} [vatGroupRequest] The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/vatgroups", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllVatGroups: (c, n, i, s, e, t, o = {}) => d(this, void 0, void 0, function* () {
        const u = "/vatgroups", h = new URL(u, a.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const O = Object.assign(Object.assign({ method: "GET" }, A), o), m = {}, f = {};
        yield (0, a.setBearerAuthToObject)(m, r), c !== void 0 && (f.vatGroupId = c), n !== void 0 && (f.name = n), i !== void 0 && (f.percentage = i), s !== void 0 && (f.deleted = s), e !== void 0 && (f.take = e), t !== void 0 && (f.skip = t), (0, a.setSearchParams)(h, f);
        let j = A && A.headers ? A.headers : {};
        return O.headers = Object.assign(Object.assign(Object.assign({}, m), j), o.headers), {
          url: (0, a.toPathString)(h),
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
      getSingleVatGroup: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getSingleVatGroup", "id", c);
        const i = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
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
      getVatDeclarationAmounts: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getVatDeclarationAmounts", "year", c), (0, a.assertParamExists)("getVatDeclarationAmounts", "period", n);
        const s = "/vatgroups/declaration", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.year = c), n !== void 0 && (h.period = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
          options: o
        };
      }),
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} [updateVatGroupRequest] The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateVatGroup", "id", c);
        const s = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.VatGroupsApiAxiosParamCreator = Rs;
  const Ts = function(r) {
    const c = (0, l.VatGroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} [vatGroupRequest] The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createVatGroup(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["VatGroupsApi.createVatGroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllVatGroups(n, i, s, e, t, o, u) {
        var h, A, O;
        return d(this, void 0, void 0, function* () {
          const m = yield c.getAllVatGroups(n, i, s, e, t, o, u), f = (h = r == null ? void 0 : r.serverIndex) !== null && h !== void 0 ? h : 0, j = (O = (A = v.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || A === void 0 ? void 0 : A[f]) === null || O === void 0 ? void 0 : O.url;
          return (V, F) => (0, a.createRequestFunction)(m, p.default, v.BASE_PATH, r)(V, j || F);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getSingleVatGroup(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getVatDeclarationAmounts(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getVatDeclarationAmounts(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} [updateVatGroupRequest] The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateVatGroup(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.VatGroupsApiFp = Ts;
  const Es = function(r, c, n) {
    const i = (0, l.VatGroupsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} [vatGroupRequest] The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(s, e) {
        return i.createVatGroup(s, e).then((t) => t(n, c));
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
      getAllVatGroups(s, e, t, o, u, h, A) {
        return i.getAllVatGroups(s, e, t, o, u, h, A).then((O) => O(n, c));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(s, e) {
        return i.getSingleVatGroup(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(s, e, t) {
        return i.getVatDeclarationAmounts(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} [updateVatGroupRequest] The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(s, e, t) {
        return i.updateVatGroup(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.VatGroupsApiFactory = Es;
  class Bs extends v.BaseAPI {
    /**
     *
     * @summary Create a new VAT group
     * @param {VatGroupRequest} [vatGroupRequest] The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(c, n) {
      return (0, l.VatGroupsApiFp)(this.configuration).createVatGroup(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllVatGroups(c, n, i, s, e, t, o) {
      return (0, l.VatGroupsApiFp)(this.configuration).getAllVatGroups(c, n, i, s, e, t, o).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(c, n) {
      return (0, l.VatGroupsApiFp)(this.configuration).getSingleVatGroup(c, n).then((i) => i(this.axios, this.basePath));
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
    getVatDeclarationAmounts(c, n, i) {
      return (0, l.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} [updateVatGroupRequest] The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(c, n, i) {
      return (0, l.VatGroupsApiFp)(this.configuration).updateVatGroup(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.VatGroupsApi = Bs;
  const Fs = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} [voucherGroupRequest] The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (c, n = {}) => d(this, void 0, void 0, function* () {
        const i = "/vouchergroups", s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "POST" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), o["Content-Type"] = "application/json", (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), t.data = (0, a.serializeDataIfNeeded)(c, t, r), {
          url: (0, a.toPathString)(s),
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
      getAllVouchergroups: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        const s = "/vouchergroups", e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), c !== void 0 && (h.take = c), n !== void 0 && (h.skip = n), (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), {
          url: (0, a.toPathString)(e),
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
      getVouchergroupId: (c, n = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("getVouchergroupId", "id", c);
        const i = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(c))), s = new URL(i, a.DUMMY_BASE_URL);
        let e;
        r && (e = r.baseOptions);
        const t = Object.assign(Object.assign({ method: "GET" }, e), n), o = {}, u = {};
        yield (0, a.setBearerAuthToObject)(o, r), (0, a.setSearchParams)(s, u);
        let h = e && e.headers ? e.headers : {};
        return t.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, a.toPathString)(s),
          options: t
        };
      }),
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} [voucherGroupRequest] The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup: (c, n, i = {}) => d(this, void 0, void 0, function* () {
        (0, a.assertParamExists)("updateVoucherGroup", "id", c);
        const s = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(c))), e = new URL(s, a.DUMMY_BASE_URL);
        let t;
        r && (t = r.baseOptions);
        const o = Object.assign(Object.assign({ method: "PATCH" }, t), i), u = {}, h = {};
        yield (0, a.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, a.setSearchParams)(e, h);
        let A = t && t.headers ? t.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, u), A), i.headers), o.data = (0, a.serializeDataIfNeeded)(n, o, r), {
          url: (0, a.toPathString)(e),
          options: o
        };
      })
    };
  };
  l.VouchergroupsApiAxiosParamCreator = Fs;
  const Cs = function(r) {
    const c = (0, l.VouchergroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} [voucherGroupRequest] The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(n, i) {
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.createVouchergroup(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
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
      getAllVouchergroups(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.getAllVouchergroups(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
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
        var s, e, t;
        return d(this, void 0, void 0, function* () {
          const o = yield c.getVouchergroupId(n, i), u = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, h = (t = (e = v.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || e === void 0 ? void 0 : e[u]) === null || t === void 0 ? void 0 : t.url;
          return (A, O) => (0, a.createRequestFunction)(o, p.default, v.BASE_PATH, r)(A, h || O);
        });
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} [voucherGroupRequest] The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(n, i, s) {
        var e, t, o;
        return d(this, void 0, void 0, function* () {
          const u = yield c.updateVoucherGroup(n, i, s), h = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, A = (o = (t = v.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || t === void 0 ? void 0 : t[h]) === null || o === void 0 ? void 0 : o.url;
          return (O, m) => (0, a.createRequestFunction)(u, p.default, v.BASE_PATH, r)(O, A || m);
        });
      }
    };
  };
  l.VouchergroupsApiFp = Cs;
  const Is = function(r, c, n) {
    const i = (0, l.VouchergroupsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} [voucherGroupRequest] The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(s, e) {
        return i.createVouchergroup(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(s, e, t) {
        return i.getAllVouchergroups(s, e, t).then((o) => o(n, c));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(s, e) {
        return i.getVouchergroupId(s, e).then((t) => t(n, c));
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} [voucherGroupRequest] The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(s, e, t) {
        return i.updateVoucherGroup(s, e, t).then((o) => o(n, c));
      }
    };
  };
  l.VouchergroupsApiFactory = Is;
  class Ms extends v.BaseAPI {
    /**
     *
     * @summary Creates a new voucher group
     * @param {VoucherGroupRequest} [voucherGroupRequest] The voucher group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    createVouchergroup(c, n) {
      return (0, l.VouchergroupsApiFp)(this.configuration).createVouchergroup(c, n).then((i) => i(this.axios, this.basePath));
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
    getAllVouchergroups(c, n, i) {
      return (0, l.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(c, n, i).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested voucher group
     * @param {number} id The id of the voucher group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getVouchergroupId(c, n) {
      return (0, l.VouchergroupsApiFp)(this.configuration).getVouchergroupId(c, n).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested voucher group
     * @param {number} id The id of the voucher group which should be updated
     * @param {VoucherGroupRequest} [voucherGroupRequest] The updated voucher group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    updateVoucherGroup(c, n, i) {
      return (0, l.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(c, n, i).then((s) => s(this.axios, this.basePath));
    }
  }
  l.VouchergroupsApi = Ms;
})(Xe);
var Oe = {};
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.Configuration = void 0;
class Hr {
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
Oe.Configuration = Hr;
(function(l) {
  var d = J && J.__createBinding || (Object.create ? function(a, v, P, b) {
    b === void 0 && (b = P);
    var g = Object.getOwnPropertyDescriptor(v, P);
    (!g || ("get" in g ? !v.__esModule : g.writable || g.configurable)) && (g = { enumerable: !0, get: function() {
      return v[P];
    } }), Object.defineProperty(a, b, g);
  } : function(a, v, P, b) {
    b === void 0 && (b = P), a[b] = v[P];
  }), p = J && J.__exportStar || function(a, v) {
    for (var P in a)
      P !== "default" && !Object.prototype.hasOwnProperty.call(v, P) && d(v, a, P);
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), p(Xe, l), p(Oe, l);
})(w);
const H = Ie.create();
H.interceptors.response.use((l) => (Gs(l), l));
class $r {
  constructor(d) {
    x(this, "_authenticateApi");
    x(this, "_balanceApi");
    x(this, "_usersApi");
    x(this, "_posApi");
    x(this, "_categoryApi");
    x(this, "_transactionApi");
    x(this, "_bannerApi");
    x(this, "_rootApi");
    x(this, "_voucherGroupApi");
    x(this, "_containerApi");
    x(this, "_filesApi");
    x(this, "_invoicesApi");
    x(this, "_payoutsApi");
    x(this, "_productsApi");
    x(this, "_transfersApi");
    x(this, "_vatGroupsApi");
    x(this, "_stripeApi");
    x(this, "_rbacApi");
    x(this, "_openBannerApi");
    const p = new w.Configuration({
      apiKey: () => `Bearer ${Re().token}`
    });
    this._authenticateApi = new w.AuthenticateApi(p, d, H), this._balanceApi = new w.BalanceApi(p, d, H), this._usersApi = new w.UsersApi(p, d, H), this._posApi = new w.PointofsaleApi(p, d, H), this._categoryApi = new w.ProductCategoriesApi(p, d, H), this._transactionApi = new w.TransactionsApi(p, d, H), this._bannerApi = new w.BannersApi(p, d, H), this._openBannerApi = new w.BannersApi(void 0, d, H), this._rootApi = new w.RootApi(), this._voucherGroupApi = new w.VouchergroupsApi(p, d, H), this._containerApi = new w.ContainersApi(p, d, H), this._filesApi = new w.FilesApi(p, d, H), this._invoicesApi = new w.InvoicesApi(p, d, H), this._payoutsApi = new w.PayoutRequestsApi(p, d, H), this._productsApi = new w.ProductsApi(p, d, H), this._transfersApi = new w.TransfersApi(p, d, H), this._vatGroupsApi = new w.VatGroupsApi(p, d, H), this._stripeApi = new w.StripeApi(p, d, H), this._rbacApi = new w.RbacApi(p, d, H);
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
  $r as ApiService,
  ks as clearTokenInStorage,
  Ds as fetchAllPages,
  Re as getTokenFromStorage,
  $s as isAuthenticated,
  Ys as isTokenExpired,
  Qs as parseToken,
  kr as populateStoresFromToken,
  Je as setTokenInStorage,
  Gs as updateTokenIfNecessary,
  zs as useAuthStore,
  Ke as useUserStore
};
