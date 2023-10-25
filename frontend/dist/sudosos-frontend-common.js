var Rs = Object.defineProperty;
var Ts = (i, c, u) => c in i ? Rs(i, c, { enumerable: !0, configurable: !0, writable: !0, value: u }) : i[c] = u;
var q = (i, c, u) => (Ts(i, typeof c != "symbol" ? c + "" : c, u), u);
import { createPinia as Fs, defineStore as Qe } from "pinia";
async function vs(i, c, u) {
  let e = i, p = [];
  for (; ; ) {
    const P = await u(c, e), { records: g } = P.data;
    if (p = p.concat(g), e += c, P.data._pagination.count <= e + c)
      break;
  }
  return p;
}
Fs();
const Ye = Qe("user", {
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
    getUserById: (i) => (c) => i.users.find((u) => u.id === c),
    getActiveUsers() {
      return this.users.filter((i) => i.active);
    },
    getDeletedUsers() {
      return this.users.filter((i) => i.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(i) {
      this.users = await vs(0, 500, (c, u) => i.user.getAllUsers(c, u));
    },
    async fetchCurrentUserBalance(i, c) {
      this.current.balance = (await c.balance.getBalanceId(i)).data;
    },
    async fetchUsersFinancialMutations(i, c, u, e) {
      this.current.financialMutations = (await c.user.getUsersFinancialMutations(i, u, e)).data;
    },
    setCurrentUser(i) {
      this.current.user = i;
    },
    addUser(i) {
      this.users.push(i);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(i) {
      const c = this.users.findIndex((u) => u.id === i);
      c !== -1 && this.users.splice(c, 1);
    }
  }
});
function Se(i) {
  this.message = i;
}
Se.prototype = new Error(), Se.prototype.name = "InvalidCharacterError";
var qe = typeof window < "u" && window.atob && window.atob.bind(window) || function(i) {
  var c = String(i).replace(/=+$/, "");
  if (c.length % 4 == 1)
    throw new Se("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var u, e, p = 0, P = 0, g = ""; e = c.charAt(P++); ~e && (u = p % 4 ? 64 * u + e : e, p++ % 4) ? g += String.fromCharCode(255 & u >> (-2 * p & 6)) : 0)
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e);
  return g;
};
function Es(i) {
  var c = i.replace(/-/g, "+").replace(/_/g, "/");
  switch (c.length % 4) {
    case 0:
      break;
    case 2:
      c += "==";
      break;
    case 3:
      c += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(u) {
      return decodeURIComponent(qe(u).replace(/(.)/g, function(e, p) {
        var P = p.charCodeAt(0).toString(16).toUpperCase();
        return P.length < 2 && (P = "0" + P), "%" + P;
      }));
    }(c);
  } catch {
    return qe(c);
  }
}
function oe(i) {
  this.message = i;
}
function $e(i, c) {
  if (typeof i != "string")
    throw new oe("Invalid token specified");
  var u = (c = c || {}).header === !0 ? 0 : 1;
  try {
    return JSON.parse(Es(i.split(".")[u]));
  } catch (e) {
    throw new oe("Invalid token specified: " + e.message);
  }
}
oe.prototype = new Error(), oe.prototype.name = "InvalidTokenError";
function Bs(i) {
  if (i.headers.has("Set-Authorization")) {
    const c = i.headers.get("Set-Authorization");
    c && We(c);
  }
}
function _s() {
  localStorage.clear();
}
function Cs(i) {
  const c = String($e(i).exp);
  return { token: i, expires: c };
}
function We(i) {
  localStorage.setItem("jwt_token", JSON.stringify(Cs(i)));
}
function Te() {
  const i = localStorage.getItem("jwt_token");
  let c = {};
  return i !== null && (c = JSON.parse(i)), {
    ...c
  };
}
function ws(i) {
  const c = i * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > c;
}
function Ls() {
  const i = Te();
  return !i.token || !i.expires ? !1 : !ws(Number(i.expires));
}
function vr(i) {
  if (Ls()) {
    const u = qs();
    u.extractStateFromToken();
    const e = u.getUser;
    if (e) {
      const p = Ye();
      p.setCurrentUser(e), p.fetchCurrentUserBalance(e.id, i);
    }
  }
}
const qs = Qe({
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
    handleResponse(i, c) {
      const { user: u, token: e, roles: p, organs: P, acceptedToS: g } = i;
      !u || !e || !p || !P || !g || (this.user = u, this.token = e, We(this.token), this.roles = p, this.organs = P, this.acceptedToS = g, this.acceptedToS === "ACCEPTED" && c.user.getIndividualUser(this.user.id).then((m) => {
        Ye().setCurrentUser(m.data);
      }));
    },
    async gewisPinlogin(i, c, u) {
      const e = {
        gewisId: parseInt(i, 10),
        pin: c
      };
      await u.authenticate.gewisPinAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async ldapLogin(i, c, u) {
      const e = {
        accountName: i,
        password: c
      };
      await u.authenticate.ldapAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async gewisWebLogin(i, c, u) {
      const e = {
        nonce: i,
        token: c
      };
      await u.authenticate.gewisWebAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async externalPinLogin(i, c, u) {
      const e = {
        pin: c,
        userId: i
      };
      await u.authenticate.pinAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async eanLogin(i, c) {
      const u = {
        eanCode: i
      };
      await c.authenticate.eanAuthentication(u).then((e) => {
        this.handleResponse(e.data, c);
      });
    },
    async apiKeyLogin(i, c, u) {
      const e = {
        key: i,
        userId: c
      };
      await u.authenticate.keyAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async gewisLdapLogin(i, c, u) {
      const e = {
        accountName: i,
        password: c
      };
      await u.authenticate.gewisLDAPAuthentication(e).then((p) => {
        this.handleResponse(p.data, u);
      });
    },
    async updateUserPin(i, c) {
      if (!this.user)
        return;
      const u = {
        pin: i
      };
      await c.user.updateUserPin(this.user.id, u);
    },
    async updateUserLocalPassword(i, c) {
      if (!this.user)
        return;
      const u = {
        password: i
      };
      await c.user.updateUserLocalPassword(this.user.id, u);
    },
    async updateUserNfc(i, c) {
      if (!this.user)
        return;
      const u = {
        nfcCode: i
      };
      await c.user.updateUserNfc(this.user.id, u);
    },
    async updateUserKey(i) {
      if (this.user)
        return (await i.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(i, c) {
      if (!this.user)
        return;
      const u = {
        extensiveDataProcessing: i
      };
      await c.user.acceptTos(u);
      const e = await c.authenticate.refreshToken();
      this.handleResponse(e.data, c);
    },
    extractStateFromToken() {
      const i = Te();
      if (!i.token)
        return;
      const c = $e(i.token);
      this.user = c.user, this.roles = c.roles, this.token = i.token, this.organs = c.organs, this.acceptedToS = c.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, _s();
    }
  }
});
var Y = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ms(i) {
  if (i.__esModule)
    return i;
  var c = i.default;
  if (typeof c == "function") {
    var u = function e() {
      return this instanceof e ? Reflect.construct(c, arguments, this.constructor) : c.apply(this, arguments);
    };
    u.prototype = c.prototype;
  } else
    u = {};
  return Object.defineProperty(u, "__esModule", { value: !0 }), Object.keys(i).forEach(function(e) {
    var p = Object.getOwnPropertyDescriptor(i, e);
    Object.defineProperty(u, e, p.get ? p : {
      enumerable: !0,
      get: function() {
        return i[e];
      }
    });
  }), u;
}
var w = {}, Je = {};
function Xe(i, c) {
  return function() {
    return i.apply(c, arguments);
  };
}
const { toString: Hs } = Object.prototype, { getPrototypeOf: Fe } = Object, le = ((i) => (c) => {
  const u = Hs.call(c);
  return i[u] || (i[u] = u.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), N = (i) => (i = i.toLowerCase(), (c) => le(c) === i), de = (i) => (c) => typeof c === i, { isArray: J } = Array, ee = de("undefined");
function Is(i) {
  return i !== null && !ee(i) && i.constructor !== null && !ee(i.constructor) && k(i.constructor.isBuffer) && i.constructor.isBuffer(i);
}
const Ze = N("ArrayBuffer");
function Ds(i) {
  let c;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? c = ArrayBuffer.isView(i) : c = i && i.buffer && Ze(i.buffer), c;
}
const ks = de("string"), k = de("function"), et = de("number"), ue = (i) => i !== null && typeof i == "object", zs = (i) => i === !0 || i === !1, ae = (i) => {
  if (le(i) !== "object")
    return !1;
  const c = Fe(i);
  return (c === null || c === Object.prototype || Object.getPrototypeOf(c) === null) && !(Symbol.toStringTag in i) && !(Symbol.iterator in i);
}, xs = N("Date"), Ns = N("File"), Ks = N("Blob"), Gs = N("FileList"), Qs = (i) => ue(i) && k(i.pipe), Ys = (i) => {
  let c;
  return i && (typeof FormData == "function" && i instanceof FormData || k(i.append) && ((c = le(i)) === "formdata" || // detect form-data instance
  c === "object" && k(i.toString) && i.toString() === "[object FormData]"));
}, $s = N("URLSearchParams"), Ws = (i) => i.trim ? i.trim() : i.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function te(i, c, { allOwnKeys: u = !1 } = {}) {
  if (i === null || typeof i > "u")
    return;
  let e, p;
  if (typeof i != "object" && (i = [i]), J(i))
    for (e = 0, p = i.length; e < p; e++)
      c.call(null, i[e], e, i);
  else {
    const P = u ? Object.getOwnPropertyNames(i) : Object.keys(i), g = P.length;
    let m;
    for (e = 0; e < g; e++)
      m = P[e], c.call(null, i[m], m, i);
  }
}
function tt(i, c) {
  c = c.toLowerCase();
  const u = Object.keys(i);
  let e = u.length, p;
  for (; e-- > 0; )
    if (p = u[e], c === p.toLowerCase())
      return p;
  return null;
}
const st = (() => typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global)(), at = (i) => !ee(i) && i !== st;
function Ue() {
  const { caseless: i } = at(this) && this || {}, c = {}, u = (e, p) => {
    const P = i && tt(c, p) || p;
    ae(c[P]) && ae(e) ? c[P] = Ue(c[P], e) : ae(e) ? c[P] = Ue({}, e) : J(e) ? c[P] = e.slice() : c[P] = e;
  };
  for (let e = 0, p = arguments.length; e < p; e++)
    arguments[e] && te(arguments[e], u);
  return c;
}
const Js = (i, c, u, { allOwnKeys: e } = {}) => (te(c, (p, P) => {
  u && k(p) ? i[P] = Xe(p, u) : i[P] = p;
}, { allOwnKeys: e }), i), Xs = (i) => (i.charCodeAt(0) === 65279 && (i = i.slice(1)), i), Zs = (i, c, u, e) => {
  i.prototype = Object.create(c.prototype, e), i.prototype.constructor = i, Object.defineProperty(i, "super", {
    value: c.prototype
  }), u && Object.assign(i.prototype, u);
}, ea = (i, c, u, e) => {
  let p, P, g;
  const m = {};
  if (c = c || {}, i == null)
    return c;
  do {
    for (p = Object.getOwnPropertyNames(i), P = p.length; P-- > 0; )
      g = p[P], (!e || e(g, i, c)) && !m[g] && (c[g] = i[g], m[g] = !0);
    i = u !== !1 && Fe(i);
  } while (i && (!u || u(i, c)) && i !== Object.prototype);
  return c;
}, ta = (i, c, u) => {
  i = String(i), (u === void 0 || u > i.length) && (u = i.length), u -= c.length;
  const e = i.indexOf(c, u);
  return e !== -1 && e === u;
}, sa = (i) => {
  if (!i)
    return null;
  if (J(i))
    return i;
  let c = i.length;
  if (!et(c))
    return null;
  const u = new Array(c);
  for (; c-- > 0; )
    u[c] = i[c];
  return u;
}, aa = ((i) => (c) => i && c instanceof i)(typeof Uint8Array < "u" && Fe(Uint8Array)), ra = (i, c) => {
  const e = (i && i[Symbol.iterator]).call(i);
  let p;
  for (; (p = e.next()) && !p.done; ) {
    const P = p.value;
    c.call(i, P[0], P[1]);
  }
}, na = (i, c) => {
  let u;
  const e = [];
  for (; (u = i.exec(c)) !== null; )
    e.push(u);
  return e;
}, ia = N("HTMLFormElement"), oa = (i) => i.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(u, e, p) {
    return e.toUpperCase() + p;
  }
), Me = (({ hasOwnProperty: i }) => (c, u) => i.call(c, u))(Object.prototype), ca = N("RegExp"), rt = (i, c) => {
  const u = Object.getOwnPropertyDescriptors(i), e = {};
  te(u, (p, P) => {
    let g;
    (g = c(p, P, i)) !== !1 && (e[P] = g || p);
  }), Object.defineProperties(i, e);
}, la = (i) => {
  rt(i, (c, u) => {
    if (k(i) && ["arguments", "caller", "callee"].indexOf(u) !== -1)
      return !1;
    const e = i[u];
    if (k(e)) {
      if (c.enumerable = !1, "writable" in c) {
        c.writable = !1;
        return;
      }
      c.set || (c.set = () => {
        throw Error("Can not rewrite read-only method '" + u + "'");
      });
    }
  });
}, da = (i, c) => {
  const u = {}, e = (p) => {
    p.forEach((P) => {
      u[P] = !0;
    });
  };
  return J(i) ? e(i) : e(String(i).split(c)), u;
}, ua = () => {
}, ha = (i, c) => (i = +i, Number.isFinite(i) ? i : c), ge = "abcdefghijklmnopqrstuvwxyz", He = "0123456789", nt = {
  DIGIT: He,
  ALPHA: ge,
  ALPHA_DIGIT: ge + ge.toUpperCase() + He
}, pa = (i = 16, c = nt.ALPHA_DIGIT) => {
  let u = "";
  const { length: e } = c;
  for (; i--; )
    u += c[Math.random() * e | 0];
  return u;
};
function Aa(i) {
  return !!(i && k(i.append) && i[Symbol.toStringTag] === "FormData" && i[Symbol.iterator]);
}
const Oa = (i) => {
  const c = new Array(10), u = (e, p) => {
    if (ue(e)) {
      if (c.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        c[p] = e;
        const P = J(e) ? [] : {};
        return te(e, (g, m) => {
          const R = u(g, p + 1);
          !ee(R) && (P[m] = R);
        }), c[p] = void 0, P;
      }
    }
    return e;
  };
  return u(i, 0);
}, Pa = N("AsyncFunction"), ga = (i) => i && (ue(i) || k(i)) && k(i.then) && k(i.catch), f = {
  isArray: J,
  isArrayBuffer: Ze,
  isBuffer: Is,
  isFormData: Ys,
  isArrayBufferView: Ds,
  isString: ks,
  isNumber: et,
  isBoolean: zs,
  isObject: ue,
  isPlainObject: ae,
  isUndefined: ee,
  isDate: xs,
  isFile: Ns,
  isBlob: Ks,
  isRegExp: ca,
  isFunction: k,
  isStream: Qs,
  isURLSearchParams: $s,
  isTypedArray: aa,
  isFileList: Gs,
  forEach: te,
  merge: Ue,
  extend: Js,
  trim: Ws,
  stripBOM: Xs,
  inherits: Zs,
  toFlatObject: ea,
  kindOf: le,
  kindOfTest: N,
  endsWith: ta,
  toArray: sa,
  forEachEntry: ra,
  matchAll: na,
  isHTMLForm: ia,
  hasOwnProperty: Me,
  hasOwnProp: Me,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: rt,
  freezeMethods: la,
  toObjectSet: da,
  toCamelCase: oa,
  noop: ua,
  toFiniteNumber: ha,
  findKey: tt,
  global: st,
  isContextDefined: at,
  ALPHABET: nt,
  generateString: pa,
  isSpecCompliantForm: Aa,
  toJSONObject: Oa,
  isAsyncFn: Pa,
  isThenable: ga
};
function E(i, c, u, e, p) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = i, this.name = "AxiosError", c && (this.code = c), u && (this.config = u), e && (this.request = e), p && (this.response = p);
}
f.inherits(E, Error, {
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
      config: f.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const it = E.prototype, ot = {};
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
].forEach((i) => {
  ot[i] = { value: i };
});
Object.defineProperties(E, ot);
Object.defineProperty(it, "isAxiosError", { value: !0 });
E.from = (i, c, u, e, p, P) => {
  const g = Object.create(it);
  return f.toFlatObject(i, g, function(R) {
    return R !== Error.prototype;
  }, (m) => m !== "isAxiosError"), E.call(g, i.message, c, u, e, p), g.cause = i, g.name = i.name, P && Object.assign(g, P), g;
};
const fa = null;
function ye(i) {
  return f.isPlainObject(i) || f.isArray(i);
}
function ct(i) {
  return f.endsWith(i, "[]") ? i.slice(0, -2) : i;
}
function Ie(i, c, u) {
  return i ? i.concat(c).map(function(p, P) {
    return p = ct(p), !u && P ? "[" + p + "]" : p;
  }).join(u ? "." : "") : c;
}
function ba(i) {
  return f.isArray(i) && !i.some(ye);
}
const ma = f.toFlatObject(f, {}, null, function(c) {
  return /^is[A-Z]/.test(c);
});
function he(i, c, u) {
  if (!f.isObject(i))
    throw new TypeError("target must be an object");
  c = c || new FormData(), u = f.toFlatObject(u, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(v, z) {
    return !f.isUndefined(z[v]);
  });
  const e = u.metaTokens, p = u.visitor || U, P = u.dots, g = u.indexes, R = (u.Blob || typeof Blob < "u" && Blob) && f.isSpecCompliantForm(c);
  if (!f.isFunction(p))
    throw new TypeError("visitor must be a function");
  function S(y) {
    if (y === null)
      return "";
    if (f.isDate(y))
      return y.toISOString();
    if (!R && f.isBlob(y))
      throw new E("Blob is not supported. Use a Buffer instead.");
    return f.isArrayBuffer(y) || f.isTypedArray(y) ? R && typeof Blob == "function" ? new Blob([y]) : Buffer.from(y) : y;
  }
  function U(y, v, z) {
    let D = y;
    if (y && !z && typeof y == "object") {
      if (f.endsWith(v, "{}"))
        v = e ? v : v.slice(0, -2), y = JSON.stringify(y);
      else if (f.isArray(y) && ba(y) || (f.isFileList(y) || f.endsWith(v, "[]")) && (D = f.toArray(y)))
        return v = ct(v), D.forEach(function($, Oe) {
          !(f.isUndefined($) || $ === null) && c.append(
            // eslint-disable-next-line no-nested-ternary
            g === !0 ? Ie([v], Oe, P) : g === null ? v : v + "[]",
            S($)
          );
        }), !1;
    }
    return ye(y) ? !0 : (c.append(Ie(z, v, P), S(y)), !1);
  }
  const T = [], L = Object.assign(ma, {
    defaultVisitor: U,
    convertValue: S,
    isVisitable: ye
  });
  function B(y, v) {
    if (!f.isUndefined(y)) {
      if (T.indexOf(y) !== -1)
        throw Error("Circular reference detected in " + v.join("."));
      T.push(y), f.forEach(y, function(D, G) {
        (!(f.isUndefined(D) || D === null) && p.call(
          c,
          D,
          f.isString(G) ? G.trim() : G,
          v,
          L
        )) === !0 && B(D, v ? v.concat(G) : [G]);
      }), T.pop();
    }
  }
  if (!f.isObject(i))
    throw new TypeError("data must be an object");
  return B(i), c;
}
function De(i) {
  const c = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(i).replace(/[!'()~]|%20|%00/g, function(e) {
    return c[e];
  });
}
function ve(i, c) {
  this._pairs = [], i && he(i, this, c);
}
const lt = ve.prototype;
lt.append = function(c, u) {
  this._pairs.push([c, u]);
};
lt.toString = function(c) {
  const u = c ? function(e) {
    return c.call(this, e, De);
  } : De;
  return this._pairs.map(function(p) {
    return u(p[0]) + "=" + u(p[1]);
  }, "").join("&");
};
function Sa(i) {
  return encodeURIComponent(i).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function dt(i, c, u) {
  if (!c)
    return i;
  const e = u && u.encode || Sa, p = u && u.serialize;
  let P;
  if (p ? P = p(c, u) : P = f.isURLSearchParams(c) ? c.toString() : new ve(c, u).toString(e), P) {
    const g = i.indexOf("#");
    g !== -1 && (i = i.slice(0, g)), i += (i.indexOf("?") === -1 ? "?" : "&") + P;
  }
  return i;
}
class Ua {
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
  use(c, u, e) {
    return this.handlers.push({
      fulfilled: c,
      rejected: u,
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
  eject(c) {
    this.handlers[c] && (this.handlers[c] = null);
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
  forEach(c) {
    f.forEach(this.handlers, function(e) {
      e !== null && c(e);
    });
  }
}
const ke = Ua, ut = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, ya = typeof URLSearchParams < "u" ? URLSearchParams : ve, ja = typeof FormData < "u" ? FormData : null, Va = typeof Blob < "u" ? Blob : null, Ra = (() => {
  let i;
  return typeof navigator < "u" && ((i = navigator.product) === "ReactNative" || i === "NativeScript" || i === "NS") ? !1 : typeof window < "u" && typeof document < "u";
})(), Ta = (() => typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function")(), x = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ya,
    FormData: ja,
    Blob: Va
  },
  isStandardBrowserEnv: Ra,
  isStandardBrowserWebWorkerEnv: Ta,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function Fa(i, c) {
  return he(i, new x.classes.URLSearchParams(), Object.assign({
    visitor: function(u, e, p, P) {
      return x.isNode && f.isBuffer(u) ? (this.append(e, u.toString("base64")), !1) : P.defaultVisitor.apply(this, arguments);
    }
  }, c));
}
function va(i) {
  return f.matchAll(/\w+|\[(\w*)]/g, i).map((c) => c[0] === "[]" ? "" : c[1] || c[0]);
}
function Ea(i) {
  const c = {}, u = Object.keys(i);
  let e;
  const p = u.length;
  let P;
  for (e = 0; e < p; e++)
    P = u[e], c[P] = i[P];
  return c;
}
function ht(i) {
  function c(u, e, p, P) {
    let g = u[P++];
    const m = Number.isFinite(+g), R = P >= u.length;
    return g = !g && f.isArray(p) ? p.length : g, R ? (f.hasOwnProp(p, g) ? p[g] = [p[g], e] : p[g] = e, !m) : ((!p[g] || !f.isObject(p[g])) && (p[g] = []), c(u, e, p[g], P) && f.isArray(p[g]) && (p[g] = Ea(p[g])), !m);
  }
  if (f.isFormData(i) && f.isFunction(i.entries)) {
    const u = {};
    return f.forEachEntry(i, (e, p) => {
      c(va(e), p, u, 0);
    }), u;
  }
  return null;
}
function Ba(i, c, u) {
  if (f.isString(i))
    try {
      return (c || JSON.parse)(i), f.trim(i);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (u || JSON.stringify)(i);
}
const Ee = {
  transitional: ut,
  adapter: x.isNode ? "http" : "xhr",
  transformRequest: [function(c, u) {
    const e = u.getContentType() || "", p = e.indexOf("application/json") > -1, P = f.isObject(c);
    if (P && f.isHTMLForm(c) && (c = new FormData(c)), f.isFormData(c))
      return p && p ? JSON.stringify(ht(c)) : c;
    if (f.isArrayBuffer(c) || f.isBuffer(c) || f.isStream(c) || f.isFile(c) || f.isBlob(c))
      return c;
    if (f.isArrayBufferView(c))
      return c.buffer;
    if (f.isURLSearchParams(c))
      return u.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), c.toString();
    let m;
    if (P) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return Fa(c, this.formSerializer).toString();
      if ((m = f.isFileList(c)) || e.indexOf("multipart/form-data") > -1) {
        const R = this.env && this.env.FormData;
        return he(
          m ? { "files[]": c } : c,
          R && new R(),
          this.formSerializer
        );
      }
    }
    return P || p ? (u.setContentType("application/json", !1), Ba(c)) : c;
  }],
  transformResponse: [function(c) {
    const u = this.transitional || Ee.transitional, e = u && u.forcedJSONParsing, p = this.responseType === "json";
    if (c && f.isString(c) && (e && !this.responseType || p)) {
      const g = !(u && u.silentJSONParsing) && p;
      try {
        return JSON.parse(c);
      } catch (m) {
        if (g)
          throw m.name === "SyntaxError" ? E.from(m, E.ERR_BAD_RESPONSE, this, null, this.response) : m;
      }
    }
    return c;
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
    FormData: x.classes.FormData,
    Blob: x.classes.Blob
  },
  validateStatus: function(c) {
    return c >= 200 && c < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
f.forEach(["delete", "get", "head", "post", "put", "patch"], (i) => {
  Ee.headers[i] = {};
});
const Be = Ee, _a = f.toObjectSet([
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
]), Ca = (i) => {
  const c = {};
  let u, e, p;
  return i && i.split(`
`).forEach(function(g) {
    p = g.indexOf(":"), u = g.substring(0, p).trim().toLowerCase(), e = g.substring(p + 1).trim(), !(!u || c[u] && _a[u]) && (u === "set-cookie" ? c[u] ? c[u].push(e) : c[u] = [e] : c[u] = c[u] ? c[u] + ", " + e : e);
  }), c;
}, ze = Symbol("internals");
function Z(i) {
  return i && String(i).trim().toLowerCase();
}
function re(i) {
  return i === !1 || i == null ? i : f.isArray(i) ? i.map(re) : String(i);
}
function wa(i) {
  const c = /* @__PURE__ */ Object.create(null), u = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = u.exec(i); )
    c[e[1]] = e[2];
  return c;
}
const La = (i) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(i.trim());
function fe(i, c, u, e, p) {
  if (f.isFunction(e))
    return e.call(this, c, u);
  if (p && (c = u), !!f.isString(c)) {
    if (f.isString(e))
      return c.indexOf(e) !== -1;
    if (f.isRegExp(e))
      return e.test(c);
  }
}
function qa(i) {
  return i.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (c, u, e) => u.toUpperCase() + e);
}
function Ma(i, c) {
  const u = f.toCamelCase(" " + c);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(i, e + u, {
      value: function(p, P, g) {
        return this[e].call(this, c, p, P, g);
      },
      configurable: !0
    });
  });
}
let pe = class {
  constructor(c) {
    c && this.set(c);
  }
  set(c, u, e) {
    const p = this;
    function P(m, R, S) {
      const U = Z(R);
      if (!U)
        throw new Error("header name must be a non-empty string");
      const T = f.findKey(p, U);
      (!T || p[T] === void 0 || S === !0 || S === void 0 && p[T] !== !1) && (p[T || R] = re(m));
    }
    const g = (m, R) => f.forEach(m, (S, U) => P(S, U, R));
    return f.isPlainObject(c) || c instanceof this.constructor ? g(c, u) : f.isString(c) && (c = c.trim()) && !La(c) ? g(Ca(c), u) : c != null && P(u, c, e), this;
  }
  get(c, u) {
    if (c = Z(c), c) {
      const e = f.findKey(this, c);
      if (e) {
        const p = this[e];
        if (!u)
          return p;
        if (u === !0)
          return wa(p);
        if (f.isFunction(u))
          return u.call(this, p, e);
        if (f.isRegExp(u))
          return u.exec(p);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(c, u) {
    if (c = Z(c), c) {
      const e = f.findKey(this, c);
      return !!(e && this[e] !== void 0 && (!u || fe(this, this[e], e, u)));
    }
    return !1;
  }
  delete(c, u) {
    const e = this;
    let p = !1;
    function P(g) {
      if (g = Z(g), g) {
        const m = f.findKey(e, g);
        m && (!u || fe(e, e[m], m, u)) && (delete e[m], p = !0);
      }
    }
    return f.isArray(c) ? c.forEach(P) : P(c), p;
  }
  clear(c) {
    const u = Object.keys(this);
    let e = u.length, p = !1;
    for (; e--; ) {
      const P = u[e];
      (!c || fe(this, this[P], P, c, !0)) && (delete this[P], p = !0);
    }
    return p;
  }
  normalize(c) {
    const u = this, e = {};
    return f.forEach(this, (p, P) => {
      const g = f.findKey(e, P);
      if (g) {
        u[g] = re(p), delete u[P];
        return;
      }
      const m = c ? qa(P) : String(P).trim();
      m !== P && delete u[P], u[m] = re(p), e[m] = !0;
    }), this;
  }
  concat(...c) {
    return this.constructor.concat(this, ...c);
  }
  toJSON(c) {
    const u = /* @__PURE__ */ Object.create(null);
    return f.forEach(this, (e, p) => {
      e != null && e !== !1 && (u[p] = c && f.isArray(e) ? e.join(", ") : e);
    }), u;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([c, u]) => c + ": " + u).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(c) {
    return c instanceof this ? c : new this(c);
  }
  static concat(c, ...u) {
    const e = new this(c);
    return u.forEach((p) => e.set(p)), e;
  }
  static accessor(c) {
    const e = (this[ze] = this[ze] = {
      accessors: {}
    }).accessors, p = this.prototype;
    function P(g) {
      const m = Z(g);
      e[m] || (Ma(p, g), e[m] = !0);
    }
    return f.isArray(c) ? c.forEach(P) : P(c), this;
  }
};
pe.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
f.reduceDescriptors(pe.prototype, ({ value: i }, c) => {
  let u = c[0].toUpperCase() + c.slice(1);
  return {
    get: () => i,
    set(e) {
      this[u] = e;
    }
  };
});
f.freezeMethods(pe);
const K = pe;
function be(i, c) {
  const u = this || Be, e = c || u, p = K.from(e.headers);
  let P = e.data;
  return f.forEach(i, function(m) {
    P = m.call(u, P, p.normalize(), c ? c.status : void 0);
  }), p.normalize(), P;
}
function pt(i) {
  return !!(i && i.__CANCEL__);
}
function se(i, c, u) {
  E.call(this, i ?? "canceled", E.ERR_CANCELED, c, u), this.name = "CanceledError";
}
f.inherits(se, E, {
  __CANCEL__: !0
});
function Ha(i, c, u) {
  const e = u.config.validateStatus;
  !u.status || !e || e(u.status) ? i(u) : c(new E(
    "Request failed with status code " + u.status,
    [E.ERR_BAD_REQUEST, E.ERR_BAD_RESPONSE][Math.floor(u.status / 100) - 4],
    u.config,
    u.request,
    u
  ));
}
const Ia = x.isStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  function() {
    return {
      write: function(u, e, p, P, g, m) {
        const R = [];
        R.push(u + "=" + encodeURIComponent(e)), f.isNumber(p) && R.push("expires=" + new Date(p).toGMTString()), f.isString(P) && R.push("path=" + P), f.isString(g) && R.push("domain=" + g), m === !0 && R.push("secure"), document.cookie = R.join("; ");
      },
      read: function(u) {
        const e = document.cookie.match(new RegExp("(^|;\\s*)(" + u + ")=([^;]*)"));
        return e ? decodeURIComponent(e[3]) : null;
      },
      remove: function(u) {
        this.write(u, "", Date.now() - 864e5);
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
function Da(i) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(i);
}
function ka(i, c) {
  return c ? i.replace(/\/+$/, "") + "/" + c.replace(/^\/+/, "") : i;
}
function At(i, c) {
  return i && !Da(c) ? ka(i, c) : c;
}
const za = x.isStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const c = /(msie|trident)/i.test(navigator.userAgent), u = document.createElement("a");
    let e;
    function p(P) {
      let g = P;
      return c && (u.setAttribute("href", g), g = u.href), u.setAttribute("href", g), {
        href: u.href,
        protocol: u.protocol ? u.protocol.replace(/:$/, "") : "",
        host: u.host,
        search: u.search ? u.search.replace(/^\?/, "") : "",
        hash: u.hash ? u.hash.replace(/^#/, "") : "",
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname.charAt(0) === "/" ? u.pathname : "/" + u.pathname
      };
    }
    return e = p(window.location.href), function(g) {
      const m = f.isString(g) ? p(g) : g;
      return m.protocol === e.protocol && m.host === e.host;
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
function xa(i) {
  const c = /^([-+\w]{1,25})(:?\/\/|:)/.exec(i);
  return c && c[1] || "";
}
function Na(i, c) {
  i = i || 10;
  const u = new Array(i), e = new Array(i);
  let p = 0, P = 0, g;
  return c = c !== void 0 ? c : 1e3, function(R) {
    const S = Date.now(), U = e[P];
    g || (g = S), u[p] = R, e[p] = S;
    let T = P, L = 0;
    for (; T !== p; )
      L += u[T++], T = T % i;
    if (p = (p + 1) % i, p === P && (P = (P + 1) % i), S - g < c)
      return;
    const B = U && S - U;
    return B ? Math.round(L * 1e3 / B) : void 0;
  };
}
function xe(i, c) {
  let u = 0;
  const e = Na(50, 250);
  return (p) => {
    const P = p.loaded, g = p.lengthComputable ? p.total : void 0, m = P - u, R = e(m), S = P <= g;
    u = P;
    const U = {
      loaded: P,
      total: g,
      progress: g ? P / g : void 0,
      bytes: m,
      rate: R || void 0,
      estimated: R && g && S ? (g - P) / R : void 0,
      event: p
    };
    U[c ? "download" : "upload"] = !0, i(U);
  };
}
const Ka = typeof XMLHttpRequest < "u", Ga = Ka && function(i) {
  return new Promise(function(u, e) {
    let p = i.data;
    const P = K.from(i.headers).normalize(), g = i.responseType;
    let m;
    function R() {
      i.cancelToken && i.cancelToken.unsubscribe(m), i.signal && i.signal.removeEventListener("abort", m);
    }
    f.isFormData(p) && (x.isStandardBrowserEnv || x.isStandardBrowserWebWorkerEnv ? P.setContentType(!1) : P.setContentType("multipart/form-data;", !1));
    let S = new XMLHttpRequest();
    if (i.auth) {
      const B = i.auth.username || "", y = i.auth.password ? unescape(encodeURIComponent(i.auth.password)) : "";
      P.set("Authorization", "Basic " + btoa(B + ":" + y));
    }
    const U = At(i.baseURL, i.url);
    S.open(i.method.toUpperCase(), dt(U, i.params, i.paramsSerializer), !0), S.timeout = i.timeout;
    function T() {
      if (!S)
        return;
      const B = K.from(
        "getAllResponseHeaders" in S && S.getAllResponseHeaders()
      ), v = {
        data: !g || g === "text" || g === "json" ? S.responseText : S.response,
        status: S.status,
        statusText: S.statusText,
        headers: B,
        config: i,
        request: S
      };
      Ha(function(D) {
        u(D), R();
      }, function(D) {
        e(D), R();
      }, v), S = null;
    }
    if ("onloadend" in S ? S.onloadend = T : S.onreadystatechange = function() {
      !S || S.readyState !== 4 || S.status === 0 && !(S.responseURL && S.responseURL.indexOf("file:") === 0) || setTimeout(T);
    }, S.onabort = function() {
      S && (e(new E("Request aborted", E.ECONNABORTED, i, S)), S = null);
    }, S.onerror = function() {
      e(new E("Network Error", E.ERR_NETWORK, i, S)), S = null;
    }, S.ontimeout = function() {
      let y = i.timeout ? "timeout of " + i.timeout + "ms exceeded" : "timeout exceeded";
      const v = i.transitional || ut;
      i.timeoutErrorMessage && (y = i.timeoutErrorMessage), e(new E(
        y,
        v.clarifyTimeoutError ? E.ETIMEDOUT : E.ECONNABORTED,
        i,
        S
      )), S = null;
    }, x.isStandardBrowserEnv) {
      const B = (i.withCredentials || za(U)) && i.xsrfCookieName && Ia.read(i.xsrfCookieName);
      B && P.set(i.xsrfHeaderName, B);
    }
    p === void 0 && P.setContentType(null), "setRequestHeader" in S && f.forEach(P.toJSON(), function(y, v) {
      S.setRequestHeader(v, y);
    }), f.isUndefined(i.withCredentials) || (S.withCredentials = !!i.withCredentials), g && g !== "json" && (S.responseType = i.responseType), typeof i.onDownloadProgress == "function" && S.addEventListener("progress", xe(i.onDownloadProgress, !0)), typeof i.onUploadProgress == "function" && S.upload && S.upload.addEventListener("progress", xe(i.onUploadProgress)), (i.cancelToken || i.signal) && (m = (B) => {
      S && (e(!B || B.type ? new se(null, i, S) : B), S.abort(), S = null);
    }, i.cancelToken && i.cancelToken.subscribe(m), i.signal && (i.signal.aborted ? m() : i.signal.addEventListener("abort", m)));
    const L = xa(U);
    if (L && x.protocols.indexOf(L) === -1) {
      e(new E("Unsupported protocol " + L + ":", E.ERR_BAD_REQUEST, i));
      return;
    }
    S.send(p || null);
  });
}, ne = {
  http: fa,
  xhr: Ga
};
f.forEach(ne, (i, c) => {
  if (i) {
    try {
      Object.defineProperty(i, "name", { value: c });
    } catch {
    }
    Object.defineProperty(i, "adapterName", { value: c });
  }
});
const Ot = {
  getAdapter: (i) => {
    i = f.isArray(i) ? i : [i];
    const { length: c } = i;
    let u, e;
    for (let p = 0; p < c && (u = i[p], !(e = f.isString(u) ? ne[u.toLowerCase()] : u)); p++)
      ;
    if (!e)
      throw e === !1 ? new E(
        `Adapter ${u} is not supported by the environment`,
        "ERR_NOT_SUPPORT"
      ) : new Error(
        f.hasOwnProp(ne, u) ? `Adapter '${u}' is not available in the build` : `Unknown adapter '${u}'`
      );
    if (!f.isFunction(e))
      throw new TypeError("adapter is not a function");
    return e;
  },
  adapters: ne
};
function me(i) {
  if (i.cancelToken && i.cancelToken.throwIfRequested(), i.signal && i.signal.aborted)
    throw new se(null, i);
}
function Ne(i) {
  return me(i), i.headers = K.from(i.headers), i.data = be.call(
    i,
    i.transformRequest
  ), ["post", "put", "patch"].indexOf(i.method) !== -1 && i.headers.setContentType("application/x-www-form-urlencoded", !1), Ot.getAdapter(i.adapter || Be.adapter)(i).then(function(e) {
    return me(i), e.data = be.call(
      i,
      i.transformResponse,
      e
    ), e.headers = K.from(e.headers), e;
  }, function(e) {
    return pt(e) || (me(i), e && e.response && (e.response.data = be.call(
      i,
      i.transformResponse,
      e.response
    ), e.response.headers = K.from(e.response.headers))), Promise.reject(e);
  });
}
const Ke = (i) => i instanceof K ? i.toJSON() : i;
function W(i, c) {
  c = c || {};
  const u = {};
  function e(S, U, T) {
    return f.isPlainObject(S) && f.isPlainObject(U) ? f.merge.call({ caseless: T }, S, U) : f.isPlainObject(U) ? f.merge({}, U) : f.isArray(U) ? U.slice() : U;
  }
  function p(S, U, T) {
    if (f.isUndefined(U)) {
      if (!f.isUndefined(S))
        return e(void 0, S, T);
    } else
      return e(S, U, T);
  }
  function P(S, U) {
    if (!f.isUndefined(U))
      return e(void 0, U);
  }
  function g(S, U) {
    if (f.isUndefined(U)) {
      if (!f.isUndefined(S))
        return e(void 0, S);
    } else
      return e(void 0, U);
  }
  function m(S, U, T) {
    if (T in c)
      return e(S, U);
    if (T in i)
      return e(void 0, S);
  }
  const R = {
    url: P,
    method: P,
    data: P,
    baseURL: g,
    transformRequest: g,
    transformResponse: g,
    paramsSerializer: g,
    timeout: g,
    timeoutMessage: g,
    withCredentials: g,
    adapter: g,
    responseType: g,
    xsrfCookieName: g,
    xsrfHeaderName: g,
    onUploadProgress: g,
    onDownloadProgress: g,
    decompress: g,
    maxContentLength: g,
    maxBodyLength: g,
    beforeRedirect: g,
    transport: g,
    httpAgent: g,
    httpsAgent: g,
    cancelToken: g,
    socketPath: g,
    responseEncoding: g,
    validateStatus: m,
    headers: (S, U) => p(Ke(S), Ke(U), !0)
  };
  return f.forEach(Object.keys(Object.assign({}, i, c)), function(U) {
    const T = R[U] || p, L = T(i[U], c[U], U);
    f.isUndefined(L) && T !== m || (u[U] = L);
  }), u;
}
const Pt = "1.5.0", _e = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((i, c) => {
  _e[i] = function(e) {
    return typeof e === i || "a" + (c < 1 ? "n " : " ") + i;
  };
});
const Ge = {};
_e.transitional = function(c, u, e) {
  function p(P, g) {
    return "[Axios v" + Pt + "] Transitional option '" + P + "'" + g + (e ? ". " + e : "");
  }
  return (P, g, m) => {
    if (c === !1)
      throw new E(
        p(g, " has been removed" + (u ? " in " + u : "")),
        E.ERR_DEPRECATED
      );
    return u && !Ge[g] && (Ge[g] = !0, console.warn(
      p(
        g,
        " has been deprecated since v" + u + " and will be removed in the near future"
      )
    )), c ? c(P, g, m) : !0;
  };
};
function Qa(i, c, u) {
  if (typeof i != "object")
    throw new E("options must be an object", E.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(i);
  let p = e.length;
  for (; p-- > 0; ) {
    const P = e[p], g = c[P];
    if (g) {
      const m = i[P], R = m === void 0 || g(m, P, i);
      if (R !== !0)
        throw new E("option " + P + " must be " + R, E.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (u !== !0)
      throw new E("Unknown option " + P, E.ERR_BAD_OPTION);
  }
}
const je = {
  assertOptions: Qa,
  validators: _e
}, Q = je.validators;
let ce = class {
  constructor(c) {
    this.defaults = c, this.interceptors = {
      request: new ke(),
      response: new ke()
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
  request(c, u) {
    typeof c == "string" ? (u = u || {}, u.url = c) : u = c || {}, u = W(this.defaults, u);
    const { transitional: e, paramsSerializer: p, headers: P } = u;
    e !== void 0 && je.assertOptions(e, {
      silentJSONParsing: Q.transitional(Q.boolean),
      forcedJSONParsing: Q.transitional(Q.boolean),
      clarifyTimeoutError: Q.transitional(Q.boolean)
    }, !1), p != null && (f.isFunction(p) ? u.paramsSerializer = {
      serialize: p
    } : je.assertOptions(p, {
      encode: Q.function,
      serialize: Q.function
    }, !0)), u.method = (u.method || this.defaults.method || "get").toLowerCase();
    let g = P && f.merge(
      P.common,
      P[u.method]
    );
    P && f.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (y) => {
        delete P[y];
      }
    ), u.headers = K.concat(g, P);
    const m = [];
    let R = !0;
    this.interceptors.request.forEach(function(v) {
      typeof v.runWhen == "function" && v.runWhen(u) === !1 || (R = R && v.synchronous, m.unshift(v.fulfilled, v.rejected));
    });
    const S = [];
    this.interceptors.response.forEach(function(v) {
      S.push(v.fulfilled, v.rejected);
    });
    let U, T = 0, L;
    if (!R) {
      const y = [Ne.bind(this), void 0];
      for (y.unshift.apply(y, m), y.push.apply(y, S), L = y.length, U = Promise.resolve(u); T < L; )
        U = U.then(y[T++], y[T++]);
      return U;
    }
    L = m.length;
    let B = u;
    for (T = 0; T < L; ) {
      const y = m[T++], v = m[T++];
      try {
        B = y(B);
      } catch (z) {
        v.call(this, z);
        break;
      }
    }
    try {
      U = Ne.call(this, B);
    } catch (y) {
      return Promise.reject(y);
    }
    for (T = 0, L = S.length; T < L; )
      U = U.then(S[T++], S[T++]);
    return U;
  }
  getUri(c) {
    c = W(this.defaults, c);
    const u = At(c.baseURL, c.url);
    return dt(u, c.params, c.paramsSerializer);
  }
};
f.forEach(["delete", "get", "head", "options"], function(c) {
  ce.prototype[c] = function(u, e) {
    return this.request(W(e || {}, {
      method: c,
      url: u,
      data: (e || {}).data
    }));
  };
});
f.forEach(["post", "put", "patch"], function(c) {
  function u(e) {
    return function(P, g, m) {
      return this.request(W(m || {}, {
        method: c,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: P,
        data: g
      }));
    };
  }
  ce.prototype[c] = u(), ce.prototype[c + "Form"] = u(!0);
});
const ie = ce;
let Ya = class gt {
  constructor(c) {
    if (typeof c != "function")
      throw new TypeError("executor must be a function.");
    let u;
    this.promise = new Promise(function(P) {
      u = P;
    });
    const e = this;
    this.promise.then((p) => {
      if (!e._listeners)
        return;
      let P = e._listeners.length;
      for (; P-- > 0; )
        e._listeners[P](p);
      e._listeners = null;
    }), this.promise.then = (p) => {
      let P;
      const g = new Promise((m) => {
        e.subscribe(m), P = m;
      }).then(p);
      return g.cancel = function() {
        e.unsubscribe(P);
      }, g;
    }, c(function(P, g, m) {
      e.reason || (e.reason = new se(P, g, m), u(e.reason));
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
  subscribe(c) {
    if (this.reason) {
      c(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(c) : this._listeners = [c];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(c) {
    if (!this._listeners)
      return;
    const u = this._listeners.indexOf(c);
    u !== -1 && this._listeners.splice(u, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let c;
    return {
      token: new gt(function(p) {
        c = p;
      }),
      cancel: c
    };
  }
};
const $a = Ya;
function Wa(i) {
  return function(u) {
    return i.apply(null, u);
  };
}
function Ja(i) {
  return f.isObject(i) && i.isAxiosError === !0;
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
Object.entries(Ve).forEach(([i, c]) => {
  Ve[c] = i;
});
const Xa = Ve;
function ft(i) {
  const c = new ie(i), u = Xe(ie.prototype.request, c);
  return f.extend(u, ie.prototype, c, { allOwnKeys: !0 }), f.extend(u, c, null, { allOwnKeys: !0 }), u.create = function(p) {
    return ft(W(i, p));
  }, u;
}
const M = ft(Be);
M.Axios = ie;
M.CanceledError = se;
M.CancelToken = $a;
M.isCancel = pt;
M.VERSION = Pt;
M.toFormData = he;
M.AxiosError = E;
M.Cancel = M.CanceledError;
M.all = function(c) {
  return Promise.all(c);
};
M.spread = Wa;
M.isAxiosError = Ja;
M.mergeConfig = W;
M.AxiosHeaders = K;
M.formToJSON = (i) => ht(f.isHTMLForm(i) ? new FormData(i) : i);
M.getAdapter = Ot.getAdapter;
M.HttpStatusCode = Xa;
M.default = M;
const Ce = M, {
  Axios: Za,
  AxiosError: er,
  CanceledError: tr,
  isCancel: sr,
  CancelToken: ar,
  VERSION: rr,
  all: nr,
  Cancel: ir,
  isAxiosError: or,
  spread: cr,
  toFormData: lr,
  AxiosHeaders: dr,
  HttpStatusCode: ur,
  formToJSON: hr,
  getAdapter: pr,
  mergeConfig: Ar
} = Ce, Or = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: Za,
  AxiosError: er,
  AxiosHeaders: dr,
  Cancel: ir,
  CancelToken: ar,
  CanceledError: tr,
  HttpStatusCode: ur,
  VERSION: rr,
  all: nr,
  default: Ce,
  formToJSON: hr,
  getAdapter: pr,
  isAxiosError: or,
  isCancel: sr,
  mergeConfig: Ar,
  spread: cr,
  toFormData: lr
}, Symbol.toStringTag, { value: "Module" })), bt = /* @__PURE__ */ Ms(Or);
var C = {}, we = {};
(function(i) {
  Object.defineProperty(i, "__esModule", { value: !0 }), i.RequiredError = i.BaseAPI = i.COLLECTION_FORMATS = i.BASE_PATH = void 0;
  const c = bt;
  i.BASE_PATH = "http://localhost".replace(/\/+$/, ""), i.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class u {
    constructor(P, g = i.BASE_PATH, m = c.default) {
      this.basePath = g, this.axios = m, P && (this.configuration = P, this.basePath = P.basePath || this.basePath);
    }
  }
  i.BaseAPI = u;
  class e extends Error {
    constructor(P, g) {
      super(g), this.field = P, this.name = "RequiredError";
    }
  }
  i.RequiredError = e;
})(we);
var Le = Y && Y.__awaiter || function(i, c, u, e) {
  function p(P) {
    return P instanceof u ? P : new u(function(g) {
      g(P);
    });
  }
  return new (u || (u = Promise))(function(P, g) {
    function m(U) {
      try {
        S(e.next(U));
      } catch (T) {
        g(T);
      }
    }
    function R(U) {
      try {
        S(e.throw(U));
      } catch (T) {
        g(T);
      }
    }
    function S(U) {
      U.done ? P(U.value) : p(U.value).then(m, R);
    }
    S((e = e.apply(i, c || [])).next());
  });
};
Object.defineProperty(C, "__esModule", { value: !0 });
C.createRequestFunction = C.toPathString = C.serializeDataIfNeeded = C.setSearchParams = C.setOAuthToObject = C.setBearerAuthToObject = C.setBasicAuthToObject = C.setApiKeyToObject = C.assertParamExists = C.DUMMY_BASE_URL = void 0;
const Pr = we;
C.DUMMY_BASE_URL = "https://example.com";
const gr = function(i, c, u) {
  if (u == null)
    throw new Pr.RequiredError(c, `Required parameter ${c} was null or undefined when calling ${i}.`);
};
C.assertParamExists = gr;
const fr = function(i, c, u) {
  return Le(this, void 0, void 0, function* () {
    if (u && u.apiKey) {
      const e = typeof u.apiKey == "function" ? yield u.apiKey(c) : yield u.apiKey;
      i[c] = e;
    }
  });
};
C.setApiKeyToObject = fr;
const br = function(i, c) {
  c && (c.username || c.password) && (i.auth = { username: c.username, password: c.password });
};
C.setBasicAuthToObject = br;
const mr = function(i, c) {
  return Le(this, void 0, void 0, function* () {
    if (c && c.accessToken) {
      const u = typeof c.accessToken == "function" ? yield c.accessToken() : yield c.accessToken;
      i.Authorization = "Bearer " + u;
    }
  });
};
C.setBearerAuthToObject = mr;
const Sr = function(i, c, u, e) {
  return Le(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const p = typeof e.accessToken == "function" ? yield e.accessToken(c, u) : yield e.accessToken;
      i.Authorization = "Bearer " + p;
    }
  });
};
C.setOAuthToObject = Sr;
function Re(i, c, u = "") {
  c != null && (typeof c == "object" ? Array.isArray(c) ? c.forEach((e) => Re(i, e, u)) : Object.keys(c).forEach((e) => Re(i, c[e], `${u}${u !== "" ? "." : ""}${e}`)) : i.has(u) ? i.append(u, c) : i.set(u, c));
}
const Ur = function(i, ...c) {
  const u = new URLSearchParams(i.search);
  Re(u, c), i.search = u.toString();
};
C.setSearchParams = Ur;
const yr = function(i, c, u) {
  const e = typeof i != "string";
  return (e && u && u.isJsonMime ? u.isJsonMime(c.headers["Content-Type"]) : e) ? JSON.stringify(i !== void 0 ? i : {}) : i || "";
};
C.serializeDataIfNeeded = yr;
const jr = function(i) {
  return i.pathname + i.search + i.hash;
};
C.toPathString = jr;
const Vr = function(i, c, u, e) {
  return (p = c, P = u) => {
    const g = Object.assign(Object.assign({}, i.options), { url: ((e == null ? void 0 : e.basePath) || P) + i.url });
    return p.request(g);
  };
};
C.createRequestFunction = Vr;
(function(i) {
  var c = Y && Y.__awaiter || function(l, n, t, r) {
    function a(s) {
      return s instanceof t ? s : new t(function(o) {
        o(s);
      });
    }
    return new (t || (t = Promise))(function(s, o) {
      function d(O) {
        try {
          A(r.next(O));
        } catch (b) {
          o(b);
        }
      }
      function h(O) {
        try {
          A(r.throw(O));
        } catch (b) {
          o(b);
        }
      }
      function A(O) {
        O.done ? s(O.value) : a(O.value).then(d, h);
      }
      A((r = r.apply(l, n || [])).next());
    });
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), i.RootApiFp = i.RootApiAxiosParamCreator = i.RbacApi = i.RbacApiFactory = i.RbacApiFp = i.RbacApiAxiosParamCreator = i.ProductsApi = i.ProductsApiFactory = i.ProductsApiFp = i.ProductsApiAxiosParamCreator = i.ProductCategoriesApi = i.ProductCategoriesApiFactory = i.ProductCategoriesApiFp = i.ProductCategoriesApiAxiosParamCreator = i.PointofsaleApi = i.PointofsaleApiFactory = i.PointofsaleApiFp = i.PointofsaleApiAxiosParamCreator = i.PayoutRequestsApi = i.PayoutRequestsApiFactory = i.PayoutRequestsApiFp = i.PayoutRequestsApiAxiosParamCreator = i.InvoicesApi = i.InvoicesApiFactory = i.InvoicesApiFp = i.InvoicesApiAxiosParamCreator = i.FilesApi = i.FilesApiFactory = i.FilesApiFp = i.FilesApiAxiosParamCreator = i.ContainersApi = i.ContainersApiFactory = i.ContainersApiFp = i.ContainersApiAxiosParamCreator = i.BorrelkaartgroupsApi = i.BorrelkaartgroupsApiFactory = i.BorrelkaartgroupsApiFp = i.BorrelkaartgroupsApiAxiosParamCreator = i.BannersApi = i.BannersApiFactory = i.BannersApiFp = i.BannersApiAxiosParamCreator = i.BalanceApi = i.BalanceApiFactory = i.BalanceApiFp = i.BalanceApiAxiosParamCreator = i.AuthenticateApi = i.AuthenticateApiFactory = i.AuthenticateApiFp = i.AuthenticateApiAxiosParamCreator = void 0, i.VatGroupsApi = i.VatGroupsApiFactory = i.VatGroupsApiFp = i.VatGroupsApiAxiosParamCreator = i.UsersApi = i.UsersApiFactory = i.UsersApiFp = i.UsersApiAxiosParamCreator = i.TransfersApi = i.TransfersApiFactory = i.TransfersApiFp = i.TransfersApiAxiosParamCreator = i.TransactionsApi = i.TransactionsApiFactory = i.TransactionsApiFp = i.TransactionsApiAxiosParamCreator = i.TestApi = i.TestApiFactory = i.TestApiFp = i.TestApiAxiosParamCreator = i.StripeApi = i.StripeApiFactory = i.StripeApiFp = i.StripeApiAxiosParamCreator = i.RootApi = i.RootApiFactory = void 0;
  const u = bt, e = C, p = we, P = function(l) {
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("eanAuthentication", "req", n);
        const r = "/authentication/ean", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "req", n);
        const r = "/authentication/GEWIS/LDAP", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisPinAuthentication", "req", n);
        const r = "/authentication/GEWIS/pin", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisWebAuthentication", "req", n);
        const r = "/authentication/gewisweb", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("keyAuthentication", "req", n);
        const r = "/authentication/key", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("ldapAuthentication", "req", n);
        const r = "/authentication/LDAP", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("localAuthentication", "req", n);
        const r = "/authentication/local", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("mockAuthentication", "req", n);
        const r = "/authentication/mock", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("nfcAuthentication", "req", n);
        const r = "/authentication/nfc", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("pinAuthentication", "req", n);
        const r = "/authentication/pin", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/authentication/refreshToken", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), n), o = {}, d = {};
        yield (0, e.setApiKeyToObject)(o, "Authorization", l), (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      }),
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocal", "req", n);
        const r = "/authentication/local/reset", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocalWithToken", "req", n);
        const r = "/authentication/local", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "PUT" }, s), t), d = {}, h = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      })
    };
  };
  i.AuthenticateApiAxiosParamCreator = P;
  const g = function(l) {
    const n = (0, i.AuthenticateApiAxiosParamCreator)(l);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.eanAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.gewisLDAPAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.gewisPinAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.gewisWebAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.keyAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.ldapAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.localAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.mockAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.nfcAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.pinAuthentication(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.refreshToken(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.resetLocal(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.resetLocalWithToken(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.AuthenticateApiFp = g;
  const m = function(l, n, t) {
    const r = (0, i.AuthenticateApiFp)(l);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(a, s) {
        return r.eanAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(a, s) {
        return r.gewisLDAPAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(a, s) {
        return r.gewisPinAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(a, s) {
        return r.gewisWebAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(a, s) {
        return r.keyAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(a, s) {
        return r.ldapAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(a, s) {
        return r.localAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(a, s) {
        return r.mockAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(a, s) {
        return r.nfcAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(a, s) {
        return r.pinAuthentication(a, s).then((o) => o(t, n));
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(a) {
        return r.refreshToken(a).then((s) => s(t, n));
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(a, s) {
        return r.resetLocal(a, s).then((o) => o(t, n));
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(a, s) {
        return r.resetLocalWithToken(a, s).then((o) => o(t, n));
      }
    };
  };
  i.AuthenticateApiFactory = m;
  class R extends p.BaseAPI {
    /**
     *  EAN login and hand out token
     * @param {AuthenticationEanRequest} req The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).eanAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Key login and hand out token.
     * @param {AuthenticationKeyRequest} req The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).keyAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).ldapAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Local login and hand out token
     * @param {AuthenticationLocalRequest} req The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).localAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Mock login and hand out token.
     * @param {AuthenticationMockRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).mockAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  NFC login and hand out token
     * @param {AuthenticationNfcRequest} req The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).nfcAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token
     * @param {AuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).pinAuthentication(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(n) {
      return (0, i.AuthenticateApiFp)(this.configuration).refreshToken(n).then((t) => t(this.axios, this.basePath));
    }
    /**
     *  Creates a reset token for the local authentication
     * @param {ResetLocalRequest} req The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).resetLocal(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} req The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(n, t) {
      return (0, i.AuthenticateApiFp)(this.configuration).resetLocalWithToken(n, t).then((r) => r(this.axios, this.basePath));
    }
  }
  i.AuthenticateApi = R;
  const S = function(l) {
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
      getAllBalance: (n, t, r, a, s, o, d, h = {}) => c(this, void 0, void 0, function* () {
        const A = "/balances/all", O = new URL(A, e.DUMMY_BASE_URL);
        let b;
        l && (b = l.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, b), h), j = {}, V = {};
        yield (0, e.setApiKeyToObject)(j, "Authorization", l), n !== void 0 && (V.date = n), t !== void 0 && (V.minBalance = t), r !== void 0 && (V.maxBalance = r), a !== void 0 && (V.orderBy = a), s !== void 0 && (V.orderDirection = s), o !== void 0 && (V.take = o), d !== void 0 && (V.skip = d), (0, e.setSearchParams)(O, V);
        let I = b && b.headers ? b.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, j), I), h.headers), {
          url: (0, e.toPathString)(O),
          options: F
        };
      }),
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBalanceId", "id", n);
        const r = "/balances/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/balances", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), n), o = {}, d = {};
        yield (0, e.setApiKeyToObject)(o, "Authorization", l), (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      })
    };
  };
  i.BalanceApiAxiosParamCreator = S;
  const U = function(l) {
    const n = (0, i.BalanceApiAxiosParamCreator)(l);
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
      getAllBalance(t, r, a, s, o, d, h, A) {
        return c(this, void 0, void 0, function* () {
          const O = yield n.getAllBalance(t, r, a, s, o, d, h, A);
          return (0, e.createRequestFunction)(O, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getBalanceId(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.getBalances(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.BalanceApiFp = U;
  const T = function(l, n, t) {
    const r = (0, i.BalanceApiFp)(l);
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
      getAllBalance(a, s, o, d, h, A, O, b) {
        return r.getAllBalance(a, s, o, d, h, A, O, b).then((F) => F(t, n));
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(a, s) {
        return r.getBalanceId(a, s).then((o) => o(t, n));
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(a) {
        return r.getBalances(a).then((s) => s(t, n));
      }
    };
  };
  i.BalanceApiFactory = T;
  class L extends p.BaseAPI {
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
    getAllBalance(n, t, r, a, s, o, d, h) {
      return (0, i.BalanceApiFp)(this.configuration).getAllBalance(n, t, r, a, s, o, d, h).then((A) => A(this.axios, this.basePath));
    }
    /**
     *  Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(n, t) {
      return (0, i.BalanceApiFp)(this.configuration).getBalanceId(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(n) {
      return (0, i.BalanceApiFp)(this.configuration).getBalances(n).then((t) => t(this.axios, this.basePath));
    }
  }
  i.BalanceApi = L;
  const B = function(l) {
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("_delete", "id", n);
        const r = "/banners/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("create", "banner", n);
        const r = "/banners", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/banners/active", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/banners", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/open/banners", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBanner", "id", n);
        const r = "/banners/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("update", "id", n), (0, e.assertParamExists)("update", "banner", t);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateImage", "id", n);
        const a = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, o), r), h = {}, A = {}, O = new (l && l.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), t !== void 0 && O.append("file", t), h["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(s, A);
        let b = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), b), r.headers), d.data = O, {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.BannersApiAxiosParamCreator = B;
  const y = function(l) {
    const n = (0, i.BannersApiAxiosParamCreator)(l);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n._delete(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.create(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getActive(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllBanners(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllOpenBanners(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getBanner(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.update(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateImage(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.BannersApiFp = y;
  const v = function(l, n, t) {
    const r = (0, i.BannersApiFp)(l);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(a, s) {
        return r._delete(a, s).then((o) => o(t, n));
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(a, s) {
        return r.create(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(a, s, o) {
        return r.getActive(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(a, s, o) {
        return r.getAllBanners(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(a, s, o) {
        return r.getAllOpenBanners(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(a, s) {
        return r.getBanner(a, s).then((o) => o(t, n));
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(a, s, o) {
        return r.update(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(a, s, o) {
        return r.updateImage(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.BannersApiFactory = v;
  class z extends p.BaseAPI {
    /**
     *  Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(n, t) {
      return (0, i.BannersApiFp)(this.configuration)._delete(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Saves a banner to the database
     * @param {BannerRequest} banner The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(n, t) {
      return (0, i.BannersApiFp)(this.configuration).create(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all active banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getActive(n, t, r) {
      return (0, i.BannersApiFp)(this.configuration).getActive(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllBanners(n, t, r) {
      return (0, i.BannersApiFp)(this.configuration).getAllBanners(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllOpenBanners(n, t, r) {
      return (0, i.BannersApiFp)(this.configuration).getAllOpenBanners(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(n, t) {
      return (0, i.BannersApiFp)(this.configuration).getBanner(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Updates the requested banner
     * @param {number} id The id of the banner which should be updated
     * @param {BannerRequest} banner The updated banner
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    update(n, t, r) {
      return (0, i.BannersApiFp)(this.configuration).update(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Uploads a banner image to the given banner
     * @param {number} id The id of the banner
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    updateImage(n, t, r) {
      return (0, i.BannersApiFp)(this.configuration).updateImage(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.BannersApi = z;
  const D = function(l) {
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createBorrelkaartgroup", "borrelkaartgroup", n);
        const r = "/borrelkaartgroups", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/borrelkaartgroups", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBorrelkaartgroupId", "id", n);
        const r = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateBorrelkaartGroup", "id", n), (0, e.assertParamExists)("updateBorrelkaartGroup", "borrelkaartgroup", t);
        const a = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.BorrelkaartgroupsApiAxiosParamCreator = D;
  const G = function(l) {
    const n = (0, i.BorrelkaartgroupsApiAxiosParamCreator)(l);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createBorrelkaartgroup(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getALlBorrelkaartgroups(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getBorrelkaartgroupId(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateBorrelkaartGroup(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.BorrelkaartgroupsApiFp = G;
  const $ = function(l, n, t) {
    const r = (0, i.BorrelkaartgroupsApiFp)(l);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(a, s) {
        return r.createBorrelkaartgroup(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(a, s, o) {
        return r.getALlBorrelkaartgroups(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(a, s) {
        return r.getBorrelkaartgroupId(a, s).then((o) => o(t, n));
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(a, s, o) {
        return r.updateBorrelkaartGroup(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.BorrelkaartgroupsApiFactory = $;
  class Oe extends p.BaseAPI {
    /**
     *  Creates a new borrelkaart group
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    createBorrelkaartgroup(n, t) {
      return (0, i.BorrelkaartgroupsApiFp)(this.configuration).createBorrelkaartgroup(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing borrelkaart groups
     * @param {number} [take] How many borrelkaart groups the endpoint should return
     * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getALlBorrelkaartgroups(n, t, r) {
      return (0, i.BorrelkaartgroupsApiFp)(this.configuration).getALlBorrelkaartgroups(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getBorrelkaartgroupId(n, t) {
      return (0, i.BorrelkaartgroupsApiFp)(this.configuration).getBorrelkaartgroupId(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Updates the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be updated
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    updateBorrelkaartGroup(n, t, r) {
      return (0, i.BorrelkaartgroupsApiFp)(this.configuration).updateBorrelkaartGroup(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.BorrelkaartgroupsApi = Oe;
  const mt = function(l) {
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveContainer", "id", n);
        const r = "/containers/{id}/approve".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createContainer", "container", n);
        const r = "/containers", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/containers", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
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
      getProductsContainer: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getProductsContainer", "id", n);
        const s = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/containers/public", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleContainer", "id", n);
        const r = "/containers/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedContainer", "id", n);
        const r = "/containers/{id}/update".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/containers/updated", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateContainer", "id", n), (0, e.assertParamExists)("updateContainer", "container", t);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.ContainersApiAxiosParamCreator = mt;
  const St = function(l) {
    const n = (0, i.ContainersApiAxiosParamCreator)(l);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.approveContainer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createContainer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllContainers(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
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
      getProductsContainer(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getProductsContainer(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getPublicContainers(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleContainer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleUpdatedContainer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getUpdatedContainers(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateContainer(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.ContainersApiFp = St;
  const Ut = function(l, n, t) {
    const r = (0, i.ContainersApiFp)(l);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(a, s) {
        return r.approveContainer(a, s).then((o) => o(t, n));
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(a, s) {
        return r.createContainer(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(a, s, o) {
        return r.getAllContainers(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(a, s, o, d) {
        return r.getProductsContainer(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(a, s, o) {
        return r.getPublicContainers(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(a, s) {
        return r.getSingleContainer(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(a, s) {
        return r.getSingleUpdatedContainer(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(a, s, o) {
        return r.getUpdatedContainers(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(a, s, o) {
        return r.updateContainer(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.ContainersApiFactory = Ut;
  class yt extends p.BaseAPI {
    /**
     *  Approve a container update.
     * @param {number} id The id of the container update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    approveContainer(n, t) {
      return (0, i.ContainersApiFp)(this.configuration).approveContainer(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Create a new container.
     * @param {CreateContainerRequest} container    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(n, t) {
      return (0, i.ContainersApiFp)(this.configuration).createContainer(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getAllContainers(n, t, r) {
      return (0, i.ContainersApiFp)(this.configuration).getAllContainers(n, t, r).then((a) => a(this.axios, this.basePath));
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
    getProductsContainer(n, t, r, a) {
      return (0, i.ContainersApiFp)(this.configuration).getProductsContainer(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Returns all public container
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getPublicContainers(n, t, r) {
      return (0, i.ContainersApiFp)(this.configuration).getPublicContainers(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(n, t) {
      return (0, i.ContainersApiFp)(this.configuration).getSingleContainer(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleUpdatedContainer(n, t) {
      return (0, i.ContainersApiFp)(this.configuration).getSingleUpdatedContainer(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all updated containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getUpdatedContainers(n, t, r) {
      return (0, i.ContainersApiFp)(this.configuration).getUpdatedContainers(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing container.
     * @param {number} id The id of the container which should be updated
     * @param {UpdateContainerRequest} container    The container which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    updateContainer(n, t, r) {
      return (0, i.ContainersApiFp)(this.configuration).updateContainer(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.ContainersApi = yt;
  const jt = function(l) {
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/files", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, o), r), h = {}, A = {}, O = new (l && l.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && O.append("file", n), t !== void 0 && O.append("name", t), h["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(s, A);
        let b = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), b), r.headers), d.data = O, {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteFile", "id", n);
        const r = "/files/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getFile", "id", n);
        const r = "/files/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      })
    };
  };
  i.FilesApiAxiosParamCreator = jt;
  const Vt = function(l) {
    const n = (0, i.FilesApiAxiosParamCreator)(l);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.createFile(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteFile(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getFile(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.FilesApiFp = Vt;
  const Rt = function(l, n, t) {
    const r = (0, i.FilesApiFp)(l);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(a, s, o) {
        return r.createFile(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(a, s) {
        return r.deleteFile(a, s).then((o) => o(t, n));
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(a, s) {
        return r.getFile(a, s).then((o) => o(t, n));
      }
    };
  };
  i.FilesApiFactory = Rt;
  class Tt extends p.BaseAPI {
    /**
     *  Upload a file with the given name.
     * @param {File} [file] null
     * @param {string} [name] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(n, t, r) {
      return (0, i.FilesApiFp)(this.configuration).createFile(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(n, t) {
      return (0, i.FilesApiFp)(this.configuration).deleteFile(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(n, t) {
      return (0, i.FilesApiFp)(this.configuration).getFile(n, t).then((r) => r(this.axios, this.basePath));
    }
  }
  i.FilesApi = Tt;
  const Ft = function(l) {
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createInvoice", "invoice", n);
        const r = "/invoices", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteInvoice", "id", n);
        const r = "/invoices/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllInvoices: (n, t, r, a, s, o, d = {}) => c(this, void 0, void 0, function* () {
        const h = "/invoices", A = new URL(h, e.DUMMY_BASE_URL);
        let O;
        l && (O = l.baseOptions);
        const b = Object.assign(Object.assign({ method: "GET" }, O), d), F = {}, j = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", l), n !== void 0 && (j.toId = n), t !== void 0 && (j.invoiceId = t), r !== void 0 && (j.state = r), a !== void 0 && (j.returnEntries = a), s !== void 0 && (j.fromDate = s), o !== void 0 && (j.tillDate = o), (0, e.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return b.headers = Object.assign(Object.assign(Object.assign({}, F), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: b
        };
      }),
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleInvoice", "id", n);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), t !== void 0 && (A.returnEntries = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateInvoice", "id", n), (0, e.assertParamExists)("updateInvoice", "invoice", t);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.InvoicesApiAxiosParamCreator = Ft;
  const vt = function(l) {
    const n = (0, i.InvoicesApiAxiosParamCreator)(l);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createInvoice(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteInvoice(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllInvoices(t, r, a, s, o, d, h) {
        return c(this, void 0, void 0, function* () {
          const A = yield n.getAllInvoices(t, r, a, s, o, d, h);
          return (0, e.createRequestFunction)(A, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getSingleInvoice(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateInvoice(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.InvoicesApiFp = vt;
  const Et = function(l, n, t) {
    const r = (0, i.InvoicesApiFp)(l);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(a, s) {
        return r.createInvoice(a, s).then((o) => o(t, n));
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(a, s) {
        return r.deleteInvoice(a, s).then((o) => o(t, n));
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
      getAllInvoices(a, s, o, d, h, A, O) {
        return r.getAllInvoices(a, s, o, d, h, A, O).then((b) => b(t, n));
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(a, s, o) {
        return r.getSingleInvoice(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(a, s, o) {
        return r.updateInvoice(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.InvoicesApiFactory = Et;
  class Bt extends p.BaseAPI {
    /**
     *  Adds an invoice to the system.
     * @param {CreateInvoiceRequest} invoice The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(n, t) {
      return (0, i.InvoicesApiFp)(this.configuration).createInvoice(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(n, t) {
      return (0, i.InvoicesApiFp)(this.configuration).deleteInvoice(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllInvoices(n, t, r, a, s, o, d) {
      return (0, i.InvoicesApiFp)(this.configuration).getAllInvoices(n, t, r, a, s, o, d).then((h) => h(this.axios, this.basePath));
    }
    /**
     *  Returns a single invoice in the system.
     * @param {number} id The id of the requested invoice
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoice(n, t, r) {
      return (0, i.InvoicesApiFp)(this.configuration).getSingleInvoice(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} invoice The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(n, t, r) {
      return (0, i.InvoicesApiFp)(this.configuration).updateInvoice(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.InvoicesApi = Bt;
  const _t = function(l) {
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequest", n);
        const r = "/payoutrequests", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllPayoutRequests: (n, t, r, a, s, o, d, h = {}) => c(this, void 0, void 0, function* () {
        const A = "/payoutrequests", O = new URL(A, e.DUMMY_BASE_URL);
        let b;
        l && (b = l.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, b), h), j = {}, V = {};
        yield (0, e.setApiKeyToObject)(j, "Authorization", l), n !== void 0 && (V.requestedById = n), t !== void 0 && (V.approvedById = t), r !== void 0 && (V.fromDate = r), a !== void 0 && (V.tillDate = a), s !== void 0 && (V.status = s), o !== void 0 && (V.take = o), d !== void 0 && (V.skip = d), (0, e.setSearchParams)(O, V);
        let I = b && b.headers ? b.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, j), I), h.headers), {
          url: (0, e.toPathString)(O),
          options: F
        };
      }),
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", n);
        const r = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", n), (0, e.assertParamExists)("setPayoutRequestStatus", "state", t);
        const a = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.PayoutRequestsApiAxiosParamCreator = _t;
  const Ct = function(l) {
    const n = (0, i.PayoutRequestsApiAxiosParamCreator)(l);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createPayoutRequest(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllPayoutRequests(t, r, a, s, o, d, h, A) {
        return c(this, void 0, void 0, function* () {
          const O = yield n.getAllPayoutRequests(t, r, a, s, o, d, h, A);
          return (0, e.createRequestFunction)(O, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSinglePayoutRequest(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.setPayoutRequestStatus(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.PayoutRequestsApiFp = Ct;
  const wt = function(l, n, t) {
    const r = (0, i.PayoutRequestsApiFp)(l);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(a, s) {
        return r.createPayoutRequest(a, s).then((o) => o(t, n));
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
      getAllPayoutRequests(a, s, o, d, h, A, O, b) {
        return r.getAllPayoutRequests(a, s, o, d, h, A, O, b).then((F) => F(t, n));
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(a, s) {
        return r.getSinglePayoutRequest(a, s).then((o) => o(t, n));
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(a, s, o) {
        return r.setPayoutRequestStatus(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.PayoutRequestsApiFactory = wt;
  class Lt extends p.BaseAPI {
    /**
     *  Create a new payout request
     * @param {PayoutRequestRequest} payoutRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(n, t) {
      return (0, i.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllPayoutRequests(n, t, r, a, s, o, d, h) {
      return (0, i.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(n, t, r, a, s, o, d, h).then((A) => A(this.axios, this.basePath));
    }
    /**
     *  Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(n, t) {
      return (0, i.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} state New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(n, t, r) {
      return (0, i.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.PayoutRequestsApi = Lt;
  const qt = function(l) {
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approvePointOfSale", "id", n);
        const r = "/pointsofsale/{id}/approve".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPointOfSale", "pointofsale", n);
        const r = "/pointsofsale", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllPointOfSaleContainers: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", n);
        const s = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getAllPointOfSaleProducts: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", n);
        const s = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/pointsofsale", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", n);
        const r = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedPointOfSale", "id", n);
        const r = "/pointsofsale/{id}/update".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getTransactions: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getTransactions", "id", n);
        const s = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/pointsofsale/updated", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updatePointOfSale", "id", n), (0, e.assertParamExists)("updatePointOfSale", "pointofsale", t);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.PointofsaleApiAxiosParamCreator = qt;
  const Mt = function(l) {
    const n = (0, i.PointofsaleApiAxiosParamCreator)(l);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.approvePointOfSale(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createPointOfSale(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllPointOfSaleContainers(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getAllPointOfSaleContainers(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getAllPointOfSaleProducts(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getAllPointOfSaleProducts(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllPointsOfSale(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSinglePointOfSale(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleUpdatedPointOfSale(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getTransactions(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getTransactions(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getUpdated(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updatePointOfSale(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.PointofsaleApiFp = Mt;
  const Ht = function(l, n, t) {
    const r = (0, i.PointofsaleApiFp)(l);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(a, s) {
        return r.approvePointOfSale(a, s).then((o) => o(t, n));
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(a, s) {
        return r.createPointOfSale(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(a, s, o, d) {
        return r.getAllPointOfSaleContainers(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(a, s, o, d) {
        return r.getAllPointOfSaleProducts(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(a, s, o) {
        return r.getAllPointsOfSale(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(a, s) {
        return r.getSinglePointOfSale(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(a, s) {
        return r.getSingleUpdatedPointOfSale(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns a Point of Sale transactions
       * @param {number} id          The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(a, s, o, d) {
        return r.getTransactions(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(a, s, o) {
        return r.getUpdated(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(a, s, o) {
        return r.updatePointOfSale(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.PointofsaleApiFactory = Ht;
  class It extends p.BaseAPI {
    /**
     *  Approve a Point of Sale update.
     * @param {number} id The id of the Point of Sale update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    approvePointOfSale(n, t) {
      return (0, i.PointofsaleApiFp)(this.configuration).approvePointOfSale(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(n, t) {
      return (0, i.PointofsaleApiFp)(this.configuration).createPointOfSale(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllPointOfSaleContainers(n, t, r, a) {
      return (0, i.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getAllPointOfSaleProducts(n, t, r, a) {
      return (0, i.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Returns all existing Point of Sales
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointsOfSale(n, t, r) {
      return (0, i.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(n, t) {
      return (0, i.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns a single Points of Sale update
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSingleUpdatedPointOfSale(n, t) {
      return (0, i.PointofsaleApiFp)(this.configuration).getSingleUpdatedPointOfSale(n, t).then((r) => r(this.axios, this.basePath));
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
    getTransactions(n, t, r, a) {
      return (0, i.PointofsaleApiFp)(this.configuration).getTransactions(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Returns all updated Points of Sale
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getUpdated(n, t, r) {
      return (0, i.PointofsaleApiFp)(this.configuration).getUpdated(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(n, t, r) {
      return (0, i.PointofsaleApiFp)(this.configuration).updatePointOfSale(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.PointofsaleApi = It;
  const Dt = function(l) {
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProductCategory", "productCategory", n);
        const r = "/productcategories", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/productcategories", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProductCategory", "id", n);
        const r = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductCategory", "id", n), (0, e.assertParamExists)("updateProductCategory", "productCategory", t);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.ProductCategoriesApiAxiosParamCreator = Dt;
  const kt = function(l) {
    const n = (0, i.ProductCategoriesApiAxiosParamCreator)(l);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createProductCategory(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllProductCategories(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleProductCategory(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateProductCategory(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.ProductCategoriesApiFp = kt;
  const zt = function(l, n, t) {
    const r = (0, i.ProductCategoriesApiFp)(l);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(a, s) {
        return r.createProductCategory(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(a, s, o) {
        return r.getAllProductCategories(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(a, s) {
        return r.getSingleProductCategory(a, s).then((o) => o(t, n));
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(a, s, o) {
        return r.updateProductCategory(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.ProductCategoriesApiFactory = zt;
  class xt extends p.BaseAPI {
    /**
     *  Post a new productCategory.
     * @param {ProductCategoryRequest} productCategory The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(n, t) {
      return (0, i.ProductCategoriesApiFp)(this.configuration).createProductCategory(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing productcategories
     * @param {number} [take] How many product categories the endpoint should return
     * @param {number} [skip] How many product categories should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getAllProductCategories(n, t, r) {
      return (0, i.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(n, t) {
      return (0, i.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} productCategory The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(n, t, r) {
      return (0, i.ProductCategoriesApiFp)(this.configuration).updateProductCategory(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.ProductCategoriesApi = xt;
  const Nt = function(l) {
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveProduct", "id", n);
        const r = "/products/{id}/approve".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProduct", "product", n);
        const r = "/products", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/products", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProduct", "id", n);
        const r = "/products/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUpdateProduct", "id", n);
        const r = "/products/{id}/update".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/products/updated", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProduct", "id", n), (0, e.assertParamExists)("updateProduct", "product", t);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductImage", "id", n);
        const a = "/products/{id}/image".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, o), r), h = {}, A = {}, O = new (l && l.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), t !== void 0 && O.append("file", t), h["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(s, A);
        let b = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), b), r.headers), d.data = O, {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.ProductsApiAxiosParamCreator = Nt;
  const Kt = function(l) {
    const n = (0, i.ProductsApiAxiosParamCreator)(l);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.approveProduct(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createProduct(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllProducts(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleProduct(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getUpdateProduct(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getUpdatedProducts(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateProduct(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateProductImage(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.ProductsApiFp = Kt;
  const Gt = function(l, n, t) {
    const r = (0, i.ProductsApiFp)(l);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(a, s) {
        return r.approveProduct(a, s).then((o) => o(t, n));
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(a, s) {
        return r.createProduct(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(a, s, o) {
        return r.getAllProducts(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(a, s) {
        return r.getSingleProduct(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(a, s) {
        return r.getUpdateProduct(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(a, s, o) {
        return r.getUpdatedProducts(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(a, s, o) {
        return r.updateProduct(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(a, s, o) {
        return r.updateProductImage(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.ProductsApiFactory = Gt;
  class Qt extends p.BaseAPI {
    /**
     *  Approve a product update.
     * @param {number} id The id of the product update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    approveProduct(n, t) {
      return (0, i.ProductsApiFp)(this.configuration).approveProduct(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Create a new product.
     * @param {CreateProductRequest} product The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(n, t) {
      return (0, i.ProductsApiFp)(this.configuration).createProduct(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getAllProducts(n, t, r) {
      return (0, i.ProductsApiFp)(this.configuration).getAllProducts(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(n, t) {
      return (0, i.ProductsApiFp)(this.configuration).getSingleProduct(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdateProduct(n, t) {
      return (0, i.ProductsApiFp)(this.configuration).getUpdateProduct(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all updated products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdatedProducts(n, t, r) {
      return (0, i.ProductsApiFp)(this.configuration).getUpdatedProducts(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} product The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(n, t, r) {
      return (0, i.ProductsApiFp)(this.configuration).updateProduct(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Upload a new image for a product
     * @param {number} id The id of the product which should be returned
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProductImage(n, t, r) {
      return (0, i.ProductsApiFp)(this.configuration).updateProductImage(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.ProductsApi = Qt;
  const Yt = function(l) {
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/rbac/roles", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), n), o = {}, d = {};
        yield (0, e.setApiKeyToObject)(o, "Authorization", l), (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      })
    };
  };
  i.RbacApiAxiosParamCreator = Yt;
  const $t = function(l) {
    const n = (0, i.RbacApiAxiosParamCreator)(l);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.getAllRoles(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.RbacApiFp = $t;
  const Wt = function(l, n, t) {
    const r = (0, i.RbacApiFp)(l);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(a) {
        return r.getAllRoles(a).then((s) => s(t, n));
      }
    };
  };
  i.RbacApiFactory = Wt;
  class Jt extends p.BaseAPI {
    /**
     *  Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(n) {
      return (0, i.RbacApiFp)(this.configuration).getAllRoles(n).then((t) => t(this.axios, this.basePath));
    }
  }
  i.RbacApi = Jt;
  const Xt = function(l) {
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/ping", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), n), o = {}, d = {};
        (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      })
    };
  };
  i.RootApiAxiosParamCreator = Xt;
  const Zt = function(l) {
    const n = (0, i.RootApiAxiosParamCreator)(l);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.ping(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.RootApiFp = Zt;
  const es = function(l, n, t) {
    const r = (0, i.RootApiFp)(l);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(a) {
        return r.ping(a).then((s) => s(t, n));
      }
    };
  };
  i.RootApiFactory = es;
  class ts extends p.BaseAPI {
    /**
     *  Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(n) {
      return (0, i.RootApiFp)(this.configuration).ping(n).then((t) => t(this.axios, this.basePath));
    }
  }
  i.RootApi = ts;
  const ss = function(l) {
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deposit", "stripe", n);
        const r = "/stripe/deposit", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/stripe/webhook", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), n), o = {}, d = {};
        (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      })
    };
  };
  i.StripeApiAxiosParamCreator = ss;
  const as = function(l) {
    const n = (0, i.StripeApiAxiosParamCreator)(l);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deposit(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.webhook(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.StripeApiFp = as;
  const rs = function(l, n, t) {
    const r = (0, i.StripeApiFp)(l);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(a, s) {
        return r.deposit(a, s).then((o) => o(t, n));
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(a) {
        return r.webhook(a).then((s) => s(t, n));
      }
    };
  };
  i.StripeApiFactory = rs;
  class ns extends p.BaseAPI {
    /**
     *  Start the stripe deposit flow
     * @param {StripeRequest} stripe The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(n, t) {
      return (0, i.StripeApiFp)(this.configuration).deposit(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Webhook for Stripe event updates
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    webhook(n) {
      return (0, i.StripeApiFp)(this.configuration).webhook(n).then((t) => t(this.axios, this.basePath));
    }
  }
  i.StripeApi = ns;
  const is = function(l) {
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (n = {}) => c(this, void 0, void 0, function* () {
        const t = "/test/helloworld", r = new URL(t, e.DUMMY_BASE_URL);
        let a;
        l && (a = l.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), n), o = {}, d = {};
        yield (0, e.setApiKeyToObject)(o, "Authorization", l), (0, e.setSearchParams)(r, d);
        let h = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, o), h), n.headers), {
          url: (0, e.toPathString)(r),
          options: s
        };
      })
    };
  };
  i.TestApiAxiosParamCreator = is;
  const os = function(l) {
    const n = (0, i.TestApiAxiosParamCreator)(l);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(t) {
        return c(this, void 0, void 0, function* () {
          const r = yield n.helloworld(t);
          return (0, e.createRequestFunction)(r, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.TestApiFp = os;
  const cs = function(l, n, t) {
    const r = (0, i.TestApiFp)(l);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(a) {
        return r.helloworld(a).then((s) => s(t, n));
      }
    };
  };
  i.TestApiFactory = cs;
  class ls extends p.BaseAPI {
    /**
     *  Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestApi
     */
    helloworld(n) {
      return (0, i.TestApiFp)(this.configuration).helloworld(n).then((t) => t(this.axios, this.basePath));
    }
  }
  i.TestApi = ls;
  const ds = function(l) {
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransaction", "transaction", n);
        const r = "/transactions", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteTransaction", "id", n);
        const r = "/transactions/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllTransactions: (n, t, r, a, s, o, d, h, A, O, b = {}) => c(this, void 0, void 0, function* () {
        const F = "/transactions", j = new URL(F, e.DUMMY_BASE_URL);
        let V;
        l && (V = l.baseOptions);
        const I = Object.assign(Object.assign({ method: "GET" }, V), b), X = {}, _ = {};
        yield (0, e.setApiKeyToObject)(X, "Authorization", l), n !== void 0 && (_.fromId = n), t !== void 0 && (_.createdById = t), r !== void 0 && (_.toId = r), a !== void 0 && (_.pointOfSaleId = a), s !== void 0 && (_.productId = s), o !== void 0 && (_.productRevision = o), d !== void 0 && (_.fromDate = d), h !== void 0 && (_.tillDate = h), A !== void 0 && (_.take = A), O !== void 0 && (_.skip = O), (0, e.setSearchParams)(j, _);
        let Pe = V && V.headers ? V.headers : {};
        return I.headers = Object.assign(Object.assign(Object.assign({}, X), Pe), b.headers), {
          url: (0, e.toPathString)(j),
          options: I
        };
      }),
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransaction", "id", n);
        const r = "/transactions/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateTransaction", "id", n), (0, e.assertParamExists)("updateTransaction", "transaction", t);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("validateTransaction", "transaction", n);
        const r = "/transactions/validate", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      })
    };
  };
  i.TransactionsApiAxiosParamCreator = ds;
  const us = function(l) {
    const n = (0, i.TransactionsApiAxiosParamCreator)(l);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createTransaction(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteTransaction(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllTransactions(t, r, a, s, o, d, h, A, O, b, F) {
        return c(this, void 0, void 0, function* () {
          const j = yield n.getAllTransactions(t, r, a, s, o, d, h, A, O, b, F);
          return (0, e.createRequestFunction)(j, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleTransaction(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateTransaction(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.validateTransaction(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.TransactionsApiFp = us;
  const hs = function(l, n, t) {
    const r = (0, i.TransactionsApiFp)(l);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(a, s) {
        return r.createTransaction(a, s).then((o) => o(t, n));
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(a, s) {
        return r.deleteTransaction(a, s).then((o) => o(t, n));
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
      getAllTransactions(a, s, o, d, h, A, O, b, F, j, V) {
        return r.getAllTransactions(a, s, o, d, h, A, O, b, F, j, V).then((I) => I(t, n));
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(a, s) {
        return r.getSingleTransaction(a, s).then((o) => o(t, n));
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(a, s, o) {
        return r.updateTransaction(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(a, s) {
        return r.validateTransaction(a, s).then((o) => o(t, n));
      }
    };
  };
  i.TransactionsApiFactory = hs;
  class ps extends p.BaseAPI {
    /**
     *  Creates a new transaction
     * @param {TransactionRequest} transaction The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(n, t) {
      return (0, i.TransactionsApiFp)(this.configuration).createTransaction(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(n, t) {
      return (0, i.TransactionsApiFp)(this.configuration).deleteTransaction(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllTransactions(n, t, r, a, s, o, d, h, A, O, b) {
      return (0, i.TransactionsApiFp)(this.configuration).getAllTransactions(n, t, r, a, s, o, d, h, A, O, b).then((F) => F(this.axios, this.basePath));
    }
    /**
     *  Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(n, t) {
      return (0, i.TransactionsApiFp)(this.configuration).getSingleTransaction(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} transaction The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(n, t, r) {
      return (0, i.TransactionsApiFp)(this.configuration).updateTransaction(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transaction The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(n, t) {
      return (0, i.TransactionsApiFp)(this.configuration).validateTransaction(n, t).then((r) => r(this.axios, this.basePath));
    }
  }
  i.TransactionsApi = ps;
  const As = function(l) {
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransfer", "transfer", n);
        const r = "/transfers", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        const a = "/transfers", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.take = n), t !== void 0 && (A.skip = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransfer", "id", n);
        const r = "/transfers/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      })
    };
  };
  i.TransfersApiAxiosParamCreator = As;
  const Os = function(l) {
    const n = (0, i.TransfersApiAxiosParamCreator)(l);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createTransfer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getAllTransfers(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleTransfer(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.TransfersApiFp = Os;
  const Ps = function(l, n, t) {
    const r = (0, i.TransfersApiFp)(l);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(a, s) {
        return r.createTransfer(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(a, s, o) {
        return r.getAllTransfers(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(a, s) {
        return r.getSingleTransfer(a, s).then((o) => o(t, n));
      }
    };
  };
  i.TransfersApiFactory = Ps;
  class gs extends p.BaseAPI {
    /**
     *  Post a new transfer.
     * @param {TransferRequest} transfer The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(n, t) {
      return (0, i.TransfersApiFp)(this.configuration).createTransfer(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getAllTransfers(n, t, r) {
      return (0, i.TransfersApiFp)(this.configuration).getAllTransfers(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(n, t) {
      return (0, i.TransfersApiFp)(this.configuration).getSingleTransfer(n, t).then((r) => r(this.axios, this.basePath));
    }
  }
  i.TransfersApi = gs;
  const fs = function(l) {
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("acceptTos", "params", n);
        const r = "/users/acceptTos", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("authenticateAs", "id", n);
        const r = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createUser", "user", n);
        const r = "/users", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUser", "id", n);
        const r = "/users/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserKey", "id", n);
        const r = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserNfc", "id", n);
        const r = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "DELETE" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllUsers: (n, t, r, a, s, o, d, h = {}) => c(this, void 0, void 0, function* () {
        const A = "/users", O = new URL(A, e.DUMMY_BASE_URL);
        let b;
        l && (b = l.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, b), h), j = {}, V = {};
        yield (0, e.setApiKeyToObject)(j, "Authorization", l), n !== void 0 && (V.take = n), t !== void 0 && (V.skip = t), r !== void 0 && (V.search = r), a !== void 0 && (V.active = a), s !== void 0 && (V.ofAge = s), o !== void 0 && (V.id = o), d !== void 0 && (V.type = d), (0, e.setSearchParams)(O, V);
        let I = b && b.headers ? b.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, j), I), h.headers), {
          url: (0, e.toPathString)(O),
          options: F
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
      getAllUsersOfUserType: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", n);
        const s = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getIndividualUser", "id", n);
        const r = "/users/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getOrganMembers", "id", n);
        const r = "/users/{id}/members".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", n);
        const r = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserRoles", "id", n);
        const r = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getUsersContainers: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersContainers", "id", n);
        const s = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getUsersFinancialMutations: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", n);
        const s = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getUsersPointsOfSale: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", n);
        const s = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", n);
        const r = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
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
      getUsersProducts: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProducts", "id", n);
        const s = "/users/{id}/products".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getUsersTransactions: (n, t, r, a, s, o, d, h, A, O, b = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactions", "id", n);
        const F = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(n))), j = new URL(F, e.DUMMY_BASE_URL);
        let V;
        l && (V = l.baseOptions);
        const I = Object.assign(Object.assign({ method: "GET" }, V), b), X = {}, _ = {};
        yield (0, e.setApiKeyToObject)(X, "Authorization", l), t !== void 0 && (_.fromId = t), r !== void 0 && (_.createdById = r), a !== void 0 && (_.toId = a), s !== void 0 && (_.productId = s), o !== void 0 && (_.productRevision = o), d !== void 0 && (_.fromDate = d), h !== void 0 && (_.tillDate = h), A !== void 0 && (_.take = A), O !== void 0 && (_.skip = O), (0, e.setSearchParams)(j, _);
        let Pe = V && V.headers ? V.headers : {};
        return I.headers = Object.assign(Object.assign(Object.assign({}, X), Pe), b.headers), {
          url: (0, e.toPathString)(j),
          options: I
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
      getUsersTransactionsReport: (n, t, r, a, s, o, d = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", n);
        const h = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(n))), A = new URL(h, e.DUMMY_BASE_URL);
        let O;
        l && (O = l.baseOptions);
        const b = Object.assign(Object.assign({ method: "GET" }, O), d), F = {}, j = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", l), t !== void 0 && (j.fromDate = t), r !== void 0 && (j.tillDate = r), a !== void 0 && (j.fromId = a), s !== void 0 && (j.toId = s), o !== void 0 && (j.exclusiveToId = o), (0, e.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return b.headers = Object.assign(Object.assign(Object.assign({}, F), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: b
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
      getUsersTransfers: (n, t, r, a, s, o, d = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransfers", "id", n);
        const h = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(n))), A = new URL(h, e.DUMMY_BASE_URL);
        let O;
        l && (O = l.baseOptions);
        const b = Object.assign(Object.assign({ method: "GET" }, O), d), F = {}, j = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", l), t !== void 0 && (j.take = t), r !== void 0 && (j.skip = r), a !== void 0 && (j.fromId = a), s !== void 0 && (j.toId = s), o !== void 0 && (j.id = o), (0, e.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return b.headers = Object.assign(Object.assign(Object.assign({}, F), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: b
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
      getUsersUpdatedContainers: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedContainers", "id", n);
        const s = "/users/{id}/containers/updated".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getUsersUpdatedPointsOfSale: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedPointsOfSale", "id", n);
        const s = "/users/{id}/pointsofsale/updated".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
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
      getUsersUpdatedProducts: (n, t, r, a = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedProducts", "id", n);
        const s = "/users/{id}/products/updated".replace("{id}", encodeURIComponent(String(n))), o = new URL(s, e.DUMMY_BASE_URL);
        let d;
        l && (d = l.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, O = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", l), t !== void 0 && (O.take = t), r !== void 0 && (O.skip = r), (0, e.setSearchParams)(o, O);
        let b = d && d.headers ? d.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, A), b), a.headers), {
          url: (0, e.toPathString)(o),
          options: h
        };
      }),
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUser", "id", n), (0, e.assertParamExists)("updateUser", "user", t);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserKey", "id", n);
        const r = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", n), (0, e.assertParamExists)("updateUserLocalPassword", "update", t);
        const a = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserNfc", "id", n), (0, e.assertParamExists)("updateUserNfc", "update", t);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserPin", "id", n), (0, e.assertParamExists)("updateUserPin", "update", t);
        const a = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.UsersApiAxiosParamCreator = fs;
  const bs = function(l) {
    const n = (0, i.UsersApiAxiosParamCreator)(l);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.acceptTos(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.authenticateAs(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createUser(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteUser(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteUserKey(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.deleteUserNfc(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllUsers(t, r, a, s, o, d, h, A) {
        return c(this, void 0, void 0, function* () {
          const O = yield n.getAllUsers(t, r, a, s, o, d, h, A);
          return (0, e.createRequestFunction)(O, u.default, p.BASE_PATH, l);
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
      getAllUsersOfUserType(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getAllUsersOfUserType(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getIndividualUser(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getOrganMembers(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getUserAuthenticatable(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getUserRoles(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getUsersContainers(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersContainers(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getUsersFinancialMutations(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersFinancialMutations(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getUsersPointsOfSale(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersPointsOfSale(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getUsersProcessingDeposits(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getUsersProducts(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersProducts(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getUsersTransactions(t, r, a, s, o, d, h, A, O, b, F) {
        return c(this, void 0, void 0, function* () {
          const j = yield n.getUsersTransactions(t, r, a, s, o, d, h, A, O, b, F);
          return (0, e.createRequestFunction)(j, u.default, p.BASE_PATH, l);
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
      getUsersTransactionsReport(t, r, a, s, o, d, h) {
        return c(this, void 0, void 0, function* () {
          const A = yield n.getUsersTransactionsReport(t, r, a, s, o, d, h);
          return (0, e.createRequestFunction)(A, u.default, p.BASE_PATH, l);
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
      getUsersTransfers(t, r, a, s, o, d, h) {
        return c(this, void 0, void 0, function* () {
          const A = yield n.getUsersTransfers(t, r, a, s, o, d, h);
          return (0, e.createRequestFunction)(A, u.default, p.BASE_PATH, l);
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
      getUsersUpdatedContainers(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersUpdatedContainers(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getUsersUpdatedPointsOfSale(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersUpdatedPointsOfSale(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
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
      getUsersUpdatedProducts(t, r, a, s) {
        return c(this, void 0, void 0, function* () {
          const o = yield n.getUsersUpdatedProducts(t, r, a, s);
          return (0, e.createRequestFunction)(o, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateUser(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.updateUserKey(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateUserLocalPassword(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateUserNfc(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateUserPin(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.UsersApiFp = bs;
  const ms = function(l, n, t) {
    const r = (0, i.UsersApiFp)(l);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(a, s) {
        return r.acceptTos(a, s).then((o) => o(t, n));
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(a, s) {
        return r.authenticateAs(a, s).then((o) => o(t, n));
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(a, s) {
        return r.createUser(a, s).then((o) => o(t, n));
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(a, s) {
        return r.deleteUser(a, s).then((o) => o(t, n));
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(a, s) {
        return r.deleteUserKey(a, s).then((o) => o(t, n));
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(a, s) {
        return r.deleteUserNfc(a, s).then((o) => o(t, n));
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
      getAllUsers(a, s, o, d, h, A, O, b) {
        return r.getAllUsers(a, s, o, d, h, A, O, b).then((F) => F(t, n));
      },
      /**
       *  Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(a, s, o, d) {
        return r.getAllUsersOfUserType(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(a, s) {
        return r.getIndividualUser(a, s).then((o) => o(t, n));
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(a, s) {
        return r.getOrganMembers(a, s).then((o) => o(t, n));
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(a, s) {
        return r.getUserAuthenticatable(a, s).then((o) => o(t, n));
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(a, s) {
        return r.getUserRoles(a, s).then((o) => o(t, n));
      },
      /**
       *  Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(a, s, o, d) {
        return r.getUsersContainers(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(a, s, o, d) {
        return r.getUsersFinancialMutations(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(a, s, o, d) {
        return r.getUsersPointsOfSale(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(a, s) {
        return r.getUsersProcessingDeposits(a, s).then((o) => o(t, n));
      },
      /**
       *  Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(a, s, o, d) {
        return r.getUsersProducts(a, s, o, d).then((h) => h(t, n));
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
      getUsersTransactions(a, s, o, d, h, A, O, b, F, j, V) {
        return r.getUsersTransactions(a, s, o, d, h, A, O, b, F, j, V).then((I) => I(t, n));
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
      getUsersTransactionsReport(a, s, o, d, h, A, O) {
        return r.getUsersTransactionsReport(a, s, o, d, h, A, O).then((b) => b(t, n));
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
      getUsersTransfers(a, s, o, d, h, A, O) {
        return r.getUsersTransfers(a, s, o, d, h, A, O).then((b) => b(t, n));
      },
      /**
       *  Returns the user\'s updated containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedContainers(a, s, o, d) {
        return r.getUsersUpdatedContainers(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Returns the user\'s updated Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedPointsOfSale(a, s, o, d) {
        return r.getUsersUpdatedPointsOfSale(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Get an user\'s updated products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedProducts(a, s, o, d) {
        return r.getUsersUpdatedProducts(a, s, o, d).then((h) => h(t, n));
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(a, s, o) {
        return r.updateUser(a, s, o).then((d) => d(t, n));
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(a, s) {
        return r.updateUserKey(a, s).then((o) => o(t, n));
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(a, s, o) {
        return r.updateUserLocalPassword(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(a, s, o) {
        return r.updateUserNfc(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(a, s, o) {
        return r.updateUserPin(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.UsersApiFactory = ms;
  class Ss extends p.BaseAPI {
    /**
     *  Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(n, t) {
      return (0, i.UsersApiFp)(this.configuration).acceptTos(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(n, t) {
      return (0, i.UsersApiFp)(this.configuration).authenticateAs(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Create a new user
     * @param {CreateUserRequest} user The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(n, t) {
      return (0, i.UsersApiFp)(this.configuration).createUser(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(n, t) {
      return (0, i.UsersApiFp)(this.configuration).deleteUser(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(n, t) {
      return (0, i.UsersApiFp)(this.configuration).deleteUserKey(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(n, t) {
      return (0, i.UsersApiFp)(this.configuration).deleteUserNfc(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllUsers(n, t, r, a, s, o, d, h) {
      return (0, i.UsersApiFp)(this.configuration).getAllUsers(n, t, r, a, s, o, d, h).then((A) => A(this.axios, this.basePath));
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
    getAllUsersOfUserType(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getAllUsersOfUserType(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(n, t) {
      return (0, i.UsersApiFp)(this.configuration).getIndividualUser(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get an organs members
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getOrganMembers(n, t) {
      return (0, i.UsersApiFp)(this.configuration).getOrganMembers(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(n, t) {
      return (0, i.UsersApiFp)(this.configuration).getUserAuthenticatable(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(n, t) {
      return (0, i.UsersApiFp)(this.configuration).getUserRoles(n, t).then((r) => r(this.axios, this.basePath));
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
    getUsersContainers(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersContainers(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getUsersFinancialMutations(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersFinancialMutations(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getUsersPointsOfSale(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersPointsOfSale(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(n, t) {
      return (0, i.UsersApiFp)(this.configuration).getUsersProcessingDeposits(n, t).then((r) => r(this.axios, this.basePath));
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
    getUsersProducts(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersProducts(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getUsersTransactions(n, t, r, a, s, o, d, h, A, O, b) {
      return (0, i.UsersApiFp)(this.configuration).getUsersTransactions(n, t, r, a, s, o, d, h, A, O, b).then((F) => F(this.axios, this.basePath));
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
    getUsersTransactionsReport(n, t, r, a, s, o, d) {
      return (0, i.UsersApiFp)(this.configuration).getUsersTransactionsReport(n, t, r, a, s, o, d).then((h) => h(this.axios, this.basePath));
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
    getUsersTransfers(n, t, r, a, s, o, d) {
      return (0, i.UsersApiFp)(this.configuration).getUsersTransfers(n, t, r, a, s, o, d).then((h) => h(this.axios, this.basePath));
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
    getUsersUpdatedContainers(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersUpdatedContainers(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getUsersUpdatedPointsOfSale(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersUpdatedPointsOfSale(n, t, r, a).then((s) => s(this.axios, this.basePath));
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
    getUsersUpdatedProducts(n, t, r, a) {
      return (0, i.UsersApiFp)(this.configuration).getUsersUpdatedProducts(n, t, r, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Update a user
     * @param {number} id The id of the user
     * @param {UpdateUserRequest} user The user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUser(n, t, r) {
      return (0, i.UsersApiFp)(this.configuration).updateUser(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(n, t) {
      return (0, i.UsersApiFp)(this.configuration).updateUserKey(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} update    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(n, t, r) {
      return (0, i.UsersApiFp)(this.configuration).updateUserLocalPassword(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} update    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(n, t, r) {
      return (0, i.UsersApiFp)(this.configuration).updateUserNfc(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} update    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(n, t, r) {
      return (0, i.UsersApiFp)(this.configuration).updateUserPin(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.UsersApi = Ss;
  const Us = function(l) {
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createVatGroup", "vatGroup", n);
        const r = "/vatgroups", a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "POST" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), o.data = (0, e.serializeDataIfNeeded)(n, o, l), {
          url: (0, e.toPathString)(a),
          options: o
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
      getAllVatGroups: (n, t, r, a, s, o, d = {}) => c(this, void 0, void 0, function* () {
        const h = "/vatgroups", A = new URL(h, e.DUMMY_BASE_URL);
        let O;
        l && (O = l.baseOptions);
        const b = Object.assign(Object.assign({ method: "GET" }, O), d), F = {}, j = {};
        yield (0, e.setApiKeyToObject)(F, "Authorization", l), n !== void 0 && (j.vatGroupId = n), t !== void 0 && (j.name = t), r !== void 0 && (j.percentage = r), a !== void 0 && (j.deleted = a), s !== void 0 && (j.take = s), o !== void 0 && (j.skip = o), (0, e.setSearchParams)(A, j);
        let V = O && O.headers ? O.headers : {};
        return b.headers = Object.assign(Object.assign(Object.assign({}, F), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: b
        };
      }),
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (n, t = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleVatGroup", "id", n);
        const r = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(n))), a = new URL(r, e.DUMMY_BASE_URL);
        let s;
        l && (s = l.baseOptions);
        const o = Object.assign(Object.assign({ method: "GET" }, s), t), d = {}, h = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", l), (0, e.setSearchParams)(a, h);
        let A = s && s.headers ? s.headers : {};
        return o.headers = Object.assign(Object.assign(Object.assign({}, d), A), t.headers), {
          url: (0, e.toPathString)(a),
          options: o
        };
      }),
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", n), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", t);
        const a = "/vatgroups/declaration", s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), n !== void 0 && (A.year = n), t !== void 0 && (A.period = t), (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), {
          url: (0, e.toPathString)(s),
          options: d
        };
      }),
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup: (n, t, r = {}) => c(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateVatGroup", "id", n), (0, e.assertParamExists)("updateVatGroup", "vatGroup", t);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(n))), s = new URL(a, e.DUMMY_BASE_URL);
        let o;
        l && (o = l.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, o), r), h = {}, A = {};
        yield (0, e.setApiKeyToObject)(h, "Authorization", l), h["Content-Type"] = "application/json", (0, e.setSearchParams)(s, A);
        let O = o && o.headers ? o.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, h), O), r.headers), d.data = (0, e.serializeDataIfNeeded)(t, d, l), {
          url: (0, e.toPathString)(s),
          options: d
        };
      })
    };
  };
  i.VatGroupsApiAxiosParamCreator = Us;
  const ys = function(l) {
    const n = (0, i.VatGroupsApiAxiosParamCreator)(l);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.createVatGroup(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
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
      getAllVatGroups(t, r, a, s, o, d, h) {
        return c(this, void 0, void 0, function* () {
          const A = yield n.getAllVatGroups(t, r, a, s, o, d, h);
          return (0, e.createRequestFunction)(A, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(t, r) {
        return c(this, void 0, void 0, function* () {
          const a = yield n.getSingleVatGroup(t, r);
          return (0, e.createRequestFunction)(a, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.getVatDeclarationAmounts(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(t, r, a) {
        return c(this, void 0, void 0, function* () {
          const s = yield n.updateVatGroup(t, r, a);
          return (0, e.createRequestFunction)(s, u.default, p.BASE_PATH, l);
        });
      }
    };
  };
  i.VatGroupsApiFp = ys;
  const js = function(l, n, t) {
    const r = (0, i.VatGroupsApiFp)(l);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(a, s) {
        return r.createVatGroup(a, s).then((o) => o(t, n));
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
      getAllVatGroups(a, s, o, d, h, A, O) {
        return r.getAllVatGroups(a, s, o, d, h, A, O).then((b) => b(t, n));
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(a, s) {
        return r.getSingleVatGroup(a, s).then((o) => o(t, n));
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(a, s, o) {
        return r.getVatDeclarationAmounts(a, s, o).then((d) => d(t, n));
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(a, s, o) {
        return r.updateVatGroup(a, s, o).then((d) => d(t, n));
      }
    };
  };
  i.VatGroupsApiFactory = js;
  class Vs extends p.BaseAPI {
    /**
     *  Create a new VAT group
     * @param {VatGroupRequest} vatGroup The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(n, t) {
      return (0, i.VatGroupsApiFp)(this.configuration).createVatGroup(n, t).then((r) => r(this.axios, this.basePath));
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
    getAllVatGroups(n, t, r, a, s, o, d) {
      return (0, i.VatGroupsApiFp)(this.configuration).getAllVatGroups(n, t, r, a, s, o, d).then((h) => h(this.axios, this.basePath));
    }
    /**
     *  Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(n, t) {
      return (0, i.VatGroupsApiFp)(this.configuration).getSingleVatGroup(n, t).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get the VAT collections needed for VAT declarations
     * @param {number} year Calendar year for VAT declarations
     * @param {string} period Period for VAT declarations
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getVatDeclarationAmounts(n, t, r) {
      return (0, i.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(n, t, r).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} vatGroup The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(n, t, r) {
      return (0, i.VatGroupsApiFp)(this.configuration).updateVatGroup(n, t, r).then((a) => a(this.axios, this.basePath));
    }
  }
  i.VatGroupsApi = Vs;
})(Je);
var Ae = {};
Object.defineProperty(Ae, "__esModule", { value: !0 });
Ae.Configuration = void 0;
class Rr {
  constructor(c = {}) {
    this.apiKey = c.apiKey, this.username = c.username, this.password = c.password, this.accessToken = c.accessToken, this.basePath = c.basePath, this.baseOptions = c.baseOptions, this.formDataCtor = c.formDataCtor;
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
  isJsonMime(c) {
    const u = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return c !== null && (u.test(c) || c.toLowerCase() === "application/json-patch+json");
  }
}
Ae.Configuration = Rr;
(function(i) {
  var c = Y && Y.__createBinding || (Object.create ? function(e, p, P, g) {
    g === void 0 && (g = P);
    var m = Object.getOwnPropertyDescriptor(p, P);
    (!m || ("get" in m ? !p.__esModule : m.writable || m.configurable)) && (m = { enumerable: !0, get: function() {
      return p[P];
    } }), Object.defineProperty(e, g, m);
  } : function(e, p, P, g) {
    g === void 0 && (g = P), e[g] = p[P];
  }), u = Y && Y.__exportStar || function(e, p) {
    for (var P in e)
      P !== "default" && !Object.prototype.hasOwnProperty.call(p, P) && c(p, e, P);
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), u(Je, i), u(Ae, i);
})(w);
const H = Ce.create();
H.interceptors.response.use((i) => (Bs(i), i));
class _r {
  constructor(c) {
    q(this, "_authenticateApi");
    q(this, "_balanceApi");
    q(this, "_usersApi");
    q(this, "_posApi");
    q(this, "_categoryApi");
    q(this, "_transactionApi");
    q(this, "_bannerApi");
    q(this, "_rootApi");
    q(this, "_borrelkaartApi");
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
    const u = new w.Configuration({
      apiKey: () => `Bearer ${Te().token}`
    });
    this._authenticateApi = new w.AuthenticateApi(u, c, H), this._balanceApi = new w.BalanceApi(u, c, H), this._usersApi = new w.UsersApi(u, c, H), this._posApi = new w.PointofsaleApi(u, c, H), this._categoryApi = new w.ProductCategoriesApi(u, c, H), this._transactionApi = new w.TransactionsApi(u, c, H), this._bannerApi = new w.BannersApi(u, c, H), this._openBannerApi = new w.BannersApi(void 0, c, H), this._rootApi = new w.RootApi(), this._borrelkaartApi = new w.BorrelkaartgroupsApi(u, c, H), this._containerApi = new w.ContainersApi(u, c, H), this._filesApi = new w.FilesApi(u, c, H), this._invoicesApi = new w.InvoicesApi(u, c, H), this._payoutsApi = new w.PayoutRequestsApi(u, c, H), this._productsApi = new w.ProductsApi(u, c, H), this._transfersApi = new w.TransfersApi(u, c, H), this._vatGroupsApi = new w.VatGroupsApi(u, c, H), this._stripeApi = new w.StripeApi(u, c, H), this._rbacApi = new w.RbacApi(u, c, H);
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
export {
  _r as ApiService,
  _s as clearTokenInStorage,
  vs as fetchAllPages,
  Te as getTokenFromStorage,
  Ls as isAuthenticated,
  ws as isTokenExpired,
  Cs as parseToken,
  vr as populateStoresFromToken,
  We as setTokenInStorage,
  Bs as updateTokenIfNecessary,
  qs as useAuthStore,
  Ye as useUserStore
};
