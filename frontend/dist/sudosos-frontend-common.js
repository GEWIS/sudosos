var Qr = Object.defineProperty;
var Yr = (t, i, l) => i in t ? Qr(t, i, { enumerable: !0, configurable: !0, writable: !0, value: l }) : t[i] = l;
var D = (t, i, l) => (Yr(t, typeof i != "symbol" ? i + "" : i, l), l);
import { createPinia as Wr, defineStore as fs } from "pinia";
async function Jr(t, i, l) {
  let e = t, h = [];
  for (; ; ) {
    const f = await l(i, e), { records: O } = f.data;
    if (f.data._pagination.count <= e)
      break;
    h = h.concat(O), e += i;
  }
  return h;
}
Wr();
const Xr = fs("user", {
  state: () => ({
    users: [],
    current: {
      balance: null,
      user: null
    }
  }),
  getters: {
    getUserById: (t) => (i) => t.users.find((l) => l.id === i),
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
      this.users = await Jr(0, 500, (i, l) => t.user.getAllUsers(i, l));
    },
    async fetchCurrentUserBalance(t, i) {
      this.current.balance = (await i.balance.getBalanceId(t)).data;
    },
    setCurrentUser(t) {
      this.current.user = t;
    },
    addUser(t) {
      this.users.push(t);
    },
    clearCurrent() {
      this.current.balance = void 0, this.current.user = void 0;
    },
    deleteUser(t) {
      const i = this.users.findIndex((l) => l.id === t);
      i !== -1 && this.users.splice(i, 1);
    }
  }
}), Hi = fs({
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
    handleResponse(t, i) {
      const { user: l, token: e, roles: h, organs: f, acceptedToS: O } = t;
      !l || !e || !h || !f || !O || (this.user = l, this.token = e, this.roles = h, this.organs = f, this.acceptedToS = O, i.user.getIndividualUser(this.user.id).then((b) => {
        Xr().setCurrentUser(b.data);
      }));
    },
    async gewisPinlogin(t, i, l) {
      const e = {
        gewisId: parseInt(t, 10),
        pin: i
      };
      await l.authenticate.gewisPinAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async ldapLogin(t, i, l) {
      const e = {
        accountName: t,
        password: i
      };
      await l.authenticate.ldapAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async gewisWebLogin(t, i, l) {
      const e = {
        nonce: t,
        token: i
      };
      await l.authenticate.gewisWebAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async externalPinLogin(t, i, l) {
      const e = {
        pin: i,
        userId: t
      };
      await l.authenticate.pinAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async eanLogin(t, i) {
      const l = {
        eanCode: t
      };
      await i.authenticate.eanAuthentication(l).then((e) => {
        this.handleResponse(e.data, i);
      });
    },
    async apiKeyLogin(t, i, l) {
      const e = {
        key: t,
        userId: i
      };
      await l.authenticate.authenticationKeyPost(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    async gewisLdapLogin(t, i, l) {
      const e = {
        accountName: t,
        password: i
      };
      await l.authenticate.gewisLDAPAuthentication(e).then((h) => {
        this.handleResponse(h.data, l);
      });
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, this.user = null;
    }
  }
});
var ae = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, L = {}, Os = {}, mt = { exports: {} }, Ps = function(i, l) {
  return function() {
    for (var h = new Array(arguments.length), f = 0; f < h.length; f++)
      h[f] = arguments[f];
    return i.apply(l, h);
  };
}, Zr = Ps, yt = Object.prototype.toString, St = function(t) {
  return function(i) {
    var l = yt.call(i);
    return t[l] || (t[l] = l.slice(8, -1).toLowerCase());
  };
}(/* @__PURE__ */ Object.create(null));
function ne(t) {
  return t = t.toLowerCase(), function(l) {
    return St(l) === t;
  };
}
function Ut(t) {
  return Array.isArray(t);
}
function Fe(t) {
  return typeof t > "u";
}
function ea(t) {
  return t !== null && !Fe(t) && t.constructor !== null && !Fe(t.constructor) && typeof t.constructor.isBuffer == "function" && t.constructor.isBuffer(t);
}
var bs = ne("ArrayBuffer");
function ta(t) {
  var i;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? i = ArrayBuffer.isView(t) : i = t && t.buffer && bs(t.buffer), i;
}
function sa(t) {
  return typeof t == "string";
}
function ra(t) {
  return typeof t == "number";
}
function gs(t) {
  return t !== null && typeof t == "object";
}
function je(t) {
  if (St(t) !== "object")
    return !1;
  var i = Object.getPrototypeOf(t);
  return i === null || i === Object.prototype;
}
var aa = ne("Date"), na = ne("File"), ia = ne("Blob"), oa = ne("FileList");
function jt(t) {
  return yt.call(t) === "[object Function]";
}
function ca(t) {
  return gs(t) && jt(t.pipe);
}
function la(t) {
  var i = "[object FormData]";
  return t && (typeof FormData == "function" && t instanceof FormData || yt.call(t) === i || jt(t.toString) && t.toString() === i);
}
var ua = ne("URLSearchParams");
function da(t) {
  return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
}
function ha() {
  return typeof navigator < "u" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS") ? !1 : typeof window < "u" && typeof document < "u";
}
function Rt(t, i) {
  if (!(t === null || typeof t > "u"))
    if (typeof t != "object" && (t = [t]), Ut(t))
      for (var l = 0, e = t.length; l < e; l++)
        i.call(null, t[l], l, t);
    else
      for (var h in t)
        Object.prototype.hasOwnProperty.call(t, h) && i.call(null, t[h], h, t);
}
function pt() {
  var t = {};
  function i(h, f) {
    je(t[f]) && je(h) ? t[f] = pt(t[f], h) : je(h) ? t[f] = pt({}, h) : Ut(h) ? t[f] = h.slice() : t[f] = h;
  }
  for (var l = 0, e = arguments.length; l < e; l++)
    Rt(arguments[l], i);
  return t;
}
function pa(t, i, l) {
  return Rt(i, function(h, f) {
    l && typeof h == "function" ? t[f] = Zr(h, l) : t[f] = h;
  }), t;
}
function Aa(t) {
  return t.charCodeAt(0) === 65279 && (t = t.slice(1)), t;
}
function fa(t, i, l, e) {
  t.prototype = Object.create(i.prototype, e), t.prototype.constructor = t, l && Object.assign(t.prototype, l);
}
function Oa(t, i, l) {
  var e, h, f, O = {};
  i = i || {};
  do {
    for (e = Object.getOwnPropertyNames(t), h = e.length; h-- > 0; )
      f = e[h], O[f] || (i[f] = t[f], O[f] = !0);
    t = Object.getPrototypeOf(t);
  } while (t && (!l || l(t, i)) && t !== Object.prototype);
  return i;
}
function Pa(t, i, l) {
  t = String(t), (l === void 0 || l > t.length) && (l = t.length), l -= i.length;
  var e = t.indexOf(i, l);
  return e !== -1 && e === l;
}
function ba(t) {
  if (!t)
    return null;
  var i = t.length;
  if (Fe(i))
    return null;
  for (var l = new Array(i); i-- > 0; )
    l[i] = t[i];
  return l;
}
var ga = function(t) {
  return function(i) {
    return t && i instanceof t;
  };
}(typeof Uint8Array < "u" && Object.getPrototypeOf(Uint8Array)), N = {
  isArray: Ut,
  isArrayBuffer: bs,
  isBuffer: ea,
  isFormData: la,
  isArrayBufferView: ta,
  isString: sa,
  isNumber: ra,
  isObject: gs,
  isPlainObject: je,
  isUndefined: Fe,
  isDate: aa,
  isFile: na,
  isBlob: ia,
  isFunction: jt,
  isStream: ca,
  isURLSearchParams: ua,
  isStandardBrowserEnv: ha,
  forEach: Rt,
  merge: pt,
  extend: pa,
  trim: da,
  stripBOM: Aa,
  inherits: fa,
  toFlatObject: Oa,
  kindOf: St,
  kindOfTest: ne,
  endsWith: Pa,
  toArray: ba,
  isTypedArray: ga,
  isFileList: oa
}, oe = N;
function Lt(t) {
  return encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
var ms = function(i, l, e) {
  if (!l)
    return i;
  var h;
  if (e)
    h = e(l);
  else if (oe.isURLSearchParams(l))
    h = l.toString();
  else {
    var f = [];
    oe.forEach(l, function(y, m) {
      y === null || typeof y > "u" || (oe.isArray(y) ? m = m + "[]" : y = [y], oe.forEach(y, function(R) {
        oe.isDate(R) ? R = R.toISOString() : oe.isObject(R) && (R = JSON.stringify(R)), f.push(Lt(m) + "=" + Lt(R));
      }));
    }), h = f.join("&");
  }
  if (h) {
    var O = i.indexOf("#");
    O !== -1 && (i = i.slice(0, O)), i += (i.indexOf("?") === -1 ? "?" : "&") + h;
  }
  return i;
}, ma = N;
function Ce() {
  this.handlers = [];
}
Ce.prototype.use = function(i, l, e) {
  return this.handlers.push({
    fulfilled: i,
    rejected: l,
    synchronous: e ? e.synchronous : !1,
    runWhen: e ? e.runWhen : null
  }), this.handlers.length - 1;
};
Ce.prototype.eject = function(i) {
  this.handlers[i] && (this.handlers[i] = null);
};
Ce.prototype.forEach = function(i) {
  ma.forEach(this.handlers, function(e) {
    e !== null && i(e);
  });
};
var ya = Ce, Sa = N, Ua = function(i, l) {
  Sa.forEach(i, function(h, f) {
    f !== l && f.toUpperCase() === l.toUpperCase() && (i[l] = h, delete i[f]);
  });
}, ys = N;
function le(t, i, l, e, h) {
  Error.call(this), this.message = t, this.name = "AxiosError", i && (this.code = i), l && (this.config = l), e && (this.request = e), h && (this.response = h);
}
ys.inherits(le, Error, {
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
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
var Ss = le.prototype, Us = {};
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
  "ERR_CANCELED"
  // eslint-disable-next-line func-names
].forEach(function(t) {
  Us[t] = { value: t };
});
Object.defineProperties(le, Us);
Object.defineProperty(Ss, "isAxiosError", { value: !0 });
le.from = function(t, i, l, e, h, f) {
  var O = Object.create(Ss);
  return ys.toFlatObject(t, O, function(y) {
    return y !== Error.prototype;
  }), le.call(O, t.message, i, l, e, h), O.name = t.name, f && Object.assign(O, f), O;
};
var he = le, js = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, W = N;
function ja(t, i) {
  i = i || new FormData();
  var l = [];
  function e(f) {
    return f === null ? "" : W.isDate(f) ? f.toISOString() : W.isArrayBuffer(f) || W.isTypedArray(f) ? typeof Blob == "function" ? new Blob([f]) : Buffer.from(f) : f;
  }
  function h(f, O) {
    if (W.isPlainObject(f) || W.isArray(f)) {
      if (l.indexOf(f) !== -1)
        throw Error("Circular reference detected in " + O);
      l.push(f), W.forEach(f, function(y, m) {
        if (!W.isUndefined(y)) {
          var S = O ? O + "." + m : m, R;
          if (y && !O && typeof y == "object") {
            if (W.endsWith(m, "{}"))
              y = JSON.stringify(y);
            else if (W.endsWith(m, "[]") && (R = W.toArray(y))) {
              R.forEach(function(j) {
                !W.isUndefined(j) && i.append(S, e(j));
              });
              return;
            }
          }
          h(y, S);
        }
      }), l.pop();
    } else
      i.append(O, e(f));
  }
  return h(t), i;
}
var Rs = ja, Qe, qt;
function Ra() {
  if (qt)
    return Qe;
  qt = 1;
  var t = he;
  return Qe = function(l, e, h) {
    var f = h.config.validateStatus;
    !h.status || !f || f(h.status) ? l(h) : e(new t(
      "Request failed with status code " + h.status,
      [t.ERR_BAD_REQUEST, t.ERR_BAD_RESPONSE][Math.floor(h.status / 100) - 4],
      h.config,
      h.request,
      h
    ));
  }, Qe;
}
var Ye, Dt;
function va() {
  if (Dt)
    return Ye;
  Dt = 1;
  var t = N;
  return Ye = t.isStandardBrowserEnv() ? (
    // Standard browser envs support document.cookie
    function() {
      return {
        write: function(e, h, f, O, b, y) {
          var m = [];
          m.push(e + "=" + encodeURIComponent(h)), t.isNumber(f) && m.push("expires=" + new Date(f).toGMTString()), t.isString(O) && m.push("path=" + O), t.isString(b) && m.push("domain=" + b), y === !0 && m.push("secure"), document.cookie = m.join("; ");
        },
        read: function(e) {
          var h = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
          return h ? decodeURIComponent(h[3]) : null;
        },
        remove: function(e) {
          this.write(e, "", Date.now() - 864e5);
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
  ), Ye;
}
var Va = function(i) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(i);
}, Ta = function(i, l) {
  return l ? i.replace(/\/+$/, "") + "/" + l.replace(/^\/+/, "") : i;
}, Ea = Va, Fa = Ta, vs = function(i, l) {
  return i && !Ea(l) ? Fa(i, l) : l;
}, We, Mt;
function Ba() {
  if (Mt)
    return We;
  Mt = 1;
  var t = N, i = [
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
  ];
  return We = function(e) {
    var h = {}, f, O, b;
    return e && t.forEach(e.split(`
`), function(m) {
      if (b = m.indexOf(":"), f = t.trim(m.substr(0, b)).toLowerCase(), O = t.trim(m.substr(b + 1)), f) {
        if (h[f] && i.indexOf(f) >= 0)
          return;
        f === "set-cookie" ? h[f] = (h[f] ? h[f] : []).concat([O]) : h[f] = h[f] ? h[f] + ", " + O : O;
      }
    }), h;
  }, We;
}
var Je, It;
function _a() {
  if (It)
    return Je;
  It = 1;
  var t = N;
  return Je = t.isStandardBrowserEnv() ? (
    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    function() {
      var l = /(msie|trident)/i.test(navigator.userAgent), e = document.createElement("a"), h;
      function f(O) {
        var b = O;
        return l && (e.setAttribute("href", b), b = e.href), e.setAttribute("href", b), {
          href: e.href,
          protocol: e.protocol ? e.protocol.replace(/:$/, "") : "",
          host: e.host,
          search: e.search ? e.search.replace(/^\?/, "") : "",
          hash: e.hash ? e.hash.replace(/^#/, "") : "",
          hostname: e.hostname,
          port: e.port,
          pathname: e.pathname.charAt(0) === "/" ? e.pathname : "/" + e.pathname
        };
      }
      return h = f(window.location.href), function(b) {
        var y = t.isString(b) ? f(b) : b;
        return y.protocol === h.protocol && y.host === h.host;
      };
    }()
  ) : (
    // Non standard browser envs (web workers, react-native) lack needed support.
    function() {
      return function() {
        return !0;
      };
    }()
  ), Je;
}
var Xe, Ht;
function we() {
  if (Ht)
    return Xe;
  Ht = 1;
  var t = he, i = N;
  function l(e) {
    t.call(this, e ?? "canceled", t.ERR_CANCELED), this.name = "CanceledError";
  }
  return i.inherits(l, t, {
    __CANCEL__: !0
  }), Xe = l, Xe;
}
var Ze, xt;
function Ca() {
  return xt || (xt = 1, Ze = function(i) {
    var l = /^([-+\w]{1,25})(:?\/\/|:)/.exec(i);
    return l && l[1] || "";
  }), Ze;
}
var et, Nt;
function $t() {
  if (Nt)
    return et;
  Nt = 1;
  var t = N, i = Ra(), l = va(), e = ms, h = vs, f = Ba(), O = _a(), b = js, y = he, m = we(), S = Ca();
  return et = function(j) {
    return new Promise(function(v, F) {
      var x = j.data, M = j.headers, k = j.responseType, K;
      function ie() {
        j.cancelToken && j.cancelToken.unsubscribe(K), j.signal && j.signal.removeEventListener("abort", K);
      }
      t.isFormData(x) && t.isStandardBrowserEnv() && delete M["Content-Type"];
      var B = new XMLHttpRequest();
      if (j.auth) {
        var ke = j.auth.username || "", ze = j.auth.password ? unescape(encodeURIComponent(j.auth.password)) : "";
        M.Authorization = "Basic " + btoa(ke + ":" + ze);
      }
      var Ae = h(j.baseURL, j.url);
      B.open(j.method.toUpperCase(), e(Ae, j.params, j.paramsSerializer), !0), B.timeout = j.timeout;
      function Se() {
        if (B) {
          var G = "getAllResponseHeaders" in B ? f(B.getAllResponseHeaders()) : null, te = !k || k === "text" || k === "json" ? B.responseText : B.response, Z = {
            data: te,
            status: B.status,
            statusText: B.statusText,
            headers: G,
            config: j,
            request: B
          };
          i(function(Oe) {
            v(Oe), ie();
          }, function(Oe) {
            F(Oe), ie();
          }, Z), B = null;
        }
      }
      if ("onloadend" in B ? B.onloadend = Se : B.onreadystatechange = function() {
        !B || B.readyState !== 4 || B.status === 0 && !(B.responseURL && B.responseURL.indexOf("file:") === 0) || setTimeout(Se);
      }, B.onabort = function() {
        B && (F(new y("Request aborted", y.ECONNABORTED, j, B)), B = null);
      }, B.onerror = function() {
        F(new y("Network Error", y.ERR_NETWORK, j, B, B)), B = null;
      }, B.ontimeout = function() {
        var te = j.timeout ? "timeout of " + j.timeout + "ms exceeded" : "timeout exceeded", Z = j.transitional || b;
        j.timeoutErrorMessage && (te = j.timeoutErrorMessage), F(new y(
          te,
          Z.clarifyTimeoutError ? y.ETIMEDOUT : y.ECONNABORTED,
          j,
          B
        )), B = null;
      }, t.isStandardBrowserEnv()) {
        var Ue = (j.withCredentials || O(Ae)) && j.xsrfCookieName ? l.read(j.xsrfCookieName) : void 0;
        Ue && (M[j.xsrfHeaderName] = Ue);
      }
      "setRequestHeader" in B && t.forEach(M, function(te, Z) {
        typeof x > "u" && Z.toLowerCase() === "content-type" ? delete M[Z] : B.setRequestHeader(Z, te);
      }), t.isUndefined(j.withCredentials) || (B.withCredentials = !!j.withCredentials), k && k !== "json" && (B.responseType = j.responseType), typeof j.onDownloadProgress == "function" && B.addEventListener("progress", j.onDownloadProgress), typeof j.onUploadProgress == "function" && B.upload && B.upload.addEventListener("progress", j.onUploadProgress), (j.cancelToken || j.signal) && (K = function(G) {
        B && (F(!G || G && G.type ? new m() : G), B.abort(), B = null);
      }, j.cancelToken && j.cancelToken.subscribe(K), j.signal && (j.signal.aborted ? K() : j.signal.addEventListener("abort", K))), x || (x = null);
      var fe = S(Ae);
      if (fe && ["http", "https", "file"].indexOf(fe) === -1) {
        F(new y("Unsupported protocol " + fe + ":", y.ERR_BAD_REQUEST, j));
        return;
      }
      B.send(x);
    });
  }, et;
}
var tt, kt;
function wa() {
  return kt || (kt = 1, tt = null), tt;
}
var H = N, zt = Ua, Kt = he, La = js, qa = Rs, Da = {
  "Content-Type": "application/x-www-form-urlencoded"
};
function Gt(t, i) {
  !H.isUndefined(t) && H.isUndefined(t["Content-Type"]) && (t["Content-Type"] = i);
}
function Ma() {
  var t;
  return (typeof XMLHttpRequest < "u" || typeof process < "u" && Object.prototype.toString.call(process) === "[object process]") && (t = $t()), t;
}
function Ia(t, i, l) {
  if (H.isString(t))
    try {
      return (i || JSON.parse)(t), H.trim(t);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (l || JSON.stringify)(t);
}
var Le = {
  transitional: La,
  adapter: Ma(),
  transformRequest: [function(i, l) {
    if (zt(l, "Accept"), zt(l, "Content-Type"), H.isFormData(i) || H.isArrayBuffer(i) || H.isBuffer(i) || H.isStream(i) || H.isFile(i) || H.isBlob(i))
      return i;
    if (H.isArrayBufferView(i))
      return i.buffer;
    if (H.isURLSearchParams(i))
      return Gt(l, "application/x-www-form-urlencoded;charset=utf-8"), i.toString();
    var e = H.isObject(i), h = l && l["Content-Type"], f;
    if ((f = H.isFileList(i)) || e && h === "multipart/form-data") {
      var O = this.env && this.env.FormData;
      return qa(f ? { "files[]": i } : i, O && new O());
    } else if (e || h === "application/json")
      return Gt(l, "application/json"), Ia(i);
    return i;
  }],
  transformResponse: [function(i) {
    var l = this.transitional || Le.transitional, e = l && l.silentJSONParsing, h = l && l.forcedJSONParsing, f = !e && this.responseType === "json";
    if (f || h && H.isString(i) && i.length)
      try {
        return JSON.parse(i);
      } catch (O) {
        if (f)
          throw O.name === "SyntaxError" ? Kt.from(O, Kt.ERR_BAD_RESPONSE, this, null, this.response) : O;
      }
    return i;
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
    FormData: wa()
  },
  validateStatus: function(i) {
    return i >= 200 && i < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*"
    }
  }
};
H.forEach(["delete", "get", "head"], function(i) {
  Le.headers[i] = {};
});
H.forEach(["post", "put", "patch"], function(i) {
  Le.headers[i] = H.merge(Da);
});
var vt = Le, Ha = N, xa = vt, Na = function(i, l, e) {
  var h = this || xa;
  return Ha.forEach(e, function(O) {
    i = O.call(h, i, l);
  }), i;
}, st, Qt;
function Vs() {
  return Qt || (Qt = 1, st = function(i) {
    return !!(i && i.__CANCEL__);
  }), st;
}
var Yt = N, rt = Na, $a = Vs(), ka = vt, za = we();
function at(t) {
  if (t.cancelToken && t.cancelToken.throwIfRequested(), t.signal && t.signal.aborted)
    throw new za();
}
var Ka = function(i) {
  at(i), i.headers = i.headers || {}, i.data = rt.call(
    i,
    i.data,
    i.headers,
    i.transformRequest
  ), i.headers = Yt.merge(
    i.headers.common || {},
    i.headers[i.method] || {},
    i.headers
  ), Yt.forEach(
    ["delete", "get", "head", "post", "put", "patch", "common"],
    function(h) {
      delete i.headers[h];
    }
  );
  var l = i.adapter || ka.adapter;
  return l(i).then(function(h) {
    return at(i), h.data = rt.call(
      i,
      h.data,
      h.headers,
      i.transformResponse
    ), h;
  }, function(h) {
    return $a(h) || (at(i), h && h.response && (h.response.data = rt.call(
      i,
      h.response.data,
      h.response.headers,
      i.transformResponse
    ))), Promise.reject(h);
  });
}, Q = N, Ts = function(i, l) {
  l = l || {};
  var e = {};
  function h(S, R) {
    return Q.isPlainObject(S) && Q.isPlainObject(R) ? Q.merge(S, R) : Q.isPlainObject(R) ? Q.merge({}, R) : Q.isArray(R) ? R.slice() : R;
  }
  function f(S) {
    if (Q.isUndefined(l[S])) {
      if (!Q.isUndefined(i[S]))
        return h(void 0, i[S]);
    } else
      return h(i[S], l[S]);
  }
  function O(S) {
    if (!Q.isUndefined(l[S]))
      return h(void 0, l[S]);
  }
  function b(S) {
    if (Q.isUndefined(l[S])) {
      if (!Q.isUndefined(i[S]))
        return h(void 0, i[S]);
    } else
      return h(void 0, l[S]);
  }
  function y(S) {
    if (S in l)
      return h(i[S], l[S]);
    if (S in i)
      return h(void 0, i[S]);
  }
  var m = {
    url: O,
    method: O,
    data: O,
    baseURL: b,
    transformRequest: b,
    transformResponse: b,
    paramsSerializer: b,
    timeout: b,
    timeoutMessage: b,
    withCredentials: b,
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
    validateStatus: y
  };
  return Q.forEach(Object.keys(i).concat(Object.keys(l)), function(R) {
    var j = m[R] || f, _ = j(R);
    Q.isUndefined(_) && j !== y || (e[R] = _);
  }), e;
}, nt, Wt;
function Es() {
  return Wt || (Wt = 1, nt = {
    version: "0.27.2"
  }), nt;
}
var Ga = Es().version, re = he, Vt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(function(t, i) {
  Vt[t] = function(e) {
    return typeof e === t || "a" + (i < 1 ? "n " : " ") + t;
  };
});
var Jt = {};
Vt.transitional = function(i, l, e) {
  function h(f, O) {
    return "[Axios v" + Ga + "] Transitional option '" + f + "'" + O + (e ? ". " + e : "");
  }
  return function(f, O, b) {
    if (i === !1)
      throw new re(
        h(O, " has been removed" + (l ? " in " + l : "")),
        re.ERR_DEPRECATED
      );
    return l && !Jt[O] && (Jt[O] = !0, console.warn(
      h(
        O,
        " has been deprecated since v" + l + " and will be removed in the near future"
      )
    )), i ? i(f, O, b) : !0;
  };
};
function Qa(t, i, l) {
  if (typeof t != "object")
    throw new re("options must be an object", re.ERR_BAD_OPTION_VALUE);
  for (var e = Object.keys(t), h = e.length; h-- > 0; ) {
    var f = e[h], O = i[f];
    if (O) {
      var b = t[f], y = b === void 0 || O(b, f, t);
      if (y !== !0)
        throw new re("option " + f + " must be " + y, re.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (l !== !0)
      throw new re("Unknown option " + f, re.ERR_BAD_OPTION);
  }
}
var Ya = {
  assertOptions: Qa,
  validators: Vt
}, Fs = N, Wa = ms, Xt = ya, Zt = Ka, qe = Ts, Ja = vs, Bs = Ya, ce = Bs.validators;
function ue(t) {
  this.defaults = t, this.interceptors = {
    request: new Xt(),
    response: new Xt()
  };
}
ue.prototype.request = function(i, l) {
  typeof i == "string" ? (l = l || {}, l.url = i) : l = i || {}, l = qe(this.defaults, l), l.method ? l.method = l.method.toLowerCase() : this.defaults.method ? l.method = this.defaults.method.toLowerCase() : l.method = "get";
  var e = l.transitional;
  e !== void 0 && Bs.assertOptions(e, {
    silentJSONParsing: ce.transitional(ce.boolean),
    forcedJSONParsing: ce.transitional(ce.boolean),
    clarifyTimeoutError: ce.transitional(ce.boolean)
  }, !1);
  var h = [], f = !0;
  this.interceptors.request.forEach(function(_) {
    typeof _.runWhen == "function" && _.runWhen(l) === !1 || (f = f && _.synchronous, h.unshift(_.fulfilled, _.rejected));
  });
  var O = [];
  this.interceptors.response.forEach(function(_) {
    O.push(_.fulfilled, _.rejected);
  });
  var b;
  if (!f) {
    var y = [Zt, void 0];
    for (Array.prototype.unshift.apply(y, h), y = y.concat(O), b = Promise.resolve(l); y.length; )
      b = b.then(y.shift(), y.shift());
    return b;
  }
  for (var m = l; h.length; ) {
    var S = h.shift(), R = h.shift();
    try {
      m = S(m);
    } catch (j) {
      R(j);
      break;
    }
  }
  try {
    b = Zt(m);
  } catch (j) {
    return Promise.reject(j);
  }
  for (; O.length; )
    b = b.then(O.shift(), O.shift());
  return b;
};
ue.prototype.getUri = function(i) {
  i = qe(this.defaults, i);
  var l = Ja(i.baseURL, i.url);
  return Wa(l, i.params, i.paramsSerializer);
};
Fs.forEach(["delete", "get", "head", "options"], function(i) {
  ue.prototype[i] = function(l, e) {
    return this.request(qe(e || {}, {
      method: i,
      url: l,
      data: (e || {}).data
    }));
  };
});
Fs.forEach(["post", "put", "patch"], function(i) {
  function l(e) {
    return function(f, O, b) {
      return this.request(qe(b || {}, {
        method: i,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: f,
        data: O
      }));
    };
  }
  ue.prototype[i] = l(), ue.prototype[i + "Form"] = l(!0);
});
var Xa = ue, it, es;
function Za() {
  if (es)
    return it;
  es = 1;
  var t = we();
  function i(l) {
    if (typeof l != "function")
      throw new TypeError("executor must be a function.");
    var e;
    this.promise = new Promise(function(O) {
      e = O;
    });
    var h = this;
    this.promise.then(function(f) {
      if (h._listeners) {
        var O, b = h._listeners.length;
        for (O = 0; O < b; O++)
          h._listeners[O](f);
        h._listeners = null;
      }
    }), this.promise.then = function(f) {
      var O, b = new Promise(function(y) {
        h.subscribe(y), O = y;
      }).then(f);
      return b.cancel = function() {
        h.unsubscribe(O);
      }, b;
    }, l(function(O) {
      h.reason || (h.reason = new t(O), e(h.reason));
    });
  }
  return i.prototype.throwIfRequested = function() {
    if (this.reason)
      throw this.reason;
  }, i.prototype.subscribe = function(e) {
    if (this.reason) {
      e(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(e) : this._listeners = [e];
  }, i.prototype.unsubscribe = function(e) {
    if (this._listeners) {
      var h = this._listeners.indexOf(e);
      h !== -1 && this._listeners.splice(h, 1);
    }
  }, i.source = function() {
    var e, h = new i(function(O) {
      e = O;
    });
    return {
      token: h,
      cancel: e
    };
  }, it = i, it;
}
var ot, ts;
function en() {
  return ts || (ts = 1, ot = function(i) {
    return function(e) {
      return i.apply(null, e);
    };
  }), ot;
}
var ct, ss;
function tn() {
  if (ss)
    return ct;
  ss = 1;
  var t = N;
  return ct = function(l) {
    return t.isObject(l) && l.isAxiosError === !0;
  }, ct;
}
var rs = N, sn = Ps, Re = Xa, rn = Ts, an = vt;
function _s(t) {
  var i = new Re(t), l = sn(Re.prototype.request, i);
  return rs.extend(l, Re.prototype, i), rs.extend(l, i), l.create = function(h) {
    return _s(rn(t, h));
  }, l;
}
var z = _s(an);
z.Axios = Re;
z.CanceledError = we();
z.CancelToken = Za();
z.isCancel = Vs();
z.VERSION = Es().version;
z.toFormData = Rs;
z.AxiosError = he;
z.Cancel = z.CanceledError;
z.all = function(i) {
  return Promise.all(i);
};
z.spread = en();
z.isAxiosError = tn();
mt.exports = z;
mt.exports.default = z;
var nn = mt.exports, Cs = nn, q = {}, Tt = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.RequiredError = t.BaseAPI = t.COLLECTION_FORMATS = t.BASE_PATH = void 0;
  const i = Cs;
  t.BASE_PATH = "http://localhost".replace(/\/+$/, ""), t.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class l {
    constructor(f, O = t.BASE_PATH, b = i.default) {
      this.basePath = O, this.axios = b, f && (this.configuration = f, this.basePath = f.basePath || this.basePath);
    }
  }
  t.BaseAPI = l;
  class e extends Error {
    constructor(f, O) {
      super(O), this.field = f, this.name = "RequiredError";
    }
  }
  t.RequiredError = e;
})(Tt);
var Et = ae && ae.__awaiter || function(t, i, l, e) {
  function h(f) {
    return f instanceof l ? f : new l(function(O) {
      O(f);
    });
  }
  return new (l || (l = Promise))(function(f, O) {
    function b(S) {
      try {
        m(e.next(S));
      } catch (R) {
        O(R);
      }
    }
    function y(S) {
      try {
        m(e.throw(S));
      } catch (R) {
        O(R);
      }
    }
    function m(S) {
      S.done ? f(S.value) : h(S.value).then(b, y);
    }
    m((e = e.apply(t, i || [])).next());
  });
};
Object.defineProperty(q, "__esModule", { value: !0 });
q.createRequestFunction = q.toPathString = q.serializeDataIfNeeded = q.setSearchParams = q.setOAuthToObject = q.setBearerAuthToObject = q.setBasicAuthToObject = q.setApiKeyToObject = q.assertParamExists = q.DUMMY_BASE_URL = void 0;
const on = Tt;
q.DUMMY_BASE_URL = "https://example.com";
const cn = function(t, i, l) {
  if (l == null)
    throw new on.RequiredError(i, `Required parameter ${i} was null or undefined when calling ${t}.`);
};
q.assertParamExists = cn;
const ln = function(t, i, l) {
  return Et(this, void 0, void 0, function* () {
    if (l && l.apiKey) {
      const e = typeof l.apiKey == "function" ? yield l.apiKey(i) : yield l.apiKey;
      t[i] = e;
    }
  });
};
q.setApiKeyToObject = ln;
const un = function(t, i) {
  i && (i.username || i.password) && (t.auth = { username: i.username, password: i.password });
};
q.setBasicAuthToObject = un;
const dn = function(t, i) {
  return Et(this, void 0, void 0, function* () {
    if (i && i.accessToken) {
      const l = typeof i.accessToken == "function" ? yield i.accessToken() : yield i.accessToken;
      t.Authorization = "Bearer " + l;
    }
  });
};
q.setBearerAuthToObject = dn;
const hn = function(t, i, l, e) {
  return Et(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const h = typeof e.accessToken == "function" ? yield e.accessToken(i, l) : yield e.accessToken;
      t.Authorization = "Bearer " + h;
    }
  });
};
q.setOAuthToObject = hn;
function At(t, i, l = "") {
  i != null && (typeof i == "object" ? Array.isArray(i) ? i.forEach((e) => At(t, e, l)) : Object.keys(i).forEach((e) => At(t, i[e], `${l}${l !== "" ? "." : ""}${e}`)) : t.has(l) ? t.append(l, i) : t.set(l, i));
}
const pn = function(t, ...i) {
  const l = new URLSearchParams(t.search);
  At(l, i), t.search = l.toString();
};
q.setSearchParams = pn;
const An = function(t, i, l) {
  const e = typeof t != "string";
  return (e && l && l.isJsonMime ? l.isJsonMime(i.headers["Content-Type"]) : e) ? JSON.stringify(t !== void 0 ? t : {}) : t || "";
};
q.serializeDataIfNeeded = An;
const fn = function(t) {
  return t.pathname + t.search + t.hash;
};
q.toPathString = fn;
const On = function(t, i, l, e) {
  return (h = i, f = l) => {
    const O = Object.assign(Object.assign({}, t.options), { url: ((e == null ? void 0 : e.basePath) || f) + t.url });
    return h.request(O);
  };
};
q.createRequestFunction = On;
(function(t) {
  var i = ae && ae.__awaiter || function(u, o, s, n) {
    function a(r) {
      return r instanceof s ? r : new s(function(c) {
        c(r);
      });
    }
    return new (s || (s = Promise))(function(r, c) {
      function d(P) {
        try {
          A(n.next(P));
        } catch (U) {
          c(U);
        }
      }
      function p(P) {
        try {
          A(n.throw(P));
        } catch (U) {
          c(U);
        }
      }
      function A(P) {
        P.done ? r(P.value) : a(P.value).then(d, p);
      }
      A((n = n.apply(u, o || [])).next());
    });
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), t.RootApiFp = t.RootApiAxiosParamCreator = t.RbacApi = t.RbacApiFactory = t.RbacApiFp = t.RbacApiAxiosParamCreator = t.ProductsApi = t.ProductsApiFactory = t.ProductsApiFp = t.ProductsApiAxiosParamCreator = t.ProductCategoriesApi = t.ProductCategoriesApiFactory = t.ProductCategoriesApiFp = t.ProductCategoriesApiAxiosParamCreator = t.PointofsaleApi = t.PointofsaleApiFactory = t.PointofsaleApiFp = t.PointofsaleApiAxiosParamCreator = t.PayoutRequestsApi = t.PayoutRequestsApiFactory = t.PayoutRequestsApiFp = t.PayoutRequestsApiAxiosParamCreator = t.InvoicesApi = t.InvoicesApiFactory = t.InvoicesApiFp = t.InvoicesApiAxiosParamCreator = t.FilesApi = t.FilesApiFactory = t.FilesApiFp = t.FilesApiAxiosParamCreator = t.ContainersApi = t.ContainersApiFactory = t.ContainersApiFp = t.ContainersApiAxiosParamCreator = t.BorrelkaartgroupsApi = t.BorrelkaartgroupsApiFactory = t.BorrelkaartgroupsApiFp = t.BorrelkaartgroupsApiAxiosParamCreator = t.BannersApi = t.BannersApiFactory = t.BannersApiFp = t.BannersApiAxiosParamCreator = t.BalanceApi = t.BalanceApiFactory = t.BalanceApiFp = t.BalanceApiAxiosParamCreator = t.AuthenticateApi = t.AuthenticateApiFactory = t.AuthenticateApiFp = t.AuthenticateApiAxiosParamCreator = void 0, t.VatGroupsApi = t.VatGroupsApiFactory = t.VatGroupsApiFp = t.VatGroupsApiAxiosParamCreator = t.UsersApi = t.UsersApiFactory = t.UsersApiFp = t.UsersApiAxiosParamCreator = t.TransfersApi = t.TransfersApiFactory = t.TransfersApiFp = t.TransfersApiAxiosParamCreator = t.TransactionsApi = t.TransactionsApiFactory = t.TransactionsApiFp = t.TransactionsApiAxiosParamCreator = t.TestApi = t.TestApiFactory = t.TestApiFp = t.TestApiAxiosParamCreator = t.StripeApi = t.StripeApiFactory = t.StripeApiFp = t.StripeApiAxiosParamCreator = t.RootApi = t.RootApiFactory = void 0;
  const l = Cs, e = q, h = Tt, f = function(u) {
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("eanAuthentication", "req", o);
        const n = "/authentication/ean", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "req", o);
        const n = "/authentication/GEWIS/LDAP", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisPinAuthentication", "req", o);
        const n = "/authentication/GEWIS/pin", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("gewisWebAuthentication", "req", o);
        const n = "/authentication/gewisweb", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("keyAuthentication", "req", o);
        const n = "/authentication/key", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("ldapAuthentication", "req", o);
        const n = "/authentication/LDAP", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("localAuthentication", "req", o);
        const n = "/authentication/local", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("mockAuthentication", "req", o);
        const n = "/authentication/mock", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("nfcAuthentication", "req", o);
        const n = "/authentication/nfc", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("pinAuthentication", "req", o);
        const n = "/authentication/pin", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/authentication/refreshToken", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "GET" }, a), o), c = {}, d = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", u), (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      }),
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocal", "req", o);
        const n = "/authentication/local/reset", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("resetLocalWithToken", "req", o);
        const n = "/authentication/local", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "PUT" }, r), s), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      })
    };
  };
  t.AuthenticateApiAxiosParamCreator = f;
  const O = function(u) {
    const o = (0, t.AuthenticateApiAxiosParamCreator)(u);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.eanAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.gewisLDAPAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.gewisPinAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.gewisWebAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.keyAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.ldapAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.localAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.mockAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.nfcAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.pinAuthentication(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.refreshToken(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.resetLocal(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.resetLocalWithToken(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.AuthenticateApiFp = O;
  const b = function(u, o, s) {
    const n = (0, t.AuthenticateApiFp)(u);
    return {
      /**
       *  EAN login and hand out token
       * @param {AuthenticationEanRequest} req The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(a, r) {
        return n.eanAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(a, r) {
        return n.gewisLDAPAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(a, r) {
        return n.gewisPinAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(a, r) {
        return n.gewisWebAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  Key login and hand out token.
       * @param {AuthenticationKeyRequest} req The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(a, r) {
        return n.keyAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} req The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(a, r) {
        return n.ldapAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  Local login and hand out token
       * @param {AuthenticationLocalRequest} req The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(a, r) {
        return n.localAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  Mock login and hand out token.
       * @param {AuthenticationMockRequest} req The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(a, r) {
        return n.mockAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  NFC login and hand out token
       * @param {AuthenticationNfcRequest} req The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(a, r) {
        return n.nfcAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  PIN login and hand out token
       * @param {AuthenticationPinRequest} req The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(a, r) {
        return n.pinAuthentication(a, r).then((c) => c(s, o));
      },
      /**
       *  Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(a) {
        return n.refreshToken(a).then((r) => r(s, o));
      },
      /**
       *  Creates a reset token for the local authentication
       * @param {ResetLocalRequest} req The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(a, r) {
        return n.resetLocal(a, r).then((c) => c(s, o));
      },
      /**
       *  Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} req The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(a, r) {
        return n.resetLocalWithToken(a, r).then((c) => c(s, o));
      }
    };
  };
  t.AuthenticateApiFactory = b;
  class y extends h.BaseAPI {
    /**
     *  EAN login and hand out token
     * @param {AuthenticationEanRequest} req The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).eanAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Key login and hand out token.
     * @param {AuthenticationKeyRequest} req The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).keyAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} req The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).ldapAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Local login and hand out token
     * @param {AuthenticationLocalRequest} req The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).localAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Mock login and hand out token.
     * @param {AuthenticationMockRequest} req The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).mockAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  NFC login and hand out token
     * @param {AuthenticationNfcRequest} req The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).nfcAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  PIN login and hand out token
     * @param {AuthenticationPinRequest} req The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).pinAuthentication(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(o) {
      return (0, t.AuthenticateApiFp)(this.configuration).refreshToken(o).then((s) => s(this.axios, this.basePath));
    }
    /**
     *  Creates a reset token for the local authentication
     * @param {ResetLocalRequest} req The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).resetLocal(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} req The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(o, s) {
      return (0, t.AuthenticateApiFp)(this.configuration).resetLocalWithToken(o, s).then((n) => n(this.axios, this.basePath));
    }
  }
  t.AuthenticateApi = y;
  const m = function(u) {
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
      getAllBalance: (o, s, n, a, r, c, d, p = {}) => i(this, void 0, void 0, function* () {
        const A = "/balances/all", P = new URL(A, e.DUMMY_BASE_URL);
        let U;
        u && (U = u.baseOptions);
        const E = Object.assign(Object.assign({ method: "GET" }, U), p), T = {}, V = {};
        yield (0, e.setApiKeyToObject)(T, "Authorization", u), o !== void 0 && (V.date = o), s !== void 0 && (V.minBalance = s), n !== void 0 && (V.maxBalance = n), a !== void 0 && (V.orderBy = a), r !== void 0 && (V.orderDirection = r), c !== void 0 && (V.take = c), d !== void 0 && (V.skip = d), (0, e.setSearchParams)(P, V);
        let $ = U && U.headers ? U.headers : {};
        return E.headers = Object.assign(Object.assign(Object.assign({}, T), $), p.headers), {
          url: (0, e.toPathString)(P),
          options: E
        };
      }),
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBalanceId", "id", o);
        const n = "/balances/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/balances", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "GET" }, a), o), c = {}, d = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", u), (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      })
    };
  };
  t.BalanceApiAxiosParamCreator = m;
  const S = function(u) {
    const o = (0, t.BalanceApiAxiosParamCreator)(u);
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
      getAllBalance(s, n, a, r, c, d, p, A) {
        return i(this, void 0, void 0, function* () {
          const P = yield o.getAllBalance(s, n, a, r, c, d, p, A);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getBalanceId(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.getBalances(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.BalanceApiFp = S;
  const R = function(u, o, s) {
    const n = (0, t.BalanceApiFp)(u);
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
      getAllBalance(a, r, c, d, p, A, P, U) {
        return n.getAllBalance(a, r, c, d, p, A, P, U).then((E) => E(s, o));
      },
      /**
       *  Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(a, r) {
        return n.getBalanceId(a, r).then((c) => c(s, o));
      },
      /**
       *  Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(a) {
        return n.getBalances(a).then((r) => r(s, o));
      }
    };
  };
  t.BalanceApiFactory = R;
  class j extends h.BaseAPI {
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
    getAllBalance(o, s, n, a, r, c, d, p) {
      return (0, t.BalanceApiFp)(this.configuration).getAllBalance(o, s, n, a, r, c, d, p).then((A) => A(this.axios, this.basePath));
    }
    /**
     *  Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(o, s) {
      return (0, t.BalanceApiFp)(this.configuration).getBalanceId(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(o) {
      return (0, t.BalanceApiFp)(this.configuration).getBalances(o).then((s) => s(this.axios, this.basePath));
    }
  }
  t.BalanceApi = j;
  const _ = function(u) {
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("_delete", "id", o);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("create", "banner", o);
        const n = "/banners", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getActive: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/banners/active", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      getAllBanners: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/banners", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      getAllOpenBanners: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/open/banners", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBanner", "id", o);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      update: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("update", "id", o), (0, e.assertParamExists)("update", "banner", s);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
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
      updateImage: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateImage", "id", o);
        const a = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, c), n), p = {}, A = {}, P = new (u && u.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), s !== void 0 && P.append("file", s), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(r, A);
        let U = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), U), n.headers), d.data = P, {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.BannersApiAxiosParamCreator = _;
  const v = function(u) {
    const o = (0, t.BannersApiAxiosParamCreator)(u);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o._delete(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.create(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getActive(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllBanners(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllOpenBanners(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getBanner(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.update(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateImage(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.BannersApiFp = v;
  const F = function(u, o, s) {
    const n = (0, t.BannersApiFp)(u);
    return {
      /**
       *  Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(a, r) {
        return n._delete(a, r).then((c) => c(s, o));
      },
      /**
       *  Saves a banner to the database
       * @param {BannerRequest} banner The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(a, r) {
        return n.create(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(a, r, c) {
        return n.getActive(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(a, r, c) {
        return n.getAllBanners(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(a, r, c) {
        return n.getAllOpenBanners(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(a, r) {
        return n.getBanner(a, r).then((c) => c(s, o));
      },
      /**
       *  Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} banner The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(a, r, c) {
        return n.update(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(a, r, c) {
        return n.updateImage(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.BannersApiFactory = F;
  class x extends h.BaseAPI {
    /**
     *  Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(o, s) {
      return (0, t.BannersApiFp)(this.configuration)._delete(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Saves a banner to the database
     * @param {BannerRequest} banner The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(o, s) {
      return (0, t.BannersApiFp)(this.configuration).create(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all active banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getActive(o, s, n) {
      return (0, t.BannersApiFp)(this.configuration).getActive(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllBanners(o, s, n) {
      return (0, t.BannersApiFp)(this.configuration).getAllBanners(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllOpenBanners(o, s, n) {
      return (0, t.BannersApiFp)(this.configuration).getAllOpenBanners(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(o, s) {
      return (0, t.BannersApiFp)(this.configuration).getBanner(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Updates the requested banner
     * @param {number} id The id of the banner which should be updated
     * @param {BannerRequest} banner The updated banner
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    update(o, s, n) {
      return (0, t.BannersApiFp)(this.configuration).update(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Uploads a banner image to the given banner
     * @param {number} id The id of the banner
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    updateImage(o, s, n) {
      return (0, t.BannersApiFp)(this.configuration).updateImage(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.BannersApi = x;
  const M = function(u) {
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createBorrelkaartgroup", "borrelkaartgroup", o);
        const n = "/borrelkaartgroups", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getALlBorrelkaartgroups: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/borrelkaartgroups", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getBorrelkaartgroupId", "id", o);
        const n = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      updateBorrelkaartGroup: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateBorrelkaartGroup", "id", o), (0, e.assertParamExists)("updateBorrelkaartGroup", "borrelkaartgroup", s);
        const a = "/borrelkaartgroups/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.BorrelkaartgroupsApiAxiosParamCreator = M;
  const k = function(u) {
    const o = (0, t.BorrelkaartgroupsApiAxiosParamCreator)(u);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createBorrelkaartgroup(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getALlBorrelkaartgroups(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getBorrelkaartgroupId(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateBorrelkaartGroup(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.BorrelkaartgroupsApiFp = k;
  const K = function(u, o, s) {
    const n = (0, t.BorrelkaartgroupsApiFp)(u);
    return {
      /**
       *  Creates a new borrelkaart group
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createBorrelkaartgroup(a, r) {
        return n.createBorrelkaartgroup(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all existing borrelkaart groups
       * @param {number} [take] How many borrelkaart groups the endpoint should return
       * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getALlBorrelkaartgroups(a, r, c) {
        return n.getALlBorrelkaartgroups(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBorrelkaartgroupId(a, r) {
        return n.getBorrelkaartgroupId(a, r).then((c) => c(s, o));
      },
      /**
       *  Updates the requested borrelkaart group
       * @param {number} id The id of the borrelkaart group which should be updated
       * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateBorrelkaartGroup(a, r, c) {
        return n.updateBorrelkaartGroup(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.BorrelkaartgroupsApiFactory = K;
  class ie extends h.BaseAPI {
    /**
     *  Creates a new borrelkaart group
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The borrelkaart group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    createBorrelkaartgroup(o, s) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).createBorrelkaartgroup(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing borrelkaart groups
     * @param {number} [take] How many borrelkaart groups the endpoint should return
     * @param {number} [skip] How many borrelkaart groups should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getALlBorrelkaartgroups(o, s, n) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).getALlBorrelkaartgroups(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    getBorrelkaartgroupId(o, s) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).getBorrelkaartgroupId(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Updates the requested borrelkaart group
     * @param {number} id The id of the borrelkaart group which should be updated
     * @param {BorrelkaartGroupRequest} borrelkaartgroup The updated borrelkaart group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BorrelkaartgroupsApi
     */
    updateBorrelkaartGroup(o, s, n) {
      return (0, t.BorrelkaartgroupsApiFp)(this.configuration).updateBorrelkaartGroup(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.BorrelkaartgroupsApi = ie;
  const B = function(u) {
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveContainer", "id", o);
        const n = "/containers/{id}/approve".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createContainer", "container", o);
        const n = "/containers", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllContainers: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/containers", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      getProductsContainer: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getProductsContainer", "id", o);
        const r = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getPublicContainers: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/containers/public", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleContainer", "id", o);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedContainer", "id", o);
        const n = "/containers/{id}/update".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getUpdatedContainers: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/containers/updated", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      updateContainer: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateContainer", "id", o), (0, e.assertParamExists)("updateContainer", "container", s);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.ContainersApiAxiosParamCreator = B;
  const ke = function(u) {
    const o = (0, t.ContainersApiAxiosParamCreator)(u);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.approveContainer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createContainer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllContainers(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
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
      getProductsContainer(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getProductsContainer(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getPublicContainers(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleContainer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleUpdatedContainer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getUpdatedContainers(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateContainer(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.ContainersApiFp = ke;
  const ze = function(u, o, s) {
    const n = (0, t.ContainersApiFp)(u);
    return {
      /**
       *  Approve a container update.
       * @param {number} id The id of the container update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveContainer(a, r) {
        return n.approveContainer(a, r).then((c) => c(s, o));
      },
      /**
       *  Create a new container.
       * @param {CreateContainerRequest} container    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(a, r) {
        return n.createContainer(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(a, r, c) {
        return n.getAllContainers(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(a, r, c, d) {
        return n.getProductsContainer(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(a, r, c) {
        return n.getPublicContainers(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(a, r) {
        return n.getSingleContainer(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns the requested updated container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedContainer(a, r) {
        return n.getSingleUpdatedContainer(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all updated containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedContainers(a, r, c) {
        return n.getUpdatedContainers(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} container    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(a, r, c) {
        return n.updateContainer(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.ContainersApiFactory = ze;
  class Ae extends h.BaseAPI {
    /**
     *  Approve a container update.
     * @param {number} id The id of the container update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    approveContainer(o, s) {
      return (0, t.ContainersApiFp)(this.configuration).approveContainer(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new container.
     * @param {CreateContainerRequest} container    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(o, s) {
      return (0, t.ContainersApiFp)(this.configuration).createContainer(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getAllContainers(o, s, n) {
      return (0, t.ContainersApiFp)(this.configuration).getAllContainers(o, s, n).then((a) => a(this.axios, this.basePath));
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
    getProductsContainer(o, s, n, a) {
      return (0, t.ContainersApiFp)(this.configuration).getProductsContainer(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all public container
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getPublicContainers(o, s, n) {
      return (0, t.ContainersApiFp)(this.configuration).getPublicContainers(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(o, s) {
      return (0, t.ContainersApiFp)(this.configuration).getSingleContainer(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleUpdatedContainer(o, s) {
      return (0, t.ContainersApiFp)(this.configuration).getSingleUpdatedContainer(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all updated containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getUpdatedContainers(o, s, n) {
      return (0, t.ContainersApiFp)(this.configuration).getUpdatedContainers(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing container.
     * @param {number} id The id of the container which should be updated
     * @param {UpdateContainerRequest} container    The container which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    updateContainer(o, s, n) {
      return (0, t.ContainersApiFp)(this.configuration).updateContainer(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.ContainersApi = Ae;
  const Se = function(u) {
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/files", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, c), n), p = {}, A = {}, P = new (u && u.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && P.append("file", o), s !== void 0 && P.append("name", s), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(r, A);
        let U = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), U), n.headers), d.data = P, {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteFile", "id", o);
        const n = "/files/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getFile", "id", o);
        const n = "/files/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      })
    };
  };
  t.FilesApiAxiosParamCreator = Se;
  const Ue = function(u) {
    const o = (0, t.FilesApiAxiosParamCreator)(u);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.createFile(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteFile(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getFile(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.FilesApiFp = Ue;
  const fe = function(u, o, s) {
    const n = (0, t.FilesApiFp)(u);
    return {
      /**
       *  Upload a file with the given name.
       * @param {File} [file] null
       * @param {string} [name] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(a, r, c) {
        return n.createFile(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(a, r) {
        return n.deleteFile(a, r).then((c) => c(s, o));
      },
      /**
       *  Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(a, r) {
        return n.getFile(a, r).then((c) => c(s, o));
      }
    };
  };
  t.FilesApiFactory = fe;
  class G extends h.BaseAPI {
    /**
     *  Upload a file with the given name.
     * @param {File} [file] null
     * @param {string} [name] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(o, s, n) {
      return (0, t.FilesApiFp)(this.configuration).createFile(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(o, s) {
      return (0, t.FilesApiFp)(this.configuration).deleteFile(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(o, s) {
      return (0, t.FilesApiFp)(this.configuration).getFile(o, s).then((n) => n(this.axios, this.basePath));
    }
  }
  t.FilesApi = G;
  const te = function(u) {
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createInvoice", "invoice", o);
        const n = "/invoices", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteInvoice", "id", o);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getAllInvoices: (o, s, n, a, r, c, d = {}) => i(this, void 0, void 0, function* () {
        const p = "/invoices", A = new URL(p, e.DUMMY_BASE_URL);
        let P;
        u && (P = u.baseOptions);
        const U = Object.assign(Object.assign({ method: "GET" }, P), d), E = {}, T = {};
        yield (0, e.setApiKeyToObject)(E, "Authorization", u), o !== void 0 && (T.toId = o), s !== void 0 && (T.invoiceId = s), n !== void 0 && (T.state = n), a !== void 0 && (T.returnEntries = a), r !== void 0 && (T.fromDate = r), c !== void 0 && (T.tillDate = c), (0, e.setSearchParams)(A, T);
        let V = P && P.headers ? P.headers : {};
        return U.headers = Object.assign(Object.assign(Object.assign({}, E), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: U
        };
      }),
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleInvoice", "id", o);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), s !== void 0 && (A.returnEntries = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      updateInvoice: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateInvoice", "id", o), (0, e.assertParamExists)("updateInvoice", "invoice", s);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.InvoicesApiAxiosParamCreator = te;
  const Z = function(u) {
    const o = (0, t.InvoicesApiAxiosParamCreator)(u);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createInvoice(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteInvoice(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllInvoices(s, n, a, r, c, d, p) {
        return i(this, void 0, void 0, function* () {
          const A = yield o.getAllInvoices(s, n, a, r, c, d, p);
          return (0, e.createRequestFunction)(A, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getSingleInvoice(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateInvoice(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.InvoicesApiFp = Z;
  const Ke = function(u, o, s) {
    const n = (0, t.InvoicesApiFp)(u);
    return {
      /**
       *  Adds an invoice to the system.
       * @param {CreateInvoiceRequest} invoice The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(a, r) {
        return n.createInvoice(a, r).then((c) => c(s, o));
      },
      /**
       *  Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(a, r) {
        return n.deleteInvoice(a, r).then((c) => c(s, o));
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
      getAllInvoices(a, r, c, d, p, A, P) {
        return n.getAllInvoices(a, r, c, d, p, A, P).then((U) => U(s, o));
      },
      /**
       *  Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(a, r, c) {
        return n.getSingleInvoice(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} invoice The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(a, r, c) {
        return n.updateInvoice(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.InvoicesApiFactory = Ke;
  class Oe extends h.BaseAPI {
    /**
     *  Adds an invoice to the system.
     * @param {CreateInvoiceRequest} invoice The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(o, s) {
      return (0, t.InvoicesApiFp)(this.configuration).createInvoice(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(o, s) {
      return (0, t.InvoicesApiFp)(this.configuration).deleteInvoice(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllInvoices(o, s, n, a, r, c, d) {
      return (0, t.InvoicesApiFp)(this.configuration).getAllInvoices(o, s, n, a, r, c, d).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Returns a single invoice in the system.
     * @param {number} id The id of the requested invoice
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoice(o, s, n) {
      return (0, t.InvoicesApiFp)(this.configuration).getSingleInvoice(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} invoice The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(o, s, n) {
      return (0, t.InvoicesApiFp)(this.configuration).updateInvoice(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.InvoicesApi = Oe;
  const er = function(u) {
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequest", o);
        const n = "/payoutrequests", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllPayoutRequests: (o, s, n, a, r, c, d, p = {}) => i(this, void 0, void 0, function* () {
        const A = "/payoutrequests", P = new URL(A, e.DUMMY_BASE_URL);
        let U;
        u && (U = u.baseOptions);
        const E = Object.assign(Object.assign({ method: "GET" }, U), p), T = {}, V = {};
        yield (0, e.setApiKeyToObject)(T, "Authorization", u), o !== void 0 && (V.requestedById = o), s !== void 0 && (V.approvedById = s), n !== void 0 && (V.fromDate = n), a !== void 0 && (V.tillDate = a), r !== void 0 && (V.status = r), c !== void 0 && (V.take = c), d !== void 0 && (V.skip = d), (0, e.setSearchParams)(P, V);
        let $ = U && U.headers ? U.headers : {};
        return E.headers = Object.assign(Object.assign(Object.assign({}, T), $), p.headers), {
          url: (0, e.toPathString)(P),
          options: E
        };
      }),
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", o);
        const n = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      setPayoutRequestStatus: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", o), (0, e.assertParamExists)("setPayoutRequestStatus", "state", s);
        const a = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.PayoutRequestsApiAxiosParamCreator = er;
  const tr = function(u) {
    const o = (0, t.PayoutRequestsApiAxiosParamCreator)(u);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createPayoutRequest(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllPayoutRequests(s, n, a, r, c, d, p, A) {
        return i(this, void 0, void 0, function* () {
          const P = yield o.getAllPayoutRequests(s, n, a, r, c, d, p, A);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSinglePayoutRequest(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.setPayoutRequestStatus(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.PayoutRequestsApiFp = tr;
  const sr = function(u, o, s) {
    const n = (0, t.PayoutRequestsApiFp)(u);
    return {
      /**
       *  Create a new payout request
       * @param {PayoutRequestRequest} payoutRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(a, r) {
        return n.createPayoutRequest(a, r).then((c) => c(s, o));
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
      getAllPayoutRequests(a, r, c, d, p, A, P, U) {
        return n.getAllPayoutRequests(a, r, c, d, p, A, P, U).then((E) => E(s, o));
      },
      /**
       *  Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(a, r) {
        return n.getSinglePayoutRequest(a, r).then((c) => c(s, o));
      },
      /**
       *  Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} state New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(a, r, c) {
        return n.setPayoutRequestStatus(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.PayoutRequestsApiFactory = sr;
  class rr extends h.BaseAPI {
    /**
     *  Create a new payout request
     * @param {PayoutRequestRequest} payoutRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(o, s) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllPayoutRequests(o, s, n, a, r, c, d, p) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(o, s, n, a, r, c, d, p).then((A) => A(this.axios, this.basePath));
    }
    /**
     *  Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(o, s) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} state New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(o, s, n) {
      return (0, t.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.PayoutRequestsApi = rr;
  const ar = function(u) {
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approvePointOfSale", "id", o);
        const n = "/pointsofsale/{id}/approve".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createPointOfSale", "pointofsale", o);
        const n = "/pointsofsale", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllPointOfSaleContainers: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", o);
        const r = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getAllPointOfSaleProducts: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", o);
        const r = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getAllPointsOfSale: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/pointsofsale", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", o);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleUpdatedPointOfSale", "id", o);
        const n = "/pointsofsale/{id}/update".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getTransactions: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getTransactions", "id", o);
        const r = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUpdated: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/pointsofsale/updated", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      updatePointOfSale: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updatePointOfSale", "id", o), (0, e.assertParamExists)("updatePointOfSale", "pointofsale", s);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.PointofsaleApiAxiosParamCreator = ar;
  const nr = function(u) {
    const o = (0, t.PointofsaleApiAxiosParamCreator)(u);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.approvePointOfSale(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createPointOfSale(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllPointOfSaleContainers(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getAllPointOfSaleContainers(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getAllPointOfSaleProducts(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getAllPointOfSaleProducts(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllPointsOfSale(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSinglePointOfSale(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleUpdatedPointOfSale(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getTransactions(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getTransactions(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getUpdated(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updatePointOfSale(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.PointofsaleApiFp = nr;
  const ir = function(u, o, s) {
    const n = (0, t.PointofsaleApiFp)(u);
    return {
      /**
       *  Approve a Point of Sale update.
       * @param {number} id The id of the Point of Sale update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approvePointOfSale(a, r) {
        return n.approvePointOfSale(a, r).then((c) => c(s, o));
      },
      /**
       *  Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(a, r) {
        return n.createPointOfSale(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(a, r, c, d) {
        return n.getAllPointOfSaleContainers(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(a, r, c, d) {
        return n.getAllPointOfSaleProducts(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(a, r, c) {
        return n.getAllPointsOfSale(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(a, r) {
        return n.getSinglePointOfSale(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns a single Points of Sale update
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleUpdatedPointOfSale(a, r) {
        return n.getSingleUpdatedPointOfSale(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns a Point of Sale transactions
       * @param {number} id          The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(a, r, c, d) {
        return n.getTransactions(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns all updated Points of Sale
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdated(a, r, c) {
        return n.getUpdated(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(a, r, c) {
        return n.updatePointOfSale(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.PointofsaleApiFactory = ir;
  class or extends h.BaseAPI {
    /**
     *  Approve a Point of Sale update.
     * @param {number} id The id of the Point of Sale update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    approvePointOfSale(o, s) {
      return (0, t.PointofsaleApiFp)(this.configuration).approvePointOfSale(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} pointofsale The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(o, s) {
      return (0, t.PointofsaleApiFp)(this.configuration).createPointOfSale(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllPointOfSaleContainers(o, s, n, a) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getAllPointOfSaleProducts(o, s, n, a) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all existing Point of Sales
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointsOfSale(o, s, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(o, s) {
      return (0, t.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns a single Points of Sale update
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSingleUpdatedPointOfSale(o, s) {
      return (0, t.PointofsaleApiFp)(this.configuration).getSingleUpdatedPointOfSale(o, s).then((n) => n(this.axios, this.basePath));
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
    getTransactions(o, s, n, a) {
      return (0, t.PointofsaleApiFp)(this.configuration).getTransactions(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Returns all updated Points of Sale
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getUpdated(o, s, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).getUpdated(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} pointofsale    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(o, s, n) {
      return (0, t.PointofsaleApiFp)(this.configuration).updatePointOfSale(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.PointofsaleApi = or;
  const cr = function(u) {
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProductCategory", "productCategory", o);
        const n = "/productcategories", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllProductCategories: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/productcategories", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProductCategory", "id", o);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      updateProductCategory: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductCategory", "id", o), (0, e.assertParamExists)("updateProductCategory", "productCategory", s);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.ProductCategoriesApiAxiosParamCreator = cr;
  const lr = function(u) {
    const o = (0, t.ProductCategoriesApiAxiosParamCreator)(u);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createProductCategory(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllProductCategories(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleProductCategory(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateProductCategory(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.ProductCategoriesApiFp = lr;
  const ur = function(u, o, s) {
    const n = (0, t.ProductCategoriesApiFp)(u);
    return {
      /**
       *  Post a new productCategory.
       * @param {ProductCategoryRequest} productCategory The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(a, r) {
        return n.createProductCategory(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(a, r, c) {
        return n.getAllProductCategories(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(a, r) {
        return n.getSingleProductCategory(a, r).then((c) => c(s, o));
      },
      /**
       *  Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategory The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(a, r, c) {
        return n.updateProductCategory(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.ProductCategoriesApiFactory = ur;
  class dr extends h.BaseAPI {
    /**
     *  Post a new productCategory.
     * @param {ProductCategoryRequest} productCategory The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(o, s) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).createProductCategory(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing productcategories
     * @param {number} [take] How many product categories the endpoint should return
     * @param {number} [skip] How many product categories should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getAllProductCategories(o, s, n) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(o, s) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} productCategory The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(o, s, n) {
      return (0, t.ProductCategoriesApiFp)(this.configuration).updateProductCategory(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.ProductCategoriesApi = dr;
  const hr = function(u) {
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("approveProduct", "id", o);
        const n = "/products/{id}/approve".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createProduct", "product", o);
        const n = "/products", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllProducts: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/products", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleProduct", "id", o);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUpdateProduct", "id", o);
        const n = "/products/{id}/update".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getUpdatedProducts: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/products/updated", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      updateProduct: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProduct", "id", o), (0, e.assertParamExists)("updateProduct", "product", s);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
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
      updateProductImage: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateProductImage", "id", o);
        const a = "/products/{id}/image".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "POST" }, c), n), p = {}, A = {}, P = new (u && u.formDataCtor || FormData)();
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), s !== void 0 && P.append("file", s), p["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(r, A);
        let U = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), U), n.headers), d.data = P, {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.ProductsApiAxiosParamCreator = hr;
  const pr = function(u) {
    const o = (0, t.ProductsApiAxiosParamCreator)(u);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.approveProduct(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createProduct(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllProducts(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleProduct(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getUpdateProduct(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getUpdatedProducts(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateProduct(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateProductImage(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.ProductsApiFp = pr;
  const Ar = function(u, o, s) {
    const n = (0, t.ProductsApiFp)(u);
    return {
      /**
       *  Approve a product update.
       * @param {number} id The id of the product update to approve
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      approveProduct(a, r) {
        return n.approveProduct(a, r).then((c) => c(s, o));
      },
      /**
       *  Create a new product.
       * @param {CreateProductRequest} product The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(a, r) {
        return n.createProduct(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(a, r, c) {
        return n.getAllProducts(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(a, r) {
        return n.getSingleProduct(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns the requested updated product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdateProduct(a, r) {
        return n.getUpdateProduct(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all updated products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUpdatedProducts(a, r, c) {
        return n.getUpdatedProducts(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} product The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(a, r, c) {
        return n.updateProduct(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] null
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(a, r, c) {
        return n.updateProductImage(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.ProductsApiFactory = Ar;
  class fr extends h.BaseAPI {
    /**
     *  Approve a product update.
     * @param {number} id The id of the product update to approve
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    approveProduct(o, s) {
      return (0, t.ProductsApiFp)(this.configuration).approveProduct(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new product.
     * @param {CreateProductRequest} product The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(o, s) {
      return (0, t.ProductsApiFp)(this.configuration).createProduct(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getAllProducts(o, s, n) {
      return (0, t.ProductsApiFp)(this.configuration).getAllProducts(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(o, s) {
      return (0, t.ProductsApiFp)(this.configuration).getSingleProduct(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns the requested updated product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdateProduct(o, s) {
      return (0, t.ProductsApiFp)(this.configuration).getUpdateProduct(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all updated products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getUpdatedProducts(o, s, n) {
      return (0, t.ProductsApiFp)(this.configuration).getUpdatedProducts(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} product The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(o, s, n) {
      return (0, t.ProductsApiFp)(this.configuration).updateProduct(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Upload a new image for a product
     * @param {number} id The id of the product which should be returned
     * @param {File} [file] null
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProductImage(o, s, n) {
      return (0, t.ProductsApiFp)(this.configuration).updateProductImage(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.ProductsApi = fr;
  const Or = function(u) {
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/rbac/roles", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "GET" }, a), o), c = {}, d = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", u), (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      })
    };
  };
  t.RbacApiAxiosParamCreator = Or;
  const Pr = function(u) {
    const o = (0, t.RbacApiAxiosParamCreator)(u);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.getAllRoles(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.RbacApiFp = Pr;
  const br = function(u, o, s) {
    const n = (0, t.RbacApiFp)(u);
    return {
      /**
       *  Returns all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(a) {
        return n.getAllRoles(a).then((r) => r(s, o));
      }
    };
  };
  t.RbacApiFactory = br;
  class gr extends h.BaseAPI {
    /**
     *  Returns all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(o) {
      return (0, t.RbacApiFp)(this.configuration).getAllRoles(o).then((s) => s(this.axios, this.basePath));
    }
  }
  t.RbacApi = gr;
  const mr = function(u) {
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/ping", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "GET" }, a), o), c = {}, d = {};
        (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      })
    };
  };
  t.RootApiAxiosParamCreator = mr;
  const yr = function(u) {
    const o = (0, t.RootApiAxiosParamCreator)(u);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.ping(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.RootApiFp = yr;
  const Sr = function(u, o, s) {
    const n = (0, t.RootApiFp)(u);
    return {
      /**
       *  Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(a) {
        return n.ping(a).then((r) => r(s, o));
      }
    };
  };
  t.RootApiFactory = Sr;
  class Ur extends h.BaseAPI {
    /**
     *  Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(o) {
      return (0, t.RootApiFp)(this.configuration).ping(o).then((s) => s(this.axios, this.basePath));
    }
  }
  t.RootApi = Ur;
  const jr = function(u) {
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deposit", "stripe", o);
        const n = "/stripe/deposit", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/stripe/webhook", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "POST" }, a), o), c = {}, d = {};
        (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      })
    };
  };
  t.StripeApiAxiosParamCreator = jr;
  const Rr = function(u) {
    const o = (0, t.StripeApiAxiosParamCreator)(u);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deposit(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.webhook(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.StripeApiFp = Rr;
  const vr = function(u, o, s) {
    const n = (0, t.StripeApiFp)(u);
    return {
      /**
       *  Start the stripe deposit flow
       * @param {StripeRequest} stripe The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(a, r) {
        return n.deposit(a, r).then((c) => c(s, o));
      },
      /**
       *  Webhook for Stripe event updates
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      webhook(a) {
        return n.webhook(a).then((r) => r(s, o));
      }
    };
  };
  t.StripeApiFactory = vr;
  class Vr extends h.BaseAPI {
    /**
     *  Start the stripe deposit flow
     * @param {StripeRequest} stripe The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(o, s) {
      return (0, t.StripeApiFp)(this.configuration).deposit(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Webhook for Stripe event updates
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    webhook(o) {
      return (0, t.StripeApiFp)(this.configuration).webhook(o).then((s) => s(this.axios, this.basePath));
    }
  }
  t.StripeApi = Vr;
  const Tr = function(u) {
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (o = {}) => i(this, void 0, void 0, function* () {
        const s = "/test/helloworld", n = new URL(s, e.DUMMY_BASE_URL);
        let a;
        u && (a = u.baseOptions);
        const r = Object.assign(Object.assign({ method: "POST" }, a), o), c = {}, d = {};
        yield (0, e.setApiKeyToObject)(c, "Authorization", u), (0, e.setSearchParams)(n, d);
        let p = a && a.headers ? a.headers : {};
        return r.headers = Object.assign(Object.assign(Object.assign({}, c), p), o.headers), {
          url: (0, e.toPathString)(n),
          options: r
        };
      })
    };
  };
  t.TestApiAxiosParamCreator = Tr;
  const Er = function(u) {
    const o = (0, t.TestApiAxiosParamCreator)(u);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(s) {
        return i(this, void 0, void 0, function* () {
          const n = yield o.helloworld(s);
          return (0, e.createRequestFunction)(n, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.TestApiFp = Er;
  const Fr = function(u, o, s) {
    const n = (0, t.TestApiFp)(u);
    return {
      /**
       *  Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(a) {
        return n.helloworld(a).then((r) => r(s, o));
      }
    };
  };
  t.TestApiFactory = Fr;
  class Br extends h.BaseAPI {
    /**
     *  Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestApi
     */
    helloworld(o) {
      return (0, t.TestApiFp)(this.configuration).helloworld(o).then((s) => s(this.axios, this.basePath));
    }
  }
  t.TestApi = Br;
  const _r = function(u) {
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransaction", "transaction", o);
        const n = "/transactions", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteTransaction", "id", o);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getAllTransactions: (o, s, n, a, r, c, d, p, A, P, U = {}) => i(this, void 0, void 0, function* () {
        const E = "/transactions", T = new URL(E, e.DUMMY_BASE_URL);
        let V;
        u && (V = u.baseOptions);
        const $ = Object.assign(Object.assign({ method: "GET" }, V), U), Pe = {}, w = {};
        yield (0, e.setApiKeyToObject)(Pe, "Authorization", u), o !== void 0 && (w.fromId = o), s !== void 0 && (w.createdById = s), n !== void 0 && (w.toId = n), a !== void 0 && (w.pointOfSaleId = a), r !== void 0 && (w.productId = r), c !== void 0 && (w.productRevision = c), d !== void 0 && (w.fromDate = d), p !== void 0 && (w.tillDate = p), A !== void 0 && (w.take = A), P !== void 0 && (w.skip = P), (0, e.setSearchParams)(T, w);
        let Ge = V && V.headers ? V.headers : {};
        return $.headers = Object.assign(Object.assign(Object.assign({}, Pe), Ge), U.headers), {
          url: (0, e.toPathString)(T),
          options: $
        };
      }),
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransaction", "id", o);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      updateTransaction: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateTransaction", "id", o), (0, e.assertParamExists)("updateTransaction", "transaction", s);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("validateTransaction", "transaction", o);
        const n = "/transactions/validate", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      })
    };
  };
  t.TransactionsApiAxiosParamCreator = _r;
  const Cr = function(u) {
    const o = (0, t.TransactionsApiAxiosParamCreator)(u);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createTransaction(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteTransaction(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllTransactions(s, n, a, r, c, d, p, A, P, U, E) {
        return i(this, void 0, void 0, function* () {
          const T = yield o.getAllTransactions(s, n, a, r, c, d, p, A, P, U, E);
          return (0, e.createRequestFunction)(T, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleTransaction(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateTransaction(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.validateTransaction(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.TransactionsApiFp = Cr;
  const wr = function(u, o, s) {
    const n = (0, t.TransactionsApiFp)(u);
    return {
      /**
       *  Creates a new transaction
       * @param {TransactionRequest} transaction The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(a, r) {
        return n.createTransaction(a, r).then((c) => c(s, o));
      },
      /**
       *  Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(a, r) {
        return n.deleteTransaction(a, r).then((c) => c(s, o));
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
      getAllTransactions(a, r, c, d, p, A, P, U, E, T, V) {
        return n.getAllTransactions(a, r, c, d, p, A, P, U, E, T, V).then(($) => $(s, o));
      },
      /**
       *  Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(a, r) {
        return n.getSingleTransaction(a, r).then((c) => c(s, o));
      },
      /**
       *  Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transaction The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(a, r, c) {
        return n.updateTransaction(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transaction The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(a, r) {
        return n.validateTransaction(a, r).then((c) => c(s, o));
      }
    };
  };
  t.TransactionsApiFactory = wr;
  class Lr extends h.BaseAPI {
    /**
     *  Creates a new transaction
     * @param {TransactionRequest} transaction The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(o, s) {
      return (0, t.TransactionsApiFp)(this.configuration).createTransaction(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(o, s) {
      return (0, t.TransactionsApiFp)(this.configuration).deleteTransaction(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllTransactions(o, s, n, a, r, c, d, p, A, P, U) {
      return (0, t.TransactionsApiFp)(this.configuration).getAllTransactions(o, s, n, a, r, c, d, p, A, P, U).then((E) => E(this.axios, this.basePath));
    }
    /**
     *  Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(o, s) {
      return (0, t.TransactionsApiFp)(this.configuration).getSingleTransaction(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} transaction The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(o, s, n) {
      return (0, t.TransactionsApiFp)(this.configuration).updateTransaction(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transaction The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(o, s) {
      return (0, t.TransactionsApiFp)(this.configuration).validateTransaction(o, s).then((n) => n(this.axios, this.basePath));
    }
  }
  t.TransactionsApi = Lr;
  const qr = function(u) {
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createTransfer", "transfer", o);
        const n = "/transfers", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllTransfers: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        const a = "/transfers", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.take = o), s !== void 0 && (A.skip = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleTransfer", "id", o);
        const n = "/transfers/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      })
    };
  };
  t.TransfersApiAxiosParamCreator = qr;
  const Dr = function(u) {
    const o = (0, t.TransfersApiAxiosParamCreator)(u);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createTransfer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getAllTransfers(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleTransfer(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.TransfersApiFp = Dr;
  const Mr = function(u, o, s) {
    const n = (0, t.TransfersApiFp)(u);
    return {
      /**
       *  Post a new transfer.
       * @param {TransferRequest} transfer The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(a, r) {
        return n.createTransfer(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(a, r, c) {
        return n.getAllTransfers(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(a, r) {
        return n.getSingleTransfer(a, r).then((c) => c(s, o));
      }
    };
  };
  t.TransfersApiFactory = Mr;
  class Ir extends h.BaseAPI {
    /**
     *  Post a new transfer.
     * @param {TransferRequest} transfer The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(o, s) {
      return (0, t.TransfersApiFp)(this.configuration).createTransfer(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Returns all existing transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getAllTransfers(o, s, n) {
      return (0, t.TransfersApiFp)(this.configuration).getAllTransfers(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(o, s) {
      return (0, t.TransfersApiFp)(this.configuration).getSingleTransfer(o, s).then((n) => n(this.axios, this.basePath));
    }
  }
  t.TransfersApi = Ir;
  const Hr = function(u) {
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("acceptTos", "params", o);
        const n = "/users/acceptTos", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("authenticateAs", "id", o);
        const n = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createUser", "user", o);
        const n = "/users", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUser", "id", o);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserKey", "id", o);
        const n = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("deleteUserNfc", "id", o);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "DELETE" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getAllUsers: (o, s, n, a, r, c, d, p = {}) => i(this, void 0, void 0, function* () {
        const A = "/users", P = new URL(A, e.DUMMY_BASE_URL);
        let U;
        u && (U = u.baseOptions);
        const E = Object.assign(Object.assign({ method: "GET" }, U), p), T = {}, V = {};
        yield (0, e.setApiKeyToObject)(T, "Authorization", u), o !== void 0 && (V.take = o), s !== void 0 && (V.skip = s), n !== void 0 && (V.search = n), a !== void 0 && (V.active = a), r !== void 0 && (V.ofAge = r), c !== void 0 && (V.id = c), d !== void 0 && (V.type = d), (0, e.setSearchParams)(P, V);
        let $ = U && U.headers ? U.headers : {};
        return E.headers = Object.assign(Object.assign(Object.assign({}, T), $), p.headers), {
          url: (0, e.toPathString)(P),
          options: E
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
      getAllUsersOfUserType: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", o);
        const r = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getIndividualUser: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getIndividualUser", "id", o);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getOrganMembers", "id", o);
        const n = "/users/{id}/members".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", o);
        const n = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
          options: c
        };
      }),
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUserRoles", "id", o);
        const n = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getUsersContainers: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersContainers", "id", o);
        const r = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersFinancialMutations: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", o);
        const r = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersPointsOfSale: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", o);
        const r = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersProcessingDeposits: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", o);
        const n = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getUsersProducts: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersProducts", "id", o);
        const r = "/users/{id}/products".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersTransactions: (o, s, n, a, r, c, d, p, A, P, U = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactions", "id", o);
        const E = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(o))), T = new URL(E, e.DUMMY_BASE_URL);
        let V;
        u && (V = u.baseOptions);
        const $ = Object.assign(Object.assign({ method: "GET" }, V), U), Pe = {}, w = {};
        yield (0, e.setApiKeyToObject)(Pe, "Authorization", u), s !== void 0 && (w.fromId = s), n !== void 0 && (w.createdById = n), a !== void 0 && (w.toId = a), r !== void 0 && (w.productId = r), c !== void 0 && (w.productRevision = c), d !== void 0 && (w.fromDate = d), p !== void 0 && (w.tillDate = p), A !== void 0 && (w.take = A), P !== void 0 && (w.skip = P), (0, e.setSearchParams)(T, w);
        let Ge = V && V.headers ? V.headers : {};
        return $.headers = Object.assign(Object.assign(Object.assign({}, Pe), Ge), U.headers), {
          url: (0, e.toPathString)(T),
          options: $
        };
      }),
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport: (o, s, n, a, r, c = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", o);
        const d = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(o))), p = new URL(d, e.DUMMY_BASE_URL);
        let A;
        u && (A = u.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, A), c), U = {}, E = {};
        yield (0, e.setApiKeyToObject)(U, "Authorization", u), s !== void 0 && (E.fromDate = s), n !== void 0 && (E.tillDate = n), a !== void 0 && (E.fromId = a), r !== void 0 && (E.toId = r), (0, e.setSearchParams)(p, E);
        let T = A && A.headers ? A.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, U), T), c.headers), {
          url: (0, e.toPathString)(p),
          options: P
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
      getUsersTransfers: (o, s, n, a, r, c, d = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersTransfers", "id", o);
        const p = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(o))), A = new URL(p, e.DUMMY_BASE_URL);
        let P;
        u && (P = u.baseOptions);
        const U = Object.assign(Object.assign({ method: "GET" }, P), d), E = {}, T = {};
        yield (0, e.setApiKeyToObject)(E, "Authorization", u), s !== void 0 && (T.take = s), n !== void 0 && (T.skip = n), a !== void 0 && (T.fromId = a), r !== void 0 && (T.toId = r), c !== void 0 && (T.id = c), (0, e.setSearchParams)(A, T);
        let V = P && P.headers ? P.headers : {};
        return U.headers = Object.assign(Object.assign(Object.assign({}, E), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: U
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
      getUsersUpdatedContainers: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedContainers", "id", o);
        const r = "/users/{id}/containers/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersUpdatedPointsOfSale: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedPointsOfSale", "id", o);
        const r = "/users/{id}/pointsofsale/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      getUsersUpdatedProducts: (o, s, n, a = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getUsersUpdatedProducts", "id", o);
        const r = "/users/{id}/products/updated".replace("{id}", encodeURIComponent(String(o))), c = new URL(r, e.DUMMY_BASE_URL);
        let d;
        u && (d = u.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), a), A = {}, P = {};
        yield (0, e.setApiKeyToObject)(A, "Authorization", u), s !== void 0 && (P.take = s), n !== void 0 && (P.skip = n), (0, e.setSearchParams)(c, P);
        let U = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, A), U), a.headers), {
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
      updateUser: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUser", "id", o), (0, e.assertParamExists)("updateUser", "user", s);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      }),
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserKey", "id", o);
        const n = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      updateUserLocalPassword: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", o), (0, e.assertParamExists)("updateUserLocalPassword", "update", s);
        const a = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
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
      updateUserNfc: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserNfc", "id", o), (0, e.assertParamExists)("updateUserNfc", "update", s);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
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
      updateUserPin: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateUserPin", "id", o), (0, e.assertParamExists)("updateUserPin", "update", s);
        const a = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PUT" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.UsersApiAxiosParamCreator = Hr;
  const xr = function(u) {
    const o = (0, t.UsersApiAxiosParamCreator)(u);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.acceptTos(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.authenticateAs(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createUser(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteUser(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteUserKey(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.deleteUserNfc(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllUsers(s, n, a, r, c, d, p, A) {
        return i(this, void 0, void 0, function* () {
          const P = yield o.getAllUsers(s, n, a, r, c, d, p, A);
          return (0, e.createRequestFunction)(P, l.default, h.BASE_PATH, u);
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
      getAllUsersOfUserType(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getAllUsersOfUserType(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getIndividualUser(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getOrganMembers(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getUserAuthenticatable(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getUserRoles(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getUsersContainers(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersContainers(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getUsersFinancialMutations(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersFinancialMutations(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getUsersPointsOfSale(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersPointsOfSale(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getUsersProcessingDeposits(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getUsersProducts(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersProducts(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getUsersTransactions(s, n, a, r, c, d, p, A, P, U, E) {
        return i(this, void 0, void 0, function* () {
          const T = yield o.getUsersTransactions(s, n, a, r, c, d, p, A, P, U, E);
          return (0, e.createRequestFunction)(T, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(s, n, a, r, c, d) {
        return i(this, void 0, void 0, function* () {
          const p = yield o.getUsersTransactionsReport(s, n, a, r, c, d);
          return (0, e.createRequestFunction)(p, l.default, h.BASE_PATH, u);
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
      getUsersTransfers(s, n, a, r, c, d, p) {
        return i(this, void 0, void 0, function* () {
          const A = yield o.getUsersTransfers(s, n, a, r, c, d, p);
          return (0, e.createRequestFunction)(A, l.default, h.BASE_PATH, u);
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
      getUsersUpdatedContainers(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedContainers(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getUsersUpdatedPointsOfSale(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedPointsOfSale(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
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
      getUsersUpdatedProducts(s, n, a, r) {
        return i(this, void 0, void 0, function* () {
          const c = yield o.getUsersUpdatedProducts(s, n, a, r);
          return (0, e.createRequestFunction)(c, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateUser(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.updateUserKey(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateUserLocalPassword(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateUserNfc(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateUserPin(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.UsersApiFp = xr;
  const Nr = function(u, o, s) {
    const n = (0, t.UsersApiFp)(u);
    return {
      /**
       *  Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(a, r) {
        return n.acceptTos(a, r).then((c) => c(s, o));
      },
      /**
       *  Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(a, r) {
        return n.authenticateAs(a, r).then((c) => c(s, o));
      },
      /**
       *  Create a new user
       * @param {CreateUserRequest} user The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(a, r) {
        return n.createUser(a, r).then((c) => c(s, o));
      },
      /**
       *  Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(a, r) {
        return n.deleteUser(a, r).then((c) => c(s, o));
      },
      /**
       *  Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(a, r) {
        return n.deleteUserKey(a, r).then((c) => c(s, o));
      },
      /**
       *  Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(a, r) {
        return n.deleteUserNfc(a, r).then((c) => c(s, o));
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
      getAllUsers(a, r, c, d, p, A, P, U) {
        return n.getAllUsers(a, r, c, d, p, A, P, U).then((E) => E(s, o));
      },
      /**
       *  Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(a, r, c, d) {
        return n.getAllUsersOfUserType(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(a, r) {
        return n.getIndividualUser(a, r).then((c) => c(s, o));
      },
      /**
       *  Get an organs members
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(a, r) {
        return n.getOrganMembers(a, r).then((c) => c(s, o));
      },
      /**
       *  Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(a, r) {
        return n.getUserAuthenticatable(a, r).then((c) => c(s, o));
      },
      /**
       *  Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(a, r) {
        return n.getUserRoles(a, r).then((c) => c(s, o));
      },
      /**
       *  Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(a, r, c, d) {
        return n.getUsersContainers(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Get all financial mutations of a user.
       * @param {number} id The id of the user to get the mutations from
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(a, r, c, d) {
        return n.getUsersFinancialMutations(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(a, r, c, d) {
        return n.getUsersPointsOfSale(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(a, r) {
        return n.getUsersProcessingDeposits(a, r).then((c) => c(s, o));
      },
      /**
       *  Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(a, r, c, d) {
        return n.getUsersProducts(a, r, c, d).then((p) => p(s, o));
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
      getUsersTransactions(a, r, c, d, p, A, P, U, E, T, V) {
        return n.getUsersTransactions(a, r, c, d, p, A, P, U, E, T, V).then(($) => $(s, o));
      },
      /**
       *  Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(a, r, c, d, p, A) {
        return n.getUsersTransactionsReport(a, r, c, d, p, A).then((P) => P(s, o));
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
      getUsersTransfers(a, r, c, d, p, A, P) {
        return n.getUsersTransfers(a, r, c, d, p, A, P).then((U) => U(s, o));
      },
      /**
       *  Returns the user\'s updated containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedContainers(a, r, c, d) {
        return n.getUsersUpdatedContainers(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Returns the user\'s updated Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedPointsOfSale(a, r, c, d) {
        return n.getUsersUpdatedPointsOfSale(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Get an user\'s updated products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersUpdatedProducts(a, r, c, d) {
        return n.getUsersUpdatedProducts(a, r, c, d).then((p) => p(s, o));
      },
      /**
       *  Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} user The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(a, r, c) {
        return n.updateUser(a, r, c).then((d) => d(s, o));
      },
      /**
       *  POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(a, r) {
        return n.updateUserKey(a, r).then((c) => c(s, o));
      },
      /**
       *  Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} update    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(a, r, c) {
        return n.updateUserLocalPassword(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} update    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(a, r, c) {
        return n.updateUserNfc(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} update    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(a, r, c) {
        return n.updateUserPin(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.UsersApiFactory = Nr;
  class $r extends h.BaseAPI {
    /**
     *  Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} params \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(o, s) {
      return (0, t.UsersApiFp)(this.configuration).acceptTos(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(o, s) {
      return (0, t.UsersApiFp)(this.configuration).authenticateAs(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Create a new user
     * @param {CreateUserRequest} user The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(o, s) {
      return (0, t.UsersApiFp)(this.configuration).createUser(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(o, s) {
      return (0, t.UsersApiFp)(this.configuration).deleteUser(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(o, s) {
      return (0, t.UsersApiFp)(this.configuration).deleteUserKey(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(o, s) {
      return (0, t.UsersApiFp)(this.configuration).deleteUserNfc(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllUsers(o, s, n, a, r, c, d, p) {
      return (0, t.UsersApiFp)(this.configuration).getAllUsers(o, s, n, a, r, c, d, p).then((A) => A(this.axios, this.basePath));
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
    getAllUsersOfUserType(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getAllUsersOfUserType(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(o, s) {
      return (0, t.UsersApiFp)(this.configuration).getIndividualUser(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get an organs members
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getOrganMembers(o, s) {
      return (0, t.UsersApiFp)(this.configuration).getOrganMembers(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(o, s) {
      return (0, t.UsersApiFp)(this.configuration).getUserAuthenticatable(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(o, s) {
      return (0, t.UsersApiFp)(this.configuration).getUserRoles(o, s).then((n) => n(this.axios, this.basePath));
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
    getUsersContainers(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersContainers(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getUsersFinancialMutations(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersFinancialMutations(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getUsersPointsOfSale(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersPointsOfSale(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(o, s) {
      return (0, t.UsersApiFp)(this.configuration).getUsersProcessingDeposits(o, s).then((n) => n(this.axios, this.basePath));
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
    getUsersProducts(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersProducts(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getUsersTransactions(o, s, n, a, r, c, d, p, A, P, U) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransactions(o, s, n, a, r, c, d, p, A, P, U).then((E) => E(this.axios, this.basePath));
    }
    /**
     *  Get transaction report for the given user
     * @param {number} id The id of the user to get the transaction report from
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [toId] To-user for selected transactions
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransactionsReport(o, s, n, a, r, c) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransactionsReport(o, s, n, a, r, c).then((d) => d(this.axios, this.basePath));
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
    getUsersTransfers(o, s, n, a, r, c, d) {
      return (0, t.UsersApiFp)(this.configuration).getUsersTransfers(o, s, n, a, r, c, d).then((p) => p(this.axios, this.basePath));
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
    getUsersUpdatedContainers(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedContainers(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getUsersUpdatedPointsOfSale(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedPointsOfSale(o, s, n, a).then((r) => r(this.axios, this.basePath));
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
    getUsersUpdatedProducts(o, s, n, a) {
      return (0, t.UsersApiFp)(this.configuration).getUsersUpdatedProducts(o, s, n, a).then((r) => r(this.axios, this.basePath));
    }
    /**
     *  Update a user
     * @param {number} id The id of the user
     * @param {UpdateUserRequest} user The user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUser(o, s, n) {
      return (0, t.UsersApiFp)(this.configuration).updateUser(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(o, s) {
      return (0, t.UsersApiFp)(this.configuration).updateUserKey(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} update    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(o, s, n) {
      return (0, t.UsersApiFp)(this.configuration).updateUserLocalPassword(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} update    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(o, s, n) {
      return (0, t.UsersApiFp)(this.configuration).updateUserNfc(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} update    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(o, s, n) {
      return (0, t.UsersApiFp)(this.configuration).updateUserPin(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.UsersApi = $r;
  const kr = function(u) {
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("createVatGroup", "vatGroup", o);
        const n = "/vatgroups", a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "POST" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), d["Content-Type"] = "application/json", (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), c.data = (0, e.serializeDataIfNeeded)(o, c, u), {
          url: (0, e.toPathString)(a),
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
      getAllVatGroups: (o, s, n, a, r, c, d = {}) => i(this, void 0, void 0, function* () {
        const p = "/vatgroups", A = new URL(p, e.DUMMY_BASE_URL);
        let P;
        u && (P = u.baseOptions);
        const U = Object.assign(Object.assign({ method: "GET" }, P), d), E = {}, T = {};
        yield (0, e.setApiKeyToObject)(E, "Authorization", u), o !== void 0 && (T.vatGroupId = o), s !== void 0 && (T.name = s), n !== void 0 && (T.percentage = n), a !== void 0 && (T.deleted = a), r !== void 0 && (T.take = r), c !== void 0 && (T.skip = c), (0, e.setSearchParams)(A, T);
        let V = P && P.headers ? P.headers : {};
        return U.headers = Object.assign(Object.assign(Object.assign({}, E), V), d.headers), {
          url: (0, e.toPathString)(A),
          options: U
        };
      }),
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (o, s = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getSingleVatGroup", "id", o);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(o))), a = new URL(n, e.DUMMY_BASE_URL);
        let r;
        u && (r = u.baseOptions);
        const c = Object.assign(Object.assign({ method: "GET" }, r), s), d = {}, p = {};
        yield (0, e.setApiKeyToObject)(d, "Authorization", u), (0, e.setSearchParams)(a, p);
        let A = r && r.headers ? r.headers : {};
        return c.headers = Object.assign(Object.assign(Object.assign({}, d), A), s.headers), {
          url: (0, e.toPathString)(a),
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
      getVatDeclarationAmounts: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", o), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", s);
        const a = "/vatgroups/declaration", r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "GET" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), o !== void 0 && (A.year = o), s !== void 0 && (A.period = s), (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), {
          url: (0, e.toPathString)(r),
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
      updateVatGroup: (o, s, n = {}) => i(this, void 0, void 0, function* () {
        (0, e.assertParamExists)("updateVatGroup", "id", o), (0, e.assertParamExists)("updateVatGroup", "vatGroup", s);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(o))), r = new URL(a, e.DUMMY_BASE_URL);
        let c;
        u && (c = u.baseOptions);
        const d = Object.assign(Object.assign({ method: "PATCH" }, c), n), p = {}, A = {};
        yield (0, e.setApiKeyToObject)(p, "Authorization", u), p["Content-Type"] = "application/json", (0, e.setSearchParams)(r, A);
        let P = c && c.headers ? c.headers : {};
        return d.headers = Object.assign(Object.assign(Object.assign({}, p), P), n.headers), d.data = (0, e.serializeDataIfNeeded)(s, d, u), {
          url: (0, e.toPathString)(r),
          options: d
        };
      })
    };
  };
  t.VatGroupsApiAxiosParamCreator = kr;
  const zr = function(u) {
    const o = (0, t.VatGroupsApiAxiosParamCreator)(u);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.createVatGroup(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
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
      getAllVatGroups(s, n, a, r, c, d, p) {
        return i(this, void 0, void 0, function* () {
          const A = yield o.getAllVatGroups(s, n, a, r, c, d, p);
          return (0, e.createRequestFunction)(A, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(s, n) {
        return i(this, void 0, void 0, function* () {
          const a = yield o.getSingleVatGroup(s, n);
          return (0, e.createRequestFunction)(a, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.getVatDeclarationAmounts(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(s, n, a) {
        return i(this, void 0, void 0, function* () {
          const r = yield o.updateVatGroup(s, n, a);
          return (0, e.createRequestFunction)(r, l.default, h.BASE_PATH, u);
        });
      }
    };
  };
  t.VatGroupsApiFp = zr;
  const Kr = function(u, o, s) {
    const n = (0, t.VatGroupsApiFp)(u);
    return {
      /**
       *  Create a new VAT group
       * @param {VatGroupRequest} vatGroup The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(a, r) {
        return n.createVatGroup(a, r).then((c) => c(s, o));
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
      getAllVatGroups(a, r, c, d, p, A, P) {
        return n.getAllVatGroups(a, r, c, d, p, A, P).then((U) => U(s, o));
      },
      /**
       *  Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(a, r) {
        return n.getSingleVatGroup(a, r).then((c) => c(s, o));
      },
      /**
       *  Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(a, r, c) {
        return n.getVatDeclarationAmounts(a, r, c).then((d) => d(s, o));
      },
      /**
       *  Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} vatGroup The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(a, r, c) {
        return n.updateVatGroup(a, r, c).then((d) => d(s, o));
      }
    };
  };
  t.VatGroupsApiFactory = Kr;
  class Gr extends h.BaseAPI {
    /**
     *  Create a new VAT group
     * @param {VatGroupRequest} vatGroup The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(o, s) {
      return (0, t.VatGroupsApiFp)(this.configuration).createVatGroup(o, s).then((n) => n(this.axios, this.basePath));
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
    getAllVatGroups(o, s, n, a, r, c, d) {
      return (0, t.VatGroupsApiFp)(this.configuration).getAllVatGroups(o, s, n, a, r, c, d).then((p) => p(this.axios, this.basePath));
    }
    /**
     *  Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(o, s) {
      return (0, t.VatGroupsApiFp)(this.configuration).getSingleVatGroup(o, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *  Get the VAT collections needed for VAT declarations
     * @param {number} year Calendar year for VAT declarations
     * @param {string} period Period for VAT declarations
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getVatDeclarationAmounts(o, s, n) {
      return (0, t.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(o, s, n).then((a) => a(this.axios, this.basePath));
    }
    /**
     *  Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} vatGroup The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(o, s, n) {
      return (0, t.VatGroupsApiFp)(this.configuration).updateVatGroup(o, s, n).then((a) => a(this.axios, this.basePath));
    }
  }
  t.VatGroupsApi = Gr;
})(Os);
var De = {};
Object.defineProperty(De, "__esModule", { value: !0 });
De.Configuration = void 0;
class Pn {
  constructor(i = {}) {
    this.apiKey = i.apiKey, this.username = i.username, this.password = i.password, this.accessToken = i.accessToken, this.basePath = i.basePath, this.baseOptions = i.baseOptions, this.formDataCtor = i.formDataCtor;
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
  isJsonMime(i) {
    const l = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return i !== null && (l.test(i) || i.toLowerCase() === "application/json-patch+json");
  }
}
De.Configuration = Pn;
(function(t) {
  var i = ae && ae.__createBinding || (Object.create ? function(e, h, f, O) {
    O === void 0 && (O = f);
    var b = Object.getOwnPropertyDescriptor(h, f);
    (!b || ("get" in b ? !h.__esModule : b.writable || b.configurable)) && (b = { enumerable: !0, get: function() {
      return h[f];
    } }), Object.defineProperty(e, O, b);
  } : function(e, h, f, O) {
    O === void 0 && (O = f), e[O] = h[f];
  }), l = ae && ae.__exportStar || function(e, h) {
    for (var f in e)
      f !== "default" && !Object.prototype.hasOwnProperty.call(h, f) && i(h, e, f);
  };
  Object.defineProperty(t, "__esModule", { value: !0 }), l(Os, t), l(De, t);
})(L);
function ws(t, i) {
  return function() {
    return t.apply(i, arguments);
  };
}
const { toString: bn } = Object.prototype, { getPrototypeOf: Ft } = Object, Me = ((t) => (i) => {
  const l = bn.call(i);
  return t[l] || (t[l] = l.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), X = (t) => (t = t.toLowerCase(), (i) => Me(i) === t), Ie = (t) => (i) => typeof i === t, { isArray: pe } = Array, ge = Ie("undefined");
function gn(t) {
  return t !== null && !ge(t) && t.constructor !== null && !ge(t.constructor) && Y(t.constructor.isBuffer) && t.constructor.isBuffer(t);
}
const Ls = X("ArrayBuffer");
function mn(t) {
  let i;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? i = ArrayBuffer.isView(t) : i = t && t.buffer && Ls(t.buffer), i;
}
const yn = Ie("string"), Y = Ie("function"), qs = Ie("number"), He = (t) => t !== null && typeof t == "object", Sn = (t) => t === !0 || t === !1, ve = (t) => {
  if (Me(t) !== "object")
    return !1;
  const i = Ft(t);
  return (i === null || i === Object.prototype || Object.getPrototypeOf(i) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
}, Un = X("Date"), jn = X("File"), Rn = X("Blob"), vn = X("FileList"), Vn = (t) => He(t) && Y(t.pipe), Tn = (t) => {
  let i;
  return t && (typeof FormData == "function" && t instanceof FormData || Y(t.append) && ((i = Me(t)) === "formdata" || // detect form-data instance
  i === "object" && Y(t.toString) && t.toString() === "[object FormData]"));
}, En = X("URLSearchParams"), Fn = (t) => t.trim ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function me(t, i, { allOwnKeys: l = !1 } = {}) {
  if (t === null || typeof t > "u")
    return;
  let e, h;
  if (typeof t != "object" && (t = [t]), pe(t))
    for (e = 0, h = t.length; e < h; e++)
      i.call(null, t[e], e, t);
  else {
    const f = l ? Object.getOwnPropertyNames(t) : Object.keys(t), O = f.length;
    let b;
    for (e = 0; e < O; e++)
      b = f[e], i.call(null, t[b], b, t);
  }
}
function Ds(t, i) {
  i = i.toLowerCase();
  const l = Object.keys(t);
  let e = l.length, h;
  for (; e-- > 0; )
    if (h = l[e], i === h.toLowerCase())
      return h;
  return null;
}
const Ms = (() => typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global)(), Is = (t) => !ge(t) && t !== Ms;
function ft() {
  const { caseless: t } = Is(this) && this || {}, i = {}, l = (e, h) => {
    const f = t && Ds(i, h) || h;
    ve(i[f]) && ve(e) ? i[f] = ft(i[f], e) : ve(e) ? i[f] = ft({}, e) : pe(e) ? i[f] = e.slice() : i[f] = e;
  };
  for (let e = 0, h = arguments.length; e < h; e++)
    arguments[e] && me(arguments[e], l);
  return i;
}
const Bn = (t, i, l, { allOwnKeys: e } = {}) => (me(i, (h, f) => {
  l && Y(h) ? t[f] = ws(h, l) : t[f] = h;
}, { allOwnKeys: e }), t), _n = (t) => (t.charCodeAt(0) === 65279 && (t = t.slice(1)), t), Cn = (t, i, l, e) => {
  t.prototype = Object.create(i.prototype, e), t.prototype.constructor = t, Object.defineProperty(t, "super", {
    value: i.prototype
  }), l && Object.assign(t.prototype, l);
}, wn = (t, i, l, e) => {
  let h, f, O;
  const b = {};
  if (i = i || {}, t == null)
    return i;
  do {
    for (h = Object.getOwnPropertyNames(t), f = h.length; f-- > 0; )
      O = h[f], (!e || e(O, t, i)) && !b[O] && (i[O] = t[O], b[O] = !0);
    t = l !== !1 && Ft(t);
  } while (t && (!l || l(t, i)) && t !== Object.prototype);
  return i;
}, Ln = (t, i, l) => {
  t = String(t), (l === void 0 || l > t.length) && (l = t.length), l -= i.length;
  const e = t.indexOf(i, l);
  return e !== -1 && e === l;
}, qn = (t) => {
  if (!t)
    return null;
  if (pe(t))
    return t;
  let i = t.length;
  if (!qs(i))
    return null;
  const l = new Array(i);
  for (; i-- > 0; )
    l[i] = t[i];
  return l;
}, Dn = ((t) => (i) => t && i instanceof t)(typeof Uint8Array < "u" && Ft(Uint8Array)), Mn = (t, i) => {
  const e = (t && t[Symbol.iterator]).call(t);
  let h;
  for (; (h = e.next()) && !h.done; ) {
    const f = h.value;
    i.call(t, f[0], f[1]);
  }
}, In = (t, i) => {
  let l;
  const e = [];
  for (; (l = t.exec(i)) !== null; )
    e.push(l);
  return e;
}, Hn = X("HTMLFormElement"), xn = (t) => t.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(l, e, h) {
    return e.toUpperCase() + h;
  }
), as = (({ hasOwnProperty: t }) => (i, l) => t.call(i, l))(Object.prototype), Nn = X("RegExp"), Hs = (t, i) => {
  const l = Object.getOwnPropertyDescriptors(t), e = {};
  me(l, (h, f) => {
    i(h, f, t) !== !1 && (e[f] = h);
  }), Object.defineProperties(t, e);
}, $n = (t) => {
  Hs(t, (i, l) => {
    if (Y(t) && ["arguments", "caller", "callee"].indexOf(l) !== -1)
      return !1;
    const e = t[l];
    if (Y(e)) {
      if (i.enumerable = !1, "writable" in i) {
        i.writable = !1;
        return;
      }
      i.set || (i.set = () => {
        throw Error("Can not rewrite read-only method '" + l + "'");
      });
    }
  });
}, kn = (t, i) => {
  const l = {}, e = (h) => {
    h.forEach((f) => {
      l[f] = !0;
    });
  };
  return pe(t) ? e(t) : e(String(t).split(i)), l;
}, zn = () => {
}, Kn = (t, i) => (t = +t, Number.isFinite(t) ? t : i), lt = "abcdefghijklmnopqrstuvwxyz", ns = "0123456789", xs = {
  DIGIT: ns,
  ALPHA: lt,
  ALPHA_DIGIT: lt + lt.toUpperCase() + ns
}, Gn = (t = 16, i = xs.ALPHA_DIGIT) => {
  let l = "";
  const { length: e } = i;
  for (; t--; )
    l += i[Math.random() * e | 0];
  return l;
};
function Qn(t) {
  return !!(t && Y(t.append) && t[Symbol.toStringTag] === "FormData" && t[Symbol.iterator]);
}
const Yn = (t) => {
  const i = new Array(10), l = (e, h) => {
    if (He(e)) {
      if (i.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        i[h] = e;
        const f = pe(e) ? [] : {};
        return me(e, (O, b) => {
          const y = l(O, h + 1);
          !ge(y) && (f[b] = y);
        }), i[h] = void 0, f;
      }
    }
    return e;
  };
  return l(t, 0);
}, Wn = X("AsyncFunction"), Jn = (t) => t && (He(t) || Y(t)) && Y(t.then) && Y(t.catch), g = {
  isArray: pe,
  isArrayBuffer: Ls,
  isBuffer: gn,
  isFormData: Tn,
  isArrayBufferView: mn,
  isString: yn,
  isNumber: qs,
  isBoolean: Sn,
  isObject: He,
  isPlainObject: ve,
  isUndefined: ge,
  isDate: Un,
  isFile: jn,
  isBlob: Rn,
  isRegExp: Nn,
  isFunction: Y,
  isStream: Vn,
  isURLSearchParams: En,
  isTypedArray: Dn,
  isFileList: vn,
  forEach: me,
  merge: ft,
  extend: Bn,
  trim: Fn,
  stripBOM: _n,
  inherits: Cn,
  toFlatObject: wn,
  kindOf: Me,
  kindOfTest: X,
  endsWith: Ln,
  toArray: qn,
  forEachEntry: Mn,
  matchAll: In,
  isHTMLForm: Hn,
  hasOwnProperty: as,
  hasOwnProp: as,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Hs,
  freezeMethods: $n,
  toObjectSet: kn,
  toCamelCase: xn,
  noop: zn,
  toFiniteNumber: Kn,
  findKey: Ds,
  global: Ms,
  isContextDefined: Is,
  ALPHABET: xs,
  generateString: Gn,
  isSpecCompliantForm: Qn,
  toJSONObject: Yn,
  isAsyncFn: Wn,
  isThenable: Jn
};
function C(t, i, l, e, h) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = t, this.name = "AxiosError", i && (this.code = i), l && (this.config = l), e && (this.request = e), h && (this.response = h);
}
g.inherits(C, Error, {
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
const Ns = C.prototype, $s = {};
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
  $s[t] = { value: t };
});
Object.defineProperties(C, $s);
Object.defineProperty(Ns, "isAxiosError", { value: !0 });
C.from = (t, i, l, e, h, f) => {
  const O = Object.create(Ns);
  return g.toFlatObject(t, O, function(y) {
    return y !== Error.prototype;
  }, (b) => b !== "isAxiosError"), C.call(O, t.message, i, l, e, h), O.cause = t, O.name = t.name, f && Object.assign(O, f), O;
};
const Xn = null;
function Ot(t) {
  return g.isPlainObject(t) || g.isArray(t);
}
function ks(t) {
  return g.endsWith(t, "[]") ? t.slice(0, -2) : t;
}
function is(t, i, l) {
  return t ? t.concat(i).map(function(h, f) {
    return h = ks(h), !l && f ? "[" + h + "]" : h;
  }).join(l ? "." : "") : i;
}
function Zn(t) {
  return g.isArray(t) && !t.some(Ot);
}
const ei = g.toFlatObject(g, {}, null, function(i) {
  return /^is[A-Z]/.test(i);
});
function xe(t, i, l) {
  if (!g.isObject(t))
    throw new TypeError("target must be an object");
  i = i || new FormData(), l = g.toFlatObject(l, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(F, x) {
    return !g.isUndefined(x[F]);
  });
  const e = l.metaTokens, h = l.visitor || S, f = l.dots, O = l.indexes, y = (l.Blob || typeof Blob < "u" && Blob) && g.isSpecCompliantForm(i);
  if (!g.isFunction(h))
    throw new TypeError("visitor must be a function");
  function m(v) {
    if (v === null)
      return "";
    if (g.isDate(v))
      return v.toISOString();
    if (!y && g.isBlob(v))
      throw new C("Blob is not supported. Use a Buffer instead.");
    return g.isArrayBuffer(v) || g.isTypedArray(v) ? y && typeof Blob == "function" ? new Blob([v]) : Buffer.from(v) : v;
  }
  function S(v, F, x) {
    let M = v;
    if (v && !x && typeof v == "object") {
      if (g.endsWith(F, "{}"))
        F = e ? F : F.slice(0, -2), v = JSON.stringify(v);
      else if (g.isArray(v) && Zn(v) || (g.isFileList(v) || g.endsWith(F, "[]")) && (M = g.toArray(v)))
        return F = ks(F), M.forEach(function(K, ie) {
          !(g.isUndefined(K) || K === null) && i.append(
            // eslint-disable-next-line no-nested-ternary
            O === !0 ? is([F], ie, f) : O === null ? F : F + "[]",
            m(K)
          );
        }), !1;
    }
    return Ot(v) ? !0 : (i.append(is(x, F, f), m(v)), !1);
  }
  const R = [], j = Object.assign(ei, {
    defaultVisitor: S,
    convertValue: m,
    isVisitable: Ot
  });
  function _(v, F) {
    if (!g.isUndefined(v)) {
      if (R.indexOf(v) !== -1)
        throw Error("Circular reference detected in " + F.join("."));
      R.push(v), g.forEach(v, function(M, k) {
        (!(g.isUndefined(M) || M === null) && h.call(
          i,
          M,
          g.isString(k) ? k.trim() : k,
          F,
          j
        )) === !0 && _(M, F ? F.concat(k) : [k]);
      }), R.pop();
    }
  }
  if (!g.isObject(t))
    throw new TypeError("data must be an object");
  return _(t), i;
}
function os(t) {
  const i = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(t).replace(/[!'()~]|%20|%00/g, function(e) {
    return i[e];
  });
}
function Bt(t, i) {
  this._pairs = [], t && xe(t, this, i);
}
const zs = Bt.prototype;
zs.append = function(i, l) {
  this._pairs.push([i, l]);
};
zs.toString = function(i) {
  const l = i ? function(e) {
    return i.call(this, e, os);
  } : os;
  return this._pairs.map(function(h) {
    return l(h[0]) + "=" + l(h[1]);
  }, "").join("&");
};
function ti(t) {
  return encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function Ks(t, i, l) {
  if (!i)
    return t;
  const e = l && l.encode || ti, h = l && l.serialize;
  let f;
  if (h ? f = h(i, l) : f = g.isURLSearchParams(i) ? i.toString() : new Bt(i, l).toString(e), f) {
    const O = t.indexOf("#");
    O !== -1 && (t = t.slice(0, O)), t += (t.indexOf("?") === -1 ? "?" : "&") + f;
  }
  return t;
}
class si {
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
  use(i, l, e) {
    return this.handlers.push({
      fulfilled: i,
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
  eject(i) {
    this.handlers[i] && (this.handlers[i] = null);
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
  forEach(i) {
    g.forEach(this.handlers, function(e) {
      e !== null && i(e);
    });
  }
}
const cs = si, Gs = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, ri = typeof URLSearchParams < "u" ? URLSearchParams : Bt, ai = typeof FormData < "u" ? FormData : null, ni = typeof Blob < "u" ? Blob : null, ii = (() => {
  let t;
  return typeof navigator < "u" && ((t = navigator.product) === "ReactNative" || t === "NativeScript" || t === "NS") ? !1 : typeof window < "u" && typeof document < "u";
})(), oi = (() => typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function")(), J = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ri,
    FormData: ai,
    Blob: ni
  },
  isStandardBrowserEnv: ii,
  isStandardBrowserWebWorkerEnv: oi,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function ci(t, i) {
  return xe(t, new J.classes.URLSearchParams(), Object.assign({
    visitor: function(l, e, h, f) {
      return J.isNode && g.isBuffer(l) ? (this.append(e, l.toString("base64")), !1) : f.defaultVisitor.apply(this, arguments);
    }
  }, i));
}
function li(t) {
  return g.matchAll(/\w+|\[(\w*)]/g, t).map((i) => i[0] === "[]" ? "" : i[1] || i[0]);
}
function ui(t) {
  const i = {}, l = Object.keys(t);
  let e;
  const h = l.length;
  let f;
  for (e = 0; e < h; e++)
    f = l[e], i[f] = t[f];
  return i;
}
function Qs(t) {
  function i(l, e, h, f) {
    let O = l[f++];
    const b = Number.isFinite(+O), y = f >= l.length;
    return O = !O && g.isArray(h) ? h.length : O, y ? (g.hasOwnProp(h, O) ? h[O] = [h[O], e] : h[O] = e, !b) : ((!h[O] || !g.isObject(h[O])) && (h[O] = []), i(l, e, h[O], f) && g.isArray(h[O]) && (h[O] = ui(h[O])), !b);
  }
  if (g.isFormData(t) && g.isFunction(t.entries)) {
    const l = {};
    return g.forEachEntry(t, (e, h) => {
      i(li(e), h, l, 0);
    }), l;
  }
  return null;
}
const di = {
  "Content-Type": void 0
};
function hi(t, i, l) {
  if (g.isString(t))
    try {
      return (i || JSON.parse)(t), g.trim(t);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (l || JSON.stringify)(t);
}
const Ne = {
  transitional: Gs,
  adapter: ["xhr", "http"],
  transformRequest: [function(i, l) {
    const e = l.getContentType() || "", h = e.indexOf("application/json") > -1, f = g.isObject(i);
    if (f && g.isHTMLForm(i) && (i = new FormData(i)), g.isFormData(i))
      return h && h ? JSON.stringify(Qs(i)) : i;
    if (g.isArrayBuffer(i) || g.isBuffer(i) || g.isStream(i) || g.isFile(i) || g.isBlob(i))
      return i;
    if (g.isArrayBufferView(i))
      return i.buffer;
    if (g.isURLSearchParams(i))
      return l.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), i.toString();
    let b;
    if (f) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return ci(i, this.formSerializer).toString();
      if ((b = g.isFileList(i)) || e.indexOf("multipart/form-data") > -1) {
        const y = this.env && this.env.FormData;
        return xe(
          b ? { "files[]": i } : i,
          y && new y(),
          this.formSerializer
        );
      }
    }
    return f || h ? (l.setContentType("application/json", !1), hi(i)) : i;
  }],
  transformResponse: [function(i) {
    const l = this.transitional || Ne.transitional, e = l && l.forcedJSONParsing, h = this.responseType === "json";
    if (i && g.isString(i) && (e && !this.responseType || h)) {
      const O = !(l && l.silentJSONParsing) && h;
      try {
        return JSON.parse(i);
      } catch (b) {
        if (O)
          throw b.name === "SyntaxError" ? C.from(b, C.ERR_BAD_RESPONSE, this, null, this.response) : b;
      }
    }
    return i;
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
  validateStatus: function(i) {
    return i >= 200 && i < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*"
    }
  }
};
g.forEach(["delete", "get", "head"], function(i) {
  Ne.headers[i] = {};
});
g.forEach(["post", "put", "patch"], function(i) {
  Ne.headers[i] = g.merge(di);
});
const _t = Ne, pi = g.toObjectSet([
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
]), Ai = (t) => {
  const i = {};
  let l, e, h;
  return t && t.split(`
`).forEach(function(O) {
    h = O.indexOf(":"), l = O.substring(0, h).trim().toLowerCase(), e = O.substring(h + 1).trim(), !(!l || i[l] && pi[l]) && (l === "set-cookie" ? i[l] ? i[l].push(e) : i[l] = [e] : i[l] = i[l] ? i[l] + ", " + e : e);
  }), i;
}, ls = Symbol("internals");
function be(t) {
  return t && String(t).trim().toLowerCase();
}
function Ve(t) {
  return t === !1 || t == null ? t : g.isArray(t) ? t.map(Ve) : String(t);
}
function fi(t) {
  const i = /* @__PURE__ */ Object.create(null), l = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = l.exec(t); )
    i[e[1]] = e[2];
  return i;
}
const Oi = (t) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(t.trim());
function ut(t, i, l, e, h) {
  if (g.isFunction(e))
    return e.call(this, i, l);
  if (h && (i = l), !!g.isString(i)) {
    if (g.isString(e))
      return i.indexOf(e) !== -1;
    if (g.isRegExp(e))
      return e.test(i);
  }
}
function Pi(t) {
  return t.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (i, l, e) => l.toUpperCase() + e);
}
function bi(t, i) {
  const l = g.toCamelCase(" " + i);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(t, e + l, {
      value: function(h, f, O) {
        return this[e].call(this, i, h, f, O);
      },
      configurable: !0
    });
  });
}
class $e {
  constructor(i) {
    i && this.set(i);
  }
  set(i, l, e) {
    const h = this;
    function f(b, y, m) {
      const S = be(y);
      if (!S)
        throw new Error("header name must be a non-empty string");
      const R = g.findKey(h, S);
      (!R || h[R] === void 0 || m === !0 || m === void 0 && h[R] !== !1) && (h[R || y] = Ve(b));
    }
    const O = (b, y) => g.forEach(b, (m, S) => f(m, S, y));
    return g.isPlainObject(i) || i instanceof this.constructor ? O(i, l) : g.isString(i) && (i = i.trim()) && !Oi(i) ? O(Ai(i), l) : i != null && f(l, i, e), this;
  }
  get(i, l) {
    if (i = be(i), i) {
      const e = g.findKey(this, i);
      if (e) {
        const h = this[e];
        if (!l)
          return h;
        if (l === !0)
          return fi(h);
        if (g.isFunction(l))
          return l.call(this, h, e);
        if (g.isRegExp(l))
          return l.exec(h);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(i, l) {
    if (i = be(i), i) {
      const e = g.findKey(this, i);
      return !!(e && this[e] !== void 0 && (!l || ut(this, this[e], e, l)));
    }
    return !1;
  }
  delete(i, l) {
    const e = this;
    let h = !1;
    function f(O) {
      if (O = be(O), O) {
        const b = g.findKey(e, O);
        b && (!l || ut(e, e[b], b, l)) && (delete e[b], h = !0);
      }
    }
    return g.isArray(i) ? i.forEach(f) : f(i), h;
  }
  clear(i) {
    const l = Object.keys(this);
    let e = l.length, h = !1;
    for (; e--; ) {
      const f = l[e];
      (!i || ut(this, this[f], f, i, !0)) && (delete this[f], h = !0);
    }
    return h;
  }
  normalize(i) {
    const l = this, e = {};
    return g.forEach(this, (h, f) => {
      const O = g.findKey(e, f);
      if (O) {
        l[O] = Ve(h), delete l[f];
        return;
      }
      const b = i ? Pi(f) : String(f).trim();
      b !== f && delete l[f], l[b] = Ve(h), e[b] = !0;
    }), this;
  }
  concat(...i) {
    return this.constructor.concat(this, ...i);
  }
  toJSON(i) {
    const l = /* @__PURE__ */ Object.create(null);
    return g.forEach(this, (e, h) => {
      e != null && e !== !1 && (l[h] = i && g.isArray(e) ? e.join(", ") : e);
    }), l;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([i, l]) => i + ": " + l).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(i) {
    return i instanceof this ? i : new this(i);
  }
  static concat(i, ...l) {
    const e = new this(i);
    return l.forEach((h) => e.set(h)), e;
  }
  static accessor(i) {
    const e = (this[ls] = this[ls] = {
      accessors: {}
    }).accessors, h = this.prototype;
    function f(O) {
      const b = be(O);
      e[b] || (bi(h, O), e[b] = !0);
    }
    return g.isArray(i) ? i.forEach(f) : f(i), this;
  }
}
$e.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
g.freezeMethods($e.prototype);
g.freezeMethods($e);
const ee = $e;
function dt(t, i) {
  const l = this || _t, e = i || l, h = ee.from(e.headers);
  let f = e.data;
  return g.forEach(t, function(b) {
    f = b.call(l, f, h.normalize(), i ? i.status : void 0);
  }), h.normalize(), f;
}
function Ys(t) {
  return !!(t && t.__CANCEL__);
}
function ye(t, i, l) {
  C.call(this, t ?? "canceled", C.ERR_CANCELED, i, l), this.name = "CanceledError";
}
g.inherits(ye, C, {
  __CANCEL__: !0
});
function gi(t, i, l) {
  const e = l.config.validateStatus;
  !l.status || !e || e(l.status) ? t(l) : i(new C(
    "Request failed with status code " + l.status,
    [C.ERR_BAD_REQUEST, C.ERR_BAD_RESPONSE][Math.floor(l.status / 100) - 4],
    l.config,
    l.request,
    l
  ));
}
const mi = J.isStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  function() {
    return {
      write: function(l, e, h, f, O, b) {
        const y = [];
        y.push(l + "=" + encodeURIComponent(e)), g.isNumber(h) && y.push("expires=" + new Date(h).toGMTString()), g.isString(f) && y.push("path=" + f), g.isString(O) && y.push("domain=" + O), b === !0 && y.push("secure"), document.cookie = y.join("; ");
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
function yi(t) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(t);
}
function Si(t, i) {
  return i ? t.replace(/\/+$/, "") + "/" + i.replace(/^\/+/, "") : t;
}
function Ws(t, i) {
  return t && !yi(i) ? Si(t, i) : i;
}
const Ui = J.isStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const i = /(msie|trident)/i.test(navigator.userAgent), l = document.createElement("a");
    let e;
    function h(f) {
      let O = f;
      return i && (l.setAttribute("href", O), O = l.href), l.setAttribute("href", O), {
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
      const b = g.isString(O) ? h(O) : O;
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
function ji(t) {
  const i = /^([-+\w]{1,25})(:?\/\/|:)/.exec(t);
  return i && i[1] || "";
}
function Ri(t, i) {
  t = t || 10;
  const l = new Array(t), e = new Array(t);
  let h = 0, f = 0, O;
  return i = i !== void 0 ? i : 1e3, function(y) {
    const m = Date.now(), S = e[f];
    O || (O = m), l[h] = y, e[h] = m;
    let R = f, j = 0;
    for (; R !== h; )
      j += l[R++], R = R % t;
    if (h = (h + 1) % t, h === f && (f = (f + 1) % t), m - O < i)
      return;
    const _ = S && m - S;
    return _ ? Math.round(j * 1e3 / _) : void 0;
  };
}
function us(t, i) {
  let l = 0;
  const e = Ri(50, 250);
  return (h) => {
    const f = h.loaded, O = h.lengthComputable ? h.total : void 0, b = f - l, y = e(b), m = f <= O;
    l = f;
    const S = {
      loaded: f,
      total: O,
      progress: O ? f / O : void 0,
      bytes: b,
      rate: y || void 0,
      estimated: y && O && m ? (O - f) / y : void 0,
      event: h
    };
    S[i ? "download" : "upload"] = !0, t(S);
  };
}
const vi = typeof XMLHttpRequest < "u", Vi = vi && function(t) {
  return new Promise(function(l, e) {
    let h = t.data;
    const f = ee.from(t.headers).normalize(), O = t.responseType;
    let b;
    function y() {
      t.cancelToken && t.cancelToken.unsubscribe(b), t.signal && t.signal.removeEventListener("abort", b);
    }
    g.isFormData(h) && (J.isStandardBrowserEnv || J.isStandardBrowserWebWorkerEnv ? f.setContentType(!1) : f.setContentType("multipart/form-data;", !1));
    let m = new XMLHttpRequest();
    if (t.auth) {
      const _ = t.auth.username || "", v = t.auth.password ? unescape(encodeURIComponent(t.auth.password)) : "";
      f.set("Authorization", "Basic " + btoa(_ + ":" + v));
    }
    const S = Ws(t.baseURL, t.url);
    m.open(t.method.toUpperCase(), Ks(S, t.params, t.paramsSerializer), !0), m.timeout = t.timeout;
    function R() {
      if (!m)
        return;
      const _ = ee.from(
        "getAllResponseHeaders" in m && m.getAllResponseHeaders()
      ), F = {
        data: !O || O === "text" || O === "json" ? m.responseText : m.response,
        status: m.status,
        statusText: m.statusText,
        headers: _,
        config: t,
        request: m
      };
      gi(function(M) {
        l(M), y();
      }, function(M) {
        e(M), y();
      }, F), m = null;
    }
    if ("onloadend" in m ? m.onloadend = R : m.onreadystatechange = function() {
      !m || m.readyState !== 4 || m.status === 0 && !(m.responseURL && m.responseURL.indexOf("file:") === 0) || setTimeout(R);
    }, m.onabort = function() {
      m && (e(new C("Request aborted", C.ECONNABORTED, t, m)), m = null);
    }, m.onerror = function() {
      e(new C("Network Error", C.ERR_NETWORK, t, m)), m = null;
    }, m.ontimeout = function() {
      let v = t.timeout ? "timeout of " + t.timeout + "ms exceeded" : "timeout exceeded";
      const F = t.transitional || Gs;
      t.timeoutErrorMessage && (v = t.timeoutErrorMessage), e(new C(
        v,
        F.clarifyTimeoutError ? C.ETIMEDOUT : C.ECONNABORTED,
        t,
        m
      )), m = null;
    }, J.isStandardBrowserEnv) {
      const _ = (t.withCredentials || Ui(S)) && t.xsrfCookieName && mi.read(t.xsrfCookieName);
      _ && f.set(t.xsrfHeaderName, _);
    }
    h === void 0 && f.setContentType(null), "setRequestHeader" in m && g.forEach(f.toJSON(), function(v, F) {
      m.setRequestHeader(F, v);
    }), g.isUndefined(t.withCredentials) || (m.withCredentials = !!t.withCredentials), O && O !== "json" && (m.responseType = t.responseType), typeof t.onDownloadProgress == "function" && m.addEventListener("progress", us(t.onDownloadProgress, !0)), typeof t.onUploadProgress == "function" && m.upload && m.upload.addEventListener("progress", us(t.onUploadProgress)), (t.cancelToken || t.signal) && (b = (_) => {
      m && (e(!_ || _.type ? new ye(null, t, m) : _), m.abort(), m = null);
    }, t.cancelToken && t.cancelToken.subscribe(b), t.signal && (t.signal.aborted ? b() : t.signal.addEventListener("abort", b)));
    const j = ji(S);
    if (j && J.protocols.indexOf(j) === -1) {
      e(new C("Unsupported protocol " + j + ":", C.ERR_BAD_REQUEST, t));
      return;
    }
    m.send(h || null);
  });
}, Te = {
  http: Xn,
  xhr: Vi
};
g.forEach(Te, (t, i) => {
  if (t) {
    try {
      Object.defineProperty(t, "name", { value: i });
    } catch {
    }
    Object.defineProperty(t, "adapterName", { value: i });
  }
});
const Ti = {
  getAdapter: (t) => {
    t = g.isArray(t) ? t : [t];
    const { length: i } = t;
    let l, e;
    for (let h = 0; h < i && (l = t[h], !(e = g.isString(l) ? Te[l.toLowerCase()] : l)); h++)
      ;
    if (!e)
      throw e === !1 ? new C(
        `Adapter ${l} is not supported by the environment`,
        "ERR_NOT_SUPPORT"
      ) : new Error(
        g.hasOwnProp(Te, l) ? `Adapter '${l}' is not available in the build` : `Unknown adapter '${l}'`
      );
    if (!g.isFunction(e))
      throw new TypeError("adapter is not a function");
    return e;
  },
  adapters: Te
};
function ht(t) {
  if (t.cancelToken && t.cancelToken.throwIfRequested(), t.signal && t.signal.aborted)
    throw new ye(null, t);
}
function ds(t) {
  return ht(t), t.headers = ee.from(t.headers), t.data = dt.call(
    t,
    t.transformRequest
  ), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), Ti.getAdapter(t.adapter || _t.adapter)(t).then(function(e) {
    return ht(t), e.data = dt.call(
      t,
      t.transformResponse,
      e
    ), e.headers = ee.from(e.headers), e;
  }, function(e) {
    return Ys(e) || (ht(t), e && e.response && (e.response.data = dt.call(
      t,
      t.transformResponse,
      e.response
    ), e.response.headers = ee.from(e.response.headers))), Promise.reject(e);
  });
}
const hs = (t) => t instanceof ee ? t.toJSON() : t;
function de(t, i) {
  i = i || {};
  const l = {};
  function e(m, S, R) {
    return g.isPlainObject(m) && g.isPlainObject(S) ? g.merge.call({ caseless: R }, m, S) : g.isPlainObject(S) ? g.merge({}, S) : g.isArray(S) ? S.slice() : S;
  }
  function h(m, S, R) {
    if (g.isUndefined(S)) {
      if (!g.isUndefined(m))
        return e(void 0, m, R);
    } else
      return e(m, S, R);
  }
  function f(m, S) {
    if (!g.isUndefined(S))
      return e(void 0, S);
  }
  function O(m, S) {
    if (g.isUndefined(S)) {
      if (!g.isUndefined(m))
        return e(void 0, m);
    } else
      return e(void 0, S);
  }
  function b(m, S, R) {
    if (R in i)
      return e(m, S);
    if (R in t)
      return e(void 0, m);
  }
  const y = {
    url: f,
    method: f,
    data: f,
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
    headers: (m, S) => h(hs(m), hs(S), !0)
  };
  return g.forEach(Object.keys(Object.assign({}, t, i)), function(S) {
    const R = y[S] || h, j = R(t[S], i[S], S);
    g.isUndefined(j) && R !== b || (l[S] = j);
  }), l;
}
const Js = "1.4.0", Ct = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((t, i) => {
  Ct[t] = function(e) {
    return typeof e === t || "a" + (i < 1 ? "n " : " ") + t;
  };
});
const ps = {};
Ct.transitional = function(i, l, e) {
  function h(f, O) {
    return "[Axios v" + Js + "] Transitional option '" + f + "'" + O + (e ? ". " + e : "");
  }
  return (f, O, b) => {
    if (i === !1)
      throw new C(
        h(O, " has been removed" + (l ? " in " + l : "")),
        C.ERR_DEPRECATED
      );
    return l && !ps[O] && (ps[O] = !0, console.warn(
      h(
        O,
        " has been deprecated since v" + l + " and will be removed in the near future"
      )
    )), i ? i(f, O, b) : !0;
  };
};
function Ei(t, i, l) {
  if (typeof t != "object")
    throw new C("options must be an object", C.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(t);
  let h = e.length;
  for (; h-- > 0; ) {
    const f = e[h], O = i[f];
    if (O) {
      const b = t[f], y = b === void 0 || O(b, f, t);
      if (y !== !0)
        throw new C("option " + f + " must be " + y, C.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (l !== !0)
      throw new C("Unknown option " + f, C.ERR_BAD_OPTION);
  }
}
const Pt = {
  assertOptions: Ei,
  validators: Ct
}, se = Pt.validators;
class Be {
  constructor(i) {
    this.defaults = i, this.interceptors = {
      request: new cs(),
      response: new cs()
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
  request(i, l) {
    typeof i == "string" ? (l = l || {}, l.url = i) : l = i || {}, l = de(this.defaults, l);
    const { transitional: e, paramsSerializer: h, headers: f } = l;
    e !== void 0 && Pt.assertOptions(e, {
      silentJSONParsing: se.transitional(se.boolean),
      forcedJSONParsing: se.transitional(se.boolean),
      clarifyTimeoutError: se.transitional(se.boolean)
    }, !1), h != null && (g.isFunction(h) ? l.paramsSerializer = {
      serialize: h
    } : Pt.assertOptions(h, {
      encode: se.function,
      serialize: se.function
    }, !0)), l.method = (l.method || this.defaults.method || "get").toLowerCase();
    let O;
    O = f && g.merge(
      f.common,
      f[l.method]
    ), O && g.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (v) => {
        delete f[v];
      }
    ), l.headers = ee.concat(O, f);
    const b = [];
    let y = !0;
    this.interceptors.request.forEach(function(F) {
      typeof F.runWhen == "function" && F.runWhen(l) === !1 || (y = y && F.synchronous, b.unshift(F.fulfilled, F.rejected));
    });
    const m = [];
    this.interceptors.response.forEach(function(F) {
      m.push(F.fulfilled, F.rejected);
    });
    let S, R = 0, j;
    if (!y) {
      const v = [ds.bind(this), void 0];
      for (v.unshift.apply(v, b), v.push.apply(v, m), j = v.length, S = Promise.resolve(l); R < j; )
        S = S.then(v[R++], v[R++]);
      return S;
    }
    j = b.length;
    let _ = l;
    for (R = 0; R < j; ) {
      const v = b[R++], F = b[R++];
      try {
        _ = v(_);
      } catch (x) {
        F.call(this, x);
        break;
      }
    }
    try {
      S = ds.call(this, _);
    } catch (v) {
      return Promise.reject(v);
    }
    for (R = 0, j = m.length; R < j; )
      S = S.then(m[R++], m[R++]);
    return S;
  }
  getUri(i) {
    i = de(this.defaults, i);
    const l = Ws(i.baseURL, i.url);
    return Ks(l, i.params, i.paramsSerializer);
  }
}
g.forEach(["delete", "get", "head", "options"], function(i) {
  Be.prototype[i] = function(l, e) {
    return this.request(de(e || {}, {
      method: i,
      url: l,
      data: (e || {}).data
    }));
  };
});
g.forEach(["post", "put", "patch"], function(i) {
  function l(e) {
    return function(f, O, b) {
      return this.request(de(b || {}, {
        method: i,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: f,
        data: O
      }));
    };
  }
  Be.prototype[i] = l(), Be.prototype[i + "Form"] = l(!0);
});
const Ee = Be;
class wt {
  constructor(i) {
    if (typeof i != "function")
      throw new TypeError("executor must be a function.");
    let l;
    this.promise = new Promise(function(f) {
      l = f;
    });
    const e = this;
    this.promise.then((h) => {
      if (!e._listeners)
        return;
      let f = e._listeners.length;
      for (; f-- > 0; )
        e._listeners[f](h);
      e._listeners = null;
    }), this.promise.then = (h) => {
      let f;
      const O = new Promise((b) => {
        e.subscribe(b), f = b;
      }).then(h);
      return O.cancel = function() {
        e.unsubscribe(f);
      }, O;
    }, i(function(f, O, b) {
      e.reason || (e.reason = new ye(f, O, b), l(e.reason));
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
  subscribe(i) {
    if (this.reason) {
      i(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(i) : this._listeners = [i];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(i) {
    if (!this._listeners)
      return;
    const l = this._listeners.indexOf(i);
    l !== -1 && this._listeners.splice(l, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let i;
    return {
      token: new wt(function(h) {
        i = h;
      }),
      cancel: i
    };
  }
}
const Fi = wt;
function Bi(t) {
  return function(l) {
    return t.apply(null, l);
  };
}
function _i(t) {
  return g.isObject(t) && t.isAxiosError === !0;
}
const bt = {
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
Object.entries(bt).forEach(([t, i]) => {
  bt[i] = t;
});
const Ci = bt;
function Xs(t) {
  const i = new Ee(t), l = ws(Ee.prototype.request, i);
  return g.extend(l, Ee.prototype, i, { allOwnKeys: !0 }), g.extend(l, i, null, { allOwnKeys: !0 }), l.create = function(h) {
    return Xs(de(t, h));
  }, l;
}
const I = Xs(_t);
I.Axios = Ee;
I.CanceledError = ye;
I.CancelToken = Fi;
I.isCancel = Ys;
I.VERSION = Js;
I.toFormData = xe;
I.AxiosError = C;
I.Cancel = I.CanceledError;
I.all = function(i) {
  return Promise.all(i);
};
I.spread = Bi;
I.isAxiosError = _i;
I.mergeConfig = de;
I.AxiosHeaders = ee;
I.formToJSON = (t) => Qs(g.isHTMLForm(t) ? new FormData(t) : t);
I.HttpStatusCode = Ci;
I.default = I;
const wi = I;
function gt(t) {
  this.message = t;
}
gt.prototype = new Error(), gt.prototype.name = "InvalidCharacterError";
var As = typeof window < "u" && window.atob && window.atob.bind(window) || function(t) {
  var i = String(t).replace(/=+$/, "");
  if (i.length % 4 == 1)
    throw new gt("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var l, e, h = 0, f = 0, O = ""; e = i.charAt(f++); ~e && (l = h % 4 ? 64 * l + e : e, h++ % 4) ? O += String.fromCharCode(255 & l >> (-2 * h & 6)) : 0)
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e);
  return O;
};
function Li(t) {
  var i = t.replace(/-/g, "+").replace(/_/g, "/");
  switch (i.length % 4) {
    case 0:
      break;
    case 2:
      i += "==";
      break;
    case 3:
      i += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(l) {
      return decodeURIComponent(As(l).replace(/(.)/g, function(e, h) {
        var f = h.charCodeAt(0).toString(16).toUpperCase();
        return f.length < 2 && (f = "0" + f), "%" + f;
      }));
    }(i);
  } catch {
    return As(i);
  }
}
function _e(t) {
  this.message = t;
}
function qi(t, i) {
  if (typeof t != "string")
    throw new _e("Invalid token specified");
  var l = (i = i || {}).header === !0 ? 0 : 1;
  try {
    return JSON.parse(Li(t.split(".")[l]));
  } catch (e) {
    throw new _e("Invalid token specified: " + e.message);
  }
}
_e.prototype = new Error(), _e.prototype.name = "InvalidTokenError";
const Zs = wi.create();
function Di(t) {
  localStorage.setItem("jwt_expires", String(Number(qi(t).exp) * 1e3)), localStorage.setItem("jwt_token", t);
}
Zs.interceptors.response.use((t) => {
  if (t.headers["Set-Authorization"]) {
    const i = t.headers["Set-Authorization"];
    Di(i);
  }
  return t;
});
class xi {
  constructor(i, l) {
    D(this, "_authenticateApi");
    D(this, "_balanceApi");
    D(this, "_usersApi");
    D(this, "_posApi");
    D(this, "_categoryApi");
    D(this, "_transactionApi");
    D(this, "_bannerApi");
    D(this, "_rootApi");
    D(this, "_borrelkaartApi");
    D(this, "_containerApi");
    D(this, "_filesApi");
    D(this, "_invoicesApi");
    D(this, "_payoutsApi");
    D(this, "_productsApi");
    D(this, "_transfersApi");
    D(this, "_vatGroupsApi");
    D(this, "_stripeApi");
    D(this, "_rbacApi");
    D(this, "_openBannerApi");
    const e = new L.Configuration({ basePath: i }), h = new L.Configuration({
      basePath: i,
      baseOptions: {
        axios: Zs
      },
      apiKey: l
    });
    this._authenticateApi = new L.AuthenticateApi(e), this._balanceApi = new L.BalanceApi(h), this._usersApi = new L.UsersApi(h), this._posApi = new L.PointofsaleApi(h), this._categoryApi = new L.ProductCategoriesApi(h), this._transactionApi = new L.TransactionsApi(h), this._bannerApi = new L.BannersApi(h), this._openBannerApi = new L.BannersApi(e), this._rootApi = new L.RootApi(), this._borrelkaartApi = new L.BorrelkaartgroupsApi(h), this._containerApi = new L.ContainersApi(h), this._filesApi = new L.FilesApi(h), this._invoicesApi = new L.InvoicesApi(h), this._payoutsApi = new L.PayoutRequestsApi(h), this._productsApi = new L.ProductsApi(h), this._transfersApi = new L.TransfersApi(h), this._vatGroupsApi = new L.VatGroupsApi(h), this._stripeApi = new L.StripeApi(h), this._rbacApi = new L.RbacApi(h);
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
  get categories() {
    return this._categoryApi;
  }
  get borrelKaart() {
    return this._borrelkaartApi;
  }
  get openBanner() {
    return this._openBannerApi;
  }
}
export {
  xi as ApiService,
  Jr as fetchAllPages,
  Hi as useAuthStore,
  Xr as useUserStore
};
