var Zs = Object.defineProperty;
var ea = (o, c, v) => c in o ? Zs(o, c, { enumerable: !0, configurable: !0, writable: !0, value: v }) : o[c] = v;
var $ = (o, c, v) => ea(o, typeof c != "symbol" ? c + "" : c, v);
import { createPinia as ta, defineStore as ht } from "pinia";
async function sa(o, c, v) {
  let e = o, O = [];
  for (; ; ) {
    const m = await v(c, e), { records: f } = m.data;
    if (O = O.concat(f), e += c, m.data._pagination.count <= e + c)
      break;
  }
  return O;
}
ta();
const pt = ht("user", {
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
      },
      createdTransactions: {
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
    getUserById: (o) => (c) => o.users.find((v) => v.id === c),
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
      this.users = await sa(
        0,
        500,
        (c, v) => o.user.getAllUsers(c, v)
      );
    },
    async fetchCurrentUserBalance(o, c) {
      this.current.balance = (await c.balance.getBalanceId(o)).data;
    },
    async fetchUsersFinancialMutations(o, c, v, e) {
      this.current.financialMutations = (await c.user.getUsersFinancialMutations(o, v, e)).data;
    },
    async fetchUserCreatedTransactions(o, c, v, e) {
      this.current.createdTransactions = (await c.transaction.getAllTransactions(void 0, o, void 0, void 0, void 0, void 0, void 0, void 0, v, e)).data;
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
      const c = this.users.findIndex((v) => v.id === o);
      c !== -1 && this.users.splice(c, 1);
    }
  }
});
class be extends Error {
}
be.prototype.name = "InvalidTokenError";
function aa(o) {
  return decodeURIComponent(atob(o).replace(/(.)/g, (c, v) => {
    let e = v.charCodeAt(0).toString(16).toUpperCase();
    return e.length < 2 && (e = "0" + e), "%" + e;
  }));
}
function ra(o) {
  let c = o.replace(/-/g, "+").replace(/_/g, "/");
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
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return aa(c);
  } catch {
    return atob(c);
  }
}
function At(o, c) {
  if (typeof o != "string")
    throw new be("Invalid token specified: must be a string");
  c || (c = {});
  const v = c.header === !0 ? 0 : 1, e = o.split(".")[v];
  if (typeof e != "string")
    throw new be(`Invalid token specified: missing part #${v + 1}`);
  let O;
  try {
    O = ra(e);
  } catch (m) {
    throw new be(`Invalid token specified: invalid base64 for part #${v + 1} (${m.message})`);
  }
  try {
    return JSON.parse(O);
  } catch (m) {
    throw new be(`Invalid token specified: invalid json for part #${v + 1} (${m.message})`);
  }
}
function na(o) {
  if (o.headers.has("Set-Authorization")) {
    const c = o.headers.get("Set-Authorization");
    c && vt(c);
  }
}
function ia() {
  localStorage.clear();
}
function oa(o) {
  const c = String(At(o).exp);
  return { token: o, expires: c };
}
function vt(o) {
  localStorage.setItem("jwt_token", JSON.stringify(oa(o)));
}
function Ye() {
  const o = localStorage.getItem("jwt_token");
  let c = {};
  return o !== null && (c = JSON.parse(o)), {
    ...c
  };
}
function la(o) {
  if (o > 1e12) return !0;
  const c = o * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > c;
}
function ca() {
  const o = Ye();
  return !o.token || !o.expires ? !1 : !la(Number(o.expires));
}
function On(o) {
  if (ca()) {
    const v = da();
    v.extractStateFromToken();
    const e = v.getUser;
    if (e) {
      const O = pt();
      O.setCurrentUser(e), O.fetchCurrentUserBalance(e.id, o);
    }
  }
}
const da = ht({
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
    handleResponse(o, c) {
      const { user: v, token: e, roles: O, organs: m, acceptedToS: f } = o;
      !v || !e || !O || !m || !f || (this.user = v, this.token = e, vt(this.token), this.roles = O, this.organs = m, this.acceptedToS = f, this.acceptedToS === "ACCEPTED" && c.user.getIndividualUser(this.user.id).then((j) => {
        pt().setCurrentUser(j.data);
      }));
    },
    async gewisPinlogin(o, c, v) {
      const e = {
        gewisId: parseInt(o, 10),
        pin: c
      };
      await v.authenticate.gewisPinAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async ldapLogin(o, c, v) {
      const e = {
        accountName: o,
        password: c
      };
      await v.authenticate.ldapAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async gewisWebLogin(o, c, v) {
      const e = {
        nonce: o,
        token: c
      };
      await v.authenticate.gewisWebAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async externalPinLogin(o, c, v) {
      const e = {
        pin: c,
        userId: o
      };
      await v.authenticate.pinAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async eanLogin(o, c) {
      const v = {
        eanCode: o
      };
      await c.authenticate.eanAuthentication(v).then((e) => {
        this.handleResponse(e.data, c);
      });
    },
    async apiKeyLogin(o, c, v) {
      const e = {
        key: o,
        userId: c
      };
      await v.authenticate.keyAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async gewisLdapLogin(o, c, v) {
      const e = {
        accountName: o,
        password: c
      };
      await v.authenticate.gewisLDAPAuthentication(e).then((O) => {
        this.handleResponse(O.data, v);
      });
    },
    async updateUserPin(o, c) {
      if (!this.user) return;
      const v = {
        pin: o
      };
      await c.user.updateUserPin(this.user.id, v);
    },
    async updateUserLocalPassword(o, c) {
      if (!this.user) return;
      const v = {
        password: o
      };
      await c.user.updateUserLocalPassword(this.user.id, v);
    },
    async updateUserNfc(o, c) {
      if (!this.user) return;
      const v = {
        nfcCode: o
      };
      await c.user.updateUserNfc(this.user.id, v);
    },
    async updateUserKey(o) {
      if (this.user)
        return (await o.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(o, c) {
      if (!this.user) return;
      const v = {
        extensiveDataProcessing: o
      };
      await c.user.acceptTos(v);
      const e = await c.authenticate.refreshToken();
      this.handleResponse(e.data, c);
    },
    extractStateFromToken() {
      const o = Ye();
      if (!o.token) return;
      const c = At(o.token);
      this.user = c.user, this.roles = c.roles, this.token = o.token, this.organs = c.organs, this.acceptedToS = c.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, ia();
    }
  }
});
var de = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ua(o) {
  if (o.__esModule) return o;
  var c = o.default;
  if (typeof c == "function") {
    var v = function e() {
      return this instanceof e ? Reflect.construct(c, arguments, this.constructor) : c.apply(this, arguments);
    };
    v.prototype = c.prototype;
  } else v = {};
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
var G = {}, Ot = {};
function Pt(o, c) {
  return function() {
    return o.apply(c, arguments);
  };
}
const { toString: ha } = Object.prototype, { getPrototypeOf: $e } = Object, Ve = /* @__PURE__ */ ((o) => (c) => {
  const v = ha.call(c);
  return o[v] || (o[v] = v.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), ne = (o) => (o = o.toLowerCase(), (c) => Ve(c) === o), Re = (o) => (c) => typeof c === o, { isArray: ve } = Array, me = Re("undefined");
function pa(o) {
  return o !== null && !me(o) && o.constructor !== null && !me(o.constructor) && te(o.constructor.isBuffer) && o.constructor.isBuffer(o);
}
const bt = ne("ArrayBuffer");
function Aa(o) {
  let c;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? c = ArrayBuffer.isView(o) : c = o && o.buffer && bt(o.buffer), c;
}
const va = Re("string"), te = Re("function"), mt = Re("number"), Ee = (o) => o !== null && typeof o == "object", Oa = (o) => o === !0 || o === !1, je = (o) => {
  if (Ve(o) !== "object")
    return !1;
  const c = $e(o);
  return (c === null || c === Object.prototype || Object.getPrototypeOf(c) === null) && !(Symbol.toStringTag in o) && !(Symbol.iterator in o);
}, Pa = ne("Date"), ba = ne("File"), ma = ne("Blob"), fa = ne("FileList"), Sa = (o) => Ee(o) && te(o.pipe), ga = (o) => {
  let c;
  return o && (typeof FormData == "function" && o instanceof FormData || te(o.append) && ((c = Ve(o)) === "formdata" || // detect form-data instance
  c === "object" && te(o.toString) && o.toString() === "[object FormData]"));
}, ja = ne("URLSearchParams"), [Ua, ya, _a, Va] = ["ReadableStream", "Request", "Response", "Headers"].map(ne), Ra = (o) => o.trim ? o.trim() : o.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function fe(o, c, { allOwnKeys: v = !1 } = {}) {
  if (o === null || typeof o > "u")
    return;
  let e, O;
  if (typeof o != "object" && (o = [o]), ve(o))
    for (e = 0, O = o.length; e < O; e++)
      c.call(null, o[e], e, o);
  else {
    const m = v ? Object.getOwnPropertyNames(o) : Object.keys(o), f = m.length;
    let j;
    for (e = 0; e < f; e++)
      j = m[e], c.call(null, o[j], j, o);
  }
}
function ft(o, c) {
  c = c.toLowerCase();
  const v = Object.keys(o);
  let e = v.length, O;
  for (; e-- > 0; )
    if (O = v[e], c === O.toLowerCase())
      return O;
  return null;
}
const St = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, gt = (o) => !me(o) && o !== St;
function Le() {
  const { caseless: o } = gt(this) && this || {}, c = {}, v = (e, O) => {
    const m = o && ft(c, O) || O;
    je(c[m]) && je(e) ? c[m] = Le(c[m], e) : je(e) ? c[m] = Le({}, e) : ve(e) ? c[m] = e.slice() : c[m] = e;
  };
  for (let e = 0, O = arguments.length; e < O; e++)
    arguments[e] && fe(arguments[e], v);
  return c;
}
const Ea = (o, c, v, { allOwnKeys: e } = {}) => (fe(c, (O, m) => {
  v && te(O) ? o[m] = Pt(O, v) : o[m] = O;
}, { allOwnKeys: e }), o), Ta = (o) => (o.charCodeAt(0) === 65279 && (o = o.slice(1)), o), Ba = (o, c, v, e) => {
  o.prototype = Object.create(c.prototype, e), o.prototype.constructor = o, Object.defineProperty(o, "super", {
    value: c.prototype
  }), v && Object.assign(o.prototype, v);
}, Fa = (o, c, v, e) => {
  let O, m, f;
  const j = {};
  if (c = c || {}, o == null) return c;
  do {
    for (O = Object.getOwnPropertyNames(o), m = O.length; m-- > 0; )
      f = O[m], (!e || e(f, o, c)) && !j[f] && (c[f] = o[f], j[f] = !0);
    o = v !== !1 && $e(o);
  } while (o && (!v || v(o, c)) && o !== Object.prototype);
  return c;
}, Ca = (o, c, v) => {
  o = String(o), (v === void 0 || v > o.length) && (v = o.length), v -= c.length;
  const e = o.indexOf(c, v);
  return e !== -1 && e === v;
}, wa = (o) => {
  if (!o) return null;
  if (ve(o)) return o;
  let c = o.length;
  if (!mt(c)) return null;
  const v = new Array(c);
  for (; c-- > 0; )
    v[c] = o[c];
  return v;
}, Ia = /* @__PURE__ */ ((o) => (c) => o && c instanceof o)(typeof Uint8Array < "u" && $e(Uint8Array)), Ma = (o, c) => {
  const e = (o && o[Symbol.iterator]).call(o);
  let O;
  for (; (O = e.next()) && !O.done; ) {
    const m = O.value;
    c.call(o, m[0], m[1]);
  }
}, xa = (o, c) => {
  let v;
  const e = [];
  for (; (v = o.exec(c)) !== null; )
    e.push(v);
  return e;
}, La = ne("HTMLFormElement"), qa = (o) => o.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(v, e, O) {
    return e.toUpperCase() + O;
  }
), Ze = (({ hasOwnProperty: o }) => (c, v) => o.call(c, v))(Object.prototype), Da = ne("RegExp"), jt = (o, c) => {
  const v = Object.getOwnPropertyDescriptors(o), e = {};
  fe(v, (O, m) => {
    let f;
    (f = c(O, m, o)) !== !1 && (e[m] = f || O);
  }), Object.defineProperties(o, e);
}, Ha = (o) => {
  jt(o, (c, v) => {
    if (te(o) && ["arguments", "caller", "callee"].indexOf(v) !== -1)
      return !1;
    const e = o[v];
    if (te(e)) {
      if (c.enumerable = !1, "writable" in c) {
        c.writable = !1;
        return;
      }
      c.set || (c.set = () => {
        throw Error("Can not rewrite read-only method '" + v + "'");
      });
    }
  });
}, Na = (o, c) => {
  const v = {}, e = (O) => {
    O.forEach((m) => {
      v[m] = !0;
    });
  };
  return ve(o) ? e(o) : e(String(o).split(c)), v;
}, ka = () => {
}, Ga = (o, c) => o != null && Number.isFinite(o = +o) ? o : c, we = "abcdefghijklmnopqrstuvwxyz", et = "0123456789", Ut = {
  DIGIT: et,
  ALPHA: we,
  ALPHA_DIGIT: we + we.toUpperCase() + et
}, Qa = (o = 16, c = Ut.ALPHA_DIGIT) => {
  let v = "";
  const { length: e } = c;
  for (; o--; )
    v += c[Math.random() * e | 0];
  return v;
};
function Ya(o) {
  return !!(o && te(o.append) && o[Symbol.toStringTag] === "FormData" && o[Symbol.iterator]);
}
const $a = (o) => {
  const c = new Array(10), v = (e, O) => {
    if (Ee(e)) {
      if (c.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        c[O] = e;
        const m = ve(e) ? [] : {};
        return fe(e, (f, j) => {
          const V = v(f, O + 1);
          !me(V) && (m[j] = V);
        }), c[O] = void 0, m;
      }
    }
    return e;
  };
  return v(o, 0);
}, za = ne("AsyncFunction"), Ka = (o) => o && (Ee(o) || te(o)) && te(o.then) && te(o.catch), S = {
  isArray: ve,
  isArrayBuffer: bt,
  isBuffer: pa,
  isFormData: ga,
  isArrayBufferView: Aa,
  isString: va,
  isNumber: mt,
  isBoolean: Oa,
  isObject: Ee,
  isPlainObject: je,
  isReadableStream: Ua,
  isRequest: ya,
  isResponse: _a,
  isHeaders: Va,
  isUndefined: me,
  isDate: Pa,
  isFile: ba,
  isBlob: ma,
  isRegExp: Da,
  isFunction: te,
  isStream: Sa,
  isURLSearchParams: ja,
  isTypedArray: Ia,
  isFileList: fa,
  forEach: fe,
  merge: Le,
  extend: Ea,
  trim: Ra,
  stripBOM: Ta,
  inherits: Ba,
  toFlatObject: Fa,
  kindOf: Ve,
  kindOfTest: ne,
  endsWith: Ca,
  toArray: wa,
  forEachEntry: Ma,
  matchAll: xa,
  isHTMLForm: La,
  hasOwnProperty: Ze,
  hasOwnProp: Ze,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: jt,
  freezeMethods: Ha,
  toObjectSet: Na,
  toCamelCase: qa,
  noop: ka,
  toFiniteNumber: Ga,
  findKey: ft,
  global: St,
  isContextDefined: gt,
  ALPHABET: Ut,
  generateString: Qa,
  isSpecCompliantForm: Ya,
  toJSONObject: $a,
  isAsyncFn: za,
  isThenable: Ka
};
function w(o, c, v, e, O) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = o, this.name = "AxiosError", c && (this.code = c), v && (this.config = v), e && (this.request = e), O && (this.response = O);
}
S.inherits(w, Error, {
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
const yt = w.prototype, _t = {};
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
  _t[o] = { value: o };
});
Object.defineProperties(w, _t);
Object.defineProperty(yt, "isAxiosError", { value: !0 });
w.from = (o, c, v, e, O, m) => {
  const f = Object.create(yt);
  return S.toFlatObject(o, f, function(V) {
    return V !== Error.prototype;
  }, (j) => j !== "isAxiosError"), w.call(f, o.message, c, v, e, O), f.cause = o, f.name = o.name, m && Object.assign(f, m), f;
};
const Wa = null;
function qe(o) {
  return S.isPlainObject(o) || S.isArray(o);
}
function Vt(o) {
  return S.endsWith(o, "[]") ? o.slice(0, -2) : o;
}
function tt(o, c, v) {
  return o ? o.concat(c).map(function(O, m) {
    return O = Vt(O), !v && m ? "[" + O + "]" : O;
  }).join(v ? "." : "") : c;
}
function Ja(o) {
  return S.isArray(o) && !o.some(qe);
}
const Xa = S.toFlatObject(S, {}, null, function(c) {
  return /^is[A-Z]/.test(c);
});
function Te(o, c, v) {
  if (!S.isObject(o))
    throw new TypeError("target must be an object");
  c = c || new FormData(), v = S.toFlatObject(v, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(I, W) {
    return !S.isUndefined(W[I]);
  });
  const e = v.metaTokens, O = v.visitor || U, m = v.dots, f = v.indexes, V = (v.Blob || typeof Blob < "u" && Blob) && S.isSpecCompliantForm(c);
  if (!S.isFunction(O))
    throw new TypeError("visitor must be a function");
  function _(B) {
    if (B === null) return "";
    if (S.isDate(B))
      return B.toISOString();
    if (!V && S.isBlob(B))
      throw new w("Blob is not supported. Use a Buffer instead.");
    return S.isArrayBuffer(B) || S.isTypedArray(B) ? V && typeof Blob == "function" ? new Blob([B]) : Buffer.from(B) : B;
  }
  function U(B, I, W) {
    let J = B;
    if (B && !W && typeof B == "object") {
      if (S.endsWith(I, "{}"))
        I = e ? I : I.slice(0, -2), B = JSON.stringify(B);
      else if (S.isArray(B) && Ja(B) || (S.isFileList(B) || S.endsWith(I, "[]")) && (J = S.toArray(B)))
        return I = Vt(I), J.forEach(function(H, ue) {
          !(S.isUndefined(H) || H === null) && c.append(
            // eslint-disable-next-line no-nested-ternary
            f === !0 ? tt([I], ue, m) : f === null ? I : I + "[]",
            _(H)
          );
        }), !1;
    }
    return qe(B) ? !0 : (c.append(tt(W, I, m), _(B)), !1);
  }
  const E = [], N = Object.assign(Xa, {
    defaultVisitor: U,
    convertValue: _,
    isVisitable: qe
  });
  function q(B, I) {
    if (!S.isUndefined(B)) {
      if (E.indexOf(B) !== -1)
        throw Error("Circular reference detected in " + I.join("."));
      E.push(B), S.forEach(B, function(J, se) {
        (!(S.isUndefined(J) || J === null) && O.call(
          c,
          J,
          S.isString(se) ? se.trim() : se,
          I,
          N
        )) === !0 && q(J, I ? I.concat(se) : [se]);
      }), E.pop();
    }
  }
  if (!S.isObject(o))
    throw new TypeError("data must be an object");
  return q(o), c;
}
function st(o) {
  const c = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(o).replace(/[!'()~]|%20|%00/g, function(e) {
    return c[e];
  });
}
function ze(o, c) {
  this._pairs = [], o && Te(o, this, c);
}
const Rt = ze.prototype;
Rt.append = function(c, v) {
  this._pairs.push([c, v]);
};
Rt.toString = function(c) {
  const v = c ? function(e) {
    return c.call(this, e, st);
  } : st;
  return this._pairs.map(function(O) {
    return v(O[0]) + "=" + v(O[1]);
  }, "").join("&");
};
function Za(o) {
  return encodeURIComponent(o).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function Et(o, c, v) {
  if (!c)
    return o;
  const e = v && v.encode || Za, O = v && v.serialize;
  let m;
  if (O ? m = O(c, v) : m = S.isURLSearchParams(c) ? c.toString() : new ze(c, v).toString(e), m) {
    const f = o.indexOf("#");
    f !== -1 && (o = o.slice(0, f)), o += (o.indexOf("?") === -1 ? "?" : "&") + m;
  }
  return o;
}
class at {
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
  use(c, v, e) {
    return this.handlers.push({
      fulfilled: c,
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
    S.forEach(this.handlers, function(e) {
      e !== null && c(e);
    });
  }
}
const Tt = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, er = typeof URLSearchParams < "u" ? URLSearchParams : ze, tr = typeof FormData < "u" ? FormData : null, sr = typeof Blob < "u" ? Blob : null, ar = {
  isBrowser: !0,
  classes: {
    URLSearchParams: er,
    FormData: tr,
    Blob: sr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ke = typeof window < "u" && typeof document < "u", rr = ((o) => Ke && ["ReactNative", "NativeScript", "NS"].indexOf(o) < 0)(typeof navigator < "u" && navigator.product), nr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", ir = Ke && window.location.href || "http://localhost", or = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ke,
  hasStandardBrowserEnv: rr,
  hasStandardBrowserWebWorkerEnv: nr,
  origin: ir
}, Symbol.toStringTag, { value: "Module" })), re = {
  ...or,
  ...ar
};
function lr(o, c) {
  return Te(o, new re.classes.URLSearchParams(), Object.assign({
    visitor: function(v, e, O, m) {
      return re.isNode && S.isBuffer(v) ? (this.append(e, v.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments);
    }
  }, c));
}
function cr(o) {
  return S.matchAll(/\w+|\[(\w*)]/g, o).map((c) => c[0] === "[]" ? "" : c[1] || c[0]);
}
function dr(o) {
  const c = {}, v = Object.keys(o);
  let e;
  const O = v.length;
  let m;
  for (e = 0; e < O; e++)
    m = v[e], c[m] = o[m];
  return c;
}
function Bt(o) {
  function c(v, e, O, m) {
    let f = v[m++];
    if (f === "__proto__") return !0;
    const j = Number.isFinite(+f), V = m >= v.length;
    return f = !f && S.isArray(O) ? O.length : f, V ? (S.hasOwnProp(O, f) ? O[f] = [O[f], e] : O[f] = e, !j) : ((!O[f] || !S.isObject(O[f])) && (O[f] = []), c(v, e, O[f], m) && S.isArray(O[f]) && (O[f] = dr(O[f])), !j);
  }
  if (S.isFormData(o) && S.isFunction(o.entries)) {
    const v = {};
    return S.forEachEntry(o, (e, O) => {
      c(cr(e), O, v, 0);
    }), v;
  }
  return null;
}
function ur(o, c, v) {
  if (S.isString(o))
    try {
      return (c || JSON.parse)(o), S.trim(o);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (v || JSON.stringify)(o);
}
const Se = {
  transitional: Tt,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(c, v) {
    const e = v.getContentType() || "", O = e.indexOf("application/json") > -1, m = S.isObject(c);
    if (m && S.isHTMLForm(c) && (c = new FormData(c)), S.isFormData(c))
      return O ? JSON.stringify(Bt(c)) : c;
    if (S.isArrayBuffer(c) || S.isBuffer(c) || S.isStream(c) || S.isFile(c) || S.isBlob(c) || S.isReadableStream(c))
      return c;
    if (S.isArrayBufferView(c))
      return c.buffer;
    if (S.isURLSearchParams(c))
      return v.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), c.toString();
    let j;
    if (m) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return lr(c, this.formSerializer).toString();
      if ((j = S.isFileList(c)) || e.indexOf("multipart/form-data") > -1) {
        const V = this.env && this.env.FormData;
        return Te(
          j ? { "files[]": c } : c,
          V && new V(),
          this.formSerializer
        );
      }
    }
    return m || O ? (v.setContentType("application/json", !1), ur(c)) : c;
  }],
  transformResponse: [function(c) {
    const v = this.transitional || Se.transitional, e = v && v.forcedJSONParsing, O = this.responseType === "json";
    if (S.isResponse(c) || S.isReadableStream(c))
      return c;
    if (c && S.isString(c) && (e && !this.responseType || O)) {
      const f = !(v && v.silentJSONParsing) && O;
      try {
        return JSON.parse(c);
      } catch (j) {
        if (f)
          throw j.name === "SyntaxError" ? w.from(j, w.ERR_BAD_RESPONSE, this, null, this.response) : j;
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
    FormData: re.classes.FormData,
    Blob: re.classes.Blob
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
S.forEach(["delete", "get", "head", "post", "put", "patch"], (o) => {
  Se.headers[o] = {};
});
const hr = S.toObjectSet([
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
]), pr = (o) => {
  const c = {};
  let v, e, O;
  return o && o.split(`
`).forEach(function(f) {
    O = f.indexOf(":"), v = f.substring(0, O).trim().toLowerCase(), e = f.substring(O + 1).trim(), !(!v || c[v] && hr[v]) && (v === "set-cookie" ? c[v] ? c[v].push(e) : c[v] = [e] : c[v] = c[v] ? c[v] + ", " + e : e);
  }), c;
}, rt = Symbol("internals");
function Pe(o) {
  return o && String(o).trim().toLowerCase();
}
function Ue(o) {
  return o === !1 || o == null ? o : S.isArray(o) ? o.map(Ue) : String(o);
}
function Ar(o) {
  const c = /* @__PURE__ */ Object.create(null), v = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = v.exec(o); )
    c[e[1]] = e[2];
  return c;
}
const vr = (o) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(o.trim());
function Ie(o, c, v, e, O) {
  if (S.isFunction(e))
    return e.call(this, c, v);
  if (O && (c = v), !!S.isString(c)) {
    if (S.isString(e))
      return c.indexOf(e) !== -1;
    if (S.isRegExp(e))
      return e.test(c);
  }
}
function Or(o) {
  return o.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (c, v, e) => v.toUpperCase() + e);
}
function Pr(o, c) {
  const v = S.toCamelCase(" " + c);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(o, e + v, {
      value: function(O, m, f) {
        return this[e].call(this, c, O, m, f);
      },
      configurable: !0
    });
  });
}
let Z = class {
  constructor(c) {
    c && this.set(c);
  }
  set(c, v, e) {
    const O = this;
    function m(j, V, _) {
      const U = Pe(V);
      if (!U)
        throw new Error("header name must be a non-empty string");
      const E = S.findKey(O, U);
      (!E || O[E] === void 0 || _ === !0 || _ === void 0 && O[E] !== !1) && (O[E || V] = Ue(j));
    }
    const f = (j, V) => S.forEach(j, (_, U) => m(_, U, V));
    if (S.isPlainObject(c) || c instanceof this.constructor)
      f(c, v);
    else if (S.isString(c) && (c = c.trim()) && !vr(c))
      f(pr(c), v);
    else if (S.isHeaders(c))
      for (const [j, V] of c.entries())
        m(V, j, e);
    else
      c != null && m(v, c, e);
    return this;
  }
  get(c, v) {
    if (c = Pe(c), c) {
      const e = S.findKey(this, c);
      if (e) {
        const O = this[e];
        if (!v)
          return O;
        if (v === !0)
          return Ar(O);
        if (S.isFunction(v))
          return v.call(this, O, e);
        if (S.isRegExp(v))
          return v.exec(O);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(c, v) {
    if (c = Pe(c), c) {
      const e = S.findKey(this, c);
      return !!(e && this[e] !== void 0 && (!v || Ie(this, this[e], e, v)));
    }
    return !1;
  }
  delete(c, v) {
    const e = this;
    let O = !1;
    function m(f) {
      if (f = Pe(f), f) {
        const j = S.findKey(e, f);
        j && (!v || Ie(e, e[j], j, v)) && (delete e[j], O = !0);
      }
    }
    return S.isArray(c) ? c.forEach(m) : m(c), O;
  }
  clear(c) {
    const v = Object.keys(this);
    let e = v.length, O = !1;
    for (; e--; ) {
      const m = v[e];
      (!c || Ie(this, this[m], m, c, !0)) && (delete this[m], O = !0);
    }
    return O;
  }
  normalize(c) {
    const v = this, e = {};
    return S.forEach(this, (O, m) => {
      const f = S.findKey(e, m);
      if (f) {
        v[f] = Ue(O), delete v[m];
        return;
      }
      const j = c ? Or(m) : String(m).trim();
      j !== m && delete v[m], v[j] = Ue(O), e[j] = !0;
    }), this;
  }
  concat(...c) {
    return this.constructor.concat(this, ...c);
  }
  toJSON(c) {
    const v = /* @__PURE__ */ Object.create(null);
    return S.forEach(this, (e, O) => {
      e != null && e !== !1 && (v[O] = c && S.isArray(e) ? e.join(", ") : e);
    }), v;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([c, v]) => c + ": " + v).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(c) {
    return c instanceof this ? c : new this(c);
  }
  static concat(c, ...v) {
    const e = new this(c);
    return v.forEach((O) => e.set(O)), e;
  }
  static accessor(c) {
    const e = (this[rt] = this[rt] = {
      accessors: {}
    }).accessors, O = this.prototype;
    function m(f) {
      const j = Pe(f);
      e[j] || (Pr(O, f), e[j] = !0);
    }
    return S.isArray(c) ? c.forEach(m) : m(c), this;
  }
};
Z.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
S.reduceDescriptors(Z.prototype, ({ value: o }, c) => {
  let v = c[0].toUpperCase() + c.slice(1);
  return {
    get: () => o,
    set(e) {
      this[v] = e;
    }
  };
});
S.freezeMethods(Z);
function Me(o, c) {
  const v = this || Se, e = c || v, O = Z.from(e.headers);
  let m = e.data;
  return S.forEach(o, function(j) {
    m = j.call(v, m, O.normalize(), c ? c.status : void 0);
  }), O.normalize(), m;
}
function Ft(o) {
  return !!(o && o.__CANCEL__);
}
function Oe(o, c, v) {
  w.call(this, o ?? "canceled", w.ERR_CANCELED, c, v), this.name = "CanceledError";
}
S.inherits(Oe, w, {
  __CANCEL__: !0
});
function Ct(o, c, v) {
  const e = v.config.validateStatus;
  !v.status || !e || e(v.status) ? o(v) : c(new w(
    "Request failed with status code " + v.status,
    [w.ERR_BAD_REQUEST, w.ERR_BAD_RESPONSE][Math.floor(v.status / 100) - 4],
    v.config,
    v.request,
    v
  ));
}
function br(o) {
  const c = /^([-+\w]{1,25})(:?\/\/|:)/.exec(o);
  return c && c[1] || "";
}
function mr(o, c) {
  o = o || 10;
  const v = new Array(o), e = new Array(o);
  let O = 0, m = 0, f;
  return c = c !== void 0 ? c : 1e3, function(V) {
    const _ = Date.now(), U = e[m];
    f || (f = _), v[O] = V, e[O] = _;
    let E = m, N = 0;
    for (; E !== O; )
      N += v[E++], E = E % o;
    if (O = (O + 1) % o, O === m && (m = (m + 1) % o), _ - f < c)
      return;
    const q = U && _ - U;
    return q ? Math.round(N * 1e3 / q) : void 0;
  };
}
function fr(o, c) {
  let v = 0;
  const e = 1e3 / c;
  let O = null;
  return function() {
    const f = this === !0, j = Date.now();
    if (f || j - v > e)
      return O && (clearTimeout(O), O = null), v = j, o.apply(null, arguments);
    O || (O = setTimeout(() => (O = null, v = Date.now(), o.apply(null, arguments)), e - (j - v)));
  };
}
const ye = (o, c, v = 3) => {
  let e = 0;
  const O = mr(50, 250);
  return fr((m) => {
    const f = m.loaded, j = m.lengthComputable ? m.total : void 0, V = f - e, _ = O(V), U = f <= j;
    e = f;
    const E = {
      loaded: f,
      total: j,
      progress: j ? f / j : void 0,
      bytes: V,
      rate: _ || void 0,
      estimated: _ && j && U ? (j - f) / _ : void 0,
      event: m,
      lengthComputable: j != null
    };
    E[c ? "download" : "upload"] = !0, o(E);
  }, v);
}, Sr = re.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const c = /(msie|trident)/i.test(navigator.userAgent), v = document.createElement("a");
    let e;
    function O(m) {
      let f = m;
      return c && (v.setAttribute("href", f), f = v.href), v.setAttribute("href", f), {
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
    return e = O(window.location.href), function(f) {
      const j = S.isString(f) ? O(f) : f;
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
), gr = re.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(o, c, v, e, O, m) {
      const f = [o + "=" + encodeURIComponent(c)];
      S.isNumber(v) && f.push("expires=" + new Date(v).toGMTString()), S.isString(e) && f.push("path=" + e), S.isString(O) && f.push("domain=" + O), m === !0 && f.push("secure"), document.cookie = f.join("; ");
    },
    read(o) {
      const c = document.cookie.match(new RegExp("(^|;\\s*)(" + o + ")=([^;]*)"));
      return c ? decodeURIComponent(c[3]) : null;
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
function jr(o) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(o);
}
function Ur(o, c) {
  return c ? o.replace(/\/?\/$/, "") + "/" + c.replace(/^\/+/, "") : o;
}
function wt(o, c) {
  return o && !jr(c) ? Ur(o, c) : c;
}
const nt = (o) => o instanceof Z ? { ...o } : o;
function pe(o, c) {
  c = c || {};
  const v = {};
  function e(_, U, E) {
    return S.isPlainObject(_) && S.isPlainObject(U) ? S.merge.call({ caseless: E }, _, U) : S.isPlainObject(U) ? S.merge({}, U) : S.isArray(U) ? U.slice() : U;
  }
  function O(_, U, E) {
    if (S.isUndefined(U)) {
      if (!S.isUndefined(_))
        return e(void 0, _, E);
    } else return e(_, U, E);
  }
  function m(_, U) {
    if (!S.isUndefined(U))
      return e(void 0, U);
  }
  function f(_, U) {
    if (S.isUndefined(U)) {
      if (!S.isUndefined(_))
        return e(void 0, _);
    } else return e(void 0, U);
  }
  function j(_, U, E) {
    if (E in c)
      return e(_, U);
    if (E in o)
      return e(void 0, _);
  }
  const V = {
    url: m,
    method: m,
    data: m,
    baseURL: f,
    transformRequest: f,
    transformResponse: f,
    paramsSerializer: f,
    timeout: f,
    timeoutMessage: f,
    withCredentials: f,
    withXSRFToken: f,
    adapter: f,
    responseType: f,
    xsrfCookieName: f,
    xsrfHeaderName: f,
    onUploadProgress: f,
    onDownloadProgress: f,
    decompress: f,
    maxContentLength: f,
    maxBodyLength: f,
    beforeRedirect: f,
    transport: f,
    httpAgent: f,
    httpsAgent: f,
    cancelToken: f,
    socketPath: f,
    responseEncoding: f,
    validateStatus: j,
    headers: (_, U) => O(nt(_), nt(U), !0)
  };
  return S.forEach(Object.keys(Object.assign({}, o, c)), function(U) {
    const E = V[U] || O, N = E(o[U], c[U], U);
    S.isUndefined(N) && E !== j || (v[U] = N);
  }), v;
}
const It = (o) => {
  const c = pe({}, o);
  let { data: v, withXSRFToken: e, xsrfHeaderName: O, xsrfCookieName: m, headers: f, auth: j } = c;
  c.headers = f = Z.from(f), c.url = Et(wt(c.baseURL, c.url), o.params, o.paramsSerializer), j && f.set(
    "Authorization",
    "Basic " + btoa((j.username || "") + ":" + (j.password ? unescape(encodeURIComponent(j.password)) : ""))
  );
  let V;
  if (S.isFormData(v)) {
    if (re.hasStandardBrowserEnv || re.hasStandardBrowserWebWorkerEnv)
      f.setContentType(void 0);
    else if ((V = f.getContentType()) !== !1) {
      const [_, ...U] = V ? V.split(";").map((E) => E.trim()).filter(Boolean) : [];
      f.setContentType([_ || "multipart/form-data", ...U].join("; "));
    }
  }
  if (re.hasStandardBrowserEnv && (e && S.isFunction(e) && (e = e(c)), e || e !== !1 && Sr(c.url))) {
    const _ = O && m && gr.read(m);
    _ && f.set(O, _);
  }
  return c;
}, yr = typeof XMLHttpRequest < "u", _r = yr && function(o) {
  return new Promise(function(v, e) {
    const O = It(o);
    let m = O.data;
    const f = Z.from(O.headers).normalize();
    let { responseType: j } = O, V;
    function _() {
      O.cancelToken && O.cancelToken.unsubscribe(V), O.signal && O.signal.removeEventListener("abort", V);
    }
    let U = new XMLHttpRequest();
    U.open(O.method.toUpperCase(), O.url, !0), U.timeout = O.timeout;
    function E() {
      if (!U)
        return;
      const q = Z.from(
        "getAllResponseHeaders" in U && U.getAllResponseHeaders()
      ), I = {
        data: !j || j === "text" || j === "json" ? U.responseText : U.response,
        status: U.status,
        statusText: U.statusText,
        headers: q,
        config: o,
        request: U
      };
      Ct(function(J) {
        v(J), _();
      }, function(J) {
        e(J), _();
      }, I), U = null;
    }
    "onloadend" in U ? U.onloadend = E : U.onreadystatechange = function() {
      !U || U.readyState !== 4 || U.status === 0 && !(U.responseURL && U.responseURL.indexOf("file:") === 0) || setTimeout(E);
    }, U.onabort = function() {
      U && (e(new w("Request aborted", w.ECONNABORTED, O, U)), U = null);
    }, U.onerror = function() {
      e(new w("Network Error", w.ERR_NETWORK, O, U)), U = null;
    }, U.ontimeout = function() {
      let B = O.timeout ? "timeout of " + O.timeout + "ms exceeded" : "timeout exceeded";
      const I = O.transitional || Tt;
      O.timeoutErrorMessage && (B = O.timeoutErrorMessage), e(new w(
        B,
        I.clarifyTimeoutError ? w.ETIMEDOUT : w.ECONNABORTED,
        O,
        U
      )), U = null;
    }, m === void 0 && f.setContentType(null), "setRequestHeader" in U && S.forEach(f.toJSON(), function(B, I) {
      U.setRequestHeader(I, B);
    }), S.isUndefined(O.withCredentials) || (U.withCredentials = !!O.withCredentials), j && j !== "json" && (U.responseType = O.responseType), typeof O.onDownloadProgress == "function" && U.addEventListener("progress", ye(O.onDownloadProgress, !0)), typeof O.onUploadProgress == "function" && U.upload && U.upload.addEventListener("progress", ye(O.onUploadProgress)), (O.cancelToken || O.signal) && (V = (q) => {
      U && (e(!q || q.type ? new Oe(null, o, U) : q), U.abort(), U = null);
    }, O.cancelToken && O.cancelToken.subscribe(V), O.signal && (O.signal.aborted ? V() : O.signal.addEventListener("abort", V)));
    const N = br(O.url);
    if (N && re.protocols.indexOf(N) === -1) {
      e(new w("Unsupported protocol " + N + ":", w.ERR_BAD_REQUEST, o));
      return;
    }
    U.send(m || null);
  });
}, Vr = (o, c) => {
  let v = new AbortController(), e;
  const O = function(V) {
    if (!e) {
      e = !0, f();
      const _ = V instanceof Error ? V : this.reason;
      v.abort(_ instanceof w ? _ : new Oe(_ instanceof Error ? _.message : _));
    }
  };
  let m = c && setTimeout(() => {
    O(new w(`timeout ${c} of ms exceeded`, w.ETIMEDOUT));
  }, c);
  const f = () => {
    o && (m && clearTimeout(m), m = null, o.forEach((V) => {
      V && (V.removeEventListener ? V.removeEventListener("abort", O) : V.unsubscribe(O));
    }), o = null);
  };
  o.forEach((V) => V && V.addEventListener && V.addEventListener("abort", O));
  const { signal: j } = v;
  return j.unsubscribe = f, [j, () => {
    m && clearTimeout(m), m = null;
  }];
}, Rr = function* (o, c) {
  let v = o.byteLength;
  if (!c || v < c) {
    yield o;
    return;
  }
  let e = 0, O;
  for (; e < v; )
    O = e + c, yield o.slice(e, O), e = O;
}, Er = async function* (o, c, v) {
  for await (const e of o)
    yield* Rr(ArrayBuffer.isView(e) ? e : await v(String(e)), c);
}, it = (o, c, v, e, O) => {
  const m = Er(o, c, O);
  let f = 0;
  return new ReadableStream({
    type: "bytes",
    async pull(j) {
      const { done: V, value: _ } = await m.next();
      if (V) {
        j.close(), e();
        return;
      }
      let U = _.byteLength;
      v && v(f += U), j.enqueue(new Uint8Array(_));
    },
    cancel(j) {
      return e(j), m.return();
    }
  }, {
    highWaterMark: 2
  });
}, ot = (o, c) => {
  const v = o != null;
  return (e) => setTimeout(() => c({
    lengthComputable: v,
    total: o,
    loaded: e
  }));
}, Be = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", Mt = Be && typeof ReadableStream == "function", De = Be && (typeof TextEncoder == "function" ? /* @__PURE__ */ ((o) => (c) => o.encode(c))(new TextEncoder()) : async (o) => new Uint8Array(await new Response(o).arrayBuffer())), Tr = Mt && (() => {
  let o = !1;
  const c = new Request(re.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      return o = !0, "half";
    }
  }).headers.has("Content-Type");
  return o && !c;
})(), lt = 64 * 1024, He = Mt && !!(() => {
  try {
    return S.isReadableStream(new Response("").body);
  } catch {
  }
})(), _e = {
  stream: He && ((o) => o.body)
};
Be && ((o) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((c) => {
    !_e[c] && (_e[c] = S.isFunction(o[c]) ? (v) => v[c]() : (v, e) => {
      throw new w(`Response type '${c}' is not supported`, w.ERR_NOT_SUPPORT, e);
    });
  });
})(new Response());
const Br = async (o) => {
  if (o == null)
    return 0;
  if (S.isBlob(o))
    return o.size;
  if (S.isSpecCompliantForm(o))
    return (await new Request(o).arrayBuffer()).byteLength;
  if (S.isArrayBufferView(o))
    return o.byteLength;
  if (S.isURLSearchParams(o) && (o = o + ""), S.isString(o))
    return (await De(o)).byteLength;
}, Fr = async (o, c) => {
  const v = S.toFiniteNumber(o.getContentLength());
  return v ?? Br(c);
}, Cr = Be && (async (o) => {
  let {
    url: c,
    method: v,
    data: e,
    signal: O,
    cancelToken: m,
    timeout: f,
    onDownloadProgress: j,
    onUploadProgress: V,
    responseType: _,
    headers: U,
    withCredentials: E = "same-origin",
    fetchOptions: N
  } = It(o);
  _ = _ ? (_ + "").toLowerCase() : "text";
  let [q, B] = O || m || f ? Vr([O, m], f) : [], I, W;
  const J = () => {
    !I && setTimeout(() => {
      q && q.unsubscribe();
    }), I = !0;
  };
  let se;
  try {
    if (V && Tr && v !== "get" && v !== "head" && (se = await Fr(U, e)) !== 0) {
      let ie = new Request(c, {
        method: "POST",
        body: e,
        duplex: "half"
      }), oe;
      S.isFormData(e) && (oe = ie.headers.get("content-type")) && U.setContentType(oe), ie.body && (e = it(ie.body, lt, ot(
        se,
        ye(V)
      ), null, De));
    }
    S.isString(E) || (E = E ? "cors" : "omit"), W = new Request(c, {
      ...N,
      signal: q,
      method: v.toUpperCase(),
      headers: U.normalize().toJSON(),
      body: e,
      duplex: "half",
      withCredentials: E
    });
    let H = await fetch(W);
    const ue = He && (_ === "stream" || _ === "response");
    if (He && (j || ue)) {
      const ie = {};
      ["status", "statusText", "headers"].forEach((ge) => {
        ie[ge] = H[ge];
      });
      const oe = S.toFiniteNumber(H.headers.get("content-length"));
      H = new Response(
        it(H.body, lt, j && ot(
          oe,
          ye(j, !0)
        ), ue && J, De),
        ie
      );
    }
    _ = _ || "text";
    let Ce = await _e[S.findKey(_e, _) || "text"](H, o);
    return !ue && J(), B && B(), await new Promise((ie, oe) => {
      Ct(ie, oe, {
        data: Ce,
        headers: Z.from(H.headers),
        status: H.status,
        statusText: H.statusText,
        config: o,
        request: W
      });
    });
  } catch (H) {
    throw J(), H && H.name === "TypeError" && /fetch/i.test(H.message) ? Object.assign(
      new w("Network Error", w.ERR_NETWORK, o, W),
      {
        cause: H.cause || H
      }
    ) : w.from(H, H && H.code, o, W);
  }
}), Ne = {
  http: Wa,
  xhr: _r,
  fetch: Cr
};
S.forEach(Ne, (o, c) => {
  if (o) {
    try {
      Object.defineProperty(o, "name", { value: c });
    } catch {
    }
    Object.defineProperty(o, "adapterName", { value: c });
  }
});
const ct = (o) => `- ${o}`, wr = (o) => S.isFunction(o) || o === null || o === !1, xt = {
  getAdapter: (o) => {
    o = S.isArray(o) ? o : [o];
    const { length: c } = o;
    let v, e;
    const O = {};
    for (let m = 0; m < c; m++) {
      v = o[m];
      let f;
      if (e = v, !wr(v) && (e = Ne[(f = String(v)).toLowerCase()], e === void 0))
        throw new w(`Unknown adapter '${f}'`);
      if (e)
        break;
      O[f || "#" + m] = e;
    }
    if (!e) {
      const m = Object.entries(O).map(
        ([j, V]) => `adapter ${j} ` + (V === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let f = c ? m.length > 1 ? `since :
` + m.map(ct).join(`
`) : " " + ct(m[0]) : "as no adapter specified";
      throw new w(
        "There is no suitable adapter to dispatch the request " + f,
        "ERR_NOT_SUPPORT"
      );
    }
    return e;
  },
  adapters: Ne
};
function xe(o) {
  if (o.cancelToken && o.cancelToken.throwIfRequested(), o.signal && o.signal.aborted)
    throw new Oe(null, o);
}
function dt(o) {
  return xe(o), o.headers = Z.from(o.headers), o.data = Me.call(
    o,
    o.transformRequest
  ), ["post", "put", "patch"].indexOf(o.method) !== -1 && o.headers.setContentType("application/x-www-form-urlencoded", !1), xt.getAdapter(o.adapter || Se.adapter)(o).then(function(e) {
    return xe(o), e.data = Me.call(
      o,
      o.transformResponse,
      e
    ), e.headers = Z.from(e.headers), e;
  }, function(e) {
    return Ft(e) || (xe(o), e && e.response && (e.response.data = Me.call(
      o,
      o.transformResponse,
      e.response
    ), e.response.headers = Z.from(e.response.headers))), Promise.reject(e);
  });
}
const Lt = "1.7.2", We = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((o, c) => {
  We[o] = function(e) {
    return typeof e === o || "a" + (c < 1 ? "n " : " ") + o;
  };
});
const ut = {};
We.transitional = function(c, v, e) {
  function O(m, f) {
    return "[Axios v" + Lt + "] Transitional option '" + m + "'" + f + (e ? ". " + e : "");
  }
  return (m, f, j) => {
    if (c === !1)
      throw new w(
        O(f, " has been removed" + (v ? " in " + v : "")),
        w.ERR_DEPRECATED
      );
    return v && !ut[f] && (ut[f] = !0, console.warn(
      O(
        f,
        " has been deprecated since v" + v + " and will be removed in the near future"
      )
    )), c ? c(m, f, j) : !0;
  };
};
function Ir(o, c, v) {
  if (typeof o != "object")
    throw new w("options must be an object", w.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(o);
  let O = e.length;
  for (; O-- > 0; ) {
    const m = e[O], f = c[m];
    if (f) {
      const j = o[m], V = j === void 0 || f(j, m, o);
      if (V !== !0)
        throw new w("option " + m + " must be " + V, w.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (v !== !0)
      throw new w("Unknown option " + m, w.ERR_BAD_OPTION);
  }
}
const ke = {
  assertOptions: Ir,
  validators: We
}, ce = ke.validators;
let he = class {
  constructor(c) {
    this.defaults = c, this.interceptors = {
      request: new at(),
      response: new at()
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
  async request(c, v) {
    try {
      return await this._request(c, v);
    } catch (e) {
      if (e instanceof Error) {
        let O;
        Error.captureStackTrace ? Error.captureStackTrace(O = {}) : O = new Error();
        const m = O.stack ? O.stack.replace(/^.+\n/, "") : "";
        try {
          e.stack ? m && !String(e.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (e.stack += `
` + m) : e.stack = m;
        } catch {
        }
      }
      throw e;
    }
  }
  _request(c, v) {
    typeof c == "string" ? (v = v || {}, v.url = c) : v = c || {}, v = pe(this.defaults, v);
    const { transitional: e, paramsSerializer: O, headers: m } = v;
    e !== void 0 && ke.assertOptions(e, {
      silentJSONParsing: ce.transitional(ce.boolean),
      forcedJSONParsing: ce.transitional(ce.boolean),
      clarifyTimeoutError: ce.transitional(ce.boolean)
    }, !1), O != null && (S.isFunction(O) ? v.paramsSerializer = {
      serialize: O
    } : ke.assertOptions(O, {
      encode: ce.function,
      serialize: ce.function
    }, !0)), v.method = (v.method || this.defaults.method || "get").toLowerCase();
    let f = m && S.merge(
      m.common,
      m[v.method]
    );
    m && S.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (B) => {
        delete m[B];
      }
    ), v.headers = Z.concat(f, m);
    const j = [];
    let V = !0;
    this.interceptors.request.forEach(function(I) {
      typeof I.runWhen == "function" && I.runWhen(v) === !1 || (V = V && I.synchronous, j.unshift(I.fulfilled, I.rejected));
    });
    const _ = [];
    this.interceptors.response.forEach(function(I) {
      _.push(I.fulfilled, I.rejected);
    });
    let U, E = 0, N;
    if (!V) {
      const B = [dt.bind(this), void 0];
      for (B.unshift.apply(B, j), B.push.apply(B, _), N = B.length, U = Promise.resolve(v); E < N; )
        U = U.then(B[E++], B[E++]);
      return U;
    }
    N = j.length;
    let q = v;
    for (E = 0; E < N; ) {
      const B = j[E++], I = j[E++];
      try {
        q = B(q);
      } catch (W) {
        I.call(this, W);
        break;
      }
    }
    try {
      U = dt.call(this, q);
    } catch (B) {
      return Promise.reject(B);
    }
    for (E = 0, N = _.length; E < N; )
      U = U.then(_[E++], _[E++]);
    return U;
  }
  getUri(c) {
    c = pe(this.defaults, c);
    const v = wt(c.baseURL, c.url);
    return Et(v, c.params, c.paramsSerializer);
  }
};
S.forEach(["delete", "get", "head", "options"], function(c) {
  he.prototype[c] = function(v, e) {
    return this.request(pe(e || {}, {
      method: c,
      url: v,
      data: (e || {}).data
    }));
  };
});
S.forEach(["post", "put", "patch"], function(c) {
  function v(e) {
    return function(m, f, j) {
      return this.request(pe(j || {}, {
        method: c,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: m,
        data: f
      }));
    };
  }
  he.prototype[c] = v(), he.prototype[c + "Form"] = v(!0);
});
let Mr = class qt {
  constructor(c) {
    if (typeof c != "function")
      throw new TypeError("executor must be a function.");
    let v;
    this.promise = new Promise(function(m) {
      v = m;
    });
    const e = this;
    this.promise.then((O) => {
      if (!e._listeners) return;
      let m = e._listeners.length;
      for (; m-- > 0; )
        e._listeners[m](O);
      e._listeners = null;
    }), this.promise.then = (O) => {
      let m;
      const f = new Promise((j) => {
        e.subscribe(j), m = j;
      }).then(O);
      return f.cancel = function() {
        e.unsubscribe(m);
      }, f;
    }, c(function(m, f, j) {
      e.reason || (e.reason = new Oe(m, f, j), v(e.reason));
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
    const v = this._listeners.indexOf(c);
    v !== -1 && this._listeners.splice(v, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let c;
    return {
      token: new qt(function(O) {
        c = O;
      }),
      cancel: c
    };
  }
};
function xr(o) {
  return function(v) {
    return o.apply(null, v);
  };
}
function Lr(o) {
  return S.isObject(o) && o.isAxiosError === !0;
}
const Ge = {
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
Object.entries(Ge).forEach(([o, c]) => {
  Ge[c] = o;
});
function Dt(o) {
  const c = new he(o), v = Pt(he.prototype.request, c);
  return S.extend(v, he.prototype, c, { allOwnKeys: !0 }), S.extend(v, c, null, { allOwnKeys: !0 }), v.create = function(O) {
    return Dt(pe(o, O));
  }, v;
}
const Y = Dt(Se);
Y.Axios = he;
Y.CanceledError = Oe;
Y.CancelToken = Mr;
Y.isCancel = Ft;
Y.VERSION = Lt;
Y.toFormData = Te;
Y.AxiosError = w;
Y.Cancel = Y.CanceledError;
Y.all = function(c) {
  return Promise.all(c);
};
Y.spread = xr;
Y.isAxiosError = Lr;
Y.mergeConfig = pe;
Y.AxiosHeaders = Z;
Y.formToJSON = (o) => Bt(S.isHTMLForm(o) ? new FormData(o) : o);
Y.getAdapter = xt.getAdapter;
Y.HttpStatusCode = Ge;
Y.default = Y;
const {
  Axios: qr,
  AxiosError: Dr,
  CanceledError: Hr,
  isCancel: Nr,
  CancelToken: kr,
  VERSION: Gr,
  all: Qr,
  Cancel: Yr,
  isAxiosError: $r,
  spread: zr,
  toFormData: Kr,
  AxiosHeaders: Wr,
  HttpStatusCode: Jr,
  formToJSON: Xr,
  getAdapter: Zr,
  mergeConfig: en
} = Y, tn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: qr,
  AxiosError: Dr,
  AxiosHeaders: Wr,
  Cancel: Yr,
  CancelToken: kr,
  CanceledError: Hr,
  HttpStatusCode: Jr,
  VERSION: Gr,
  all: Qr,
  default: Y,
  formToJSON: Xr,
  getAdapter: Zr,
  isAxiosError: $r,
  isCancel: Nr,
  mergeConfig: en,
  spread: zr,
  toFormData: Kr
}, Symbol.toStringTag, { value: "Module" })), Ht = /* @__PURE__ */ ua(tn);
var Q = {}, Je = {};
(function(o) {
  Object.defineProperty(o, "__esModule", { value: !0 }), o.operationServerMap = o.RequiredError = o.BaseAPI = o.COLLECTION_FORMATS = o.BASE_PATH = void 0;
  const c = Ht;
  o.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), o.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class v {
    constructor(m, f = o.BASE_PATH, j = c.default) {
      var V;
      this.basePath = f, this.axios = j, m && (this.configuration = m, this.basePath = (V = m.basePath) !== null && V !== void 0 ? V : f);
    }
  }
  o.BaseAPI = v;
  class e extends Error {
    constructor(m, f) {
      super(f), this.field = m, this.name = "RequiredError";
    }
  }
  o.RequiredError = e, o.operationServerMap = {};
})(Je);
var Xe = de && de.__awaiter || function(o, c, v, e) {
  function O(m) {
    return m instanceof v ? m : new v(function(f) {
      f(m);
    });
  }
  return new (v || (v = Promise))(function(m, f) {
    function j(U) {
      try {
        _(e.next(U));
      } catch (E) {
        f(E);
      }
    }
    function V(U) {
      try {
        _(e.throw(U));
      } catch (E) {
        f(E);
      }
    }
    function _(U) {
      U.done ? m(U.value) : O(U.value).then(j, V);
    }
    _((e = e.apply(o, c || [])).next());
  });
};
Object.defineProperty(Q, "__esModule", { value: !0 });
Q.createRequestFunction = Q.toPathString = Q.serializeDataIfNeeded = Q.setSearchParams = Q.setOAuthToObject = Q.setBearerAuthToObject = Q.setBasicAuthToObject = Q.setApiKeyToObject = Q.assertParamExists = Q.DUMMY_BASE_URL = void 0;
const sn = Je;
Q.DUMMY_BASE_URL = "https://example.com";
const an = function(o, c, v) {
  if (v == null)
    throw new sn.RequiredError(c, `Required parameter ${c} was null or undefined when calling ${o}.`);
};
Q.assertParamExists = an;
const rn = function(o, c, v) {
  return Xe(this, void 0, void 0, function* () {
    if (v && v.apiKey) {
      const e = typeof v.apiKey == "function" ? yield v.apiKey(c) : yield v.apiKey;
      o[c] = e;
    }
  });
};
Q.setApiKeyToObject = rn;
const nn = function(o, c) {
  c && (c.username || c.password) && (o.auth = { username: c.username, password: c.password });
};
Q.setBasicAuthToObject = nn;
const on = function(o, c) {
  return Xe(this, void 0, void 0, function* () {
    if (c && c.accessToken) {
      const v = typeof c.accessToken == "function" ? yield c.accessToken() : yield c.accessToken;
      o.Authorization = "Bearer " + v;
    }
  });
};
Q.setBearerAuthToObject = on;
const ln = function(o, c, v, e) {
  return Xe(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const O = typeof e.accessToken == "function" ? yield e.accessToken(c, v) : yield e.accessToken;
      o.Authorization = "Bearer " + O;
    }
  });
};
Q.setOAuthToObject = ln;
function Qe(o, c, v = "") {
  c != null && (typeof c == "object" ? Array.isArray(c) ? c.forEach((e) => Qe(o, e, v)) : Object.keys(c).forEach((e) => Qe(o, c[e], `${v}${v !== "" ? "." : ""}${e}`)) : o.has(v) ? o.append(v, c) : o.set(v, c));
}
const cn = function(o, ...c) {
  const v = new URLSearchParams(o.search);
  Qe(v, c), o.search = v.toString();
};
Q.setSearchParams = cn;
const dn = function(o, c, v) {
  const e = typeof o != "string";
  return (e && v && v.isJsonMime ? v.isJsonMime(c.headers["Content-Type"]) : e) ? JSON.stringify(o !== void 0 ? o : {}) : o || "";
};
Q.serializeDataIfNeeded = dn;
const un = function(o) {
  return o.pathname + o.search + o.hash;
};
Q.toPathString = un;
const hn = function(o, c, v, e) {
  return (O = c, m = v) => {
    var f;
    const j = Object.assign(Object.assign({}, o.options), { url: (O.defaults.baseURL ? "" : (f = e == null ? void 0 : e.basePath) !== null && f !== void 0 ? f : m) + o.url });
    return O.request(j);
  };
};
Q.createRequestFunction = hn;
(function(o) {
  var c = de && de.__awaiter || function(r, d, l, i) {
    function t(a) {
      return a instanceof l ? a : new l(function(s) {
        s(a);
      });
    }
    return new (l || (l = Promise))(function(a, s) {
      function n(p) {
        try {
          u(i.next(p));
        } catch (A) {
          s(A);
        }
      }
      function h(p) {
        try {
          u(i.throw(p));
        } catch (A) {
          s(A);
        }
      }
      function u(p) {
        p.done ? a(p.value) : t(p.value).then(n, h);
      }
      u((i = i.apply(r, d || [])).next());
    });
  };
  Object.defineProperty(o, "__esModule", { value: !0 }), o.ProductCategoriesApiFactory = o.ProductCategoriesApiFp = o.ProductCategoriesApiAxiosParamCreator = o.PointofsaleApi = o.PointofsaleApiFactory = o.PointofsaleApiFp = o.PointofsaleApiAxiosParamCreator = o.PayoutRequestsApi = o.PayoutRequestsApiFactory = o.PayoutRequestsApiFp = o.PayoutRequestsApiAxiosParamCreator = o.GetAllInvoicesCurrentStateEnum = o.InvoicesApi = o.InvoicesApiFactory = o.InvoicesApiFp = o.InvoicesApiAxiosParamCreator = o.FilesApi = o.FilesApiFactory = o.FilesApiFp = o.FilesApiAxiosParamCreator = o.EventsApi = o.EventsApiFactory = o.EventsApiFp = o.EventsApiAxiosParamCreator = o.DebtorsApi = o.DebtorsApiFactory = o.DebtorsApiFp = o.DebtorsApiAxiosParamCreator = o.ContainersApi = o.ContainersApiFactory = o.ContainersApiFp = o.ContainersApiAxiosParamCreator = o.BannersApi = o.BannersApiFactory = o.BannersApiFp = o.BannersApiAxiosParamCreator = o.GetAllBalanceOrderDirectionEnum = o.GetAllBalanceUserTypesEnum = o.BalanceApi = o.BalanceApiFactory = o.BalanceApiFp = o.BalanceApiAxiosParamCreator = o.AuthenticateApi = o.AuthenticateApiFactory = o.AuthenticateApiFp = o.AuthenticateApiAxiosParamCreator = o.UpdateInvoiceRequestStateEnum = o.PayoutRequestStatusRequestStateEnum = o.InvoiceStatusResponseStateEnum = o.FinancialMutationResponseTypeEnum = void 0, o.VouchergroupsApi = o.VouchergroupsApiFactory = o.VouchergroupsApiFp = o.VouchergroupsApiAxiosParamCreator = o.VatGroupsApi = o.VatGroupsApiFactory = o.VatGroupsApiFp = o.VatGroupsApiAxiosParamCreator = o.GetAllUsersTypeEnum = o.UsersApi = o.UsersApiFactory = o.UsersApiFp = o.UsersApiAxiosParamCreator = o.TransfersApi = o.TransfersApiFactory = o.TransfersApiFp = o.TransfersApiAxiosParamCreator = o.TransactionsApi = o.TransactionsApiFactory = o.TransactionsApiFp = o.TransactionsApiAxiosParamCreator = o.TestOperationsOfTheTestControllerApi = o.TestOperationsOfTheTestControllerApiFactory = o.TestOperationsOfTheTestControllerApiFp = o.TestOperationsOfTheTestControllerApiAxiosParamCreator = o.StripeApi = o.StripeApiFactory = o.StripeApiFp = o.StripeApiAxiosParamCreator = o.RootApi = o.RootApiFactory = o.RootApiFp = o.RootApiAxiosParamCreator = o.RbacApi = o.RbacApiFactory = o.RbacApiFp = o.RbacApiAxiosParamCreator = o.ProductsApi = o.ProductsApiFactory = o.ProductsApiFp = o.ProductsApiAxiosParamCreator = o.ProductCategoriesApi = void 0;
  const v = Ht, e = Q, O = Je;
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
      eanAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("eanAuthentication", "authenticationEanRequest", i);
        const a = "/authentication/ean", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/GEWIS/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", i);
        const a = "/authentication/GEWIS/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", i);
        const a = "/authentication/gewisweb", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("keyAuthentication", "authenticationKeyRequest", i);
        const a = "/authentication/key", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("localAuthentication", "authenticationLocalRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("mockAuthentication", "authenticationMockRequest", i);
        const a = "/authentication/mock", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", i);
        const a = "/authentication/nfc", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("pinAuthentication", "authenticationPinRequest", i);
        const a = "/authentication/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (...d) => c(this, [...d], void 0, function* (l = {}) {
        const i = "/authentication/refreshToken", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, h = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, h);
        let u = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), u), l.headers), {
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
      resetLocal: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocal", "resetLocalRequest", i);
        const a = "/authentication/local/reset", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "PUT" }, n), t), u = {}, p = {};
        u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.AuthenticateApiAxiosParamCreator = m;
  const f = function(r) {
    const d = (0, o.AuthenticateApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.eanAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.gewisLDAPAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.gewisPinAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.gewisWebAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.keyAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.ldapAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.localAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.localAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.mockAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.nfcAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.pinAuthentication(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(l) {
        return c(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield d.refreshToken(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, h = (a = (t = O.operationServerMap["AuthenticateApi.refreshToken"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (u, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(u, h || p);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.resetLocal(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.resetLocal"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.resetLocalWithToken(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.AuthenticateApiFp = f;
  const j = function(r, d, l) {
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
        return i.eanAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(t, a) {
        return i.gewisLDAPAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(t, a) {
        return i.gewisPinAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(t, a) {
        return i.gewisWebAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(t, a) {
        return i.keyAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(t, a) {
        return i.ldapAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(t, a) {
        return i.localAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(t, a) {
        return i.mockAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(t, a) {
        return i.nfcAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(t, a) {
        return i.pinAuthentication(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(t) {
        return i.refreshToken(t).then((a) => a(l, d));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(t, a) {
        return i.resetLocal(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(t, a) {
        return i.resetLocalWithToken(t, a).then((s) => s(l, d));
      }
    };
  };
  o.AuthenticateApiFactory = j;
  class V extends O.BaseAPI {
    /**
     *
     * @summary EAN login and hand out token
     * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).eanAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Key login and hand out token.
     * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).keyAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).ldapAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Local login and hand out token
     * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).localAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Mock login and hand out token.
     * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).mockAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary NFC login and hand out token
     * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).nfcAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token
     * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).pinAuthentication(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(d) {
      return (0, o.AuthenticateApiFp)(this.configuration).refreshToken(d).then((l) => l(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a reset token for the local authentication
     * @param {ResetLocalRequest} resetLocalRequest The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).resetLocal(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(d, l) {
      return (0, o.AuthenticateApiFp)(this.configuration).resetLocalWithToken(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.AuthenticateApi = V;
  const _ = function(r) {
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
      getAllBalance: (d, l, i, t, a, s, n, h, u, p, A, ...P) => c(this, [d, l, i, t, a, s, n, h, u, p, A, ...P], void 0, function* (b, g, y, R, T, x, C, F, L, M, X, k = {}) {
        const K = "/balances/all", le = new URL(K, e.DUMMY_BASE_URL);
        let ae;
        r && (ae = r.baseOptions);
        const D = Object.assign(Object.assign({ method: "GET" }, ae), k), Ae = {}, ee = {};
        yield (0, e.setBearerAuthToObject)(Ae, r), b !== void 0 && (ee.date = b), g !== void 0 && (ee.minBalance = g), y !== void 0 && (ee.maxBalance = y), R !== void 0 && (ee.hasFine = R), T !== void 0 && (ee.minFine = T), x !== void 0 && (ee.maxFine = x), C && (ee.userTypes = C), F !== void 0 && (ee.orderBy = F), L !== void 0 && (ee.orderDirection = L), M !== void 0 && (ee.take = M), X !== void 0 && (ee.skip = X), (0, e.setSearchParams)(le, ee);
        let Xs = ae && ae.headers ? ae.headers : {};
        return D.headers = Object.assign(Object.assign(Object.assign({}, Ae), Xs), k.headers), {
          url: (0, e.toPathString)(le),
          options: D
        };
      }),
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBalanceId", "id", i);
        const a = "/balances/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (...d) => c(this, [...d], void 0, function* (l = {}) {
        const i = "/balances", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, h = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, h);
        let u = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), u), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.BalanceApiAxiosParamCreator = _;
  const U = function(r) {
    const d = (0, o.BalanceApiAxiosParamCreator)(r);
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
      getAllBalance(l, i, t, a, s, n, h, u, p, A, P, b) {
        return c(this, void 0, void 0, function* () {
          var g, y, R;
          const T = yield d.getAllBalance(l, i, t, a, s, n, h, u, p, A, P, b), x = (g = r == null ? void 0 : r.serverIndex) !== null && g !== void 0 ? g : 0, C = (R = (y = O.operationServerMap["BalanceApi.getAllBalance"]) === null || y === void 0 ? void 0 : y[x]) === null || R === void 0 ? void 0 : R.url;
          return (F, L) => (0, e.createRequestFunction)(T, v.default, O.BASE_PATH, r)(F, C || L);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getBalanceId(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["BalanceApi.getBalanceId"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(l) {
        return c(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield d.getBalances(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, h = (a = (t = O.operationServerMap["BalanceApi.getBalances"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (u, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(u, h || p);
        });
      }
    };
  };
  o.BalanceApiFp = U;
  const E = function(r, d, l) {
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
      getAllBalance(t, a, s, n, h, u, p, A, P, b, g, y) {
        return i.getAllBalance(t, a, s, n, h, u, p, A, P, b, g, y).then((R) => R(l, d));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(t, a) {
        return i.getBalanceId(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(t) {
        return i.getBalances(t).then((a) => a(l, d));
      }
    };
  };
  o.BalanceApiFactory = E;
  class N extends O.BaseAPI {
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
    getAllBalance(d, l, i, t, a, s, n, h, u, p, A, P) {
      return (0, o.BalanceApiFp)(this.configuration).getAllBalance(d, l, i, t, a, s, n, h, u, p, A, P).then((b) => b(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(d, l) {
      return (0, o.BalanceApiFp)(this.configuration).getBalanceId(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(d) {
      return (0, o.BalanceApiFp)(this.configuration).getBalances(d).then((l) => l(this.axios, this.basePath));
    }
  }
  o.BalanceApi = N, o.GetAllBalanceUserTypesEnum = {}, o.GetAllBalanceOrderDirectionEnum = {
    Asc: "ASC",
    Desc: "DESC"
  };
  const q = function(r) {
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("_delete", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("create", "bannerRequest", i);
        const a = "/banners", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getActive: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners/active", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getAllBanners: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getAllOpenBanners: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/open/banners", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getBanner: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBanner", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      update: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("update", "id", t), (0, e.assertParamExists)("update", "bannerRequest", a);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateImage: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateImage", "id", t);
        const n = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, u), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(h, P);
        let g = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), g), s.headers), p.data = b, {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.BannersApiAxiosParamCreator = q;
  const B = function(r) {
    const d = (0, o.BannersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d._delete(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["BannersApi._delete"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.create(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["BannersApi.create"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getActive(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getActive"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllBanners(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getAllBanners"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllOpenBanners(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.getAllOpenBanners"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getBanner(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["BannersApi.getBanner"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.update(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.update"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateImage(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["BannersApi.updateImage"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.BannersApiFp = B;
  const I = function(r, d, l) {
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
        return i._delete(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(t, a) {
        return i.create(t, a).then((s) => s(l, d));
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
        return i.getActive(t, a, s).then((n) => n(l, d));
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
        return i.getAllBanners(t, a, s).then((n) => n(l, d));
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
        return i.getAllOpenBanners(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(t, a) {
        return i.getBanner(t, a).then((s) => s(l, d));
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
        return i.update(t, a, s).then((n) => n(l, d));
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
        return i.updateImage(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.BannersApiFactory = I;
  class W extends O.BaseAPI {
    /**
     *
     * @summary Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(d, l) {
      return (0, o.BannersApiFp)(this.configuration)._delete(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Saves a banner to the database
     * @param {BannerRequest} bannerRequest The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(d, l) {
      return (0, o.BannersApiFp)(this.configuration).create(d, l).then((i) => i(this.axios, this.basePath));
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
    getActive(d, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getActive(d, l, i).then((t) => t(this.axios, this.basePath));
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
    getAllBanners(d, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getAllBanners(d, l, i).then((t) => t(this.axios, this.basePath));
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
    getAllOpenBanners(d, l, i) {
      return (0, o.BannersApiFp)(this.configuration).getAllOpenBanners(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(d, l) {
      return (0, o.BannersApiFp)(this.configuration).getBanner(d, l).then((i) => i(this.axios, this.basePath));
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
    update(d, l, i) {
      return (0, o.BannersApiFp)(this.configuration).update(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateImage(d, l, i) {
      return (0, o.BannersApiFp)(this.configuration).updateImage(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.BannersApi = W;
  const J = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createContainer", "createContainerRequest", i);
        const a = "/containers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllContainers: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getProductsContainer: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getProductsContainer", "id", a);
        const u = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getPublicContainers: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers/public", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getSingleContainer: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateContainer: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateContainer", "id", t), (0, e.assertParamExists)("updateContainer", "updateContainerRequest", a);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.ContainersApiAxiosParamCreator = J;
  const se = function(r) {
    const d = (0, o.ContainersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createContainer(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ContainersApi.createContainer"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllContainers(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.getAllContainers"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getProductsContainer(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["ContainersApi.getProductsContainer"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getPublicContainers(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.getPublicContainers"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleContainer(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ContainersApi.getSingleContainer"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateContainer(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ContainersApi.updateContainer"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ContainersApiFp = se;
  const H = function(r, d, l) {
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
        return i.createContainer(t, a).then((s) => s(l, d));
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
        return i.getAllContainers(t, a, s).then((n) => n(l, d));
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
        return i.getProductsContainer(t, a, s, n).then((h) => h(l, d));
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
        return i.getPublicContainers(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(t, a) {
        return i.getSingleContainer(t, a).then((s) => s(l, d));
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
        return i.updateContainer(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.ContainersApiFactory = H;
  class ue extends O.BaseAPI {
    /**
     *
     * @summary Create a new container.
     * @param {CreateContainerRequest} createContainerRequest    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(d, l) {
      return (0, o.ContainersApiFp)(this.configuration).createContainer(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllContainers(d, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).getAllContainers(d, l, i).then((t) => t(this.axios, this.basePath));
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
    getProductsContainer(d, l, i, t) {
      return (0, o.ContainersApiFp)(this.configuration).getProductsContainer(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getPublicContainers(d, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).getPublicContainers(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(d, l) {
      return (0, o.ContainersApiFp)(this.configuration).getSingleContainer(d, l).then((i) => i(this.axios, this.basePath));
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
    updateContainer(d, l, i) {
      return (0, o.ContainersApiFp)(this.configuration).updateContainer(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ContainersApi = ue;
  const Ce = function(r) {
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("calculateFines", "referenceDates", t);
        const n = "/fines/eligible", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), a && (P.userTypes = a), t && (P.referenceDates = t), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      deleteFine: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFine", "id", i);
        const a = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("handoutFines", "handoutFinesRequest", i);
        const a = "/fines/handout", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", i);
        const a = "/fines/notify", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      returnAllFineHandoutEvents: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/fines", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      returnSingleFineHandoutEvent: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("returnSingleFineHandoutEvent", "id", i);
        const a = "/fines/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.DebtorsApiAxiosParamCreator = Ce;
  const ie = function(r) {
    const d = (0, o.DebtorsApiAxiosParamCreator)(r);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.calculateFines(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["DebtorsApi.calculateFines"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteFine(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["DebtorsApi.deleteFine"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.handoutFines(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["DebtorsApi.handoutFines"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.notifyAboutFutureFines(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.returnAllFineHandoutEvents(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.returnSingleFineHandoutEvent(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.DebtorsApiFp = ie;
  const oe = function(r, d, l) {
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
        return i.calculateFines(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(t, a) {
        return i.deleteFine(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(t, a) {
        return i.handoutFines(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(t, a) {
        return i.notifyAboutFutureFines(t, a).then((s) => s(l, d));
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
        return i.returnAllFineHandoutEvents(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(t, a) {
        return i.returnSingleFineHandoutEvent(t, a).then((s) => s(l, d));
      }
    };
  };
  o.DebtorsApiFactory = oe;
  class ge extends O.BaseAPI {
    /**
     *
     * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
     * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
     * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    calculateFines(d, l, i) {
      return (0, o.DebtorsApiFp)(this.configuration).calculateFines(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine
     * @param {number} id The id of the fine which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    deleteFine(d, l) {
      return (0, o.DebtorsApiFp)(this.configuration).deleteFine(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    handoutFines(d, l) {
      return (0, o.DebtorsApiFp)(this.configuration).handoutFines(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Send an email to all given users about their possible future fine.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    notifyAboutFutureFines(d, l) {
      return (0, o.DebtorsApiFp)(this.configuration).notifyAboutFutureFines(d, l).then((i) => i(this.axios, this.basePath));
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
    returnAllFineHandoutEvents(d, l, i) {
      return (0, o.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} id The id of the fine handout event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnSingleFineHandoutEvent(d, l) {
      return (0, o.DebtorsApiFp)(this.configuration).returnSingleFineHandoutEvent(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.DebtorsApi = ge;
  const Nt = function(r) {
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
      assignEventShift: (d, l, i, t, ...a) => c(this, [d, l, i, t, ...a], void 0, function* (s, n, h, u, p = {}) {
        (0, e.assertParamExists)("assignEventShift", "eventId", s), (0, e.assertParamExists)("assignEventShift", "shiftId", n), (0, e.assertParamExists)("assignEventShift", "userId", h), (0, e.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", u);
        const A = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(h))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "PUT" }, b), p), y = {}, R = {};
        yield (0, e.setBearerAuthToObject)(y, r), y["Content-Type"] = "application/json", (0, e.setSearchParams)(P, R);
        let T = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, y), T), p.headers), g.data = (0, e.serializeDataIfNeeded)(u, g, r), {
          url: (0, e.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEvent", "createEventRequest", i);
        const a = "/events", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEventShift", "createShiftRequest", i);
        const a = "/eventshifts", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEventShift", "id", i);
        const a = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllEventShifts: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/eventshifts", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getAllEvents: (d, l, i, t, a, s, n, ...h) => c(this, [d, l, i, t, a, s, n, ...h], void 0, function* (u, p, A, P, b, g, y, R = {}) {
        const T = "/events", x = new URL(T, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), R), L = {}, M = {};
        yield (0, e.setBearerAuthToObject)(L, r), u !== void 0 && (M.name = u), p !== void 0 && (M.createdById = p), A !== void 0 && (M.beforeDate = A), P !== void 0 && (M.afterDate = P), b !== void 0 && (M.type = b), g !== void 0 && (M.take = g), y !== void 0 && (M.skip = y), (0, e.setSearchParams)(x, M);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), R.headers), {
          url: (0, e.toPathString)(x),
          options: F
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
      getEventShiftCount: (d, l, i, t, ...a) => c(this, [d, l, i, t, ...a], void 0, function* (s, n, h, u, p = {}) {
        (0, e.assertParamExists)("getEventShiftCount", "id", s);
        const A = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(s))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "GET" }, b), p), y = {}, R = {};
        yield (0, e.setBearerAuthToObject)(y, r), n !== void 0 && (R.eventType = n), h !== void 0 && (R.afterDate = h), u !== void 0 && (R.beforeDate = u), (0, e.setSearchParams)(P, R);
        let T = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, y), T), p.headers), {
          url: (0, e.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateEvent: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEvent", "id", t), (0, e.assertParamExists)("updateEvent", "updateEventRequest", a);
        const n = "/events/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateEventShift: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEventShift", "id", t), (0, e.assertParamExists)("updateEventShift", "updateShiftRequest", a);
        const n = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateEventShiftAvailability: (d, l, i, t, ...a) => c(this, [d, l, i, t, ...a], void 0, function* (s, n, h, u, p = {}) {
        (0, e.assertParamExists)("updateEventShiftAvailability", "eventId", s), (0, e.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, e.assertParamExists)("updateEventShiftAvailability", "userId", h), (0, e.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", u);
        const A = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(h))), P = new URL(A, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "POST" }, b), p), y = {}, R = {};
        yield (0, e.setBearerAuthToObject)(y, r), y["Content-Type"] = "application/json", (0, e.setSearchParams)(P, R);
        let T = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, y), T), p.headers), g.data = (0, e.serializeDataIfNeeded)(u, g, r), {
          url: (0, e.toPathString)(P),
          options: g
        };
      })
    };
  };
  o.EventsApiAxiosParamCreator = Nt;
  const kt = function(r) {
    const d = (0, o.EventsApiAxiosParamCreator)(r);
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
        return c(this, void 0, void 0, function* () {
          var n, h, u;
          const p = yield d.assignEventShift(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (u = (h = O.operationServerMap["EventsApi.assignEventShift"]) === null || h === void 0 ? void 0 : h[A]) === null || u === void 0 ? void 0 : u.url;
          return (b, g) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || g);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createEvent(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["EventsApi.createEvent"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createEventShift(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["EventsApi.createEventShift"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteEvent(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["EventsApi.deleteEvent"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteEventShift(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["EventsApi.deleteEventShift"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllEventShifts(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.getAllEventShifts"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
      getAllEvents(l, i, t, a, s, n, h, u) {
        return c(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield d.getAllEvents(l, i, t, a, s, n, h, u), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, y = (P = (A = O.operationServerMap["EventsApi.getAllEvents"]) === null || A === void 0 ? void 0 : A[g]) === null || P === void 0 ? void 0 : P.url;
          return (R, T) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(R, y || T);
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
        return c(this, void 0, void 0, function* () {
          var n, h, u;
          const p = yield d.getEventShiftCount(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (u = (h = O.operationServerMap["EventsApi.getEventShiftCount"]) === null || h === void 0 ? void 0 : h[A]) === null || u === void 0 ? void 0 : u.url;
          return (b, g) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || g);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleEvent(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["EventsApi.getSingleEvent"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateEvent(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.updateEvent"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateEventShift(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["EventsApi.updateEventShift"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var n, h, u;
          const p = yield d.updateEventShiftAvailability(l, i, t, a, s), A = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (u = (h = O.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || h === void 0 ? void 0 : h[A]) === null || u === void 0 ? void 0 : u.url;
          return (b, g) => (0, e.createRequestFunction)(p, v.default, O.BASE_PATH, r)(b, P || g);
        });
      }
    };
  };
  o.EventsApiFp = kt;
  const Gt = function(r, d, l) {
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
      assignEventShift(t, a, s, n, h) {
        return i.assignEventShift(t, a, s, n, h).then((u) => u(l, d));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(t, a) {
        return i.createEvent(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(t, a) {
        return i.createEventShift(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(t, a) {
        return i.deleteEvent(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(t, a) {
        return i.deleteEventShift(t, a).then((s) => s(l, d));
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
        return i.getAllEventShifts(t, a, s).then((n) => n(l, d));
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
      getAllEvents(t, a, s, n, h, u, p, A) {
        return i.getAllEvents(t, a, s, n, h, u, p, A).then((P) => P(l, d));
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
      getEventShiftCount(t, a, s, n, h) {
        return i.getEventShiftCount(t, a, s, n, h).then((u) => u(l, d));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(t, a) {
        return i.getSingleEvent(t, a).then((s) => s(l, d));
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
        return i.updateEvent(t, a, s).then((n) => n(l, d));
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
        return i.updateEventShift(t, a, s).then((n) => n(l, d));
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
      updateEventShiftAvailability(t, a, s, n, h) {
        return i.updateEventShiftAvailability(t, a, s, n, h).then((u) => u(l, d));
      }
    };
  };
  o.EventsApiFactory = Gt;
  class Qt extends O.BaseAPI {
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
    assignEventShift(d, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).assignEventShift(d, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event with its corresponding answers objects
     * @param {CreateEventRequest} createEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEvent(d, l) {
      return (0, o.EventsApiFp)(this.configuration).createEvent(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event shift
     * @param {CreateShiftRequest} createShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEventShift(d, l) {
      return (0, o.EventsApiFp)(this.configuration).createEventShift(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEvent(d, l) {
      return (0, o.EventsApiFp)(this.configuration).deleteEvent(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event shift with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEventShift(d, l) {
      return (0, o.EventsApiFp)(this.configuration).deleteEventShift(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllEventShifts(d, l, i) {
      return (0, o.EventsApiFp)(this.configuration).getAllEventShifts(d, l, i).then((t) => t(this.axios, this.basePath));
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
    getAllEvents(d, l, i, t, a, s, n, h) {
      return (0, o.EventsApiFp)(this.configuration).getAllEvents(d, l, i, t, a, s, n, h).then((u) => u(this.axios, this.basePath));
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
    getEventShiftCount(d, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).getEventShiftCount(d, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single event with its answers and shifts
     * @param {number} id The id of the event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getSingleEvent(d, l) {
      return (0, o.EventsApiFp)(this.configuration).getSingleEvent(d, l).then((i) => i(this.axios, this.basePath));
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
    updateEvent(d, l, i) {
      return (0, o.EventsApiFp)(this.configuration).updateEvent(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateEventShift(d, l, i) {
      return (0, o.EventsApiFp)(this.configuration).updateEventShift(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateEventShiftAvailability(d, l, i, t, a) {
      return (0, o.EventsApiFp)(this.configuration).updateEventShiftAvailability(d, l, i, t, a).then((s) => s(this.axios, this.basePath));
    }
  }
  o.EventsApi = Qt;
  const Yt = function(r) {
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("createFile", "name", t);
        const n = "/files", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, u), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && b.append("name", t), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(h, P);
        let g = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), g), s.headers), p.data = b, {
          url: (0, e.toPathString)(h),
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
      deleteFile: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.FilesApiAxiosParamCreator = Yt;
  const $t = function(r) {
    const d = (0, o.FilesApiAxiosParamCreator)(r);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.createFile(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["FilesApi.createFile"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteFile(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["FilesApi.deleteFile"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getFile(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["FilesApi.getFile"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.FilesApiFp = $t;
  const zt = function(r, d, l) {
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
        return i.createFile(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(t, a) {
        return i.deleteFile(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(t, a) {
        return i.getFile(t, a).then((s) => s(l, d));
      }
    };
  };
  o.FilesApiFactory = zt;
  class Kt extends O.BaseAPI {
    /**
     *
     * @summary Upload a file with the given name.
     * @param {string} name The name of the file
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(d, l, i) {
      return (0, o.FilesApiFp)(this.configuration).createFile(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(d, l) {
      return (0, o.FilesApiFp)(this.configuration).deleteFile(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(d, l) {
      return (0, o.FilesApiFp)(this.configuration).getFile(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.FilesApi = Kt;
  const Wt = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createInvoice", "createInvoiceRequest", i);
        const a = "/invoices", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteInvoice", "id", i);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllInvoices: (d, l, i, t, a, s, n, h, ...u) => c(this, [d, l, i, t, a, s, n, h, ...u], void 0, function* (p, A, P, b, g, y, R, T, x = {}) {
        const C = "/invoices", F = new URL(C, e.DUMMY_BASE_URL);
        let L;
        r && (L = r.baseOptions);
        const M = Object.assign(Object.assign({ method: "GET" }, L), x), X = {}, k = {};
        yield (0, e.setBearerAuthToObject)(X, r), p !== void 0 && (k.toId = p), A !== void 0 && (k.invoiceId = A), P && (k.currentState = P), b !== void 0 && (k.returnEntries = b), g !== void 0 && (k.fromDate = g), y !== void 0 && (k.tillDate = y), R !== void 0 && (k.take = R), T !== void 0 && (k.skip = T), (0, e.setSearchParams)(F, k);
        let K = L && L.headers ? L.headers : {};
        return M.headers = Object.assign(Object.assign(Object.assign({}, X), K), x.headers), {
          url: (0, e.toPathString)(F),
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
      getSingleInvoice: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getSingleInvoice", "id", t);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && (P.returnEntries = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      updateInvoice: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateInvoice", "id", t), (0, e.assertParamExists)("updateInvoice", "updateInvoiceRequest", a);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.InvoicesApiAxiosParamCreator = Wt;
  const Jt = function(r) {
    const d = (0, o.InvoicesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createInvoice(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["InvoicesApi.createInvoice"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteInvoice(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["InvoicesApi.deleteInvoice"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
      getAllInvoices(l, i, t, a, s, n, h, u, p) {
        return c(this, void 0, void 0, function* () {
          var A, P, b;
          const g = yield d.getAllInvoices(l, i, t, a, s, n, h, u, p), y = (A = r == null ? void 0 : r.serverIndex) !== null && A !== void 0 ? A : 0, R = (b = (P = O.operationServerMap["InvoicesApi.getAllInvoices"]) === null || P === void 0 ? void 0 : P[y]) === null || b === void 0 ? void 0 : b.url;
          return (T, x) => (0, e.createRequestFunction)(g, v.default, O.BASE_PATH, r)(T, R || x);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getSingleInvoice(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateInvoice(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["InvoicesApi.updateInvoice"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.InvoicesApiFp = Jt;
  const Xt = function(r, d, l) {
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
        return i.createInvoice(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(t, a) {
        return i.deleteInvoice(t, a).then((s) => s(l, d));
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
      getAllInvoices(t, a, s, n, h, u, p, A, P) {
        return i.getAllInvoices(t, a, s, n, h, u, p, A, P).then((b) => b(l, d));
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
        return i.getSingleInvoice(t, a, s).then((n) => n(l, d));
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
        return i.updateInvoice(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.InvoicesApiFactory = Xt;
  class Zt extends O.BaseAPI {
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(d, l) {
      return (0, o.InvoicesApiFp)(this.configuration).createInvoice(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(d, l) {
      return (0, o.InvoicesApiFp)(this.configuration).deleteInvoice(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllInvoices(d, l, i, t, a, s, n, h, u) {
      return (0, o.InvoicesApiFp)(this.configuration).getAllInvoices(d, l, i, t, a, s, n, h, u).then((p) => p(this.axios, this.basePath));
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
    getSingleInvoice(d, l, i) {
      return (0, o.InvoicesApiFp)(this.configuration).getSingleInvoice(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateInvoice(d, l, i) {
      return (0, o.InvoicesApiFp)(this.configuration).updateInvoice(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.InvoicesApi = Zt, o.GetAllInvoicesCurrentStateEnum = {};
  const es = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequestRequest", i);
        const a = "/payoutrequests", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllPayoutRequests: (d, l, i, t, a, s, n, ...h) => c(this, [d, l, i, t, a, s, n, ...h], void 0, function* (u, p, A, P, b, g, y, R = {}) {
        const T = "/payoutrequests", x = new URL(T, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), R), L = {}, M = {};
        if (yield (0, e.setBearerAuthToObject)(L, r), u !== void 0)
          for (const [k, K] of Object.entries(u))
            M[k] = K;
        if (p !== void 0)
          for (const [k, K] of Object.entries(p))
            M[k] = K;
        A !== void 0 && (M.fromDate = A), P !== void 0 && (M.tillDate = P), b !== void 0 && (M.status = b), g !== void 0 && (M.take = g), y !== void 0 && (M.skip = y), (0, e.setSearchParams)(x, M);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), R.headers), {
          url: (0, e.toPathString)(x),
          options: F
        };
      }),
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", i);
        const a = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      setPayoutRequestStatus: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", t), (0, e.assertParamExists)("setPayoutRequestStatus", "payoutRequestStatusRequest", a);
        const n = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.PayoutRequestsApiAxiosParamCreator = es;
  const ts = function(r) {
    const d = (0, o.PayoutRequestsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createPayoutRequest(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
      getAllPayoutRequests(l, i, t, a, s, n, h, u) {
        return c(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield d.getAllPayoutRequests(l, i, t, a, s, n, h, u), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, y = (P = (A = O.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || A === void 0 ? void 0 : A[g]) === null || P === void 0 ? void 0 : P.url;
          return (R, T) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(R, y || T);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSinglePayoutRequest(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.setPayoutRequestStatus(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.PayoutRequestsApiFp = ts;
  const ss = function(r, d, l) {
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
        return i.createPayoutRequest(t, a).then((s) => s(l, d));
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
      getAllPayoutRequests(t, a, s, n, h, u, p, A) {
        return i.getAllPayoutRequests(t, a, s, n, h, u, p, A).then((P) => P(l, d));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(t, a) {
        return i.getSinglePayoutRequest(t, a).then((s) => s(l, d));
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
        return i.setPayoutRequestStatus(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.PayoutRequestsApiFactory = ss;
  class as extends O.BaseAPI {
    /**
     *
     * @summary Create a new payout request
     * @param {PayoutRequestRequest} payoutRequestRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(d, l) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllPayoutRequests(d, l, i, t, a, s, n, h) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(d, l, i, t, a, s, n, h).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(d, l) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(d, l).then((i) => i(this.axios, this.basePath));
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
    setPayoutRequestStatus(d, l, i) {
      return (0, o.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.PayoutRequestsApi = as;
  const rs = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPointOfSale", "createPointOfSaleRequest", i);
        const a = "/pointsofsale", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllPointOfSaleContainers: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", a);
        const u = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getAllPointOfSaleProducts: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", a);
        const u = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getAllPointsOfSale: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/pointsofsale", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getSinglePointOfSale: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getTransactions: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getTransactions", "id", a);
        const u = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      updatePointOfSale: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updatePointOfSale", "id", t), (0, e.assertParamExists)("updatePointOfSale", "updatePointOfSaleRequest", a);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.PointofsaleApiAxiosParamCreator = rs;
  const ns = function(r) {
    const d = (0, o.PointofsaleApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createPointOfSale(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getAllPointOfSaleContainers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getAllPointOfSaleProducts(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllPointsOfSale(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSinglePointOfSale(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getTransactions(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["PointofsaleApi.getTransactions"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updatePointOfSale(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.PointofsaleApiFp = ns;
  const is = function(r, d, l) {
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
        return i.createPointOfSale(t, a).then((s) => s(l, d));
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
        return i.getAllPointOfSaleContainers(t, a, s, n).then((h) => h(l, d));
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
        return i.getAllPointOfSaleProducts(t, a, s, n).then((h) => h(l, d));
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
        return i.getAllPointsOfSale(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(t, a) {
        return i.getSinglePointOfSale(t, a).then((s) => s(l, d));
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
        return i.getTransactions(t, a, s, n).then((h) => h(l, d));
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
        return i.updatePointOfSale(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.PointofsaleApiFactory = is;
  class os extends O.BaseAPI {
    /**
     *
     * @summary Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(d, l) {
      return (0, o.PointofsaleApiFp)(this.configuration).createPointOfSale(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllPointOfSaleContainers(d, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getAllPointOfSaleProducts(d, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getAllPointsOfSale(d, l, i) {
      return (0, o.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(d, l) {
      return (0, o.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(d, l).then((i) => i(this.axios, this.basePath));
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
    getTransactions(d, l, i, t) {
      return (0, o.PointofsaleApiFp)(this.configuration).getTransactions(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    updatePointOfSale(d, l, i) {
      return (0, o.PointofsaleApiFp)(this.configuration).updatePointOfSale(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.PointofsaleApi = os;
  const ls = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProductCategory", "productCategoryRequest", i);
        const a = "/productcategories", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllProductCategories: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/productcategories", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getSingleProductCategory: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProductCategory", "id", i);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateProductCategory: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductCategory", "id", t), (0, e.assertParamExists)("updateProductCategory", "productCategoryRequest", a);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.ProductCategoriesApiAxiosParamCreator = ls;
  const cs = function(r) {
    const d = (0, o.ProductCategoriesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createProductCategory(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllProductCategories(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleProductCategory(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateProductCategory(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ProductCategoriesApiFp = cs;
  const ds = function(r, d, l) {
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
        return i.createProductCategory(t, a).then((s) => s(l, d));
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
        return i.getAllProductCategories(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(t, a) {
        return i.getSingleProductCategory(t, a).then((s) => s(l, d));
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
        return i.updateProductCategory(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.ProductCategoriesApiFactory = ds;
  class us extends O.BaseAPI {
    /**
     *
     * @summary Post a new productCategory.
     * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(d, l) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).createProductCategory(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllProductCategories(d, l, i) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(d, l) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(d, l).then((i) => i(this.axios, this.basePath));
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
    updateProductCategory(d, l, i) {
      return (0, o.ProductCategoriesApiFp)(this.configuration).updateProductCategory(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ProductCategoriesApi = us;
  const hs = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProduct", "createProductRequest", i);
        const a = "/products", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllProducts: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/products", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getSingleProduct: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateProduct: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProduct", "id", t), (0, e.assertParamExists)("updateProduct", "updateProductRequest", a);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateProductImage: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductImage", "id", t);
        const n = "/products/{id}/image".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, u), s), A = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(A, r), a !== void 0 && b.append("file", a), A["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(h, P);
        let g = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), g), s.headers), p.data = b, {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.ProductsApiAxiosParamCreator = hs;
  const ps = function(r) {
    const d = (0, o.ProductsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createProduct(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ProductsApi.createProduct"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllProducts(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.getAllProducts"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleProduct(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["ProductsApi.getSingleProduct"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateProduct(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.updateProduct"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateProductImage(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["ProductsApi.updateProductImage"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.ProductsApiFp = ps;
  const As = function(r, d, l) {
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
        return i.createProduct(t, a).then((s) => s(l, d));
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
        return i.getAllProducts(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(t, a) {
        return i.getSingleProduct(t, a).then((s) => s(l, d));
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
        return i.updateProduct(t, a, s).then((n) => n(l, d));
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
        return i.updateProductImage(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.ProductsApiFactory = As;
  class vs extends O.BaseAPI {
    /**
     *
     * @summary Create a new product.
     * @param {CreateProductRequest} createProductRequest The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(d, l) {
      return (0, o.ProductsApiFp)(this.configuration).createProduct(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllProducts(d, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).getAllProducts(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(d, l) {
      return (0, o.ProductsApiFp)(this.configuration).getSingleProduct(d, l).then((i) => i(this.axios, this.basePath));
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
    updateProduct(d, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).updateProduct(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateProductImage(d, l, i) {
      return (0, o.ProductsApiFp)(this.configuration).updateProductImage(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.ProductsApi = vs;
  const Os = function(r) {
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (...d) => c(this, [...d], void 0, function* (l = {}) {
        const i = "/rbac/roles", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, h = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, h);
        let u = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), u), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.RbacApiAxiosParamCreator = Os;
  const Ps = function(r) {
    const d = (0, o.RbacApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(l) {
        return c(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield d.getAllRoles(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, h = (a = (t = O.operationServerMap["RbacApi.getAllRoles"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (u, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(u, h || p);
        });
      }
    };
  };
  o.RbacApiFp = Ps;
  const bs = function(r, d, l) {
    const i = (0, o.RbacApiFp)(r);
    return {
      /**
       *
       * @summary Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(t) {
        return i.getAllRoles(t).then((a) => a(l, d));
      }
    };
  };
  o.RbacApiFactory = bs;
  class ms extends O.BaseAPI {
    /**
     *
     * @summary Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(d) {
      return (0, o.RbacApiFp)(this.configuration).getAllRoles(d).then((l) => l(this.axios, this.basePath));
    }
  }
  o.RbacApi = ms;
  const fs = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (...d) => c(this, [...d], void 0, function* (l = {}) {
        const i = "/ping", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), l), n = {}, h = {};
        (0, e.setSearchParams)(t, h);
        let u = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), u), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.RootApiAxiosParamCreator = fs;
  const Ss = function(r) {
    const d = (0, o.RootApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(l) {
        return c(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield d.ping(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, h = (a = (t = O.operationServerMap["RootApi.ping"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (u, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(u, h || p);
        });
      }
    };
  };
  o.RootApiFp = Ss;
  const gs = function(r, d, l) {
    const i = (0, o.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(t) {
        return i.ping(t).then((a) => a(l, d));
      }
    };
  };
  o.RootApiFactory = gs;
  class js extends O.BaseAPI {
    /**
     *
     * @summary Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(d) {
      return (0, o.RootApiFp)(this.configuration).ping(d).then((l) => l(this.axios, this.basePath));
    }
  }
  o.RootApi = js;
  const Us = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deposit", "stripeRequest", i);
        const a = "/stripe/deposit", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.StripeApiAxiosParamCreator = Us;
  const ys = function(r) {
    const d = (0, o.StripeApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deposit(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["StripeApi.deposit"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.StripeApiFp = ys;
  const _s = function(r, d, l) {
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
        return i.deposit(t, a).then((s) => s(l, d));
      }
    };
  };
  o.StripeApiFactory = _s;
  class Vs extends O.BaseAPI {
    /**
     *
     * @summary Start the stripe deposit flow
     * @param {StripeRequest} stripeRequest The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(d, l) {
      return (0, o.StripeApiFp)(this.configuration).deposit(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.StripeApi = Vs;
  const Rs = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (...d) => c(this, [...d], void 0, function* (l = {}) {
        const i = "/test/helloworld", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), l), n = {}, h = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, h);
        let u = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), u), l.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  o.TestOperationsOfTheTestControllerApiAxiosParamCreator = Rs;
  const Es = function(r) {
    const d = (0, o.TestOperationsOfTheTestControllerApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(l) {
        return c(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield d.helloworld(l), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, h = (a = (t = O.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (u, p) => (0, e.createRequestFunction)(s, v.default, O.BASE_PATH, r)(u, h || p);
        });
      }
    };
  };
  o.TestOperationsOfTheTestControllerApiFp = Es;
  const Ts = function(r, d, l) {
    const i = (0, o.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(t) {
        return i.helloworld(t).then((a) => a(l, d));
      }
    };
  };
  o.TestOperationsOfTheTestControllerApiFactory = Ts;
  class Bs extends O.BaseAPI {
    /**
     *
     * @summary Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestOperationsOfTheTestControllerApi
     */
    helloworld(d) {
      return (0, o.TestOperationsOfTheTestControllerApiFp)(this.configuration).helloworld(d).then((l) => l(this.axios, this.basePath));
    }
  }
  o.TestOperationsOfTheTestControllerApi = Bs;
  const Fs = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransaction", "transactionRequest", i);
        const a = "/transactions", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllTransactions: (d, l, i, t, a, s, n, h, u, p, ...A) => c(this, [d, l, i, t, a, s, n, h, u, p, ...A], void 0, function* (P, b, g, y, R, T, x, C, F, L, M = {}) {
        const X = "/transactions", k = new URL(X, e.DUMMY_BASE_URL);
        let K;
        r && (K = r.baseOptions);
        const le = Object.assign(Object.assign({ method: "GET" }, K), M), ae = {}, D = {};
        yield (0, e.setBearerAuthToObject)(ae, r), P !== void 0 && (D.fromId = P), b !== void 0 && (D.createdById = b), g !== void 0 && (D.toId = g), y !== void 0 && (D.pointOfSaleId = y), R !== void 0 && (D.productId = R), T !== void 0 && (D.productRevision = T), x !== void 0 && (D.fromDate = x), C !== void 0 && (D.tillDate = C), F !== void 0 && (D.take = F), L !== void 0 && (D.skip = L), (0, e.setSearchParams)(k, D);
        let Ae = K && K.headers ? K.headers : {};
        return le.headers = Object.assign(Object.assign(Object.assign({}, ae), Ae), M.headers), {
          url: (0, e.toPathString)(k),
          options: le
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateTransaction: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateTransaction", "id", t), (0, e.assertParamExists)("updateTransaction", "transactionRequest", a);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      validateTransaction: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("validateTransaction", "transactionRequest", i);
        const a = "/transactions/validate", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.TransactionsApiAxiosParamCreator = Fs;
  const Cs = function(r) {
    const d = (0, o.TransactionsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createTransaction(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransactionsApi.createTransaction"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteTransaction(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransactionsApi.deleteTransaction"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
      getAllTransactions(l, i, t, a, s, n, h, u, p, A, P) {
        return c(this, void 0, void 0, function* () {
          var b, g, y;
          const R = yield d.getAllTransactions(l, i, t, a, s, n, h, u, p, A, P), T = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, x = (y = (g = O.operationServerMap["TransactionsApi.getAllTransactions"]) === null || g === void 0 ? void 0 : g[T]) === null || y === void 0 ? void 0 : y.url;
          return (C, F) => (0, e.createRequestFunction)(R, v.default, O.BASE_PATH, r)(C, x || F);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleTransaction(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateTransaction(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["TransactionsApi.updateTransaction"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.validateTransaction(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransactionsApi.validateTransaction"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.TransactionsApiFp = Cs;
  const ws = function(r, d, l) {
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
        return i.createTransaction(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(t, a) {
        return i.deleteTransaction(t, a).then((s) => s(l, d));
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
      getAllTransactions(t, a, s, n, h, u, p, A, P, b, g) {
        return i.getAllTransactions(t, a, s, n, h, u, p, A, P, b, g).then((y) => y(l, d));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(t, a) {
        return i.getSingleTransaction(t, a).then((s) => s(l, d));
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
        return i.updateTransaction(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(t, a) {
        return i.validateTransaction(t, a).then((s) => s(l, d));
      }
    };
  };
  o.TransactionsApiFactory = ws;
  class Is extends O.BaseAPI {
    /**
     *
     * @summary Creates a new transaction
     * @param {TransactionRequest} transactionRequest The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(d, l) {
      return (0, o.TransactionsApiFp)(this.configuration).createTransaction(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(d, l) {
      return (0, o.TransactionsApiFp)(this.configuration).deleteTransaction(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllTransactions(d, l, i, t, a, s, n, h, u, p, A) {
      return (0, o.TransactionsApiFp)(this.configuration).getAllTransactions(d, l, i, t, a, s, n, h, u, p, A).then((P) => P(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(d, l) {
      return (0, o.TransactionsApiFp)(this.configuration).getSingleTransaction(d, l).then((i) => i(this.axios, this.basePath));
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
    updateTransaction(d, l, i) {
      return (0, o.TransactionsApiFp)(this.configuration).updateTransaction(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transactionRequest The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(d, l) {
      return (0, o.TransactionsApiFp)(this.configuration).validateTransaction(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.TransactionsApi = Is;
  const Ms = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransfer", "transferRequest", i);
        const a = "/transfers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllTransfers: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/transfers", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getSingleTransfer: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransfer", "id", i);
        const a = "/transfers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.TransfersApiAxiosParamCreator = Ms;
  const xs = function(r) {
    const d = (0, o.TransfersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createTransfer(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransfersApi.createTransfer"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllTransfers(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["TransfersApi.getAllTransfers"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleTransfer(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["TransfersApi.getSingleTransfer"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.TransfersApiFp = xs;
  const Ls = function(r, d, l) {
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
        return i.createTransfer(t, a).then((s) => s(l, d));
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
        return i.getAllTransfers(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(t, a) {
        return i.getSingleTransfer(t, a).then((s) => s(l, d));
      }
    };
  };
  o.TransfersApiFactory = Ls;
  class qs extends O.BaseAPI {
    /**
     *
     * @summary Post a new transfer.
     * @param {TransferRequest} transferRequest The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(d, l) {
      return (0, o.TransfersApiFp)(this.configuration).createTransfer(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllTransfers(d, l, i) {
      return (0, o.TransfersApiFp)(this.configuration).getAllTransfers(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(d, l) {
      return (0, o.TransfersApiFp)(this.configuration).getSingleTransfer(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.TransfersApi = qs;
  const Ds = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("acceptTos", "acceptTosRequest", i);
        const a = "/users/acceptTos", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("authenticateAs", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createUser", "createUserRequest", i);
        const a = "/users", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserNfc", "id", i);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "DELETE" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllUsers: (d, l, i, t, a, s, n, ...h) => c(this, [d, l, i, t, a, s, n, ...h], void 0, function* (u, p, A, P, b, g, y, R = {}) {
        const T = "/users", x = new URL(T, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), R), L = {}, M = {};
        yield (0, e.setBearerAuthToObject)(L, r), u !== void 0 && (M.take = u), p !== void 0 && (M.skip = p), A !== void 0 && (M.search = A), P !== void 0 && (M.active = P), b !== void 0 && (M.ofAge = b), g !== void 0 && (M.id = g), y !== void 0 && (M.type = y), (0, e.setSearchParams)(x, M);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), R.headers), {
          url: (0, e.toPathString)(x),
          options: F
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
      getAllUsersOfUserType: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", a);
        const u = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getIndividualUser: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getIndividualUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getOrganMembers: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getOrganMembers", "id", a);
        const u = "/users/{id}/members".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getUserAuthenticatable: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      }),
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserRoles", "id", i);
        const a = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getUsersContainers: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getUsersContainers", "id", a);
        const u = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getUsersFinancialMutations: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", a);
        const u = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getUsersPointsOfSale: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", a);
        const u = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getUsersProcessingDeposits: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", i);
        const a = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getUsersProducts: (d, l, i, ...t) => c(this, [d, l, i, ...t], void 0, function* (a, s, n, h = {}) {
        (0, e.assertParamExists)("getUsersProducts", "id", a);
        const u = "/users/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(u, e.DUMMY_BASE_URL);
        let A;
        r && (A = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), h), b = {}, g = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, e.setSearchParams)(p, g);
        let y = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), y), h.headers), {
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
      getUsersTransactions: (d, l, i, t, a, s, n, h, u, p, ...A) => c(this, [d, l, i, t, a, s, n, h, u, p, ...A], void 0, function* (P, b, g, y, R, T, x, C, F, L, M = {}) {
        (0, e.assertParamExists)("getUsersTransactions", "id", P);
        const X = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(P))), k = new URL(X, e.DUMMY_BASE_URL);
        let K;
        r && (K = r.baseOptions);
        const le = Object.assign(Object.assign({ method: "GET" }, K), M), ae = {}, D = {};
        yield (0, e.setBearerAuthToObject)(ae, r), b !== void 0 && (D.fromId = b), g !== void 0 && (D.createdById = g), y !== void 0 && (D.toId = y), R !== void 0 && (D.productId = R), T !== void 0 && (D.productRevision = T), x !== void 0 && (D.fromDate = x), C !== void 0 && (D.tillDate = C), F !== void 0 && (D.take = F), L !== void 0 && (D.skip = L), (0, e.setSearchParams)(k, D);
        let Ae = K && K.headers ? K.headers : {};
        return le.headers = Object.assign(Object.assign(Object.assign({}, ae), Ae), M.headers), {
          url: (0, e.toPathString)(k),
          options: le
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
      getUsersTransactionsReport: (d, l, i, t, a, s, ...n) => c(this, [d, l, i, t, a, s, ...n], void 0, function* (h, u, p, A, P, b, g = {}) {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", h);
        const y = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(h))), R = new URL(y, e.DUMMY_BASE_URL);
        let T;
        r && (T = r.baseOptions);
        const x = Object.assign(Object.assign({ method: "GET" }, T), g), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), u !== void 0 && (F.fromDate = u), p !== void 0 && (F.tillDate = p), A !== void 0 && (F.fromId = A), P !== void 0 && (F.toId = P), b !== void 0 && (F.exclusiveToId = b), (0, e.setSearchParams)(R, F);
        let L = T && T.headers ? T.headers : {};
        return x.headers = Object.assign(Object.assign(Object.assign({}, C), L), g.headers), {
          url: (0, e.toPathString)(R),
          options: x
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
      getUsersTransfers: (d, l, i, t, a, s, ...n) => c(this, [d, l, i, t, a, s, ...n], void 0, function* (h, u, p, A, P, b, g = {}) {
        (0, e.assertParamExists)("getUsersTransfers", "id", h);
        const y = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(h))), R = new URL(y, e.DUMMY_BASE_URL);
        let T;
        r && (T = r.baseOptions);
        const x = Object.assign(Object.assign({ method: "GET" }, T), g), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), u !== void 0 && (F.take = u), p !== void 0 && (F.skip = p), A !== void 0 && (F.fromId = A), P !== void 0 && (F.toId = P), b !== void 0 && (F.id = b), (0, e.setSearchParams)(R, F);
        let L = T && T.headers ? T.headers : {};
        return x.headers = Object.assign(Object.assign(Object.assign({}, C), L), g.headers), {
          url: (0, e.toPathString)(R),
          options: x
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
      updateUser: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUser", "id", t), (0, e.assertParamExists)("updateUser", "updateUserRequest", a);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateUserKey: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("updateUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateUserLocalPassword: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", t), (0, e.assertParamExists)("updateUserLocalPassword", "updateLocalRequest", a);
        const n = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateUserNfc: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserNfc", "id", t), (0, e.assertParamExists)("updateUserNfc", "updateNfcRequest", a);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      updateUserPin: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserPin", "id", t), (0, e.assertParamExists)("updateUserPin", "updatePinRequest", a);
        const n = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
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
      waiveUserFines: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("waiveUserFines", "id", i);
        const a = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
        };
      })
    };
  };
  o.UsersApiAxiosParamCreator = Ds;
  const Hs = function(r) {
    const d = (0, o.UsersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.acceptTos(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.acceptTos"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.authenticateAs(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.authenticateAs"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createUser(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.createUser"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteUser(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.deleteUser"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteUserKey(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.deleteUserKey"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.deleteUserNfc(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.deleteUserNfc"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
      getAllUsers(l, i, t, a, s, n, h, u) {
        return c(this, void 0, void 0, function* () {
          var p, A, P;
          const b = yield d.getAllUsers(l, i, t, a, s, n, h, u), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, y = (P = (A = O.operationServerMap["UsersApi.getAllUsers"]) === null || A === void 0 ? void 0 : A[g]) === null || P === void 0 ? void 0 : P.url;
          return (R, T) => (0, e.createRequestFunction)(b, v.default, O.BASE_PATH, r)(R, y || T);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getAllUsersOfUserType(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getIndividualUser(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.getIndividualUser"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getOrganMembers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getOrganMembers"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getUserAuthenticatable(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getUserRoles(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.getUserRoles"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getUsersContainers(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getUsersContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getUsersFinancialMutations(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getUsersPointsOfSale(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getUsersProcessingDeposits(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var s, n, h;
          const u = yield d.getUsersProducts(l, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, A = (h = (n = O.operationServerMap["UsersApi.getUsersProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || h === void 0 ? void 0 : h.url;
          return (P, b) => (0, e.createRequestFunction)(u, v.default, O.BASE_PATH, r)(P, A || b);
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
      getUsersTransactions(l, i, t, a, s, n, h, u, p, A, P) {
        return c(this, void 0, void 0, function* () {
          var b, g, y;
          const R = yield d.getUsersTransactions(l, i, t, a, s, n, h, u, p, A, P), T = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, x = (y = (g = O.operationServerMap["UsersApi.getUsersTransactions"]) === null || g === void 0 ? void 0 : g[T]) === null || y === void 0 ? void 0 : y.url;
          return (C, F) => (0, e.createRequestFunction)(R, v.default, O.BASE_PATH, r)(C, x || F);
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
      getUsersTransactionsReport(l, i, t, a, s, n, h) {
        return c(this, void 0, void 0, function* () {
          var u, p, A;
          const P = yield d.getUsersTransactionsReport(l, i, t, a, s, n, h), b = (u = r == null ? void 0 : r.serverIndex) !== null && u !== void 0 ? u : 0, g = (A = (p = O.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (y, R) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(y, g || R);
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
      getUsersTransfers(l, i, t, a, s, n, h) {
        return c(this, void 0, void 0, function* () {
          var u, p, A;
          const P = yield d.getUsersTransfers(l, i, t, a, s, n, h), b = (u = r == null ? void 0 : r.serverIndex) !== null && u !== void 0 ? u : 0, g = (A = (p = O.operationServerMap["UsersApi.getUsersTransfers"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (y, R) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(y, g || R);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateUser(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUser"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.updateUserKey(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.updateUserKey"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateUserLocalPassword(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateUserNfc(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserNfc"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateUserPin(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["UsersApi.updateUserPin"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.waiveUserFines(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["UsersApi.waiveUserFines"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
        });
      }
    };
  };
  o.UsersApiFp = Hs;
  const Ns = function(r, d, l) {
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
        return i.acceptTos(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(t, a) {
        return i.authenticateAs(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(t, a) {
        return i.createUser(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(t, a) {
        return i.deleteUser(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(t, a) {
        return i.deleteUserKey(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(t, a) {
        return i.deleteUserNfc(t, a).then((s) => s(l, d));
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
      getAllUsers(t, a, s, n, h, u, p, A) {
        return i.getAllUsers(t, a, s, n, h, u, p, A).then((P) => P(l, d));
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
        return i.getAllUsersOfUserType(t, a, s, n).then((h) => h(l, d));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(t, a) {
        return i.getIndividualUser(t, a).then((s) => s(l, d));
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
        return i.getOrganMembers(t, a, s, n).then((h) => h(l, d));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(t, a) {
        return i.getUserAuthenticatable(t, a).then((s) => s(l, d));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(t, a) {
        return i.getUserRoles(t, a).then((s) => s(l, d));
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
        return i.getUsersContainers(t, a, s, n).then((h) => h(l, d));
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
        return i.getUsersFinancialMutations(t, a, s, n).then((h) => h(l, d));
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
        return i.getUsersPointsOfSale(t, a, s, n).then((h) => h(l, d));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(t, a) {
        return i.getUsersProcessingDeposits(t, a).then((s) => s(l, d));
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
        return i.getUsersProducts(t, a, s, n).then((h) => h(l, d));
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
      getUsersTransactions(t, a, s, n, h, u, p, A, P, b, g) {
        return i.getUsersTransactions(t, a, s, n, h, u, p, A, P, b, g).then((y) => y(l, d));
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
      getUsersTransactionsReport(t, a, s, n, h, u, p) {
        return i.getUsersTransactionsReport(t, a, s, n, h, u, p).then((A) => A(l, d));
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
      getUsersTransfers(t, a, s, n, h, u, p) {
        return i.getUsersTransfers(t, a, s, n, h, u, p).then((A) => A(l, d));
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
        return i.updateUser(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(t, a) {
        return i.updateUserKey(t, a).then((s) => s(l, d));
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
        return i.updateUserLocalPassword(t, a, s).then((n) => n(l, d));
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
        return i.updateUserNfc(t, a, s).then((n) => n(l, d));
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
        return i.updateUserPin(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(t, a) {
        return i.waiveUserFines(t, a).then((s) => s(l, d));
      }
    };
  };
  o.UsersApiFactory = Ns;
  class ks extends O.BaseAPI {
    /**
     *
     * @summary Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(d, l) {
      return (0, o.UsersApiFp)(this.configuration).acceptTos(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(d, l) {
      return (0, o.UsersApiFp)(this.configuration).authenticateAs(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(d, l) {
      return (0, o.UsersApiFp)(this.configuration).createUser(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(d, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUser(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(d, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUserKey(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(d, l) {
      return (0, o.UsersApiFp)(this.configuration).deleteUserNfc(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllUsers(d, l, i, t, a, s, n, h) {
      return (0, o.UsersApiFp)(this.configuration).getAllUsers(d, l, i, t, a, s, n, h).then((u) => u(this.axios, this.basePath));
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
    getAllUsersOfUserType(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getAllUsersOfUserType(d, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(d, l) {
      return (0, o.UsersApiFp)(this.configuration).getIndividualUser(d, l).then((i) => i(this.axios, this.basePath));
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
    getOrganMembers(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getOrganMembers(d, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(d, l) {
      return (0, o.UsersApiFp)(this.configuration).getUserAuthenticatable(d, l).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(d, l) {
      return (0, o.UsersApiFp)(this.configuration).getUserRoles(d, l).then((i) => i(this.axios, this.basePath));
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
    getUsersContainers(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersContainers(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getUsersFinancialMutations(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersFinancialMutations(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getUsersPointsOfSale(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersPointsOfSale(d, l, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(d, l) {
      return (0, o.UsersApiFp)(this.configuration).getUsersProcessingDeposits(d, l).then((i) => i(this.axios, this.basePath));
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
    getUsersProducts(d, l, i, t) {
      return (0, o.UsersApiFp)(this.configuration).getUsersProducts(d, l, i, t).then((a) => a(this.axios, this.basePath));
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
    getUsersTransactions(d, l, i, t, a, s, n, h, u, p, A) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransactions(d, l, i, t, a, s, n, h, u, p, A).then((P) => P(this.axios, this.basePath));
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
    getUsersTransactionsReport(d, l, i, t, a, s, n) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransactionsReport(d, l, i, t, a, s, n).then((h) => h(this.axios, this.basePath));
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
    getUsersTransfers(d, l, i, t, a, s, n) {
      return (0, o.UsersApiFp)(this.configuration).getUsersTransfers(d, l, i, t, a, s, n).then((h) => h(this.axios, this.basePath));
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
    updateUser(d, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUser(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(d, l) {
      return (0, o.UsersApiFp)(this.configuration).updateUserKey(d, l).then((i) => i(this.axios, this.basePath));
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
    updateUserLocalPassword(d, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserLocalPassword(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateUserNfc(d, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserNfc(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateUserPin(d, l, i) {
      return (0, o.UsersApiFp)(this.configuration).updateUserPin(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Waive all given user\'s fines
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    waiveUserFines(d, l) {
      return (0, o.UsersApiFp)(this.configuration).waiveUserFines(d, l).then((i) => i(this.axios, this.basePath));
    }
  }
  o.UsersApi = ks, o.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const Gs = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVatGroup", "vatGroupRequest", i);
        const a = "/vatgroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllVatGroups: (d, l, i, t, a, s, ...n) => c(this, [d, l, i, t, a, s, ...n], void 0, function* (h, u, p, A, P, b, g = {}) {
        const y = "/vatgroups", R = new URL(y, e.DUMMY_BASE_URL);
        let T;
        r && (T = r.baseOptions);
        const x = Object.assign(Object.assign({ method: "GET" }, T), g), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), h !== void 0 && (F.vatGroupId = h), u !== void 0 && (F.name = u), p !== void 0 && (F.percentage = p), A !== void 0 && (F.deleted = A), P !== void 0 && (F.take = P), b !== void 0 && (F.skip = b), (0, e.setSearchParams)(R, F);
        let L = T && T.headers ? T.headers : {};
        return x.headers = Object.assign(Object.assign(Object.assign({}, C), L), g.headers), {
          url: (0, e.toPathString)(R),
          options: x
        };
      }),
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleVatGroup", "id", i);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      getVatDeclarationAmounts: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", t), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", a);
        const n = "/vatgroups/declaration", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.year = t), a !== void 0 && (P.period = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      updateVatGroup: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVatGroup", "id", t), (0, e.assertParamExists)("updateVatGroup", "updateVatGroupRequest", a);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.VatGroupsApiAxiosParamCreator = Gs;
  const Qs = function(r) {
    const d = (0, o.VatGroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createVatGroup(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["VatGroupsApi.createVatGroup"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
      getAllVatGroups(l, i, t, a, s, n, h) {
        return c(this, void 0, void 0, function* () {
          var u, p, A;
          const P = yield d.getAllVatGroups(l, i, t, a, s, n, h), b = (u = r == null ? void 0 : r.serverIndex) !== null && u !== void 0 ? u : 0, g = (A = (p = O.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || p === void 0 ? void 0 : p[b]) === null || A === void 0 ? void 0 : A.url;
          return (y, R) => (0, e.createRequestFunction)(P, v.default, O.BASE_PATH, r)(y, g || R);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getSingleVatGroup(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getVatDeclarationAmounts(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateVatGroup(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.VatGroupsApiFp = Qs;
  const Ys = function(r, d, l) {
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
        return i.createVatGroup(t, a).then((s) => s(l, d));
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
      getAllVatGroups(t, a, s, n, h, u, p) {
        return i.getAllVatGroups(t, a, s, n, h, u, p).then((A) => A(l, d));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(t, a) {
        return i.getSingleVatGroup(t, a).then((s) => s(l, d));
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
        return i.getVatDeclarationAmounts(t, a, s).then((n) => n(l, d));
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
        return i.updateVatGroup(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.VatGroupsApiFactory = Ys;
  class $s extends O.BaseAPI {
    /**
     *
     * @summary Create a new VAT group
     * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(d, l) {
      return (0, o.VatGroupsApiFp)(this.configuration).createVatGroup(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllVatGroups(d, l, i, t, a, s, n) {
      return (0, o.VatGroupsApiFp)(this.configuration).getAllVatGroups(d, l, i, t, a, s, n).then((h) => h(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(d, l) {
      return (0, o.VatGroupsApiFp)(this.configuration).getSingleVatGroup(d, l).then((i) => i(this.axios, this.basePath));
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
    getVatDeclarationAmounts(d, l, i) {
      return (0, o.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(d, l, i).then((t) => t(this.axios, this.basePath));
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
    updateVatGroup(d, l, i) {
      return (0, o.VatGroupsApiFp)(this.configuration).updateVatGroup(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.VatGroupsApi = $s;
  const zs = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVouchergroup", "voucherGroupRequest", i);
        const a = "/vouchergroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "POST" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), u["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), h.data = (0, e.serializeDataIfNeeded)(i, h, r), {
          url: (0, e.toPathString)(s),
          options: h
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
      getAllVouchergroups: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        const n = "/vouchergroups", h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), {
          url: (0, e.toPathString)(h),
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
      getVouchergroupId: (d, ...l) => c(this, [d, ...l], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getVouchergroupId", "id", i);
        const a = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const h = Object.assign(Object.assign({ method: "GET" }, n), t), u = {}, p = {};
        yield (0, e.setBearerAuthToObject)(u, r), (0, e.setSearchParams)(s, p);
        let A = n && n.headers ? n.headers : {};
        return h.headers = Object.assign(Object.assign(Object.assign({}, u), A), t.headers), {
          url: (0, e.toPathString)(s),
          options: h
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
      updateVoucherGroup: (d, l, ...i) => c(this, [d, l, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVoucherGroup", "id", t), (0, e.assertParamExists)("updateVoucherGroup", "voucherGroupRequest", a);
        const n = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(t))), h = new URL(n, e.DUMMY_BASE_URL);
        let u;
        r && (u = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, u), s), A = {}, P = {};
        yield (0, e.setBearerAuthToObject)(A, r), A["Content-Type"] = "application/json", (0, e.setSearchParams)(h, P);
        let b = u && u.headers ? u.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(h),
          options: p
        };
      })
    };
  };
  o.VouchergroupsApiAxiosParamCreator = zs;
  const Ks = function(r) {
    const d = (0, o.VouchergroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(l, i) {
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.createVouchergroup(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.getAllVouchergroups(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
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
        return c(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield d.getVouchergroupId(l, i), h = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, u = (s = (a = O.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || a === void 0 ? void 0 : a[h]) === null || s === void 0 ? void 0 : s.url;
          return (p, A) => (0, e.createRequestFunction)(n, v.default, O.BASE_PATH, r)(p, u || A);
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
        return c(this, void 0, void 0, function* () {
          var a, s, n;
          const h = yield d.updateVoucherGroup(l, i, t), u = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = O.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || s === void 0 ? void 0 : s[u]) === null || n === void 0 ? void 0 : n.url;
          return (A, P) => (0, e.createRequestFunction)(h, v.default, O.BASE_PATH, r)(A, p || P);
        });
      }
    };
  };
  o.VouchergroupsApiFp = Ks;
  const Ws = function(r, d, l) {
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
        return i.createVouchergroup(t, a).then((s) => s(l, d));
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
        return i.getAllVouchergroups(t, a, s).then((n) => n(l, d));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(t, a) {
        return i.getVouchergroupId(t, a).then((s) => s(l, d));
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
        return i.updateVoucherGroup(t, a, s).then((n) => n(l, d));
      }
    };
  };
  o.VouchergroupsApiFactory = Ws;
  class Js extends O.BaseAPI {
    /**
     *
     * @summary Creates a new voucher group
     * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    createVouchergroup(d, l) {
      return (0, o.VouchergroupsApiFp)(this.configuration).createVouchergroup(d, l).then((i) => i(this.axios, this.basePath));
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
    getAllVouchergroups(d, l, i) {
      return (0, o.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(d, l, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested voucher group
     * @param {number} id The id of the voucher group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getVouchergroupId(d, l) {
      return (0, o.VouchergroupsApiFp)(this.configuration).getVouchergroupId(d, l).then((i) => i(this.axios, this.basePath));
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
    updateVoucherGroup(d, l, i) {
      return (0, o.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(d, l, i).then((t) => t(this.axios, this.basePath));
    }
  }
  o.VouchergroupsApi = Js;
})(Ot);
var Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.Configuration = void 0;
class pn {
  constructor(c = {}) {
    this.apiKey = c.apiKey, this.username = c.username, this.password = c.password, this.accessToken = c.accessToken, this.basePath = c.basePath, this.serverIndex = c.serverIndex, this.baseOptions = c.baseOptions, this.formDataCtor = c.formDataCtor;
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
    const v = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return c !== null && (v.test(c) || c.toLowerCase() === "application/json-patch+json");
  }
}
Fe.Configuration = pn;
(function(o) {
  var c = de && de.__createBinding || (Object.create ? function(e, O, m, f) {
    f === void 0 && (f = m);
    var j = Object.getOwnPropertyDescriptor(O, m);
    (!j || ("get" in j ? !O.__esModule : j.writable || j.configurable)) && (j = { enumerable: !0, get: function() {
      return O[m];
    } }), Object.defineProperty(e, f, j);
  } : function(e, O, m, f) {
    f === void 0 && (f = m), e[f] = O[m];
  }), v = de && de.__exportStar || function(e, O) {
    for (var m in e) m !== "default" && !Object.prototype.hasOwnProperty.call(O, m) && c(O, e, m);
  };
  Object.defineProperty(o, "__esModule", { value: !0 }), v(Ot, o), v(Fe, o);
})(G);
const z = Y.create();
z.interceptors.response.use((o) => (na(o), o));
class mn {
  constructor(c) {
    $(this, "_authenticateApi");
    $(this, "_balanceApi");
    $(this, "_debtorsApi");
    $(this, "_usersApi");
    $(this, "_posApi");
    $(this, "_categoryApi");
    $(this, "_transactionApi");
    $(this, "_bannerApi");
    $(this, "_rootApi");
    $(this, "_voucherGroupApi");
    $(this, "_containerApi");
    $(this, "_filesApi");
    $(this, "_invoicesApi");
    $(this, "_payoutsApi");
    $(this, "_productsApi");
    $(this, "_transfersApi");
    $(this, "_vatGroupsApi");
    $(this, "_stripeApi");
    $(this, "_rbacApi");
    $(this, "_openBannerApi");
    const v = new G.Configuration({
      accessToken: () => Ye().token
    });
    this._authenticateApi = new G.AuthenticateApi(v, c, z), this._balanceApi = new G.BalanceApi(v, c, z), this._debtorsApi = new G.DebtorsApi(v, c, z), this._usersApi = new G.UsersApi(v, c, z), this._posApi = new G.PointofsaleApi(v, c, z), this._categoryApi = new G.ProductCategoriesApi(v, c, z), this._transactionApi = new G.TransactionsApi(v, c, z), this._bannerApi = new G.BannersApi(v, c, z), this._openBannerApi = new G.BannersApi(void 0, c, z), this._rootApi = new G.RootApi(), this._voucherGroupApi = new G.VouchergroupsApi(v, c, z), this._containerApi = new G.ContainersApi(v, c, z), this._filesApi = new G.FilesApi(v, c, z), this._invoicesApi = new G.InvoicesApi(v, c, z), this._payoutsApi = new G.PayoutRequestsApi(v, c, z), this._productsApi = new G.ProductsApi(v, c, z), this._transfersApi = new G.TransfersApi(v, c, z), this._vatGroupsApi = new G.VatGroupsApi(v, c, z), this._stripeApi = new G.StripeApi(v, c, z), this._rbacApi = new G.RbacApi(v, c, z);
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
function fn(o) {
  o.mask.addEventListener("click", function(c) {
    c.target === o.mask && o.close();
  });
}
export {
  mn as ApiService,
  fn as addListenerOnDialogueOverlay,
  ia as clearTokenInStorage,
  sa as fetchAllPages,
  Ye as getTokenFromStorage,
  ca as isAuthenticated,
  la as isTokenExpired,
  oa as parseToken,
  On as populateStoresFromToken,
  vt as setTokenInStorage,
  na as updateTokenIfNecessary,
  da as useAuthStore,
  pt as useUserStore
};
