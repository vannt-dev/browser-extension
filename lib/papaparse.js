var xe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Te(L) {
  return L && L.__esModule && Object.prototype.hasOwnProperty.call(L, "default") ? L.default : L;
}
function Ae(L) {
  if (L.__esModule) return L;
  var G = L.default;
  if (typeof G == "function") {
    var U = function k() {
      return this instanceof k ? Reflect.construct(G, arguments, this.constructor) : G.apply(this, arguments);
    };
    U.prototype = G.prototype;
  } else U = {};
  return Object.defineProperty(U, "__esModule", { value: !0 }), Object.keys(L).forEach(function(k) {
    var he = Object.getOwnPropertyDescriptor(L, k);
    Object.defineProperty(U, k, he.get ? he : {
      enumerable: !0,
      get: function() {
        return L[k];
      }
    });
  }), U;
}
var be = { exports: {} };
const De = {}, Ie = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: De
}, Symbol.toStringTag, { value: "Module" })), Fe = /* @__PURE__ */ Ae(Ie);
/* @license
Papa Parse
v5.5.4
https://github.com/mholt/PapaParse
License: MIT
*/
(function(L, G) {
  (function(U, k) {
    L.exports = k();
  })(xe, function U() {
    var k = /* @__PURE__ */ function() {
      return typeof self < "u" ? self : typeof window < "u" ? window : typeof k < "u" ? k : {};
    }();
    function he() {
      var e = k.URL || k.webkitURL || null, t = U.toString();
      return l.BLOB_URL || (l.BLOB_URL = e.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t, ")();"], { type: "text/javascript" })));
    }
    var ee = !k.document && !!k.postMessage, de = k.IS_PAPA_WORKER || !1, fe = {}, Ce = 0, l = {};
    if (l.parse = Ee, l.unparse = Re, l.RECORD_SEP = "", l.UNIT_SEP = "", l.BYTE_ORDER_MARK = "\uFEFF", l.BAD_DELIMITERS = ["\r", `
`, '"', l.BYTE_ORDER_MARK], l.WORKERS_SUPPORTED = !ee && !!k.Worker, l.NODE_STREAM_INPUT = 1, l.LocalChunkSize = 1024 * 1024 * 10, l.RemoteChunkSize = 1024 * 1024 * 5, l.DefaultDelimiter = ",", l.Parser = ce, l.ParserHandle = ye, l.NetworkStreamer = re, l.FileStreamer = se, l.StringStreamer = Y, l.ReadableStreamStreamer = ie, typeof PAPA_BROWSER_CONTEXT > "u" && (l.DuplexStreamStreamer = ne), k.jQuery) {
      var te = k.jQuery;
      te.fn.parse = function(e) {
        var t = e.config || {}, r = [];
        return this.each(function(o) {
          var i = te(this).prop("tagName").toUpperCase() === "INPUT" && te(this).attr("type").toLowerCase() === "file" && k.FileReader;
          if (!i || !this.files || this.files.length === 0)
            return !0;
          for (var y = 0; y < this.files.length; y++)
            r.push({
              file: this.files[y],
              inputElem: this,
              instanceConfig: te.extend({}, t)
            });
        }), s(), this;
        function s() {
          if (r.length === 0) {
            b(e.complete) && e.complete();
            return;
          }
          var o = r[0];
          if (b(e.before)) {
            var i = e.before(o.file, o.inputElem);
            if (typeof i == "object")
              if (i.action === "abort") {
                n("AbortError", o.file, o.inputElem, i.reason);
                return;
              } else if (i.action === "skip") {
                m();
                return;
              } else typeof i.config == "object" && (o.instanceConfig = te.extend(o.instanceConfig, i.config));
            else if (i === "skip") {
              m();
              return;
            }
          }
          var y = o.instanceConfig.complete;
          o.instanceConfig.complete = function(E) {
            b(y) && y(E, o.file, o.inputElem), m();
          }, l.parse(o.file, o.instanceConfig);
        }
        function n(o, i, y, E) {
          b(e.error) && e.error({ name: o }, i, y, E);
        }
        function m() {
          r.splice(0, 1), s();
        }
      };
    }
    de && (k.onmessage = Oe);
    function pe(e) {
      return e.charCodeAt(0) === 65279 ? e.slice(1) : e;
    }
    function Ee(e, t) {
      t = t || {};
      var r = t.dynamicTyping || !1;
      if (b(r) && (t.dynamicTypingFunction = r, r = {}), t.dynamicTyping = r, t.transform = b(t.transform) ? t.transform : !1, t.worker && l.WORKERS_SUPPORTED) {
        var s = Se();
        s.userStep = t.step, s.userChunk = t.chunk, s.userComplete = t.complete, s.userError = t.error, t.step = b(t.step), t.chunk = b(t.chunk), t.complete = b(t.complete), t.error = b(t.error), delete t.worker, s.postMessage({
          input: e,
          config: t,
          workerId: s.id
        });
        return;
      }
      var n = null;
      return e === l.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT > "u" ? (n = new ne(t), n.getStream()) : (typeof e == "string" ? (e = pe(e), t.download ? n = new re(t) : n = new Y(t)) : e.readable === !0 && b(e.read) && b(e.on) ? n = new ie(t) : (k.File && e instanceof File || e instanceof Object) && (n = new se(t)), n.stream(e));
    }
    function Re(e, t) {
      var r = !1, s = !0, n = ",", m = `\r
`, o = '"', i = o + o, y = !1, E = null, w = !1;
      M();
      var d = new RegExp(ae(o), "g");
      if (typeof e == "string" && (e = JSON.parse(e)), Array.isArray(e)) {
        if (!e.length || Array.isArray(e[0]))
          return h(null, e, y);
        if (typeof e[0] == "object")
          return h(E || Object.keys(e[0]), e, y);
      } else if (typeof e == "object")
        return typeof e.data == "string" && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || E), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : typeof e.data[0] == "object" ? Object.keys(e.data[0]) : []), !Array.isArray(e.data[0]) && typeof e.data[0] != "object" && (e.data = [e.data])), h(e.fields || [], e.data || [], y);
      throw new Error("Unable to serialize unrecognized input");
      function M() {
        if (typeof t == "object") {
          if (typeof t.delimiter == "string" && !l.BAD_DELIMITERS.filter(function(v) {
            return t.delimiter.indexOf(v) !== -1;
          }).length && (n = t.delimiter), (typeof t.quotes == "boolean" || typeof t.quotes == "function" || Array.isArray(t.quotes)) && (r = t.quotes), (typeof t.skipEmptyLines == "boolean" || typeof t.skipEmptyLines == "string") && (y = t.skipEmptyLines), typeof t.newline == "string" && (m = t.newline), typeof t.quoteChar == "string" && (o = t.quoteChar, i = o + o), typeof t.header == "boolean" && (s = t.header), Array.isArray(t.columns)) {
            if (t.columns.length === 0) throw new Error("Option columns is empty");
            E = t.columns;
          }
          t.escapeChar !== void 0 && (i = t.escapeChar + o), t.escapeFormulae instanceof RegExp ? w = t.escapeFormulae : typeof t.escapeFormulae == "boolean" && t.escapeFormulae && (w = /^[=+\-@\t\r].*$/);
        }
      }
      function h(v, _, S) {
        var T = "";
        typeof v == "string" && (v = JSON.parse(v)), typeof _ == "string" && (_ = JSON.parse(_));
        var O = Array.isArray(v) && v.length > 0, A = !Array.isArray(_[0]);
        if (O && s) {
          for (var q = 0; q < v.length; q++)
            q > 0 && (T += n), T += p(v[q], q);
          _.length > 0 && (T += m);
        }
        for (var g = 0; g < _.length; g++) {
          var B = O ? v.length : _[g].length, W = !1, u = O ? Object.keys(_[g]).length === 0 : _[g].length === 0;
          if (S && !O && (W = S === "greedy" ? _[g].join("").trim() === "" : _[g].length === 1 && _[g][0].length === 0), S === "greedy" && O) {
            for (var f = [], c = 0; c < B; c++) {
              var R = A ? v[c] : c;
              f.push(_[g][R]);
            }
            W = f.join("").trim() === "";
          }
          if (!W) {
            for (var a = 0; a < B; a++) {
              a > 0 && !u && (T += n);
              var C = O && A ? v[a] : a;
              T += p(_[g][C], a);
            }
            g < _.length - 1 && (!S || B > 0 && !u) && (T += m);
          }
        }
        return T;
      }
      function p(v, _) {
        if (typeof v > "u" || v === null)
          return "";
        if (v.constructor === Date)
          return JSON.stringify(v).slice(1, 25);
        var S = !1;
        w && typeof v == "string" && w.test(v) && (v = "'" + v, S = !0);
        var T = v.toString(), O = T.replace(d, i);
        return S = S || r === !0 || typeof r == "function" && r(v, _) || Array.isArray(r) && r[_] || $(O, l.BAD_DELIMITERS) || O.indexOf(n) > -1 || T.indexOf(o) > -1 || O.charAt(0) === " " || O.charAt(O.length - 1) === " ", S ? o + O + o : O;
      }
      function $(v, _) {
        for (var S = 0; S < _.length; S++)
          if (v.indexOf(_[S]) > -1)
            return !0;
        return !1;
      }
    }
    function z(e) {
      this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = {
        data: [],
        errors: [],
        meta: {}
      }, t.call(this, e), this.parseChunk = function(r, s) {
        const n = parseInt(this._config.skipFirstNLines) || 0;
        if (this.isFirstChunk && n > 0) {
          let w = this._config.newline;
          if (!w) {
            const M = this._config.quoteChar || '"';
            w = this._handle.guessLineEndings(r, M);
          }
          r = [...r.split(w).slice(n)].join(w);
        }
        if (this.isFirstChunk && b(this._config.beforeFirstChunk)) {
          var m = this._config.beforeFirstChunk(r);
          m !== void 0 && (r = m);
        }
        this.isFirstChunk = !1, this._halted = !1;
        var o = this._partialLine + r;
        this._partialLine = "";
        var i = this._handle.parse(o, this._baseIndex, !this._finished);
        if (this._handle.paused() || this._handle.aborted()) {
          this._halted = !0;
          return;
        }
        var y = i.meta.cursor;
        this._finished || (this._partialLine = o.substring(y - this._baseIndex), this._baseIndex = y), i && i.data && (this._rowCount += i.data.length);
        var E = this._finished || this._config.preview && this._rowCount >= this._config.preview;
        if (de)
          k.postMessage({
            results: i,
            workerId: l.WORKER_ID,
            finished: E
          });
        else if (b(this._config.chunk) && !s) {
          if (this._config.chunk(i, this._handle), this._handle.paused() || this._handle.aborted()) {
            this._halted = !0;
            return;
          }
          i = void 0, this._completeResults = void 0;
        }
        return !this._config.step && !this._config.chunk && (this._completeResults.data = this._completeResults.data.concat(i.data), this._completeResults.errors = this._completeResults.errors.concat(i.errors), this._completeResults.meta = i.meta), !this._completed && E && b(this._config.complete) && (!i || !i.meta.aborted) && (this._config.complete(this._completeResults, this._input), this._completed = !0), !E && (!i || !i.meta.paused) && this._nextChunk(), i;
      }, this._sendError = function(r) {
        b(this._config.error) ? this._config.error(r) : de && this._config.error && k.postMessage({
          workerId: l.WORKER_ID,
          error: r,
          finished: !1
        });
      };
      function t(r) {
        var s = le(r);
        s.chunkSize = parseInt(s.chunkSize), !r.step && !r.chunk && (s.chunkSize = null), this._handle = new ye(s), this._handle.streamer = this, this._config = s;
      }
    }
    function re(e) {
      e = e || {}, e.chunkSize || (e.chunkSize = l.RemoteChunkSize), z.call(this, e);
      var t;
      ee ? this._nextChunk = function() {
        this._readChunk(), this._chunkLoaded();
      } : this._nextChunk = function() {
        this._readChunk();
      }, this.stream = function(s) {
        this._input = s, this._nextChunk();
      }, this._readChunk = function() {
        if (this._finished) {
          this._chunkLoaded();
          return;
        }
        if (t = new XMLHttpRequest(), this._config.withCredentials && (t.withCredentials = this._config.withCredentials), ee || (t.onload = P(this._chunkLoaded, this), t.onerror = P(this._chunkError, this)), t.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !ee), this._config.downloadRequestHeaders) {
          var s = this._config.downloadRequestHeaders;
          for (var n in s)
            t.setRequestHeader(n, s[n]);
        }
        if (this._config.chunkSize) {
          var m = this._start + this._config.chunkSize - 1;
          t.setRequestHeader("Range", "bytes=" + this._start + "-" + m);
        }
        try {
          t.send(this._config.downloadRequestBody);
        } catch (o) {
          this._chunkError(o.message);
        }
        ee && t.status === 0 && this._chunkError();
      }, this._chunkLoaded = function() {
        if (t.readyState === 4) {
          if (t.status < 200 || t.status >= 400) {
            this._chunkError();
            return;
          }
          this._start += this._config.chunkSize ? this._config.chunkSize : t.responseText.length, this._finished = !this._config.chunkSize || this._start >= r(t), this.parseChunk(t.responseText);
        }
      }, this._chunkError = function(s) {
        var n = t.statusText || s;
        this._sendError(new Error(n));
      };
      function r(s) {
        var n = s.getResponseHeader("Content-Range");
        return n === null ? -1 : parseInt(n.substring(n.lastIndexOf("/") + 1));
      }
    }
    re.prototype = Object.create(z.prototype), re.prototype.constructor = re;
    function se(e) {
      e = e || {}, e.chunkSize || (e.chunkSize = l.LocalChunkSize), z.call(this, e);
      var t, r, s = typeof FileReader < "u";
      this.stream = function(n) {
        this._input = n, r = n.slice || n.webkitSlice || n.mozSlice, s ? (t = new FileReader(), t.onload = P(this._chunkLoaded, this), t.onerror = P(this._chunkError, this)) : t = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function() {
        !this._finished && (!this._config.preview || this._rowCount < this._config.preview) && this._readChunk();
      }, this._readChunk = function() {
        var n = this._input;
        if (this._config.chunkSize) {
          var m = Math.min(this._start + this._config.chunkSize, this._input.size);
          n = r.call(n, this._start, m);
        }
        var o = t.readAsText(n, this._config.encoding);
        s || this._chunkLoaded({ target: { result: o } });
      }, this._chunkLoaded = function(n) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(n.target.result);
      }, this._chunkError = function() {
        this._sendError(t.error);
      };
    }
    se.prototype = Object.create(z.prototype), se.prototype.constructor = se;
    function Y(e) {
      e = e || {}, z.call(this, e);
      var t;
      this.stream = function(r) {
        return t = r, this._nextChunk();
      }, this._nextChunk = function() {
        if (!this._finished) {
          var r = this._config.chunkSize, s;
          return r ? (s = t.substring(0, r), t = t.substring(r)) : (s = t, t = ""), this._finished = !t, this.parseChunk(s);
        }
      };
    }
    Y.prototype = Object.create(Y.prototype), Y.prototype.constructor = Y;
    function ie(e) {
      e = e || {}, z.call(this, e);
      var t = [], r = !0, s = !1;
      this.pause = function() {
        z.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function() {
        z.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function(n) {
        this._input = n, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function() {
        s && t.length === 1 && (this._finished = !0);
      }, this._nextChunk = function() {
        this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : r = !0;
      }, this._streamData = P(function(n) {
        try {
          t.push(typeof n == "string" ? n : n.toString(this._config.encoding)), r && (r = !1, this._checkIsFinished(), this.parseChunk(t.shift()));
        } catch (m) {
          this._streamError(m);
        }
      }, this), this._streamError = P(function(n) {
        this._streamCleanUp(), this._sendError(n);
      }, this), this._streamEnd = P(function() {
        this._streamCleanUp(), s = !0, this._streamData("");
      }, this), this._streamCleanUp = P(function() {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }
    ie.prototype = Object.create(z.prototype), ie.prototype.constructor = ie;
    function ne(e) {
      var t = Fe.Duplex, r = le(e), s = !0, n = !1, m = [], o = null;
      this._onCsvData = function(i) {
        var y = i.data;
        !o.push(y) && !this._handle.paused() && this._handle.pause();
      }, this._onCsvComplete = function() {
        o.push(null);
      }, r.step = P(this._onCsvData, this), r.complete = P(this._onCsvComplete, this), z.call(this, r), this._nextChunk = function() {
        n && m.length === 1 && (this._finished = !0), m.length ? m.shift()() : s = !0;
      }, this._addToParseQueue = function(i, y) {
        m.push(P(function() {
          if (this.parseChunk(typeof i == "string" ? i : i.toString(r.encoding)), b(y))
            return y();
        }, this)), s && (s = !1, this._nextChunk());
      }, this._onRead = function() {
        this._handle.paused() && this._handle.resume();
      }, this._onWrite = function(i, y, E) {
        this._addToParseQueue(i, E);
      }, this._onWriteComplete = function() {
        n = !0, this._addToParseQueue("");
      }, this.getStream = function() {
        return o;
      }, o = new t({
        readableObjectMode: !0,
        decodeStrings: !1,
        read: P(this._onRead, this),
        write: P(this._onWrite, this)
      }), o.once("finish", P(this._onWriteComplete, this));
    }
    typeof PAPA_BROWSER_CONTEXT > "u" && (ne.prototype = Object.create(z.prototype), ne.prototype.constructor = ne);
    function ye(e) {
      var t = Math.pow(2, 53), r = -t, s = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, n = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, m = this, o = 0, i = 0, y, E, w = !1, d = !1, M, h = [], p = {
        // The last results returned from the parser
        data: [],
        errors: [],
        meta: {}
      };
      if (b(e.step)) {
        var $ = e.step;
        e.step = function(u) {
          if (p = u, T())
            S();
          else {
            if (S(), p.data.length === 0)
              return;
            o += u.data.length, e.preview && o > e.preview ? E.abort() : (p.data = p.data[0], $(p, m));
          }
        };
      }
      this.parse = function(u, f, c) {
        var R = e.quoteChar || '"';
        if (e.newline || (e.newline = this.guessLineEndings(u, R)), M = !1, e.delimiter)
          b(e.delimiter) && (e.delimiter = e.delimiter(u), p.meta.delimiter = e.delimiter);
        else {
          var a = B(u, e.newline, e.skipEmptyLines, e.comments, e.delimitersToGuess);
          a.successful ? e.delimiter = a.bestDelimiter : (M = !0, e.delimiter = l.DefaultDelimiter), p.meta.delimiter = e.delimiter;
        }
        var C = le(e);
        return e.preview && e.header && C.preview++, y = u, E = new ce(C), p = E.parse(y, f, c), S(), w ? { meta: { paused: !0 } } : p || { meta: { paused: !1 } };
      }, this.paused = function() {
        return w;
      }, this.pause = function() {
        w = !0, E.abort(), y = b(e.chunk) ? "" : y.substring(E.getCharIndex());
      }, this.resume = function() {
        m.streamer._halted ? (w = !1, m.streamer.parseChunk(y, !0)) : setTimeout(m.resume, 3);
      }, this.aborted = function() {
        return d;
      }, this.abort = function() {
        d = !0, E.abort(), p.meta.aborted = !0, b(e.complete) && e.complete(p), y = "";
      }, this.guessLineEndings = function(u, f) {
        u = u.substring(0, 1024 * 1024);
        var c = new RegExp(ae(f) + "([^]*?)" + ae(f), "gm");
        u = u.replace(c, "");
        var R = u.split("\r"), a = u.split(`
`), C = a.length > 1 && a[0].length < R[0].length;
        if (R.length === 1 || C)
          return `
`;
        for (var D = 0, x = 0; x < R.length; x++)
          R[x][0] === `
` && D++;
        return D >= R.length / 2 ? `\r
` : "\r";
      };
      function v(u) {
        return e.skipEmptyLines === "greedy" ? u.join("").trim() === "" : u.length === 1 && u[0].length === 0;
      }
      function _(u) {
        if (s.test(u)) {
          var f = parseFloat(u);
          if (f > r && f < t)
            return !0;
        }
        return !1;
      }
      function S() {
        return p && M && (W("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + l.DefaultDelimiter + "'"), M = !1), e.skipEmptyLines && (p.data = p.data.filter(function(u) {
          return !v(u);
        })), T() && O(), g();
      }
      function T() {
        return e.header && h.length === 0;
      }
      function O() {
        if (!p)
          return;
        function u(c, R) {
          c = pe(c), b(e.transformHeader) && (c = e.transformHeader(c, R)), h.push(c);
        }
        if (Array.isArray(p.data[0])) {
          for (var f = 0; T() && f < p.data.length; f++)
            p.data[f].forEach(u);
          p.data.splice(0, 1);
        } else
          p.data.forEach(u);
      }
      function A(u) {
        return e.dynamicTypingFunction && e.dynamicTyping[u] === void 0 && (e.dynamicTyping[u] = e.dynamicTypingFunction(u)), (e.dynamicTyping[u] || e.dynamicTyping) === !0;
      }
      function q(u, f) {
        return A(u) ? f === "true" || f === "TRUE" ? !0 : f === "false" || f === "FALSE" ? !1 : _(f) ? parseFloat(f) : n.test(f) ? new Date(f) : f === "" ? null : f : f;
      }
      function g() {
        if (!p || !e.header && !e.dynamicTyping && !e.transform)
          return p;
        function u(c, R) {
          var a = e.header ? {} : [], C;
          for (C = 0; C < c.length; C++) {
            var D = C, x = c[C];
            e.header && (D = C >= h.length ? "__parsed_extra" : h[C]), e.transform && (x = e.transform(x, D)), x = q(D, x), D === "__parsed_extra" ? (a[D] = a[D] || [], a[D].push(x)) : a[D] = x;
          }
          return e.header && (C > h.length ? W("FieldMismatch", "TooManyFields", "Too many fields: expected " + h.length + " fields but parsed " + C, i + R) : C < h.length && W("FieldMismatch", "TooFewFields", "Too few fields: expected " + h.length + " fields but parsed " + C, i + R)), a;
        }
        var f = 1;
        return !p.data.length || Array.isArray(p.data[0]) ? (p.data = p.data.map(u), f = p.data.length) : p.data = u(p.data, 0), e.header && p.meta && (p.meta.fields = h), i += f, p;
      }
      function B(u, f, c, R, a) {
        var C, D, x, X;
        a = a || [",", "	", "|", ";", l.RECORD_SEP, l.UNIT_SEP];
        for (var K = 0; K < a.length; K++) {
          var oe = a[K], Z = 0, Q = 0, F = 0;
          x = void 0;
          for (var H = new ce({
            comments: R,
            delimiter: oe,
            newline: f,
            preview: 10
          }).parse(u), I = 0; I < H.data.length; I++) {
            if (c && v(H.data[I])) {
              F++;
              continue;
            }
            var j = H.data[I].length;
            if (Q += j, typeof x > "u") {
              x = j;
              continue;
            } else j > 0 && (Z += Math.abs(j - x), x = j);
          }
          H.data.length > 0 && (Q /= H.data.length - F), (typeof D > "u" || Z <= D) && (typeof X > "u" || Q > X) && Q > 1.99 && (D = Z, C = oe, X = Q);
        }
        return e.delimiter = C, {
          successful: !!C,
          bestDelimiter: C
        };
      }
      function W(u, f, c, R) {
        var a = {
          type: u,
          code: f,
          message: c
        };
        R !== void 0 && (a.row = R), p.errors.push(a);
      }
    }
    function ae(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function ce(e) {
      e = e || {};
      var t = e.delimiter, r = e.newline, s = e.comments, n = e.step, m = e.preview, o = e.fastMode, i, y = null, E = !1;
      e.quoteChar === void 0 || e.quoteChar === null ? i = '"' : i = e.quoteChar;
      var w = i;
      if (e.escapeChar !== void 0 && (w = e.escapeChar), (typeof t != "string" || l.BAD_DELIMITERS.indexOf(t) > -1) && (t = ","), s === t)
        throw new Error("Comment character same as delimiter");
      s === !0 ? s = "#" : (typeof s != "string" || l.BAD_DELIMITERS.indexOf(s) > -1) && (s = !1), r !== `
` && r !== "\r" && r !== `\r
` && (r = `
`);
      var d = 0, M = !1;
      this.parse = function(h, p, $) {
        if (typeof h != "string")
          throw new Error("Input must be a string");
        var v = h.length, _ = t.length, S = r.length, T = s.length, O = b(n);
        d = 0;
        var A = [], q = [], g = [], B = 0;
        if (!h)
          return F();
        if (o || o !== !1 && h.indexOf(i) === -1) {
          for (var W = h.split(r), u = 0; u < W.length; u++) {
            if (g = W[u], d += g.length, u !== W.length - 1)
              d += r.length;
            else if ($)
              return F();
            if (!(s && g.substring(0, T) === s)) {
              if (O) {
                if (A = [], K(g.split(t)), H(), M)
                  return F();
              } else
                K(g.split(t));
              if (m && u >= m)
                return A = A.slice(0, m), F(!0);
            }
          }
          return F();
        }
        for (var f = h.indexOf(t, d), c = h.indexOf(r, d), R = new RegExp(ae(w) + ae(i), "g"), a = h.indexOf(i, d); ; ) {
          if (h[d] === i) {
            for (a = d, d++; ; ) {
              if (a = h.indexOf(i, a + 1), a === -1)
                return $ || q.push({
                  type: "Quotes",
                  code: "MissingQuotes",
                  message: "Quoted field unterminated",
                  row: A.length,
                  // row has yet to be inserted
                  index: d
                }), Z();
              if (a === v - 1) {
                var C = h.substring(d, a).replace(R, i);
                return Z(C);
              }
              if (i === w && h[a + 1] === w) {
                a++;
                continue;
              }
              if (!(i !== w && a !== 0 && h[a - 1] === w)) {
                f !== -1 && f < a + 1 && (f = h.indexOf(t, a + 1)), c !== -1 && c < a + 1 && (c = h.indexOf(r, a + 1));
                var D = c === -1 ? f : Math.min(f, c), x = oe(D);
                if (h.substr(a + 1 + x, _) === t) {
                  g.push(h.substring(d, a).replace(R, i)), d = a + 1 + x + _, h[a + 1 + x + _] !== i && (a = h.indexOf(i, d)), f = h.indexOf(t, d), c = h.indexOf(r, d);
                  break;
                }
                var X = oe(c);
                if (h.substring(a + 1 + X, a + 1 + X + S) === r) {
                  if (g.push(h.substring(d, a).replace(R, i)), Q(a + 1 + X + S), f = h.indexOf(t, d), a = h.indexOf(i, d), O && (H(), M))
                    return F();
                  if (m && A.length >= m)
                    return F(!0);
                  break;
                }
                q.push({
                  type: "Quotes",
                  code: "InvalidQuotes",
                  message: "Trailing quote on quoted field is malformed",
                  row: A.length,
                  // row has yet to be inserted
                  index: d
                }), a++;
              }
            }
            continue;
          }
          if (s && g.length === 0 && h.substring(d, d + T) === s) {
            if (c === -1)
              return F();
            d = c + S, c = h.indexOf(r, d), f = h.indexOf(t, d);
            continue;
          }
          if (f !== -1 && (f < c || c === -1)) {
            g.push(h.substring(d, f)), d = f + _, f = h.indexOf(t, d);
            continue;
          }
          if (c !== -1) {
            if (g.push(h.substring(d, c)), Q(c + S), O && (H(), M))
              return F();
            if (m && A.length >= m)
              return F(!0);
            continue;
          }
          break;
        }
        return Z();
        function K(I) {
          A.push(I), B = d;
        }
        function oe(I) {
          var j = 0;
          if (I !== -1) {
            var J = h.substring(a + 1, I);
            J && J.trim() === "" && (j = J.length);
          }
          return j;
        }
        function Z(I) {
          return $ || (typeof I > "u" && (I = h.substring(d)), g.push(I), d = v, K(g), O && H()), F();
        }
        function Q(I) {
          d = I, K(g), g = [], c = h.indexOf(r, d);
        }
        function F(I) {
          if (e.header && !p && A.length && !E) {
            const j = A[0], J = /* @__PURE__ */ Object.create(null), me = new Set(j);
            let ge = !1;
            for (let V = 0; V < j.length; V++) {
              let N = pe(j[V]);
              if (b(e.transformHeader) && (N = e.transformHeader(N, V)), !J[N])
                J[N] = 1, j[V] = N;
              else {
                let ue, ke = J[N];
                do
                  ue = `${N}_${ke}`, ke++;
                while (me.has(ue));
                me.add(ue), j[V] = ue, J[N]++, ge = !0, y === null && (y = {}), y[ue] = N;
              }
              me.add(N);
            }
            ge && console.warn("Duplicate headers found and renamed."), E = !0;
          }
          return {
            data: A,
            errors: q,
            meta: {
              delimiter: t,
              linebreak: r,
              aborted: M,
              truncated: !!I,
              cursor: B + (p || 0),
              renamedHeaders: y
            }
          };
        }
        function H() {
          n(F()), A = [], q = [];
        }
      }, this.abort = function() {
        M = !0;
      }, this.getCharIndex = function() {
        return d;
      };
    }
    function Se() {
      if (!l.WORKERS_SUPPORTED)
        return !1;
      var e = he(), t = new k.Worker(e);
      return t.onmessage = we, t.id = Ce++, fe[t.id] = t, t;
    }
    function we(e) {
      var t = e.data, r = fe[t.workerId], s = !1;
      if (t.error)
        r.userError(t.error, t.file);
      else if (t.results && t.results.data) {
        var n = function() {
          s = !0, ve(t.workerId, { data: [], errors: [], meta: { aborted: !0 } });
        }, m = {
          abort: n,
          pause: _e,
          resume: _e
        };
        if (b(r.userStep)) {
          for (var o = 0; o < t.results.data.length && (r.userStep({
            data: t.results.data[o],
            errors: t.results.errors,
            meta: t.results.meta
          }, m), !s); o++)
            ;
          delete t.results;
        } else b(r.userChunk) && (r.userChunk(t.results, m, t.file), delete t.results);
      }
      t.finished && !s && ve(t.workerId, t.results);
    }
    function ve(e, t) {
      var r = fe[e];
      b(r.userComplete) && r.userComplete(t), r.terminate(), delete fe[e];
    }
    function _e() {
      throw new Error("Not implemented.");
    }
    function Oe(e) {
      var t = e.data;
      if (typeof l.WORKER_ID > "u" && t && (l.WORKER_ID = t.workerId), typeof t.input == "string")
        k.postMessage({
          workerId: l.WORKER_ID,
          results: l.parse(t.input, t.config),
          finished: !0
        });
      else if (k.File && t.input instanceof File || t.input instanceof Object) {
        var r = l.parse(t.input, t.config);
        r && k.postMessage({
          workerId: l.WORKER_ID,
          results: r,
          finished: !0
        });
      }
    }
    function le(e) {
      if (typeof e != "object" || e === null)
        return e;
      var t = Array.isArray(e) ? [] : {};
      for (var r in e)
        t[r] = le(e[r]);
      return t;
    }
    function P(e, t) {
      return function() {
        e.apply(t, arguments);
      };
    }
    function b(e) {
      return typeof e == "function";
    }
    return l;
  });
})(be);
var Le = be.exports;
const Pe = /* @__PURE__ */ Te(Le);
export {
  Pe as default
};
