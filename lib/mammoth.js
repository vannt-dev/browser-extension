var pt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function pn(nt) {
  return nt && nt.__esModule && Object.prototype.hasOwnProperty.call(nt, "default") ? nt.default : nt;
}
function _t(nt) {
  throw new Error('Could not dynamically require "' + nt + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Ft = { exports: {} }, fr;
function dn() {
  return fr || (fr = 1, (function(nt, yn) {
    (function(P) {
      nt.exports = P();
    })(function() {
      return (function P(se, R, M) {
        function E(p, u) {
          if (!R[p]) {
            if (!se[p]) {
              var i = typeof _t == "function" && _t;
              if (!u && i) return i(p, !0);
              if (a) return a(p, !0);
              var e = new Error("Cannot find module '" + p + "'");
              throw e.code = "MODULE_NOT_FOUND", e;
            }
            var s = R[p] = { exports: {} };
            se[p][0].call(s.exports, function(d) {
              var v = se[p][1][d];
              return E(v || d);
            }, s, s.exports, P, se, R, M);
          }
          return R[p].exports;
        }
        for (var a = typeof _t == "function" && _t, g = 0; g < M.length; g++) E(M[g]);
        return E;
      })({ 1: [function(P, se, R) {
        var M = P("../../lib/promises");
        R.Files = E;
        function E() {
          function a(g) {
            return M.reject(new Error("could not open external image: '" + g + `'
cannot open linked files from a web browser`));
          }
          return {
            read: a
          };
        }
      }, { "../../lib/promises": 23 }], 2: [function(P, se, R) {
        var M = P("../lib/promises"), E = P("../lib/zipfile");
        R.openZip = a;
        function a(g) {
          return g.arrayBuffer ? M.resolve(E.openArrayBuffer(g.arrayBuffer)) : M.reject(new Error("Could not find file in options"));
        }
      }, { "../lib/promises": 23, "../lib/zipfile": 40 }], 3: [function(P, se, R) {
        var M = P("underscore"), E = P("./promises"), a = P("./documents"), g = P("./styles/html-paths"), p = P("./results"), u = P("./images"), i = P("./html"), e = P("./writers");
        R.DocumentConverter = s;
        function s(n) {
          return {
            convertToHtml: function(r) {
              var m = M.indexBy(
                r.type === a.types.document ? r.comments : [],
                "commentId"
              ), T = new d(n, m);
              return T.convertToHtml(r);
            }
          };
        }
        function d(n, r) {
          var m = 1, T = [], z = [];
          n = M.extend({ ignoreEmptyParagraphs: !0 }, n);
          var I = n.idPrefix === void 0 ? "" : n.idPrefix, A = n.ignoreEmptyParagraphs, O = g.topLevelElement("p"), B = n.styleMap || [];
          function k(f) {
            var $ = [], V = ee(f, $, /* @__PURE__ */ Object.create(null)), X = [];
            _(V, function(t) {
              t.type === "deferred" && X.push(t);
            });
            var l = /* @__PURE__ */ Object.create(null);
            return E.forEachSeries(X, function(t) {
              return t.value().then(function(o) {
                l[t.id] = o;
              });
            }).then(function() {
              function t(D) {
                return h(D, function(C) {
                  return C.type === "deferred" ? l[C.id] : C.children ? [
                    M.extend({}, C, {
                      children: t(C.children)
                    })
                  ] : [C];
                });
              }
              var o = e.writer({
                prettyPrint: n.prettyPrint,
                outputFormat: n.outputFormat
              });
              return i.write(o, i.simplify(t(V))), new p.Result(o.asString(), $);
            });
          }
          function W(f, $, V) {
            return h(f, function(X) {
              return ee(X, $, V);
            });
          }
          function ee(f, $, V) {
            if (!V)
              throw new Error("context not set");
            var X = Be[f.type];
            return X ? X(f, $, V) : [];
          }
          function F(f, $, V) {
            return Y(f, $).wrap(function() {
              var X = W(f.children, $, V);
              return A ? X : [i.forceWrite].concat(X);
            });
          }
          function Y(f, $) {
            var V = ne(f);
            return V ? V.to : (f.styleId && $.push(y("paragraph", f)), O);
          }
          function x(f, $, V) {
            var X = function() {
              return W(f.children, $, V);
            }, l = [];
            if (f.highlight !== null) {
              var t = pe({ type: "highlight", color: f.highlight });
              t && l.push(t);
            }
            f.isSmallCaps && l.push(K("smallCaps")), f.isAllCaps && l.push(K("allCaps")), f.isStrikethrough && l.push(K("strikethrough", "s")), f.isUnderline && l.push(K("underline")), f.verticalAlignment === a.verticalAlignment.subscript && l.push(g.element("sub", {}, { fresh: !1 })), f.verticalAlignment === a.verticalAlignment.superscript && l.push(g.element("sup", {}, { fresh: !1 })), f.isItalic && l.push(K("italic", "em")), f.isBold && l.push(K("bold", "strong"));
            var o = g.empty, D = ne(f);
            return D ? o = D.to : f.styleId && $.push(y("run", f)), l.push(o), l.forEach(function(C) {
              X = C.wrap.bind(C, X);
            }), X();
          }
          function K(f, $) {
            var V = pe({ type: f });
            return V || ($ ? g.element($, {}, { fresh: !1 }) : g.empty);
          }
          function pe(f, $) {
            var V = ne(f);
            return V ? V.to : $;
          }
          function ne(f) {
            for (var $ = 0; $ < B.length; $++)
              if (B[$].from.matches(f))
                return B[$];
          }
          function ce(f) {
            return function($, V) {
              return E.try(function() {
                return f($, V);
              }).catch(function(X) {
                return V.push(p.error(X)), [];
              });
            };
          }
          function ie(f) {
            return j(f.noteType, f.noteId);
          }
          function ye(f) {
            return Q(f.noteType, f.noteId);
          }
          function j(f, $) {
            return we(f + "-" + $);
          }
          function Q(f, $) {
            return we(f + "-ref-" + $);
          }
          function we(f) {
            return I + f;
          }
          var he = g.elements([
            g.element("table", {}, { fresh: !0 })
          ]);
          function le(f, $, V) {
            return pe(f, he).wrap(function() {
              return Re(f, $, V);
            });
          }
          function Re(f, $, V) {
            var X = M.findIndex(f.children, function(D) {
              return !D.type === a.types.tableRow || !D.isHeader;
            });
            X === -1 && (X = f.children.length);
            var l;
            if (X === 0)
              l = W(
                f.children,
                $,
                M.extend({}, V, { isTableHeader: !1 })
              );
            else {
              var t = W(
                f.children.slice(0, X),
                $,
                M.extend({}, V, { isTableHeader: !0 })
              ), o = W(
                f.children.slice(X),
                $,
                M.extend({}, V, { isTableHeader: !1 })
              );
              l = [
                i.freshElement("thead", {}, t),
                i.freshElement("tbody", {}, o)
              ];
            }
            return [i.forceWrite].concat(l);
          }
          function Ce(f, $, V) {
            var X = W(f.children, $, V);
            return [
              i.freshElement("tr", {}, [i.forceWrite].concat(X))
            ];
          }
          function be(f, $, V) {
            var X = V.isTableHeader ? "th" : "td", l = W(f.children, $, V), t = {};
            return f.colSpan !== 1 && (t.colspan = f.colSpan.toString()), f.rowSpan !== 1 && (t.rowspan = f.rowSpan.toString()), [
              i.freshElement(X, t, [i.forceWrite].concat(l))
            ];
          }
          function Te(f, $, V) {
            return pe(f, g.ignore).wrap(function() {
              var X = r[f.commentId], l = z.length + 1, t = "[" + c(X) + l + "]";
              return z.push({ label: t, comment: X }), [
                i.freshElement("a", {
                  href: "#" + j("comment", f.commentId),
                  id: Q("comment", f.commentId)
                }, [i.text(t)])
              ];
            });
          }
          function Ie(f, $, V) {
            var X = f.label, l = f.comment, t = W(l.body, $, V).concat([
              i.nonFreshElement("p", {}, [
                i.text(" "),
                i.freshElement("a", { href: "#" + Q("comment", l.commentId) }, [
                  i.text("↑")
                ])
              ])
            ]);
            return [
              i.freshElement(
                "dt",
                { id: j("comment", l.commentId) },
                [i.text("Comment " + X)]
              ),
              i.freshElement("dd", {}, t)
            ];
          }
          function De(f, $, V) {
            return Le(f).wrap(function() {
              return [];
            });
          }
          function Le(f) {
            var $ = ne(f);
            return $ ? $.to : f.breakType === "line" ? g.topLevelElement("br") : g.empty;
          }
          var Be = {
            document: function(f, $, V) {
              var X = W(f.children, $, V), l = T.map(function(o) {
                return f.notes.resolve(o);
              }), t = W(l, $, V);
              return X.concat([
                i.freshElement("ol", {}, t),
                i.freshElement("dl", {}, h(z, function(o) {
                  return Ie(o, $, V);
                }))
              ]);
            },
            paragraph: F,
            run: x,
            text: function(f, $, V) {
              return [i.text(f.value)];
            },
            tab: function(f, $, V) {
              return [i.text("	")];
            },
            hyperlink: function(f, $, V) {
              var X = f.anchor ? "#" + we(f.anchor) : f.href, l = { href: X };
              f.targetFrame != null && (l.target = f.targetFrame);
              var t = W(f.children, $, V);
              return [i.nonFreshElement("a", l, t)];
            },
            checkbox: function(f) {
              var $ = { type: "checkbox" };
              return f.checked && ($.checked = "checked"), [i.freshElement("input", $)];
            },
            bookmarkStart: function(f, $, V) {
              var X = i.freshElement("a", {
                id: we(f.name)
              }, [i.forceWrite]);
              return [X];
            },
            noteReference: function(f, $, V) {
              T.push(f);
              var X = i.freshElement("a", {
                href: "#" + ie(f),
                id: ye(f)
              }, [i.text("[" + m++ + "]")]);
              return [i.freshElement("sup", {}, [X])];
            },
            note: function(f, $, V) {
              var X = W(f.body, $, V), l = i.elementWithTag(g.element("p", {}, { fresh: !1 }), [
                i.text(" "),
                i.freshElement("a", { href: "#" + ye(f) }, [i.text("↑")])
              ]), t = X.concat([l]);
              return i.freshElement("li", { id: ie(f) }, t);
            },
            commentReference: Te,
            comment: Ie,
            image: w(ce(n.convertImage || u.dataUri)),
            table: le,
            tableRow: Ce,
            tableCell: be,
            break: De
          };
          return {
            convertToHtml: k
          };
        }
        var v = 1;
        function w(n) {
          return function(r, m, T) {
            return [
              {
                type: "deferred",
                id: v++,
                value: function() {
                  return n(r, m, T);
                }
              }
            ];
          };
        }
        function y(n, r) {
          return p.warning(
            "Unrecognised " + n + " style: '" + r.styleName + "' (Style ID: " + r.styleId + ")"
          );
        }
        function h(n, r) {
          return M.flatten(n.map(r), !0);
        }
        function _(n, r) {
          n.forEach(function(m) {
            r(m), m.children && _(m.children, r);
          });
        }
        var c = R.commentAuthorLabel = function(r) {
          return r.authorInitials || "";
        };
      }, { "./documents": 4, "./html": 18, "./images": 20, "./promises": 23, "./results": 25, "./styles/html-paths": 28, "./writers": 33, underscore: 67 }], 4: [function(P, se, R) {
        (function(M) {
          var E = P("underscore"), a = R.types = {
            document: "document",
            paragraph: "paragraph",
            run: "run",
            text: "text",
            tab: "tab",
            checkbox: "checkbox",
            hyperlink: "hyperlink",
            noteReference: "noteReference",
            image: "image",
            note: "note",
            commentReference: "commentReference",
            comment: "comment",
            table: "table",
            tableRow: "tableRow",
            tableCell: "tableCell",
            break: "break",
            bookmarkStart: "bookmarkStart"
          };
          function g(O, B) {
            return B = B || {}, {
              type: a.document,
              children: O,
              notes: B.notes || new y({}),
              comments: B.comments || []
            };
          }
          function p(O, B) {
            B = B || {};
            var k = B.indent || {};
            return {
              type: a.paragraph,
              children: O,
              styleId: B.styleId || null,
              styleName: B.styleName || null,
              numbering: B.numbering || null,
              alignment: B.alignment || null,
              indent: {
                start: k.start || null,
                end: k.end || null,
                firstLine: k.firstLine || null,
                hanging: k.hanging || null
              }
            };
          }
          function u(O, B) {
            return B = B || {}, {
              type: a.run,
              children: O,
              styleId: B.styleId || null,
              styleName: B.styleName || null,
              isBold: !!B.isBold,
              isUnderline: !!B.isUnderline,
              isItalic: !!B.isItalic,
              isStrikethrough: !!B.isStrikethrough,
              isAllCaps: !!B.isAllCaps,
              isSmallCaps: !!B.isSmallCaps,
              verticalAlignment: B.verticalAlignment || i.baseline,
              font: B.font || null,
              fontSize: B.fontSize || null,
              highlight: B.highlight || null
            };
          }
          var i = {
            baseline: "baseline",
            superscript: "superscript",
            subscript: "subscript"
          };
          function e(O) {
            return {
              type: a.text,
              value: O
            };
          }
          function s() {
            return {
              type: a.tab
            };
          }
          function d(O) {
            return {
              type: a.checkbox,
              checked: O.checked
            };
          }
          function v(O, B) {
            return {
              type: a.hyperlink,
              children: O,
              href: B.href,
              anchor: B.anchor,
              targetFrame: B.targetFrame
            };
          }
          function w(O) {
            return {
              type: a.noteReference,
              noteType: O.noteType,
              noteId: O.noteId
            };
          }
          function y(O) {
            this._notes = E.indexBy(O, function(B) {
              return n(B.noteType, B.noteId);
            });
          }
          y.prototype.resolve = function(O) {
            return this.findNoteByKey(n(O.noteType, O.noteId));
          }, y.prototype.findNoteByKey = function(O) {
            return this._notes[O] || null;
          };
          function h(O) {
            return {
              type: a.note,
              noteType: O.noteType,
              noteId: O.noteId,
              body: O.body
            };
          }
          function _(O) {
            return {
              type: a.commentReference,
              commentId: O.commentId
            };
          }
          function c(O) {
            return {
              type: a.comment,
              commentId: O.commentId,
              body: O.body,
              authorName: O.authorName,
              authorInitials: O.authorInitials
            };
          }
          function n(O, B) {
            return O + "-" + B;
          }
          function r(O) {
            return {
              type: a.image,
              // `read` is retained for backwards compatibility, but other read
              // methods should be preferred.
              read: function(B) {
                return B ? O.readImage(B) : O.readImage().then(function(k) {
                  return M.from(k);
                });
              },
              readAsArrayBuffer: function() {
                return O.readImage();
              },
              readAsBase64String: function() {
                return O.readImage("base64");
              },
              readAsBuffer: function() {
                return O.readImage().then(function(B) {
                  return M.from(B);
                });
              },
              altText: O.altText,
              contentType: O.contentType
            };
          }
          function m(O, B) {
            return B = B || {}, {
              type: a.table,
              children: O,
              styleId: B.styleId || null,
              styleName: B.styleName || null
            };
          }
          function T(O, B) {
            return B = B || {}, {
              type: a.tableRow,
              children: O,
              isHeader: B.isHeader || !1
            };
          }
          function z(O, B) {
            return B = B || {}, {
              type: a.tableCell,
              children: O,
              colSpan: B.colSpan == null ? 1 : B.colSpan,
              rowSpan: B.rowSpan == null ? 1 : B.rowSpan
            };
          }
          function I(O) {
            return {
              type: a.break,
              breakType: O
            };
          }
          function A(O) {
            return {
              type: a.bookmarkStart,
              name: O.name
            };
          }
          R.document = R.Document = g, R.paragraph = R.Paragraph = p, R.run = R.Run = u, R.text = R.Text = e, R.tab = R.Tab = s, R.checkbox = R.Checkbox = d, R.Hyperlink = v, R.noteReference = R.NoteReference = w, R.Notes = y, R.Note = h, R.commentReference = _, R.comment = c, R.Image = r, R.Table = m, R.TableRow = T, R.TableCell = z, R.lineBreak = I("line"), R.pageBreak = I("page"), R.columnBreak = I("column"), R.BookmarkStart = A, R.verticalAlignment = i;
        }).call(this, P("buffer").Buffer);
      }, { buffer: 48, underscore: 67 }], 5: [function(P, se, R) {
        R.createBodyReader = s, R._readNumberingProperties = v;
        var M = P("dingbat-to-unicode"), E = P("underscore"), a = P("../documents"), g = P("../results").Result, p = P("../results").warning, u = P("../xml"), i = P("../transforms"), e = P("./uris");
        function s(I) {
          return {
            readXmlElement: function(A) {
              return new d(I).readXmlElement(A);
            },
            readXmlElements: function(A) {
              return new d(I).readXmlElements(A);
            }
          };
        }
        function d(I) {
          var A = [], O = [], B = [], k = I.relationships, W = I.contentTypes, ee = I.docxFile, F = I.files, Y = I.numbering, x = I.styles;
          function K(re) {
            var fe = re.map(pe);
            return m(fe);
          }
          function pe(re) {
            if (re.type === "element") {
              var fe = X[re.name];
              if (fe)
                return fe(re);
              if (!Object.prototype.hasOwnProperty.call(y, re.name)) {
                var _e = p("An unrecognised element was ignored: " + re.name);
                return h([_e]);
              }
            }
            return _();
          }
          function ne(re) {
            return he(re).map(function(fe) {
              return {
                type: "paragraphProperties",
                styleId: fe.styleId,
                styleName: fe.name,
                alignment: re.firstOrEmpty("w:jc").attributes["w:val"],
                numbering: v(fe.styleId, re.firstOrEmpty("w:numPr"), Y),
                indent: ce(re.firstOrEmpty("w:ind"))
              };
            });
          }
          function ce(re) {
            return {
              start: re.attributes["w:start"] || re.attributes["w:left"],
              end: re.attributes["w:end"] || re.attributes["w:right"],
              firstLine: re.attributes["w:firstLine"],
              hanging: re.attributes["w:hanging"]
            };
          }
          function ie(re) {
            return le(re).map(function(fe) {
              var _e = re.firstOrEmpty("w:sz").attributes["w:val"], Ee = /^[0-9]+$/.test(_e) ? parseInt(_e, 10) / 2 : null;
              return {
                type: "runProperties",
                styleId: fe.styleId,
                styleName: fe.name,
                verticalAlignment: re.firstOrEmpty("w:vertAlign").attributes["w:val"],
                font: re.firstOrEmpty("w:rFonts").attributes["w:ascii"],
                fontSize: Ee,
                isBold: j(re.first("w:b")),
                isUnderline: ye(re.first("w:u")),
                isItalic: j(re.first("w:i")),
                isStrikethrough: j(re.first("w:strike")),
                isAllCaps: j(re.first("w:caps")),
                isSmallCaps: j(re.first("w:smallCaps")),
                highlight: we(re.firstOrEmpty("w:highlight").attributes["w:val"])
              };
            });
          }
          function ye(re) {
            if (re) {
              var fe = re.attributes["w:val"];
              return fe !== void 0 && fe !== "false" && fe !== "0" && fe !== "none";
            } else
              return !1;
          }
          function j(re) {
            if (re) {
              var fe = re.attributes["w:val"];
              return fe !== "false" && fe !== "0";
            } else
              return !1;
          }
          function Q(re) {
            return re !== "false" && re !== "0";
          }
          function we(re) {
            return !re || re === "none" ? null : re;
          }
          function he(re) {
            return Ce(re, "w:pStyle", "Paragraph", x.findParagraphStyleById);
          }
          function le(re) {
            return Ce(re, "w:rStyle", "Run", x.findCharacterStyleById);
          }
          function Re(re) {
            return Ce(re, "w:tblStyle", "Table", x.findTableStyleById);
          }
          function Ce(re, fe, _e, Ee) {
            var Se = [], Me = re.first(fe), Fe = null, Ue = null;
            if (Me && (Fe = Me.attributes["w:val"], Fe)) {
              var N = Ee(Fe);
              N ? Ue = N.name : Se.push(He(_e, Fe));
            }
            return n({ styleId: Fe, name: Ue }, Se);
          }
          function be(re) {
            var fe = re.attributes["w:fldCharType"];
            if (fe === "begin")
              A.push({ type: "begin", fldChar: re }), O = [];
            else if (fe === "end") {
              if (A.length === 0)
                return h([p(
                  "Ignoring complex field end character without corresponding start character"
                )]);
              var _e = A.pop();
              if (_e.type === "begin" && (_e = Ie(_e)), _e.type === "checkbox")
                return c(a.checkbox({
                  checked: _e.checked
                }));
            } else if (fe === "separate") {
              if (A.length === 0)
                return h([p(
                  "Ignoring complex field separator character without corresponding start character"
                )]);
              var Ee = A.pop(), Se = Ie(Ee);
              A.push(Se);
            }
            return _();
          }
          function Te() {
            var re = E.last(A.filter(function(fe) {
              return fe.type === "hyperlink";
            }));
            return re ? re.options : null;
          }
          function Ie(re) {
            return De(
              O.join(""),
              re.type === "begin" ? re.fldChar : u.emptyElement
            );
          }
          function De(re, fe) {
            var _e = /^\s*HYPERLINK\s+(\\l\s+)?(?:"(.*)"|([^\\]\S*))/.exec(re);
            if (_e) {
              var Ee = _e[2] === void 0 ? _e[3] : _e[2], Se = _e[1] === void 0 ? { href: Ee } : { anchor: Ee };
              return { type: "hyperlink", options: Se };
            }
            var Me = /\s*FORMCHECKBOX\s*/.exec(re);
            if (Me) {
              var Fe = fe.firstOrEmpty("w:ffData").firstOrEmpty("w:checkBox"), Ue = Fe.first("w:checked"), N = Ue == null ? j(Fe.first("w:default")) : j(Ue);
              return { type: "checkbox", checked: N };
            }
            return { type: "unknown" };
          }
          function Le(re) {
            return O.push(re.text()), _();
          }
          function Be(re) {
            var fe = re.attributes["w:font"], _e = re.attributes["w:char"], Ee = M.hex(fe, _e);
            return Ee == null && /^F0..$/.test(_e) && (Ee = M.hex(fe, _e.substring(2))), Ee == null ? h([p(
              "A w:sym element with an unsupported character was ignored: char " + _e + " in font " + fe
            )]) : c(new a.Text(Ee.string));
          }
          function f(re) {
            return function(fe) {
              var _e = fe.attributes["w:id"];
              return c(new a.NoteReference({
                noteType: re,
                noteId: _e
              }));
            };
          }
          function $(re) {
            return c(a.commentReference({
              commentId: re.attributes["w:id"]
            }));
          }
          function V(re) {
            return K(re.children);
          }
          var X = {
            "w:p": function(re) {
              var fe = re.firstOrEmpty("w:pPr"), _e = !!fe.firstOrEmpty("w:rPr").first("w:del");
              if (_e)
                return re.children.forEach(function(Se) {
                  B.push(Se);
                }), _();
              var Ee = re.children;
              return B.length > 0 && (Ee = B.concat(Ee), B = []), r.map(
                ne(fe),
                K(Ee),
                function(Se, Me) {
                  return new a.Paragraph(Me, Se);
                }
              ).insertExtra();
            },
            "w:r": function(re) {
              return r.map(
                ie(re.firstOrEmpty("w:rPr")),
                K(re.children),
                function(fe, _e) {
                  var Ee = Te();
                  return Ee !== null && (_e = [new a.Hyperlink(_e, Ee)]), new a.Run(_e, fe);
                }
              );
            },
            "w:fldChar": be,
            "w:instrText": Le,
            "w:t": function(re) {
              return c(new a.Text(re.text()));
            },
            "w:tab": function(re) {
              return c(new a.Tab());
            },
            "w:noBreakHyphen": function() {
              return c(new a.Text("‑"));
            },
            "w:softHyphen": function(re) {
              return c(new a.Text("­"));
            },
            "w:sym": Be,
            "w:hyperlink": function(re) {
              var fe = re.attributes["r:id"], _e = re.attributes["w:anchor"];
              return K(re.children).map(function(Ee) {
                function Se(Fe) {
                  var Ue = re.attributes["w:tgtFrame"] || null;
                  return new a.Hyperlink(
                    Ee,
                    E.extend({ targetFrame: Ue }, Fe)
                  );
                }
                if (fe) {
                  var Me = k.findTargetByRelationshipId(fe);
                  return _e && (Me = e.replaceFragment(Me, _e)), Se({ href: Me });
                } else return _e ? Se({ anchor: _e }) : Ee;
              });
            },
            "w:tbl": l,
            "w:tr": o,
            "w:tc": D,
            "w:footnoteReference": f("footnote"),
            "w:endnoteReference": f("endnote"),
            "w:commentReference": $,
            "w:br": function(re) {
              var fe = re.attributes["w:type"];
              return fe == null || fe === "textWrapping" ? c(a.lineBreak) : fe === "page" ? c(a.pageBreak) : fe === "column" ? c(a.columnBreak) : h([p("Unsupported break type: " + fe)]);
            },
            "w:bookmarkStart": function(re) {
              var fe = re.attributes["w:name"];
              return fe === "_GoBack" ? _() : c(new a.BookmarkStart({ name: fe }));
            },
            "mc:AlternateContent": function(re) {
              return V(re.firstOrEmpty("mc:Fallback"));
            },
            "w:sdt": function(re) {
              var fe = K(re.firstOrEmpty("w:sdtContent").children);
              return fe.map(function(_e) {
                var Ee = re.firstOrEmpty("w:sdtPr").first("wordml:checkbox");
                if (Ee) {
                  var Se = Ee.first("wordml:checked"), Me = !!Se && Q(
                    Se.attributes["wordml:val"]
                  ), Fe = a.checkbox({
                    checked: Me
                  }), Ue = !1, N = _e.map(i._elementsOfType(
                    a.types.text,
                    function(L) {
                      return L.value.length > 0 && !Ue ? (Ue = !0, Fe) : L;
                    }
                  ));
                  return Ue ? N : Fe;
                } else
                  return _e;
              });
            },
            "w:customXml": V,
            "w:ins": V,
            "w:moveFromRangeEnd": V,
            "w:moveFromRangeStart": V,
            "w:moveTo": V,
            "w:moveToRangeEnd": V,
            "w:moveToRangeStart": V,
            "w:object": V,
            "w:smartTag": V,
            "w:drawing": V,
            "w:pict": function(re) {
              return V(re).toExtra();
            },
            "v:roundrect": V,
            "v:shape": V,
            "v:textbox": V,
            "w:txbxContent": V,
            "wp:inline": ae,
            "wp:anchor": ae,
            "v:imagedata": Ae,
            "v:group": V,
            "v:rect": V
          };
          return {
            readXmlElement: pe,
            readXmlElements: K
          };
          function l(re) {
            var fe = t(re.firstOrEmpty("w:tblPr"));
            return K(re.children).flatMap(G).flatMap(function(_e) {
              return fe.map(function(Ee) {
                return a.Table(_e, Ee);
              });
            });
          }
          function t(re) {
            return Re(re).map(function(fe) {
              return {
                styleId: fe.styleId,
                styleName: fe.name
              };
            });
          }
          function o(re) {
            var fe = re.firstOrEmpty("w:trPr"), _e = !!fe.first("w:del");
            if (_e)
              return _();
            var Ee = !!fe.first("w:tblHeader");
            return K(re.children).map(function(Se) {
              return a.TableRow(Se, { isHeader: Ee });
            });
          }
          function D(re) {
            return K(re.children).map(function(fe) {
              var _e = re.firstOrEmpty("w:tcPr"), Ee = _e.firstOrEmpty("w:gridSpan").attributes["w:val"], Se = Ee ? parseInt(Ee, 10) : 1, Me = a.TableCell(fe, { colSpan: Se });
              return Me._vMerge = C(_e), Me;
            });
          }
          function C(re) {
            var fe = re.first("w:vMerge");
            if (fe) {
              var _e = fe.attributes["w:val"];
              return _e === "continue" || !_e;
            } else
              return null;
          }
          function G(re) {
            var fe = E.any(re, function(Se) {
              return Se.type !== a.types.tableRow;
            });
            if (fe)
              return te(re), n(re, [p(
                "unexpected non-row element in table, cell merging may be incorrect"
              )]);
            var _e = E.any(re, function(Se) {
              return E.any(Se.children, function(Me) {
                return Me.type !== a.types.tableCell;
              });
            });
            if (_e)
              return te(re), n(re, [p(
                "unexpected non-cell element in table row, cell merging may be incorrect"
              )]);
            var Ee = {};
            return re.forEach(function(Se) {
              var Me = 0;
              Se.children.forEach(function(Fe) {
                Fe._vMerge && Ee[Me] ? Ee[Me].rowSpan++ : (Ee[Me] = Fe, Fe._vMerge = !1), Me += Fe.colSpan;
              });
            }), re.forEach(function(Se) {
              Se.children = Se.children.filter(function(Me) {
                return !Me._vMerge;
              }), Se.children.forEach(function(Me) {
                delete Me._vMerge;
              });
            }), c(re);
          }
          function te(re) {
            re.forEach(function(fe) {
              var _e = i.getDescendantsOfType(fe, a.types.tableCell);
              _e.forEach(function(Ee) {
                delete Ee._vMerge;
              });
            });
          }
          function ae(re) {
            var fe = re.getElementsByTagName("a:graphic").getElementsByTagName("a:graphicData").getElementsByTagName("pic:pic").getElementsByTagName("pic:blipFill").getElementsByTagName("a:blip");
            return m(fe.map(de.bind(null, re)));
          }
          function de(re, fe) {
            var _e = re.firstOrEmpty("wp:docPr"), Ee = _e.attributes, Se = xe(Ee.descr) ? Ee.title : Ee.descr, Me = me(fe);
            return Me === null ? h([p("Could not find image file for a:blip element")]) : Xe(Me, Se).map(function(Fe) {
              var Ue = _e.firstOrEmpty("a:hlinkClick"), N = Ue.attributes["r:id"];
              if (N) {
                var L = k.findTargetByRelationshipId(N);
                return new a.Hyperlink([Fe], { href: L });
              } else
                return Fe;
            });
          }
          function xe(re) {
            return re == null || /^\s*$/.test(re);
          }
          function me(re) {
            var fe = re.attributes["r:embed"], _e = re.attributes["r:link"];
            if (fe)
              return ze(fe);
            if (_e) {
              var Ee = k.findTargetByRelationshipId(_e);
              return {
                path: Ee,
                read: F.read.bind(F, Ee)
              };
            } else
              return null;
          }
          function Ae(re) {
            var fe = re.attributes["r:id"];
            return fe ? Xe(
              ze(fe),
              re.attributes["o:title"]
            ) : h([p("A v:imagedata element without a relationship ID was ignored")]);
          }
          function ze(re) {
            var fe = e.uriToZipEntryName("word", k.findTargetByRelationshipId(re));
            return {
              path: fe,
              read: ee.read.bind(ee, fe)
            };
          }
          function Xe(re, fe) {
            var _e = W.findContentType(re.path), Ee = a.Image({
              readImage: re.read,
              altText: fe,
              contentType: _e
            }), Se = w[_e] ? [] : p("Image of type " + _e + " is unlikely to display in web browsers");
            return n(Ee, Se);
          }
          function He(re, fe) {
            return p(
              re + " style with ID " + fe + " was referenced but not defined in the document"
            );
          }
        }
        function v(I, A, O) {
          var B = A.firstOrEmpty("w:ilvl").attributes["w:val"], k = A.firstOrEmpty("w:numId").attributes["w:val"];
          if (B !== void 0 && k !== void 0)
            return O.findLevel(k, B);
          if (I != null) {
            var W = O.findLevelByParagraphStyleId(I);
            if (W != null)
              return W;
          }
          return k !== void 0 ? O.findLevel(k, "0") : null;
        }
        var w = {
          "image/png": !0,
          "image/gif": !0,
          "image/jpeg": !0,
          "image/svg+xml": !0,
          "image/tiff": !0
        }, y = {
          "office-word:wrap": !0,
          "v:shadow": !0,
          "v:shapetype": !0,
          "w:annotationRef": !0,
          "w:bookmarkEnd": !0,
          "w:sectPr": !0,
          "w:proofErr": !0,
          "w:lastRenderedPageBreak": !0,
          "w:commentRangeStart": !0,
          "w:commentRangeEnd": !0,
          "w:del": !0,
          "w:footnoteRef": !0,
          "w:endnoteRef": !0,
          "w:moveFrom": !0,
          "w:pPr": !0,
          "w:rPr": !0,
          "w:tblPr": !0,
          "w:tblGrid": !0,
          "w:trPr": !0,
          "w:tcPr": !0
        };
        function h(I) {
          return new r(null, null, I);
        }
        function _() {
          return new r(null);
        }
        function c(I) {
          return new r(I);
        }
        function n(I, A) {
          return new r(I, null, A);
        }
        function r(I, A, O) {
          this.value = I || [], this.extra = A || [], this._result = new g({
            element: this.value,
            extra: A
          }, O), this.messages = this._result.messages;
        }
        r.prototype.toExtra = function() {
          return new r(null, T(this.extra, this.value), this.messages);
        }, r.prototype.insertExtra = function() {
          var I = this.extra;
          return I && I.length ? new r(T(this.value, I), null, this.messages) : this;
        }, r.prototype.map = function(I) {
          var A = this._result.map(function(O) {
            return I(O.element);
          });
          return new r(A.value, this.extra, A.messages);
        }, r.prototype.flatMap = function(I) {
          var A = this._result.flatMap(function(O) {
            return I(O.element)._result;
          });
          return new r(A.value.element, T(this.extra, A.value.extra), A.messages);
        }, r.map = function(I, A, O) {
          return new r(
            O(I.value, A.value),
            T(I.extra, A.extra),
            I.messages.concat(A.messages)
          );
        };
        function m(I) {
          var A = g.combine(E.pluck(I, "_result"));
          return new r(
            E.flatten(E.pluck(A.value, "element")),
            E.filter(E.flatten(E.pluck(A.value, "extra")), z),
            A.messages
          );
        }
        function T(I, A) {
          return E.flatten([I, A]);
        }
        function z(I) {
          return I;
        }
      }, { "../documents": 4, "../results": 25, "../transforms": 30, "../xml": 35, "./uris": 16, "dingbat-to-unicode": 50, underscore: 67 }], 6: [function(P, se, R) {
        var M = P("../documents"), E = P("../results").Result;
        function a(g) {
          function p(i) {
            return E.combine(i.getElementsByTagName("w:comment").map(u));
          }
          function u(i) {
            var e = i.attributes["w:id"];
            function s(d) {
              return (i.attributes[d] || "").trim() || null;
            }
            return g.readXmlElements(i.children).map(function(d) {
              return M.comment({
                commentId: e,
                body: d,
                authorName: s("w:author"),
                authorInitials: s("w:initials")
              });
            });
          }
          return p;
        }
        R.createCommentsReader = a;
      }, { "../documents": 4, "../results": 25 }], 7: [function(P, se, R) {
        R.readContentTypesFromXml = E;
        var M = {
          png: "png",
          gif: "gif",
          jpeg: "jpeg",
          jpg: "jpeg",
          tif: "tiff",
          tiff: "tiff",
          bmp: "bmp"
        };
        R.defaultContentTypes = a({}, {});
        function E(g) {
          var p = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
          return g.children.forEach(function(i) {
            if (i.name === "content-types:Default" && (p[i.attributes.Extension] = i.attributes.ContentType), i.name === "content-types:Override") {
              var e = i.attributes.PartName;
              e.charAt(0) === "/" && (e = e.substring(1)), u[e] = i.attributes.ContentType;
            }
          }), a(u, p);
        }
        function a(g, p) {
          return {
            findContentType: function(u) {
              var i = g[u];
              if (i)
                return i;
              var e = u.split("."), s = e[e.length - 1];
              if (Object.prototype.hasOwnProperty.call(p, s))
                return p[s];
              var d = M[s.toLowerCase()];
              return d ? "image/" + d : null;
            }
          };
        }
      }, {}], 8: [function(P, se, R) {
        R.DocumentXmlReader = a;
        var M = P("../documents"), E = P("../results").Result;
        function a(g) {
          var p = g.bodyReader;
          function u(i) {
            var e = i.first("w:body");
            if (e == null)
              throw new Error("Could not find the body element: are you sure this is a docx file?");
            var s = p.readXmlElements(e.children).map(function(d) {
              return new M.Document(d, {
                notes: g.notes,
                comments: g.comments
              });
            });
            return new E(s.value, s.messages);
          }
          return {
            convertXmlToDocument: u
          };
        }
      }, { "../documents": 4, "../results": 25 }], 9: [function(P, se, R) {
        R.read = _, R._findPartPaths = c;
        var M = P("../promises"), E = P("../documents"), a = P("../results").Result, g = P("../zipfile"), p = P("./office-xml-reader").readXmlFromZipFile, u = P("./body-reader").createBodyReader, i = P("./document-xml-reader").DocumentXmlReader, e = P("./relationships-reader"), s = P("./content-types-reader"), d = P("./numbering-xml"), v = P("./styles-reader"), w = P("./notes-reader"), y = P("./comments-reader"), h = P("./files").Files;
        function _(k, W, ee) {
          W = W || {}, ee = ee || {};
          var F = new h({
            externalFileAccess: ee.externalFileAccess,
            relativeToFile: W.path
          });
          return M.props({
            contentTypes: I(k),
            partPaths: c(k),
            docxFile: k,
            files: F
          }).also(function(Y) {
            return {
              styles: O(k, Y.partPaths.styles)
            };
          }).also(function(Y) {
            return {
              numbering: A(k, Y.partPaths.numbering, Y.styles)
            };
          }).also(function(Y) {
            return {
              footnotes: T(Y.partPaths.footnotes, Y, function(x, K) {
                return K ? w.createFootnotesReader(x)(K) : new a([]);
              }),
              endnotes: T(Y.partPaths.endnotes, Y, function(x, K) {
                return K ? w.createEndnotesReader(x)(K) : new a([]);
              }),
              comments: T(Y.partPaths.comments, Y, function(x, K) {
                return K ? y.createCommentsReader(x)(K) : new a([]);
              })
            };
          }).also(function(Y) {
            return {
              notes: Y.footnotes.flatMap(function(x) {
                return Y.endnotes.map(function(K) {
                  return new E.Notes(x.concat(K));
                });
              })
            };
          }).then(function(Y) {
            return T(Y.partPaths.mainDocument, Y, function(x, K) {
              return Y.notes.flatMap(function(pe) {
                return Y.comments.flatMap(function(ne) {
                  var ce = new i({
                    bodyReader: x,
                    notes: pe,
                    comments: ne
                  });
                  return ce.convertXmlToDocument(K);
                });
              });
            });
          });
        }
        function c(k) {
          return B(k).then(function(W) {
            var ee = n({
              docxFile: k,
              relationships: W,
              relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
              basePath: "",
              fallbackPath: "word/document.xml"
            });
            if (!k.exists(ee))
              throw new Error("Could not find main document part. Are you sure this is a valid .docx file?");
            return m({
              filename: z(ee),
              readElement: e.readRelationships,
              defaultValue: e.defaultValue
            })(k).then(function(F) {
              function Y(x) {
                return n({
                  docxFile: k,
                  relationships: F,
                  relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/" + x,
                  basePath: g.splitPath(ee).dirname,
                  fallbackPath: "word/" + x + ".xml"
                });
              }
              return {
                mainDocument: ee,
                comments: Y("comments"),
                endnotes: Y("endnotes"),
                footnotes: Y("footnotes"),
                numbering: Y("numbering"),
                styles: Y("styles")
              };
            });
          });
        }
        function n(k) {
          var W = k.docxFile, ee = k.relationships, F = k.relationshipType, Y = k.basePath, x = k.fallbackPath, K = ee.findTargetsByType(F), pe = K.map(function(ce) {
            return r(g.joinPath(Y, ce), "/");
          }), ne = pe.filter(function(ce) {
            return W.exists(ce);
          });
          return ne.length === 0 ? x : ne[0];
        }
        function r(k, W) {
          return k.substring(0, W.length) === W ? k.substring(W.length) : k;
        }
        function m(k) {
          return function(W) {
            return p(W, k.filename).then(function(ee) {
              return ee ? k.readElement(ee) : k.defaultValue;
            });
          };
        }
        function T(k, W, ee) {
          var F = m({
            filename: z(k),
            readElement: e.readRelationships,
            defaultValue: e.defaultValue
          });
          return F(W.docxFile).then(function(Y) {
            var x = new u({
              relationships: Y,
              contentTypes: W.contentTypes,
              docxFile: W.docxFile,
              numbering: W.numbering,
              styles: W.styles,
              files: W.files
            });
            return p(W.docxFile, k).then(function(K) {
              return ee(x, K);
            });
          });
        }
        function z(k) {
          var W = g.splitPath(k);
          return g.joinPath(W.dirname, "_rels", W.basename + ".rels");
        }
        var I = m({
          filename: "[Content_Types].xml",
          readElement: s.readContentTypesFromXml,
          defaultValue: s.defaultContentTypes
        });
        function A(k, W, ee) {
          return m({
            filename: W,
            readElement: function(F) {
              return d.readNumberingXml(F, { styles: ee });
            },
            defaultValue: d.defaultNumbering
          })(k);
        }
        function O(k, W) {
          return m({
            filename: W,
            readElement: v.readStylesXml,
            defaultValue: v.defaultStyles
          })(k);
        }
        var B = m({
          filename: "_rels/.rels",
          readElement: e.readRelationships,
          defaultValue: e.defaultValue
        });
      }, { "../documents": 4, "../promises": 23, "../results": 25, "../zipfile": 40, "./body-reader": 5, "./comments-reader": 6, "./content-types-reader": 7, "./document-xml-reader": 8, "./files": 1, "./notes-reader": 10, "./numbering-xml": 11, "./office-xml-reader": 12, "./relationships-reader": 13, "./styles-reader": 15 }], 10: [function(P, se, R) {
        var M = P("../documents"), E = P("../results").Result;
        R.createFootnotesReader = a.bind(this, "footnote"), R.createEndnotesReader = a.bind(this, "endnote");
        function a(g, p) {
          function u(s) {
            return E.combine(s.getElementsByTagName("w:" + g).filter(i).map(e));
          }
          function i(s) {
            var d = s.attributes["w:type"];
            return d !== "continuationSeparator" && d !== "separator";
          }
          function e(s) {
            var d = s.attributes["w:id"];
            return p.readXmlElements(s.children).map(function(v) {
              return M.Note({ noteType: g, noteId: d, body: v });
            });
          }
          return u;
        }
      }, { "../documents": 4, "../results": 25 }], 11: [function(P, se, R) {
        var M = P("underscore");
        R.readNumberingXml = a, R.Numbering = E, R.defaultNumbering = new E({}, {});
        function E(i, e, s) {
          var d = M.flatten(M.values(e).map(function(_) {
            return M.values(_.levels);
          })), v = M.indexBy(
            d.filter(function(_) {
              return _.paragraphStyleId != null;
            }),
            "paragraphStyleId"
          );
          function w(_, c) {
            return y(_, c, /* @__PURE__ */ Object.create(null));
          }
          function y(_, c, n) {
            if (n[_])
              return null;
            n[_] = !0;
            var r = i[_];
            if (!r)
              return null;
            var m = e[r.abstractNumId];
            if (m) {
              if (m.numStyleLink == null)
                return e[r.abstractNumId].levels[c];
              var T = s.findNumberingStyleById(m.numStyleLink);
              return y(T.numId, c, n);
            } else return null;
          }
          function h(_) {
            return v[_] || null;
          }
          return {
            findLevel: w,
            findLevelByParagraphStyleId: h
          };
        }
        function a(i, e) {
          if (!e || !e.styles)
            throw new Error("styles is missing");
          var s = g(i), d = u(i);
          return new E(d, s, e.styles);
        }
        function g(i) {
          var e = /* @__PURE__ */ Object.create(null);
          return i.getElementsByTagName("w:abstractNum").forEach(function(s) {
            var d = s.attributes["w:abstractNumId"];
            e[d] = p(s);
          }), e;
        }
        function p(i) {
          var e = /* @__PURE__ */ Object.create(null), s = null;
          i.getElementsByTagName("w:lvl").forEach(function(v) {
            var w = v.attributes["w:ilvl"], y = v.firstOrEmpty("w:numFmt").attributes["w:val"], h = y !== "bullet", _ = v.firstOrEmpty("w:pStyle").attributes["w:val"];
            w === void 0 ? s = {
              isOrdered: h,
              level: "0",
              paragraphStyleId: _
            } : e[w] = {
              isOrdered: h,
              level: w,
              paragraphStyleId: _
            };
          }), s !== null && e[s.level] === void 0 && (e[s.level] = s);
          var d = i.firstOrEmpty("w:numStyleLink").attributes["w:val"];
          return { levels: e, numStyleLink: d };
        }
        function u(i) {
          var e = /* @__PURE__ */ Object.create(null);
          return i.getElementsByTagName("w:num").forEach(function(s) {
            var d = s.attributes["w:numId"], v = s.first("w:abstractNumId").attributes["w:val"];
            e[d] = { abstractNumId: v };
          }), e;
        }
      }, { underscore: 67 }], 12: [function(P, se, R) {
        var M = P("underscore"), E = P("../promises"), a = P("../xml");
        R.read = p, R.readXmlFromZipFile = u;
        var g = {
          // Transitional format
          "http://schemas.openxmlformats.org/wordprocessingml/2006/main": "w",
          "http://schemas.openxmlformats.org/officeDocument/2006/relationships": "r",
          "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing": "wp",
          "http://schemas.openxmlformats.org/drawingml/2006/main": "a",
          "http://schemas.openxmlformats.org/drawingml/2006/picture": "pic",
          // Strict format
          "http://purl.oclc.org/ooxml/wordprocessingml/main": "w",
          "http://purl.oclc.org/ooxml/officeDocument/relationships": "r",
          "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing": "wp",
          "http://purl.oclc.org/ooxml/drawingml/main": "a",
          "http://purl.oclc.org/ooxml/drawingml/picture": "pic",
          // Common
          "http://schemas.openxmlformats.org/package/2006/content-types": "content-types",
          "http://schemas.openxmlformats.org/package/2006/relationships": "relationships",
          "http://schemas.openxmlformats.org/markup-compatibility/2006": "mc",
          "urn:schemas-microsoft-com:vml": "v",
          "urn:schemas-microsoft-com:office:word": "office-word",
          // [MS-DOCX]: Word Extensions to the Office Open XML (.docx) File Format
          // https://learn.microsoft.com/en-us/openspecs/office_standards/ms-docx/b839fe1f-e1ca-4fa6-8c26-5954d0abbccd
          "http://schemas.microsoft.com/office/word/2010/wordml": "wordml"
        };
        function p(s) {
          return a.readString(s, g).then(function(d) {
            return e(d)[0];
          });
        }
        function u(s, d) {
          return s.exists(d) ? s.read(d, "utf-8").then(i).then(p) : E.resolve(null);
        }
        function i(s) {
          return s.replace(/^\uFEFF/g, "");
        }
        function e(s) {
          return s.type === "element" ? s.name === "mc:AlternateContent" ? s.firstOrEmpty("mc:Fallback").children : (s.children = M.flatten(s.children.map(e, !0)), [s]) : [s];
        }
      }, { "../promises": 23, "../xml": 35, underscore: 67 }], 13: [function(P, se, R) {
        R.readRelationships = M, R.defaultValue = new E([]), R.Relationships = E;
        function M(a) {
          var g = [];
          return a.children.forEach(function(p) {
            if (p.name === "relationships:Relationship") {
              var u = {
                relationshipId: p.attributes.Id,
                target: p.attributes.Target,
                type: p.attributes.Type
              };
              g.push(u);
            }
          }), new E(g);
        }
        function E(a) {
          var g = /* @__PURE__ */ Object.create(null);
          a.forEach(function(u) {
            g[u.relationshipId] = u.target;
          });
          var p = /* @__PURE__ */ Object.create(null);
          return a.forEach(function(u) {
            p[u.type] || (p[u.type] = []), p[u.type].push(u.target);
          }), {
            findTargetByRelationshipId: function(u) {
              return g[u];
            },
            findTargetsByType: function(u) {
              return p[u] || [];
            }
          };
        }
      }, {}], 14: [function(P, se, R) {
        var M = P("underscore"), E = P("../promises"), a = P("../xml");
        R.writeStyleMap = i, R.readStyleMap = v;
        var g = "http://schemas.zwobble.org/mammoth/style-map", p = "mammoth/style-map", u = "/" + p;
        function i(w, y) {
          return w.write(p, y), e(w).then(function() {
            return s(w);
          });
        }
        function e(w) {
          var y = "word/_rels/document.xml.rels", h = "http://schemas.openxmlformats.org/package/2006/relationships", _ = "{" + h + "}Relationship";
          return w.read(y, "utf8").then(a.readString).then(function(c) {
            var n = c.children;
            d(n, _, "Id", {
              Id: "rMammothStyleMap",
              Type: g,
              Target: u
            });
            var r = { "": h };
            return w.write(y, a.writeString(c, r));
          });
        }
        function s(w) {
          var y = "[Content_Types].xml", h = "http://schemas.openxmlformats.org/package/2006/content-types", _ = "{" + h + "}Override";
          return w.read(y, "utf8").then(a.readString).then(function(c) {
            var n = c.children;
            d(n, _, "PartName", {
              PartName: u,
              ContentType: "text/prs.mammoth.style-map"
            });
            var r = { "": h };
            return w.write(y, a.writeString(c, r));
          });
        }
        function d(w, y, h, _) {
          var c = M.find(w, function(n) {
            return n.name === y && n.attributes[h] === _[h];
          });
          c ? c.attributes = _ : w.push(a.element(y, _));
        }
        function v(w) {
          return w.exists(p) ? w.read(p, "utf8") : E.resolve(null);
        }
      }, { "../promises": 23, "../xml": 35, underscore: 67 }], 15: [function(P, se, R) {
        R.readStylesXml = E, R.Styles = M, R.defaultStyles = new M({}, {});
        function M(i, e, s, d) {
          return {
            findParagraphStyleById: function(v) {
              return i[v];
            },
            findCharacterStyleById: function(v) {
              return e[v];
            },
            findTableStyleById: function(v) {
              return s[v];
            },
            findNumberingStyleById: function(v) {
              return d[v];
            }
          };
        }
        M.EMPTY = new M({}, {}, {}, {});
        function E(i) {
          var e = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null);
          return i.getElementsByTagName("w:style").forEach(function(w) {
            var y = a(w), h;
            switch (y.type) {
              case "paragraph":
                h = e;
                break;
              case "character":
                h = s;
                break;
              case "table":
                h = d;
                break;
              case "numbering":
                h = v;
                break;
            }
            h && h[y.styleId] === void 0 && (h[y.styleId] = y);
          }), new M(e, s, d, v);
        }
        function a(i) {
          var e = i.attributes["w:type"];
          if (e === "numbering")
            return p(e, i);
          var s = u(i), d = g(i);
          return { type: e, styleId: s, name: d };
        }
        function g(i) {
          var e = i.first("w:name");
          return e ? e.attributes["w:val"] : null;
        }
        function p(i, e) {
          var s = u(e), d = e.firstOrEmpty("w:pPr").firstOrEmpty("w:numPr").firstOrEmpty("w:numId").attributes["w:val"];
          return { type: i, numId: d, styleId: s };
        }
        function u(i) {
          return i.attributes["w:styleId"];
        }
      }, {}], 16: [function(P, se, R) {
        R.uriToZipEntryName = M, R.replaceFragment = E;
        function M(a, g) {
          return g.charAt(0) === "/" ? g.substr(1) : a + "/" + g;
        }
        function E(a, g) {
          var p = a.indexOf("#");
          return p !== -1 && (a = a.substring(0, p)), a + "#" + g;
        }
      }, {}], 17: [function(P, se, R) {
        var M = P("../styles/html-paths");
        function E(s, d, v) {
          return g(
            M.element(s, d, { fresh: !1 }),
            v
          );
        }
        function a(s, d, v) {
          var w = M.element(s, d, { fresh: !0 });
          return g(w, v);
        }
        function g(s, d) {
          return {
            type: "element",
            tag: s,
            children: d || []
          };
        }
        function p(s) {
          return {
            type: "text",
            value: s
          };
        }
        var u = {
          type: "forceWrite"
        };
        R.freshElement = a, R.nonFreshElement = E, R.elementWithTag = g, R.text = p, R.forceWrite = u;
        var i = {
          br: !0,
          hr: !0,
          img: !0,
          input: !0
        };
        function e(s) {
          return s.children.length === 0 && i[s.tag.tagName];
        }
        R.isVoidElement = e;
      }, { "../styles/html-paths": 28 }], 18: [function(P, se, R) {
        var M = P("./ast");
        R.freshElement = M.freshElement, R.nonFreshElement = M.nonFreshElement, R.elementWithTag = M.elementWithTag, R.text = M.text, R.forceWrite = M.forceWrite, R.simplify = P("./simplify");
        function E(i, e) {
          e.forEach(function(s) {
            a(i, s);
          });
        }
        function a(i, e) {
          g[e.type](i, e);
        }
        var g = {
          element: p,
          text: u,
          forceWrite: function() {
          }
        };
        function p(i, e) {
          M.isVoidElement(e) ? i.selfClosing(e.tag.tagName, e.tag.attributes) : (i.open(e.tag.tagName, e.tag.attributes), E(i, e.children), i.close(e.tag.tagName));
        }
        function u(i, e) {
          i.text(e.value);
        }
        R.write = E;
      }, { "./ast": 17, "./simplify": 19 }], 19: [function(P, se, R) {
        var M = P("underscore"), E = P("./ast");
        function a(c) {
          return g(d(c));
        }
        function g(c) {
          var n = [];
          return c.map(p).forEach(function(r) {
            s(n, r);
          }), n;
        }
        function p(c) {
          return u[c.type](c);
        }
        var u = {
          element: i,
          text: e,
          forceWrite: e
        };
        function i(c) {
          return E.elementWithTag(c.tag, g(c.children));
        }
        function e(c) {
          return c;
        }
        function s(c, n) {
          var r = c[c.length - 1];
          n.type === "element" && !n.tag.fresh && r && r.type === "element" && n.tag.matchesElement(r.tag) ? (n.tag.separator && s(r.children, E.text(n.tag.separator)), n.children.forEach(function(m) {
            s(r.children, m);
          })) : c.push(n);
        }
        function d(c) {
          return v(c, function(n) {
            return w[n.type](n);
          });
        }
        function v(c, n) {
          return M.flatten(M.map(c, n), !0);
        }
        var w = {
          element: h,
          text: _,
          forceWrite: y
        };
        function y(c) {
          return [c];
        }
        function h(c) {
          var n = d(c.children);
          return n.length === 0 && !E.isVoidElement(c) ? [] : [E.elementWithTag(c.tag, n)];
        }
        function _(c) {
          return c.value.length === 0 ? [] : [c];
        }
        se.exports = a;
      }, { "./ast": 17, underscore: 67 }], 20: [function(P, se, R) {
        var M = P("underscore"), E = P("./promises"), a = P("./html");
        R.imgElement = g;
        function g(u) {
          return function(i, e) {
            return E.resolve(u(i)).then(function(s) {
              var d = {};
              return i.altText && (d.alt = i.altText), M.extend(d, s), [a.freshElement("img", d)];
            });
          };
        }
        R.inline = R.imgElement, R.dataUri = g(function(u) {
          return u.readAsBase64String().then(function(i) {
            return {
              src: "data:" + u.contentType + ";base64," + i
            };
          });
        });
        function p(u) {
          return u.contentType.split(/\/|\\/)[1];
        }
        R.imageFilenameExtension = p;
      }, { "./html": 18, "./promises": 23, underscore: 67 }], 21: [function(P, se, R) {
        (function(M) {
          var E = P("underscore"), a = P("./docx/docx-reader"), g = P("./docx/style-map"), p = P("./document-to-html").DocumentConverter, u = P("./raw-text").convertElementToRawText, i = P("./style-reader").readStyle, e = P("./options-reader").readOptions, s = P("./promises"), d = P("./unzip"), v = P("./results").Result;
          R.convertToHtml = w, R.convertToMarkdown = y, R.convert = h, R.extractRawText = r, R.images = P("./images"), R.transforms = P("./transforms"), R.underline = P("./underline"), R.embedStyleMap = m, R.readEmbeddedStyleMap = _;
          function w(T, z) {
            return h(T, z);
          }
          function y(T, z) {
            var I = Object.create(z || {});
            return I.outputFormat = "markdown", h(T, I);
          }
          function h(T, z) {
            z = e(z);
            var I = d.openZip(T).then(function(A) {
              return g.readStyleMap(A).then(function(O) {
                return z.embeddedStyleMap = O, A;
              });
            }).then(function(A) {
              return a.read(A, T, z).then(function(O) {
                return O.map(z.transformDocument);
              }).then(function(O) {
                return c(O, z);
              });
            });
            return s.toExternalPromise(I);
          }
          function _(T) {
            var z = d.openZip(T).then(g.readStyleMap);
            return s.toExternalPromise(z);
          }
          function c(T, z) {
            var I = n(z.readStyleMap()), A = E.extend({}, z, {
              styleMap: I.value
            }), O = new p(A);
            return T.flatMapThen(function(B) {
              return I.flatMapThen(function(k) {
                return O.convertToHtml(B);
              });
            });
          }
          function n(T) {
            return v.combine((T || []).map(i)).map(function(z) {
              return z.filter(function(I) {
                return !!I;
              });
            });
          }
          function r(T) {
            var z = d.openZip(T).then(a.read).then(function(I) {
              return I.map(u);
            });
            return s.toExternalPromise(z);
          }
          function m(T, z) {
            var I = d.openZip(T).then(function(A) {
              return g.writeStyleMap(A, z).then(function() {
                return A;
              });
            }).then(function(A) {
              return A.toArrayBuffer();
            }).then(function(A) {
              return {
                toArrayBuffer: function() {
                  return A;
                },
                toBuffer: function() {
                  return M.from(A);
                }
              };
            });
            return s.toExternalPromise(I);
          }
          R.styleMapping = function() {
            throw new Error(`Use a raw string instead of mammoth.styleMapping e.g. "p[style-name='Title'] => h1" instead of mammoth.styleMapping("p[style-name='Title'] => h1")`);
          };
        }).call(this, P("buffer").Buffer);
      }, { "./document-to-html": 3, "./docx/docx-reader": 9, "./docx/style-map": 14, "./images": 20, "./options-reader": 22, "./promises": 23, "./raw-text": 24, "./results": 25, "./style-reader": 26, "./transforms": 30, "./underline": 31, "./unzip": 2, buffer: 48, underscore: 67 }], 22: [function(P, se, R) {
        R.readOptions = g;
        var M = P("underscore"), E = R._defaultStyleMap = [
          "p.Heading1 => h1:fresh",
          "p.Heading2 => h2:fresh",
          "p.Heading3 => h3:fresh",
          "p.Heading4 => h4:fresh",
          "p.Heading5 => h5:fresh",
          "p.Heading6 => h6:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "p[style-name='heading 1'] => h1:fresh",
          "p[style-name='heading 2'] => h2:fresh",
          "p[style-name='heading 3'] => h3:fresh",
          "p[style-name='heading 4'] => h4:fresh",
          "p[style-name='heading 5'] => h5:fresh",
          "p[style-name='heading 6'] => h6:fresh",
          // Apple Pages
          "p.Heading => h1:fresh",
          "p[style-name='Heading'] => h1:fresh",
          "r[style-name='Strong'] => strong",
          "p[style-name='footnote text'] => p:fresh",
          "r[style-name='footnote reference'] =>",
          "p[style-name='endnote text'] => p:fresh",
          "r[style-name='endnote reference'] =>",
          "p[style-name='annotation text'] => p:fresh",
          "r[style-name='annotation reference'] =>",
          // LibreOffice
          "p[style-name='Footnote'] => p:fresh",
          "r[style-name='Footnote anchor'] =>",
          "p[style-name='Endnote'] => p:fresh",
          "r[style-name='Endnote anchor'] =>",
          "p:unordered-list(1) => ul > li:fresh",
          "p:unordered-list(2) => ul|ol > li > ul > li:fresh",
          "p:unordered-list(3) => ul|ol > li > ul|ol > li > ul > li:fresh",
          "p:unordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh",
          "p:unordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ul > li:fresh",
          "p:ordered-list(1) => ol > li:fresh",
          "p:ordered-list(2) => ul|ol > li > ol > li:fresh",
          "p:ordered-list(3) => ul|ol > li > ul|ol > li > ol > li:fresh",
          "p:ordered-list(4) => ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh",
          "p:ordered-list(5) => ul|ol > li > ul|ol > li > ul|ol > li > ul|ol > li > ol > li:fresh",
          "r[style-name='Hyperlink'] =>",
          "p[style-name='Normal'] => p:fresh",
          // Apple Pages
          "p.Body => p:fresh",
          "p[style-name='Body'] => p:fresh"
        ], a = R._standardOptions = {
          externalFileAccess: !1,
          transformDocument: u,
          includeDefaultStyleMap: !0,
          includeEmbeddedStyleMap: !0
        };
        function g(i) {
          return i = i || {}, M.extend({}, a, i, {
            customStyleMap: p(i.styleMap),
            readStyleMap: function() {
              var e = this.customStyleMap;
              return this.includeEmbeddedStyleMap && (e = e.concat(p(this.embeddedStyleMap))), this.includeDefaultStyleMap && (e = e.concat(E)), e;
            }
          });
        }
        function p(i) {
          return i ? M.isString(i) ? i.split(`
`).map(function(e) {
            return e.trim();
          }).filter(function(e) {
            return e !== "" && e.charAt(0) !== "#";
          }) : i : [];
        }
        function u(i) {
          return i;
        }
      }, { underscore: 67 }], 23: [function(P, se, R) {
        (function(M) {
          var E = P("underscore");
          R.defer = u, R.Promise = Promise, R.resolve = Promise.resolve.bind(Promise), R.reject = Promise.reject.bind(Promise), R.forEachSeries = function(d, v) {
            var w = 0, y = u(), h = function() {
              if (w < d.length) {
                var _ = d[w];
                w++, v(_).then(h, y.reject);
              } else
                y.resolve();
            };
            return h(), y.promise;
          };
          var a = R.props = function(d) {
            var v = Object.keys(d), w = Object.values(d), y = Promise.all(w).then(function(h) {
              for (var _ = {}, c = 0; c < v.length; c++)
                _[v[c]] = h[c];
              return _;
            });
            return p(y);
          }, g = function(d) {
            var v = this.then(function(w) {
              var y = E.extend({}, w, d(w));
              return a(y);
            });
            return p(v);
          };
          function p(d) {
            return d.also = g, d;
          }
          R.try = function(d) {
            try {
              return Promise.resolve(d());
            } catch (v) {
              return Promise.reject(v);
            }
          };
          function u() {
            var d, v, w = new Promise(function(y, h) {
              d = y, v = h;
            });
            return {
              resolve: d,
              reject: v,
              promise: w
            };
          }
          function i(d) {
            var v = new Promise(d);
            return v.__proto__ = i.prototype, v;
          }
          i.__proto__ = Promise, i.prototype.__proto__ = Promise.prototype, i.prototype.done = function(d, v) {
            return this.then(d, v).catch(function(w) {
              if (s()) {
                var y = w instanceof Error ? w.stack : w;
                M.stderr.write("Fatal " + y + `
`), M.exit(2);
              } else
                setTimeout(function() {
                  throw w;
                }, 0);
            });
          };
          function e(d) {
            return i.resolve(d);
          }
          R.toExternalPromise = e;
          function s() {
            return typeof M > "u" ? !1 : {}.toString.call(M).toLowerCase() === "[object process]";
          }
        }).call(this, P("_process"));
      }, { _process: 66, underscore: 67 }], 24: [function(P, se, R) {
        var M = P("./documents");
        function E(a) {
          if (a.type === "text")
            return a.value;
          if (a.type === M.types.tab)
            return "	";
          var g = a.type === "paragraph" ? `

` : "";
          return (a.children || []).map(E).join("") + g;
        }
        R.convertElementToRawText = E;
      }, { "./documents": 4 }], 25: [function(P, se, R) {
        var M = P("underscore");
        R.Result = E, R.success = a, R.warning = g, R.error = p;
        function E(s, d) {
          this.value = s, this.messages = d || [];
        }
        E.prototype.map = function(s) {
          return new E(s(this.value), this.messages);
        }, E.prototype.flatMap = function(s) {
          var d = s(this.value);
          return new E(d.value, u([this, d]));
        }, E.prototype.flatMapThen = function(s) {
          var d = this;
          return s(this.value).then(function(v) {
            return new E(v.value, u([d, v]));
          });
        }, E.combine = function(s) {
          var d = M.flatten(M.pluck(s, "value")), v = u(s);
          return new E(d, v);
        };
        function a(s) {
          return new E(s, []);
        }
        function g(s) {
          return {
            type: "warning",
            message: s
          };
        }
        function p(s) {
          return {
            type: "error",
            message: s.message,
            error: s
          };
        }
        function u(s) {
          var d = [];
          return M.flatten(M.pluck(s, "messages"), !0).forEach(function(v) {
            i(d, v) || d.push(v);
          }), d;
        }
        function i(s, d) {
          return M.find(s, e.bind(null, d)) !== void 0;
        }
        function e(s, d) {
          return s.type === d.type && s.message === d.message;
        }
      }, { underscore: 67 }], 26: [function(P, se, R) {
        var M = P("underscore"), E = P("lop"), a = P("./styles/document-matchers"), g = P("./styles/html-paths"), p = P("./styles/parser/tokeniser").tokenise, u = P("./results");
        R.readHtmlPath = v, R.readDocumentMatcher = s, R.readStyle = i;
        function i(B) {
          return z(O, B);
        }
        function e() {
          return E.rules.sequence(
            E.rules.sequence.capture(d()),
            E.rules.tokenOfType("whitespace"),
            E.rules.tokenOfType("arrow"),
            E.rules.sequence.capture(E.rules.optional(E.rules.sequence(
              E.rules.tokenOfType("whitespace"),
              E.rules.sequence.capture(w())
            ).head())),
            E.rules.tokenOfType("end")
          ).map(function(B, k) {
            return {
              from: B,
              to: k.valueOrElse(g.empty)
            };
          });
        }
        function s(B) {
          return z(d(), B);
        }
        function d() {
          var B = E.rules.sequence, k = function(Ie, De) {
            return E.rules.then(
              E.rules.token("identifier", Ie),
              function() {
                return De;
              }
            );
          }, W = k("p", a.paragraph), ee = k("r", a.run), F = E.rules.firstOf(
            "p or r or table",
            W,
            ee
          ), Y = E.rules.sequence(
            E.rules.tokenOfType("dot"),
            E.rules.sequence.cut(),
            E.rules.sequence.capture(y)
          ).map(function(Ie) {
            return { styleId: Ie };
          }), x = E.rules.firstOf(
            "style name matcher",
            E.rules.then(
              E.rules.sequence(
                E.rules.tokenOfType("equals"),
                E.rules.sequence.cut(),
                E.rules.sequence.capture(_)
              ).head(),
              function(Ie) {
                return { styleName: a.equalTo(Ie) };
              }
            ),
            E.rules.then(
              E.rules.sequence(
                E.rules.tokenOfType("startsWith"),
                E.rules.sequence.cut(),
                E.rules.sequence.capture(_)
              ).head(),
              function(Ie) {
                return { styleName: a.startsWith(Ie) };
              }
            )
          ), K = E.rules.sequence(
            E.rules.tokenOfType("open-square-bracket"),
            E.rules.sequence.cut(),
            E.rules.token("identifier", "style-name"),
            E.rules.sequence.capture(x),
            E.rules.tokenOfType("close-square-bracket")
          ).head(), pe = E.rules.firstOf(
            "list type",
            k("ordered-list", { isOrdered: !0 }),
            k("unordered-list", { isOrdered: !1 })
          ), ne = B(
            E.rules.tokenOfType("colon"),
            B.capture(pe),
            B.cut(),
            E.rules.tokenOfType("open-paren"),
            B.capture(h),
            E.rules.tokenOfType("close-paren")
          ).map(function(Ie, De) {
            return {
              list: {
                isOrdered: Ie.isOrdered,
                levelIndex: De - 1
              }
            };
          });
          function ce(Ie) {
            var De = E.rules.firstOf.apply(
              E.rules.firstOf,
              ["matcher suffix"].concat(Ie)
            ), Le = E.rules.zeroOrMore(De);
            return E.rules.then(Le, function(Be) {
              var f = {};
              return Be.forEach(function($) {
                M.extend(f, $);
              }), f;
            });
          }
          var ie = B(
            B.capture(F),
            B.capture(ce([
              Y,
              K,
              ne
            ]))
          ).map(function(Ie, De) {
            return Ie(De);
          }), ye = B(
            E.rules.token("identifier", "table"),
            B.capture(ce([
              Y,
              K
            ]))
          ).map(function(Ie) {
            return a.table(Ie);
          }), j = k("b", a.bold), Q = k("i", a.italic), we = k("u", a.underline), he = k("strike", a.strikethrough), le = k("all-caps", a.allCaps), Re = k("small-caps", a.smallCaps), Ce = B(
            E.rules.token("identifier", "highlight"),
            E.rules.sequence.capture(E.rules.optional(E.rules.sequence(
              E.rules.tokenOfType("open-square-bracket"),
              E.rules.sequence.cut(),
              E.rules.token("identifier", "color"),
              E.rules.tokenOfType("equals"),
              E.rules.sequence.capture(_),
              E.rules.tokenOfType("close-square-bracket")
            ).head()))
          ).map(function(Ie) {
            return a.highlight({
              color: Ie.valueOrElse(void 0)
            });
          }), be = k("comment-reference", a.commentReference), Te = B(
            E.rules.token("identifier", "br"),
            B.cut(),
            E.rules.tokenOfType("open-square-bracket"),
            E.rules.token("identifier", "type"),
            E.rules.tokenOfType("equals"),
            B.capture(_),
            E.rules.tokenOfType("close-square-bracket")
          ).map(function(Ie) {
            switch (Ie) {
              case "line":
                return a.lineBreak;
              case "page":
                return a.pageBreak;
              case "column":
                return a.columnBreak;
            }
          });
          return E.rules.firstOf(
            "element type",
            ie,
            ye,
            j,
            Q,
            we,
            he,
            le,
            Re,
            Ce,
            be,
            Te
          );
        }
        function v(B) {
          return z(w(), B);
        }
        function w() {
          var B = E.rules.sequence.capture, k = E.rules.tokenOfType("whitespace"), W = E.rules.then(
            E.rules.optional(E.rules.sequence(
              E.rules.tokenOfType("colon"),
              E.rules.token("identifier", "fresh")
            )),
            function(x) {
              return x.map(function() {
                return !0;
              }).valueOrElse(!1);
            }
          ), ee = E.rules.then(
            E.rules.optional(E.rules.sequence(
              E.rules.tokenOfType("colon"),
              E.rules.token("identifier", "separator"),
              E.rules.tokenOfType("open-paren"),
              B(_),
              E.rules.tokenOfType("close-paren")
            ).head()),
            function(x) {
              return x.valueOrElse("");
            }
          ), F = E.rules.oneOrMoreWithSeparator(
            y,
            E.rules.tokenOfType("choice")
          ), Y = E.rules.sequence(
            B(F),
            B(E.rules.zeroOrMore(T)),
            B(W),
            B(ee)
          ).map(function(x, K, pe, ne) {
            var ce = /* @__PURE__ */ Object.create(null), ie = {};
            return K.forEach(function(ye) {
              ye.append && ce[ye.name] ? ce[ye.name] += " " + ye.value : ce[ye.name] = ye.value;
            }), pe && (ie.fresh = !0), ne && (ie.separator = ne), g.element(x, ce, ie);
          });
          return E.rules.firstOf(
            "html path",
            E.rules.then(E.rules.tokenOfType("bang"), function() {
              return g.ignore;
            }),
            E.rules.then(
              E.rules.zeroOrMoreWithSeparator(
                Y,
                E.rules.sequence(
                  k,
                  E.rules.tokenOfType("gt"),
                  k
                )
              ),
              g.elements
            )
          );
        }
        var y = E.rules.then(
          E.rules.tokenOfType("identifier"),
          n
        ), h = E.rules.tokenOfType("integer"), _ = E.rules.then(
          E.rules.tokenOfType("string"),
          n
        ), c = {
          n: `
`,
          r: "\r",
          t: "	"
        };
        function n(B) {
          return B.replace(/\\(.)/g, function(k, W) {
            return c[W] || W;
          });
        }
        var r = E.rules.sequence(
          E.rules.tokenOfType("open-square-bracket"),
          E.rules.sequence.cut(),
          E.rules.sequence.capture(y),
          E.rules.tokenOfType("equals"),
          E.rules.sequence.capture(_),
          E.rules.tokenOfType("close-square-bracket")
        ).map(function(B, k) {
          return { name: B, value: k, append: !1 };
        }), m = E.rules.sequence(
          E.rules.tokenOfType("dot"),
          E.rules.sequence.cut(),
          E.rules.sequence.capture(y)
        ).map(function(B) {
          return { name: "class", value: B, append: !0 };
        }), T = E.rules.firstOf(
          "attribute or class",
          r,
          m
        );
        function z(B, k) {
          var W = p(k), ee = E.Parser(), F = ee.parseTokens(B, W);
          return F.isSuccess() ? u.success(F.value()) : new u.Result(null, [u.warning(I(k, F))]);
        }
        function I(B, k) {
          return "Did not understand this style mapping, so ignored it: " + B + `
` + k.errors().map(A).join(`
`);
        }
        function A(B) {
          return "Error was at character number " + B.characterNumber() + ": Expected " + B.expected + " but got " + B.actual;
        }
        var O = e();
      }, { "./results": 25, "./styles/document-matchers": 27, "./styles/html-paths": 28, "./styles/parser/tokeniser": 29, lop: 54, underscore: 67 }], 27: [function(P, se, R) {
        R.paragraph = M, R.run = E, R.table = a, R.bold = new p("bold"), R.italic = new p("italic"), R.underline = new p("underline"), R.strikethrough = new p("strikethrough"), R.allCaps = new p("allCaps"), R.smallCaps = new p("smallCaps"), R.highlight = g, R.commentReference = new p("commentReference"), R.lineBreak = new i({ breakType: "line" }), R.pageBreak = new i({ breakType: "page" }), R.columnBreak = new i({ breakType: "column" }), R.equalTo = s, R.startsWith = d;
        function M(y) {
          return new p("paragraph", y);
        }
        function E(y) {
          return new p("run", y);
        }
        function a(y) {
          return new p("table", y);
        }
        function g(y) {
          return new u(y);
        }
        function p(y, h) {
          h = h || {}, this._elementType = y, this._styleId = h.styleId, this._styleName = h.styleName, h.list && (this._listIndex = h.list.levelIndex, this._listIsOrdered = h.list.isOrdered);
        }
        p.prototype.matches = function(y) {
          return y.type === this._elementType && (this._styleId === void 0 || y.styleId === this._styleId) && (this._styleName === void 0 || y.styleName && this._styleName.operator(this._styleName.operand, y.styleName)) && (this._listIndex === void 0 || e(y, this._listIndex, this._listIsOrdered)) && (this._breakType === void 0 || this._breakType === y.breakType);
        };
        function u(y) {
          y = y || {}, this._color = y.color;
        }
        u.prototype.matches = function(y) {
          return y.type === "highlight" && (this._color === void 0 || y.color === this._color);
        };
        function i(y) {
          y = y || {}, this._breakType = y.breakType;
        }
        i.prototype.matches = function(y) {
          return y.type === "break" && (this._breakType === void 0 || y.breakType === this._breakType);
        };
        function e(y, h, _) {
          return y.numbering && y.numbering.level == h && y.numbering.isOrdered == _;
        }
        function s(y) {
          return {
            operator: v,
            operand: y
          };
        }
        function d(y) {
          return {
            operator: w,
            operand: y
          };
        }
        function v(y, h) {
          return y.toUpperCase() === h.toUpperCase();
        }
        function w(y, h) {
          return h.toUpperCase().indexOf(y.toUpperCase()) === 0;
        }
      }, {}], 28: [function(P, se, R) {
        var M = P("underscore"), E = P("../html");
        R.topLevelElement = a, R.elements = g, R.element = u;
        function a(e, s) {
          return g([u(e, s, { fresh: !0 })]);
        }
        function g(e) {
          return new p(e.map(function(s) {
            return M.isString(s) ? u(s) : s;
          }));
        }
        function p(e) {
          this._elements = e;
        }
        p.prototype.wrap = function(s) {
          for (var d = s(), v = this._elements.length - 1; v >= 0; v--)
            d = this._elements[v].wrapNodes(d);
          return d;
        };
        function u(e, s, d) {
          return d = d || {}, new i(e, s, d);
        }
        function i(e, s, d) {
          var v = /* @__PURE__ */ Object.create(null);
          M.isArray(e) ? (e.forEach(function(w) {
            v[w] = !0;
          }), e = e[0]) : v[e] = !0, this.tagName = e, this.tagNames = v, this.attributes = s || {}, this.fresh = d.fresh, this.separator = d.separator;
        }
        i.prototype.matchesElement = function(e) {
          return this.tagNames[e.tagName] && M.isEqual(this.attributes || {}, e.attributes || {});
        }, i.prototype.wrap = function(s) {
          return this.wrapNodes(s());
        }, i.prototype.wrapNodes = function(s) {
          return [E.elementWithTag(this, s)];
        }, R.empty = g([]), R.ignore = {
          wrap: function() {
            return [];
          }
        };
      }, { "../html": 18, underscore: 67 }], 29: [function(P, se, R) {
        var M = P("lop"), E = M.RegexTokeniser;
        R.tokenise = g;
        var a = "'((?:\\\\(?:.|$)|[^'\\\\])*)";
        function g(p) {
          var u = "(?:[a-zA-Z\\-_]|\\\\.)", i = new E([
            { name: "identifier", regex: new RegExp("(" + u + "(?:" + u + "|[0-9])*)") },
            { name: "dot", regex: /\./ },
            { name: "colon", regex: /:/ },
            { name: "gt", regex: />/ },
            { name: "whitespace", regex: /\s+/ },
            { name: "arrow", regex: /=>/ },
            { name: "equals", regex: /=/ },
            { name: "startsWith", regex: /\^=/ },
            { name: "open-paren", regex: /\(/ },
            { name: "close-paren", regex: /\)/ },
            { name: "open-square-bracket", regex: /\[/ },
            { name: "close-square-bracket", regex: /\]/ },
            { name: "string", regex: new RegExp(a + "'") },
            { name: "unterminated-string", regex: new RegExp(a) },
            { name: "integer", regex: /([0-9]+)/ },
            { name: "choice", regex: /\|/ },
            { name: "bang", regex: /(!)/ }
          ]);
          return i.tokenise(p);
        }
      }, { lop: 54 }], 30: [function(P, se, R) {
        var M = P("underscore");
        R.paragraph = E, R.run = a, R._elements = p, R._elementsOfType = g, R.getDescendantsOfType = u, R.getDescendants = i;
        function E(s) {
          return g("paragraph", s);
        }
        function a(s) {
          return g("run", s);
        }
        function g(s, d) {
          return p(function(v) {
            return v.type === s ? d(v) : v;
          });
        }
        function p(s) {
          return function d(v) {
            if (v.children) {
              var w = M.map(v.children, d);
              v = M.extend(v, { children: w });
            }
            return s(v);
          };
        }
        function u(s, d) {
          return i(s).filter(function(v) {
            return v.type === d;
          });
        }
        function i(s) {
          var d = [];
          return e(s, function(v) {
            d.push(v);
          }), d;
        }
        function e(s, d) {
          s.children && s.children.forEach(function(v) {
            e(v, d), d(v);
          });
        }
      }, { underscore: 67 }], 31: [function(P, se, R) {
        var M = P("./styles/html-paths"), E = P("./html");
        R.element = a;
        function a(g) {
          return function(p) {
            return E.elementWithTag(M.element(g), [p]);
          };
        }
      }, { "./html": 18, "./styles/html-paths": 28 }], 32: [function(P, se, R) {
        var M = P("underscore");
        R.writer = E;
        function E(e) {
          return e = e || {}, e.prettyPrint ? g() : p();
        }
        var a = {
          div: !0,
          p: !0,
          ul: !0,
          li: !0
        };
        function g() {
          var e = 0, s = "  ", d = [], v = !0, w = !1, y = p();
          function h(I, A) {
            a[I] && T(), d.push(I), y.open(I, A), a[I] && e++, v = !1;
          }
          function _(I) {
            a[I] && (e--, T()), d.pop(), y.close(I);
          }
          function c(I) {
            m();
            var A = z() ? I : I.replace(`
`, `
` + s);
            y.text(A);
          }
          function n(I, A) {
            T(), y.selfClosing(I, A);
          }
          function r() {
            return d.length === 0 || a[d[d.length - 1]];
          }
          function m() {
            w || (T(), w = !0);
          }
          function T() {
            if (w = !1, !v && r() && !z()) {
              y._append(`
`);
              for (var I = 0; I < e; I++)
                y._append(s);
            }
          }
          function z() {
            return M.some(d, function(I) {
              return I === "pre";
            });
          }
          return {
            asString: y.asString,
            open: h,
            close: _,
            text: c,
            selfClosing: n
          };
        }
        function p() {
          var e = [];
          function s(c, n) {
            var r = w(n);
            e.push("<" + c + r + ">");
          }
          function d(c) {
            e.push("</" + c + ">");
          }
          function v(c, n) {
            var r = w(n);
            e.push("<" + c + r + " />");
          }
          function w(c) {
            return M.map(c, function(n, r) {
              return " " + r + '="' + i(n) + '"';
            }).join("");
          }
          function y(c) {
            e.push(u(c));
          }
          function h(c) {
            e.push(c);
          }
          function _() {
            return e.join("");
          }
          return {
            asString: _,
            open: s,
            close: d,
            text: y,
            selfClosing: v,
            _append: h
          };
        }
        function u(e) {
          return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        function i(e) {
          return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
      }, { underscore: 67 }], 33: [function(P, se, R) {
        var M = P("./html-writer"), E = P("./markdown-writer");
        R.writer = a;
        function a(g) {
          return g = g || {}, g.outputFormat === "markdown" ? E.writer() : M.writer(g);
        }
      }, { "./html-writer": 32, "./markdown-writer": 34 }], 34: [function(P, se, R) {
        var M = P("underscore"), E = P("./html-writer");
        function a(y) {
          return g(y, y);
        }
        function g(y, h) {
          return function() {
            return { start: y, end: h };
          };
        }
        function p(y) {
          var h = y.href || "";
          return h ? {
            start: "[",
            end: "](" + w(h) + ")",
            anchorPosition: "before"
          } : {};
        }
        function u(y) {
          var h = y.src || "", _ = y.alt || "";
          return h || _ ? { start: "![" + w(_) + "](" + w(h) + ")" } : {};
        }
        function i(y) {
          return function(h, _) {
            return {
              start: _ ? `
` : "",
              end: _ ? "" : `
`,
              list: {
                isOrdered: y.isOrdered,
                indent: _ ? _.indent + 1 : 0,
                count: 0
              }
            };
          };
        }
        function e(y, h, _) {
          h = h || { indent: 0, isOrdered: !1, count: 0 }, h.count++, _.hasClosed = !1;
          var c = h.isOrdered ? h.count + "." : "-", n = d("	", h.indent) + c + " ";
          return {
            start: n,
            end: function() {
              if (!_.hasClosed)
                return _.hasClosed = !0, `
`;
            }
          };
        }
        var s = {
          p: g("", `

`),
          br: g("", `  
`),
          ul: i({ isOrdered: !1 }),
          ol: i({ isOrdered: !0 }),
          li: e,
          strong: a("__"),
          em: a("*"),
          a: p,
          img: u
        };
        (function() {
          for (var y = 1; y <= 6; y++)
            s["h" + y] = g(d("#", y) + " ", `

`);
        })();
        function d(y, h) {
          return new Array(h + 1).join(y);
        }
        function v() {
          var y = [], h = [], _ = null, c = {};
          function n(A, O) {
            O = O || {};
            var B = s[A] || function() {
              return {};
            }, k = B(O, _, c);
            h.push({ end: k.end, list: _ }), k.list && (_ = k.list);
            var W = k.anchorPosition === "before";
            W && r(O), y.push(k.start || ""), W || r(O);
          }
          function r(A) {
            if (A.id) {
              var O = E.writer();
              O.open("a", { id: A.id }), O.close("a"), y.push(O.asString());
            }
          }
          function m(A) {
            var O = h.pop();
            _ = O.list;
            var B = M.isFunction(O.end) ? O.end() : O.end;
            y.push(B || "");
          }
          function T(A, O) {
            n(A, O), m();
          }
          function z(A) {
            y.push(w(A));
          }
          function I() {
            return y.join("");
          }
          return {
            asString: I,
            open: n,
            close: m,
            text: z,
            selfClosing: T
          };
        }
        R.writer = v;
        function w(y) {
          return y.replace(/\\/g, "\\\\").replace(/([\`\*_\{\}\[\]\(\)\#\+\-\.\!])/g, "\\$1");
        }
      }, { "./html-writer": 32, underscore: 67 }], 35: [function(P, se, R) {
        var M = P("./nodes");
        R.Element = M.Element, R.element = M.element, R.emptyElement = M.emptyElement, R.text = M.text, R.readString = P("./reader").readString, R.writeString = P("./writer").writeString;
      }, { "./nodes": 36, "./reader": 37, "./writer": 38 }], 36: [function(P, se, R) {
        var M = P("underscore");
        R.Element = a, R.element = function(u, i, e) {
          return new a(u, i, e);
        }, R.text = function(u) {
          return {
            type: "text",
            value: u
          };
        };
        var E = R.emptyElement = {
          first: function() {
            return null;
          },
          firstOrEmpty: function() {
            return E;
          },
          attributes: {},
          children: []
        };
        function a(u, i, e) {
          this.type = "element", this.name = u, this.attributes = i || {}, this.children = e || [];
        }
        a.prototype.first = function(u) {
          return M.find(this.children, function(i) {
            return i.name === u;
          });
        }, a.prototype.firstOrEmpty = function(u) {
          return this.first(u) || E;
        }, a.prototype.getElementsByTagName = function(u) {
          var i = M.filter(this.children, function(e) {
            return e.name === u;
          });
          return p(i);
        }, a.prototype.text = function() {
          if (this.children.length === 0)
            return "";
          if (this.children.length !== 1 || this.children[0].type !== "text")
            throw new Error("Not implemented");
          return this.children[0].value;
        };
        var g = {
          getElementsByTagName: function(u) {
            return p(M.flatten(this.map(function(i) {
              return i.getElementsByTagName(u);
            }, !0)));
          }
        };
        function p(u) {
          return M.extend(u, g);
        }
      }, { underscore: 67 }], 37: [function(P, se, R) {
        var M = P("../promises"), E = P("underscore"), a = P("./xmldom"), g = P("./nodes"), p = g.Element;
        R.readString = i;
        var u = a.Node;
        function i(e, s) {
          s = s || {};
          try {
            var d = a.parseFromString(e, "text/xml");
          } catch (h) {
            return M.reject(h);
          }
          if (d.documentElement.tagName === "parsererror")
            return M.resolve(new Error(d.documentElement.textContent));
          function v(h) {
            switch (h.nodeType) {
              case u.ELEMENT_NODE:
                return w(h);
              case u.TEXT_NODE:
                return g.text(h.nodeValue);
            }
          }
          function w(h) {
            var _ = y(h), c = [];
            E.forEach(h.childNodes, function(r) {
              var m = v(r);
              m && c.push(m);
            });
            var n = /* @__PURE__ */ Object.create(null);
            return E.forEach(h.attributes, function(r) {
              n[y(r)] = r.value;
            }), new p(_, n, c);
          }
          function y(h) {
            if (h.namespaceURI) {
              var _ = s[h.namespaceURI], c;
              return _ ? c = _ + ":" : c = "{" + h.namespaceURI + "}", c + h.localName;
            } else
              return h.localName;
          }
          return M.resolve(v(d.documentElement));
        }
      }, { "../promises": 23, "./nodes": 36, "./xmldom": 39, underscore: 67 }], 38: [function(P, se, R) {
        var M = P("underscore"), E = P("xmlbuilder");
        R.writeString = a;
        function a(p, u) {
          var i = M.invert(u), e = {
            element: d,
            text: g
          };
          function s(y, h) {
            return e[h.type](y, h);
          }
          function d(y, h) {
            var _ = y.element(v(h.name), h.attributes);
            h.children.forEach(function(c) {
              s(_, c);
            });
          }
          function v(y) {
            var h = /^\{(.*)\}(.*)$/.exec(y);
            if (h) {
              var _ = i[h[1]];
              return _ + (_ === "" ? "" : ":") + h[2];
            } else
              return y;
          }
          function w(y) {
            var h = E.create(v(y.name), {
              version: "1.0",
              encoding: "UTF-8",
              standalone: !0
            });
            return M.forEach(u, function(_, c) {
              var n = "xmlns" + (c === "" ? "" : ":" + c);
              h.attribute(n, _);
            }), y.children.forEach(function(_) {
              s(h, _);
            }), h.end();
          }
          return w(p);
        }
        function g(p, u) {
          p.text(u.value);
        }
      }, { underscore: 67, xmlbuilder: 89 }], 39: [function(P, se, R) {
        var M = P("@xmldom/xmldom"), E = P("@xmldom/xmldom/lib/dom");
        function a(g) {
          var p = null, u = new M.DOMParser({
            errorHandler: function(e, s) {
              p = { level: e, message: s };
            }
          }), i = u.parseFromString(g);
          if (p === null)
            return i;
          throw new Error(p.level + ": " + p.message);
        }
        R.parseFromString = a, R.Node = E.Node;
      }, { "@xmldom/xmldom": 45, "@xmldom/xmldom/lib/dom": 43 }], 40: [function(P, se, R) {
        var M = P("base64-js"), E = P("jszip");
        R.openArrayBuffer = a, R.splitPath = g, R.joinPath = p;
        function a(u) {
          return E.loadAsync(u).then(function(i) {
            function e(w) {
              return i.file(w) !== null;
            }
            function s(w, y) {
              return i.file(w).async("uint8array").then(function(h) {
                if (y === "base64")
                  return M.fromByteArray(h);
                if (y) {
                  var _ = new TextDecoder(y);
                  return _.decode(h);
                } else
                  return h;
              });
            }
            function d(w, y) {
              i.file(w, y);
            }
            function v() {
              return i.generateAsync({ type: "arraybuffer" });
            }
            return {
              exists: e,
              read: s,
              write: d,
              toArrayBuffer: v
            };
          });
        }
        function g(u) {
          var i = u.lastIndexOf("/");
          return i === -1 ? { dirname: "", basename: u } : {
            dirname: u.substring(0, i),
            basename: u.substring(i + 1)
          };
        }
        function p() {
          var u = Array.prototype.filter.call(arguments, function(e) {
            return e;
          }), i = [];
          return u.forEach(function(e) {
            /^\//.test(e) ? i = [e] : i.push(e);
          }), i.join("/");
        }
      }, { "base64-js": 47, jszip: 53 }], 41: [function(P, se, R) {
        function M(u, i, e) {
          if (e === void 0 && (e = Array.prototype), u && typeof e.find == "function")
            return e.find.call(u, i);
          for (var s = 0; s < u.length; s++)
            if (Object.prototype.hasOwnProperty.call(u, s)) {
              var d = u[s];
              if (i.call(void 0, d, s, u))
                return d;
            }
        }
        function E(u, i) {
          return i === void 0 && (i = Object), i && typeof i.freeze == "function" ? i.freeze(u) : u;
        }
        function a(u, i) {
          if (u === null || typeof u != "object")
            throw new TypeError("target is not an object");
          for (var e in i)
            Object.prototype.hasOwnProperty.call(i, e) && (u[e] = i[e]);
          return u;
        }
        var g = E({
          /**
           * `text/html`, the only mime type that triggers treating an XML document as HTML.
           *
           * @see DOMParser.SupportedType.isHTML
           * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
           * @see https://en.wikipedia.org/wiki/HTML Wikipedia
           * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
           * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
           */
          HTML: "text/html",
          /**
           * Helper method to check a mime type if it indicates an HTML document
           *
           * @param {string} [value]
           * @returns {boolean}
           *
           * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
           * @see https://en.wikipedia.org/wiki/HTML Wikipedia
           * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
           * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
          isHTML: function(u) {
            return u === g.HTML;
          },
          /**
           * `application/xml`, the standard mime type for XML documents.
           *
           * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
           * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
           * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
           */
          XML_APPLICATION: "application/xml",
          /**
           * `text/html`, an alias for `application/xml`.
           *
           * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
           * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
           * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
           */
          XML_TEXT: "text/xml",
          /**
           * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
           * but is parsed as an XML document.
           *
           * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
           * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
           * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
           */
          XML_XHTML_APPLICATION: "application/xhtml+xml",
          /**
           * `image/svg+xml`,
           *
           * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
           * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
           * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
           */
          XML_SVG_IMAGE: "image/svg+xml"
        }), p = E({
          /**
           * The XHTML namespace.
           *
           * @see http://www.w3.org/1999/xhtml
           */
          HTML: "http://www.w3.org/1999/xhtml",
          /**
           * Checks if `uri` equals `NAMESPACE.HTML`.
           *
           * @param {string} [uri]
           *
           * @see NAMESPACE.HTML
           */
          isHTML: function(u) {
            return u === p.HTML;
          },
          /**
           * The SVG namespace.
           *
           * @see http://www.w3.org/2000/svg
           */
          SVG: "http://www.w3.org/2000/svg",
          /**
           * The `xml:` namespace.
           *
           * @see http://www.w3.org/XML/1998/namespace
           */
          XML: "http://www.w3.org/XML/1998/namespace",
          /**
           * The `xmlns:` namespace
           *
           * @see https://www.w3.org/2000/xmlns/
           */
          XMLNS: "http://www.w3.org/2000/xmlns/"
        });
        R.assign = a, R.find = M, R.freeze = E, R.MIME_TYPE = g, R.NAMESPACE = p;
      }, {}], 42: [function(P, se, R) {
        var M = P("./conventions"), E = P("./dom"), a = P("./entities"), g = P("./sax"), p = E.DOMImplementation, u = M.NAMESPACE, i = g.ParseError, e = g.XMLReader;
        function s(n) {
          return n.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028]/g, `
`);
        }
        function d(n) {
          this.options = n || { locator: {} };
        }
        d.prototype.parseFromString = function(n, r) {
          var m = this.options, T = new e(), z = m.domBuilder || new w(), I = m.errorHandler, A = m.locator, O = m.xmlns || {}, B = /\/x?html?$/.test(r), k = B ? a.HTML_ENTITIES : a.XML_ENTITIES;
          A && z.setDocumentLocator(A), T.errorHandler = v(I, z, A), T.domBuilder = m.domBuilder || z, B && (O[""] = u.HTML), O.xml = O.xml || u.XML;
          var W = m.normalizeLineEndings || s;
          return n && typeof n == "string" ? T.parse(
            W(n),
            O,
            k
          ) : T.errorHandler.error("invalid doc source"), z.doc;
        };
        function v(n, r, m) {
          if (!n) {
            if (r instanceof w)
              return r;
            n = r;
          }
          var T = {}, z = n instanceof Function;
          m = m || {};
          function I(A) {
            var O = n[A];
            !O && z && (O = n.length == 2 ? function(B) {
              n(A, B);
            } : n), T[A] = O && function(B) {
              O("[xmldom " + A + "]	" + B + h(m));
            } || function() {
            };
          }
          return I("warning"), I("error"), I("fatalError"), T;
        }
        function w() {
          this.cdata = !1;
        }
        function y(n, r) {
          r.lineNumber = n.lineNumber, r.columnNumber = n.columnNumber;
        }
        w.prototype = {
          startDocument: function() {
            this.doc = new p().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
          },
          startElement: function(n, r, m, T) {
            var z = this.doc, I = z.createElementNS(n, m || r), A = T.length;
            c(this, I), this.currentElement = I, this.locator && y(this.locator, I);
            for (var O = 0; O < A; O++) {
              var n = T.getURI(O), B = T.getValue(O), m = T.getQName(O), k = z.createAttributeNS(n, m);
              this.locator && y(T.getLocator(O), k), k.value = k.nodeValue = B, I.setAttributeNode(k);
            }
          },
          endElement: function(n, r, m) {
            var T = this.currentElement;
            T.tagName, this.currentElement = T.parentNode;
          },
          startPrefixMapping: function(n, r) {
          },
          endPrefixMapping: function(n) {
          },
          processingInstruction: function(n, r) {
            var m = this.doc.createProcessingInstruction(n, r);
            this.locator && y(this.locator, m), c(this, m);
          },
          ignorableWhitespace: function(n, r, m) {
          },
          characters: function(n, r, m) {
            if (n = _.apply(this, arguments), n) {
              if (this.cdata)
                var T = this.doc.createCDATASection(n);
              else
                var T = this.doc.createTextNode(n);
              this.currentElement ? this.currentElement.appendChild(T) : /^\s*$/.test(n) && this.doc.appendChild(T), this.locator && y(this.locator, T);
            }
          },
          skippedEntity: function(n) {
          },
          endDocument: function() {
            this.doc.normalize();
          },
          setDocumentLocator: function(n) {
            (this.locator = n) && (n.lineNumber = 0);
          },
          //LexicalHandler
          comment: function(n, r, m) {
            n = _.apply(this, arguments);
            var T = this.doc.createComment(n);
            this.locator && y(this.locator, T), c(this, T);
          },
          startCDATA: function() {
            this.cdata = !0;
          },
          endCDATA: function() {
            this.cdata = !1;
          },
          startDTD: function(n, r, m) {
            var T = this.doc.implementation;
            if (T && T.createDocumentType) {
              var z = T.createDocumentType(n, r, m);
              this.locator && y(this.locator, z), c(this, z), this.doc.doctype = z;
            }
          },
          /**
           * @see org.xml.sax.ErrorHandler
           * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
           */
          warning: function(n) {
            console.warn("[xmldom warning]	" + n, h(this.locator));
          },
          error: function(n) {
            console.error("[xmldom error]	" + n, h(this.locator));
          },
          fatalError: function(n) {
            throw new i(n, this.locator);
          }
        };
        function h(n) {
          if (n)
            return `
@` + (n.systemId || "") + "#[line:" + n.lineNumber + ",col:" + n.columnNumber + "]";
        }
        function _(n, r, m) {
          return typeof n == "string" ? n.substr(r, m) : n.length >= r + m || r ? new java.lang.String(n, r, m) + "" : n;
        }
        "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(n) {
          w.prototype[n] = function() {
            return null;
          };
        });
        function c(n, r) {
          n.currentElement ? n.currentElement.appendChild(r) : n.doc.appendChild(r);
        }
        R.__DOMHandler = w, R.normalizeLineEndings = s, R.DOMParser = d;
      }, { "./conventions": 41, "./dom": 43, "./entities": 44, "./sax": 46 }], 43: [function(P, se, R) {
        var M = P("./conventions"), E = M.find, a = M.NAMESPACE;
        function g(N) {
          return N !== "";
        }
        function p(N) {
          return N ? N.split(/[\t\n\f\r ]+/).filter(g) : [];
        }
        function u(N, L) {
          return N.hasOwnProperty(L) || (N[L] = !0), N;
        }
        function i(N) {
          if (!N) return [];
          var L = p(N);
          return Object.keys(L.reduce(u, {}));
        }
        function e(N) {
          return function(L) {
            return N && N.indexOf(L) !== -1;
          };
        }
        function s(N, L) {
          for (var Z in N)
            Object.prototype.hasOwnProperty.call(N, Z) && (L[Z] = N[Z]);
        }
        function d(N, L) {
          var Z = N.prototype;
          if (!(Z instanceof L)) {
            let oe = function() {
            };
            oe.prototype = L.prototype, oe = new oe(), s(Z, oe), N.prototype = Z = oe;
          }
          Z.constructor != N && (typeof N != "function" && console.error("unknown Class:" + N), Z.constructor = N);
        }
        var v = {}, w = v.ELEMENT_NODE = 1, y = v.ATTRIBUTE_NODE = 2, h = v.TEXT_NODE = 3, _ = v.CDATA_SECTION_NODE = 4, c = v.ENTITY_REFERENCE_NODE = 5, n = v.ENTITY_NODE = 6, r = v.PROCESSING_INSTRUCTION_NODE = 7, m = v.COMMENT_NODE = 8, T = v.DOCUMENT_NODE = 9, z = v.DOCUMENT_TYPE_NODE = 10, I = v.DOCUMENT_FRAGMENT_NODE = 11, A = v.NOTATION_NODE = 12, O = {}, B = {};
        O.INDEX_SIZE_ERR = (B[1] = "Index size error", 1), O.DOMSTRING_SIZE_ERR = (B[2] = "DOMString size error", 2);
        var k = O.HIERARCHY_REQUEST_ERR = (B[3] = "Hierarchy request error", 3);
        O.WRONG_DOCUMENT_ERR = (B[4] = "Wrong document", 4), O.INVALID_CHARACTER_ERR = (B[5] = "Invalid character", 5), O.NO_DATA_ALLOWED_ERR = (B[6] = "No data allowed", 6), O.NO_MODIFICATION_ALLOWED_ERR = (B[7] = "No modification allowed", 7);
        var W = O.NOT_FOUND_ERR = (B[8] = "Not found", 8);
        O.NOT_SUPPORTED_ERR = (B[9] = "Not supported", 9);
        var ee = O.INUSE_ATTRIBUTE_ERR = (B[10] = "Attribute in use", 10);
        O.INVALID_STATE_ERR = (B[11] = "Invalid state", 11), O.SYNTAX_ERR = (B[12] = "Syntax error", 12), O.INVALID_MODIFICATION_ERR = (B[13] = "Invalid modification", 13), O.NAMESPACE_ERR = (B[14] = "Invalid namespace", 14), O.INVALID_ACCESS_ERR = (B[15] = "Invalid access", 15);
        function F(N, L) {
          if (L instanceof Error)
            var Z = L;
          else
            Z = this, Error.call(this, B[N]), this.message = B[N], Error.captureStackTrace && Error.captureStackTrace(this, F);
          return Z.code = N, L && (this.message = this.message + ": " + L), Z;
        }
        F.prototype = Error.prototype, s(O, F);
        function Y() {
        }
        Y.prototype = {
          /**
           * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
           * @standard level1
           */
          length: 0,
          /**
           * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
           * @standard level1
           * @param index  unsigned long
           *   Index into the collection.
           * @return Node
           * 	The node at the indexth position in the NodeList, or null if that is not a valid index.
           */
          item: function(N) {
            return this[N] || null;
          },
          toString: function(N, L) {
            for (var Z = [], oe = 0; oe < this.length; oe++)
              Se(this[oe], Z, N, L);
            return Z.join("");
          },
          /**
           * @private
           * @param {function (Node):boolean} predicate
           * @returns {Node[]}
           */
          filter: function(N) {
            return Array.prototype.filter.call(this, N);
          },
          /**
           * @private
           * @param {Node} item
           * @returns {number}
           */
          indexOf: function(N) {
            return Array.prototype.indexOf.call(this, N);
          }
        };
        function x(N, L) {
          this._node = N, this._refresh = L, K(this);
        }
        function K(N) {
          var L = N._node._inc || N._node.ownerDocument._inc;
          if (N._inc != L) {
            var Z = N._refresh(N._node);
            Ue(N, "length", Z.length), s(Z, N), N._inc = L;
          }
        }
        x.prototype.item = function(N) {
          return K(this), this[N];
        }, d(x, Y);
        function pe() {
        }
        function ne(N, L) {
          for (var Z = N.length; Z--; )
            if (N[Z] === L)
              return Z;
        }
        function ce(N, L, Z, oe) {
          if (oe ? L[ne(L, oe)] = Z : L[L.length++] = Z, N) {
            Z.ownerElement = N;
            var ge = N.ownerDocument;
            ge && (oe && Re(ge, N, oe), le(ge, N, Z));
          }
        }
        function ie(N, L, Z) {
          var oe = ne(L, Z);
          if (oe >= 0) {
            for (var ge = L.length - 1; oe < ge; )
              L[oe] = L[++oe];
            if (L.length = ge, N) {
              var ke = N.ownerDocument;
              ke && (Re(ke, N, Z), Z.ownerElement = null);
            }
          } else
            throw new F(W, new Error(N.tagName + "@" + Z));
        }
        pe.prototype = {
          length: 0,
          item: Y.prototype.item,
          getNamedItem: function(N) {
            for (var L = this.length; L--; ) {
              var Z = this[L];
              if (Z.nodeName == N)
                return Z;
            }
          },
          setNamedItem: function(N) {
            var L = N.ownerElement;
            if (L && L != this._ownerElement)
              throw new F(ee);
            var Z = this.getNamedItem(N.nodeName);
            return ce(this._ownerElement, this, N, Z), Z;
          },
          /* returns Node */
          setNamedItemNS: function(N) {
            var L = N.ownerElement, Z;
            if (L && L != this._ownerElement)
              throw new F(ee);
            return Z = this.getNamedItemNS(N.namespaceURI, N.localName), ce(this._ownerElement, this, N, Z), Z;
          },
          /* returns Node */
          removeNamedItem: function(N) {
            var L = this.getNamedItem(N);
            return ie(this._ownerElement, this, L), L;
          },
          // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
          //for level2
          removeNamedItemNS: function(N, L) {
            var Z = this.getNamedItemNS(N, L);
            return ie(this._ownerElement, this, Z), Z;
          },
          getNamedItemNS: function(N, L) {
            for (var Z = this.length; Z--; ) {
              var oe = this[Z];
              if (oe.localName == L && oe.namespaceURI == N)
                return oe;
            }
            return null;
          }
        };
        function ye() {
        }
        ye.prototype = {
          /**
           * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
           * The different implementations fairly diverged in what kind of features were reported.
           * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
           *
           * @deprecated It is deprecated and modern browsers return true in all cases.
           *
           * @param {string} feature
           * @param {string} [version]
           * @returns {boolean} always true
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
           * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
           * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
           */
          hasFeature: function(N, L) {
            return !0;
          },
          /**
           * Creates an XML Document object of the specified type with its document element.
           *
           * __It behaves slightly different from the description in the living standard__:
           * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
           * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
           * - this implementation is not validating names or qualified names
           *   (when parsing XML strings, the SAX parser takes care of that)
           *
           * @param {string|null} namespaceURI
           * @param {string} qualifiedName
           * @param {DocumentType=null} doctype
           * @returns {Document}
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
           * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
           * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
           *
           * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
           * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
           * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
           */
          createDocument: function(N, L, Z) {
            var oe = new he();
            if (oe.implementation = this, oe.childNodes = new Y(), oe.doctype = Z || null, Z && oe.appendChild(Z), L) {
              var ge = oe.createElementNS(N, L);
              oe.appendChild(ge);
            }
            return oe;
          },
          /**
           * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
           *
           * __This behavior is slightly different from the in the specs__:
           * - this implementation is not validating names or qualified names
           *   (when parsing XML strings, the SAX parser takes care of that)
           *
           * @param {string} qualifiedName
           * @param {string} [publicId]
           * @param {string} [systemId]
           * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
           * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
           * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
           * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
           *
           * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
           * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
           * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
           */
          createDocumentType: function(N, L, Z) {
            var oe = new xe();
            return oe.name = N, oe.nodeName = N, oe.publicId = L || "", oe.systemId = Z || "", oe;
          }
        };
        function j() {
        }
        j.prototype = {
          firstChild: null,
          lastChild: null,
          previousSibling: null,
          nextSibling: null,
          attributes: null,
          parentNode: null,
          childNodes: null,
          ownerDocument: null,
          nodeValue: null,
          namespaceURI: null,
          prefix: null,
          localName: null,
          // Modified in DOM Level 2:
          insertBefore: function(N, L) {
            return t(this, N, L);
          },
          replaceChild: function(N, L) {
            t(this, N, L, l), L && this.removeChild(L);
          },
          removeChild: function(N) {
            return be(this, N);
          },
          appendChild: function(N) {
            return this.insertBefore(N, null);
          },
          hasChildNodes: function() {
            return this.firstChild != null;
          },
          cloneNode: function(N) {
            return Fe(this.ownerDocument || this, this, N);
          },
          // Modified in DOM Level 2:
          normalize: function() {
            for (var N = this.firstChild; N; ) {
              var L = N.nextSibling;
              L && L.nodeType == h && N.nodeType == h ? (this.removeChild(L), N.appendData(L.data)) : (N.normalize(), N = L);
            }
          },
          // Introduced in DOM Level 2:
          isSupported: function(N, L) {
            return this.ownerDocument.implementation.hasFeature(N, L);
          },
          // Introduced in DOM Level 2:
          hasAttributes: function() {
            return this.attributes.length > 0;
          },
          /**
           * Look up the prefix associated to the given namespace URI, starting from this node.
           * **The default namespace declarations are ignored by this method.**
           * See Namespace Prefix Lookup for details on the algorithm used by this method.
           *
           * _Note: The implementation seems to be incomplete when compared to the algorithm described in the specs._
           *
           * @param {string | null} namespaceURI
           * @returns {string | null}
           * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
           * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
           * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
           * @see https://github.com/xmldom/xmldom/issues/322
           */
          lookupPrefix: function(N) {
            for (var L = this; L; ) {
              var Z = L._nsMap;
              if (Z) {
                for (var oe in Z)
                  if (Object.prototype.hasOwnProperty.call(Z, oe) && Z[oe] === N)
                    return oe;
              }
              L = L.nodeType == y ? L.ownerDocument : L.parentNode;
            }
            return null;
          },
          // Introduced in DOM Level 3:
          lookupNamespaceURI: function(N) {
            for (var L = this; L; ) {
              var Z = L._nsMap;
              if (Z && Object.prototype.hasOwnProperty.call(Z, N))
                return Z[N];
              L = L.nodeType == y ? L.ownerDocument : L.parentNode;
            }
            return null;
          },
          // Introduced in DOM Level 3:
          isDefaultNamespace: function(N) {
            var L = this.lookupPrefix(N);
            return L == null;
          }
        };
        function Q(N) {
          return N == "<" && "&lt;" || N == ">" && "&gt;" || N == "&" && "&amp;" || N == '"' && "&quot;" || "&#" + N.charCodeAt() + ";";
        }
        s(v, j), s(v, j.prototype);
        function we(N, L) {
          if (L(N))
            return !0;
          if (N = N.firstChild)
            do
              if (we(N, L))
                return !0;
            while (N = N.nextSibling);
        }
        function he() {
          this.ownerDocument = this;
        }
        function le(N, L, Z) {
          N && N._inc++;
          var oe = Z.namespaceURI;
          oe === a.XMLNS && (L._nsMap[Z.prefix ? Z.localName : ""] = Z.value);
        }
        function Re(N, L, Z, oe) {
          N && N._inc++;
          var ge = Z.namespaceURI;
          ge === a.XMLNS && delete L._nsMap[Z.prefix ? Z.localName : ""];
        }
        function Ce(N, L, Z) {
          if (N && N._inc) {
            N._inc++;
            var oe = L.childNodes;
            if (Z)
              oe[oe.length++] = Z;
            else {
              for (var ge = L.firstChild, ke = 0; ge; )
                oe[ke++] = ge, ge = ge.nextSibling;
              oe.length = ke, delete oe[oe.length];
            }
          }
        }
        function be(N, L) {
          var Z = L.previousSibling, oe = L.nextSibling;
          return Z ? Z.nextSibling = oe : N.firstChild = oe, oe ? oe.previousSibling = Z : N.lastChild = Z, L.parentNode = null, L.previousSibling = null, L.nextSibling = null, Ce(N.ownerDocument, N), L;
        }
        function Te(N) {
          return N && (N.nodeType === j.DOCUMENT_NODE || N.nodeType === j.DOCUMENT_FRAGMENT_NODE || N.nodeType === j.ELEMENT_NODE);
        }
        function Ie(N) {
          return N && (Le(N) || Be(N) || De(N) || N.nodeType === j.DOCUMENT_FRAGMENT_NODE || N.nodeType === j.COMMENT_NODE || N.nodeType === j.PROCESSING_INSTRUCTION_NODE);
        }
        function De(N) {
          return N && N.nodeType === j.DOCUMENT_TYPE_NODE;
        }
        function Le(N) {
          return N && N.nodeType === j.ELEMENT_NODE;
        }
        function Be(N) {
          return N && N.nodeType === j.TEXT_NODE;
        }
        function f(N, L) {
          var Z = N.childNodes || [];
          if (E(Z, Le) || De(L))
            return !1;
          var oe = E(Z, De);
          return !(L && oe && Z.indexOf(oe) > Z.indexOf(L));
        }
        function $(N, L) {
          var Z = N.childNodes || [];
          function oe(ke) {
            return Le(ke) && ke !== L;
          }
          if (E(Z, oe))
            return !1;
          var ge = E(Z, De);
          return !(L && ge && Z.indexOf(ge) > Z.indexOf(L));
        }
        function V(N, L, Z) {
          if (!Te(N))
            throw new F(k, "Unexpected parent node type " + N.nodeType);
          if (Z && Z.parentNode !== N)
            throw new F(W, "child not in parent");
          if (
            // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
            !Ie(L) || // 5. If either `node` is a Text node and `parent` is a document,
            // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
            // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
            // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
            De(L) && N.nodeType !== j.DOCUMENT_NODE
          )
            throw new F(
              k,
              "Unexpected node type " + L.nodeType + " for parent node type " + N.nodeType
            );
        }
        function X(N, L, Z) {
          var oe = N.childNodes || [], ge = L.childNodes || [];
          if (L.nodeType === j.DOCUMENT_FRAGMENT_NODE) {
            var ke = ge.filter(Le);
            if (ke.length > 1 || E(ge, Be))
              throw new F(k, "More than one element or text in fragment");
            if (ke.length === 1 && !f(N, Z))
              throw new F(k, "Element in fragment can not be inserted before doctype");
          }
          if (Le(L) && !f(N, Z))
            throw new F(k, "Only one element can be added and only after doctype");
          if (De(L)) {
            if (E(oe, De))
              throw new F(k, "Only one doctype is allowed");
            var Pe = E(oe, Le);
            if (Z && oe.indexOf(Pe) < oe.indexOf(Z))
              throw new F(k, "Doctype can only be inserted before an element");
            if (!Z && Pe)
              throw new F(k, "Doctype can not be appended since element is present");
          }
        }
        function l(N, L, Z) {
          var oe = N.childNodes || [], ge = L.childNodes || [];
          if (L.nodeType === j.DOCUMENT_FRAGMENT_NODE) {
            var ke = ge.filter(Le);
            if (ke.length > 1 || E(ge, Be))
              throw new F(k, "More than one element or text in fragment");
            if (ke.length === 1 && !$(N, Z))
              throw new F(k, "Element in fragment can not be inserted before doctype");
          }
          if (Le(L) && !$(N, Z))
            throw new F(k, "Only one element can be added and only after doctype");
          if (De(L)) {
            if (E(oe, function($e) {
              return De($e) && $e !== Z;
            }))
              throw new F(k, "Only one doctype is allowed");
            var Pe = E(oe, Le);
            if (Z && oe.indexOf(Pe) < oe.indexOf(Z))
              throw new F(k, "Doctype can only be inserted before an element");
          }
        }
        function t(N, L, Z, oe) {
          V(N, L, Z), N.nodeType === j.DOCUMENT_NODE && (oe || X)(N, L, Z);
          var ge = L.parentNode;
          if (ge && ge.removeChild(L), L.nodeType === I) {
            var ke = L.firstChild;
            if (ke == null)
              return L;
            var Pe = L.lastChild;
          } else
            ke = Pe = L;
          var Ve = Z ? Z.previousSibling : N.lastChild;
          ke.previousSibling = Ve, Pe.nextSibling = Z, Ve ? Ve.nextSibling = ke : N.firstChild = ke, Z == null ? N.lastChild = Pe : Z.previousSibling = Pe;
          do
            ke.parentNode = N;
          while (ke !== Pe && (ke = ke.nextSibling));
          return Ce(N.ownerDocument || N, N), L.nodeType == I && (L.firstChild = L.lastChild = null), L;
        }
        function o(N, L) {
          return L.parentNode && L.parentNode.removeChild(L), L.parentNode = N, L.previousSibling = N.lastChild, L.nextSibling = null, L.previousSibling ? L.previousSibling.nextSibling = L : N.firstChild = L, N.lastChild = L, Ce(N.ownerDocument, N, L), L;
        }
        he.prototype = {
          //implementation : null,
          nodeName: "#document",
          nodeType: T,
          /**
           * The DocumentType node of the document.
           *
           * @readonly
           * @type DocumentType
           */
          doctype: null,
          documentElement: null,
          _inc: 1,
          insertBefore: function(N, L) {
            if (N.nodeType == I) {
              for (var Z = N.firstChild; Z; ) {
                var oe = Z.nextSibling;
                this.insertBefore(Z, L), Z = oe;
              }
              return N;
            }
            return t(this, N, L), N.ownerDocument = this, this.documentElement === null && N.nodeType === w && (this.documentElement = N), N;
          },
          removeChild: function(N) {
            return this.documentElement == N && (this.documentElement = null), be(this, N);
          },
          replaceChild: function(N, L) {
            t(this, N, L, l), N.ownerDocument = this, L && this.removeChild(L), Le(N) && (this.documentElement = N);
          },
          // Introduced in DOM Level 2:
          importNode: function(N, L) {
            return Me(this, N, L);
          },
          // Introduced in DOM Level 2:
          getElementById: function(N) {
            var L = null;
            return we(this.documentElement, function(Z) {
              if (Z.nodeType == w && Z.getAttribute("id") == N)
                return L = Z, !0;
            }), L;
          },
          /**
           * The `getElementsByClassName` method of `Document` interface returns an array-like object
           * of all child elements which have **all** of the given class name(s).
           *
           * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
           *
           *
           * Warning: This is a live LiveNodeList.
           * Changes in the DOM will reflect in the array as the changes occur.
           * If an element selected by this array no longer qualifies for the selector,
           * it will automatically be removed. Be aware of this for iteration purposes.
           *
           * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
           * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
           */
          getElementsByClassName: function(N) {
            var L = i(N);
            return new x(this, function(Z) {
              var oe = [];
              return L.length > 0 && we(Z.documentElement, function(ge) {
                if (ge !== Z && ge.nodeType === w) {
                  var ke = ge.getAttribute("class");
                  if (ke) {
                    var Pe = N === ke;
                    if (!Pe) {
                      var Ve = i(ke);
                      Pe = L.every(e(Ve));
                    }
                    Pe && oe.push(ge);
                  }
                }
              }), oe;
            });
          },
          //document factory method:
          createElement: function(N) {
            var L = new D();
            L.ownerDocument = this, L.nodeName = N, L.tagName = N, L.localName = N, L.childNodes = new Y();
            var Z = L.attributes = new pe();
            return Z._ownerElement = L, L;
          },
          createDocumentFragment: function() {
            var N = new Xe();
            return N.ownerDocument = this, N.childNodes = new Y(), N;
          },
          createTextNode: function(N) {
            var L = new te();
            return L.ownerDocument = this, L.appendData(N), L;
          },
          createComment: function(N) {
            var L = new ae();
            return L.ownerDocument = this, L.appendData(N), L;
          },
          createCDATASection: function(N) {
            var L = new de();
            return L.ownerDocument = this, L.appendData(N), L;
          },
          createProcessingInstruction: function(N, L) {
            var Z = new He();
            return Z.ownerDocument = this, Z.tagName = Z.target = N, Z.nodeValue = Z.data = L, Z;
          },
          createAttribute: function(N) {
            var L = new C();
            return L.ownerDocument = this, L.name = N, L.nodeName = N, L.localName = N, L.specified = !0, L;
          },
          createEntityReference: function(N) {
            var L = new ze();
            return L.ownerDocument = this, L.nodeName = N, L;
          },
          // Introduced in DOM Level 2:
          createElementNS: function(N, L) {
            var Z = new D(), oe = L.split(":"), ge = Z.attributes = new pe();
            return Z.childNodes = new Y(), Z.ownerDocument = this, Z.nodeName = L, Z.tagName = L, Z.namespaceURI = N, oe.length == 2 ? (Z.prefix = oe[0], Z.localName = oe[1]) : Z.localName = L, ge._ownerElement = Z, Z;
          },
          // Introduced in DOM Level 2:
          createAttributeNS: function(N, L) {
            var Z = new C(), oe = L.split(":");
            return Z.ownerDocument = this, Z.nodeName = L, Z.name = L, Z.namespaceURI = N, Z.specified = !0, oe.length == 2 ? (Z.prefix = oe[0], Z.localName = oe[1]) : Z.localName = L, Z;
          }
        }, d(he, j);
        function D() {
          this._nsMap = {};
        }
        D.prototype = {
          nodeType: w,
          hasAttribute: function(N) {
            return this.getAttributeNode(N) != null;
          },
          getAttribute: function(N) {
            var L = this.getAttributeNode(N);
            return L && L.value || "";
          },
          getAttributeNode: function(N) {
            return this.attributes.getNamedItem(N);
          },
          setAttribute: function(N, L) {
            var Z = this.ownerDocument.createAttribute(N);
            Z.value = Z.nodeValue = "" + L, this.setAttributeNode(Z);
          },
          removeAttribute: function(N) {
            var L = this.getAttributeNode(N);
            L && this.removeAttributeNode(L);
          },
          //four real opeartion method
          appendChild: function(N) {
            return N.nodeType === I ? this.insertBefore(N, null) : o(this, N);
          },
          setAttributeNode: function(N) {
            return this.attributes.setNamedItem(N);
          },
          setAttributeNodeNS: function(N) {
            return this.attributes.setNamedItemNS(N);
          },
          removeAttributeNode: function(N) {
            return this.attributes.removeNamedItem(N.nodeName);
          },
          //get real attribute name,and remove it by removeAttributeNode
          removeAttributeNS: function(N, L) {
            var Z = this.getAttributeNodeNS(N, L);
            Z && this.removeAttributeNode(Z);
          },
          hasAttributeNS: function(N, L) {
            return this.getAttributeNodeNS(N, L) != null;
          },
          getAttributeNS: function(N, L) {
            var Z = this.getAttributeNodeNS(N, L);
            return Z && Z.value || "";
          },
          setAttributeNS: function(N, L, Z) {
            var oe = this.ownerDocument.createAttributeNS(N, L);
            oe.value = oe.nodeValue = "" + Z, this.setAttributeNode(oe);
          },
          getAttributeNodeNS: function(N, L) {
            return this.attributes.getNamedItemNS(N, L);
          },
          getElementsByTagName: function(N) {
            return new x(this, function(L) {
              var Z = [];
              return we(L, function(oe) {
                oe !== L && oe.nodeType == w && (N === "*" || oe.tagName == N) && Z.push(oe);
              }), Z;
            });
          },
          getElementsByTagNameNS: function(N, L) {
            return new x(this, function(Z) {
              var oe = [];
              return we(Z, function(ge) {
                ge !== Z && ge.nodeType === w && (N === "*" || ge.namespaceURI === N) && (L === "*" || ge.localName == L) && oe.push(ge);
              }), oe;
            });
          }
        }, he.prototype.getElementsByTagName = D.prototype.getElementsByTagName, he.prototype.getElementsByTagNameNS = D.prototype.getElementsByTagNameNS, d(D, j);
        function C() {
        }
        C.prototype.nodeType = y, d(C, j);
        function G() {
        }
        G.prototype = {
          data: "",
          substringData: function(N, L) {
            return this.data.substring(N, N + L);
          },
          appendData: function(N) {
            N = this.data + N, this.nodeValue = this.data = N, this.length = N.length;
          },
          insertData: function(N, L) {
            this.replaceData(N, 0, L);
          },
          appendChild: function(N) {
            throw new Error(B[k]);
          },
          deleteData: function(N, L) {
            this.replaceData(N, L, "");
          },
          replaceData: function(N, L, Z) {
            var oe = this.data.substring(0, N), ge = this.data.substring(N + L);
            Z = oe + Z + ge, this.nodeValue = this.data = Z, this.length = Z.length;
          }
        }, d(G, j);
        function te() {
        }
        te.prototype = {
          nodeName: "#text",
          nodeType: h,
          splitText: function(N) {
            var L = this.data, Z = L.substring(N);
            L = L.substring(0, N), this.data = this.nodeValue = L, this.length = L.length;
            var oe = this.ownerDocument.createTextNode(Z);
            return this.parentNode && this.parentNode.insertBefore(oe, this.nextSibling), oe;
          }
        }, d(te, G);
        function ae() {
        }
        ae.prototype = {
          nodeName: "#comment",
          nodeType: m
        }, d(ae, G);
        function de() {
        }
        de.prototype = {
          nodeName: "#cdata-section",
          nodeType: _
        }, d(de, G);
        function xe() {
        }
        xe.prototype.nodeType = z, d(xe, j);
        function me() {
        }
        me.prototype.nodeType = A, d(me, j);
        function Ae() {
        }
        Ae.prototype.nodeType = n, d(Ae, j);
        function ze() {
        }
        ze.prototype.nodeType = c, d(ze, j);
        function Xe() {
        }
        Xe.prototype.nodeName = "#document-fragment", Xe.prototype.nodeType = I, d(Xe, j);
        function He() {
        }
        He.prototype.nodeType = r, d(He, j);
        function re() {
        }
        re.prototype.serializeToString = function(N, L, Z) {
          return fe.call(N, L, Z);
        }, j.prototype.toString = fe;
        function fe(N, L) {
          var Z = [], oe = this.nodeType == 9 && this.documentElement || this, ge = oe.prefix, ke = oe.namespaceURI;
          if (ke && ge == null) {
            var ge = oe.lookupPrefix(ke);
            if (ge == null)
              var Pe = [
                { namespace: ke, prefix: null }
                //{namespace:uri,prefix:''}
              ];
          }
          return Se(this, Z, N, L, Pe), Z.join("");
        }
        function _e(N, L, Z) {
          var oe = N.prefix || "", ge = N.namespaceURI;
          if (!ge || oe === "xml" && ge === a.XML || ge === a.XMLNS)
            return !1;
          for (var ke = Z.length; ke--; ) {
            var Pe = Z[ke];
            if (Pe.prefix === oe)
              return Pe.namespace !== ge;
          }
          return !0;
        }
        function Ee(N, L, Z) {
          N.push(" ", L, '="', Z.replace(/[<>&"\t\n\r]/g, Q), '"');
        }
        function Se(N, L, Z, oe, ge) {
          if (ge || (ge = []), oe)
            if (N = oe(N), N) {
              if (typeof N == "string") {
                L.push(N);
                return;
              }
            } else
              return;
          switch (N.nodeType) {
            case w:
              var ke = N.attributes, Pe = ke.length, We = N.firstChild, Ve = N.tagName;
              Z = a.isHTML(N.namespaceURI) || Z;
              var $e = Ve;
              if (!Z && !N.prefix && N.namespaceURI) {
                for (var Je, Ke = 0; Ke < ke.length; Ke++)
                  if (ke.item(Ke).name === "xmlns") {
                    Je = ke.item(Ke).value;
                    break;
                  }
                if (!Je)
                  for (var et = ge.length - 1; et >= 0; et--) {
                    var Qe = ge[et];
                    if (Qe.prefix === "" && Qe.namespace === N.namespaceURI) {
                      Je = Qe.namespace;
                      break;
                    }
                  }
                if (Je !== N.namespaceURI)
                  for (var et = ge.length - 1; et >= 0; et--) {
                    var Qe = ge[et];
                    if (Qe.namespace === N.namespaceURI) {
                      Qe.prefix && ($e = Qe.prefix + ":" + Ve);
                      break;
                    }
                  }
              }
              L.push("<", $e);
              for (var tt = 0; tt < Pe; tt++) {
                var qe = ke.item(tt);
                qe.prefix == "xmlns" ? ge.push({ prefix: qe.localName, namespace: qe.value }) : qe.nodeName == "xmlns" && ge.push({ prefix: "", namespace: qe.value });
              }
              for (var tt = 0; tt < Pe; tt++) {
                var qe = ke.item(tt);
                if (_e(qe, Z, ge)) {
                  var rt = qe.prefix || "", ut = qe.namespaceURI;
                  Ee(L, rt ? "xmlns:" + rt : "xmlns", ut), ge.push({ prefix: rt, namespace: ut });
                }
                Se(qe, L, Z, oe, ge);
              }
              if (Ve === $e && _e(N, Z, ge)) {
                var rt = N.prefix || "", ut = N.namespaceURI;
                Ee(L, rt ? "xmlns:" + rt : "xmlns", ut), ge.push({ prefix: rt, namespace: ut });
              }
              if (We || Z && !/^(?:meta|link|img|br|hr|input)$/i.test(Ve)) {
                if (L.push(">"), Z && /^script$/i.test(Ve))
                  for (; We; )
                    We.data ? L.push(We.data) : Se(We, L, Z, oe, ge.slice()), We = We.nextSibling;
                else
                  for (; We; )
                    Se(We, L, Z, oe, ge.slice()), We = We.nextSibling;
                L.push("</", $e, ">");
              } else
                L.push("/>");
              return;
            case T:
            case I:
              for (var We = N.firstChild; We; )
                Se(We, L, Z, oe, ge.slice()), We = We.nextSibling;
              return;
            case y:
              return Ee(L, N.name, N.value);
            case h:
              return L.push(
                N.data.replace(/[<&>]/g, Q)
              );
            case _:
              return L.push("<![CDATA[", N.data, "]]>");
            case m:
              return L.push("<!--", N.data, "-->");
            case z:
              var vt = N.publicId, it = N.systemId;
              if (L.push("<!DOCTYPE ", N.name), vt)
                L.push(" PUBLIC ", vt), it && it != "." && L.push(" ", it), L.push(">");
              else if (it && it != ".")
                L.push(" SYSTEM ", it, ">");
              else {
                var st = N.internalSubset;
                st && L.push(" [", st, "]"), L.push(">");
              }
              return;
            case r:
              return L.push("<?", N.target, " ", N.data, "?>");
            case c:
              return L.push("&", N.nodeName, ";");
            //case ENTITY_NODE:
            //case NOTATION_NODE:
            default:
              L.push("??", N.nodeName);
          }
        }
        function Me(N, L, Z) {
          var oe;
          switch (L.nodeType) {
            case w:
              oe = L.cloneNode(!1), oe.ownerDocument = N;
            //var attrs = node2.attributes;
            //var len = attrs.length;
            //for(var i=0;i<len;i++){
            //node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
            //}
            case I:
              break;
            case y:
              Z = !0;
              break;
          }
          if (oe || (oe = L.cloneNode(!1)), oe.ownerDocument = N, oe.parentNode = null, Z)
            for (var ge = L.firstChild; ge; )
              oe.appendChild(Me(N, ge, Z)), ge = ge.nextSibling;
          return oe;
        }
        function Fe(N, L, Z) {
          var oe = new L.constructor();
          for (var ge in L)
            if (Object.prototype.hasOwnProperty.call(L, ge)) {
              var ke = L[ge];
              typeof ke != "object" && ke != oe[ge] && (oe[ge] = ke);
            }
          switch (L.childNodes && (oe.childNodes = new Y()), oe.ownerDocument = N, oe.nodeType) {
            case w:
              var Pe = L.attributes, Ve = oe.attributes = new pe(), $e = Pe.length;
              Ve._ownerElement = oe;
              for (var Je = 0; Je < $e; Je++)
                oe.setAttributeNode(Fe(N, Pe.item(Je), !0));
              break;
            case y:
              Z = !0;
          }
          if (Z)
            for (var Ke = L.firstChild; Ke; )
              oe.appendChild(Fe(N, Ke, Z)), Ke = Ke.nextSibling;
          return oe;
        }
        function Ue(N, L, Z) {
          N[L] = Z;
        }
        try {
          if (Object.defineProperty) {
            let N = function(L) {
              switch (L.nodeType) {
                case w:
                case I:
                  var Z = [];
                  for (L = L.firstChild; L; )
                    L.nodeType !== 7 && L.nodeType !== 8 && Z.push(N(L)), L = L.nextSibling;
                  return Z.join("");
                default:
                  return L.nodeValue;
              }
            };
            Object.defineProperty(x.prototype, "length", {
              get: function() {
                return K(this), this.$$length;
              }
            }), Object.defineProperty(j.prototype, "textContent", {
              get: function() {
                return N(this);
              },
              set: function(L) {
                switch (this.nodeType) {
                  case w:
                  case I:
                    for (; this.firstChild; )
                      this.removeChild(this.firstChild);
                    (L || String(L)) && this.appendChild(this.ownerDocument.createTextNode(L));
                    break;
                  default:
                    this.data = L, this.value = L, this.nodeValue = L;
                }
              }
            }), Ue = function(L, Z, oe) {
              L["$$" + Z] = oe;
            };
          }
        } catch {
        }
        R.DocumentType = xe, R.DOMException = F, R.DOMImplementation = ye, R.Element = D, R.Node = j, R.NodeList = Y, R.XMLSerializer = re;
      }, { "./conventions": 41 }], 44: [function(P, se, R) {
        var M = P("./conventions").freeze;
        R.XML_ENTITIES = M({ amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }), R.HTML_ENTITIES = M({
          lt: "<",
          gt: ">",
          amp: "&",
          quot: '"',
          apos: "'",
          Agrave: "À",
          Aacute: "Á",
          Acirc: "Â",
          Atilde: "Ã",
          Auml: "Ä",
          Aring: "Å",
          AElig: "Æ",
          Ccedil: "Ç",
          Egrave: "È",
          Eacute: "É",
          Ecirc: "Ê",
          Euml: "Ë",
          Igrave: "Ì",
          Iacute: "Í",
          Icirc: "Î",
          Iuml: "Ï",
          ETH: "Ð",
          Ntilde: "Ñ",
          Ograve: "Ò",
          Oacute: "Ó",
          Ocirc: "Ô",
          Otilde: "Õ",
          Ouml: "Ö",
          Oslash: "Ø",
          Ugrave: "Ù",
          Uacute: "Ú",
          Ucirc: "Û",
          Uuml: "Ü",
          Yacute: "Ý",
          THORN: "Þ",
          szlig: "ß",
          agrave: "à",
          aacute: "á",
          acirc: "â",
          atilde: "ã",
          auml: "ä",
          aring: "å",
          aelig: "æ",
          ccedil: "ç",
          egrave: "è",
          eacute: "é",
          ecirc: "ê",
          euml: "ë",
          igrave: "ì",
          iacute: "í",
          icirc: "î",
          iuml: "ï",
          eth: "ð",
          ntilde: "ñ",
          ograve: "ò",
          oacute: "ó",
          ocirc: "ô",
          otilde: "õ",
          ouml: "ö",
          oslash: "ø",
          ugrave: "ù",
          uacute: "ú",
          ucirc: "û",
          uuml: "ü",
          yacute: "ý",
          thorn: "þ",
          yuml: "ÿ",
          nbsp: " ",
          iexcl: "¡",
          cent: "¢",
          pound: "£",
          curren: "¤",
          yen: "¥",
          brvbar: "¦",
          sect: "§",
          uml: "¨",
          copy: "©",
          ordf: "ª",
          laquo: "«",
          not: "¬",
          shy: "­­",
          reg: "®",
          macr: "¯",
          deg: "°",
          plusmn: "±",
          sup2: "²",
          sup3: "³",
          acute: "´",
          micro: "µ",
          para: "¶",
          middot: "·",
          cedil: "¸",
          sup1: "¹",
          ordm: "º",
          raquo: "»",
          frac14: "¼",
          frac12: "½",
          frac34: "¾",
          iquest: "¿",
          times: "×",
          divide: "÷",
          forall: "∀",
          part: "∂",
          exist: "∃",
          empty: "∅",
          nabla: "∇",
          isin: "∈",
          notin: "∉",
          ni: "∋",
          prod: "∏",
          sum: "∑",
          minus: "−",
          lowast: "∗",
          radic: "√",
          prop: "∝",
          infin: "∞",
          ang: "∠",
          and: "∧",
          or: "∨",
          cap: "∩",
          cup: "∪",
          int: "∫",
          there4: "∴",
          sim: "∼",
          cong: "≅",
          asymp: "≈",
          ne: "≠",
          equiv: "≡",
          le: "≤",
          ge: "≥",
          sub: "⊂",
          sup: "⊃",
          nsub: "⊄",
          sube: "⊆",
          supe: "⊇",
          oplus: "⊕",
          otimes: "⊗",
          perp: "⊥",
          sdot: "⋅",
          Alpha: "Α",
          Beta: "Β",
          Gamma: "Γ",
          Delta: "Δ",
          Epsilon: "Ε",
          Zeta: "Ζ",
          Eta: "Η",
          Theta: "Θ",
          Iota: "Ι",
          Kappa: "Κ",
          Lambda: "Λ",
          Mu: "Μ",
          Nu: "Ν",
          Xi: "Ξ",
          Omicron: "Ο",
          Pi: "Π",
          Rho: "Ρ",
          Sigma: "Σ",
          Tau: "Τ",
          Upsilon: "Υ",
          Phi: "Φ",
          Chi: "Χ",
          Psi: "Ψ",
          Omega: "Ω",
          alpha: "α",
          beta: "β",
          gamma: "γ",
          delta: "δ",
          epsilon: "ε",
          zeta: "ζ",
          eta: "η",
          theta: "θ",
          iota: "ι",
          kappa: "κ",
          lambda: "λ",
          mu: "μ",
          nu: "ν",
          xi: "ξ",
          omicron: "ο",
          pi: "π",
          rho: "ρ",
          sigmaf: "ς",
          sigma: "σ",
          tau: "τ",
          upsilon: "υ",
          phi: "φ",
          chi: "χ",
          psi: "ψ",
          omega: "ω",
          thetasym: "ϑ",
          upsih: "ϒ",
          piv: "ϖ",
          OElig: "Œ",
          oelig: "œ",
          Scaron: "Š",
          scaron: "š",
          Yuml: "Ÿ",
          fnof: "ƒ",
          circ: "ˆ",
          tilde: "˜",
          ensp: " ",
          emsp: " ",
          thinsp: " ",
          zwnj: "‌",
          zwj: "‍",
          lrm: "‎",
          rlm: "‏",
          ndash: "–",
          mdash: "—",
          lsquo: "‘",
          rsquo: "’",
          sbquo: "‚",
          ldquo: "“",
          rdquo: "”",
          bdquo: "„",
          dagger: "†",
          Dagger: "‡",
          bull: "•",
          hellip: "…",
          permil: "‰",
          prime: "′",
          Prime: "″",
          lsaquo: "‹",
          rsaquo: "›",
          oline: "‾",
          euro: "€",
          trade: "™",
          larr: "←",
          uarr: "↑",
          rarr: "→",
          darr: "↓",
          harr: "↔",
          crarr: "↵",
          lceil: "⌈",
          rceil: "⌉",
          lfloor: "⌊",
          rfloor: "⌋",
          loz: "◊",
          spades: "♠",
          clubs: "♣",
          hearts: "♥",
          diams: "♦"
        }), R.entityMap = R.HTML_ENTITIES;
      }, { "./conventions": 41 }], 45: [function(P, se, R) {
        var M = P("./dom");
        R.DOMImplementation = M.DOMImplementation, R.XMLSerializer = M.XMLSerializer, R.DOMParser = P("./dom-parser").DOMParser;
      }, { "./dom": 43, "./dom-parser": 42 }], 46: [function(P, se, R) {
        var M = P("./conventions").NAMESPACE, E = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, a = new RegExp("[\\-\\.0-9" + E.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), g = new RegExp("^" + E.source + a.source + "*(?::" + E.source + a.source + "*)?$"), p = 0, u = 1, i = 2, e = 3, s = 4, d = 5, v = 6, w = 7;
        function y(k, W) {
          this.message = k, this.locator = W, Error.captureStackTrace && Error.captureStackTrace(this, y);
        }
        y.prototype = new Error(), y.prototype.name = y.name;
        function h() {
        }
        h.prototype = {
          parse: function(k, W, ee) {
            var F = this.domBuilder;
            F.startDocument(), z(W, W = {}), _(
              k,
              W,
              ee,
              F,
              this.errorHandler
            ), F.endDocument();
          }
        };
        function _(k, W, ee, F, Y) {
          function x(D) {
            if (D > 65535) {
              D -= 65536;
              var C = 55296 + (D >> 10), G = 56320 + (D & 1023);
              return String.fromCharCode(C, G);
            } else
              return String.fromCharCode(D);
          }
          function K(D) {
            var C = D.slice(1, -1);
            return Object.hasOwnProperty.call(ee, C) ? ee[C] : C.charAt(0) === "#" ? x(parseInt(C.substr(1).replace("x", "0x"))) : (Y.error("entity not found:" + D), D);
          }
          function pe(D) {
            if (D > he) {
              var C = k.substring(he, D).replace(/&#?\w+;/g, K);
              j && ne(he), F.characters(C, 0, D - he), he = D;
            }
          }
          function ne(D, C) {
            for (; D >= ie && (C = ye.exec(k)); )
              ce = C.index, ie = ce + C[0].length, j.lineNumber++;
            j.columnNumber = D - ce + 1;
          }
          for (var ce = 0, ie = 0, ye = /.*(?:\r\n?|\n)|.*$/g, j = F.locator, Q = [{ currentNSMap: W }], we = {}, he = 0; ; ) {
            try {
              var le = k.indexOf("<", he);
              if (le < 0) {
                if (!k.substr(he).match(/^\s*$/)) {
                  var Re = F.doc, Ce = Re.createTextNode(k.substr(he));
                  Re.appendChild(Ce), F.currentElement = Ce;
                }
                return;
              }
              switch (le > he && pe(le), k.charAt(le + 1)) {
                case "/":
                  var V = k.indexOf(">", le + 3), be = k.substring(le + 2, V).replace(/[ \t\n\r]+$/g, ""), Te = Q.pop();
                  V < 0 ? (be = k.substring(le + 2).replace(/[\s<].*/, ""), Y.error("end tag name: " + be + " is not complete:" + Te.tagName), V = le + 1 + be.length) : be.match(/\s</) && (be = be.replace(/[\s<].*/, ""), Y.error("end tag name: " + be + " maybe not complete"), V = le + 1 + be.length);
                  var Ie = Te.localNSMap, De = Te.tagName == be, Le = De || Te.tagName && Te.tagName.toLowerCase() == be.toLowerCase();
                  if (Le) {
                    if (F.endElement(Te.uri, Te.localName, be), Ie)
                      for (var Be in Ie)
                        Object.prototype.hasOwnProperty.call(Ie, Be) && F.endPrefixMapping(Be);
                    De || Y.fatalError("end tag name: " + be + " is not match the current start tagName:" + Te.tagName);
                  } else
                    Q.push(Te);
                  V++;
                  break;
                // end elment
                case "?":
                  j && ne(le), V = A(k, le, F);
                  break;
                case "!":
                  j && ne(le), V = I(k, le, F, Y);
                  break;
                default:
                  j && ne(le);
                  var f = new O(), $ = Q[Q.length - 1].currentNSMap, V = n(k, le, f, $, K, Y), X = f.length;
                  if (!f.closed && T(k, V, f.tagName, we) && (f.closed = !0, ee.nbsp || Y.warning("unclosed xml attribute")), j && X) {
                    for (var l = c(j, {}), t = 0; t < X; t++) {
                      var o = f[t];
                      ne(o.offset), o.locator = c(j, {});
                    }
                    F.locator = l, r(f, F, $) && Q.push(f), F.locator = j;
                  } else
                    r(f, F, $) && Q.push(f);
                  M.isHTML(f.uri) && !f.closed ? V = m(k, V, f.tagName, K, F) : V++;
              }
            } catch (D) {
              if (D instanceof y)
                throw D;
              Y.error("element parse error: " + D), V = -1;
            }
            V > he ? he = V : pe(Math.max(le, he) + 1);
          }
        }
        function c(k, W) {
          return W.lineNumber = k.lineNumber, W.columnNumber = k.columnNumber, W;
        }
        function n(k, W, ee, F, Y, x) {
          function K(j, Q, we) {
            ee.attributeNames.hasOwnProperty(j) && x.fatalError("Attribute " + j + " redefined"), ee.addValue(
              j,
              // @see https://www.w3.org/TR/xml/#AVNormalize
              // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
              // - recursive replacement of (DTD) entity references
              // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
              Q.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, Y),
              we
            );
          }
          for (var pe, ne, ce = ++W, ie = p; ; ) {
            var ye = k.charAt(ce);
            switch (ye) {
              case "=":
                if (ie === u)
                  pe = k.slice(W, ce), ie = e;
                else if (ie === i)
                  ie = e;
                else
                  throw new Error("attribute equal must after attrName");
                break;
              case "'":
              case '"':
                if (ie === e || ie === u)
                  if (ie === u && (x.warning('attribute value must after "="'), pe = k.slice(W, ce)), W = ce + 1, ce = k.indexOf(ye, W), ce > 0)
                    ne = k.slice(W, ce), K(pe, ne, W - 1), ie = d;
                  else
                    throw new Error("attribute value no end '" + ye + "' match");
                else if (ie == s)
                  ne = k.slice(W, ce), K(pe, ne, W), x.warning('attribute "' + pe + '" missed start quot(' + ye + ")!!"), W = ce + 1, ie = d;
                else
                  throw new Error('attribute value must after "="');
                break;
              case "/":
                switch (ie) {
                  case p:
                    ee.setTagName(k.slice(W, ce));
                  case d:
                  case v:
                  case w:
                    ie = w, ee.closed = !0;
                  case s:
                  case u:
                  case i:
                    break;
                  //case S_EQ:
                  default:
                    throw new Error("attribute invalid close char('/')");
                }
                break;
              case "":
                return x.error("unexpected end of input"), ie == p && ee.setTagName(k.slice(W, ce)), ce;
              case ">":
                switch (ie) {
                  case p:
                    ee.setTagName(k.slice(W, ce));
                  case d:
                  case v:
                  case w:
                    break;
                  //normal
                  case s:
                  //Compatible state
                  case u:
                    ne = k.slice(W, ce), ne.slice(-1) === "/" && (ee.closed = !0, ne = ne.slice(0, -1));
                  case i:
                    ie === i && (ne = pe), ie == s ? (x.warning('attribute "' + ne + '" missed quot(")!'), K(pe, ne, W)) : ((!M.isHTML(F[""]) || !ne.match(/^(?:disabled|checked|selected)$/i)) && x.warning('attribute "' + ne + '" missed value!! "' + ne + '" instead!!'), K(ne, ne, W));
                    break;
                  case e:
                    throw new Error("attribute value missed!!");
                }
                return ce;
              /*xml space '\x20' | #x9 | #xD | #xA; */
              case "":
                ye = " ";
              default:
                if (ye <= " ")
                  switch (ie) {
                    case p:
                      ee.setTagName(k.slice(W, ce)), ie = v;
                      break;
                    case u:
                      pe = k.slice(W, ce), ie = i;
                      break;
                    case s:
                      var ne = k.slice(W, ce);
                      x.warning('attribute "' + ne + '" missed quot(")!!'), K(pe, ne, W);
                    case d:
                      ie = v;
                      break;
                  }
                else
                  switch (ie) {
                    //case S_TAG:void();break;
                    //case S_ATTR:void();break;
                    //case S_ATTR_NOQUOT_VALUE:void();break;
                    case i:
                      ee.tagName, (!M.isHTML(F[""]) || !pe.match(/^(?:disabled|checked|selected)$/i)) && x.warning('attribute "' + pe + '" missed value!! "' + pe + '" instead2!!'), K(pe, pe, W), W = ce, ie = u;
                      break;
                    case d:
                      x.warning('attribute space is required"' + pe + '"!!');
                    case v:
                      ie = u, W = ce;
                      break;
                    case e:
                      ie = s, W = ce;
                      break;
                    case w:
                      throw new Error("elements closed character '/' and '>' must be connected to");
                  }
            }
            ce++;
          }
        }
        function r(k, W, ee) {
          for (var F = k.tagName, Y = null, ye = k.length; ye--; ) {
            var x = k[ye], K = x.qName, pe = x.value, j = K.indexOf(":");
            if (j > 0)
              var ne = x.prefix = K.slice(0, j), ce = K.slice(j + 1), ie = ne === "xmlns" && ce;
            else
              ce = K, ne = null, ie = K === "xmlns" && "";
            x.localName = ce, ie !== !1 && (Y == null && (Y = {}, z(ee, ee = {})), ee[ie] = Y[ie] = pe, x.uri = M.XMLNS, W.startPrefixMapping(ie, pe));
          }
          for (var ye = k.length; ye--; ) {
            x = k[ye];
            var ne = x.prefix;
            ne && (ne === "xml" && (x.uri = M.XML), ne !== "xmlns" && (x.uri = ee[ne || ""]));
          }
          var j = F.indexOf(":");
          j > 0 ? (ne = k.prefix = F.slice(0, j), ce = k.localName = F.slice(j + 1)) : (ne = null, ce = k.localName = F);
          var Q = k.uri = ee[ne || ""];
          if (W.startElement(Q, ce, F, k), k.closed) {
            if (W.endElement(Q, ce, F), Y)
              for (ne in Y)
                Object.prototype.hasOwnProperty.call(Y, ne) && W.endPrefixMapping(ne);
          } else
            return k.currentNSMap = ee, k.localNSMap = Y, !0;
        }
        function m(k, W, ee, F, Y) {
          if (/^(?:script|textarea)$/i.test(ee)) {
            var x = k.indexOf("</" + ee + ">", W), K = k.substring(W + 1, x);
            if (/[&<]/.test(K))
              return /^script$/i.test(ee) ? (Y.characters(K, 0, K.length), x) : (K = K.replace(/&#?\w+;/g, F), Y.characters(K, 0, K.length), x);
          }
          return W + 1;
        }
        function T(k, W, ee, F) {
          var Y = F[ee];
          return Y == null && (Y = k.lastIndexOf("</" + ee + ">"), Y < W && (Y = k.lastIndexOf("</" + ee)), F[ee] = Y), Y < W;
        }
        function z(k, W) {
          for (var ee in k)
            Object.prototype.hasOwnProperty.call(k, ee) && (W[ee] = k[ee]);
        }
        function I(k, W, ee, F) {
          var Y = k.charAt(W + 2);
          switch (Y) {
            case "-":
              if (k.charAt(W + 3) === "-") {
                var x = k.indexOf("-->", W + 4);
                return x > W ? (ee.comment(k, W + 4, x - W - 4), x + 3) : (F.error("Unclosed comment"), -1);
              } else
                return -1;
            default:
              if (k.substr(W + 3, 6) == "CDATA[") {
                var x = k.indexOf("]]>", W + 9);
                return ee.startCDATA(), ee.characters(k, W + 9, x - W - 9), ee.endCDATA(), x + 3;
              }
              var K = B(k, W), pe = K.length;
              if (pe > 1 && /!doctype/i.test(K[0][0])) {
                var ne = K[1][0], ce = !1, ie = !1;
                pe > 3 && (/^public$/i.test(K[2][0]) ? (ce = K[3][0], ie = pe > 4 && K[4][0]) : /^system$/i.test(K[2][0]) && (ie = K[3][0]));
                var ye = K[pe - 1];
                return ee.startDTD(ne, ce, ie), ee.endDTD(), ye.index + ye[0].length;
              }
          }
          return -1;
        }
        function A(k, W, ee) {
          var F = k.indexOf("?>", W);
          if (F) {
            var Y = k.substring(W, F).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
            return Y ? (Y[0].length, ee.processingInstruction(Y[1], Y[2]), F + 2) : -1;
          }
          return -1;
        }
        function O() {
          this.attributeNames = {};
        }
        O.prototype = {
          setTagName: function(k) {
            if (!g.test(k))
              throw new Error("invalid tagName:" + k);
            this.tagName = k;
          },
          addValue: function(k, W, ee) {
            if (!g.test(k))
              throw new Error("invalid attribute:" + k);
            this.attributeNames[k] = this.length, this[this.length++] = { qName: k, value: W, offset: ee };
          },
          length: 0,
          getLocalName: function(k) {
            return this[k].localName;
          },
          getLocator: function(k) {
            return this[k].locator;
          },
          getQName: function(k) {
            return this[k].qName;
          },
          getURI: function(k) {
            return this[k].uri;
          },
          getValue: function(k) {
            return this[k].value;
          }
          //	,getIndex:function(uri, localName)){
          //		if(localName){
          //
          //		}else{
          //			var qName = uri
          //		}
          //	},
          //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
          //	getType:function(uri,localName){}
          //	getType:function(i){},
        };
        function B(k, W) {
          var ee, F = [], Y = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
          for (Y.lastIndex = W, Y.exec(k); ee = Y.exec(k); )
            if (F.push(ee), ee[1]) return F;
        }
        R.XMLReader = h, R.ParseError = y;
      }, { "./conventions": 41 }], 47: [function(P, se, R) {
        R.byteLength = e, R.toByteArray = d, R.fromByteArray = y;
        for (var M = [], E = [], a = typeof Uint8Array < "u" ? Uint8Array : Array, g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", p = 0, u = g.length; p < u; ++p)
          M[p] = g[p], E[g.charCodeAt(p)] = p;
        E[45] = 62, E[95] = 63;
        function i(h) {
          var _ = h.length;
          if (_ % 4 > 0)
            throw new Error("Invalid string. Length must be a multiple of 4");
          var c = h.indexOf("=");
          c === -1 && (c = _);
          var n = c === _ ? 0 : 4 - c % 4;
          return [c, n];
        }
        function e(h) {
          var _ = i(h), c = _[0], n = _[1];
          return (c + n) * 3 / 4 - n;
        }
        function s(h, _, c) {
          return (_ + c) * 3 / 4 - c;
        }
        function d(h) {
          var _, c = i(h), n = c[0], r = c[1], m = new a(s(h, n, r)), T = 0, z = r > 0 ? n - 4 : n, I;
          for (I = 0; I < z; I += 4)
            _ = E[h.charCodeAt(I)] << 18 | E[h.charCodeAt(I + 1)] << 12 | E[h.charCodeAt(I + 2)] << 6 | E[h.charCodeAt(I + 3)], m[T++] = _ >> 16 & 255, m[T++] = _ >> 8 & 255, m[T++] = _ & 255;
          return r === 2 && (_ = E[h.charCodeAt(I)] << 2 | E[h.charCodeAt(I + 1)] >> 4, m[T++] = _ & 255), r === 1 && (_ = E[h.charCodeAt(I)] << 10 | E[h.charCodeAt(I + 1)] << 4 | E[h.charCodeAt(I + 2)] >> 2, m[T++] = _ >> 8 & 255, m[T++] = _ & 255), m;
        }
        function v(h) {
          return M[h >> 18 & 63] + M[h >> 12 & 63] + M[h >> 6 & 63] + M[h & 63];
        }
        function w(h, _, c) {
          for (var n, r = [], m = _; m < c; m += 3)
            n = (h[m] << 16 & 16711680) + (h[m + 1] << 8 & 65280) + (h[m + 2] & 255), r.push(v(n));
          return r.join("");
        }
        function y(h) {
          for (var _, c = h.length, n = c % 3, r = [], m = 16383, T = 0, z = c - n; T < z; T += m)
            r.push(w(h, T, T + m > z ? z : T + m));
          return n === 1 ? (_ = h[c - 1], r.push(
            M[_ >> 2] + M[_ << 4 & 63] + "=="
          )) : n === 2 && (_ = (h[c - 2] << 8) + h[c - 1], r.push(
            M[_ >> 10] + M[_ >> 4 & 63] + M[_ << 2 & 63] + "="
          )), r.join("");
        }
      }, {}], 48: [function(P, se, R) {
        (function(M) {
          var E = P("base64-js"), a = P("ieee754"), g = P("isarray");
          R.Buffer = e, R.SlowBuffer = r, R.INSPECT_MAX_BYTES = 50, e.TYPED_ARRAY_SUPPORT = M.TYPED_ARRAY_SUPPORT !== void 0 ? M.TYPED_ARRAY_SUPPORT : p(), R.kMaxLength = u();
          function p() {
            try {
              var l = new Uint8Array(1);
              return l.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
                return 42;
              } }, l.foo() === 42 && // typed array instances can be augmented
              typeof l.subarray == "function" && // chrome 9-10 lack `subarray`
              l.subarray(1, 1).byteLength === 0;
            } catch {
              return !1;
            }
          }
          function u() {
            return e.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
          }
          function i(l, t) {
            if (u() < t)
              throw new RangeError("Invalid typed array length");
            return e.TYPED_ARRAY_SUPPORT ? (l = new Uint8Array(t), l.__proto__ = e.prototype) : (l === null && (l = new e(t)), l.length = t), l;
          }
          function e(l, t, o) {
            if (!e.TYPED_ARRAY_SUPPORT && !(this instanceof e))
              return new e(l, t, o);
            if (typeof l == "number") {
              if (typeof t == "string")
                throw new Error(
                  "If encoding is specified then the first argument must be a string"
                );
              return w(this, l);
            }
            return s(this, l, t, o);
          }
          e.poolSize = 8192, e._augment = function(l) {
            return l.__proto__ = e.prototype, l;
          };
          function s(l, t, o, D) {
            if (typeof t == "number")
              throw new TypeError('"value" argument must not be a number');
            return typeof ArrayBuffer < "u" && t instanceof ArrayBuffer ? _(l, t, o, D) : typeof t == "string" ? y(l, t, o) : c(l, t);
          }
          e.from = function(l, t, o) {
            return s(null, l, t, o);
          }, e.TYPED_ARRAY_SUPPORT && (e.prototype.__proto__ = Uint8Array.prototype, e.__proto__ = Uint8Array, typeof Symbol < "u" && Symbol.species && e[Symbol.species] === e && Object.defineProperty(e, Symbol.species, {
            value: null,
            configurable: !0
          }));
          function d(l) {
            if (typeof l != "number")
              throw new TypeError('"size" argument must be a number');
            if (l < 0)
              throw new RangeError('"size" argument must not be negative');
          }
          function v(l, t, o, D) {
            return d(t), t <= 0 ? i(l, t) : o !== void 0 ? typeof D == "string" ? i(l, t).fill(o, D) : i(l, t).fill(o) : i(l, t);
          }
          e.alloc = function(l, t, o) {
            return v(null, l, t, o);
          };
          function w(l, t) {
            if (d(t), l = i(l, t < 0 ? 0 : n(t) | 0), !e.TYPED_ARRAY_SUPPORT)
              for (var o = 0; o < t; ++o)
                l[o] = 0;
            return l;
          }
          e.allocUnsafe = function(l) {
            return w(null, l);
          }, e.allocUnsafeSlow = function(l) {
            return w(null, l);
          };
          function y(l, t, o) {
            if ((typeof o != "string" || o === "") && (o = "utf8"), !e.isEncoding(o))
              throw new TypeError('"encoding" must be a valid string encoding');
            var D = m(t, o) | 0;
            l = i(l, D);
            var C = l.write(t, o);
            return C !== D && (l = l.slice(0, C)), l;
          }
          function h(l, t) {
            var o = t.length < 0 ? 0 : n(t.length) | 0;
            l = i(l, o);
            for (var D = 0; D < o; D += 1)
              l[D] = t[D] & 255;
            return l;
          }
          function _(l, t, o, D) {
            if (t.byteLength, o < 0 || t.byteLength < o)
              throw new RangeError("'offset' is out of bounds");
            if (t.byteLength < o + (D || 0))
              throw new RangeError("'length' is out of bounds");
            return o === void 0 && D === void 0 ? t = new Uint8Array(t) : D === void 0 ? t = new Uint8Array(t, o) : t = new Uint8Array(t, o, D), e.TYPED_ARRAY_SUPPORT ? (l = t, l.__proto__ = e.prototype) : l = h(l, t), l;
          }
          function c(l, t) {
            if (e.isBuffer(t)) {
              var o = n(t.length) | 0;
              return l = i(l, o), l.length === 0 || t.copy(l, 0, 0, o), l;
            }
            if (t) {
              if (typeof ArrayBuffer < "u" && t.buffer instanceof ArrayBuffer || "length" in t)
                return typeof t.length != "number" || X(t.length) ? i(l, 0) : h(l, t);
              if (t.type === "Buffer" && g(t.data))
                return h(l, t.data);
            }
            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
          }
          function n(l) {
            if (l >= u())
              throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + u().toString(16) + " bytes");
            return l | 0;
          }
          function r(l) {
            return +l != l && (l = 0), e.alloc(+l);
          }
          e.isBuffer = function(t) {
            return !!(t != null && t._isBuffer);
          }, e.compare = function(t, o) {
            if (!e.isBuffer(t) || !e.isBuffer(o))
              throw new TypeError("Arguments must be Buffers");
            if (t === o) return 0;
            for (var D = t.length, C = o.length, G = 0, te = Math.min(D, C); G < te; ++G)
              if (t[G] !== o[G]) {
                D = t[G], C = o[G];
                break;
              }
            return D < C ? -1 : C < D ? 1 : 0;
          }, e.isEncoding = function(t) {
            switch (String(t).toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "latin1":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return !0;
              default:
                return !1;
            }
          }, e.concat = function(t, o) {
            if (!g(t))
              throw new TypeError('"list" argument must be an Array of Buffers');
            if (t.length === 0)
              return e.alloc(0);
            var D;
            if (o === void 0)
              for (o = 0, D = 0; D < t.length; ++D)
                o += t[D].length;
            var C = e.allocUnsafe(o), G = 0;
            for (D = 0; D < t.length; ++D) {
              var te = t[D];
              if (!e.isBuffer(te))
                throw new TypeError('"list" argument must be an Array of Buffers');
              te.copy(C, G), G += te.length;
            }
            return C;
          };
          function m(l, t) {
            if (e.isBuffer(l))
              return l.length;
            if (typeof ArrayBuffer < "u" && typeof ArrayBuffer.isView == "function" && (ArrayBuffer.isView(l) || l instanceof ArrayBuffer))
              return l.byteLength;
            typeof l != "string" && (l = "" + l);
            var o = l.length;
            if (o === 0) return 0;
            for (var D = !1; ; )
              switch (t) {
                case "ascii":
                case "latin1":
                case "binary":
                  return o;
                case "utf8":
                case "utf-8":
                case void 0:
                  return Le(l).length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return o * 2;
                case "hex":
                  return o >>> 1;
                case "base64":
                  return $(l).length;
                default:
                  if (D) return Le(l).length;
                  t = ("" + t).toLowerCase(), D = !0;
              }
          }
          e.byteLength = m;
          function T(l, t, o) {
            var D = !1;
            if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((o === void 0 || o > this.length) && (o = this.length), o <= 0) || (o >>>= 0, t >>>= 0, o <= t))
              return "";
            for (l || (l = "utf8"); ; )
              switch (l) {
                case "hex":
                  return ie(this, t, o);
                case "utf8":
                case "utf-8":
                  return x(this, t, o);
                case "ascii":
                  return ne(this, t, o);
                case "latin1":
                case "binary":
                  return ce(this, t, o);
                case "base64":
                  return Y(this, t, o);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return ye(this, t, o);
                default:
                  if (D) throw new TypeError("Unknown encoding: " + l);
                  l = (l + "").toLowerCase(), D = !0;
              }
          }
          e.prototype._isBuffer = !0;
          function z(l, t, o) {
            var D = l[t];
            l[t] = l[o], l[o] = D;
          }
          e.prototype.swap16 = function() {
            var t = this.length;
            if (t % 2 !== 0)
              throw new RangeError("Buffer size must be a multiple of 16-bits");
            for (var o = 0; o < t; o += 2)
              z(this, o, o + 1);
            return this;
          }, e.prototype.swap32 = function() {
            var t = this.length;
            if (t % 4 !== 0)
              throw new RangeError("Buffer size must be a multiple of 32-bits");
            for (var o = 0; o < t; o += 4)
              z(this, o, o + 3), z(this, o + 1, o + 2);
            return this;
          }, e.prototype.swap64 = function() {
            var t = this.length;
            if (t % 8 !== 0)
              throw new RangeError("Buffer size must be a multiple of 64-bits");
            for (var o = 0; o < t; o += 8)
              z(this, o, o + 7), z(this, o + 1, o + 6), z(this, o + 2, o + 5), z(this, o + 3, o + 4);
            return this;
          }, e.prototype.toString = function() {
            var t = this.length | 0;
            return t === 0 ? "" : arguments.length === 0 ? x(this, 0, t) : T.apply(this, arguments);
          }, e.prototype.equals = function(t) {
            if (!e.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
            return this === t ? !0 : e.compare(this, t) === 0;
          }, e.prototype.inspect = function() {
            var t = "", o = R.INSPECT_MAX_BYTES;
            return this.length > 0 && (t = this.toString("hex", 0, o).match(/.{2}/g).join(" "), this.length > o && (t += " ... ")), "<Buffer " + t + ">";
          }, e.prototype.compare = function(t, o, D, C, G) {
            if (!e.isBuffer(t))
              throw new TypeError("Argument must be a Buffer");
            if (o === void 0 && (o = 0), D === void 0 && (D = t ? t.length : 0), C === void 0 && (C = 0), G === void 0 && (G = this.length), o < 0 || D > t.length || C < 0 || G > this.length)
              throw new RangeError("out of range index");
            if (C >= G && o >= D)
              return 0;
            if (C >= G)
              return -1;
            if (o >= D)
              return 1;
            if (o >>>= 0, D >>>= 0, C >>>= 0, G >>>= 0, this === t) return 0;
            for (var te = G - C, ae = D - o, de = Math.min(te, ae), xe = this.slice(C, G), me = t.slice(o, D), Ae = 0; Ae < de; ++Ae)
              if (xe[Ae] !== me[Ae]) {
                te = xe[Ae], ae = me[Ae];
                break;
              }
            return te < ae ? -1 : ae < te ? 1 : 0;
          };
          function I(l, t, o, D, C) {
            if (l.length === 0) return -1;
            if (typeof o == "string" ? (D = o, o = 0) : o > 2147483647 ? o = 2147483647 : o < -2147483648 && (o = -2147483648), o = +o, isNaN(o) && (o = C ? 0 : l.length - 1), o < 0 && (o = l.length + o), o >= l.length) {
              if (C) return -1;
              o = l.length - 1;
            } else if (o < 0)
              if (C) o = 0;
              else return -1;
            if (typeof t == "string" && (t = e.from(t, D)), e.isBuffer(t))
              return t.length === 0 ? -1 : A(l, t, o, D, C);
            if (typeof t == "number")
              return t = t & 255, e.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf == "function" ? C ? Uint8Array.prototype.indexOf.call(l, t, o) : Uint8Array.prototype.lastIndexOf.call(l, t, o) : A(l, [t], o, D, C);
            throw new TypeError("val must be string, number or Buffer");
          }
          function A(l, t, o, D, C) {
            var G = 1, te = l.length, ae = t.length;
            if (D !== void 0 && (D = String(D).toLowerCase(), D === "ucs2" || D === "ucs-2" || D === "utf16le" || D === "utf-16le")) {
              if (l.length < 2 || t.length < 2)
                return -1;
              G = 2, te /= 2, ae /= 2, o /= 2;
            }
            function de(Xe, He) {
              return G === 1 ? Xe[He] : Xe.readUInt16BE(He * G);
            }
            var xe;
            if (C) {
              var me = -1;
              for (xe = o; xe < te; xe++)
                if (de(l, xe) === de(t, me === -1 ? 0 : xe - me)) {
                  if (me === -1 && (me = xe), xe - me + 1 === ae) return me * G;
                } else
                  me !== -1 && (xe -= xe - me), me = -1;
            } else
              for (o + ae > te && (o = te - ae), xe = o; xe >= 0; xe--) {
                for (var Ae = !0, ze = 0; ze < ae; ze++)
                  if (de(l, xe + ze) !== de(t, ze)) {
                    Ae = !1;
                    break;
                  }
                if (Ae) return xe;
              }
            return -1;
          }
          e.prototype.includes = function(t, o, D) {
            return this.indexOf(t, o, D) !== -1;
          }, e.prototype.indexOf = function(t, o, D) {
            return I(this, t, o, D, !0);
          }, e.prototype.lastIndexOf = function(t, o, D) {
            return I(this, t, o, D, !1);
          };
          function O(l, t, o, D) {
            o = Number(o) || 0;
            var C = l.length - o;
            D ? (D = Number(D), D > C && (D = C)) : D = C;
            var G = t.length;
            if (G % 2 !== 0) throw new TypeError("Invalid hex string");
            D > G / 2 && (D = G / 2);
            for (var te = 0; te < D; ++te) {
              var ae = parseInt(t.substr(te * 2, 2), 16);
              if (isNaN(ae)) return te;
              l[o + te] = ae;
            }
            return te;
          }
          function B(l, t, o, D) {
            return V(Le(t, l.length - o), l, o, D);
          }
          function k(l, t, o, D) {
            return V(Be(t), l, o, D);
          }
          function W(l, t, o, D) {
            return k(l, t, o, D);
          }
          function ee(l, t, o, D) {
            return V($(t), l, o, D);
          }
          function F(l, t, o, D) {
            return V(f(t, l.length - o), l, o, D);
          }
          e.prototype.write = function(t, o, D, C) {
            if (o === void 0)
              C = "utf8", D = this.length, o = 0;
            else if (D === void 0 && typeof o == "string")
              C = o, D = this.length, o = 0;
            else if (isFinite(o))
              o = o | 0, isFinite(D) ? (D = D | 0, C === void 0 && (C = "utf8")) : (C = D, D = void 0);
            else
              throw new Error(
                "Buffer.write(string, encoding, offset[, length]) is no longer supported"
              );
            var G = this.length - o;
            if ((D === void 0 || D > G) && (D = G), t.length > 0 && (D < 0 || o < 0) || o > this.length)
              throw new RangeError("Attempt to write outside buffer bounds");
            C || (C = "utf8");
            for (var te = !1; ; )
              switch (C) {
                case "hex":
                  return O(this, t, o, D);
                case "utf8":
                case "utf-8":
                  return B(this, t, o, D);
                case "ascii":
                  return k(this, t, o, D);
                case "latin1":
                case "binary":
                  return W(this, t, o, D);
                case "base64":
                  return ee(this, t, o, D);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return F(this, t, o, D);
                default:
                  if (te) throw new TypeError("Unknown encoding: " + C);
                  C = ("" + C).toLowerCase(), te = !0;
              }
          }, e.prototype.toJSON = function() {
            return {
              type: "Buffer",
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };
          function Y(l, t, o) {
            return t === 0 && o === l.length ? E.fromByteArray(l) : E.fromByteArray(l.slice(t, o));
          }
          function x(l, t, o) {
            o = Math.min(l.length, o);
            for (var D = [], C = t; C < o; ) {
              var G = l[C], te = null, ae = G > 239 ? 4 : G > 223 ? 3 : G > 191 ? 2 : 1;
              if (C + ae <= o) {
                var de, xe, me, Ae;
                switch (ae) {
                  case 1:
                    G < 128 && (te = G);
                    break;
                  case 2:
                    de = l[C + 1], (de & 192) === 128 && (Ae = (G & 31) << 6 | de & 63, Ae > 127 && (te = Ae));
                    break;
                  case 3:
                    de = l[C + 1], xe = l[C + 2], (de & 192) === 128 && (xe & 192) === 128 && (Ae = (G & 15) << 12 | (de & 63) << 6 | xe & 63, Ae > 2047 && (Ae < 55296 || Ae > 57343) && (te = Ae));
                    break;
                  case 4:
                    de = l[C + 1], xe = l[C + 2], me = l[C + 3], (de & 192) === 128 && (xe & 192) === 128 && (me & 192) === 128 && (Ae = (G & 15) << 18 | (de & 63) << 12 | (xe & 63) << 6 | me & 63, Ae > 65535 && Ae < 1114112 && (te = Ae));
                }
              }
              te === null ? (te = 65533, ae = 1) : te > 65535 && (te -= 65536, D.push(te >>> 10 & 1023 | 55296), te = 56320 | te & 1023), D.push(te), C += ae;
            }
            return pe(D);
          }
          var K = 4096;
          function pe(l) {
            var t = l.length;
            if (t <= K)
              return String.fromCharCode.apply(String, l);
            for (var o = "", D = 0; D < t; )
              o += String.fromCharCode.apply(
                String,
                l.slice(D, D += K)
              );
            return o;
          }
          function ne(l, t, o) {
            var D = "";
            o = Math.min(l.length, o);
            for (var C = t; C < o; ++C)
              D += String.fromCharCode(l[C] & 127);
            return D;
          }
          function ce(l, t, o) {
            var D = "";
            o = Math.min(l.length, o);
            for (var C = t; C < o; ++C)
              D += String.fromCharCode(l[C]);
            return D;
          }
          function ie(l, t, o) {
            var D = l.length;
            (!t || t < 0) && (t = 0), (!o || o < 0 || o > D) && (o = D);
            for (var C = "", G = t; G < o; ++G)
              C += De(l[G]);
            return C;
          }
          function ye(l, t, o) {
            for (var D = l.slice(t, o), C = "", G = 0; G < D.length; G += 2)
              C += String.fromCharCode(D[G] + D[G + 1] * 256);
            return C;
          }
          e.prototype.slice = function(t, o) {
            var D = this.length;
            t = ~~t, o = o === void 0 ? D : ~~o, t < 0 ? (t += D, t < 0 && (t = 0)) : t > D && (t = D), o < 0 ? (o += D, o < 0 && (o = 0)) : o > D && (o = D), o < t && (o = t);
            var C;
            if (e.TYPED_ARRAY_SUPPORT)
              C = this.subarray(t, o), C.__proto__ = e.prototype;
            else {
              var G = o - t;
              C = new e(G, void 0);
              for (var te = 0; te < G; ++te)
                C[te] = this[te + t];
            }
            return C;
          };
          function j(l, t, o) {
            if (l % 1 !== 0 || l < 0) throw new RangeError("offset is not uint");
            if (l + t > o) throw new RangeError("Trying to access beyond buffer length");
          }
          e.prototype.readUIntLE = function(t, o, D) {
            t = t | 0, o = o | 0, D || j(t, o, this.length);
            for (var C = this[t], G = 1, te = 0; ++te < o && (G *= 256); )
              C += this[t + te] * G;
            return C;
          }, e.prototype.readUIntBE = function(t, o, D) {
            t = t | 0, o = o | 0, D || j(t, o, this.length);
            for (var C = this[t + --o], G = 1; o > 0 && (G *= 256); )
              C += this[t + --o] * G;
            return C;
          }, e.prototype.readUInt8 = function(t, o) {
            return o || j(t, 1, this.length), this[t];
          }, e.prototype.readUInt16LE = function(t, o) {
            return o || j(t, 2, this.length), this[t] | this[t + 1] << 8;
          }, e.prototype.readUInt16BE = function(t, o) {
            return o || j(t, 2, this.length), this[t] << 8 | this[t + 1];
          }, e.prototype.readUInt32LE = function(t, o) {
            return o || j(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
          }, e.prototype.readUInt32BE = function(t, o) {
            return o || j(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
          }, e.prototype.readIntLE = function(t, o, D) {
            t = t | 0, o = o | 0, D || j(t, o, this.length);
            for (var C = this[t], G = 1, te = 0; ++te < o && (G *= 256); )
              C += this[t + te] * G;
            return G *= 128, C >= G && (C -= Math.pow(2, 8 * o)), C;
          }, e.prototype.readIntBE = function(t, o, D) {
            t = t | 0, o = o | 0, D || j(t, o, this.length);
            for (var C = o, G = 1, te = this[t + --C]; C > 0 && (G *= 256); )
              te += this[t + --C] * G;
            return G *= 128, te >= G && (te -= Math.pow(2, 8 * o)), te;
          }, e.prototype.readInt8 = function(t, o) {
            return o || j(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
          }, e.prototype.readInt16LE = function(t, o) {
            o || j(t, 2, this.length);
            var D = this[t] | this[t + 1] << 8;
            return D & 32768 ? D | 4294901760 : D;
          }, e.prototype.readInt16BE = function(t, o) {
            o || j(t, 2, this.length);
            var D = this[t + 1] | this[t] << 8;
            return D & 32768 ? D | 4294901760 : D;
          }, e.prototype.readInt32LE = function(t, o) {
            return o || j(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
          }, e.prototype.readInt32BE = function(t, o) {
            return o || j(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
          }, e.prototype.readFloatLE = function(t, o) {
            return o || j(t, 4, this.length), a.read(this, t, !0, 23, 4);
          }, e.prototype.readFloatBE = function(t, o) {
            return o || j(t, 4, this.length), a.read(this, t, !1, 23, 4);
          }, e.prototype.readDoubleLE = function(t, o) {
            return o || j(t, 8, this.length), a.read(this, t, !0, 52, 8);
          }, e.prototype.readDoubleBE = function(t, o) {
            return o || j(t, 8, this.length), a.read(this, t, !1, 52, 8);
          };
          function Q(l, t, o, D, C, G) {
            if (!e.isBuffer(l)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (t > C || t < G) throw new RangeError('"value" argument is out of bounds');
            if (o + D > l.length) throw new RangeError("Index out of range");
          }
          e.prototype.writeUIntLE = function(t, o, D, C) {
            if (t = +t, o = o | 0, D = D | 0, !C) {
              var G = Math.pow(2, 8 * D) - 1;
              Q(this, t, o, D, G, 0);
            }
            var te = 1, ae = 0;
            for (this[o] = t & 255; ++ae < D && (te *= 256); )
              this[o + ae] = t / te & 255;
            return o + D;
          }, e.prototype.writeUIntBE = function(t, o, D, C) {
            if (t = +t, o = o | 0, D = D | 0, !C) {
              var G = Math.pow(2, 8 * D) - 1;
              Q(this, t, o, D, G, 0);
            }
            var te = D - 1, ae = 1;
            for (this[o + te] = t & 255; --te >= 0 && (ae *= 256); )
              this[o + te] = t / ae & 255;
            return o + D;
          }, e.prototype.writeUInt8 = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 1, 255, 0), e.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[o] = t & 255, o + 1;
          };
          function we(l, t, o, D) {
            t < 0 && (t = 65535 + t + 1);
            for (var C = 0, G = Math.min(l.length - o, 2); C < G; ++C)
              l[o + C] = (t & 255 << 8 * (D ? C : 1 - C)) >>> (D ? C : 1 - C) * 8;
          }
          e.prototype.writeUInt16LE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 2, 65535, 0), e.TYPED_ARRAY_SUPPORT ? (this[o] = t & 255, this[o + 1] = t >>> 8) : we(this, t, o, !0), o + 2;
          }, e.prototype.writeUInt16BE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 2, 65535, 0), e.TYPED_ARRAY_SUPPORT ? (this[o] = t >>> 8, this[o + 1] = t & 255) : we(this, t, o, !1), o + 2;
          };
          function he(l, t, o, D) {
            t < 0 && (t = 4294967295 + t + 1);
            for (var C = 0, G = Math.min(l.length - o, 4); C < G; ++C)
              l[o + C] = t >>> (D ? C : 3 - C) * 8 & 255;
          }
          e.prototype.writeUInt32LE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 4, 4294967295, 0), e.TYPED_ARRAY_SUPPORT ? (this[o + 3] = t >>> 24, this[o + 2] = t >>> 16, this[o + 1] = t >>> 8, this[o] = t & 255) : he(this, t, o, !0), o + 4;
          }, e.prototype.writeUInt32BE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 4, 4294967295, 0), e.TYPED_ARRAY_SUPPORT ? (this[o] = t >>> 24, this[o + 1] = t >>> 16, this[o + 2] = t >>> 8, this[o + 3] = t & 255) : he(this, t, o, !1), o + 4;
          }, e.prototype.writeIntLE = function(t, o, D, C) {
            if (t = +t, o = o | 0, !C) {
              var G = Math.pow(2, 8 * D - 1);
              Q(this, t, o, D, G - 1, -G);
            }
            var te = 0, ae = 1, de = 0;
            for (this[o] = t & 255; ++te < D && (ae *= 256); )
              t < 0 && de === 0 && this[o + te - 1] !== 0 && (de = 1), this[o + te] = (t / ae >> 0) - de & 255;
            return o + D;
          }, e.prototype.writeIntBE = function(t, o, D, C) {
            if (t = +t, o = o | 0, !C) {
              var G = Math.pow(2, 8 * D - 1);
              Q(this, t, o, D, G - 1, -G);
            }
            var te = D - 1, ae = 1, de = 0;
            for (this[o + te] = t & 255; --te >= 0 && (ae *= 256); )
              t < 0 && de === 0 && this[o + te + 1] !== 0 && (de = 1), this[o + te] = (t / ae >> 0) - de & 255;
            return o + D;
          }, e.prototype.writeInt8 = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 1, 127, -128), e.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[o] = t & 255, o + 1;
          }, e.prototype.writeInt16LE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 2, 32767, -32768), e.TYPED_ARRAY_SUPPORT ? (this[o] = t & 255, this[o + 1] = t >>> 8) : we(this, t, o, !0), o + 2;
          }, e.prototype.writeInt16BE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 2, 32767, -32768), e.TYPED_ARRAY_SUPPORT ? (this[o] = t >>> 8, this[o + 1] = t & 255) : we(this, t, o, !1), o + 2;
          }, e.prototype.writeInt32LE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 4, 2147483647, -2147483648), e.TYPED_ARRAY_SUPPORT ? (this[o] = t & 255, this[o + 1] = t >>> 8, this[o + 2] = t >>> 16, this[o + 3] = t >>> 24) : he(this, t, o, !0), o + 4;
          }, e.prototype.writeInt32BE = function(t, o, D) {
            return t = +t, o = o | 0, D || Q(this, t, o, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), e.TYPED_ARRAY_SUPPORT ? (this[o] = t >>> 24, this[o + 1] = t >>> 16, this[o + 2] = t >>> 8, this[o + 3] = t & 255) : he(this, t, o, !1), o + 4;
          };
          function le(l, t, o, D, C, G) {
            if (o + D > l.length) throw new RangeError("Index out of range");
            if (o < 0) throw new RangeError("Index out of range");
          }
          function Re(l, t, o, D, C) {
            return C || le(l, t, o, 4), a.write(l, t, o, D, 23, 4), o + 4;
          }
          e.prototype.writeFloatLE = function(t, o, D) {
            return Re(this, t, o, !0, D);
          }, e.prototype.writeFloatBE = function(t, o, D) {
            return Re(this, t, o, !1, D);
          };
          function Ce(l, t, o, D, C) {
            return C || le(l, t, o, 8), a.write(l, t, o, D, 52, 8), o + 8;
          }
          e.prototype.writeDoubleLE = function(t, o, D) {
            return Ce(this, t, o, !0, D);
          }, e.prototype.writeDoubleBE = function(t, o, D) {
            return Ce(this, t, o, !1, D);
          }, e.prototype.copy = function(t, o, D, C) {
            if (D || (D = 0), !C && C !== 0 && (C = this.length), o >= t.length && (o = t.length), o || (o = 0), C > 0 && C < D && (C = D), C === D || t.length === 0 || this.length === 0) return 0;
            if (o < 0)
              throw new RangeError("targetStart out of bounds");
            if (D < 0 || D >= this.length) throw new RangeError("sourceStart out of bounds");
            if (C < 0) throw new RangeError("sourceEnd out of bounds");
            C > this.length && (C = this.length), t.length - o < C - D && (C = t.length - o + D);
            var G = C - D, te;
            if (this === t && D < o && o < C)
              for (te = G - 1; te >= 0; --te)
                t[te + o] = this[te + D];
            else if (G < 1e3 || !e.TYPED_ARRAY_SUPPORT)
              for (te = 0; te < G; ++te)
                t[te + o] = this[te + D];
            else
              Uint8Array.prototype.set.call(
                t,
                this.subarray(D, D + G),
                o
              );
            return G;
          }, e.prototype.fill = function(t, o, D, C) {
            if (typeof t == "string") {
              if (typeof o == "string" ? (C = o, o = 0, D = this.length) : typeof D == "string" && (C = D, D = this.length), t.length === 1) {
                var G = t.charCodeAt(0);
                G < 256 && (t = G);
              }
              if (C !== void 0 && typeof C != "string")
                throw new TypeError("encoding must be a string");
              if (typeof C == "string" && !e.isEncoding(C))
                throw new TypeError("Unknown encoding: " + C);
            } else typeof t == "number" && (t = t & 255);
            if (o < 0 || this.length < o || this.length < D)
              throw new RangeError("Out of range index");
            if (D <= o)
              return this;
            o = o >>> 0, D = D === void 0 ? this.length : D >>> 0, t || (t = 0);
            var te;
            if (typeof t == "number")
              for (te = o; te < D; ++te)
                this[te] = t;
            else {
              var ae = e.isBuffer(t) ? t : Le(new e(t, C).toString()), de = ae.length;
              for (te = 0; te < D - o; ++te)
                this[te + o] = ae[te % de];
            }
            return this;
          };
          var be = /[^+\/0-9A-Za-z-_]/g;
          function Te(l) {
            if (l = Ie(l).replace(be, ""), l.length < 2) return "";
            for (; l.length % 4 !== 0; )
              l = l + "=";
            return l;
          }
          function Ie(l) {
            return l.trim ? l.trim() : l.replace(/^\s+|\s+$/g, "");
          }
          function De(l) {
            return l < 16 ? "0" + l.toString(16) : l.toString(16);
          }
          function Le(l, t) {
            t = t || 1 / 0;
            for (var o, D = l.length, C = null, G = [], te = 0; te < D; ++te) {
              if (o = l.charCodeAt(te), o > 55295 && o < 57344) {
                if (!C) {
                  if (o > 56319) {
                    (t -= 3) > -1 && G.push(239, 191, 189);
                    continue;
                  } else if (te + 1 === D) {
                    (t -= 3) > -1 && G.push(239, 191, 189);
                    continue;
                  }
                  C = o;
                  continue;
                }
                if (o < 56320) {
                  (t -= 3) > -1 && G.push(239, 191, 189), C = o;
                  continue;
                }
                o = (C - 55296 << 10 | o - 56320) + 65536;
              } else C && (t -= 3) > -1 && G.push(239, 191, 189);
              if (C = null, o < 128) {
                if ((t -= 1) < 0) break;
                G.push(o);
              } else if (o < 2048) {
                if ((t -= 2) < 0) break;
                G.push(
                  o >> 6 | 192,
                  o & 63 | 128
                );
              } else if (o < 65536) {
                if ((t -= 3) < 0) break;
                G.push(
                  o >> 12 | 224,
                  o >> 6 & 63 | 128,
                  o & 63 | 128
                );
              } else if (o < 1114112) {
                if ((t -= 4) < 0) break;
                G.push(
                  o >> 18 | 240,
                  o >> 12 & 63 | 128,
                  o >> 6 & 63 | 128,
                  o & 63 | 128
                );
              } else
                throw new Error("Invalid code point");
            }
            return G;
          }
          function Be(l) {
            for (var t = [], o = 0; o < l.length; ++o)
              t.push(l.charCodeAt(o) & 255);
            return t;
          }
          function f(l, t) {
            for (var o, D, C, G = [], te = 0; te < l.length && !((t -= 2) < 0); ++te)
              o = l.charCodeAt(te), D = o >> 8, C = o % 256, G.push(C), G.push(D);
            return G;
          }
          function $(l) {
            return E.toByteArray(Te(l));
          }
          function V(l, t, o, D) {
            for (var C = 0; C < D && !(C + o >= t.length || C >= l.length); ++C)
              t[C + o] = l[C];
            return C;
          }
          function X(l) {
            return l !== l;
          }
        }).call(this, typeof pt < "u" ? pt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, { "base64-js": 47, ieee754: 51, isarray: 52 }], 49: [function(P, se, R) {
        Object.defineProperty(R, "__esModule", { value: !0 });
        var M = {
          SYMBOL: {
            32: 32,
            33: 33,
            34: 8704,
            35: 35,
            36: 8707,
            37: 37,
            38: 38,
            39: 8717,
            40: 40,
            41: 41,
            42: 42,
            43: 43,
            44: 44,
            45: 8722,
            46: 46,
            47: 47,
            48: 48,
            49: 49,
            50: 50,
            51: 51,
            52: 52,
            53: 53,
            54: 54,
            55: 55,
            56: 56,
            57: 57,
            58: 58,
            59: 59,
            60: 60,
            61: 61,
            62: 62,
            63: 63,
            64: 8773,
            65: 913,
            66: 914,
            67: 935,
            68: 916,
            69: 917,
            70: 934,
            71: 915,
            72: 919,
            73: 921,
            74: 977,
            75: 922,
            76: 923,
            77: 924,
            78: 925,
            79: 927,
            80: 928,
            81: 920,
            82: 929,
            83: 931,
            84: 932,
            85: 933,
            86: 962,
            87: 937,
            88: 926,
            89: 936,
            90: 918,
            91: 91,
            92: 8756,
            93: 93,
            94: 8869,
            95: 95,
            96: 8254,
            97: 945,
            98: 946,
            99: 967,
            100: 948,
            101: 949,
            102: 966,
            103: 947,
            104: 951,
            105: 953,
            106: 981,
            107: 954,
            108: 955,
            109: 956,
            110: 957,
            111: 959,
            112: 960,
            113: 952,
            114: 961,
            115: 963,
            116: 964,
            117: 965,
            118: 982,
            119: 969,
            120: 958,
            121: 968,
            122: 950,
            123: 123,
            124: 124,
            125: 125,
            126: 126,
            160: 8364,
            161: 978,
            162: 8242,
            163: 8804,
            164: 8260,
            165: 8734,
            166: 402,
            167: 9827,
            168: 9830,
            169: 9829,
            170: 9824,
            171: 8596,
            172: 8592,
            173: 8593,
            174: 8594,
            175: 8595,
            176: 176,
            177: 177,
            178: 8243,
            179: 8805,
            180: 215,
            181: 8733,
            182: 8706,
            183: 8226,
            184: 247,
            185: 8800,
            186: 8801,
            187: 8776,
            188: 8230,
            189: 9168,
            190: 9135,
            191: 8629,
            192: 8501,
            193: 8465,
            194: 8476,
            195: 8472,
            196: 8855,
            197: 8853,
            198: 8709,
            199: 8745,
            200: 8746,
            201: 8835,
            202: 8839,
            203: 8836,
            204: 8834,
            205: 8838,
            206: 8712,
            207: 8713,
            208: 8736,
            209: 8711,
            210: 174,
            211: 169,
            212: 8482,
            213: 8719,
            214: 8730,
            215: 8901,
            216: 172,
            217: 8743,
            218: 8744,
            219: 8660,
            220: 8656,
            221: 8657,
            222: 8658,
            223: 8659,
            224: 9674,
            225: 12296,
            226: 174,
            227: 169,
            228: 8482,
            229: 8721,
            230: 9115,
            231: 9116,
            232: 9117,
            233: 9121,
            234: 9122,
            235: 9123,
            236: 9127,
            237: 9128,
            238: 9129,
            239: 9130,
            240: 63743,
            241: 12297,
            242: 8747,
            243: 8992,
            244: 9134,
            245: 8993,
            246: 9118,
            247: 9119,
            248: 9120,
            249: 9124,
            250: 9125,
            251: 9126,
            252: 9131,
            253: 9132,
            254: 9133
          },
          WEBDINGS: {
            32: 32,
            33: 128375,
            34: 128376,
            35: 128370,
            36: 128374,
            37: 127942,
            38: 127894,
            39: 128391,
            40: 128488,
            41: 128489,
            42: 128496,
            43: 128497,
            44: 127798,
            45: 127895,
            46: 128638,
            47: 128636,
            48: 128469,
            49: 128470,
            50: 128471,
            51: 9204,
            52: 9205,
            53: 9206,
            54: 9207,
            55: 9194,
            56: 9193,
            57: 9198,
            58: 9197,
            59: 9208,
            60: 9209,
            61: 9210,
            62: 128474,
            63: 128499,
            64: 128736,
            65: 127959,
            66: 127960,
            67: 127961,
            68: 127962,
            69: 127964,
            70: 127981,
            71: 127963,
            72: 127968,
            73: 127958,
            74: 127965,
            75: 128739,
            76: 128269,
            77: 127956,
            78: 128065,
            79: 128066,
            80: 127966,
            81: 127957,
            82: 128740,
            83: 127967,
            84: 128755,
            85: 128364,
            86: 128363,
            87: 128360,
            88: 128264,
            89: 127892,
            90: 127893,
            91: 128492,
            92: 128637,
            93: 128493,
            94: 128490,
            95: 128491,
            96: 11156,
            97: 10004,
            98: 128690,
            99: 11036,
            100: 128737,
            101: 128230,
            102: 128753,
            103: 11035,
            104: 128657,
            105: 128712,
            106: 128745,
            107: 128752,
            108: 128968,
            109: 128372,
            110: 11044,
            111: 128741,
            112: 128660,
            113: 128472,
            114: 128473,
            115: 10067,
            116: 128754,
            117: 128647,
            118: 128653,
            119: 9971,
            120: 10680,
            121: 8854,
            122: 128685,
            123: 128494,
            124: 9168,
            125: 128495,
            126: 128498,
            128: 128697,
            129: 128698,
            130: 128713,
            131: 128714,
            132: 128700,
            133: 128125,
            134: 127947,
            135: 9975,
            136: 127938,
            137: 127948,
            138: 127946,
            139: 127940,
            140: 127949,
            141: 127950,
            142: 128664,
            143: 128480,
            144: 128738,
            145: 128176,
            146: 127991,
            147: 128179,
            148: 128106,
            149: 128481,
            150: 128482,
            151: 128483,
            152: 10031,
            153: 128388,
            154: 128389,
            155: 128387,
            156: 128390,
            157: 128441,
            158: 128442,
            159: 128443,
            160: 128373,
            161: 128368,
            162: 128445,
            163: 128446,
            164: 128203,
            165: 128466,
            166: 128467,
            167: 128366,
            168: 128218,
            169: 128478,
            170: 128479,
            171: 128451,
            172: 128450,
            173: 128444,
            174: 127917,
            175: 127900,
            176: 127896,
            177: 127897,
            178: 127911,
            179: 128191,
            180: 127902,
            181: 128247,
            182: 127903,
            183: 127916,
            184: 128253,
            185: 128249,
            186: 128254,
            187: 128251,
            188: 127898,
            189: 127899,
            190: 128250,
            191: 128187,
            192: 128421,
            193: 128422,
            194: 128423,
            195: 128377,
            196: 127918,
            197: 128379,
            198: 128380,
            199: 128223,
            200: 128385,
            201: 128384,
            202: 128424,
            203: 128425,
            204: 128447,
            205: 128426,
            206: 128476,
            207: 128274,
            208: 128275,
            209: 128477,
            210: 128229,
            211: 128228,
            212: 128371,
            213: 127779,
            214: 127780,
            215: 127781,
            216: 127782,
            217: 9729,
            218: 127784,
            219: 127783,
            220: 127785,
            221: 127786,
            222: 127788,
            223: 127787,
            224: 127772,
            225: 127777,
            226: 128715,
            227: 128719,
            228: 127869,
            229: 127864,
            230: 128718,
            231: 128717,
            232: 9413,
            233: 9855,
            234: 128710,
            235: 128392,
            236: 127891,
            237: 128484,
            238: 128485,
            239: 128486,
            240: 128487,
            241: 128746,
            242: 128063,
            243: 128038,
            244: 128031,
            245: 128021,
            246: 128008,
            247: 128620,
            248: 128622,
            249: 128621,
            250: 128623,
            251: 128506,
            252: 127757,
            253: 127759,
            254: 127758,
            255: 128330
          },
          WINGDINGS: {
            32: 32,
            33: 128393,
            34: 9986,
            35: 9985,
            36: 128083,
            37: 128365,
            38: 128366,
            39: 128367,
            40: 128383,
            41: 9990,
            42: 128386,
            43: 128387,
            44: 128234,
            45: 128235,
            46: 128236,
            47: 128237,
            48: 128448,
            49: 128449,
            50: 128462,
            51: 128463,
            52: 128464,
            53: 128452,
            54: 8987,
            55: 128430,
            56: 128432,
            57: 128434,
            58: 128435,
            59: 128436,
            60: 128427,
            61: 128428,
            62: 9991,
            63: 9997,
            64: 128398,
            65: 9996,
            66: 128399,
            67: 128077,
            68: 128078,
            69: 9756,
            70: 9758,
            71: 9757,
            72: 9759,
            73: 128400,
            74: 9786,
            75: 128528,
            76: 9785,
            77: 128163,
            78: 128369,
            79: 127987,
            80: 127985,
            81: 9992,
            82: 9788,
            83: 127778,
            84: 10052,
            85: 128326,
            86: 10014,
            87: 128328,
            88: 10016,
            89: 10017,
            90: 9770,
            91: 9775,
            92: 128329,
            93: 9784,
            94: 9800,
            95: 9801,
            96: 9802,
            97: 9803,
            98: 9804,
            99: 9805,
            100: 9806,
            101: 9807,
            102: 9808,
            103: 9809,
            104: 9810,
            105: 9811,
            106: 128624,
            107: 128629,
            108: 9899,
            109: 128318,
            110: 9724,
            111: 128911,
            112: 128912,
            113: 10065,
            114: 10066,
            115: 128927,
            116: 10731,
            117: 9670,
            118: 10070,
            119: 11049,
            120: 8999,
            121: 11193,
            122: 8984,
            123: 127989,
            124: 127990,
            125: 128630,
            126: 128631,
            127: 9647,
            128: 127243,
            129: 10112,
            130: 10113,
            131: 10114,
            132: 10115,
            133: 10116,
            134: 10117,
            135: 10118,
            136: 10119,
            137: 10120,
            138: 10121,
            139: 127244,
            140: 10122,
            141: 10123,
            142: 10124,
            143: 10125,
            144: 10126,
            145: 10127,
            146: 10128,
            147: 10129,
            148: 10130,
            149: 10131,
            150: 128610,
            151: 128608,
            152: 128609,
            153: 128611,
            154: 128606,
            155: 128604,
            156: 128605,
            157: 128607,
            158: 8729,
            159: 8226,
            160: 11037,
            161: 11096,
            162: 128902,
            163: 128904,
            164: 128906,
            165: 128907,
            166: 128319,
            167: 9642,
            168: 128910,
            169: 128961,
            170: 128965,
            171: 9733,
            172: 128971,
            173: 128975,
            174: 128979,
            175: 128977,
            176: 11216,
            177: 8982,
            178: 11214,
            179: 11215,
            180: 11217,
            181: 10026,
            182: 10032,
            183: 128336,
            184: 128337,
            185: 128338,
            186: 128339,
            187: 128340,
            188: 128341,
            189: 128342,
            190: 128343,
            191: 128344,
            192: 128345,
            193: 128346,
            194: 128347,
            195: 11184,
            196: 11185,
            197: 11186,
            198: 11187,
            199: 11188,
            200: 11189,
            201: 11190,
            202: 11191,
            203: 128618,
            204: 128619,
            205: 128597,
            206: 128596,
            207: 128599,
            208: 128598,
            209: 128592,
            210: 128593,
            211: 128594,
            212: 128595,
            213: 9003,
            214: 8998,
            215: 11160,
            216: 11162,
            217: 11161,
            218: 11163,
            219: 11144,
            220: 11146,
            221: 11145,
            222: 11147,
            223: 129128,
            224: 129130,
            225: 129129,
            226: 129131,
            227: 129132,
            228: 129133,
            229: 129135,
            230: 129134,
            231: 129144,
            232: 129146,
            233: 129145,
            234: 129147,
            235: 129148,
            236: 129149,
            237: 129151,
            238: 129150,
            239: 8678,
            240: 8680,
            241: 8679,
            242: 8681,
            243: 11012,
            244: 8691,
            245: 11009,
            246: 11008,
            247: 11011,
            248: 11010,
            249: 129196,
            250: 129197,
            251: 128502,
            252: 10003,
            253: 128503,
            254: 128505
          },
          "WINGDINGS 2": {
            32: 32,
            33: 128394,
            34: 128395,
            35: 128396,
            36: 128397,
            37: 9988,
            38: 9984,
            39: 128382,
            40: 128381,
            41: 128453,
            42: 128454,
            43: 128455,
            44: 128456,
            45: 128457,
            46: 128458,
            47: 128459,
            48: 128460,
            49: 128461,
            50: 128203,
            51: 128465,
            52: 128468,
            53: 128437,
            54: 128438,
            55: 128439,
            56: 128440,
            57: 128429,
            58: 128431,
            59: 128433,
            60: 128402,
            61: 128403,
            62: 128408,
            63: 128409,
            64: 128410,
            65: 128411,
            66: 128072,
            67: 128073,
            68: 128412,
            69: 128413,
            70: 128414,
            71: 128415,
            72: 128416,
            73: 128417,
            74: 128070,
            75: 128071,
            76: 128418,
            77: 128419,
            78: 128401,
            79: 128500,
            80: 128504,
            81: 128501,
            82: 9745,
            83: 11197,
            84: 9746,
            85: 11198,
            86: 11199,
            87: 128711,
            88: 10680,
            89: 128625,
            90: 128628,
            91: 128626,
            92: 128627,
            93: 8253,
            94: 128633,
            95: 128634,
            96: 128635,
            97: 128614,
            98: 128612,
            99: 128613,
            100: 128615,
            101: 128602,
            102: 128600,
            103: 128601,
            104: 128603,
            105: 9450,
            106: 9312,
            107: 9313,
            108: 9314,
            109: 9315,
            110: 9316,
            111: 9317,
            112: 9318,
            113: 9319,
            114: 9320,
            115: 9321,
            116: 9471,
            117: 10102,
            118: 10103,
            119: 10104,
            120: 10105,
            121: 10106,
            122: 10107,
            123: 10108,
            124: 10109,
            125: 10110,
            126: 10111,
            128: 9737,
            129: 127765,
            130: 9789,
            131: 9790,
            132: 11839,
            133: 10013,
            134: 128327,
            135: 128348,
            136: 128349,
            137: 128350,
            138: 128351,
            139: 128352,
            140: 128353,
            141: 128354,
            142: 128355,
            143: 128356,
            144: 128357,
            145: 128358,
            146: 128359,
            147: 128616,
            148: 128617,
            149: 8901,
            150: 128900,
            151: 10625,
            152: 9679,
            153: 9675,
            154: 128901,
            155: 128903,
            156: 128905,
            157: 8857,
            158: 10687,
            159: 128908,
            160: 128909,
            161: 9726,
            162: 9632,
            163: 9633,
            164: 128913,
            165: 128914,
            166: 128915,
            167: 128916,
            168: 9635,
            169: 128917,
            170: 128918,
            171: 128919,
            172: 128920,
            173: 11049,
            174: 11045,
            175: 9671,
            176: 128922,
            177: 9672,
            178: 128923,
            179: 128924,
            180: 128925,
            181: 128926,
            182: 11050,
            183: 11047,
            184: 9674,
            185: 128928,
            186: 9686,
            187: 9687,
            188: 11210,
            189: 11211,
            190: 11200,
            191: 11201,
            192: 11039,
            193: 11202,
            194: 11043,
            195: 11042,
            196: 11203,
            197: 11204,
            198: 128929,
            199: 128930,
            200: 128931,
            201: 128932,
            202: 128933,
            203: 128934,
            204: 128935,
            205: 128936,
            206: 128937,
            207: 128938,
            208: 128939,
            209: 128940,
            210: 128941,
            211: 128942,
            212: 128943,
            213: 128944,
            214: 128945,
            215: 128946,
            216: 128947,
            217: 128948,
            218: 128949,
            219: 128950,
            220: 128951,
            221: 128952,
            222: 128953,
            223: 128954,
            224: 128955,
            225: 128956,
            226: 128957,
            227: 128958,
            228: 128959,
            229: 128960,
            230: 128962,
            231: 128964,
            232: 128966,
            233: 128969,
            234: 128970,
            235: 10038,
            236: 128972,
            237: 128974,
            238: 128976,
            239: 128978,
            240: 10041,
            241: 128963,
            242: 128967,
            243: 10031,
            244: 128973,
            245: 128980,
            246: 11212,
            247: 11213,
            248: 8251,
            249: 8258
          },
          "WINGDINGS 3": {
            32: 32,
            33: 11104,
            34: 11106,
            35: 11105,
            36: 11107,
            37: 11110,
            38: 11111,
            39: 11113,
            40: 11112,
            41: 11120,
            42: 11122,
            43: 11121,
            44: 11123,
            45: 11126,
            46: 11128,
            47: 11131,
            48: 11133,
            49: 11108,
            50: 11109,
            51: 11114,
            52: 11116,
            53: 11115,
            54: 11117,
            55: 11085,
            56: 11168,
            57: 11169,
            58: 11170,
            59: 11171,
            60: 11172,
            61: 11173,
            62: 11174,
            63: 11175,
            64: 11152,
            65: 11153,
            66: 11154,
            67: 11155,
            68: 11136,
            69: 11139,
            70: 11134,
            71: 11135,
            72: 11140,
            73: 11142,
            74: 11141,
            75: 11143,
            76: 11151,
            77: 11149,
            78: 11150,
            79: 11148,
            80: 11118,
            81: 11119,
            82: 9099,
            83: 8996,
            84: 8963,
            85: 8997,
            86: 9251,
            87: 9085,
            88: 8682,
            89: 11192,
            90: 129184,
            91: 129185,
            92: 129186,
            93: 129187,
            94: 129188,
            95: 129189,
            96: 129190,
            97: 129191,
            98: 129192,
            99: 129193,
            100: 129194,
            101: 129195,
            102: 129104,
            103: 129106,
            104: 129105,
            105: 129107,
            106: 129108,
            107: 129109,
            108: 129111,
            109: 129110,
            110: 129112,
            111: 129113,
            112: 9650,
            113: 9660,
            114: 9651,
            115: 9661,
            116: 9664,
            117: 9654,
            118: 9665,
            119: 9655,
            120: 9699,
            121: 9698,
            122: 9700,
            123: 9701,
            124: 128896,
            125: 128898,
            126: 128897,
            128: 128899,
            129: 11205,
            130: 11206,
            131: 11207,
            132: 11208,
            133: 11164,
            134: 11166,
            135: 11165,
            136: 11167,
            137: 129040,
            138: 129042,
            139: 129041,
            140: 129043,
            141: 129044,
            142: 129046,
            143: 129045,
            144: 129047,
            145: 129048,
            146: 129050,
            147: 129049,
            148: 129051,
            149: 129052,
            150: 129054,
            151: 129053,
            152: 129055,
            153: 129024,
            154: 129026,
            155: 129025,
            156: 129027,
            157: 129028,
            158: 129030,
            159: 129029,
            160: 129031,
            161: 129032,
            162: 129034,
            163: 129033,
            164: 129035,
            165: 129056,
            166: 129058,
            167: 129060,
            168: 129062,
            169: 129064,
            170: 129066,
            171: 129068,
            172: 129180,
            173: 129181,
            174: 129182,
            175: 129183,
            176: 129070,
            177: 129072,
            178: 129074,
            179: 129076,
            180: 129078,
            181: 129080,
            182: 129082,
            183: 129081,
            184: 129083,
            185: 129176,
            186: 129178,
            187: 129177,
            188: 129179,
            189: 129084,
            190: 129086,
            191: 129085,
            192: 129087,
            193: 129088,
            194: 129090,
            195: 129089,
            196: 129091,
            197: 129092,
            198: 129094,
            199: 129093,
            200: 129095,
            201: 11176,
            202: 11177,
            203: 11178,
            204: 11179,
            205: 11180,
            206: 11181,
            207: 11182,
            208: 11183,
            209: 129120,
            210: 129122,
            211: 129121,
            212: 129123,
            213: 129124,
            214: 129125,
            215: 129127,
            216: 129126,
            217: 129136,
            218: 129138,
            219: 129137,
            220: 129139,
            221: 129140,
            222: 129141,
            223: 129143,
            224: 129142,
            225: 129152,
            226: 129154,
            227: 129153,
            228: 129155,
            229: 129156,
            230: 129157,
            231: 129159,
            232: 129158,
            233: 129168,
            234: 129170,
            235: 129169,
            236: 129171,
            237: 129172,
            238: 129174,
            239: 129173,
            240: 129175
          }
        };
        R.default = M;
      }, {}], 50: [function(P, se, R) {
        var M = this && this.__importDefault || function(e) {
          return e && e.__esModule ? e : { default: e };
        };
        Object.defineProperty(R, "__esModule", { value: !0 }), R.hex = R.dec = R.codePoint = void 0;
        var E = M(P("./dingbats")), a = String.fromCodePoint ? String.fromCodePoint : i;
        function g(e, s) {
          var d = E.default[e.toUpperCase()];
          if (d !== void 0) {
            var v = d[s];
            if (v !== void 0)
              return {
                codePoint: v,
                string: a(v)
              };
          }
        }
        R.codePoint = g;
        function p(e, s) {
          return g(e, parseInt(s, 10));
        }
        R.dec = p;
        function u(e, s) {
          return g(e, parseInt(s, 16));
        }
        R.hex = u;
        function i(e) {
          if (e <= 65535)
            return String.fromCharCode(e);
          var s = Math.floor((e - 65536) / 1024) + 55296, d = (e - 65536) % 1024 + 56320;
          return String.fromCharCode(s, d);
        }
      }, { "./dingbats": 49 }], 51: [function(P, se, R) {
        R.read = function(M, E, a, g, p) {
          var u, i, e = p * 8 - g - 1, s = (1 << e) - 1, d = s >> 1, v = -7, w = a ? p - 1 : 0, y = a ? -1 : 1, h = M[E + w];
          for (w += y, u = h & (1 << -v) - 1, h >>= -v, v += e; v > 0; u = u * 256 + M[E + w], w += y, v -= 8)
            ;
          for (i = u & (1 << -v) - 1, u >>= -v, v += g; v > 0; i = i * 256 + M[E + w], w += y, v -= 8)
            ;
          if (u === 0)
            u = 1 - d;
          else {
            if (u === s)
              return i ? NaN : (h ? -1 : 1) * (1 / 0);
            i = i + Math.pow(2, g), u = u - d;
          }
          return (h ? -1 : 1) * i * Math.pow(2, u - g);
        }, R.write = function(M, E, a, g, p, u) {
          var i, e, s, d = u * 8 - p - 1, v = (1 << d) - 1, w = v >> 1, y = p === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, h = g ? 0 : u - 1, _ = g ? 1 : -1, c = E < 0 || E === 0 && 1 / E < 0 ? 1 : 0;
          for (E = Math.abs(E), isNaN(E) || E === 1 / 0 ? (e = isNaN(E) ? 1 : 0, i = v) : (i = Math.floor(Math.log(E) / Math.LN2), E * (s = Math.pow(2, -i)) < 1 && (i--, s *= 2), i + w >= 1 ? E += y / s : E += y * Math.pow(2, 1 - w), E * s >= 2 && (i++, s /= 2), i + w >= v ? (e = 0, i = v) : i + w >= 1 ? (e = (E * s - 1) * Math.pow(2, p), i = i + w) : (e = E * Math.pow(2, w - 1) * Math.pow(2, p), i = 0)); p >= 8; M[a + h] = e & 255, h += _, e /= 256, p -= 8)
            ;
          for (i = i << p | e, d += p; d > 0; M[a + h] = i & 255, h += _, i /= 256, d -= 8)
            ;
          M[a + h - _] |= c * 128;
        };
      }, {}], 52: [function(P, se, R) {
        var M = {}.toString;
        se.exports = Array.isArray || function(E) {
          return M.call(E) == "[object Array]";
        };
      }, {}], 53: [function(P, se, R) {
        (function(M, E) {
          (function(a) {
            typeof R == "object" && typeof se < "u" ? se.exports = a() : (typeof window < "u" ? window : typeof M < "u" ? M : typeof self < "u" ? self : this).JSZip = a();
          })(function() {
            return (function a(g, p, u) {
              function i(d, v) {
                if (!p[d]) {
                  if (!g[d]) {
                    var w = typeof P == "function" && P;
                    if (!v && w) return w(d, !0);
                    if (e) return e(d, !0);
                    var y = new Error("Cannot find module '" + d + "'");
                    throw y.code = "MODULE_NOT_FOUND", y;
                  }
                  var h = p[d] = { exports: {} };
                  g[d][0].call(h.exports, function(_) {
                    var c = g[d][1][_];
                    return i(c || _);
                  }, h, h.exports, a, g, p, u);
                }
                return p[d].exports;
              }
              for (var e = typeof P == "function" && P, s = 0; s < u.length; s++) i(u[s]);
              return i;
            })({ 1: [function(a, g, p) {
              var u = a("./utils"), i = a("./support"), e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              p.encode = function(s) {
                for (var d, v, w, y, h, _, c, n = [], r = 0, m = s.length, T = m, z = u.getTypeOf(s) !== "string"; r < s.length; ) T = m - r, w = z ? (d = s[r++], v = r < m ? s[r++] : 0, r < m ? s[r++] : 0) : (d = s.charCodeAt(r++), v = r < m ? s.charCodeAt(r++) : 0, r < m ? s.charCodeAt(r++) : 0), y = d >> 2, h = (3 & d) << 4 | v >> 4, _ = 1 < T ? (15 & v) << 2 | w >> 6 : 64, c = 2 < T ? 63 & w : 64, n.push(e.charAt(y) + e.charAt(h) + e.charAt(_) + e.charAt(c));
                return n.join("");
              }, p.decode = function(s) {
                var d, v, w, y, h, _, c = 0, n = 0, r = "data:";
                if (s.substr(0, r.length) === r) throw new Error("Invalid base64 input, it looks like a data url.");
                var m, T = 3 * (s = s.replace(/[^A-Za-z0-9\+\/\=]/g, "")).length / 4;
                if (s.charAt(s.length - 1) === e.charAt(64) && T--, s.charAt(s.length - 2) === e.charAt(64) && T--, T % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
                for (m = i.uint8array ? new Uint8Array(0 | T) : new Array(0 | T); c < s.length; ) d = e.indexOf(s.charAt(c++)) << 2 | (y = e.indexOf(s.charAt(c++))) >> 4, v = (15 & y) << 4 | (h = e.indexOf(s.charAt(c++))) >> 2, w = (3 & h) << 6 | (_ = e.indexOf(s.charAt(c++))), m[n++] = d, h !== 64 && (m[n++] = v), _ !== 64 && (m[n++] = w);
                return m;
              };
            }, { "./support": 30, "./utils": 32 }], 2: [function(a, g, p) {
              var u = a("./external"), i = a("./stream/DataWorker"), e = a("./stream/Crc32Probe"), s = a("./stream/DataLengthProbe");
              function d(v, w, y, h, _) {
                this.compressedSize = v, this.uncompressedSize = w, this.crc32 = y, this.compression = h, this.compressedContent = _;
              }
              d.prototype = { getContentWorker: function() {
                var v = new i(u.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new s("data_length")), w = this;
                return v.on("end", function() {
                  if (this.streamInfo.data_length !== w.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
                }), v;
              }, getCompressedWorker: function() {
                return new i(u.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
              } }, d.createWorkerFrom = function(v, w, y) {
                return v.pipe(new e()).pipe(new s("uncompressedSize")).pipe(w.compressWorker(y)).pipe(new s("compressedSize")).withStreamInfo("compression", w);
              }, g.exports = d;
            }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(a, g, p) {
              var u = a("./stream/GenericWorker");
              p.STORE = { magic: "\0\0", compressWorker: function(i) {
                return new u("STORE compression");
              }, uncompressWorker: function() {
                return new u("STORE decompression");
              } }, p.DEFLATE = a("./flate");
            }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(a, g, p) {
              var u = a("./utils"), i = (function() {
                for (var e, s = [], d = 0; d < 256; d++) {
                  e = d;
                  for (var v = 0; v < 8; v++) e = 1 & e ? 3988292384 ^ e >>> 1 : e >>> 1;
                  s[d] = e;
                }
                return s;
              })();
              g.exports = function(e, s) {
                return e !== void 0 && e.length ? u.getTypeOf(e) !== "string" ? (function(d, v, w, y) {
                  var h = i, _ = y + w;
                  d ^= -1;
                  for (var c = y; c < _; c++) d = d >>> 8 ^ h[255 & (d ^ v[c])];
                  return -1 ^ d;
                })(0 | s, e, e.length, 0) : (function(d, v, w, y) {
                  var h = i, _ = y + w;
                  d ^= -1;
                  for (var c = y; c < _; c++) d = d >>> 8 ^ h[255 & (d ^ v.charCodeAt(c))];
                  return -1 ^ d;
                })(0 | s, e, e.length, 0) : 0;
              };
            }, { "./utils": 32 }], 5: [function(a, g, p) {
              p.base64 = !1, p.binary = !1, p.dir = !1, p.createFolders = !0, p.date = null, p.compression = null, p.compressionOptions = null, p.comment = null, p.unixPermissions = null, p.dosPermissions = null;
            }, {}], 6: [function(a, g, p) {
              var u = null;
              u = typeof Promise < "u" ? Promise : a("lie"), g.exports = { Promise: u };
            }, { lie: 37 }], 7: [function(a, g, p) {
              var u = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", i = a("pako"), e = a("./utils"), s = a("./stream/GenericWorker"), d = u ? "uint8array" : "array";
              function v(w, y) {
                s.call(this, "FlateWorker/" + w), this._pako = null, this._pakoAction = w, this._pakoOptions = y, this.meta = {};
              }
              p.magic = "\b\0", e.inherits(v, s), v.prototype.processChunk = function(w) {
                this.meta = w.meta, this._pako === null && this._createPako(), this._pako.push(e.transformTo(d, w.data), !1);
              }, v.prototype.flush = function() {
                s.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
              }, v.prototype.cleanUp = function() {
                s.prototype.cleanUp.call(this), this._pako = null;
              }, v.prototype._createPako = function() {
                this._pako = new i[this._pakoAction]({ raw: !0, level: this._pakoOptions.level || -1 });
                var w = this;
                this._pako.onData = function(y) {
                  w.push({ data: y, meta: w.meta });
                };
              }, p.compressWorker = function(w) {
                return new v("Deflate", w);
              }, p.uncompressWorker = function() {
                return new v("Inflate", {});
              };
            }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(a, g, p) {
              function u(h, _) {
                var c, n = "";
                for (c = 0; c < _; c++) n += String.fromCharCode(255 & h), h >>>= 8;
                return n;
              }
              function i(h, _, c, n, r, m) {
                var T, z, I = h.file, A = h.compression, O = m !== d.utf8encode, B = e.transformTo("string", m(I.name)), k = e.transformTo("string", d.utf8encode(I.name)), W = I.comment, ee = e.transformTo("string", m(W)), F = e.transformTo("string", d.utf8encode(W)), Y = k.length !== I.name.length, x = F.length !== W.length, K = "", pe = "", ne = "", ce = I.dir, ie = I.date, ye = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                _ && !c || (ye.crc32 = h.crc32, ye.compressedSize = h.compressedSize, ye.uncompressedSize = h.uncompressedSize);
                var j = 0;
                _ && (j |= 8), O || !Y && !x || (j |= 2048);
                var Q = 0, we = 0;
                ce && (Q |= 16), r === "UNIX" ? (we = 798, Q |= (function(le, Re) {
                  var Ce = le;
                  return le || (Ce = Re ? 16893 : 33204), (65535 & Ce) << 16;
                })(I.unixPermissions, ce)) : (we = 20, Q |= (function(le) {
                  return 63 & (le || 0);
                })(I.dosPermissions)), T = ie.getUTCHours(), T <<= 6, T |= ie.getUTCMinutes(), T <<= 5, T |= ie.getUTCSeconds() / 2, z = ie.getUTCFullYear() - 1980, z <<= 4, z |= ie.getUTCMonth() + 1, z <<= 5, z |= ie.getUTCDate(), Y && (pe = u(1, 1) + u(v(B), 4) + k, K += "up" + u(pe.length, 2) + pe), x && (ne = u(1, 1) + u(v(ee), 4) + F, K += "uc" + u(ne.length, 2) + ne);
                var he = "";
                return he += `
\0`, he += u(j, 2), he += A.magic, he += u(T, 2), he += u(z, 2), he += u(ye.crc32, 4), he += u(ye.compressedSize, 4), he += u(ye.uncompressedSize, 4), he += u(B.length, 2), he += u(K.length, 2), { fileRecord: w.LOCAL_FILE_HEADER + he + B + K, dirRecord: w.CENTRAL_FILE_HEADER + u(we, 2) + he + u(ee.length, 2) + "\0\0\0\0" + u(Q, 4) + u(n, 4) + B + K + ee };
              }
              var e = a("../utils"), s = a("../stream/GenericWorker"), d = a("../utf8"), v = a("../crc32"), w = a("../signature");
              function y(h, _, c, n) {
                s.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = _, this.zipPlatform = c, this.encodeFileName = n, this.streamFiles = h, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
              }
              e.inherits(y, s), y.prototype.push = function(h) {
                var _ = h.meta.percent || 0, c = this.entriesCount, n = this._sources.length;
                this.accumulate ? this.contentBuffer.push(h) : (this.bytesWritten += h.data.length, s.prototype.push.call(this, { data: h.data, meta: { currentFile: this.currentFile, percent: c ? (_ + 100 * (c - n - 1)) / c : 100 } }));
              }, y.prototype.openedSource = function(h) {
                this.currentSourceOffset = this.bytesWritten, this.currentFile = h.file.name;
                var _ = this.streamFiles && !h.file.dir;
                if (_) {
                  var c = i(h, _, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                  this.push({ data: c.fileRecord, meta: { percent: 0 } });
                } else this.accumulate = !0;
              }, y.prototype.closedSource = function(h) {
                this.accumulate = !1;
                var _ = this.streamFiles && !h.file.dir, c = i(h, _, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                if (this.dirRecords.push(c.dirRecord), _) this.push({ data: (function(n) {
                  return w.DATA_DESCRIPTOR + u(n.crc32, 4) + u(n.compressedSize, 4) + u(n.uncompressedSize, 4);
                })(h), meta: { percent: 100 } });
                else for (this.push({ data: c.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
                this.currentFile = null;
              }, y.prototype.flush = function() {
                for (var h = this.bytesWritten, _ = 0; _ < this.dirRecords.length; _++) this.push({ data: this.dirRecords[_], meta: { percent: 100 } });
                var c = this.bytesWritten - h, n = (function(r, m, T, z, I) {
                  var A = e.transformTo("string", I(z));
                  return w.CENTRAL_DIRECTORY_END + "\0\0\0\0" + u(r, 2) + u(r, 2) + u(m, 4) + u(T, 4) + u(A.length, 2) + A;
                })(this.dirRecords.length, c, h, this.zipComment, this.encodeFileName);
                this.push({ data: n, meta: { percent: 100 } });
              }, y.prototype.prepareNextSource = function() {
                this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
              }, y.prototype.registerPrevious = function(h) {
                this._sources.push(h);
                var _ = this;
                return h.on("data", function(c) {
                  _.processChunk(c);
                }), h.on("end", function() {
                  _.closedSource(_.previous.streamInfo), _._sources.length ? _.prepareNextSource() : _.end();
                }), h.on("error", function(c) {
                  _.error(c);
                }), this;
              }, y.prototype.resume = function() {
                return !!s.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0));
              }, y.prototype.error = function(h) {
                var _ = this._sources;
                if (!s.prototype.error.call(this, h)) return !1;
                for (var c = 0; c < _.length; c++) try {
                  _[c].error(h);
                } catch {
                }
                return !0;
              }, y.prototype.lock = function() {
                s.prototype.lock.call(this);
                for (var h = this._sources, _ = 0; _ < h.length; _++) h[_].lock();
              }, g.exports = y;
            }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(a, g, p) {
              var u = a("../compressions"), i = a("./ZipFileWorker");
              p.generateWorker = function(e, s, d) {
                var v = new i(s.streamFiles, d, s.platform, s.encodeFileName), w = 0;
                try {
                  e.forEach(function(y, h) {
                    w++;
                    var _ = (function(m, T) {
                      var z = m || T, I = u[z];
                      if (!I) throw new Error(z + " is not a valid compression method !");
                      return I;
                    })(h.options.compression, s.compression), c = h.options.compressionOptions || s.compressionOptions || {}, n = h.dir, r = h.date;
                    h._compressWorker(_, c).withStreamInfo("file", { name: y, dir: n, date: r, comment: h.comment || "", unixPermissions: h.unixPermissions, dosPermissions: h.dosPermissions }).pipe(v);
                  }), v.entriesCount = w;
                } catch (y) {
                  v.error(y);
                }
                return v;
              };
            }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(a, g, p) {
              function u() {
                if (!(this instanceof u)) return new u();
                if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
                this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
                  var i = new u();
                  for (var e in this) typeof this[e] != "function" && (i[e] = this[e]);
                  return i;
                };
              }
              (u.prototype = a("./object")).loadAsync = a("./load"), u.support = a("./support"), u.defaults = a("./defaults"), u.version = "3.7.1", u.loadAsync = function(i, e) {
                return new u().loadAsync(i, e);
              }, u.external = a("./external"), g.exports = u;
            }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(a, g, p) {
              var u = a("./utils"), i = a("./external"), e = a("./utf8"), s = a("./zipEntries"), d = a("./stream/Crc32Probe"), v = a("./nodejsUtils");
              function w(y) {
                return new i.Promise(function(h, _) {
                  var c = y.decompressed.getContentWorker().pipe(new d());
                  c.on("error", function(n) {
                    _(n);
                  }).on("end", function() {
                    c.streamInfo.crc32 !== y.decompressed.crc32 ? _(new Error("Corrupted zip : CRC32 mismatch")) : h();
                  }).resume();
                });
              }
              g.exports = function(y, h) {
                var _ = this;
                return h = u.extend(h || {}, { base64: !1, checkCRC32: !1, optimizedBinaryString: !1, createFolders: !1, decodeFileName: e.utf8decode }), v.isNode && v.isStream(y) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", y, !0, h.optimizedBinaryString, h.base64).then(function(c) {
                  var n = new s(h);
                  return n.load(c), n;
                }).then(function(c) {
                  var n = [i.Promise.resolve(c)], r = c.files;
                  if (h.checkCRC32) for (var m = 0; m < r.length; m++) n.push(w(r[m]));
                  return i.Promise.all(n);
                }).then(function(c) {
                  for (var n = c.shift(), r = n.files, m = 0; m < r.length; m++) {
                    var T = r[m];
                    _.file(T.fileNameStr, T.decompressed, { binary: !0, optimizedBinaryString: !0, date: T.date, dir: T.dir, comment: T.fileCommentStr.length ? T.fileCommentStr : null, unixPermissions: T.unixPermissions, dosPermissions: T.dosPermissions, createFolders: h.createFolders });
                  }
                  return n.zipComment.length && (_.comment = n.zipComment), _;
                });
              };
            }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(a, g, p) {
              var u = a("../utils"), i = a("../stream/GenericWorker");
              function e(s, d) {
                i.call(this, "Nodejs stream input adapter for " + s), this._upstreamEnded = !1, this._bindStream(d);
              }
              u.inherits(e, i), e.prototype._bindStream = function(s) {
                var d = this;
                (this._stream = s).pause(), s.on("data", function(v) {
                  d.push({ data: v, meta: { percent: 0 } });
                }).on("error", function(v) {
                  d.isPaused ? this.generatedError = v : d.error(v);
                }).on("end", function() {
                  d.isPaused ? d._upstreamEnded = !0 : d.end();
                });
              }, e.prototype.pause = function() {
                return !!i.prototype.pause.call(this) && (this._stream.pause(), !0);
              }, e.prototype.resume = function() {
                return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0);
              }, g.exports = e;
            }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(a, g, p) {
              var u = a("readable-stream").Readable;
              function i(e, s, d) {
                u.call(this, s), this._helper = e;
                var v = this;
                e.on("data", function(w, y) {
                  v.push(w) || v._helper.pause(), d && d(y);
                }).on("error", function(w) {
                  v.emit("error", w);
                }).on("end", function() {
                  v.push(null);
                });
              }
              a("../utils").inherits(i, u), i.prototype._read = function() {
                this._helper.resume();
              }, g.exports = i;
            }, { "../utils": 32, "readable-stream": 16 }], 14: [function(a, g, p) {
              g.exports = { isNode: typeof E < "u", newBufferFrom: function(u, i) {
                if (E.from && E.from !== Uint8Array.from) return E.from(u, i);
                if (typeof u == "number") throw new Error('The "data" argument must not be a number');
                return new E(u, i);
              }, allocBuffer: function(u) {
                if (E.alloc) return E.alloc(u);
                var i = new E(u);
                return i.fill(0), i;
              }, isBuffer: function(u) {
                return E.isBuffer(u);
              }, isStream: function(u) {
                return u && typeof u.on == "function" && typeof u.pause == "function" && typeof u.resume == "function";
              } };
            }, {}], 15: [function(a, g, p) {
              function u(I, A, O) {
                var B, k = e.getTypeOf(A), W = e.extend(O || {}, v);
                W.date = W.date || /* @__PURE__ */ new Date(), W.compression !== null && (W.compression = W.compression.toUpperCase()), typeof W.unixPermissions == "string" && (W.unixPermissions = parseInt(W.unixPermissions, 8)), W.unixPermissions && 16384 & W.unixPermissions && (W.dir = !0), W.dosPermissions && 16 & W.dosPermissions && (W.dir = !0), W.dir && (I = r(I)), W.createFolders && (B = n(I)) && m.call(this, B, !0);
                var ee = k === "string" && W.binary === !1 && W.base64 === !1;
                O && O.binary !== void 0 || (W.binary = !ee), (A instanceof w && A.uncompressedSize === 0 || W.dir || !A || A.length === 0) && (W.base64 = !1, W.binary = !0, A = "", W.compression = "STORE", k = "string");
                var F = null;
                F = A instanceof w || A instanceof s ? A : _.isNode && _.isStream(A) ? new c(I, A) : e.prepareContent(I, A, W.binary, W.optimizedBinaryString, W.base64);
                var Y = new y(I, F, W);
                this.files[I] = Y;
              }
              var i = a("./utf8"), e = a("./utils"), s = a("./stream/GenericWorker"), d = a("./stream/StreamHelper"), v = a("./defaults"), w = a("./compressedObject"), y = a("./zipObject"), h = a("./generate"), _ = a("./nodejsUtils"), c = a("./nodejs/NodejsStreamInputAdapter"), n = function(I) {
                I.slice(-1) === "/" && (I = I.substring(0, I.length - 1));
                var A = I.lastIndexOf("/");
                return 0 < A ? I.substring(0, A) : "";
              }, r = function(I) {
                return I.slice(-1) !== "/" && (I += "/"), I;
              }, m = function(I, A) {
                return A = A !== void 0 ? A : v.createFolders, I = r(I), this.files[I] || u.call(this, I, null, { dir: !0, createFolders: A }), this.files[I];
              };
              function T(I) {
                return Object.prototype.toString.call(I) === "[object RegExp]";
              }
              var z = { load: function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, forEach: function(I) {
                var A, O, B;
                for (A in this.files) B = this.files[A], (O = A.slice(this.root.length, A.length)) && A.slice(0, this.root.length) === this.root && I(O, B);
              }, filter: function(I) {
                var A = [];
                return this.forEach(function(O, B) {
                  I(O, B) && A.push(B);
                }), A;
              }, file: function(I, A, O) {
                if (arguments.length !== 1) return I = this.root + I, u.call(this, I, A, O), this;
                if (T(I)) {
                  var B = I;
                  return this.filter(function(W, ee) {
                    return !ee.dir && B.test(W);
                  });
                }
                var k = this.files[this.root + I];
                return k && !k.dir ? k : null;
              }, folder: function(I) {
                if (!I) return this;
                if (T(I)) return this.filter(function(k, W) {
                  return W.dir && I.test(k);
                });
                var A = this.root + I, O = m.call(this, A), B = this.clone();
                return B.root = O.name, B;
              }, remove: function(I) {
                I = this.root + I;
                var A = this.files[I];
                if (A || (I.slice(-1) !== "/" && (I += "/"), A = this.files[I]), A && !A.dir) delete this.files[I];
                else for (var O = this.filter(function(k, W) {
                  return W.name.slice(0, I.length) === I;
                }), B = 0; B < O.length; B++) delete this.files[O[B].name];
                return this;
              }, generate: function(I) {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, generateInternalStream: function(I) {
                var A, O = {};
                try {
                  if ((O = e.extend(I || {}, { streamFiles: !1, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = O.type.toLowerCase(), O.compression = O.compression.toUpperCase(), O.type === "binarystring" && (O.type = "string"), !O.type) throw new Error("No output type specified.");
                  e.checkSupport(O.type), O.platform !== "darwin" && O.platform !== "freebsd" && O.platform !== "linux" && O.platform !== "sunos" || (O.platform = "UNIX"), O.platform === "win32" && (O.platform = "DOS");
                  var B = O.comment || this.comment || "";
                  A = h.generateWorker(this, O, B);
                } catch (k) {
                  (A = new s("error")).error(k);
                }
                return new d(A, O.type || "string", O.mimeType);
              }, generateAsync: function(I, A) {
                return this.generateInternalStream(I).accumulate(A);
              }, generateNodeStream: function(I, A) {
                return (I = I || {}).type || (I.type = "nodebuffer"), this.generateInternalStream(I).toNodejsStream(A);
              } };
              g.exports = z;
            }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(a, g, p) {
              g.exports = a("stream");
            }, { stream: void 0 }], 17: [function(a, g, p) {
              var u = a("./DataReader");
              function i(e) {
                u.call(this, e);
                for (var s = 0; s < this.data.length; s++) e[s] = 255 & e[s];
              }
              a("../utils").inherits(i, u), i.prototype.byteAt = function(e) {
                return this.data[this.zero + e];
              }, i.prototype.lastIndexOfSignature = function(e) {
                for (var s = e.charCodeAt(0), d = e.charCodeAt(1), v = e.charCodeAt(2), w = e.charCodeAt(3), y = this.length - 4; 0 <= y; --y) if (this.data[y] === s && this.data[y + 1] === d && this.data[y + 2] === v && this.data[y + 3] === w) return y - this.zero;
                return -1;
              }, i.prototype.readAndCheckSignature = function(e) {
                var s = e.charCodeAt(0), d = e.charCodeAt(1), v = e.charCodeAt(2), w = e.charCodeAt(3), y = this.readData(4);
                return s === y[0] && d === y[1] && v === y[2] && w === y[3];
              }, i.prototype.readData = function(e) {
                if (this.checkOffset(e), e === 0) return [];
                var s = this.data.slice(this.zero + this.index, this.zero + this.index + e);
                return this.index += e, s;
              }, g.exports = i;
            }, { "../utils": 32, "./DataReader": 18 }], 18: [function(a, g, p) {
              var u = a("../utils");
              function i(e) {
                this.data = e, this.length = e.length, this.index = 0, this.zero = 0;
              }
              i.prototype = { checkOffset: function(e) {
                this.checkIndex(this.index + e);
              }, checkIndex: function(e) {
                if (this.length < this.zero + e || e < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e + "). Corrupted zip ?");
              }, setIndex: function(e) {
                this.checkIndex(e), this.index = e;
              }, skip: function(e) {
                this.setIndex(this.index + e);
              }, byteAt: function(e) {
              }, readInt: function(e) {
                var s, d = 0;
                for (this.checkOffset(e), s = this.index + e - 1; s >= this.index; s--) d = (d << 8) + this.byteAt(s);
                return this.index += e, d;
              }, readString: function(e) {
                return u.transformTo("string", this.readData(e));
              }, readData: function(e) {
              }, lastIndexOfSignature: function(e) {
              }, readAndCheckSignature: function(e) {
              }, readDate: function() {
                var e = this.readInt(4);
                return new Date(Date.UTC(1980 + (e >> 25 & 127), (e >> 21 & 15) - 1, e >> 16 & 31, e >> 11 & 31, e >> 5 & 63, (31 & e) << 1));
              } }, g.exports = i;
            }, { "../utils": 32 }], 19: [function(a, g, p) {
              var u = a("./Uint8ArrayReader");
              function i(e) {
                u.call(this, e);
              }
              a("../utils").inherits(i, u), i.prototype.readData = function(e) {
                this.checkOffset(e);
                var s = this.data.slice(this.zero + this.index, this.zero + this.index + e);
                return this.index += e, s;
              }, g.exports = i;
            }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(a, g, p) {
              var u = a("./DataReader");
              function i(e) {
                u.call(this, e);
              }
              a("../utils").inherits(i, u), i.prototype.byteAt = function(e) {
                return this.data.charCodeAt(this.zero + e);
              }, i.prototype.lastIndexOfSignature = function(e) {
                return this.data.lastIndexOf(e) - this.zero;
              }, i.prototype.readAndCheckSignature = function(e) {
                return e === this.readData(4);
              }, i.prototype.readData = function(e) {
                this.checkOffset(e);
                var s = this.data.slice(this.zero + this.index, this.zero + this.index + e);
                return this.index += e, s;
              }, g.exports = i;
            }, { "../utils": 32, "./DataReader": 18 }], 21: [function(a, g, p) {
              var u = a("./ArrayReader");
              function i(e) {
                u.call(this, e);
              }
              a("../utils").inherits(i, u), i.prototype.readData = function(e) {
                if (this.checkOffset(e), e === 0) return new Uint8Array(0);
                var s = this.data.subarray(this.zero + this.index, this.zero + this.index + e);
                return this.index += e, s;
              }, g.exports = i;
            }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(a, g, p) {
              var u = a("../utils"), i = a("../support"), e = a("./ArrayReader"), s = a("./StringReader"), d = a("./NodeBufferReader"), v = a("./Uint8ArrayReader");
              g.exports = function(w) {
                var y = u.getTypeOf(w);
                return u.checkSupport(y), y !== "string" || i.uint8array ? y === "nodebuffer" ? new d(w) : i.uint8array ? new v(u.transformTo("uint8array", w)) : new e(u.transformTo("array", w)) : new s(w);
              };
            }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(a, g, p) {
              p.LOCAL_FILE_HEADER = "PK", p.CENTRAL_FILE_HEADER = "PK", p.CENTRAL_DIRECTORY_END = "PK", p.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", p.ZIP64_CENTRAL_DIRECTORY_END = "PK", p.DATA_DESCRIPTOR = "PK\x07\b";
            }, {}], 24: [function(a, g, p) {
              var u = a("./GenericWorker"), i = a("../utils");
              function e(s) {
                u.call(this, "ConvertWorker to " + s), this.destType = s;
              }
              i.inherits(e, u), e.prototype.processChunk = function(s) {
                this.push({ data: i.transformTo(this.destType, s.data), meta: s.meta });
              }, g.exports = e;
            }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(a, g, p) {
              var u = a("./GenericWorker"), i = a("../crc32");
              function e() {
                u.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              a("../utils").inherits(e, u), e.prototype.processChunk = function(s) {
                this.streamInfo.crc32 = i(s.data, this.streamInfo.crc32 || 0), this.push(s);
              }, g.exports = e;
            }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(a, g, p) {
              var u = a("../utils"), i = a("./GenericWorker");
              function e(s) {
                i.call(this, "DataLengthProbe for " + s), this.propName = s, this.withStreamInfo(s, 0);
              }
              u.inherits(e, i), e.prototype.processChunk = function(s) {
                if (s) {
                  var d = this.streamInfo[this.propName] || 0;
                  this.streamInfo[this.propName] = d + s.data.length;
                }
                i.prototype.processChunk.call(this, s);
              }, g.exports = e;
            }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(a, g, p) {
              var u = a("../utils"), i = a("./GenericWorker");
              function e(s) {
                i.call(this, "DataWorker");
                var d = this;
                this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, s.then(function(v) {
                  d.dataIsReady = !0, d.data = v, d.max = v && v.length || 0, d.type = u.getTypeOf(v), d.isPaused || d._tickAndRepeat();
                }, function(v) {
                  d.error(v);
                });
              }
              u.inherits(e, i), e.prototype.cleanUp = function() {
                i.prototype.cleanUp.call(this), this.data = null;
              }, e.prototype.resume = function() {
                return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, u.delay(this._tickAndRepeat, [], this)), !0);
              }, e.prototype._tickAndRepeat = function() {
                this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (u.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
              }, e.prototype._tick = function() {
                if (this.isPaused || this.isFinished) return !1;
                var s = null, d = Math.min(this.max, this.index + 16384);
                if (this.index >= this.max) return this.end();
                switch (this.type) {
                  case "string":
                    s = this.data.substring(this.index, d);
                    break;
                  case "uint8array":
                    s = this.data.subarray(this.index, d);
                    break;
                  case "array":
                  case "nodebuffer":
                    s = this.data.slice(this.index, d);
                }
                return this.index = d, this.push({ data: s, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
              }, g.exports = e;
            }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(a, g, p) {
              function u(i) {
                this.name = i || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
              }
              u.prototype = { push: function(i) {
                this.emit("data", i);
              }, end: function() {
                if (this.isFinished) return !1;
                this.flush();
                try {
                  this.emit("end"), this.cleanUp(), this.isFinished = !0;
                } catch (i) {
                  this.emit("error", i);
                }
                return !0;
              }, error: function(i) {
                return !this.isFinished && (this.isPaused ? this.generatedError = i : (this.isFinished = !0, this.emit("error", i), this.previous && this.previous.error(i), this.cleanUp()), !0);
              }, on: function(i, e) {
                return this._listeners[i].push(e), this;
              }, cleanUp: function() {
                this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
              }, emit: function(i, e) {
                if (this._listeners[i]) for (var s = 0; s < this._listeners[i].length; s++) this._listeners[i][s].call(this, e);
              }, pipe: function(i) {
                return i.registerPrevious(this);
              }, registerPrevious: function(i) {
                if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
                this.streamInfo = i.streamInfo, this.mergeStreamInfo(), this.previous = i;
                var e = this;
                return i.on("data", function(s) {
                  e.processChunk(s);
                }), i.on("end", function() {
                  e.end();
                }), i.on("error", function(s) {
                  e.error(s);
                }), this;
              }, pause: function() {
                return !this.isPaused && !this.isFinished && (this.isPaused = !0, this.previous && this.previous.pause(), !0);
              }, resume: function() {
                if (!this.isPaused || this.isFinished) return !1;
                var i = this.isPaused = !1;
                return this.generatedError && (this.error(this.generatedError), i = !0), this.previous && this.previous.resume(), !i;
              }, flush: function() {
              }, processChunk: function(i) {
                this.push(i);
              }, withStreamInfo: function(i, e) {
                return this.extraStreamInfo[i] = e, this.mergeStreamInfo(), this;
              }, mergeStreamInfo: function() {
                for (var i in this.extraStreamInfo) this.extraStreamInfo.hasOwnProperty(i) && (this.streamInfo[i] = this.extraStreamInfo[i]);
              }, lock: function() {
                if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
                this.isLocked = !0, this.previous && this.previous.lock();
              }, toString: function() {
                var i = "Worker " + this.name;
                return this.previous ? this.previous + " -> " + i : i;
              } }, g.exports = u;
            }, {}], 29: [function(a, g, p) {
              var u = a("../utils"), i = a("./ConvertWorker"), e = a("./GenericWorker"), s = a("../base64"), d = a("../support"), v = a("../external"), w = null;
              if (d.nodestream) try {
                w = a("../nodejs/NodejsStreamOutputAdapter");
              } catch {
              }
              function y(_, c) {
                return new v.Promise(function(n, r) {
                  var m = [], T = _._internalType, z = _._outputType, I = _._mimeType;
                  _.on("data", function(A, O) {
                    m.push(A), c && c(O);
                  }).on("error", function(A) {
                    m = [], r(A);
                  }).on("end", function() {
                    try {
                      var A = (function(O, B, k) {
                        switch (O) {
                          case "blob":
                            return u.newBlob(u.transformTo("arraybuffer", B), k);
                          case "base64":
                            return s.encode(B);
                          default:
                            return u.transformTo(O, B);
                        }
                      })(z, (function(O, B) {
                        var k, W = 0, ee = null, F = 0;
                        for (k = 0; k < B.length; k++) F += B[k].length;
                        switch (O) {
                          case "string":
                            return B.join("");
                          case "array":
                            return Array.prototype.concat.apply([], B);
                          case "uint8array":
                            for (ee = new Uint8Array(F), k = 0; k < B.length; k++) ee.set(B[k], W), W += B[k].length;
                            return ee;
                          case "nodebuffer":
                            return E.concat(B);
                          default:
                            throw new Error("concat : unsupported type '" + O + "'");
                        }
                      })(T, m), I);
                      n(A);
                    } catch (O) {
                      r(O);
                    }
                    m = [];
                  }).resume();
                });
              }
              function h(_, c, n) {
                var r = c;
                switch (c) {
                  case "blob":
                  case "arraybuffer":
                    r = "uint8array";
                    break;
                  case "base64":
                    r = "string";
                }
                try {
                  this._internalType = r, this._outputType = c, this._mimeType = n, u.checkSupport(r), this._worker = _.pipe(new i(r)), _.lock();
                } catch (m) {
                  this._worker = new e("error"), this._worker.error(m);
                }
              }
              h.prototype = { accumulate: function(_) {
                return y(this, _);
              }, on: function(_, c) {
                var n = this;
                return _ === "data" ? this._worker.on(_, function(r) {
                  c.call(n, r.data, r.meta);
                }) : this._worker.on(_, function() {
                  u.delay(c, arguments, n);
                }), this;
              }, resume: function() {
                return u.delay(this._worker.resume, [], this._worker), this;
              }, pause: function() {
                return this._worker.pause(), this;
              }, toNodejsStream: function(_) {
                if (u.checkSupport("nodestream"), this._outputType !== "nodebuffer") throw new Error(this._outputType + " is not supported by this method");
                return new w(this, { objectMode: this._outputType !== "nodebuffer" }, _);
              } }, g.exports = h;
            }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(a, g, p) {
              if (p.base64 = !0, p.array = !0, p.string = !0, p.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", p.nodebuffer = typeof E < "u", p.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u") p.blob = !1;
              else {
                var u = new ArrayBuffer(0);
                try {
                  p.blob = new Blob([u], { type: "application/zip" }).size === 0;
                } catch {
                  try {
                    var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                    i.append(u), p.blob = i.getBlob("application/zip").size === 0;
                  } catch {
                    p.blob = !1;
                  }
                }
              }
              try {
                p.nodestream = !!a("readable-stream").Readable;
              } catch {
                p.nodestream = !1;
              }
            }, { "readable-stream": 16 }], 31: [function(a, g, p) {
              for (var u = a("./utils"), i = a("./support"), e = a("./nodejsUtils"), s = a("./stream/GenericWorker"), d = new Array(256), v = 0; v < 256; v++) d[v] = 252 <= v ? 6 : 248 <= v ? 5 : 240 <= v ? 4 : 224 <= v ? 3 : 192 <= v ? 2 : 1;
              d[254] = d[254] = 1;
              function w() {
                s.call(this, "utf-8 decode"), this.leftOver = null;
              }
              function y() {
                s.call(this, "utf-8 encode");
              }
              p.utf8encode = function(h) {
                return i.nodebuffer ? e.newBufferFrom(h, "utf-8") : (function(_) {
                  var c, n, r, m, T, z = _.length, I = 0;
                  for (m = 0; m < z; m++) (64512 & (n = _.charCodeAt(m))) == 55296 && m + 1 < z && (64512 & (r = _.charCodeAt(m + 1))) == 56320 && (n = 65536 + (n - 55296 << 10) + (r - 56320), m++), I += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4;
                  for (c = i.uint8array ? new Uint8Array(I) : new Array(I), m = T = 0; T < I; m++) (64512 & (n = _.charCodeAt(m))) == 55296 && m + 1 < z && (64512 & (r = _.charCodeAt(m + 1))) == 56320 && (n = 65536 + (n - 55296 << 10) + (r - 56320), m++), n < 128 ? c[T++] = n : (n < 2048 ? c[T++] = 192 | n >>> 6 : (n < 65536 ? c[T++] = 224 | n >>> 12 : (c[T++] = 240 | n >>> 18, c[T++] = 128 | n >>> 12 & 63), c[T++] = 128 | n >>> 6 & 63), c[T++] = 128 | 63 & n);
                  return c;
                })(h);
              }, p.utf8decode = function(h) {
                return i.nodebuffer ? u.transformTo("nodebuffer", h).toString("utf-8") : (function(_) {
                  var c, n, r, m, T = _.length, z = new Array(2 * T);
                  for (c = n = 0; c < T; ) if ((r = _[c++]) < 128) z[n++] = r;
                  else if (4 < (m = d[r])) z[n++] = 65533, c += m - 1;
                  else {
                    for (r &= m === 2 ? 31 : m === 3 ? 15 : 7; 1 < m && c < T; ) r = r << 6 | 63 & _[c++], m--;
                    1 < m ? z[n++] = 65533 : r < 65536 ? z[n++] = r : (r -= 65536, z[n++] = 55296 | r >> 10 & 1023, z[n++] = 56320 | 1023 & r);
                  }
                  return z.length !== n && (z.subarray ? z = z.subarray(0, n) : z.length = n), u.applyFromCharCode(z);
                })(h = u.transformTo(i.uint8array ? "uint8array" : "array", h));
              }, u.inherits(w, s), w.prototype.processChunk = function(h) {
                var _ = u.transformTo(i.uint8array ? "uint8array" : "array", h.data);
                if (this.leftOver && this.leftOver.length) {
                  if (i.uint8array) {
                    var c = _;
                    (_ = new Uint8Array(c.length + this.leftOver.length)).set(this.leftOver, 0), _.set(c, this.leftOver.length);
                  } else _ = this.leftOver.concat(_);
                  this.leftOver = null;
                }
                var n = (function(m, T) {
                  var z;
                  for ((T = T || m.length) > m.length && (T = m.length), z = T - 1; 0 <= z && (192 & m[z]) == 128; ) z--;
                  return z < 0 || z === 0 ? T : z + d[m[z]] > T ? z : T;
                })(_), r = _;
                n !== _.length && (i.uint8array ? (r = _.subarray(0, n), this.leftOver = _.subarray(n, _.length)) : (r = _.slice(0, n), this.leftOver = _.slice(n, _.length))), this.push({ data: p.utf8decode(r), meta: h.meta });
              }, w.prototype.flush = function() {
                this.leftOver && this.leftOver.length && (this.push({ data: p.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
              }, p.Utf8DecodeWorker = w, u.inherits(y, s), y.prototype.processChunk = function(h) {
                this.push({ data: p.utf8encode(h.data), meta: h.meta });
              }, p.Utf8EncodeWorker = y;
            }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(a, g, p) {
              var u = a("./support"), i = a("./base64"), e = a("./nodejsUtils"), s = a("set-immediate-shim"), d = a("./external");
              function v(n) {
                return n;
              }
              function w(n, r) {
                for (var m = 0; m < n.length; ++m) r[m] = 255 & n.charCodeAt(m);
                return r;
              }
              p.newBlob = function(n, r) {
                p.checkSupport("blob");
                try {
                  return new Blob([n], { type: r });
                } catch {
                  try {
                    var m = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                    return m.append(n), m.getBlob(r);
                  } catch {
                    throw new Error("Bug : can't construct the Blob.");
                  }
                }
              };
              var y = { stringifyByChunk: function(n, r, m) {
                var T = [], z = 0, I = n.length;
                if (I <= m) return String.fromCharCode.apply(null, n);
                for (; z < I; ) r === "array" || r === "nodebuffer" ? T.push(String.fromCharCode.apply(null, n.slice(z, Math.min(z + m, I)))) : T.push(String.fromCharCode.apply(null, n.subarray(z, Math.min(z + m, I)))), z += m;
                return T.join("");
              }, stringifyByChar: function(n) {
                for (var r = "", m = 0; m < n.length; m++) r += String.fromCharCode(n[m]);
                return r;
              }, applyCanBeUsed: { uint8array: (function() {
                try {
                  return u.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
                } catch {
                  return !1;
                }
              })(), nodebuffer: (function() {
                try {
                  return u.nodebuffer && String.fromCharCode.apply(null, e.allocBuffer(1)).length === 1;
                } catch {
                  return !1;
                }
              })() } };
              function h(n) {
                var r = 65536, m = p.getTypeOf(n), T = !0;
                if (m === "uint8array" ? T = y.applyCanBeUsed.uint8array : m === "nodebuffer" && (T = y.applyCanBeUsed.nodebuffer), T) for (; 1 < r; ) try {
                  return y.stringifyByChunk(n, m, r);
                } catch {
                  r = Math.floor(r / 2);
                }
                return y.stringifyByChar(n);
              }
              function _(n, r) {
                for (var m = 0; m < n.length; m++) r[m] = n[m];
                return r;
              }
              p.applyFromCharCode = h;
              var c = {};
              c.string = { string: v, array: function(n) {
                return w(n, new Array(n.length));
              }, arraybuffer: function(n) {
                return c.string.uint8array(n).buffer;
              }, uint8array: function(n) {
                return w(n, new Uint8Array(n.length));
              }, nodebuffer: function(n) {
                return w(n, e.allocBuffer(n.length));
              } }, c.array = { string: h, array: v, arraybuffer: function(n) {
                return new Uint8Array(n).buffer;
              }, uint8array: function(n) {
                return new Uint8Array(n);
              }, nodebuffer: function(n) {
                return e.newBufferFrom(n);
              } }, c.arraybuffer = { string: function(n) {
                return h(new Uint8Array(n));
              }, array: function(n) {
                return _(new Uint8Array(n), new Array(n.byteLength));
              }, arraybuffer: v, uint8array: function(n) {
                return new Uint8Array(n);
              }, nodebuffer: function(n) {
                return e.newBufferFrom(new Uint8Array(n));
              } }, c.uint8array = { string: h, array: function(n) {
                return _(n, new Array(n.length));
              }, arraybuffer: function(n) {
                return n.buffer;
              }, uint8array: v, nodebuffer: function(n) {
                return e.newBufferFrom(n);
              } }, c.nodebuffer = { string: h, array: function(n) {
                return _(n, new Array(n.length));
              }, arraybuffer: function(n) {
                return c.nodebuffer.uint8array(n).buffer;
              }, uint8array: function(n) {
                return _(n, new Uint8Array(n.length));
              }, nodebuffer: v }, p.transformTo = function(n, r) {
                if (r = r || "", !n) return r;
                p.checkSupport(n);
                var m = p.getTypeOf(r);
                return c[m][n](r);
              }, p.getTypeOf = function(n) {
                return typeof n == "string" ? "string" : Object.prototype.toString.call(n) === "[object Array]" ? "array" : u.nodebuffer && e.isBuffer(n) ? "nodebuffer" : u.uint8array && n instanceof Uint8Array ? "uint8array" : u.arraybuffer && n instanceof ArrayBuffer ? "arraybuffer" : void 0;
              }, p.checkSupport = function(n) {
                if (!u[n.toLowerCase()]) throw new Error(n + " is not supported by this platform");
              }, p.MAX_VALUE_16BITS = 65535, p.MAX_VALUE_32BITS = -1, p.pretty = function(n) {
                var r, m, T = "";
                for (m = 0; m < (n || "").length; m++) T += "\\x" + ((r = n.charCodeAt(m)) < 16 ? "0" : "") + r.toString(16).toUpperCase();
                return T;
              }, p.delay = function(n, r, m) {
                s(function() {
                  n.apply(m || null, r || []);
                });
              }, p.inherits = function(n, r) {
                function m() {
                }
                m.prototype = r.prototype, n.prototype = new m();
              }, p.extend = function() {
                var n, r, m = {};
                for (n = 0; n < arguments.length; n++) for (r in arguments[n]) arguments[n].hasOwnProperty(r) && m[r] === void 0 && (m[r] = arguments[n][r]);
                return m;
              }, p.prepareContent = function(n, r, m, T, z) {
                return d.Promise.resolve(r).then(function(I) {
                  return u.blob && (I instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(I)) !== -1) && typeof FileReader < "u" ? new d.Promise(function(A, O) {
                    var B = new FileReader();
                    B.onload = function(k) {
                      A(k.target.result);
                    }, B.onerror = function(k) {
                      O(k.target.error);
                    }, B.readAsArrayBuffer(I);
                  }) : I;
                }).then(function(I) {
                  var A = p.getTypeOf(I);
                  return A ? (A === "arraybuffer" ? I = p.transformTo("uint8array", I) : A === "string" && (z ? I = i.decode(I) : m && T !== !0 && (I = (function(O) {
                    return w(O, u.uint8array ? new Uint8Array(O.length) : new Array(O.length));
                  })(I))), I) : d.Promise.reject(new Error("Can't read the data of '" + n + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
                });
              };
            }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, "set-immediate-shim": 54 }], 33: [function(a, g, p) {
              var u = a("./reader/readerFor"), i = a("./utils"), e = a("./signature"), s = a("./zipEntry"), d = (a("./utf8"), a("./support"));
              function v(w) {
                this.files = [], this.loadOptions = w;
              }
              v.prototype = { checkSignature: function(w) {
                if (!this.reader.readAndCheckSignature(w)) {
                  this.reader.index -= 4;
                  var y = this.reader.readString(4);
                  throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(y) + ", expected " + i.pretty(w) + ")");
                }
              }, isSignature: function(w, y) {
                var h = this.reader.index;
                this.reader.setIndex(w);
                var _ = this.reader.readString(4) === y;
                return this.reader.setIndex(h), _;
              }, readBlockEndOfCentral: function() {
                this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
                var w = this.reader.readData(this.zipCommentLength), y = d.uint8array ? "uint8array" : "array", h = i.transformTo(y, w);
                this.zipComment = this.loadOptions.decodeFileName(h);
              }, readBlockZip64EndOfCentral: function() {
                this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
                for (var w, y, h, _ = this.zip64EndOfCentralSize - 44; 0 < _; ) w = this.reader.readInt(2), y = this.reader.readInt(4), h = this.reader.readData(y), this.zip64ExtensibleData[w] = { id: w, length: y, value: h };
              }, readBlockZip64EndOfCentralLocator: function() {
                if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
              }, readLocalFiles: function() {
                var w, y;
                for (w = 0; w < this.files.length; w++) y = this.files[w], this.reader.setIndex(y.localHeaderOffset), this.checkSignature(e.LOCAL_FILE_HEADER), y.readLocalPart(this.reader), y.handleUTF8(), y.processAttributes();
              }, readCentralDir: function() {
                var w;
                for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(e.CENTRAL_FILE_HEADER); ) (w = new s({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(w);
                if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
              }, readEndOfCentral: function() {
                var w = this.reader.lastIndexOfSignature(e.CENTRAL_DIRECTORY_END);
                if (w < 0) throw this.isSignature(0, e.LOCAL_FILE_HEADER) ? new Error("Corrupted zip: can't find end of central directory") : new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
                this.reader.setIndex(w);
                var y = w;
                if (this.checkSignature(e.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
                  if (this.zip64 = !0, (w = this.reader.lastIndexOfSignature(e.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
                  if (this.reader.setIndex(w), this.checkSignature(e.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, e.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(e.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                  this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(e.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
                }
                var h = this.centralDirOffset + this.centralDirSize;
                this.zip64 && (h += 20, h += 12 + this.zip64EndOfCentralSize);
                var _ = y - h;
                if (0 < _) this.isSignature(y, e.CENTRAL_FILE_HEADER) || (this.reader.zero = _);
                else if (_ < 0) throw new Error("Corrupted zip: missing " + Math.abs(_) + " bytes.");
              }, prepareReader: function(w) {
                this.reader = u(w);
              }, load: function(w) {
                this.prepareReader(w), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
              } }, g.exports = v;
            }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utf8": 31, "./utils": 32, "./zipEntry": 34 }], 34: [function(a, g, p) {
              var u = a("./reader/readerFor"), i = a("./utils"), e = a("./compressedObject"), s = a("./crc32"), d = a("./utf8"), v = a("./compressions"), w = a("./support");
              function y(h, _) {
                this.options = h, this.loadOptions = _;
              }
              y.prototype = { isEncrypted: function() {
                return (1 & this.bitFlag) == 1;
              }, useUTF8: function() {
                return (2048 & this.bitFlag) == 2048;
              }, readLocalPart: function(h) {
                var _, c;
                if (h.skip(22), this.fileNameLength = h.readInt(2), c = h.readInt(2), this.fileName = h.readData(this.fileNameLength), h.skip(c), this.compressedSize === -1 || this.uncompressedSize === -1) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
                if ((_ = (function(n) {
                  for (var r in v) if (v.hasOwnProperty(r) && v[r].magic === n) return v[r];
                  return null;
                })(this.compressionMethod)) === null) throw new Error("Corrupted zip : compression " + i.pretty(this.compressionMethod) + " unknown (inner file : " + i.transformTo("string", this.fileName) + ")");
                this.decompressed = new e(this.compressedSize, this.uncompressedSize, this.crc32, _, h.readData(this.compressedSize));
              }, readCentralPart: function(h) {
                this.versionMadeBy = h.readInt(2), h.skip(2), this.bitFlag = h.readInt(2), this.compressionMethod = h.readString(2), this.date = h.readDate(), this.crc32 = h.readInt(4), this.compressedSize = h.readInt(4), this.uncompressedSize = h.readInt(4);
                var _ = h.readInt(2);
                if (this.extraFieldsLength = h.readInt(2), this.fileCommentLength = h.readInt(2), this.diskNumberStart = h.readInt(2), this.internalFileAttributes = h.readInt(2), this.externalFileAttributes = h.readInt(4), this.localHeaderOffset = h.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
                h.skip(_), this.readExtraFields(h), this.parseZIP64ExtraField(h), this.fileComment = h.readData(this.fileCommentLength);
              }, processAttributes: function() {
                this.unixPermissions = null, this.dosPermissions = null;
                var h = this.versionMadeBy >> 8;
                this.dir = !!(16 & this.externalFileAttributes), h == 0 && (this.dosPermissions = 63 & this.externalFileAttributes), h == 3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0);
              }, parseZIP64ExtraField: function(h) {
                if (this.extraFields[1]) {
                  var _ = u(this.extraFields[1].value);
                  this.uncompressedSize === i.MAX_VALUE_32BITS && (this.uncompressedSize = _.readInt(8)), this.compressedSize === i.MAX_VALUE_32BITS && (this.compressedSize = _.readInt(8)), this.localHeaderOffset === i.MAX_VALUE_32BITS && (this.localHeaderOffset = _.readInt(8)), this.diskNumberStart === i.MAX_VALUE_32BITS && (this.diskNumberStart = _.readInt(4));
                }
              }, readExtraFields: function(h) {
                var _, c, n, r = h.index + this.extraFieldsLength;
                for (this.extraFields || (this.extraFields = {}); h.index + 4 < r; ) _ = h.readInt(2), c = h.readInt(2), n = h.readData(c), this.extraFields[_] = { id: _, length: c, value: n };
                h.setIndex(r);
              }, handleUTF8: function() {
                var h = w.uint8array ? "uint8array" : "array";
                if (this.useUTF8()) this.fileNameStr = d.utf8decode(this.fileName), this.fileCommentStr = d.utf8decode(this.fileComment);
                else {
                  var _ = this.findExtraFieldUnicodePath();
                  if (_ !== null) this.fileNameStr = _;
                  else {
                    var c = i.transformTo(h, this.fileName);
                    this.fileNameStr = this.loadOptions.decodeFileName(c);
                  }
                  var n = this.findExtraFieldUnicodeComment();
                  if (n !== null) this.fileCommentStr = n;
                  else {
                    var r = i.transformTo(h, this.fileComment);
                    this.fileCommentStr = this.loadOptions.decodeFileName(r);
                  }
                }
              }, findExtraFieldUnicodePath: function() {
                var h = this.extraFields[28789];
                if (h) {
                  var _ = u(h.value);
                  return _.readInt(1) !== 1 || s(this.fileName) !== _.readInt(4) ? null : d.utf8decode(_.readData(h.length - 5));
                }
                return null;
              }, findExtraFieldUnicodeComment: function() {
                var h = this.extraFields[25461];
                if (h) {
                  var _ = u(h.value);
                  return _.readInt(1) !== 1 || s(this.fileComment) !== _.readInt(4) ? null : d.utf8decode(_.readData(h.length - 5));
                }
                return null;
              } }, g.exports = y;
            }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(a, g, p) {
              function u(_, c, n) {
                this.name = _, this.dir = n.dir, this.date = n.date, this.comment = n.comment, this.unixPermissions = n.unixPermissions, this.dosPermissions = n.dosPermissions, this._data = c, this._dataBinary = n.binary, this.options = { compression: n.compression, compressionOptions: n.compressionOptions };
              }
              var i = a("./stream/StreamHelper"), e = a("./stream/DataWorker"), s = a("./utf8"), d = a("./compressedObject"), v = a("./stream/GenericWorker");
              u.prototype = { internalStream: function(_) {
                var c = null, n = "string";
                try {
                  if (!_) throw new Error("No output type specified.");
                  var r = (n = _.toLowerCase()) === "string" || n === "text";
                  n !== "binarystring" && n !== "text" || (n = "string"), c = this._decompressWorker();
                  var m = !this._dataBinary;
                  m && !r && (c = c.pipe(new s.Utf8EncodeWorker())), !m && r && (c = c.pipe(new s.Utf8DecodeWorker()));
                } catch (T) {
                  (c = new v("error")).error(T);
                }
                return new i(c, n, "");
              }, async: function(_, c) {
                return this.internalStream(_).accumulate(c);
              }, nodeStream: function(_, c) {
                return this.internalStream(_ || "nodebuffer").toNodejsStream(c);
              }, _compressWorker: function(_, c) {
                if (this._data instanceof d && this._data.compression.magic === _.magic) return this._data.getCompressedWorker();
                var n = this._decompressWorker();
                return this._dataBinary || (n = n.pipe(new s.Utf8EncodeWorker())), d.createWorkerFrom(n, _, c);
              }, _decompressWorker: function() {
                return this._data instanceof d ? this._data.getContentWorker() : this._data instanceof v ? this._data : new e(this._data);
              } };
              for (var w = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], y = function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
              }, h = 0; h < w.length; h++) u.prototype[w[h]] = y;
              g.exports = u;
            }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(a, g, p) {
              (function(u) {
                var i, e, s = u.MutationObserver || u.WebKitMutationObserver;
                if (s) {
                  var d = 0, v = new s(_), w = u.document.createTextNode("");
                  v.observe(w, { characterData: !0 }), i = function() {
                    w.data = d = ++d % 2;
                  };
                } else if (u.setImmediate || u.MessageChannel === void 0) i = "document" in u && "onreadystatechange" in u.document.createElement("script") ? function() {
                  var c = u.document.createElement("script");
                  c.onreadystatechange = function() {
                    _(), c.onreadystatechange = null, c.parentNode.removeChild(c), c = null;
                  }, u.document.documentElement.appendChild(c);
                } : function() {
                  setTimeout(_, 0);
                };
                else {
                  var y = new u.MessageChannel();
                  y.port1.onmessage = _, i = function() {
                    y.port2.postMessage(0);
                  };
                }
                var h = [];
                function _() {
                  var c, n;
                  e = !0;
                  for (var r = h.length; r; ) {
                    for (n = h, h = [], c = -1; ++c < r; ) n[c]();
                    r = h.length;
                  }
                  e = !1;
                }
                g.exports = function(c) {
                  h.push(c) !== 1 || e || i();
                };
              }).call(this, typeof M < "u" ? M : typeof self < "u" ? self : typeof window < "u" ? window : {});
            }, {}], 37: [function(a, g, p) {
              var u = a("immediate");
              function i() {
              }
              var e = {}, s = ["REJECTED"], d = ["FULFILLED"], v = ["PENDING"];
              function w(r) {
                if (typeof r != "function") throw new TypeError("resolver must be a function");
                this.state = v, this.queue = [], this.outcome = void 0, r !== i && c(this, r);
              }
              function y(r, m, T) {
                this.promise = r, typeof m == "function" && (this.onFulfilled = m, this.callFulfilled = this.otherCallFulfilled), typeof T == "function" && (this.onRejected = T, this.callRejected = this.otherCallRejected);
              }
              function h(r, m, T) {
                u(function() {
                  var z;
                  try {
                    z = m(T);
                  } catch (I) {
                    return e.reject(r, I);
                  }
                  z === r ? e.reject(r, new TypeError("Cannot resolve promise with itself")) : e.resolve(r, z);
                });
              }
              function _(r) {
                var m = r && r.then;
                if (r && (typeof r == "object" || typeof r == "function") && typeof m == "function") return function() {
                  m.apply(r, arguments);
                };
              }
              function c(r, m) {
                var T = !1;
                function z(O) {
                  T || (T = !0, e.reject(r, O));
                }
                function I(O) {
                  T || (T = !0, e.resolve(r, O));
                }
                var A = n(function() {
                  m(I, z);
                });
                A.status === "error" && z(A.value);
              }
              function n(r, m) {
                var T = {};
                try {
                  T.value = r(m), T.status = "success";
                } catch (z) {
                  T.status = "error", T.value = z;
                }
                return T;
              }
              (g.exports = w).prototype.finally = function(r) {
                if (typeof r != "function") return this;
                var m = this.constructor;
                return this.then(function(T) {
                  return m.resolve(r()).then(function() {
                    return T;
                  });
                }, function(T) {
                  return m.resolve(r()).then(function() {
                    throw T;
                  });
                });
              }, w.prototype.catch = function(r) {
                return this.then(null, r);
              }, w.prototype.then = function(r, m) {
                if (typeof r != "function" && this.state === d || typeof m != "function" && this.state === s) return this;
                var T = new this.constructor(i);
                return this.state !== v ? h(T, this.state === d ? r : m, this.outcome) : this.queue.push(new y(T, r, m)), T;
              }, y.prototype.callFulfilled = function(r) {
                e.resolve(this.promise, r);
              }, y.prototype.otherCallFulfilled = function(r) {
                h(this.promise, this.onFulfilled, r);
              }, y.prototype.callRejected = function(r) {
                e.reject(this.promise, r);
              }, y.prototype.otherCallRejected = function(r) {
                h(this.promise, this.onRejected, r);
              }, e.resolve = function(r, m) {
                var T = n(_, m);
                if (T.status === "error") return e.reject(r, T.value);
                var z = T.value;
                if (z) c(r, z);
                else {
                  r.state = d, r.outcome = m;
                  for (var I = -1, A = r.queue.length; ++I < A; ) r.queue[I].callFulfilled(m);
                }
                return r;
              }, e.reject = function(r, m) {
                r.state = s, r.outcome = m;
                for (var T = -1, z = r.queue.length; ++T < z; ) r.queue[T].callRejected(m);
                return r;
              }, w.resolve = function(r) {
                return r instanceof this ? r : e.resolve(new this(i), r);
              }, w.reject = function(r) {
                var m = new this(i);
                return e.reject(m, r);
              }, w.all = function(r) {
                var m = this;
                if (Object.prototype.toString.call(r) !== "[object Array]") return this.reject(new TypeError("must be an array"));
                var T = r.length, z = !1;
                if (!T) return this.resolve([]);
                for (var I = new Array(T), A = 0, O = -1, B = new this(i); ++O < T; ) k(r[O], O);
                return B;
                function k(W, ee) {
                  m.resolve(W).then(function(F) {
                    I[ee] = F, ++A !== T || z || (z = !0, e.resolve(B, I));
                  }, function(F) {
                    z || (z = !0, e.reject(B, F));
                  });
                }
              }, w.race = function(r) {
                var m = this;
                if (Object.prototype.toString.call(r) !== "[object Array]") return this.reject(new TypeError("must be an array"));
                var T = r.length, z = !1;
                if (!T) return this.resolve([]);
                for (var I = -1, A = new this(i); ++I < T; ) O = r[I], m.resolve(O).then(function(B) {
                  z || (z = !0, e.resolve(A, B));
                }, function(B) {
                  z || (z = !0, e.reject(A, B));
                });
                var O;
                return A;
              };
            }, { immediate: 36 }], 38: [function(a, g, p) {
              var u = {};
              (0, a("./lib/utils/common").assign)(u, a("./lib/deflate"), a("./lib/inflate"), a("./lib/zlib/constants")), g.exports = u;
            }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(a, g, p) {
              var u = a("./zlib/deflate"), i = a("./utils/common"), e = a("./utils/strings"), s = a("./zlib/messages"), d = a("./zlib/zstream"), v = Object.prototype.toString, w = 0, y = -1, h = 0, _ = 8;
              function c(r) {
                if (!(this instanceof c)) return new c(r);
                this.options = i.assign({ level: y, method: _, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: h, to: "" }, r || {});
                var m = this.options;
                m.raw && 0 < m.windowBits ? m.windowBits = -m.windowBits : m.gzip && 0 < m.windowBits && m.windowBits < 16 && (m.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new d(), this.strm.avail_out = 0;
                var T = u.deflateInit2(this.strm, m.level, m.method, m.windowBits, m.memLevel, m.strategy);
                if (T !== w) throw new Error(s[T]);
                if (m.header && u.deflateSetHeader(this.strm, m.header), m.dictionary) {
                  var z;
                  if (z = typeof m.dictionary == "string" ? e.string2buf(m.dictionary) : v.call(m.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(m.dictionary) : m.dictionary, (T = u.deflateSetDictionary(this.strm, z)) !== w) throw new Error(s[T]);
                  this._dict_set = !0;
                }
              }
              function n(r, m) {
                var T = new c(m);
                if (T.push(r, !0), T.err) throw T.msg || s[T.err];
                return T.result;
              }
              c.prototype.push = function(r, m) {
                var T, z, I = this.strm, A = this.options.chunkSize;
                if (this.ended) return !1;
                z = m === ~~m ? m : m === !0 ? 4 : 0, typeof r == "string" ? I.input = e.string2buf(r) : v.call(r) === "[object ArrayBuffer]" ? I.input = new Uint8Array(r) : I.input = r, I.next_in = 0, I.avail_in = I.input.length;
                do {
                  if (I.avail_out === 0 && (I.output = new i.Buf8(A), I.next_out = 0, I.avail_out = A), (T = u.deflate(I, z)) !== 1 && T !== w) return this.onEnd(T), !(this.ended = !0);
                  I.avail_out !== 0 && (I.avail_in !== 0 || z !== 4 && z !== 2) || (this.options.to === "string" ? this.onData(e.buf2binstring(i.shrinkBuf(I.output, I.next_out))) : this.onData(i.shrinkBuf(I.output, I.next_out)));
                } while ((0 < I.avail_in || I.avail_out === 0) && T !== 1);
                return z === 4 ? (T = u.deflateEnd(this.strm), this.onEnd(T), this.ended = !0, T === w) : z !== 2 || (this.onEnd(w), !(I.avail_out = 0));
              }, c.prototype.onData = function(r) {
                this.chunks.push(r);
              }, c.prototype.onEnd = function(r) {
                r === w && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = i.flattenChunks(this.chunks)), this.chunks = [], this.err = r, this.msg = this.strm.msg;
              }, p.Deflate = c, p.deflate = n, p.deflateRaw = function(r, m) {
                return (m = m || {}).raw = !0, n(r, m);
              }, p.gzip = function(r, m) {
                return (m = m || {}).gzip = !0, n(r, m);
              };
            }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(a, g, p) {
              var u = a("./zlib/inflate"), i = a("./utils/common"), e = a("./utils/strings"), s = a("./zlib/constants"), d = a("./zlib/messages"), v = a("./zlib/zstream"), w = a("./zlib/gzheader"), y = Object.prototype.toString;
              function h(c) {
                if (!(this instanceof h)) return new h(c);
                this.options = i.assign({ chunkSize: 16384, windowBits: 0, to: "" }, c || {});
                var n = this.options;
                n.raw && 0 <= n.windowBits && n.windowBits < 16 && (n.windowBits = -n.windowBits, n.windowBits === 0 && (n.windowBits = -15)), !(0 <= n.windowBits && n.windowBits < 16) || c && c.windowBits || (n.windowBits += 32), 15 < n.windowBits && n.windowBits < 48 && (15 & n.windowBits) == 0 && (n.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new v(), this.strm.avail_out = 0;
                var r = u.inflateInit2(this.strm, n.windowBits);
                if (r !== s.Z_OK) throw new Error(d[r]);
                this.header = new w(), u.inflateGetHeader(this.strm, this.header);
              }
              function _(c, n) {
                var r = new h(n);
                if (r.push(c, !0), r.err) throw r.msg || d[r.err];
                return r.result;
              }
              h.prototype.push = function(c, n) {
                var r, m, T, z, I, A, O = this.strm, B = this.options.chunkSize, k = this.options.dictionary, W = !1;
                if (this.ended) return !1;
                m = n === ~~n ? n : n === !0 ? s.Z_FINISH : s.Z_NO_FLUSH, typeof c == "string" ? O.input = e.binstring2buf(c) : y.call(c) === "[object ArrayBuffer]" ? O.input = new Uint8Array(c) : O.input = c, O.next_in = 0, O.avail_in = O.input.length;
                do {
                  if (O.avail_out === 0 && (O.output = new i.Buf8(B), O.next_out = 0, O.avail_out = B), (r = u.inflate(O, s.Z_NO_FLUSH)) === s.Z_NEED_DICT && k && (A = typeof k == "string" ? e.string2buf(k) : y.call(k) === "[object ArrayBuffer]" ? new Uint8Array(k) : k, r = u.inflateSetDictionary(this.strm, A)), r === s.Z_BUF_ERROR && W === !0 && (r = s.Z_OK, W = !1), r !== s.Z_STREAM_END && r !== s.Z_OK) return this.onEnd(r), !(this.ended = !0);
                  O.next_out && (O.avail_out !== 0 && r !== s.Z_STREAM_END && (O.avail_in !== 0 || m !== s.Z_FINISH && m !== s.Z_SYNC_FLUSH) || (this.options.to === "string" ? (T = e.utf8border(O.output, O.next_out), z = O.next_out - T, I = e.buf2string(O.output, T), O.next_out = z, O.avail_out = B - z, z && i.arraySet(O.output, O.output, T, z, 0), this.onData(I)) : this.onData(i.shrinkBuf(O.output, O.next_out)))), O.avail_in === 0 && O.avail_out === 0 && (W = !0);
                } while ((0 < O.avail_in || O.avail_out === 0) && r !== s.Z_STREAM_END);
                return r === s.Z_STREAM_END && (m = s.Z_FINISH), m === s.Z_FINISH ? (r = u.inflateEnd(this.strm), this.onEnd(r), this.ended = !0, r === s.Z_OK) : m !== s.Z_SYNC_FLUSH || (this.onEnd(s.Z_OK), !(O.avail_out = 0));
              }, h.prototype.onData = function(c) {
                this.chunks.push(c);
              }, h.prototype.onEnd = function(c) {
                c === s.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = i.flattenChunks(this.chunks)), this.chunks = [], this.err = c, this.msg = this.strm.msg;
              }, p.Inflate = h, p.inflate = _, p.inflateRaw = function(c, n) {
                return (n = n || {}).raw = !0, _(c, n);
              }, p.ungzip = _;
            }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(a, g, p) {
              var u = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
              p.assign = function(s) {
                for (var d = Array.prototype.slice.call(arguments, 1); d.length; ) {
                  var v = d.shift();
                  if (v) {
                    if (typeof v != "object") throw new TypeError(v + "must be non-object");
                    for (var w in v) v.hasOwnProperty(w) && (s[w] = v[w]);
                  }
                }
                return s;
              }, p.shrinkBuf = function(s, d) {
                return s.length === d ? s : s.subarray ? s.subarray(0, d) : (s.length = d, s);
              };
              var i = { arraySet: function(s, d, v, w, y) {
                if (d.subarray && s.subarray) s.set(d.subarray(v, v + w), y);
                else for (var h = 0; h < w; h++) s[y + h] = d[v + h];
              }, flattenChunks: function(s) {
                var d, v, w, y, h, _;
                for (d = w = 0, v = s.length; d < v; d++) w += s[d].length;
                for (_ = new Uint8Array(w), d = y = 0, v = s.length; d < v; d++) h = s[d], _.set(h, y), y += h.length;
                return _;
              } }, e = { arraySet: function(s, d, v, w, y) {
                for (var h = 0; h < w; h++) s[y + h] = d[v + h];
              }, flattenChunks: function(s) {
                return [].concat.apply([], s);
              } };
              p.setTyped = function(s) {
                s ? (p.Buf8 = Uint8Array, p.Buf16 = Uint16Array, p.Buf32 = Int32Array, p.assign(p, i)) : (p.Buf8 = Array, p.Buf16 = Array, p.Buf32 = Array, p.assign(p, e));
              }, p.setTyped(u);
            }, {}], 42: [function(a, g, p) {
              var u = a("./common"), i = !0, e = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                i = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                e = !1;
              }
              for (var s = new u.Buf8(256), d = 0; d < 256; d++) s[d] = 252 <= d ? 6 : 248 <= d ? 5 : 240 <= d ? 4 : 224 <= d ? 3 : 192 <= d ? 2 : 1;
              function v(w, y) {
                if (y < 65537 && (w.subarray && e || !w.subarray && i)) return String.fromCharCode.apply(null, u.shrinkBuf(w, y));
                for (var h = "", _ = 0; _ < y; _++) h += String.fromCharCode(w[_]);
                return h;
              }
              s[254] = s[254] = 1, p.string2buf = function(w) {
                var y, h, _, c, n, r = w.length, m = 0;
                for (c = 0; c < r; c++) (64512 & (h = w.charCodeAt(c))) == 55296 && c + 1 < r && (64512 & (_ = w.charCodeAt(c + 1))) == 56320 && (h = 65536 + (h - 55296 << 10) + (_ - 56320), c++), m += h < 128 ? 1 : h < 2048 ? 2 : h < 65536 ? 3 : 4;
                for (y = new u.Buf8(m), c = n = 0; n < m; c++) (64512 & (h = w.charCodeAt(c))) == 55296 && c + 1 < r && (64512 & (_ = w.charCodeAt(c + 1))) == 56320 && (h = 65536 + (h - 55296 << 10) + (_ - 56320), c++), h < 128 ? y[n++] = h : (h < 2048 ? y[n++] = 192 | h >>> 6 : (h < 65536 ? y[n++] = 224 | h >>> 12 : (y[n++] = 240 | h >>> 18, y[n++] = 128 | h >>> 12 & 63), y[n++] = 128 | h >>> 6 & 63), y[n++] = 128 | 63 & h);
                return y;
              }, p.buf2binstring = function(w) {
                return v(w, w.length);
              }, p.binstring2buf = function(w) {
                for (var y = new u.Buf8(w.length), h = 0, _ = y.length; h < _; h++) y[h] = w.charCodeAt(h);
                return y;
              }, p.buf2string = function(w, y) {
                var h, _, c, n, r = y || w.length, m = new Array(2 * r);
                for (h = _ = 0; h < r; ) if ((c = w[h++]) < 128) m[_++] = c;
                else if (4 < (n = s[c])) m[_++] = 65533, h += n - 1;
                else {
                  for (c &= n === 2 ? 31 : n === 3 ? 15 : 7; 1 < n && h < r; ) c = c << 6 | 63 & w[h++], n--;
                  1 < n ? m[_++] = 65533 : c < 65536 ? m[_++] = c : (c -= 65536, m[_++] = 55296 | c >> 10 & 1023, m[_++] = 56320 | 1023 & c);
                }
                return v(m, _);
              }, p.utf8border = function(w, y) {
                var h;
                for ((y = y || w.length) > w.length && (y = w.length), h = y - 1; 0 <= h && (192 & w[h]) == 128; ) h--;
                return h < 0 || h === 0 ? y : h + s[w[h]] > y ? h : y;
              };
            }, { "./common": 41 }], 43: [function(a, g, p) {
              g.exports = function(u, i, e, s) {
                for (var d = 65535 & u | 0, v = u >>> 16 & 65535 | 0, w = 0; e !== 0; ) {
                  for (e -= w = 2e3 < e ? 2e3 : e; v = v + (d = d + i[s++] | 0) | 0, --w; ) ;
                  d %= 65521, v %= 65521;
                }
                return d | v << 16 | 0;
              };
            }, {}], 44: [function(a, g, p) {
              g.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
            }, {}], 45: [function(a, g, p) {
              var u = (function() {
                for (var i, e = [], s = 0; s < 256; s++) {
                  i = s;
                  for (var d = 0; d < 8; d++) i = 1 & i ? 3988292384 ^ i >>> 1 : i >>> 1;
                  e[s] = i;
                }
                return e;
              })();
              g.exports = function(i, e, s, d) {
                var v = u, w = d + s;
                i ^= -1;
                for (var y = d; y < w; y++) i = i >>> 8 ^ v[255 & (i ^ e[y])];
                return -1 ^ i;
              };
            }, {}], 46: [function(a, g, p) {
              var u, i = a("../utils/common"), e = a("./trees"), s = a("./adler32"), d = a("./crc32"), v = a("./messages"), w = 0, y = 4, h = 0, _ = -2, c = -1, n = 4, r = 2, m = 8, T = 9, z = 286, I = 30, A = 19, O = 2 * z + 1, B = 15, k = 3, W = 258, ee = W + k + 1, F = 42, Y = 113, x = 1, K = 2, pe = 3, ne = 4;
              function ce(f, $) {
                return f.msg = v[$], $;
              }
              function ie(f) {
                return (f << 1) - (4 < f ? 9 : 0);
              }
              function ye(f) {
                for (var $ = f.length; 0 <= --$; ) f[$] = 0;
              }
              function j(f) {
                var $ = f.state, V = $.pending;
                V > f.avail_out && (V = f.avail_out), V !== 0 && (i.arraySet(f.output, $.pending_buf, $.pending_out, V, f.next_out), f.next_out += V, $.pending_out += V, f.total_out += V, f.avail_out -= V, $.pending -= V, $.pending === 0 && ($.pending_out = 0));
              }
              function Q(f, $) {
                e._tr_flush_block(f, 0 <= f.block_start ? f.block_start : -1, f.strstart - f.block_start, $), f.block_start = f.strstart, j(f.strm);
              }
              function we(f, $) {
                f.pending_buf[f.pending++] = $;
              }
              function he(f, $) {
                f.pending_buf[f.pending++] = $ >>> 8 & 255, f.pending_buf[f.pending++] = 255 & $;
              }
              function le(f, $) {
                var V, X, l = f.max_chain_length, t = f.strstart, o = f.prev_length, D = f.nice_match, C = f.strstart > f.w_size - ee ? f.strstart - (f.w_size - ee) : 0, G = f.window, te = f.w_mask, ae = f.prev, de = f.strstart + W, xe = G[t + o - 1], me = G[t + o];
                f.prev_length >= f.good_match && (l >>= 2), D > f.lookahead && (D = f.lookahead);
                do
                  if (G[(V = $) + o] === me && G[V + o - 1] === xe && G[V] === G[t] && G[++V] === G[t + 1]) {
                    t += 2, V++;
                    do
                      ;
                    while (G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && G[++t] === G[++V] && t < de);
                    if (X = W - (de - t), t = de - W, o < X) {
                      if (f.match_start = $, D <= (o = X)) break;
                      xe = G[t + o - 1], me = G[t + o];
                    }
                  }
                while (($ = ae[$ & te]) > C && --l != 0);
                return o <= f.lookahead ? o : f.lookahead;
              }
              function Re(f) {
                var $, V, X, l, t, o, D, C, G, te, ae = f.w_size;
                do {
                  if (l = f.window_size - f.lookahead - f.strstart, f.strstart >= ae + (ae - ee)) {
                    for (i.arraySet(f.window, f.window, ae, ae, 0), f.match_start -= ae, f.strstart -= ae, f.block_start -= ae, $ = V = f.hash_size; X = f.head[--$], f.head[$] = ae <= X ? X - ae : 0, --V; ) ;
                    for ($ = V = ae; X = f.prev[--$], f.prev[$] = ae <= X ? X - ae : 0, --V; ) ;
                    l += ae;
                  }
                  if (f.strm.avail_in === 0) break;
                  if (o = f.strm, D = f.window, C = f.strstart + f.lookahead, G = l, te = void 0, te = o.avail_in, G < te && (te = G), V = te === 0 ? 0 : (o.avail_in -= te, i.arraySet(D, o.input, o.next_in, te, C), o.state.wrap === 1 ? o.adler = s(o.adler, D, te, C) : o.state.wrap === 2 && (o.adler = d(o.adler, D, te, C)), o.next_in += te, o.total_in += te, te), f.lookahead += V, f.lookahead + f.insert >= k) for (t = f.strstart - f.insert, f.ins_h = f.window[t], f.ins_h = (f.ins_h << f.hash_shift ^ f.window[t + 1]) & f.hash_mask; f.insert && (f.ins_h = (f.ins_h << f.hash_shift ^ f.window[t + k - 1]) & f.hash_mask, f.prev[t & f.w_mask] = f.head[f.ins_h], f.head[f.ins_h] = t, t++, f.insert--, !(f.lookahead + f.insert < k)); ) ;
                } while (f.lookahead < ee && f.strm.avail_in !== 0);
              }
              function Ce(f, $) {
                for (var V, X; ; ) {
                  if (f.lookahead < ee) {
                    if (Re(f), f.lookahead < ee && $ === w) return x;
                    if (f.lookahead === 0) break;
                  }
                  if (V = 0, f.lookahead >= k && (f.ins_h = (f.ins_h << f.hash_shift ^ f.window[f.strstart + k - 1]) & f.hash_mask, V = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h], f.head[f.ins_h] = f.strstart), V !== 0 && f.strstart - V <= f.w_size - ee && (f.match_length = le(f, V)), f.match_length >= k) if (X = e._tr_tally(f, f.strstart - f.match_start, f.match_length - k), f.lookahead -= f.match_length, f.match_length <= f.max_lazy_match && f.lookahead >= k) {
                    for (f.match_length--; f.strstart++, f.ins_h = (f.ins_h << f.hash_shift ^ f.window[f.strstart + k - 1]) & f.hash_mask, V = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h], f.head[f.ins_h] = f.strstart, --f.match_length != 0; ) ;
                    f.strstart++;
                  } else f.strstart += f.match_length, f.match_length = 0, f.ins_h = f.window[f.strstart], f.ins_h = (f.ins_h << f.hash_shift ^ f.window[f.strstart + 1]) & f.hash_mask;
                  else X = e._tr_tally(f, 0, f.window[f.strstart]), f.lookahead--, f.strstart++;
                  if (X && (Q(f, !1), f.strm.avail_out === 0)) return x;
                }
                return f.insert = f.strstart < k - 1 ? f.strstart : k - 1, $ === y ? (Q(f, !0), f.strm.avail_out === 0 ? pe : ne) : f.last_lit && (Q(f, !1), f.strm.avail_out === 0) ? x : K;
              }
              function be(f, $) {
                for (var V, X, l; ; ) {
                  if (f.lookahead < ee) {
                    if (Re(f), f.lookahead < ee && $ === w) return x;
                    if (f.lookahead === 0) break;
                  }
                  if (V = 0, f.lookahead >= k && (f.ins_h = (f.ins_h << f.hash_shift ^ f.window[f.strstart + k - 1]) & f.hash_mask, V = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h], f.head[f.ins_h] = f.strstart), f.prev_length = f.match_length, f.prev_match = f.match_start, f.match_length = k - 1, V !== 0 && f.prev_length < f.max_lazy_match && f.strstart - V <= f.w_size - ee && (f.match_length = le(f, V), f.match_length <= 5 && (f.strategy === 1 || f.match_length === k && 4096 < f.strstart - f.match_start) && (f.match_length = k - 1)), f.prev_length >= k && f.match_length <= f.prev_length) {
                    for (l = f.strstart + f.lookahead - k, X = e._tr_tally(f, f.strstart - 1 - f.prev_match, f.prev_length - k), f.lookahead -= f.prev_length - 1, f.prev_length -= 2; ++f.strstart <= l && (f.ins_h = (f.ins_h << f.hash_shift ^ f.window[f.strstart + k - 1]) & f.hash_mask, V = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h], f.head[f.ins_h] = f.strstart), --f.prev_length != 0; ) ;
                    if (f.match_available = 0, f.match_length = k - 1, f.strstart++, X && (Q(f, !1), f.strm.avail_out === 0)) return x;
                  } else if (f.match_available) {
                    if ((X = e._tr_tally(f, 0, f.window[f.strstart - 1])) && Q(f, !1), f.strstart++, f.lookahead--, f.strm.avail_out === 0) return x;
                  } else f.match_available = 1, f.strstart++, f.lookahead--;
                }
                return f.match_available && (X = e._tr_tally(f, 0, f.window[f.strstart - 1]), f.match_available = 0), f.insert = f.strstart < k - 1 ? f.strstart : k - 1, $ === y ? (Q(f, !0), f.strm.avail_out === 0 ? pe : ne) : f.last_lit && (Q(f, !1), f.strm.avail_out === 0) ? x : K;
              }
              function Te(f, $, V, X, l) {
                this.good_length = f, this.max_lazy = $, this.nice_length = V, this.max_chain = X, this.func = l;
              }
              function Ie() {
                this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = m, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new i.Buf16(2 * O), this.dyn_dtree = new i.Buf16(2 * (2 * I + 1)), this.bl_tree = new i.Buf16(2 * (2 * A + 1)), ye(this.dyn_ltree), ye(this.dyn_dtree), ye(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new i.Buf16(B + 1), this.heap = new i.Buf16(2 * z + 1), ye(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new i.Buf16(2 * z + 1), ye(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
              }
              function De(f) {
                var $;
                return f && f.state ? (f.total_in = f.total_out = 0, f.data_type = r, ($ = f.state).pending = 0, $.pending_out = 0, $.wrap < 0 && ($.wrap = -$.wrap), $.status = $.wrap ? F : Y, f.adler = $.wrap === 2 ? 0 : 1, $.last_flush = w, e._tr_init($), h) : ce(f, _);
              }
              function Le(f) {
                var $ = De(f);
                return $ === h && (function(V) {
                  V.window_size = 2 * V.w_size, ye(V.head), V.max_lazy_match = u[V.level].max_lazy, V.good_match = u[V.level].good_length, V.nice_match = u[V.level].nice_length, V.max_chain_length = u[V.level].max_chain, V.strstart = 0, V.block_start = 0, V.lookahead = 0, V.insert = 0, V.match_length = V.prev_length = k - 1, V.match_available = 0, V.ins_h = 0;
                })(f.state), $;
              }
              function Be(f, $, V, X, l, t) {
                if (!f) return _;
                var o = 1;
                if ($ === c && ($ = 6), X < 0 ? (o = 0, X = -X) : 15 < X && (o = 2, X -= 16), l < 1 || T < l || V !== m || X < 8 || 15 < X || $ < 0 || 9 < $ || t < 0 || n < t) return ce(f, _);
                X === 8 && (X = 9);
                var D = new Ie();
                return (f.state = D).strm = f, D.wrap = o, D.gzhead = null, D.w_bits = X, D.w_size = 1 << D.w_bits, D.w_mask = D.w_size - 1, D.hash_bits = l + 7, D.hash_size = 1 << D.hash_bits, D.hash_mask = D.hash_size - 1, D.hash_shift = ~~((D.hash_bits + k - 1) / k), D.window = new i.Buf8(2 * D.w_size), D.head = new i.Buf16(D.hash_size), D.prev = new i.Buf16(D.w_size), D.lit_bufsize = 1 << l + 6, D.pending_buf_size = 4 * D.lit_bufsize, D.pending_buf = new i.Buf8(D.pending_buf_size), D.d_buf = 1 * D.lit_bufsize, D.l_buf = 3 * D.lit_bufsize, D.level = $, D.strategy = t, D.method = V, Le(f);
              }
              u = [new Te(0, 0, 0, 0, function(f, $) {
                var V = 65535;
                for (V > f.pending_buf_size - 5 && (V = f.pending_buf_size - 5); ; ) {
                  if (f.lookahead <= 1) {
                    if (Re(f), f.lookahead === 0 && $ === w) return x;
                    if (f.lookahead === 0) break;
                  }
                  f.strstart += f.lookahead, f.lookahead = 0;
                  var X = f.block_start + V;
                  if ((f.strstart === 0 || f.strstart >= X) && (f.lookahead = f.strstart - X, f.strstart = X, Q(f, !1), f.strm.avail_out === 0) || f.strstart - f.block_start >= f.w_size - ee && (Q(f, !1), f.strm.avail_out === 0)) return x;
                }
                return f.insert = 0, $ === y ? (Q(f, !0), f.strm.avail_out === 0 ? pe : ne) : (f.strstart > f.block_start && (Q(f, !1), f.strm.avail_out), x);
              }), new Te(4, 4, 8, 4, Ce), new Te(4, 5, 16, 8, Ce), new Te(4, 6, 32, 32, Ce), new Te(4, 4, 16, 16, be), new Te(8, 16, 32, 32, be), new Te(8, 16, 128, 128, be), new Te(8, 32, 128, 256, be), new Te(32, 128, 258, 1024, be), new Te(32, 258, 258, 4096, be)], p.deflateInit = function(f, $) {
                return Be(f, $, m, 15, 8, 0);
              }, p.deflateInit2 = Be, p.deflateReset = Le, p.deflateResetKeep = De, p.deflateSetHeader = function(f, $) {
                return f && f.state ? f.state.wrap !== 2 ? _ : (f.state.gzhead = $, h) : _;
              }, p.deflate = function(f, $) {
                var V, X, l, t;
                if (!f || !f.state || 5 < $ || $ < 0) return f ? ce(f, _) : _;
                if (X = f.state, !f.output || !f.input && f.avail_in !== 0 || X.status === 666 && $ !== y) return ce(f, f.avail_out === 0 ? -5 : _);
                if (X.strm = f, V = X.last_flush, X.last_flush = $, X.status === F) if (X.wrap === 2) f.adler = 0, we(X, 31), we(X, 139), we(X, 8), X.gzhead ? (we(X, (X.gzhead.text ? 1 : 0) + (X.gzhead.hcrc ? 2 : 0) + (X.gzhead.extra ? 4 : 0) + (X.gzhead.name ? 8 : 0) + (X.gzhead.comment ? 16 : 0)), we(X, 255 & X.gzhead.time), we(X, X.gzhead.time >> 8 & 255), we(X, X.gzhead.time >> 16 & 255), we(X, X.gzhead.time >> 24 & 255), we(X, X.level === 9 ? 2 : 2 <= X.strategy || X.level < 2 ? 4 : 0), we(X, 255 & X.gzhead.os), X.gzhead.extra && X.gzhead.extra.length && (we(X, 255 & X.gzhead.extra.length), we(X, X.gzhead.extra.length >> 8 & 255)), X.gzhead.hcrc && (f.adler = d(f.adler, X.pending_buf, X.pending, 0)), X.gzindex = 0, X.status = 69) : (we(X, 0), we(X, 0), we(X, 0), we(X, 0), we(X, 0), we(X, X.level === 9 ? 2 : 2 <= X.strategy || X.level < 2 ? 4 : 0), we(X, 3), X.status = Y);
                else {
                  var o = m + (X.w_bits - 8 << 4) << 8;
                  o |= (2 <= X.strategy || X.level < 2 ? 0 : X.level < 6 ? 1 : X.level === 6 ? 2 : 3) << 6, X.strstart !== 0 && (o |= 32), o += 31 - o % 31, X.status = Y, he(X, o), X.strstart !== 0 && (he(X, f.adler >>> 16), he(X, 65535 & f.adler)), f.adler = 1;
                }
                if (X.status === 69) if (X.gzhead.extra) {
                  for (l = X.pending; X.gzindex < (65535 & X.gzhead.extra.length) && (X.pending !== X.pending_buf_size || (X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), j(f), l = X.pending, X.pending !== X.pending_buf_size)); ) we(X, 255 & X.gzhead.extra[X.gzindex]), X.gzindex++;
                  X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), X.gzindex === X.gzhead.extra.length && (X.gzindex = 0, X.status = 73);
                } else X.status = 73;
                if (X.status === 73) if (X.gzhead.name) {
                  l = X.pending;
                  do {
                    if (X.pending === X.pending_buf_size && (X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), j(f), l = X.pending, X.pending === X.pending_buf_size)) {
                      t = 1;
                      break;
                    }
                    t = X.gzindex < X.gzhead.name.length ? 255 & X.gzhead.name.charCodeAt(X.gzindex++) : 0, we(X, t);
                  } while (t !== 0);
                  X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), t === 0 && (X.gzindex = 0, X.status = 91);
                } else X.status = 91;
                if (X.status === 91) if (X.gzhead.comment) {
                  l = X.pending;
                  do {
                    if (X.pending === X.pending_buf_size && (X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), j(f), l = X.pending, X.pending === X.pending_buf_size)) {
                      t = 1;
                      break;
                    }
                    t = X.gzindex < X.gzhead.comment.length ? 255 & X.gzhead.comment.charCodeAt(X.gzindex++) : 0, we(X, t);
                  } while (t !== 0);
                  X.gzhead.hcrc && X.pending > l && (f.adler = d(f.adler, X.pending_buf, X.pending - l, l)), t === 0 && (X.status = 103);
                } else X.status = 103;
                if (X.status === 103 && (X.gzhead.hcrc ? (X.pending + 2 > X.pending_buf_size && j(f), X.pending + 2 <= X.pending_buf_size && (we(X, 255 & f.adler), we(X, f.adler >> 8 & 255), f.adler = 0, X.status = Y)) : X.status = Y), X.pending !== 0) {
                  if (j(f), f.avail_out === 0) return X.last_flush = -1, h;
                } else if (f.avail_in === 0 && ie($) <= ie(V) && $ !== y) return ce(f, -5);
                if (X.status === 666 && f.avail_in !== 0) return ce(f, -5);
                if (f.avail_in !== 0 || X.lookahead !== 0 || $ !== w && X.status !== 666) {
                  var D = X.strategy === 2 ? (function(C, G) {
                    for (var te; ; ) {
                      if (C.lookahead === 0 && (Re(C), C.lookahead === 0)) {
                        if (G === w) return x;
                        break;
                      }
                      if (C.match_length = 0, te = e._tr_tally(C, 0, C.window[C.strstart]), C.lookahead--, C.strstart++, te && (Q(C, !1), C.strm.avail_out === 0)) return x;
                    }
                    return C.insert = 0, G === y ? (Q(C, !0), C.strm.avail_out === 0 ? pe : ne) : C.last_lit && (Q(C, !1), C.strm.avail_out === 0) ? x : K;
                  })(X, $) : X.strategy === 3 ? (function(C, G) {
                    for (var te, ae, de, xe, me = C.window; ; ) {
                      if (C.lookahead <= W) {
                        if (Re(C), C.lookahead <= W && G === w) return x;
                        if (C.lookahead === 0) break;
                      }
                      if (C.match_length = 0, C.lookahead >= k && 0 < C.strstart && (ae = me[de = C.strstart - 1]) === me[++de] && ae === me[++de] && ae === me[++de]) {
                        xe = C.strstart + W;
                        do
                          ;
                        while (ae === me[++de] && ae === me[++de] && ae === me[++de] && ae === me[++de] && ae === me[++de] && ae === me[++de] && ae === me[++de] && ae === me[++de] && de < xe);
                        C.match_length = W - (xe - de), C.match_length > C.lookahead && (C.match_length = C.lookahead);
                      }
                      if (C.match_length >= k ? (te = e._tr_tally(C, 1, C.match_length - k), C.lookahead -= C.match_length, C.strstart += C.match_length, C.match_length = 0) : (te = e._tr_tally(C, 0, C.window[C.strstart]), C.lookahead--, C.strstart++), te && (Q(C, !1), C.strm.avail_out === 0)) return x;
                    }
                    return C.insert = 0, G === y ? (Q(C, !0), C.strm.avail_out === 0 ? pe : ne) : C.last_lit && (Q(C, !1), C.strm.avail_out === 0) ? x : K;
                  })(X, $) : u[X.level].func(X, $);
                  if (D !== pe && D !== ne || (X.status = 666), D === x || D === pe) return f.avail_out === 0 && (X.last_flush = -1), h;
                  if (D === K && ($ === 1 ? e._tr_align(X) : $ !== 5 && (e._tr_stored_block(X, 0, 0, !1), $ === 3 && (ye(X.head), X.lookahead === 0 && (X.strstart = 0, X.block_start = 0, X.insert = 0))), j(f), f.avail_out === 0)) return X.last_flush = -1, h;
                }
                return $ !== y ? h : X.wrap <= 0 ? 1 : (X.wrap === 2 ? (we(X, 255 & f.adler), we(X, f.adler >> 8 & 255), we(X, f.adler >> 16 & 255), we(X, f.adler >> 24 & 255), we(X, 255 & f.total_in), we(X, f.total_in >> 8 & 255), we(X, f.total_in >> 16 & 255), we(X, f.total_in >> 24 & 255)) : (he(X, f.adler >>> 16), he(X, 65535 & f.adler)), j(f), 0 < X.wrap && (X.wrap = -X.wrap), X.pending !== 0 ? h : 1);
              }, p.deflateEnd = function(f) {
                var $;
                return f && f.state ? ($ = f.state.status) !== F && $ !== 69 && $ !== 73 && $ !== 91 && $ !== 103 && $ !== Y && $ !== 666 ? ce(f, _) : (f.state = null, $ === Y ? ce(f, -3) : h) : _;
              }, p.deflateSetDictionary = function(f, $) {
                var V, X, l, t, o, D, C, G, te = $.length;
                if (!f || !f.state || (t = (V = f.state).wrap) === 2 || t === 1 && V.status !== F || V.lookahead) return _;
                for (t === 1 && (f.adler = s(f.adler, $, te, 0)), V.wrap = 0, te >= V.w_size && (t === 0 && (ye(V.head), V.strstart = 0, V.block_start = 0, V.insert = 0), G = new i.Buf8(V.w_size), i.arraySet(G, $, te - V.w_size, V.w_size, 0), $ = G, te = V.w_size), o = f.avail_in, D = f.next_in, C = f.input, f.avail_in = te, f.next_in = 0, f.input = $, Re(V); V.lookahead >= k; ) {
                  for (X = V.strstart, l = V.lookahead - (k - 1); V.ins_h = (V.ins_h << V.hash_shift ^ V.window[X + k - 1]) & V.hash_mask, V.prev[X & V.w_mask] = V.head[V.ins_h], V.head[V.ins_h] = X, X++, --l; ) ;
                  V.strstart = X, V.lookahead = k - 1, Re(V);
                }
                return V.strstart += V.lookahead, V.block_start = V.strstart, V.insert = V.lookahead, V.lookahead = 0, V.match_length = V.prev_length = k - 1, V.match_available = 0, f.next_in = D, f.input = C, f.avail_in = o, V.wrap = t, h;
              }, p.deflateInfo = "pako deflate (from Nodeca project)";
            }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(a, g, p) {
              g.exports = function() {
                this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
              };
            }, {}], 48: [function(a, g, p) {
              g.exports = function(u, i) {
                var e, s, d, v, w, y, h, _, c, n, r, m, T, z, I, A, O, B, k, W, ee, F, Y, x, K;
                e = u.state, s = u.next_in, x = u.input, d = s + (u.avail_in - 5), v = u.next_out, K = u.output, w = v - (i - u.avail_out), y = v + (u.avail_out - 257), h = e.dmax, _ = e.wsize, c = e.whave, n = e.wnext, r = e.window, m = e.hold, T = e.bits, z = e.lencode, I = e.distcode, A = (1 << e.lenbits) - 1, O = (1 << e.distbits) - 1;
                e: do {
                  T < 15 && (m += x[s++] << T, T += 8, m += x[s++] << T, T += 8), B = z[m & A];
                  t: for (; ; ) {
                    if (m >>>= k = B >>> 24, T -= k, (k = B >>> 16 & 255) === 0) K[v++] = 65535 & B;
                    else {
                      if (!(16 & k)) {
                        if ((64 & k) == 0) {
                          B = z[(65535 & B) + (m & (1 << k) - 1)];
                          continue t;
                        }
                        if (32 & k) {
                          e.mode = 12;
                          break e;
                        }
                        u.msg = "invalid literal/length code", e.mode = 30;
                        break e;
                      }
                      W = 65535 & B, (k &= 15) && (T < k && (m += x[s++] << T, T += 8), W += m & (1 << k) - 1, m >>>= k, T -= k), T < 15 && (m += x[s++] << T, T += 8, m += x[s++] << T, T += 8), B = I[m & O];
                      r: for (; ; ) {
                        if (m >>>= k = B >>> 24, T -= k, !(16 & (k = B >>> 16 & 255))) {
                          if ((64 & k) == 0) {
                            B = I[(65535 & B) + (m & (1 << k) - 1)];
                            continue r;
                          }
                          u.msg = "invalid distance code", e.mode = 30;
                          break e;
                        }
                        if (ee = 65535 & B, T < (k &= 15) && (m += x[s++] << T, (T += 8) < k && (m += x[s++] << T, T += 8)), h < (ee += m & (1 << k) - 1)) {
                          u.msg = "invalid distance too far back", e.mode = 30;
                          break e;
                        }
                        if (m >>>= k, T -= k, (k = v - w) < ee) {
                          if (c < (k = ee - k) && e.sane) {
                            u.msg = "invalid distance too far back", e.mode = 30;
                            break e;
                          }
                          if (Y = r, (F = 0) === n) {
                            if (F += _ - k, k < W) {
                              for (W -= k; K[v++] = r[F++], --k; ) ;
                              F = v - ee, Y = K;
                            }
                          } else if (n < k) {
                            if (F += _ + n - k, (k -= n) < W) {
                              for (W -= k; K[v++] = r[F++], --k; ) ;
                              if (F = 0, n < W) {
                                for (W -= k = n; K[v++] = r[F++], --k; ) ;
                                F = v - ee, Y = K;
                              }
                            }
                          } else if (F += n - k, k < W) {
                            for (W -= k; K[v++] = r[F++], --k; ) ;
                            F = v - ee, Y = K;
                          }
                          for (; 2 < W; ) K[v++] = Y[F++], K[v++] = Y[F++], K[v++] = Y[F++], W -= 3;
                          W && (K[v++] = Y[F++], 1 < W && (K[v++] = Y[F++]));
                        } else {
                          for (F = v - ee; K[v++] = K[F++], K[v++] = K[F++], K[v++] = K[F++], 2 < (W -= 3); ) ;
                          W && (K[v++] = K[F++], 1 < W && (K[v++] = K[F++]));
                        }
                        break;
                      }
                    }
                    break;
                  }
                } while (s < d && v < y);
                s -= W = T >> 3, m &= (1 << (T -= W << 3)) - 1, u.next_in = s, u.next_out = v, u.avail_in = s < d ? d - s + 5 : 5 - (s - d), u.avail_out = v < y ? y - v + 257 : 257 - (v - y), e.hold = m, e.bits = T;
              };
            }, {}], 49: [function(a, g, p) {
              var u = a("../utils/common"), i = a("./adler32"), e = a("./crc32"), s = a("./inffast"), d = a("./inftrees"), v = 1, w = 2, y = 0, h = -2, _ = 1, c = 852, n = 592;
              function r(F) {
                return (F >>> 24 & 255) + (F >>> 8 & 65280) + ((65280 & F) << 8) + ((255 & F) << 24);
              }
              function m() {
                this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new u.Buf16(320), this.work = new u.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
              }
              function T(F) {
                var Y;
                return F && F.state ? (Y = F.state, F.total_in = F.total_out = Y.total = 0, F.msg = "", Y.wrap && (F.adler = 1 & Y.wrap), Y.mode = _, Y.last = 0, Y.havedict = 0, Y.dmax = 32768, Y.head = null, Y.hold = 0, Y.bits = 0, Y.lencode = Y.lendyn = new u.Buf32(c), Y.distcode = Y.distdyn = new u.Buf32(n), Y.sane = 1, Y.back = -1, y) : h;
              }
              function z(F) {
                var Y;
                return F && F.state ? ((Y = F.state).wsize = 0, Y.whave = 0, Y.wnext = 0, T(F)) : h;
              }
              function I(F, Y) {
                var x, K;
                return F && F.state ? (K = F.state, Y < 0 ? (x = 0, Y = -Y) : (x = 1 + (Y >> 4), Y < 48 && (Y &= 15)), Y && (Y < 8 || 15 < Y) ? h : (K.window !== null && K.wbits !== Y && (K.window = null), K.wrap = x, K.wbits = Y, z(F))) : h;
              }
              function A(F, Y) {
                var x, K;
                return F ? (K = new m(), (F.state = K).window = null, (x = I(F, Y)) !== y && (F.state = null), x) : h;
              }
              var O, B, k = !0;
              function W(F) {
                if (k) {
                  var Y;
                  for (O = new u.Buf32(512), B = new u.Buf32(32), Y = 0; Y < 144; ) F.lens[Y++] = 8;
                  for (; Y < 256; ) F.lens[Y++] = 9;
                  for (; Y < 280; ) F.lens[Y++] = 7;
                  for (; Y < 288; ) F.lens[Y++] = 8;
                  for (d(v, F.lens, 0, 288, O, 0, F.work, { bits: 9 }), Y = 0; Y < 32; ) F.lens[Y++] = 5;
                  d(w, F.lens, 0, 32, B, 0, F.work, { bits: 5 }), k = !1;
                }
                F.lencode = O, F.lenbits = 9, F.distcode = B, F.distbits = 5;
              }
              function ee(F, Y, x, K) {
                var pe, ne = F.state;
                return ne.window === null && (ne.wsize = 1 << ne.wbits, ne.wnext = 0, ne.whave = 0, ne.window = new u.Buf8(ne.wsize)), K >= ne.wsize ? (u.arraySet(ne.window, Y, x - ne.wsize, ne.wsize, 0), ne.wnext = 0, ne.whave = ne.wsize) : (K < (pe = ne.wsize - ne.wnext) && (pe = K), u.arraySet(ne.window, Y, x - K, pe, ne.wnext), (K -= pe) ? (u.arraySet(ne.window, Y, x - K, K, 0), ne.wnext = K, ne.whave = ne.wsize) : (ne.wnext += pe, ne.wnext === ne.wsize && (ne.wnext = 0), ne.whave < ne.wsize && (ne.whave += pe))), 0;
              }
              p.inflateReset = z, p.inflateReset2 = I, p.inflateResetKeep = T, p.inflateInit = function(F) {
                return A(F, 15);
              }, p.inflateInit2 = A, p.inflate = function(F, Y) {
                var x, K, pe, ne, ce, ie, ye, j, Q, we, he, le, Re, Ce, be, Te, Ie, De, Le, Be, f, $, V, X, l = 0, t = new u.Buf8(4), o = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                if (!F || !F.state || !F.output || !F.input && F.avail_in !== 0) return h;
                (x = F.state).mode === 12 && (x.mode = 13), ce = F.next_out, pe = F.output, ye = F.avail_out, ne = F.next_in, K = F.input, ie = F.avail_in, j = x.hold, Q = x.bits, we = ie, he = ye, $ = y;
                e: for (; ; ) switch (x.mode) {
                  case _:
                    if (x.wrap === 0) {
                      x.mode = 13;
                      break;
                    }
                    for (; Q < 16; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if (2 & x.wrap && j === 35615) {
                      t[x.check = 0] = 255 & j, t[1] = j >>> 8 & 255, x.check = e(x.check, t, 2, 0), Q = j = 0, x.mode = 2;
                      break;
                    }
                    if (x.flags = 0, x.head && (x.head.done = !1), !(1 & x.wrap) || (((255 & j) << 8) + (j >> 8)) % 31) {
                      F.msg = "incorrect header check", x.mode = 30;
                      break;
                    }
                    if ((15 & j) != 8) {
                      F.msg = "unknown compression method", x.mode = 30;
                      break;
                    }
                    if (Q -= 4, f = 8 + (15 & (j >>>= 4)), x.wbits === 0) x.wbits = f;
                    else if (f > x.wbits) {
                      F.msg = "invalid window size", x.mode = 30;
                      break;
                    }
                    x.dmax = 1 << f, F.adler = x.check = 1, x.mode = 512 & j ? 10 : 12, Q = j = 0;
                    break;
                  case 2:
                    for (; Q < 16; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if (x.flags = j, (255 & x.flags) != 8) {
                      F.msg = "unknown compression method", x.mode = 30;
                      break;
                    }
                    if (57344 & x.flags) {
                      F.msg = "unknown header flags set", x.mode = 30;
                      break;
                    }
                    x.head && (x.head.text = j >> 8 & 1), 512 & x.flags && (t[0] = 255 & j, t[1] = j >>> 8 & 255, x.check = e(x.check, t, 2, 0)), Q = j = 0, x.mode = 3;
                  case 3:
                    for (; Q < 32; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    x.head && (x.head.time = j), 512 & x.flags && (t[0] = 255 & j, t[1] = j >>> 8 & 255, t[2] = j >>> 16 & 255, t[3] = j >>> 24 & 255, x.check = e(x.check, t, 4, 0)), Q = j = 0, x.mode = 4;
                  case 4:
                    for (; Q < 16; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    x.head && (x.head.xflags = 255 & j, x.head.os = j >> 8), 512 & x.flags && (t[0] = 255 & j, t[1] = j >>> 8 & 255, x.check = e(x.check, t, 2, 0)), Q = j = 0, x.mode = 5;
                  case 5:
                    if (1024 & x.flags) {
                      for (; Q < 16; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      x.length = j, x.head && (x.head.extra_len = j), 512 & x.flags && (t[0] = 255 & j, t[1] = j >>> 8 & 255, x.check = e(x.check, t, 2, 0)), Q = j = 0;
                    } else x.head && (x.head.extra = null);
                    x.mode = 6;
                  case 6:
                    if (1024 & x.flags && (ie < (le = x.length) && (le = ie), le && (x.head && (f = x.head.extra_len - x.length, x.head.extra || (x.head.extra = new Array(x.head.extra_len)), u.arraySet(x.head.extra, K, ne, le, f)), 512 & x.flags && (x.check = e(x.check, K, le, ne)), ie -= le, ne += le, x.length -= le), x.length)) break e;
                    x.length = 0, x.mode = 7;
                  case 7:
                    if (2048 & x.flags) {
                      if (ie === 0) break e;
                      for (le = 0; f = K[ne + le++], x.head && f && x.length < 65536 && (x.head.name += String.fromCharCode(f)), f && le < ie; ) ;
                      if (512 & x.flags && (x.check = e(x.check, K, le, ne)), ie -= le, ne += le, f) break e;
                    } else x.head && (x.head.name = null);
                    x.length = 0, x.mode = 8;
                  case 8:
                    if (4096 & x.flags) {
                      if (ie === 0) break e;
                      for (le = 0; f = K[ne + le++], x.head && f && x.length < 65536 && (x.head.comment += String.fromCharCode(f)), f && le < ie; ) ;
                      if (512 & x.flags && (x.check = e(x.check, K, le, ne)), ie -= le, ne += le, f) break e;
                    } else x.head && (x.head.comment = null);
                    x.mode = 9;
                  case 9:
                    if (512 & x.flags) {
                      for (; Q < 16; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      if (j !== (65535 & x.check)) {
                        F.msg = "header crc mismatch", x.mode = 30;
                        break;
                      }
                      Q = j = 0;
                    }
                    x.head && (x.head.hcrc = x.flags >> 9 & 1, x.head.done = !0), F.adler = x.check = 0, x.mode = 12;
                    break;
                  case 10:
                    for (; Q < 32; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    F.adler = x.check = r(j), Q = j = 0, x.mode = 11;
                  case 11:
                    if (x.havedict === 0) return F.next_out = ce, F.avail_out = ye, F.next_in = ne, F.avail_in = ie, x.hold = j, x.bits = Q, 2;
                    F.adler = x.check = 1, x.mode = 12;
                  case 12:
                    if (Y === 5 || Y === 6) break e;
                  case 13:
                    if (x.last) {
                      j >>>= 7 & Q, Q -= 7 & Q, x.mode = 27;
                      break;
                    }
                    for (; Q < 3; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    switch (x.last = 1 & j, Q -= 1, 3 & (j >>>= 1)) {
                      case 0:
                        x.mode = 14;
                        break;
                      case 1:
                        if (W(x), x.mode = 20, Y !== 6) break;
                        j >>>= 2, Q -= 2;
                        break e;
                      case 2:
                        x.mode = 17;
                        break;
                      case 3:
                        F.msg = "invalid block type", x.mode = 30;
                    }
                    j >>>= 2, Q -= 2;
                    break;
                  case 14:
                    for (j >>>= 7 & Q, Q -= 7 & Q; Q < 32; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if ((65535 & j) != (j >>> 16 ^ 65535)) {
                      F.msg = "invalid stored block lengths", x.mode = 30;
                      break;
                    }
                    if (x.length = 65535 & j, Q = j = 0, x.mode = 15, Y === 6) break e;
                  case 15:
                    x.mode = 16;
                  case 16:
                    if (le = x.length) {
                      if (ie < le && (le = ie), ye < le && (le = ye), le === 0) break e;
                      u.arraySet(pe, K, ne, le, ce), ie -= le, ne += le, ye -= le, ce += le, x.length -= le;
                      break;
                    }
                    x.mode = 12;
                    break;
                  case 17:
                    for (; Q < 14; ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if (x.nlen = 257 + (31 & j), j >>>= 5, Q -= 5, x.ndist = 1 + (31 & j), j >>>= 5, Q -= 5, x.ncode = 4 + (15 & j), j >>>= 4, Q -= 4, 286 < x.nlen || 30 < x.ndist) {
                      F.msg = "too many length or distance symbols", x.mode = 30;
                      break;
                    }
                    x.have = 0, x.mode = 18;
                  case 18:
                    for (; x.have < x.ncode; ) {
                      for (; Q < 3; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      x.lens[o[x.have++]] = 7 & j, j >>>= 3, Q -= 3;
                    }
                    for (; x.have < 19; ) x.lens[o[x.have++]] = 0;
                    if (x.lencode = x.lendyn, x.lenbits = 7, V = { bits: x.lenbits }, $ = d(0, x.lens, 0, 19, x.lencode, 0, x.work, V), x.lenbits = V.bits, $) {
                      F.msg = "invalid code lengths set", x.mode = 30;
                      break;
                    }
                    x.have = 0, x.mode = 19;
                  case 19:
                    for (; x.have < x.nlen + x.ndist; ) {
                      for (; Te = (l = x.lencode[j & (1 << x.lenbits) - 1]) >>> 16 & 255, Ie = 65535 & l, !((be = l >>> 24) <= Q); ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      if (Ie < 16) j >>>= be, Q -= be, x.lens[x.have++] = Ie;
                      else {
                        if (Ie === 16) {
                          for (X = be + 2; Q < X; ) {
                            if (ie === 0) break e;
                            ie--, j += K[ne++] << Q, Q += 8;
                          }
                          if (j >>>= be, Q -= be, x.have === 0) {
                            F.msg = "invalid bit length repeat", x.mode = 30;
                            break;
                          }
                          f = x.lens[x.have - 1], le = 3 + (3 & j), j >>>= 2, Q -= 2;
                        } else if (Ie === 17) {
                          for (X = be + 3; Q < X; ) {
                            if (ie === 0) break e;
                            ie--, j += K[ne++] << Q, Q += 8;
                          }
                          Q -= be, f = 0, le = 3 + (7 & (j >>>= be)), j >>>= 3, Q -= 3;
                        } else {
                          for (X = be + 7; Q < X; ) {
                            if (ie === 0) break e;
                            ie--, j += K[ne++] << Q, Q += 8;
                          }
                          Q -= be, f = 0, le = 11 + (127 & (j >>>= be)), j >>>= 7, Q -= 7;
                        }
                        if (x.have + le > x.nlen + x.ndist) {
                          F.msg = "invalid bit length repeat", x.mode = 30;
                          break;
                        }
                        for (; le--; ) x.lens[x.have++] = f;
                      }
                    }
                    if (x.mode === 30) break;
                    if (x.lens[256] === 0) {
                      F.msg = "invalid code -- missing end-of-block", x.mode = 30;
                      break;
                    }
                    if (x.lenbits = 9, V = { bits: x.lenbits }, $ = d(v, x.lens, 0, x.nlen, x.lencode, 0, x.work, V), x.lenbits = V.bits, $) {
                      F.msg = "invalid literal/lengths set", x.mode = 30;
                      break;
                    }
                    if (x.distbits = 6, x.distcode = x.distdyn, V = { bits: x.distbits }, $ = d(w, x.lens, x.nlen, x.ndist, x.distcode, 0, x.work, V), x.distbits = V.bits, $) {
                      F.msg = "invalid distances set", x.mode = 30;
                      break;
                    }
                    if (x.mode = 20, Y === 6) break e;
                  case 20:
                    x.mode = 21;
                  case 21:
                    if (6 <= ie && 258 <= ye) {
                      F.next_out = ce, F.avail_out = ye, F.next_in = ne, F.avail_in = ie, x.hold = j, x.bits = Q, s(F, he), ce = F.next_out, pe = F.output, ye = F.avail_out, ne = F.next_in, K = F.input, ie = F.avail_in, j = x.hold, Q = x.bits, x.mode === 12 && (x.back = -1);
                      break;
                    }
                    for (x.back = 0; Te = (l = x.lencode[j & (1 << x.lenbits) - 1]) >>> 16 & 255, Ie = 65535 & l, !((be = l >>> 24) <= Q); ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if (Te && (240 & Te) == 0) {
                      for (De = be, Le = Te, Be = Ie; Te = (l = x.lencode[Be + ((j & (1 << De + Le) - 1) >> De)]) >>> 16 & 255, Ie = 65535 & l, !(De + (be = l >>> 24) <= Q); ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      j >>>= De, Q -= De, x.back += De;
                    }
                    if (j >>>= be, Q -= be, x.back += be, x.length = Ie, Te === 0) {
                      x.mode = 26;
                      break;
                    }
                    if (32 & Te) {
                      x.back = -1, x.mode = 12;
                      break;
                    }
                    if (64 & Te) {
                      F.msg = "invalid literal/length code", x.mode = 30;
                      break;
                    }
                    x.extra = 15 & Te, x.mode = 22;
                  case 22:
                    if (x.extra) {
                      for (X = x.extra; Q < X; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      x.length += j & (1 << x.extra) - 1, j >>>= x.extra, Q -= x.extra, x.back += x.extra;
                    }
                    x.was = x.length, x.mode = 23;
                  case 23:
                    for (; Te = (l = x.distcode[j & (1 << x.distbits) - 1]) >>> 16 & 255, Ie = 65535 & l, !((be = l >>> 24) <= Q); ) {
                      if (ie === 0) break e;
                      ie--, j += K[ne++] << Q, Q += 8;
                    }
                    if ((240 & Te) == 0) {
                      for (De = be, Le = Te, Be = Ie; Te = (l = x.distcode[Be + ((j & (1 << De + Le) - 1) >> De)]) >>> 16 & 255, Ie = 65535 & l, !(De + (be = l >>> 24) <= Q); ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      j >>>= De, Q -= De, x.back += De;
                    }
                    if (j >>>= be, Q -= be, x.back += be, 64 & Te) {
                      F.msg = "invalid distance code", x.mode = 30;
                      break;
                    }
                    x.offset = Ie, x.extra = 15 & Te, x.mode = 24;
                  case 24:
                    if (x.extra) {
                      for (X = x.extra; Q < X; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      x.offset += j & (1 << x.extra) - 1, j >>>= x.extra, Q -= x.extra, x.back += x.extra;
                    }
                    if (x.offset > x.dmax) {
                      F.msg = "invalid distance too far back", x.mode = 30;
                      break;
                    }
                    x.mode = 25;
                  case 25:
                    if (ye === 0) break e;
                    if (le = he - ye, x.offset > le) {
                      if ((le = x.offset - le) > x.whave && x.sane) {
                        F.msg = "invalid distance too far back", x.mode = 30;
                        break;
                      }
                      Re = le > x.wnext ? (le -= x.wnext, x.wsize - le) : x.wnext - le, le > x.length && (le = x.length), Ce = x.window;
                    } else Ce = pe, Re = ce - x.offset, le = x.length;
                    for (ye < le && (le = ye), ye -= le, x.length -= le; pe[ce++] = Ce[Re++], --le; ) ;
                    x.length === 0 && (x.mode = 21);
                    break;
                  case 26:
                    if (ye === 0) break e;
                    pe[ce++] = x.length, ye--, x.mode = 21;
                    break;
                  case 27:
                    if (x.wrap) {
                      for (; Q < 32; ) {
                        if (ie === 0) break e;
                        ie--, j |= K[ne++] << Q, Q += 8;
                      }
                      if (he -= ye, F.total_out += he, x.total += he, he && (F.adler = x.check = x.flags ? e(x.check, pe, he, ce - he) : i(x.check, pe, he, ce - he)), he = ye, (x.flags ? j : r(j)) !== x.check) {
                        F.msg = "incorrect data check", x.mode = 30;
                        break;
                      }
                      Q = j = 0;
                    }
                    x.mode = 28;
                  case 28:
                    if (x.wrap && x.flags) {
                      for (; Q < 32; ) {
                        if (ie === 0) break e;
                        ie--, j += K[ne++] << Q, Q += 8;
                      }
                      if (j !== (4294967295 & x.total)) {
                        F.msg = "incorrect length check", x.mode = 30;
                        break;
                      }
                      Q = j = 0;
                    }
                    x.mode = 29;
                  case 29:
                    $ = 1;
                    break e;
                  case 30:
                    $ = -3;
                    break e;
                  case 31:
                    return -4;
                  default:
                    return h;
                }
                return F.next_out = ce, F.avail_out = ye, F.next_in = ne, F.avail_in = ie, x.hold = j, x.bits = Q, (x.wsize || he !== F.avail_out && x.mode < 30 && (x.mode < 27 || Y !== 4)) && ee(F, F.output, F.next_out, he - F.avail_out) ? (x.mode = 31, -4) : (we -= F.avail_in, he -= F.avail_out, F.total_in += we, F.total_out += he, x.total += he, x.wrap && he && (F.adler = x.check = x.flags ? e(x.check, pe, he, F.next_out - he) : i(x.check, pe, he, F.next_out - he)), F.data_type = x.bits + (x.last ? 64 : 0) + (x.mode === 12 ? 128 : 0) + (x.mode === 20 || x.mode === 15 ? 256 : 0), (we == 0 && he === 0 || Y === 4) && $ === y && ($ = -5), $);
              }, p.inflateEnd = function(F) {
                if (!F || !F.state) return h;
                var Y = F.state;
                return Y.window && (Y.window = null), F.state = null, y;
              }, p.inflateGetHeader = function(F, Y) {
                var x;
                return F && F.state ? (2 & (x = F.state).wrap) == 0 ? h : ((x.head = Y).done = !1, y) : h;
              }, p.inflateSetDictionary = function(F, Y) {
                var x, K = Y.length;
                return F && F.state ? (x = F.state).wrap !== 0 && x.mode !== 11 ? h : x.mode === 11 && i(1, Y, K, 0) !== x.check ? -3 : ee(F, Y, K, K) ? (x.mode = 31, -4) : (x.havedict = 1, y) : h;
              }, p.inflateInfo = "pako inflate (from Nodeca project)";
            }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(a, g, p) {
              var u = a("../utils/common"), i = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], e = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], s = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], d = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
              g.exports = function(v, w, y, h, _, c, n, r) {
                var m, T, z, I, A, O, B, k, W, ee = r.bits, F = 0, Y = 0, x = 0, K = 0, pe = 0, ne = 0, ce = 0, ie = 0, ye = 0, j = 0, Q = null, we = 0, he = new u.Buf16(16), le = new u.Buf16(16), Re = null, Ce = 0;
                for (F = 0; F <= 15; F++) he[F] = 0;
                for (Y = 0; Y < h; Y++) he[w[y + Y]]++;
                for (pe = ee, K = 15; 1 <= K && he[K] === 0; K--) ;
                if (K < pe && (pe = K), K === 0) return _[c++] = 20971520, _[c++] = 20971520, r.bits = 1, 0;
                for (x = 1; x < K && he[x] === 0; x++) ;
                for (pe < x && (pe = x), F = ie = 1; F <= 15; F++) if (ie <<= 1, (ie -= he[F]) < 0) return -1;
                if (0 < ie && (v === 0 || K !== 1)) return -1;
                for (le[1] = 0, F = 1; F < 15; F++) le[F + 1] = le[F] + he[F];
                for (Y = 0; Y < h; Y++) w[y + Y] !== 0 && (n[le[w[y + Y]]++] = Y);
                if (O = v === 0 ? (Q = Re = n, 19) : v === 1 ? (Q = i, we -= 257, Re = e, Ce -= 257, 256) : (Q = s, Re = d, -1), F = x, A = c, ce = Y = j = 0, z = -1, I = (ye = 1 << (ne = pe)) - 1, v === 1 && 852 < ye || v === 2 && 592 < ye) return 1;
                for (; ; ) {
                  for (B = F - ce, W = n[Y] < O ? (k = 0, n[Y]) : n[Y] > O ? (k = Re[Ce + n[Y]], Q[we + n[Y]]) : (k = 96, 0), m = 1 << F - ce, x = T = 1 << ne; _[A + (j >> ce) + (T -= m)] = B << 24 | k << 16 | W | 0, T !== 0; ) ;
                  for (m = 1 << F - 1; j & m; ) m >>= 1;
                  if (m !== 0 ? (j &= m - 1, j += m) : j = 0, Y++, --he[F] == 0) {
                    if (F === K) break;
                    F = w[y + n[Y]];
                  }
                  if (pe < F && (j & I) !== z) {
                    for (ce === 0 && (ce = pe), A += x, ie = 1 << (ne = F - ce); ne + ce < K && !((ie -= he[ne + ce]) <= 0); ) ne++, ie <<= 1;
                    if (ye += 1 << ne, v === 1 && 852 < ye || v === 2 && 592 < ye) return 1;
                    _[z = j & I] = pe << 24 | ne << 16 | A - c | 0;
                  }
                }
                return j !== 0 && (_[A + j] = F - ce << 24 | 64 << 16 | 0), r.bits = pe, 0;
              };
            }, { "../utils/common": 41 }], 51: [function(a, g, p) {
              g.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
            }, {}], 52: [function(a, g, p) {
              var u = a("../utils/common"), i = 0, e = 1;
              function s(l) {
                for (var t = l.length; 0 <= --t; ) l[t] = 0;
              }
              var d = 0, v = 29, w = 256, y = w + 1 + v, h = 30, _ = 19, c = 2 * y + 1, n = 15, r = 16, m = 7, T = 256, z = 16, I = 17, A = 18, O = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], B = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], W = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], ee = new Array(2 * (y + 2));
              s(ee);
              var F = new Array(2 * h);
              s(F);
              var Y = new Array(512);
              s(Y);
              var x = new Array(256);
              s(x);
              var K = new Array(v);
              s(K);
              var pe, ne, ce, ie = new Array(h);
              function ye(l, t, o, D, C) {
                this.static_tree = l, this.extra_bits = t, this.extra_base = o, this.elems = D, this.max_length = C, this.has_stree = l && l.length;
              }
              function j(l, t) {
                this.dyn_tree = l, this.max_code = 0, this.stat_desc = t;
              }
              function Q(l) {
                return l < 256 ? Y[l] : Y[256 + (l >>> 7)];
              }
              function we(l, t) {
                l.pending_buf[l.pending++] = 255 & t, l.pending_buf[l.pending++] = t >>> 8 & 255;
              }
              function he(l, t, o) {
                l.bi_valid > r - o ? (l.bi_buf |= t << l.bi_valid & 65535, we(l, l.bi_buf), l.bi_buf = t >> r - l.bi_valid, l.bi_valid += o - r) : (l.bi_buf |= t << l.bi_valid & 65535, l.bi_valid += o);
              }
              function le(l, t, o) {
                he(l, o[2 * t], o[2 * t + 1]);
              }
              function Re(l, t) {
                for (var o = 0; o |= 1 & l, l >>>= 1, o <<= 1, 0 < --t; ) ;
                return o >>> 1;
              }
              function Ce(l, t, o) {
                var D, C, G = new Array(n + 1), te = 0;
                for (D = 1; D <= n; D++) G[D] = te = te + o[D - 1] << 1;
                for (C = 0; C <= t; C++) {
                  var ae = l[2 * C + 1];
                  ae !== 0 && (l[2 * C] = Re(G[ae]++, ae));
                }
              }
              function be(l) {
                var t;
                for (t = 0; t < y; t++) l.dyn_ltree[2 * t] = 0;
                for (t = 0; t < h; t++) l.dyn_dtree[2 * t] = 0;
                for (t = 0; t < _; t++) l.bl_tree[2 * t] = 0;
                l.dyn_ltree[2 * T] = 1, l.opt_len = l.static_len = 0, l.last_lit = l.matches = 0;
              }
              function Te(l) {
                8 < l.bi_valid ? we(l, l.bi_buf) : 0 < l.bi_valid && (l.pending_buf[l.pending++] = l.bi_buf), l.bi_buf = 0, l.bi_valid = 0;
              }
              function Ie(l, t, o, D) {
                var C = 2 * t, G = 2 * o;
                return l[C] < l[G] || l[C] === l[G] && D[t] <= D[o];
              }
              function De(l, t, o) {
                for (var D = l.heap[o], C = o << 1; C <= l.heap_len && (C < l.heap_len && Ie(t, l.heap[C + 1], l.heap[C], l.depth) && C++, !Ie(t, D, l.heap[C], l.depth)); ) l.heap[o] = l.heap[C], o = C, C <<= 1;
                l.heap[o] = D;
              }
              function Le(l, t, o) {
                var D, C, G, te, ae = 0;
                if (l.last_lit !== 0) for (; D = l.pending_buf[l.d_buf + 2 * ae] << 8 | l.pending_buf[l.d_buf + 2 * ae + 1], C = l.pending_buf[l.l_buf + ae], ae++, D === 0 ? le(l, C, t) : (le(l, (G = x[C]) + w + 1, t), (te = O[G]) !== 0 && he(l, C -= K[G], te), le(l, G = Q(--D), o), (te = B[G]) !== 0 && he(l, D -= ie[G], te)), ae < l.last_lit; ) ;
                le(l, T, t);
              }
              function Be(l, t) {
                var o, D, C, G = t.dyn_tree, te = t.stat_desc.static_tree, ae = t.stat_desc.has_stree, de = t.stat_desc.elems, xe = -1;
                for (l.heap_len = 0, l.heap_max = c, o = 0; o < de; o++) G[2 * o] !== 0 ? (l.heap[++l.heap_len] = xe = o, l.depth[o] = 0) : G[2 * o + 1] = 0;
                for (; l.heap_len < 2; ) G[2 * (C = l.heap[++l.heap_len] = xe < 2 ? ++xe : 0)] = 1, l.depth[C] = 0, l.opt_len--, ae && (l.static_len -= te[2 * C + 1]);
                for (t.max_code = xe, o = l.heap_len >> 1; 1 <= o; o--) De(l, G, o);
                for (C = de; o = l.heap[1], l.heap[1] = l.heap[l.heap_len--], De(l, G, 1), D = l.heap[1], l.heap[--l.heap_max] = o, l.heap[--l.heap_max] = D, G[2 * C] = G[2 * o] + G[2 * D], l.depth[C] = (l.depth[o] >= l.depth[D] ? l.depth[o] : l.depth[D]) + 1, G[2 * o + 1] = G[2 * D + 1] = C, l.heap[1] = C++, De(l, G, 1), 2 <= l.heap_len; ) ;
                l.heap[--l.heap_max] = l.heap[1], (function(me, Ae) {
                  var ze, Xe, He, re, fe, _e, Ee = Ae.dyn_tree, Se = Ae.max_code, Me = Ae.stat_desc.static_tree, Fe = Ae.stat_desc.has_stree, Ue = Ae.stat_desc.extra_bits, N = Ae.stat_desc.extra_base, L = Ae.stat_desc.max_length, Z = 0;
                  for (re = 0; re <= n; re++) me.bl_count[re] = 0;
                  for (Ee[2 * me.heap[me.heap_max] + 1] = 0, ze = me.heap_max + 1; ze < c; ze++) L < (re = Ee[2 * Ee[2 * (Xe = me.heap[ze]) + 1] + 1] + 1) && (re = L, Z++), Ee[2 * Xe + 1] = re, Se < Xe || (me.bl_count[re]++, fe = 0, N <= Xe && (fe = Ue[Xe - N]), _e = Ee[2 * Xe], me.opt_len += _e * (re + fe), Fe && (me.static_len += _e * (Me[2 * Xe + 1] + fe)));
                  if (Z !== 0) {
                    do {
                      for (re = L - 1; me.bl_count[re] === 0; ) re--;
                      me.bl_count[re]--, me.bl_count[re + 1] += 2, me.bl_count[L]--, Z -= 2;
                    } while (0 < Z);
                    for (re = L; re !== 0; re--) for (Xe = me.bl_count[re]; Xe !== 0; ) Se < (He = me.heap[--ze]) || (Ee[2 * He + 1] !== re && (me.opt_len += (re - Ee[2 * He + 1]) * Ee[2 * He], Ee[2 * He + 1] = re), Xe--);
                  }
                })(l, t), Ce(G, xe, l.bl_count);
              }
              function f(l, t, o) {
                var D, C, G = -1, te = t[1], ae = 0, de = 7, xe = 4;
                for (te === 0 && (de = 138, xe = 3), t[2 * (o + 1) + 1] = 65535, D = 0; D <= o; D++) C = te, te = t[2 * (D + 1) + 1], ++ae < de && C === te || (ae < xe ? l.bl_tree[2 * C] += ae : C !== 0 ? (C !== G && l.bl_tree[2 * C]++, l.bl_tree[2 * z]++) : ae <= 10 ? l.bl_tree[2 * I]++ : l.bl_tree[2 * A]++, G = C, xe = (ae = 0) === te ? (de = 138, 3) : C === te ? (de = 6, 3) : (de = 7, 4));
              }
              function $(l, t, o) {
                var D, C, G = -1, te = t[1], ae = 0, de = 7, xe = 4;
                for (te === 0 && (de = 138, xe = 3), D = 0; D <= o; D++) if (C = te, te = t[2 * (D + 1) + 1], !(++ae < de && C === te)) {
                  if (ae < xe) for (; le(l, C, l.bl_tree), --ae != 0; ) ;
                  else C !== 0 ? (C !== G && (le(l, C, l.bl_tree), ae--), le(l, z, l.bl_tree), he(l, ae - 3, 2)) : ae <= 10 ? (le(l, I, l.bl_tree), he(l, ae - 3, 3)) : (le(l, A, l.bl_tree), he(l, ae - 11, 7));
                  G = C, xe = (ae = 0) === te ? (de = 138, 3) : C === te ? (de = 6, 3) : (de = 7, 4);
                }
              }
              s(ie);
              var V = !1;
              function X(l, t, o, D) {
                he(l, (d << 1) + (D ? 1 : 0), 3), (function(C, G, te, ae) {
                  Te(C), we(C, te), we(C, ~te), u.arraySet(C.pending_buf, C.window, G, te, C.pending), C.pending += te;
                })(l, t, o);
              }
              p._tr_init = function(l) {
                V || ((function() {
                  var t, o, D, C, G, te = new Array(n + 1);
                  for (C = D = 0; C < v - 1; C++) for (K[C] = D, t = 0; t < 1 << O[C]; t++) x[D++] = C;
                  for (x[D - 1] = C, C = G = 0; C < 16; C++) for (ie[C] = G, t = 0; t < 1 << B[C]; t++) Y[G++] = C;
                  for (G >>= 7; C < h; C++) for (ie[C] = G << 7, t = 0; t < 1 << B[C] - 7; t++) Y[256 + G++] = C;
                  for (o = 0; o <= n; o++) te[o] = 0;
                  for (t = 0; t <= 143; ) ee[2 * t + 1] = 8, t++, te[8]++;
                  for (; t <= 255; ) ee[2 * t + 1] = 9, t++, te[9]++;
                  for (; t <= 279; ) ee[2 * t + 1] = 7, t++, te[7]++;
                  for (; t <= 287; ) ee[2 * t + 1] = 8, t++, te[8]++;
                  for (Ce(ee, y + 1, te), t = 0; t < h; t++) F[2 * t + 1] = 5, F[2 * t] = Re(t, 5);
                  pe = new ye(ee, O, w + 1, y, n), ne = new ye(F, B, 0, h, n), ce = new ye(new Array(0), k, 0, _, m);
                })(), V = !0), l.l_desc = new j(l.dyn_ltree, pe), l.d_desc = new j(l.dyn_dtree, ne), l.bl_desc = new j(l.bl_tree, ce), l.bi_buf = 0, l.bi_valid = 0, be(l);
              }, p._tr_stored_block = X, p._tr_flush_block = function(l, t, o, D) {
                var C, G, te = 0;
                0 < l.level ? (l.strm.data_type === 2 && (l.strm.data_type = (function(ae) {
                  var de, xe = 4093624447;
                  for (de = 0; de <= 31; de++, xe >>>= 1) if (1 & xe && ae.dyn_ltree[2 * de] !== 0) return i;
                  if (ae.dyn_ltree[18] !== 0 || ae.dyn_ltree[20] !== 0 || ae.dyn_ltree[26] !== 0) return e;
                  for (de = 32; de < w; de++) if (ae.dyn_ltree[2 * de] !== 0) return e;
                  return i;
                })(l)), Be(l, l.l_desc), Be(l, l.d_desc), te = (function(ae) {
                  var de;
                  for (f(ae, ae.dyn_ltree, ae.l_desc.max_code), f(ae, ae.dyn_dtree, ae.d_desc.max_code), Be(ae, ae.bl_desc), de = _ - 1; 3 <= de && ae.bl_tree[2 * W[de] + 1] === 0; de--) ;
                  return ae.opt_len += 3 * (de + 1) + 5 + 5 + 4, de;
                })(l), C = l.opt_len + 3 + 7 >>> 3, (G = l.static_len + 3 + 7 >>> 3) <= C && (C = G)) : C = G = o + 5, o + 4 <= C && t !== -1 ? X(l, t, o, D) : l.strategy === 4 || G === C ? (he(l, 2 + (D ? 1 : 0), 3), Le(l, ee, F)) : (he(l, 4 + (D ? 1 : 0), 3), (function(ae, de, xe, me) {
                  var Ae;
                  for (he(ae, de - 257, 5), he(ae, xe - 1, 5), he(ae, me - 4, 4), Ae = 0; Ae < me; Ae++) he(ae, ae.bl_tree[2 * W[Ae] + 1], 3);
                  $(ae, ae.dyn_ltree, de - 1), $(ae, ae.dyn_dtree, xe - 1);
                })(l, l.l_desc.max_code + 1, l.d_desc.max_code + 1, te + 1), Le(l, l.dyn_ltree, l.dyn_dtree)), be(l), D && Te(l);
              }, p._tr_tally = function(l, t, o) {
                return l.pending_buf[l.d_buf + 2 * l.last_lit] = t >>> 8 & 255, l.pending_buf[l.d_buf + 2 * l.last_lit + 1] = 255 & t, l.pending_buf[l.l_buf + l.last_lit] = 255 & o, l.last_lit++, t === 0 ? l.dyn_ltree[2 * o]++ : (l.matches++, t--, l.dyn_ltree[2 * (x[o] + w + 1)]++, l.dyn_dtree[2 * Q(t)]++), l.last_lit === l.lit_bufsize - 1;
              }, p._tr_align = function(l) {
                he(l, 2, 3), le(l, T, ee), (function(t) {
                  t.bi_valid === 16 ? (we(t, t.bi_buf), t.bi_buf = 0, t.bi_valid = 0) : 8 <= t.bi_valid && (t.pending_buf[t.pending++] = 255 & t.bi_buf, t.bi_buf >>= 8, t.bi_valid -= 8);
                })(l);
              };
            }, { "../utils/common": 41 }], 53: [function(a, g, p) {
              g.exports = function() {
                this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
              };
            }, {}], 54: [function(a, g, p) {
              g.exports = typeof setImmediate == "function" ? setImmediate : function() {
                var u = [].slice.apply(arguments);
                u.splice(1, 0, 0), setTimeout.apply(null, u);
              };
            }, {}] }, {}, [10])(10);
          });
        }).call(this, typeof pt < "u" ? pt : typeof self < "u" ? self : typeof window < "u" ? window : {}, P("buffer").Buffer);
      }, { buffer: 48 }], 54: [function(P, se, R) {
        R.Parser = P("./lib/parser").Parser, R.rules = P("./lib/rules"), R.errors = P("./lib/errors"), R.results = P("./lib/parsing-results"), R.StringSource = P("./lib/StringSource"), R.Token = P("./lib/Token"), R.bottomUp = P("./lib/bottom-up"), R.RegexTokeniser = P("./lib/regex-tokeniser").RegexTokeniser, R.rule = function(M) {
          var E;
          return function(a) {
            return E || (E = M()), E(a);
          };
        };
      }, { "./lib/StringSource": 55, "./lib/Token": 56, "./lib/bottom-up": 58, "./lib/errors": 59, "./lib/parser": 61, "./lib/parsing-results": 62, "./lib/regex-tokeniser": 63, "./lib/rules": 64 }], 55: [function(P, se, R) {
        se.exports = function(E, a) {
          var g = {
            asString: function() {
              return E;
            },
            range: function(p, u) {
              return new M(E, a, p, u);
            }
          };
          return g;
        };
        var M = function(E, a, g, p) {
          this._string = E, this._description = a, this._startIndex = g, this._endIndex = p;
        };
        M.prototype.to = function(E) {
          return new M(this._string, this._description, this._startIndex, E._endIndex);
        }, M.prototype.describe = function() {
          var E = this._position(), a = this._description ? this._description + `
` : "";
          return a + "Line number: " + E.lineNumber + `
Character number: ` + E.characterNumber;
        }, M.prototype.lineNumber = function() {
          return this._position().lineNumber;
        }, M.prototype.characterNumber = function() {
          return this._position().characterNumber;
        }, M.prototype._position = function() {
          for (var E = this, a = 0, g = function() {
            return E._string.indexOf(`
`, a);
          }, p = 1; g() !== -1 && g() < this._startIndex; )
            a = g() + 1, p += 1;
          var u = this._startIndex - a + 1;
          return { lineNumber: p, characterNumber: u };
        };
      }, {}], 56: [function(P, se, R) {
        se.exports = function(M, E, a) {
          this.name = M, this.value = E, a && (this.source = a);
        };
      }, {}], 57: [function(P, se, R) {
        var M = se.exports = function(E, a) {
          this._tokens = E, this._startIndex = a || 0;
        };
        M.prototype.head = function() {
          return this._tokens[this._startIndex];
        }, M.prototype.tail = function(E) {
          return new M(this._tokens, this._startIndex + 1);
        }, M.prototype.toArray = function() {
          return this._tokens.slice(this._startIndex);
        }, M.prototype.end = function() {
          return this._tokens[this._tokens.length - 1];
        }, M.prototype.to = function(E) {
          var a = this.head().source, g = E.head() || E.end();
          return a.to(g.source);
        };
      }, {}], 58: [function(P, se, R) {
        var M = P("./rules"), E = P("./parsing-results");
        R.parser = function(p, u, i) {
          var e = {
            rule: w,
            leftAssociative: y,
            rightAssociative: h
          }, s = new a(i.map(v)), d = M.firstOf(p, u);
          function v(n) {
            return {
              name: n.name,
              rule: g(n.ruleBuilder.bind(null, e))
            };
          }
          function w() {
            return _(s);
          }
          function y(n) {
            return _(s.untilExclusive(n));
          }
          function h(n) {
            return _(s.untilInclusive(n));
          }
          function _(n) {
            return c.bind(null, n);
          }
          function c(n, r) {
            var m = d(r);
            return m.isSuccess() ? n.apply(m) : m;
          }
          return e;
        };
        function a(p) {
          function u(v) {
            return new a(p.slice(0, e().indexOf(v)));
          }
          function i(v) {
            return new a(p.slice(0, e().indexOf(v) + 1));
          }
          function e() {
            return p.map(function(v) {
              return v.name;
            });
          }
          function s(v) {
            for (var w, y; ; )
              if (w = d(v.remaining()), w.isSuccess())
                y = v.source().to(w.source()), v = E.success(
                  w.value()(v.value(), y),
                  w.remaining(),
                  y
                );
              else return w.isFailure() ? v : w;
          }
          function d(v) {
            return M.firstOf("infix", p.map(function(w) {
              return w.rule;
            }))(v);
          }
          return {
            apply: s,
            untilExclusive: u,
            untilInclusive: i
          };
        }
        R.infix = function(p, u) {
          function i(e) {
            return R.infix(p, function(s) {
              var d = u(s);
              return function(v) {
                var w = d(v);
                return w.map(function(y) {
                  return function(h, _) {
                    return e(h, y, _);
                  };
                });
              };
            });
          }
          return {
            name: p,
            ruleBuilder: u,
            map: i
          };
        };
        var g = function(p) {
          var u;
          return function(i) {
            return u || (u = p()), u(i);
          };
        };
      }, { "./parsing-results": 62, "./rules": 64 }], 59: [function(P, se, R) {
        R.error = function(E) {
          return new M(E);
        };
        var M = function(E) {
          this.expected = E.expected, this.actual = E.actual, this._location = E.location;
        };
        M.prototype.describe = function() {
          var E = this._location ? this._location.describe() + `:
` : "";
          return E + "Expected " + this.expected + `
but got ` + this.actual;
        }, M.prototype.lineNumber = function() {
          return this._location.lineNumber();
        }, M.prototype.characterNumber = function() {
          return this._location.characterNumber();
        };
      }, {}], 60: [function(P, se, R) {
        R.fromArray = function(E) {
          var a = 0, g = function() {
            return a < E.length;
          };
          return new M({
            hasNext: g,
            next: function() {
              if (g())
                return E[a++];
              throw new Error("No more elements");
            }
          });
        };
        var M = function(E) {
          this._iterator = E;
        };
        M.prototype.map = function(E) {
          var a = this._iterator;
          return new M({
            hasNext: function() {
              return a.hasNext();
            },
            next: function() {
              return E(a.next());
            }
          });
        }, M.prototype.filter = function(E) {
          var a = this._iterator, g = !1, p = !1, u, i = function() {
            if (!g)
              for (g = !0, p = !1; a.hasNext() && !p; )
                u = a.next(), p = E(u);
          };
          return new M({
            hasNext: function() {
              return i(), p;
            },
            next: function() {
              i();
              var e = u;
              return g = !1, e;
            }
          });
        }, M.prototype.first = function() {
          var E = this._iterator;
          return this._iterator.hasNext() ? E.next() : null;
        }, M.prototype.toArray = function() {
          for (var E = []; this._iterator.hasNext(); )
            E.push(this._iterator.next());
          return E;
        };
      }, {}], 61: [function(P, se, R) {
        var M = P("./TokenIterator");
        R.Parser = function(E) {
          var a = function(g, p) {
            return g(new M(p));
          };
          return {
            parseTokens: a
          };
        };
      }, { "./TokenIterator": 57 }], 62: [function(P, se, R) {
        se.exports = {
          failure: function(E, a) {
            if (E.length < 1)
              throw new Error("Failure must have errors");
            return new M({
              status: "failure",
              remaining: a,
              errors: E
            });
          },
          error: function(E, a) {
            if (E.length < 1)
              throw new Error("Failure must have errors");
            return new M({
              status: "error",
              remaining: a,
              errors: E
            });
          },
          success: function(E, a, g) {
            return new M({
              status: "success",
              value: E,
              source: g,
              remaining: a,
              errors: []
            });
          },
          cut: function(E) {
            return new M({
              status: "cut",
              remaining: E,
              errors: []
            });
          }
        };
        var M = function(E) {
          this._value = E.value, this._status = E.status, this._hasValue = E.value !== void 0, this._remaining = E.remaining, this._source = E.source, this._errors = E.errors;
        };
        M.prototype.map = function(E) {
          return this._hasValue ? new M({
            value: E(this._value, this._source),
            status: this._status,
            remaining: this._remaining,
            source: this._source,
            errors: this._errors
          }) : this;
        }, M.prototype.changeRemaining = function(E) {
          return new M({
            value: this._value,
            status: this._status,
            remaining: E,
            source: this._source,
            errors: this._errors
          });
        }, M.prototype.isSuccess = function() {
          return this._status === "success" || this._status === "cut";
        }, M.prototype.isFailure = function() {
          return this._status === "failure";
        }, M.prototype.isError = function() {
          return this._status === "error";
        }, M.prototype.isCut = function() {
          return this._status === "cut";
        }, M.prototype.value = function() {
          return this._value;
        }, M.prototype.remaining = function() {
          return this._remaining;
        }, M.prototype.source = function() {
          return this._source;
        }, M.prototype.errors = function() {
          return this._errors;
        };
      }, {}], 63: [function(P, se, R) {
        var M = P("./Token"), E = P("./StringSource");
        R.RegexTokeniser = a;
        function a(g) {
          g = g.map(function(e) {
            return {
              name: e.name,
              regex: new RegExp(e.regex.source, "g")
            };
          });
          function p(e, s) {
            for (var d = new E(e, s), v = 0, w = []; v < e.length; ) {
              var y = u(e, v, d);
              v = y.endIndex, w.push(y.token);
            }
            return w.push(i(e, d)), w;
          }
          function u(e, s, d) {
            for (var v = 0; v < g.length; v++) {
              var w = g[v].regex;
              w.lastIndex = s;
              var y = w.exec(e);
              if (y) {
                var _ = s + y[0].length;
                if (y.index === s && _ > s) {
                  var h = y[1], c = new M(
                    g[v].name,
                    h,
                    d.range(s, _)
                  );
                  return { token: c, endIndex: _ };
                }
              }
            }
            var _ = s + 1, c = new M(
              "unrecognisedCharacter",
              e.substring(s, _),
              d.range(s, _)
            );
            return { token: c, endIndex: _ };
          }
          function i(e, s) {
            return new M(
              "end",
              null,
              s.range(e.length, e.length)
            );
          }
          return {
            tokenise: p
          };
        }
      }, { "./StringSource": 55, "./Token": 56 }], 64: [function(P, se, R) {
        var M = P("underscore"), E = P("option"), a = P("./parsing-results"), g = P("./errors"), p = P("./lazy-iterators");
        R.token = function(w, y) {
          var h = y !== void 0;
          return function(_) {
            var c = _.head();
            if (c && c.name === w && (!h || c.value === y))
              return a.success(c.value, _.tail(), c.source);
            var n = d({ name: w, value: y });
            return v(_, n);
          };
        }, R.tokenOfType = function(w) {
          return R.token(w);
        }, R.firstOf = function(w, y) {
          return M.isArray(y) || (y = Array.prototype.slice.call(arguments, 1)), function(h) {
            return p.fromArray(y).map(function(_) {
              return _(h);
            }).filter(function(_) {
              return _.isSuccess() || _.isError();
            }).first() || v(h, w);
          };
        }, R.then = function(w, y) {
          return function(h) {
            var _ = w(h);
            return _.map || console.log(_), _.map(y);
          };
        }, R.sequence = function() {
          var w = Array.prototype.slice.call(arguments, 0), y = function(_) {
            var c = M.foldl(w, function(r, m) {
              var T = r.result, z = r.hasCut;
              if (!T.isSuccess())
                return { result: T, hasCut: z };
              var I = m(T.remaining());
              if (I.isCut())
                return { result: T, hasCut: !0 };
              if (I.isSuccess()) {
                var A;
                m.isCaptured ? A = T.value().withValue(m, I.value()) : A = T.value();
                var O = I.remaining(), B = _.to(O);
                return {
                  result: a.success(A, O, B),
                  hasCut: z
                };
              } else return z ? { result: a.error(I.errors(), I.remaining()), hasCut: z } : { result: I, hasCut: z };
            }, { result: a.success(new u(), _), hasCut: !1 }).result, n = _.to(c.remaining());
            return c.map(function(r) {
              return r.withValue(R.sequence.source, n);
            });
          };
          y.head = function() {
            var _ = M.find(w, h);
            return R.then(
              y,
              R.sequence.extract(_)
            );
          }, y.map = function(_) {
            return R.then(
              y,
              function(c) {
                return _.apply(this, c.toArray());
              }
            );
          };
          function h(_) {
            return _.isCaptured;
          }
          return y;
        };
        var u = function(w, y) {
          this._values = w || {}, this._valuesArray = y || [];
        };
        u.prototype.withValue = function(w, y) {
          if (w.captureName && w.captureName in this._values)
            throw new Error('Cannot add second value for capture "' + w.captureName + '"');
          var h = M.clone(this._values);
          h[w.captureName] = y;
          var _ = this._valuesArray.concat([y]);
          return new u(h, _);
        }, u.prototype.get = function(w) {
          if (w.captureName in this._values)
            return this._values[w.captureName];
          throw new Error('No value for capture "' + w.captureName + '"');
        }, u.prototype.toArray = function() {
          return this._valuesArray;
        }, R.sequence.capture = function(w, y) {
          var h = function() {
            return w.apply(this, arguments);
          };
          return h.captureName = y, h.isCaptured = !0, h;
        }, R.sequence.extract = function(w) {
          return function(y) {
            return y.get(w);
          };
        }, R.sequence.applyValues = function(w) {
          var y = Array.prototype.slice.call(arguments, 1);
          return function(h) {
            var _ = y.map(function(c) {
              return h.get(c);
            });
            return w.apply(this, _);
          };
        }, R.sequence.source = {
          captureName: "☃source☃"
        }, R.sequence.cut = function() {
          return function(w) {
            return a.cut(w);
          };
        }, R.optional = function(w) {
          return function(y) {
            var h = w(y);
            return h.isSuccess() ? h.map(E.some) : h.isFailure() ? a.success(E.none, y) : h;
          };
        }, R.zeroOrMoreWithSeparator = function(w, y) {
          return s(w, y, !1);
        }, R.oneOrMoreWithSeparator = function(w, y) {
          return s(w, y, !0);
        };
        var i = R.zeroOrMore = function(w) {
          return function(y) {
            for (var h = [], _; (_ = w(y)) && _.isSuccess(); )
              y = _.remaining(), h.push(_.value());
            return _.isError() ? _ : a.success(h, y);
          };
        };
        R.oneOrMore = function(w) {
          return R.oneOrMoreWithSeparator(w, e);
        };
        function e(w) {
          return a.success(null, w);
        }
        var s = function(w, y, h) {
          return function(_) {
            var c = w(_);
            if (c.isSuccess()) {
              var n = R.sequence.capture(w, "main"), r = i(R.then(
                R.sequence(y, n),
                R.sequence.extract(n)
              )), m = r(c.remaining());
              return a.success([c.value()].concat(m.value()), m.remaining());
            } else return h || c.isError() ? c : a.success([], _);
          };
        };
        R.leftAssociative = function(w, y, h) {
          var _;
          h ? _ = [{ func: h, rule: y }] : _ = y, _ = _.map(function(n) {
            return R.then(n.rule, function(r) {
              return function(m, T) {
                return n.func(m, r, T);
              };
            });
          });
          var c = R.firstOf.apply(null, ["rules"].concat(_));
          return function(n) {
            var r = n, m = w(n);
            if (!m.isSuccess())
              return m;
            for (var T = c(m.remaining()); T.isSuccess(); ) {
              var z = T.remaining(), I = r.to(T.remaining()), A = T.value();
              m = a.success(
                A(m.value(), I),
                z,
                I
              ), T = c(m.remaining());
            }
            return T.isError() ? T : m;
          };
        }, R.leftAssociative.firstOf = function() {
          return Array.prototype.slice.call(arguments, 0);
        }, R.nonConsuming = function(w) {
          return function(y) {
            return w(y).changeRemaining(y);
          };
        };
        var d = function(w) {
          return w.value ? w.name + ' "' + w.value + '"' : w.name;
        };
        function v(w, y) {
          var h, _ = w.head();
          return _ ? h = g.error({
            expected: y,
            actual: d(_),
            location: _.source
          }) : h = g.error({
            expected: y,
            actual: "end of tokens"
          }), a.failure([h], w);
        }
      }, { "./errors": 59, "./lazy-iterators": 60, "./parsing-results": 62, option: 65, underscore: 67 }], 65: [function(P, se, R) {
        R.none = /* @__PURE__ */ Object.create({
          value: function() {
            throw new Error("Called value on none");
          },
          isNone: function() {
            return !0;
          },
          isSome: function() {
            return !1;
          },
          map: function() {
            return R.none;
          },
          flatMap: function() {
            return R.none;
          },
          filter: function() {
            return R.none;
          },
          toArray: function() {
            return [];
          },
          orElse: M,
          valueOrElse: M
        });
        function M(a) {
          return typeof a == "function" ? a() : a;
        }
        R.some = function(a) {
          return new E(a);
        };
        var E = function(a) {
          this._value = a;
        };
        E.prototype.value = function() {
          return this._value;
        }, E.prototype.isNone = function() {
          return !1;
        }, E.prototype.isSome = function() {
          return !0;
        }, E.prototype.map = function(a) {
          return new E(a(this._value));
        }, E.prototype.flatMap = function(a) {
          return a(this._value);
        }, E.prototype.filter = function(a) {
          return a(this._value) ? this : R.none;
        }, E.prototype.toArray = function() {
          return [this._value];
        }, E.prototype.orElse = function(a) {
          return this;
        }, E.prototype.valueOrElse = function(a) {
          return this._value;
        }, R.isOption = function(a) {
          return a === R.none || a instanceof E;
        }, R.fromNullable = function(a) {
          return a == null ? R.none : new E(a);
        };
      }, {}], 66: [function(P, se, R) {
        var M = se.exports = {}, E, a;
        function g() {
          throw new Error("setTimeout has not been defined");
        }
        function p() {
          throw new Error("clearTimeout has not been defined");
        }
        (function() {
          try {
            typeof setTimeout == "function" ? E = setTimeout : E = g;
          } catch {
            E = g;
          }
          try {
            typeof clearTimeout == "function" ? a = clearTimeout : a = p;
          } catch {
            a = p;
          }
        })();
        function u(c) {
          if (E === setTimeout)
            return setTimeout(c, 0);
          if ((E === g || !E) && setTimeout)
            return E = setTimeout, setTimeout(c, 0);
          try {
            return E(c, 0);
          } catch {
            try {
              return E.call(null, c, 0);
            } catch {
              return E.call(this, c, 0);
            }
          }
        }
        function i(c) {
          if (a === clearTimeout)
            return clearTimeout(c);
          if ((a === p || !a) && clearTimeout)
            return a = clearTimeout, clearTimeout(c);
          try {
            return a(c);
          } catch {
            try {
              return a.call(null, c);
            } catch {
              return a.call(this, c);
            }
          }
        }
        var e = [], s = !1, d, v = -1;
        function w() {
          !s || !d || (s = !1, d.length ? e = d.concat(e) : v = -1, e.length && y());
        }
        function y() {
          if (!s) {
            var c = u(w);
            s = !0;
            for (var n = e.length; n; ) {
              for (d = e, e = []; ++v < n; )
                d && d[v].run();
              v = -1, n = e.length;
            }
            d = null, s = !1, i(c);
          }
        }
        M.nextTick = function(c) {
          var n = new Array(arguments.length - 1);
          if (arguments.length > 1)
            for (var r = 1; r < arguments.length; r++)
              n[r - 1] = arguments[r];
          e.push(new h(c, n)), e.length === 1 && !s && u(y);
        };
        function h(c, n) {
          this.fun = c, this.array = n;
        }
        h.prototype.run = function() {
          this.fun.apply(null, this.array);
        }, M.title = "browser", M.browser = !0, M.env = {}, M.argv = [], M.version = "", M.versions = {};
        function _() {
        }
        M.on = _, M.addListener = _, M.once = _, M.off = _, M.removeListener = _, M.removeAllListeners = _, M.emit = _, M.binding = function(c) {
          throw new Error("process.binding is not supported");
        }, M.cwd = function() {
          return "/";
        }, M.chdir = function(c) {
          throw new Error("process.chdir is not supported");
        }, M.umask = function() {
          return 0;
        };
      }, {}], 67: [function(P, se, R) {
        (function(M) {
          (function(E, a) {
            typeof R == "object" && typeof se < "u" ? se.exports = a() : (E = typeof globalThis < "u" ? globalThis : E || self, (function() {
              var g = E._, p = E._ = a();
              p.noConflict = function() {
                return E._ = g, p;
              };
            })());
          })(this, (function() {
            var E = "1.13.1", a = typeof self == "object" && self.self === self && self || typeof M == "object" && M.global === M && M || Function("return this")() || {}, g = Array.prototype, p = Object.prototype, u = typeof Symbol < "u" ? Symbol.prototype : null, i = g.push, e = g.slice, s = p.toString, d = p.hasOwnProperty, v = typeof ArrayBuffer < "u", w = typeof DataView < "u", y = Array.isArray, h = Object.keys, _ = Object.create, c = v && ArrayBuffer.isView, n = isNaN, r = isFinite, m = !{ toString: null }.propertyIsEnumerable("toString"), T = [
              "valueOf",
              "isPrototypeOf",
              "toString",
              "propertyIsEnumerable",
              "hasOwnProperty",
              "toLocaleString"
            ], z = Math.pow(2, 53) - 1;
            function I(b, S) {
              return S = S == null ? b.length - 1 : +S, function() {
                for (var U = Math.max(arguments.length - S, 0), H = Array(U), q = 0; q < U; q++)
                  H[q] = arguments[q + S];
                switch (S) {
                  case 0:
                    return b.call(this, H);
                  case 1:
                    return b.call(this, arguments[0], H);
                  case 2:
                    return b.call(this, arguments[0], arguments[1], H);
                }
                var J = Array(S + 1);
                for (q = 0; q < S; q++)
                  J[q] = arguments[q];
                return J[S] = H, b.apply(this, J);
              };
            }
            function A(b) {
              var S = typeof b;
              return S === "function" || S === "object" && !!b;
            }
            function O(b) {
              return b === null;
            }
            function B(b) {
              return b === void 0;
            }
            function k(b) {
              return b === !0 || b === !1 || s.call(b) === "[object Boolean]";
            }
            function W(b) {
              return !!(b && b.nodeType === 1);
            }
            function ee(b) {
              var S = "[object " + b + "]";
              return function(U) {
                return s.call(U) === S;
              };
            }
            var F = ee("String"), Y = ee("Number"), x = ee("Date"), K = ee("RegExp"), pe = ee("Error"), ne = ee("Symbol"), ce = ee("ArrayBuffer"), ie = ee("Function"), ye = a.document && a.document.childNodes;
            typeof /./ != "function" && typeof Int8Array != "object" && typeof ye != "function" && (ie = function(b) {
              return typeof b == "function" || !1;
            });
            var j = ie, Q = ee("Object"), we = w && Q(new DataView(new ArrayBuffer(8))), he = typeof Map < "u" && Q(/* @__PURE__ */ new Map()), le = ee("DataView");
            function Re(b) {
              return b != null && j(b.getInt8) && ce(b.buffer);
            }
            var Ce = we ? Re : le, be = y || ee("Array");
            function Te(b, S) {
              return b != null && d.call(b, S);
            }
            var Ie = ee("Arguments");
            (function() {
              Ie(arguments) || (Ie = function(b) {
                return Te(b, "callee");
              });
            })();
            var De = Ie;
            function Le(b) {
              return !ne(b) && r(b) && !isNaN(parseFloat(b));
            }
            function Be(b) {
              return Y(b) && n(b);
            }
            function f(b) {
              return function() {
                return b;
              };
            }
            function $(b) {
              return function(S) {
                var U = b(S);
                return typeof U == "number" && U >= 0 && U <= z;
              };
            }
            function V(b) {
              return function(S) {
                return S?.[b];
              };
            }
            var X = V("byteLength"), l = $(X), t = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
            function o(b) {
              return c ? c(b) && !Ce(b) : l(b) && t.test(s.call(b));
            }
            var D = v ? o : f(!1), C = V("length");
            function G(b) {
              for (var S = {}, U = b.length, H = 0; H < U; ++H) S[b[H]] = !0;
              return {
                contains: function(q) {
                  return S[q];
                },
                push: function(q) {
                  return S[q] = !0, b.push(q);
                }
              };
            }
            function te(b, S) {
              S = G(S);
              var U = T.length, H = b.constructor, q = j(H) && H.prototype || p, J = "constructor";
              for (Te(b, J) && !S.contains(J) && S.push(J); U--; )
                J = T[U], J in b && b[J] !== q[J] && !S.contains(J) && S.push(J);
            }
            function ae(b) {
              if (!A(b)) return [];
              if (h) return h(b);
              var S = [];
              for (var U in b) Te(b, U) && S.push(U);
              return m && te(b, S), S;
            }
            function de(b) {
              if (b == null) return !0;
              var S = C(b);
              return typeof S == "number" && (be(b) || F(b) || De(b)) ? S === 0 : C(ae(b)) === 0;
            }
            function xe(b, S) {
              var U = ae(S), H = U.length;
              if (b == null) return !H;
              for (var q = Object(b), J = 0; J < H; J++) {
                var ue = U[J];
                if (S[ue] !== q[ue] || !(ue in q)) return !1;
              }
              return !0;
            }
            function me(b) {
              if (b instanceof me) return b;
              if (!(this instanceof me)) return new me(b);
              this._wrapped = b;
            }
            me.VERSION = E, me.prototype.value = function() {
              return this._wrapped;
            }, me.prototype.valueOf = me.prototype.toJSON = me.prototype.value, me.prototype.toString = function() {
              return String(this._wrapped);
            };
            function Ae(b) {
              return new Uint8Array(
                b.buffer || b,
                b.byteOffset || 0,
                X(b)
              );
            }
            var ze = "[object DataView]";
            function Xe(b, S, U, H) {
              if (b === S) return b !== 0 || 1 / b === 1 / S;
              if (b == null || S == null) return !1;
              if (b !== b) return S !== S;
              var q = typeof b;
              return q !== "function" && q !== "object" && typeof S != "object" ? !1 : He(b, S, U, H);
            }
            function He(b, S, U, H) {
              b instanceof me && (b = b._wrapped), S instanceof me && (S = S._wrapped);
              var q = s.call(b);
              if (q !== s.call(S)) return !1;
              if (we && q == "[object Object]" && Ce(b)) {
                if (!Ce(S)) return !1;
                q = ze;
              }
              switch (q) {
                // These types are compared by value.
                case "[object RegExp]":
                // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
                case "[object String]":
                  return "" + b == "" + S;
                case "[object Number]":
                  return +b != +b ? +S != +S : +b == 0 ? 1 / +b === 1 / S : +b == +S;
                case "[object Date]":
                case "[object Boolean]":
                  return +b == +S;
                case "[object Symbol]":
                  return u.valueOf.call(b) === u.valueOf.call(S);
                case "[object ArrayBuffer]":
                case ze:
                  return He(Ae(b), Ae(S), U, H);
              }
              var J = q === "[object Array]";
              if (!J && D(b)) {
                var ue = X(b);
                if (ue !== X(S)) return !1;
                if (b.buffer === S.buffer && b.byteOffset === S.byteOffset) return !0;
                J = !0;
              }
              if (!J) {
                if (typeof b != "object" || typeof S != "object") return !1;
                var ve = b.constructor, Oe = S.constructor;
                if (ve !== Oe && !(j(ve) && ve instanceof ve && j(Oe) && Oe instanceof Oe) && "constructor" in b && "constructor" in S)
                  return !1;
              }
              U = U || [], H = H || [];
              for (var Ne = U.length; Ne--; )
                if (U[Ne] === b) return H[Ne] === S;
              if (U.push(b), H.push(S), J) {
                if (Ne = b.length, Ne !== S.length) return !1;
                for (; Ne--; )
                  if (!Xe(b[Ne], S[Ne], U, H)) return !1;
              } else {
                var je = ae(b), Ze;
                if (Ne = je.length, ae(S).length !== Ne) return !1;
                for (; Ne--; )
                  if (Ze = je[Ne], !(Te(S, Ze) && Xe(b[Ze], S[Ze], U, H))) return !1;
              }
              return U.pop(), H.pop(), !0;
            }
            function re(b, S) {
              return Xe(b, S);
            }
            function fe(b) {
              if (!A(b)) return [];
              var S = [];
              for (var U in b) S.push(U);
              return m && te(b, S), S;
            }
            function _e(b) {
              var S = C(b);
              return function(U) {
                if (U == null) return !1;
                var H = fe(U);
                if (C(H)) return !1;
                for (var q = 0; q < S; q++)
                  if (!j(U[b[q]])) return !1;
                return b !== N || !j(U[Ee]);
              };
            }
            var Ee = "forEach", Se = "has", Me = ["clear", "delete"], Fe = ["get", Se, "set"], Ue = Me.concat(Ee, Fe), N = Me.concat(Fe), L = ["add"].concat(Me, Ee, Se), Z = he ? _e(Ue) : ee("Map"), oe = he ? _e(N) : ee("WeakMap"), ge = he ? _e(L) : ee("Set"), ke = ee("WeakSet");
            function Pe(b) {
              for (var S = ae(b), U = S.length, H = Array(U), q = 0; q < U; q++)
                H[q] = b[S[q]];
              return H;
            }
            function Ve(b) {
              for (var S = ae(b), U = S.length, H = Array(U), q = 0; q < U; q++)
                H[q] = [S[q], b[S[q]]];
              return H;
            }
            function $e(b) {
              for (var S = {}, U = ae(b), H = 0, q = U.length; H < q; H++)
                S[b[U[H]]] = U[H];
              return S;
            }
            function Je(b) {
              var S = [];
              for (var U in b)
                j(b[U]) && S.push(U);
              return S.sort();
            }
            function Ke(b, S) {
              return function(U) {
                var H = arguments.length;
                if (S && (U = Object(U)), H < 2 || U == null) return U;
                for (var q = 1; q < H; q++)
                  for (var J = arguments[q], ue = b(J), ve = ue.length, Oe = 0; Oe < ve; Oe++) {
                    var Ne = ue[Oe];
                    (!S || U[Ne] === void 0) && (U[Ne] = J[Ne]);
                  }
                return U;
              };
            }
            var et = Ke(fe), Qe = Ke(ae), tt = Ke(fe, !0);
            function qe() {
              return function() {
              };
            }
            function rt(b) {
              if (!A(b)) return {};
              if (_) return _(b);
              var S = qe();
              S.prototype = b;
              var U = new S();
              return S.prototype = null, U;
            }
            function ut(b, S) {
              var U = rt(b);
              return S && Qe(U, S), U;
            }
            function We(b) {
              return A(b) ? be(b) ? b.slice() : et({}, b) : b;
            }
            function vt(b, S) {
              return S(b), b;
            }
            function it(b) {
              return be(b) ? b : [b];
            }
            me.toPath = it;
            function st(b) {
              return me.toPath(b);
            }
            function bt(b, S) {
              for (var U = S.length, H = 0; H < U; H++) {
                if (b == null) return;
                b = b[S[H]];
              }
              return U ? b : void 0;
            }
            function Bt(b, S, U) {
              var H = bt(b, st(S));
              return B(H) ? U : H;
            }
            function hr(b, S) {
              S = st(S);
              for (var U = S.length, H = 0; H < U; H++) {
                var q = S[H];
                if (!Te(b, q)) return !1;
                b = b[q];
              }
              return !!U;
            }
            function Et(b) {
              return b;
            }
            function dt(b) {
              return b = Qe({}, b), function(S) {
                return xe(S, b);
              };
            }
            function xt(b) {
              return b = st(b), function(S) {
                return bt(S, b);
              };
            }
            function mt(b, S, U) {
              if (S === void 0) return b;
              switch (U ?? 3) {
                case 1:
                  return function(H) {
                    return b.call(S, H);
                  };
                // The 2-argument case is omitted because we’re not using it.
                case 3:
                  return function(H, q, J) {
                    return b.call(S, H, q, J);
                  };
                case 4:
                  return function(H, q, J, ue) {
                    return b.call(S, H, q, J, ue);
                  };
              }
              return function() {
                return b.apply(S, arguments);
              };
            }
            function Xt(b, S, U) {
              return b == null ? Et : j(b) ? mt(b, S, U) : A(b) && !be(b) ? dt(b) : xt(b);
            }
            function Tt(b, S) {
              return Xt(b, S, 1 / 0);
            }
            me.iteratee = Tt;
            function Ye(b, S, U) {
              return me.iteratee !== Tt ? me.iteratee(b, S) : Xt(b, S, U);
            }
            function pr(b, S, U) {
              S = Ye(S, U);
              for (var H = ae(b), q = H.length, J = {}, ue = 0; ue < q; ue++) {
                var ve = H[ue];
                J[ve] = S(b[ve], ve, b);
              }
              return J;
            }
            function zt() {
            }
            function dr(b) {
              return b == null ? zt : function(S) {
                return Bt(b, S);
              };
            }
            function mr(b, S, U) {
              var H = Array(Math.max(0, b));
              S = mt(S, U, 1);
              for (var q = 0; q < b; q++) H[q] = S(q);
              return H;
            }
            function It(b, S) {
              return S == null && (S = b, b = 0), b + Math.floor(Math.random() * (S - b + 1));
            }
            var yt = Date.now || function() {
              return (/* @__PURE__ */ new Date()).getTime();
            };
            function Ut(b) {
              var S = function(J) {
                return b[J];
              }, U = "(?:" + ae(b).join("|") + ")", H = RegExp(U), q = RegExp(U, "g");
              return function(J) {
                return J = J == null ? "" : "" + J, H.test(J) ? J.replace(q, S) : J;
              };
            }
            var Wt = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#x27;",
              "`": "&#x60;"
            }, yr = Ut(Wt), vr = $e(Wt), gr = Ut(vr), wr = me.templateSettings = {
              evaluate: /<%([\s\S]+?)%>/g,
              interpolate: /<%=([\s\S]+?)%>/g,
              escape: /<%-([\s\S]+?)%>/g
            }, Dt = /(.)^/, _r = {
              "'": "'",
              "\\": "\\",
              "\r": "r",
              "\n": "n",
              "\u2028": "u2028",
              "\u2029": "u2029"
            }, br = /\\|'|\r|\n|\u2028|\u2029/g;
            function Er(b) {
              return "\\" + _r[b];
            }
            var xr = /^\s*(\w|\$)+\s*$/;
            function Tr(b, S, U) {
              !S && U && (S = U), S = tt({}, S, me.templateSettings);
              var H = RegExp([
                (S.escape || Dt).source,
                (S.interpolate || Dt).source,
                (S.evaluate || Dt).source
              ].join("|") + "|$", "g"), q = 0, J = "__p+='";
              b.replace(H, function(Ne, je, Ze, lr, cr) {
                return J += b.slice(q, cr).replace(br, Er), q = cr + Ne.length, je ? J += `'+
((__t=(` + je + `))==null?'':_.escape(__t))+
'` : Ze ? J += `'+
((__t=(` + Ze + `))==null?'':__t)+
'` : lr && (J += `';
` + lr + `
__p+='`), Ne;
              }), J += `';
`;
              var ue = S.variable;
              if (ue) {
                if (!xr.test(ue)) throw new Error(
                  "variable is not a bare identifier: " + ue
                );
              } else
                J = `with(obj||{}){
` + J + `}
`, ue = "obj";
              J = `var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
` + J + `return __p;
`;
              var ve;
              try {
                ve = new Function(ue, "_", J);
              } catch (Ne) {
                throw Ne.source = J, Ne;
              }
              var Oe = function(Ne) {
                return ve.call(this, Ne, me);
              };
              return Oe.source = "function(" + ue + `){
` + J + "}", Oe;
            }
            function Ir(b, S, U) {
              S = st(S);
              var H = S.length;
              if (!H)
                return j(U) ? U.call(b) : U;
              for (var q = 0; q < H; q++) {
                var J = b?.[S[q]];
                J === void 0 && (J = U, q = H), b = j(J) ? J.call(b) : J;
              }
              return b;
            }
            var Dr = 0;
            function kr(b) {
              var S = ++Dr + "";
              return b ? b + S : S;
            }
            function Sr(b) {
              var S = me(b);
              return S._chain = !0, S;
            }
            function jt(b, S, U, H, q) {
              if (!(H instanceof S)) return b.apply(U, q);
              var J = rt(b.prototype), ue = b.apply(J, q);
              return A(ue) ? ue : J;
            }
            var ft = I(function(b, S) {
              var U = ft.placeholder, H = function() {
                for (var q = 0, J = S.length, ue = Array(J), ve = 0; ve < J; ve++)
                  ue[ve] = S[ve] === U ? arguments[q++] : S[ve];
                for (; q < arguments.length; ) ue.push(arguments[q++]);
                return jt(b, H, this, this, ue);
              };
              return H;
            });
            ft.placeholder = me;
            var Ht = I(function(b, S, U) {
              if (!j(b)) throw new TypeError("Bind must be called on a function");
              var H = I(function(q) {
                return jt(b, H, S, this, U.concat(q));
              });
              return H;
            }), Ge = $(C);
            function lt(b, S, U, H) {
              if (H = H || [], !S && S !== 0)
                S = 1 / 0;
              else if (S <= 0)
                return H.concat(b);
              for (var q = H.length, J = 0, ue = C(b); J < ue; J++) {
                var ve = b[J];
                if (Ge(ve) && (be(ve) || De(ve)))
                  if (S > 1)
                    lt(ve, S - 1, U, H), q = H.length;
                  else
                    for (var Oe = 0, Ne = ve.length; Oe < Ne; ) H[q++] = ve[Oe++];
                else U || (H[q++] = ve);
              }
              return H;
            }
            var Nr = I(function(b, S) {
              S = lt(S, !1, !1);
              var U = S.length;
              if (U < 1) throw new Error("bindAll must be passed function names");
              for (; U--; ) {
                var H = S[U];
                b[H] = Ht(b[H], b);
              }
              return b;
            });
            function Ar(b, S) {
              var U = function(H) {
                var q = U.cache, J = "" + (S ? S.apply(this, arguments) : H);
                return Te(q, J) || (q[J] = b.apply(this, arguments)), q[J];
              };
              return U.cache = {}, U;
            }
            var Vt = I(function(b, S, U) {
              return setTimeout(function() {
                return b.apply(null, U);
              }, S);
            }), Or = ft(Vt, me, 1);
            function Cr(b, S, U) {
              var H, q, J, ue, ve = 0;
              U || (U = {});
              var Oe = function() {
                ve = U.leading === !1 ? 0 : yt(), H = null, ue = b.apply(q, J), H || (q = J = null);
              }, Ne = function() {
                var je = yt();
                !ve && U.leading === !1 && (ve = je);
                var Ze = S - (je - ve);
                return q = this, J = arguments, Ze <= 0 || Ze > S ? (H && (clearTimeout(H), H = null), ve = je, ue = b.apply(q, J), H || (q = J = null)) : !H && U.trailing !== !1 && (H = setTimeout(Oe, Ze)), ue;
              };
              return Ne.cancel = function() {
                clearTimeout(H), ve = 0, H = q = J = null;
              }, Ne;
            }
            function Rr(b, S, U) {
              var H, q, J, ue, ve, Oe = function() {
                var je = yt() - q;
                S > je ? H = setTimeout(Oe, S - je) : (H = null, U || (ue = b.apply(ve, J)), H || (J = ve = null));
              }, Ne = I(function(je) {
                return ve = this, J = je, q = yt(), H || (H = setTimeout(Oe, S), U && (ue = b.apply(ve, J))), ue;
              });
              return Ne.cancel = function() {
                clearTimeout(H), H = J = ve = null;
              }, Ne;
            }
            function Mr(b, S) {
              return ft(S, b);
            }
            function kt(b) {
              return function() {
                return !b.apply(this, arguments);
              };
            }
            function Lr() {
              var b = arguments, S = b.length - 1;
              return function() {
                for (var U = S, H = b[S].apply(this, arguments); U--; ) H = b[U].call(this, H);
                return H;
              };
            }
            function Pr(b, S) {
              return function() {
                if (--b < 1)
                  return S.apply(this, arguments);
              };
            }
            function Zt(b, S) {
              var U;
              return function() {
                return --b > 0 && (U = S.apply(this, arguments)), b <= 1 && (S = null), U;
              };
            }
            var Fr = ft(Zt, 2);
            function Yt(b, S, U) {
              S = Ye(S, U);
              for (var H = ae(b), q, J = 0, ue = H.length; J < ue; J++)
                if (q = H[J], S(b[q], q, b)) return q;
            }
            function Gt(b) {
              return function(S, U, H) {
                U = Ye(U, H);
                for (var q = C(S), J = b > 0 ? 0 : q - 1; J >= 0 && J < q; J += b)
                  if (U(S[J], J, S)) return J;
                return -1;
              };
            }
            var St = Gt(1), Kt = Gt(-1);
            function $t(b, S, U, H) {
              U = Ye(U, H, 1);
              for (var q = U(S), J = 0, ue = C(b); J < ue; ) {
                var ve = Math.floor((J + ue) / 2);
                U(b[ve]) < q ? J = ve + 1 : ue = ve;
              }
              return J;
            }
            function Jt(b, S, U) {
              return function(H, q, J) {
                var ue = 0, ve = C(H);
                if (typeof J == "number")
                  b > 0 ? ue = J >= 0 ? J : Math.max(J + ve, ue) : ve = J >= 0 ? Math.min(J + 1, ve) : J + ve + 1;
                else if (U && J && ve)
                  return J = U(H, q), H[J] === q ? J : -1;
                if (q !== q)
                  return J = S(e.call(H, ue, ve), Be), J >= 0 ? J + ue : -1;
                for (J = b > 0 ? ue : ve - 1; J >= 0 && J < ve; J += b)
                  if (H[J] === q) return J;
                return -1;
              };
            }
            var Qt = Jt(1, St, $t), Br = Jt(-1, Kt);
            function Nt(b, S, U) {
              var H = Ge(b) ? St : Yt, q = H(b, S, U);
              if (q !== void 0 && q !== -1) return b[q];
            }
            function Xr(b, S) {
              return Nt(b, dt(S));
            }
            function at(b, S, U) {
              S = mt(S, U);
              var H, q;
              if (Ge(b))
                for (H = 0, q = b.length; H < q; H++)
                  S(b[H], H, b);
              else {
                var J = ae(b);
                for (H = 0, q = J.length; H < q; H++)
                  S(b[J[H]], J[H], b);
              }
              return b;
            }
            function ct(b, S, U) {
              S = Ye(S, U);
              for (var H = !Ge(b) && ae(b), q = (H || b).length, J = Array(q), ue = 0; ue < q; ue++) {
                var ve = H ? H[ue] : ue;
                J[ue] = S(b[ve], ve, b);
              }
              return J;
            }
            function qt(b) {
              var S = function(U, H, q, J) {
                var ue = !Ge(U) && ae(U), ve = (ue || U).length, Oe = b > 0 ? 0 : ve - 1;
                for (J || (q = U[ue ? ue[Oe] : Oe], Oe += b); Oe >= 0 && Oe < ve; Oe += b) {
                  var Ne = ue ? ue[Oe] : Oe;
                  q = H(q, U[Ne], Ne, U);
                }
                return q;
              };
              return function(U, H, q, J) {
                var ue = arguments.length >= 3;
                return S(U, mt(H, J, 4), q, ue);
              };
            }
            var At = qt(1), er = qt(-1);
            function ht(b, S, U) {
              var H = [];
              return S = Ye(S, U), at(b, function(q, J, ue) {
                S(q, J, ue) && H.push(q);
              }), H;
            }
            function zr(b, S, U) {
              return ht(b, kt(Ye(S)), U);
            }
            function tr(b, S, U) {
              S = Ye(S, U);
              for (var H = !Ge(b) && ae(b), q = (H || b).length, J = 0; J < q; J++) {
                var ue = H ? H[J] : J;
                if (!S(b[ue], ue, b)) return !1;
              }
              return !0;
            }
            function rr(b, S, U) {
              S = Ye(S, U);
              for (var H = !Ge(b) && ae(b), q = (H || b).length, J = 0; J < q; J++) {
                var ue = H ? H[J] : J;
                if (S(b[ue], ue, b)) return !0;
              }
              return !1;
            }
            function ot(b, S, U, H) {
              return Ge(b) || (b = Pe(b)), (typeof U != "number" || H) && (U = 0), Qt(b, S, U) >= 0;
            }
            var Ur = I(function(b, S, U) {
              var H, q;
              return j(S) ? q = S : (S = st(S), H = S.slice(0, -1), S = S[S.length - 1]), ct(b, function(J) {
                var ue = q;
                if (!ue) {
                  if (H && H.length && (J = bt(J, H)), J == null) return;
                  ue = J[S];
                }
                return ue == null ? ue : ue.apply(J, U);
              });
            });
            function Ot(b, S) {
              return ct(b, xt(S));
            }
            function Wr(b, S) {
              return ht(b, dt(S));
            }
            function nr(b, S, U) {
              var H = -1 / 0, q = -1 / 0, J, ue;
              if (S == null || typeof S == "number" && typeof b[0] != "object" && b != null) {
                b = Ge(b) ? b : Pe(b);
                for (var ve = 0, Oe = b.length; ve < Oe; ve++)
                  J = b[ve], J != null && J > H && (H = J);
              } else
                S = Ye(S, U), at(b, function(Ne, je, Ze) {
                  ue = S(Ne, je, Ze), (ue > q || ue === -1 / 0 && H === -1 / 0) && (H = Ne, q = ue);
                });
              return H;
            }
            function jr(b, S, U) {
              var H = 1 / 0, q = 1 / 0, J, ue;
              if (S == null || typeof S == "number" && typeof b[0] != "object" && b != null) {
                b = Ge(b) ? b : Pe(b);
                for (var ve = 0, Oe = b.length; ve < Oe; ve++)
                  J = b[ve], J != null && J < H && (H = J);
              } else
                S = Ye(S, U), at(b, function(Ne, je, Ze) {
                  ue = S(Ne, je, Ze), (ue < q || ue === 1 / 0 && H === 1 / 0) && (H = Ne, q = ue);
                });
              return H;
            }
            function ir(b, S, U) {
              if (S == null || U)
                return Ge(b) || (b = Pe(b)), b[It(b.length - 1)];
              var H = Ge(b) ? We(b) : Pe(b), q = C(H);
              S = Math.max(Math.min(S, q), 0);
              for (var J = q - 1, ue = 0; ue < S; ue++) {
                var ve = It(ue, J), Oe = H[ue];
                H[ue] = H[ve], H[ve] = Oe;
              }
              return H.slice(0, S);
            }
            function Hr(b) {
              return ir(b, 1 / 0);
            }
            function Vr(b, S, U) {
              var H = 0;
              return S = Ye(S, U), Ot(ct(b, function(q, J, ue) {
                return {
                  value: q,
                  index: H++,
                  criteria: S(q, J, ue)
                };
              }).sort(function(q, J) {
                var ue = q.criteria, ve = J.criteria;
                if (ue !== ve) {
                  if (ue > ve || ue === void 0) return 1;
                  if (ue < ve || ve === void 0) return -1;
                }
                return q.index - J.index;
              }), "value");
            }
            function gt(b, S) {
              return function(U, H, q) {
                var J = S ? [[], []] : {};
                return H = Ye(H, q), at(U, function(ue, ve) {
                  var Oe = H(ue, ve, U);
                  b(J, ue, Oe);
                }), J;
              };
            }
            var Zr = gt(function(b, S, U) {
              Te(b, U) ? b[U].push(S) : b[U] = [S];
            }), Yr = gt(function(b, S, U) {
              b[U] = S;
            }), Gr = gt(function(b, S, U) {
              Te(b, U) ? b[U]++ : b[U] = 1;
            }), Kr = gt(function(b, S, U) {
              b[U ? 0 : 1].push(S);
            }, !0), $r = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
            function Jr(b) {
              return b ? be(b) ? e.call(b) : F(b) ? b.match($r) : Ge(b) ? ct(b, Et) : Pe(b) : [];
            }
            function Qr(b) {
              return b == null ? 0 : Ge(b) ? b.length : ae(b).length;
            }
            function qr(b, S, U) {
              return S in U;
            }
            var ar = I(function(b, S) {
              var U = {}, H = S[0];
              if (b == null) return U;
              j(H) ? (S.length > 1 && (H = mt(H, S[1])), S = fe(b)) : (H = qr, S = lt(S, !1, !1), b = Object(b));
              for (var q = 0, J = S.length; q < J; q++) {
                var ue = S[q], ve = b[ue];
                H(ve, ue, b) && (U[ue] = ve);
              }
              return U;
            }), en = I(function(b, S) {
              var U = S[0], H;
              return j(U) ? (U = kt(U), S.length > 1 && (H = S[1])) : (S = ct(lt(S, !1, !1), String), U = function(q, J) {
                return !ot(S, J);
              }), ar(b, U, H);
            });
            function or(b, S, U) {
              return e.call(b, 0, Math.max(0, b.length - (S == null || U ? 1 : S)));
            }
            function Ct(b, S, U) {
              return b == null || b.length < 1 ? S == null || U ? void 0 : [] : S == null || U ? b[0] : or(b, b.length - S);
            }
            function wt(b, S, U) {
              return e.call(b, S == null || U ? 1 : S);
            }
            function tn(b, S, U) {
              return b == null || b.length < 1 ? S == null || U ? void 0 : [] : S == null || U ? b[b.length - 1] : wt(b, Math.max(0, b.length - S));
            }
            function rn(b) {
              return ht(b, Boolean);
            }
            function nn(b, S) {
              return lt(b, S, !1);
            }
            var sr = I(function(b, S) {
              return S = lt(S, !0, !0), ht(b, function(U) {
                return !ot(S, U);
              });
            }), an = I(function(b, S) {
              return sr(b, S);
            });
            function Rt(b, S, U, H) {
              k(S) || (H = U, U = S, S = !1), U != null && (U = Ye(U, H));
              for (var q = [], J = [], ue = 0, ve = C(b); ue < ve; ue++) {
                var Oe = b[ue], Ne = U ? U(Oe, ue, b) : Oe;
                S && !U ? ((!ue || J !== Ne) && q.push(Oe), J = Ne) : U ? ot(J, Ne) || (J.push(Ne), q.push(Oe)) : ot(q, Oe) || q.push(Oe);
              }
              return q;
            }
            var on = I(function(b) {
              return Rt(lt(b, !0, !0));
            });
            function sn(b) {
              for (var S = [], U = arguments.length, H = 0, q = C(b); H < q; H++) {
                var J = b[H];
                if (!ot(S, J)) {
                  var ue;
                  for (ue = 1; ue < U && ot(arguments[ue], J); ue++)
                    ;
                  ue === U && S.push(J);
                }
              }
              return S;
            }
            function Mt(b) {
              for (var S = b && nr(b, C).length || 0, U = Array(S), H = 0; H < S; H++)
                U[H] = Ot(b, H);
              return U;
            }
            var un = I(Mt);
            function ln(b, S) {
              for (var U = {}, H = 0, q = C(b); H < q; H++)
                S ? U[b[H]] = S[H] : U[b[H][0]] = b[H][1];
              return U;
            }
            function cn(b, S, U) {
              S == null && (S = b || 0, b = 0), U || (U = S < b ? -1 : 1);
              for (var H = Math.max(Math.ceil((S - b) / U), 0), q = Array(H), J = 0; J < H; J++, b += U)
                q[J] = b;
              return q;
            }
            function fn(b, S) {
              if (S == null || S < 1) return [];
              for (var U = [], H = 0, q = b.length; H < q; )
                U.push(e.call(b, H, H += S));
              return U;
            }
            function Lt(b, S) {
              return b._chain ? me(S).chain() : S;
            }
            function ur(b) {
              return at(Je(b), function(S) {
                var U = me[S] = b[S];
                me.prototype[S] = function() {
                  var H = [this._wrapped];
                  return i.apply(H, arguments), Lt(this, U.apply(me, H));
                };
              }), me;
            }
            at(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(b) {
              var S = g[b];
              me.prototype[b] = function() {
                var U = this._wrapped;
                return U != null && (S.apply(U, arguments), (b === "shift" || b === "splice") && U.length === 0 && delete U[0]), Lt(this, U);
              };
            }), at(["concat", "join", "slice"], function(b) {
              var S = g[b];
              me.prototype[b] = function() {
                var U = this._wrapped;
                return U != null && (U = S.apply(U, arguments)), Lt(this, U);
              };
            });
            var hn = {
              __proto__: null,
              VERSION: E,
              restArguments: I,
              isObject: A,
              isNull: O,
              isUndefined: B,
              isBoolean: k,
              isElement: W,
              isString: F,
              isNumber: Y,
              isDate: x,
              isRegExp: K,
              isError: pe,
              isSymbol: ne,
              isArrayBuffer: ce,
              isDataView: Ce,
              isArray: be,
              isFunction: j,
              isArguments: De,
              isFinite: Le,
              isNaN: Be,
              isTypedArray: D,
              isEmpty: de,
              isMatch: xe,
              isEqual: re,
              isMap: Z,
              isWeakMap: oe,
              isSet: ge,
              isWeakSet: ke,
              keys: ae,
              allKeys: fe,
              values: Pe,
              pairs: Ve,
              invert: $e,
              functions: Je,
              methods: Je,
              extend: et,
              extendOwn: Qe,
              assign: Qe,
              defaults: tt,
              create: ut,
              clone: We,
              tap: vt,
              get: Bt,
              has: hr,
              mapObject: pr,
              identity: Et,
              constant: f,
              noop: zt,
              toPath: it,
              property: xt,
              propertyOf: dr,
              matcher: dt,
              matches: dt,
              times: mr,
              random: It,
              now: yt,
              escape: yr,
              unescape: gr,
              templateSettings: wr,
              template: Tr,
              result: Ir,
              uniqueId: kr,
              chain: Sr,
              iteratee: Tt,
              partial: ft,
              bind: Ht,
              bindAll: Nr,
              memoize: Ar,
              delay: Vt,
              defer: Or,
              throttle: Cr,
              debounce: Rr,
              wrap: Mr,
              negate: kt,
              compose: Lr,
              after: Pr,
              before: Zt,
              once: Fr,
              findKey: Yt,
              findIndex: St,
              findLastIndex: Kt,
              sortedIndex: $t,
              indexOf: Qt,
              lastIndexOf: Br,
              find: Nt,
              detect: Nt,
              findWhere: Xr,
              each: at,
              forEach: at,
              map: ct,
              collect: ct,
              reduce: At,
              foldl: At,
              inject: At,
              reduceRight: er,
              foldr: er,
              filter: ht,
              select: ht,
              reject: zr,
              every: tr,
              all: tr,
              some: rr,
              any: rr,
              contains: ot,
              includes: ot,
              include: ot,
              invoke: Ur,
              pluck: Ot,
              where: Wr,
              max: nr,
              min: jr,
              shuffle: Hr,
              sample: ir,
              sortBy: Vr,
              groupBy: Zr,
              indexBy: Yr,
              countBy: Gr,
              partition: Kr,
              toArray: Jr,
              size: Qr,
              pick: ar,
              omit: en,
              first: Ct,
              head: Ct,
              take: Ct,
              initial: or,
              last: tn,
              rest: wt,
              tail: wt,
              drop: wt,
              compact: rn,
              flatten: nn,
              without: an,
              uniq: Rt,
              unique: Rt,
              union: on,
              intersection: sn,
              difference: sr,
              unzip: Mt,
              transpose: Mt,
              zip: un,
              object: ln,
              range: cn,
              chunk: fn,
              mixin: ur,
              default: me
            }, Pt = ur(hn);
            return Pt._ = Pt, Pt;
          }));
        }).call(this, typeof pt < "u" ? pt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 68: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i, e = [].slice, s = {}.hasOwnProperty;
          M = function() {
            var d, v, w, y, h, _;
            if (_ = arguments[0], h = 2 <= arguments.length ? e.call(arguments, 1) : [], p(Object.assign))
              Object.assign.apply(null, arguments);
            else
              for (d = 0, w = h.length; d < w; d++)
                if (y = h[d], y != null)
                  for (v in y)
                    s.call(y, v) && (_[v] = y[v]);
            return _;
          }, p = function(d) {
            return !!d && Object.prototype.toString.call(d) === "[object Function]";
          }, u = function(d) {
            var v;
            return !!d && ((v = typeof d) == "function" || v === "object");
          }, a = function(d) {
            return p(Array.isArray) ? Array.isArray(d) : Object.prototype.toString.call(d) === "[object Array]";
          }, g = function(d) {
            var v;
            if (a(d))
              return !d.length;
            for (v in d)
              if (s.call(d, v))
                return !1;
            return !0;
          }, i = function(d) {
            var v, w;
            return u(d) && (w = Object.getPrototypeOf(d)) && (v = w.constructor) && typeof v == "function" && v instanceof v && Function.prototype.toString.call(v) === Function.prototype.toString.call(Object);
          }, E = function(d) {
            return p(d.valueOf) ? d.valueOf() : d;
          }, se.exports.assign = M, se.exports.isFunction = p, se.exports.isObject = u, se.exports.isArray = a, se.exports.isEmpty = g, se.exports.isPlainObject = i, se.exports.getValue = E;
        }).call(this);
      }, {}], 69: [function(P, se, R) {
        (function() {
          se.exports = (function() {
            function M(E, a, g) {
              if (this.options = E.options, this.stringify = E.stringify, this.parent = E, a == null)
                throw new Error("Missing attribute name. " + this.debugInfo(a));
              if (g == null)
                throw new Error("Missing attribute value. " + this.debugInfo(a));
              this.name = this.stringify.attName(a), this.value = this.stringify.attValue(g);
            }
            return M.prototype.clone = function() {
              return Object.create(this);
            }, M.prototype.toString = function(E) {
              return this.options.writer.set(E).attribute(this);
            }, M.prototype.debugInfo = function(E) {
              var a, g;
              return E = E || this.name, E == null && !((a = this.parent) != null && a.name) ? "" : E == null ? "parent: <" + this.parent.name + ">" : (g = this.parent) != null && g.name ? "attribute: {" + E + "}, parent: <" + this.parent.name + ">" : "attribute: {" + E + "}";
            }, M;
          })();
        }).call(this);
      }, {}], 70: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing CDATA text. " + this.debugInfo());
              this.text = this.stringify.cdata(i);
            }
            return p.prototype.clone = function() {
              return Object.create(this);
            }, p.prototype.toString = function(u) {
              return this.options.writer.set(u).cdata(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 71: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing comment text. " + this.debugInfo());
              this.text = this.stringify.comment(i);
            }
            return p.prototype.clone = function() {
              return Object.create(this);
            }, p.prototype.toString = function(u) {
              return this.options.writer.set(u).comment(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 72: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i, e, s, d, v) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing DTD element name. " + this.debugInfo());
              if (e == null)
                throw new Error("Missing DTD attribute name. " + this.debugInfo(i));
              if (!s)
                throw new Error("Missing DTD attribute type. " + this.debugInfo(i));
              if (!d)
                throw new Error("Missing DTD attribute default. " + this.debugInfo(i));
              if (d.indexOf("#") !== 0 && (d = "#" + d), !d.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/))
                throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(i));
              if (v && !d.match(/^(#FIXED|#DEFAULT)$/))
                throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(i));
              this.elementName = this.stringify.eleName(i), this.attributeName = this.stringify.attName(e), this.attributeType = this.stringify.dtdAttType(s), this.defaultValue = this.stringify.dtdAttDefault(v), this.defaultValueType = d;
            }
            return p.prototype.toString = function(u) {
              return this.options.writer.set(u).dtdAttList(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 73: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i, e) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing DTD element name. " + this.debugInfo());
              e || (e = "(#PCDATA)"), Array.isArray(e) && (e = "(" + e.join(",") + ")"), this.name = this.stringify.eleName(i), this.value = this.stringify.dtdElementValue(e);
            }
            return p.prototype.toString = function(u) {
              return this.options.writer.set(u).dtdElement(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 74: [function(P, se, R) {
        (function() {
          var M, E, a = function(p, u) {
            for (var i in u)
              g.call(u, i) && (p[i] = u[i]);
            function e() {
              this.constructor = p;
            }
            return e.prototype = u.prototype, p.prototype = new e(), p.__super__ = u.prototype, p;
          }, g = {}.hasOwnProperty;
          E = P("./Utility").isObject, M = P("./XMLNode"), se.exports = (function(p) {
            a(u, p);
            function u(i, e, s, d) {
              if (u.__super__.constructor.call(this, i), s == null)
                throw new Error("Missing DTD entity name. " + this.debugInfo(s));
              if (d == null)
                throw new Error("Missing DTD entity value. " + this.debugInfo(s));
              if (this.pe = !!e, this.name = this.stringify.eleName(s), !E(d))
                this.value = this.stringify.dtdEntityValue(d);
              else {
                if (!d.pubID && !d.sysID)
                  throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(s));
                if (d.pubID && !d.sysID)
                  throw new Error("System identifier is required for a public external entity. " + this.debugInfo(s));
                if (d.pubID != null && (this.pubID = this.stringify.dtdPubID(d.pubID)), d.sysID != null && (this.sysID = this.stringify.dtdSysID(d.sysID)), d.nData != null && (this.nData = this.stringify.dtdNData(d.nData)), this.pe && this.nData)
                  throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(s));
              }
            }
            return u.prototype.toString = function(i) {
              return this.options.writer.set(i).dtdEntity(this);
            }, u;
          })(M);
        }).call(this);
      }, { "./Utility": 68, "./XMLNode": 81 }], 75: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i, e) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing DTD notation name. " + this.debugInfo(i));
              if (!e.pubID && !e.sysID)
                throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(i));
              this.name = this.stringify.eleName(i), e.pubID != null && (this.pubID = this.stringify.dtdPubID(e.pubID)), e.sysID != null && (this.sysID = this.stringify.dtdSysID(e.sysID));
            }
            return p.prototype.toString = function(u) {
              return this.options.writer.set(u).dtdNotation(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 76: [function(P, se, R) {
        (function() {
          var M, E, a = function(p, u) {
            for (var i in u)
              g.call(u, i) && (p[i] = u[i]);
            function e() {
              this.constructor = p;
            }
            return e.prototype = u.prototype, p.prototype = new e(), p.__super__ = u.prototype, p;
          }, g = {}.hasOwnProperty;
          E = P("./Utility").isObject, M = P("./XMLNode"), se.exports = (function(p) {
            a(u, p);
            function u(i, e, s, d) {
              var v;
              u.__super__.constructor.call(this, i), E(e) && (v = e, e = v.version, s = v.encoding, d = v.standalone), e || (e = "1.0"), this.version = this.stringify.xmlVersion(e), s != null && (this.encoding = this.stringify.xmlEncoding(s)), d != null && (this.standalone = this.stringify.xmlStandalone(d));
            }
            return u.prototype.toString = function(i) {
              return this.options.writer.set(i).declaration(this);
            }, u;
          })(M);
        }).call(this);
      }, { "./Utility": 68, "./XMLNode": 81 }], 77: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i = function(s, d) {
            for (var v in d)
              e.call(d, v) && (s[v] = d[v]);
            function w() {
              this.constructor = s;
            }
            return w.prototype = d.prototype, s.prototype = new w(), s.__super__ = d.prototype, s;
          }, e = {}.hasOwnProperty;
          u = P("./Utility").isObject, p = P("./XMLNode"), M = P("./XMLDTDAttList"), a = P("./XMLDTDEntity"), E = P("./XMLDTDElement"), g = P("./XMLDTDNotation"), se.exports = (function(s) {
            i(d, s);
            function d(v, w, y) {
              var h, _;
              d.__super__.constructor.call(this, v), this.name = "!DOCTYPE", this.documentObject = v, u(w) && (h = w, w = h.pubID, y = h.sysID), y == null && (_ = [w, y], y = _[0], w = _[1]), w != null && (this.pubID = this.stringify.dtdPubID(w)), y != null && (this.sysID = this.stringify.dtdSysID(y));
            }
            return d.prototype.element = function(v, w) {
              var y;
              return y = new E(this, v, w), this.children.push(y), this;
            }, d.prototype.attList = function(v, w, y, h, _) {
              var c;
              return c = new M(this, v, w, y, h, _), this.children.push(c), this;
            }, d.prototype.entity = function(v, w) {
              var y;
              return y = new a(this, !1, v, w), this.children.push(y), this;
            }, d.prototype.pEntity = function(v, w) {
              var y;
              return y = new a(this, !0, v, w), this.children.push(y), this;
            }, d.prototype.notation = function(v, w) {
              var y;
              return y = new g(this, v, w), this.children.push(y), this;
            }, d.prototype.toString = function(v) {
              return this.options.writer.set(v).docType(this);
            }, d.prototype.ele = function(v, w) {
              return this.element(v, w);
            }, d.prototype.att = function(v, w, y, h, _) {
              return this.attList(v, w, y, h, _);
            }, d.prototype.ent = function(v, w) {
              return this.entity(v, w);
            }, d.prototype.pent = function(v, w) {
              return this.pEntity(v, w);
            }, d.prototype.not = function(v, w) {
              return this.notation(v, w);
            }, d.prototype.up = function() {
              return this.root() || this.documentObject;
            }, d;
          })(p);
        }).call(this);
      }, { "./Utility": 68, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLNode": 81 }], 78: [function(P, se, R) {
        (function() {
          var M, E, a, g, p = function(i, e) {
            for (var s in e)
              u.call(e, s) && (i[s] = e[s]);
            function d() {
              this.constructor = i;
            }
            return d.prototype = e.prototype, i.prototype = new d(), i.__super__ = e.prototype, i;
          }, u = {}.hasOwnProperty;
          g = P("./Utility").isPlainObject, M = P("./XMLNode"), a = P("./XMLStringifier"), E = P("./XMLStringWriter"), se.exports = (function(i) {
            p(e, i);
            function e(s) {
              e.__super__.constructor.call(this, null), this.name = "?xml", s || (s = {}), s.writer || (s.writer = new E()), this.options = s, this.stringify = new a(s), this.isDocument = !0;
            }
            return e.prototype.end = function(s) {
              var d;
              return s ? g(s) && (d = s, s = this.options.writer.set(d)) : s = this.options.writer, s.document(this);
            }, e.prototype.toString = function(s) {
              return this.options.writer.set(s).document(this);
            }, e;
          })(M);
        }).call(this);
      }, { "./Utility": 68, "./XMLNode": 81, "./XMLStringWriter": 85, "./XMLStringifier": 86 }], 79: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i, e, s, d, v, w, y, h, _, c, n, r, m, T, z = {}.hasOwnProperty;
          T = P("./Utility"), r = T.isObject, n = T.isFunction, m = T.isPlainObject, c = T.getValue, d = P("./XMLElement"), E = P("./XMLCData"), a = P("./XMLComment"), w = P("./XMLRaw"), _ = P("./XMLText"), v = P("./XMLProcessingInstruction"), e = P("./XMLDeclaration"), s = P("./XMLDocType"), g = P("./XMLDTDAttList"), u = P("./XMLDTDEntity"), p = P("./XMLDTDElement"), i = P("./XMLDTDNotation"), M = P("./XMLAttribute"), h = P("./XMLStringifier"), y = P("./XMLStringWriter"), se.exports = (function() {
            function I(A, O, B) {
              var k;
              this.name = "?xml", A || (A = {}), A.writer ? m(A.writer) && (k = A.writer, A.writer = new y(k)) : A.writer = new y(A), this.options = A, this.writer = A.writer, this.stringify = new h(A), this.onDataCallback = O || function() {
              }, this.onEndCallback = B || function() {
              }, this.currentNode = null, this.currentLevel = -1, this.openTags = {}, this.documentStarted = !1, this.documentCompleted = !1, this.root = null;
            }
            return I.prototype.node = function(A, O, B) {
              var k;
              if (A == null)
                throw new Error("Missing node name.");
              if (this.root && this.currentLevel === -1)
                throw new Error("Document can only have one root node. " + this.debugInfo(A));
              return this.openCurrent(), A = c(A), O == null && (O = {}), O = c(O), r(O) || (k = [O, B], B = k[0], O = k[1]), this.currentNode = new d(this, A, O), this.currentNode.children = !1, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, B != null && this.text(B), this;
            }, I.prototype.element = function(A, O, B) {
              return this.currentNode && this.currentNode instanceof s ? this.dtdElement.apply(this, arguments) : this.node(A, O, B);
            }, I.prototype.attribute = function(A, O) {
              var B, k;
              if (!this.currentNode || this.currentNode.children)
                throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(A));
              if (A != null && (A = c(A)), r(A))
                for (B in A)
                  z.call(A, B) && (k = A[B], this.attribute(B, k));
              else
                n(O) && (O = O.apply()), (!this.options.skipNullAttributes || O != null) && (this.currentNode.attributes[A] = new M(this, A, O));
              return this;
            }, I.prototype.text = function(A) {
              var O;
              return this.openCurrent(), O = new _(this, A), this.onData(this.writer.text(O, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.cdata = function(A) {
              var O;
              return this.openCurrent(), O = new E(this, A), this.onData(this.writer.cdata(O, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.comment = function(A) {
              var O;
              return this.openCurrent(), O = new a(this, A), this.onData(this.writer.comment(O, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.raw = function(A) {
              var O;
              return this.openCurrent(), O = new w(this, A), this.onData(this.writer.raw(O, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.instruction = function(A, O) {
              var B, k, W, ee, F;
              if (this.openCurrent(), A != null && (A = c(A)), O != null && (O = c(O)), Array.isArray(A))
                for (B = 0, ee = A.length; B < ee; B++)
                  k = A[B], this.instruction(k);
              else if (r(A))
                for (k in A)
                  z.call(A, k) && (W = A[k], this.instruction(k, W));
              else
                n(O) && (O = O.apply()), F = new v(this, A, O), this.onData(this.writer.processingInstruction(F, this.currentLevel + 1), this.currentLevel + 1);
              return this;
            }, I.prototype.declaration = function(A, O, B) {
              var k;
              if (this.openCurrent(), this.documentStarted)
                throw new Error("declaration() must be the first node.");
              return k = new e(this, A, O, B), this.onData(this.writer.declaration(k, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.doctype = function(A, O, B) {
              if (this.openCurrent(), A == null)
                throw new Error("Missing root node name.");
              if (this.root)
                throw new Error("dtd() must come before the root node.");
              return this.currentNode = new s(this, O, B), this.currentNode.rootNodeName = A, this.currentNode.children = !1, this.currentLevel++, this.openTags[this.currentLevel] = this.currentNode, this;
            }, I.prototype.dtdElement = function(A, O) {
              var B;
              return this.openCurrent(), B = new p(this, A, O), this.onData(this.writer.dtdElement(B, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.attList = function(A, O, B, k, W) {
              var ee;
              return this.openCurrent(), ee = new g(this, A, O, B, k, W), this.onData(this.writer.dtdAttList(ee, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.entity = function(A, O) {
              var B;
              return this.openCurrent(), B = new u(this, !1, A, O), this.onData(this.writer.dtdEntity(B, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.pEntity = function(A, O) {
              var B;
              return this.openCurrent(), B = new u(this, !0, A, O), this.onData(this.writer.dtdEntity(B, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.notation = function(A, O) {
              var B;
              return this.openCurrent(), B = new i(this, A, O), this.onData(this.writer.dtdNotation(B, this.currentLevel + 1), this.currentLevel + 1), this;
            }, I.prototype.up = function() {
              if (this.currentLevel < 0)
                throw new Error("The document node has no parent.");
              return this.currentNode ? (this.currentNode.children ? this.closeNode(this.currentNode) : this.openNode(this.currentNode), this.currentNode = null) : this.closeNode(this.openTags[this.currentLevel]), delete this.openTags[this.currentLevel], this.currentLevel--, this;
            }, I.prototype.end = function() {
              for (; this.currentLevel >= 0; )
                this.up();
              return this.onEnd();
            }, I.prototype.openCurrent = function() {
              if (this.currentNode)
                return this.currentNode.children = !0, this.openNode(this.currentNode);
            }, I.prototype.openNode = function(A) {
              if (!A.isOpen)
                return !this.root && this.currentLevel === 0 && A instanceof d && (this.root = A), this.onData(this.writer.openNode(A, this.currentLevel), this.currentLevel), A.isOpen = !0;
            }, I.prototype.closeNode = function(A) {
              if (!A.isClosed)
                return this.onData(this.writer.closeNode(A, this.currentLevel), this.currentLevel), A.isClosed = !0;
            }, I.prototype.onData = function(A, O) {
              return this.documentStarted = !0, this.onDataCallback(A, O + 1);
            }, I.prototype.onEnd = function() {
              return this.documentCompleted = !0, this.onEndCallback();
            }, I.prototype.debugInfo = function(A) {
              return A == null ? "" : "node: <" + A + ">";
            }, I.prototype.ele = function() {
              return this.element.apply(this, arguments);
            }, I.prototype.nod = function(A, O, B) {
              return this.node(A, O, B);
            }, I.prototype.txt = function(A) {
              return this.text(A);
            }, I.prototype.dat = function(A) {
              return this.cdata(A);
            }, I.prototype.com = function(A) {
              return this.comment(A);
            }, I.prototype.ins = function(A, O) {
              return this.instruction(A, O);
            }, I.prototype.dec = function(A, O, B) {
              return this.declaration(A, O, B);
            }, I.prototype.dtd = function(A, O, B) {
              return this.doctype(A, O, B);
            }, I.prototype.e = function(A, O, B) {
              return this.element(A, O, B);
            }, I.prototype.n = function(A, O, B) {
              return this.node(A, O, B);
            }, I.prototype.t = function(A) {
              return this.text(A);
            }, I.prototype.d = function(A) {
              return this.cdata(A);
            }, I.prototype.c = function(A) {
              return this.comment(A);
            }, I.prototype.r = function(A) {
              return this.raw(A);
            }, I.prototype.i = function(A, O) {
              return this.instruction(A, O);
            }, I.prototype.att = function() {
              return this.currentNode && this.currentNode instanceof s ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
            }, I.prototype.a = function() {
              return this.currentNode && this.currentNode instanceof s ? this.attList.apply(this, arguments) : this.attribute.apply(this, arguments);
            }, I.prototype.ent = function(A, O) {
              return this.entity(A, O);
            }, I.prototype.pent = function(A, O) {
              return this.pEntity(A, O);
            }, I.prototype.not = function(A, O) {
              return this.notation(A, O);
            }, I;
          })();
        }).call(this);
      }, { "./Utility": 68, "./XMLAttribute": 69, "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLStringWriter": 85, "./XMLStringifier": 86, "./XMLText": 87 }], 80: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i = function(s, d) {
            for (var v in d)
              e.call(d, v) && (s[v] = d[v]);
            function w() {
              this.constructor = s;
            }
            return w.prototype = d.prototype, s.prototype = new w(), s.__super__ = d.prototype, s;
          }, e = {}.hasOwnProperty;
          u = P("./Utility"), p = u.isObject, g = u.isFunction, a = u.getValue, E = P("./XMLNode"), M = P("./XMLAttribute"), se.exports = (function(s) {
            i(d, s);
            function d(v, w, y) {
              if (d.__super__.constructor.call(this, v), w == null)
                throw new Error("Missing element name. " + this.debugInfo());
              this.name = this.stringify.eleName(w), this.attributes = {}, y != null && this.attribute(y), v.isDocument && (this.isRoot = !0, this.documentObject = v, v.rootObject = this);
            }
            return d.prototype.clone = function() {
              var v, w, y, h;
              y = Object.create(this), y.isRoot && (y.documentObject = null), y.attributes = {}, h = this.attributes;
              for (w in h)
                e.call(h, w) && (v = h[w], y.attributes[w] = v.clone());
              return y.children = [], this.children.forEach(function(_) {
                var c;
                return c = _.clone(), c.parent = y, y.children.push(c);
              }), y;
            }, d.prototype.attribute = function(v, w) {
              var y, h;
              if (v != null && (v = a(v)), p(v))
                for (y in v)
                  e.call(v, y) && (h = v[y], this.attribute(y, h));
              else
                g(w) && (w = w.apply()), (!this.options.skipNullAttributes || w != null) && (this.attributes[v] = new M(this, v, w));
              return this;
            }, d.prototype.removeAttribute = function(v) {
              var w, y, h;
              if (v == null)
                throw new Error("Missing attribute name. " + this.debugInfo());
              if (v = a(v), Array.isArray(v))
                for (y = 0, h = v.length; y < h; y++)
                  w = v[y], delete this.attributes[w];
              else
                delete this.attributes[v];
              return this;
            }, d.prototype.toString = function(v) {
              return this.options.writer.set(v).element(this);
            }, d.prototype.att = function(v, w) {
              return this.attribute(v, w);
            }, d.prototype.a = function(v, w) {
              return this.attribute(v, w);
            }, d;
          })(E);
        }).call(this);
      }, { "./Utility": 68, "./XMLAttribute": 69, "./XMLNode": 81 }], 81: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i, e, s, d, v, w, y, h = {}.hasOwnProperty;
          y = P("./Utility"), w = y.isObject, v = y.isFunction, d = y.isEmpty, s = y.getValue, p = null, M = null, E = null, a = null, g = null, i = null, e = null, u = null, se.exports = (function() {
            function _(c) {
              this.parent = c, this.parent && (this.options = this.parent.options, this.stringify = this.parent.stringify), this.children = [], p || (p = P("./XMLElement"), M = P("./XMLCData"), E = P("./XMLComment"), a = P("./XMLDeclaration"), g = P("./XMLDocType"), i = P("./XMLRaw"), e = P("./XMLText"), u = P("./XMLProcessingInstruction"));
            }
            return _.prototype.element = function(c, n, r) {
              var m, T, z, I, A, O, B, k, W, ee;
              if (O = null, n == null && (n = {}), n = s(n), w(n) || (W = [n, r], r = W[0], n = W[1]), c != null && (c = s(c)), Array.isArray(c))
                for (z = 0, B = c.length; z < B; z++)
                  T = c[z], O = this.element(T);
              else if (v(c))
                O = this.element(c.apply());
              else if (w(c)) {
                for (A in c)
                  if (h.call(c, A))
                    if (ee = c[A], v(ee) && (ee = ee.apply()), w(ee) && d(ee) && (ee = null), !this.options.ignoreDecorators && this.stringify.convertAttKey && A.indexOf(this.stringify.convertAttKey) === 0)
                      O = this.attribute(A.substr(this.stringify.convertAttKey.length), ee);
                    else if (!this.options.separateArrayItems && Array.isArray(ee))
                      for (I = 0, k = ee.length; I < k; I++)
                        T = ee[I], m = {}, m[A] = T, O = this.element(m);
                    else w(ee) ? (O = this.element(A), O.element(ee)) : O = this.element(A, ee);
              } else
                !this.options.ignoreDecorators && this.stringify.convertTextKey && c.indexOf(this.stringify.convertTextKey) === 0 ? O = this.text(r) : !this.options.ignoreDecorators && this.stringify.convertCDataKey && c.indexOf(this.stringify.convertCDataKey) === 0 ? O = this.cdata(r) : !this.options.ignoreDecorators && this.stringify.convertCommentKey && c.indexOf(this.stringify.convertCommentKey) === 0 ? O = this.comment(r) : !this.options.ignoreDecorators && this.stringify.convertRawKey && c.indexOf(this.stringify.convertRawKey) === 0 ? O = this.raw(r) : !this.options.ignoreDecorators && this.stringify.convertPIKey && c.indexOf(this.stringify.convertPIKey) === 0 ? O = this.instruction(c.substr(this.stringify.convertPIKey.length), r) : O = this.node(c, n, r);
              if (O == null)
                throw new Error("Could not create any elements with: " + c + ". " + this.debugInfo());
              return O;
            }, _.prototype.insertBefore = function(c, n, r) {
              var m, T, z;
              if (this.isRoot)
                throw new Error("Cannot insert elements at root level. " + this.debugInfo(c));
              return T = this.parent.children.indexOf(this), z = this.parent.children.splice(T), m = this.parent.element(c, n, r), Array.prototype.push.apply(this.parent.children, z), m;
            }, _.prototype.insertAfter = function(c, n, r) {
              var m, T, z;
              if (this.isRoot)
                throw new Error("Cannot insert elements at root level. " + this.debugInfo(c));
              return T = this.parent.children.indexOf(this), z = this.parent.children.splice(T + 1), m = this.parent.element(c, n, r), Array.prototype.push.apply(this.parent.children, z), m;
            }, _.prototype.remove = function() {
              var c;
              if (this.isRoot)
                throw new Error("Cannot remove the root element. " + this.debugInfo());
              return c = this.parent.children.indexOf(this), [].splice.apply(this.parent.children, [c, c - c + 1].concat([])), this.parent;
            }, _.prototype.node = function(c, n, r) {
              var m, T;
              return c != null && (c = s(c)), n || (n = {}), n = s(n), w(n) || (T = [n, r], r = T[0], n = T[1]), m = new p(this, c, n), r != null && m.text(r), this.children.push(m), m;
            }, _.prototype.text = function(c) {
              var n;
              return n = new e(this, c), this.children.push(n), this;
            }, _.prototype.cdata = function(c) {
              var n;
              return n = new M(this, c), this.children.push(n), this;
            }, _.prototype.comment = function(c) {
              var n;
              return n = new E(this, c), this.children.push(n), this;
            }, _.prototype.commentBefore = function(c) {
              var n, r;
              return n = this.parent.children.indexOf(this), r = this.parent.children.splice(n), this.parent.comment(c), Array.prototype.push.apply(this.parent.children, r), this;
            }, _.prototype.commentAfter = function(c) {
              var n, r;
              return n = this.parent.children.indexOf(this), r = this.parent.children.splice(n + 1), this.parent.comment(c), Array.prototype.push.apply(this.parent.children, r), this;
            }, _.prototype.raw = function(c) {
              var n;
              return n = new i(this, c), this.children.push(n), this;
            }, _.prototype.instruction = function(c, n) {
              var r, m, T, z, I;
              if (c != null && (c = s(c)), n != null && (n = s(n)), Array.isArray(c))
                for (z = 0, I = c.length; z < I; z++)
                  r = c[z], this.instruction(r);
              else if (w(c))
                for (r in c)
                  h.call(c, r) && (m = c[r], this.instruction(r, m));
              else
                v(n) && (n = n.apply()), T = new u(this, c, n), this.children.push(T);
              return this;
            }, _.prototype.instructionBefore = function(c, n) {
              var r, m;
              return r = this.parent.children.indexOf(this), m = this.parent.children.splice(r), this.parent.instruction(c, n), Array.prototype.push.apply(this.parent.children, m), this;
            }, _.prototype.instructionAfter = function(c, n) {
              var r, m;
              return r = this.parent.children.indexOf(this), m = this.parent.children.splice(r + 1), this.parent.instruction(c, n), Array.prototype.push.apply(this.parent.children, m), this;
            }, _.prototype.declaration = function(c, n, r) {
              var m, T;
              return m = this.document(), T = new a(m, c, n, r), m.children[0] instanceof a ? m.children[0] = T : m.children.unshift(T), m.root() || m;
            }, _.prototype.doctype = function(c, n) {
              var r, m, T, z, I, A, O, B, k, W;
              for (m = this.document(), T = new g(m, c, n), k = m.children, z = I = 0, O = k.length; I < O; z = ++I)
                if (r = k[z], r instanceof g)
                  return m.children[z] = T, T;
              for (W = m.children, z = A = 0, B = W.length; A < B; z = ++A)
                if (r = W[z], r.isRoot)
                  return m.children.splice(z, 0, T), T;
              return m.children.push(T), T;
            }, _.prototype.up = function() {
              if (this.isRoot)
                throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
              return this.parent;
            }, _.prototype.root = function() {
              var c;
              for (c = this; c; ) {
                if (c.isDocument)
                  return c.rootObject;
                if (c.isRoot)
                  return c;
                c = c.parent;
              }
            }, _.prototype.document = function() {
              var c;
              for (c = this; c; ) {
                if (c.isDocument)
                  return c;
                c = c.parent;
              }
            }, _.prototype.end = function(c) {
              return this.document().end(c);
            }, _.prototype.prev = function() {
              var c;
              if (c = this.parent.children.indexOf(this), c < 1)
                throw new Error("Already at the first node. " + this.debugInfo());
              return this.parent.children[c - 1];
            }, _.prototype.next = function() {
              var c;
              if (c = this.parent.children.indexOf(this), c === -1 || c === this.parent.children.length - 1)
                throw new Error("Already at the last node. " + this.debugInfo());
              return this.parent.children[c + 1];
            }, _.prototype.importDocument = function(c) {
              var n;
              return n = c.root().clone(), n.parent = this, n.isRoot = !1, this.children.push(n), this;
            }, _.prototype.debugInfo = function(c) {
              var n, r;
              return c = c || this.name, c == null && !((n = this.parent) != null && n.name) ? "" : c == null ? "parent: <" + this.parent.name + ">" : (r = this.parent) != null && r.name ? "node: <" + c + ">, parent: <" + this.parent.name + ">" : "node: <" + c + ">";
            }, _.prototype.ele = function(c, n, r) {
              return this.element(c, n, r);
            }, _.prototype.nod = function(c, n, r) {
              return this.node(c, n, r);
            }, _.prototype.txt = function(c) {
              return this.text(c);
            }, _.prototype.dat = function(c) {
              return this.cdata(c);
            }, _.prototype.com = function(c) {
              return this.comment(c);
            }, _.prototype.ins = function(c, n) {
              return this.instruction(c, n);
            }, _.prototype.doc = function() {
              return this.document();
            }, _.prototype.dec = function(c, n, r) {
              return this.declaration(c, n, r);
            }, _.prototype.dtd = function(c, n) {
              return this.doctype(c, n);
            }, _.prototype.e = function(c, n, r) {
              return this.element(c, n, r);
            }, _.prototype.n = function(c, n, r) {
              return this.node(c, n, r);
            }, _.prototype.t = function(c) {
              return this.text(c);
            }, _.prototype.d = function(c) {
              return this.cdata(c);
            }, _.prototype.c = function(c) {
              return this.comment(c);
            }, _.prototype.r = function(c) {
              return this.raw(c);
            }, _.prototype.i = function(c, n) {
              return this.instruction(c, n);
            }, _.prototype.u = function() {
              return this.up();
            }, _.prototype.importXMLBuilder = function(c) {
              return this.importDocument(c);
            }, _;
          })();
        }).call(this);
      }, { "./Utility": 68, "./XMLCData": 70, "./XMLComment": 71, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87 }], 82: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i, e) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing instruction target. " + this.debugInfo());
              this.target = this.stringify.insTarget(i), e && (this.value = this.stringify.insValue(e));
            }
            return p.prototype.clone = function() {
              return Object.create(this);
            }, p.prototype.toString = function(u) {
              return this.options.writer.set(u).processingInstruction(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 83: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing raw text. " + this.debugInfo());
              this.value = this.stringify.raw(i);
            }
            return p.prototype.clone = function() {
              return Object.create(this);
            }, p.prototype.toString = function(u) {
              return this.options.writer.set(u).raw(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 84: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i, e, s, d, v, w, y, h = function(c, n) {
            for (var r in n)
              _.call(n, r) && (c[r] = n[r]);
            function m() {
              this.constructor = c;
            }
            return m.prototype = n.prototype, c.prototype = new m(), c.__super__ = n.prototype, c;
          }, _ = {}.hasOwnProperty;
          i = P("./XMLDeclaration"), e = P("./XMLDocType"), M = P("./XMLCData"), E = P("./XMLComment"), s = P("./XMLElement"), v = P("./XMLRaw"), w = P("./XMLText"), d = P("./XMLProcessingInstruction"), a = P("./XMLDTDAttList"), g = P("./XMLDTDElement"), p = P("./XMLDTDEntity"), u = P("./XMLDTDNotation"), y = P("./XMLWriterBase"), se.exports = (function(c) {
            h(n, c);
            function n(r, m) {
              n.__super__.constructor.call(this, m), this.stream = r;
            }
            return n.prototype.document = function(r) {
              var m, T, z, I, A, O, B, k;
              for (O = r.children, T = 0, I = O.length; T < I; T++)
                m = O[T], m.isLastRootNode = !1;
              for (r.children[r.children.length - 1].isLastRootNode = !0, B = r.children, k = [], z = 0, A = B.length; z < A; z++)
                switch (m = B[z], !1) {
                  case !(m instanceof i):
                    k.push(this.declaration(m));
                    break;
                  case !(m instanceof e):
                    k.push(this.docType(m));
                    break;
                  case !(m instanceof E):
                    k.push(this.comment(m));
                    break;
                  case !(m instanceof d):
                    k.push(this.processingInstruction(m));
                    break;
                  default:
                    k.push(this.element(m));
                }
              return k;
            }, n.prototype.attribute = function(r) {
              return this.stream.write(" " + r.name + '="' + r.value + '"');
            }, n.prototype.cdata = function(r, m) {
              return this.stream.write(this.space(m) + "<![CDATA[" + r.text + "]]>" + this.endline(r));
            }, n.prototype.comment = function(r, m) {
              return this.stream.write(this.space(m) + "<!-- " + r.text + " -->" + this.endline(r));
            }, n.prototype.declaration = function(r, m) {
              return this.stream.write(this.space(m)), this.stream.write('<?xml version="' + r.version + '"'), r.encoding != null && this.stream.write(' encoding="' + r.encoding + '"'), r.standalone != null && this.stream.write(' standalone="' + r.standalone + '"'), this.stream.write(this.spacebeforeslash + "?>"), this.stream.write(this.endline(r));
            }, n.prototype.docType = function(r, m) {
              var T, z, I, A;
              if (m || (m = 0), this.stream.write(this.space(m)), this.stream.write("<!DOCTYPE " + r.root().name), r.pubID && r.sysID ? this.stream.write(' PUBLIC "' + r.pubID + '" "' + r.sysID + '"') : r.sysID && this.stream.write(' SYSTEM "' + r.sysID + '"'), r.children.length > 0) {
                for (this.stream.write(" ["), this.stream.write(this.endline(r)), A = r.children, z = 0, I = A.length; z < I; z++)
                  switch (T = A[z], !1) {
                    case !(T instanceof a):
                      this.dtdAttList(T, m + 1);
                      break;
                    case !(T instanceof g):
                      this.dtdElement(T, m + 1);
                      break;
                    case !(T instanceof p):
                      this.dtdEntity(T, m + 1);
                      break;
                    case !(T instanceof u):
                      this.dtdNotation(T, m + 1);
                      break;
                    case !(T instanceof M):
                      this.cdata(T, m + 1);
                      break;
                    case !(T instanceof E):
                      this.comment(T, m + 1);
                      break;
                    case !(T instanceof d):
                      this.processingInstruction(T, m + 1);
                      break;
                    default:
                      throw new Error("Unknown DTD node type: " + T.constructor.name);
                  }
                this.stream.write("]");
              }
              return this.stream.write(this.spacebeforeslash + ">"), this.stream.write(this.endline(r));
            }, n.prototype.element = function(r, m) {
              var T, z, I, A, O, B, k, W;
              m || (m = 0), W = this.space(m), this.stream.write(W + "<" + r.name), B = r.attributes;
              for (O in B)
                _.call(B, O) && (T = B[O], this.attribute(T));
              if (r.children.length === 0 || r.children.every(function(ee) {
                return ee.value === "";
              }))
                this.allowEmpty ? this.stream.write("></" + r.name + ">") : this.stream.write(this.spacebeforeslash + "/>");
              else if (this.pretty && r.children.length === 1 && r.children[0].value != null)
                this.stream.write(">"), this.stream.write(r.children[0].value), this.stream.write("</" + r.name + ">");
              else {
                for (this.stream.write(">" + this.newline), k = r.children, I = 0, A = k.length; I < A; I++)
                  switch (z = k[I], !1) {
                    case !(z instanceof M):
                      this.cdata(z, m + 1);
                      break;
                    case !(z instanceof E):
                      this.comment(z, m + 1);
                      break;
                    case !(z instanceof s):
                      this.element(z, m + 1);
                      break;
                    case !(z instanceof v):
                      this.raw(z, m + 1);
                      break;
                    case !(z instanceof w):
                      this.text(z, m + 1);
                      break;
                    case !(z instanceof d):
                      this.processingInstruction(z, m + 1);
                      break;
                    default:
                      throw new Error("Unknown XML node type: " + z.constructor.name);
                  }
                this.stream.write(W + "</" + r.name + ">");
              }
              return this.stream.write(this.endline(r));
            }, n.prototype.processingInstruction = function(r, m) {
              return this.stream.write(this.space(m) + "<?" + r.target), r.value && this.stream.write(" " + r.value), this.stream.write(this.spacebeforeslash + "?>" + this.endline(r));
            }, n.prototype.raw = function(r, m) {
              return this.stream.write(this.space(m) + r.value + this.endline(r));
            }, n.prototype.text = function(r, m) {
              return this.stream.write(this.space(m) + r.value + this.endline(r));
            }, n.prototype.dtdAttList = function(r, m) {
              return this.stream.write(this.space(m) + "<!ATTLIST " + r.elementName + " " + r.attributeName + " " + r.attributeType), r.defaultValueType !== "#DEFAULT" && this.stream.write(" " + r.defaultValueType), r.defaultValue && this.stream.write(' "' + r.defaultValue + '"'), this.stream.write(this.spacebeforeslash + ">" + this.endline(r));
            }, n.prototype.dtdElement = function(r, m) {
              return this.stream.write(this.space(m) + "<!ELEMENT " + r.name + " " + r.value), this.stream.write(this.spacebeforeslash + ">" + this.endline(r));
            }, n.prototype.dtdEntity = function(r, m) {
              return this.stream.write(this.space(m) + "<!ENTITY"), r.pe && this.stream.write(" %"), this.stream.write(" " + r.name), r.value ? this.stream.write(' "' + r.value + '"') : (r.pubID && r.sysID ? this.stream.write(' PUBLIC "' + r.pubID + '" "' + r.sysID + '"') : r.sysID && this.stream.write(' SYSTEM "' + r.sysID + '"'), r.nData && this.stream.write(" NDATA " + r.nData)), this.stream.write(this.spacebeforeslash + ">" + this.endline(r));
            }, n.prototype.dtdNotation = function(r, m) {
              return this.stream.write(this.space(m) + "<!NOTATION " + r.name), r.pubID && r.sysID ? this.stream.write(' PUBLIC "' + r.pubID + '" "' + r.sysID + '"') : r.pubID ? this.stream.write(' PUBLIC "' + r.pubID + '"') : r.sysID && this.stream.write(' SYSTEM "' + r.sysID + '"'), this.stream.write(this.spacebeforeslash + ">" + this.endline(r));
            }, n.prototype.endline = function(r) {
              return r.isLastRootNode ? "" : this.newline;
            }, n;
          })(y);
        }).call(this);
      }, { "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87, "./XMLWriterBase": 88 }], 85: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i, e, s, d, v, w, y, h = function(c, n) {
            for (var r in n)
              _.call(n, r) && (c[r] = n[r]);
            function m() {
              this.constructor = c;
            }
            return m.prototype = n.prototype, c.prototype = new m(), c.__super__ = n.prototype, c;
          }, _ = {}.hasOwnProperty;
          i = P("./XMLDeclaration"), e = P("./XMLDocType"), M = P("./XMLCData"), E = P("./XMLComment"), s = P("./XMLElement"), v = P("./XMLRaw"), w = P("./XMLText"), d = P("./XMLProcessingInstruction"), a = P("./XMLDTDAttList"), g = P("./XMLDTDElement"), p = P("./XMLDTDEntity"), u = P("./XMLDTDNotation"), y = P("./XMLWriterBase"), se.exports = (function(c) {
            h(n, c);
            function n(r) {
              n.__super__.constructor.call(this, r);
            }
            return n.prototype.document = function(r) {
              var m, T, z, I, A;
              for (this.textispresent = !1, I = "", A = r.children, T = 0, z = A.length; T < z; T++)
                m = A[T], I += (function() {
                  switch (!1) {
                    case !(m instanceof i):
                      return this.declaration(m);
                    case !(m instanceof e):
                      return this.docType(m);
                    case !(m instanceof E):
                      return this.comment(m);
                    case !(m instanceof d):
                      return this.processingInstruction(m);
                    default:
                      return this.element(m, 0);
                  }
                }).call(this);
              return this.pretty && I.slice(-this.newline.length) === this.newline && (I = I.slice(0, -this.newline.length)), I;
            }, n.prototype.attribute = function(r) {
              return " " + r.name + '="' + r.value + '"';
            }, n.prototype.cdata = function(r, m) {
              return this.space(m) + "<![CDATA[" + r.text + "]]>" + this.newline;
            }, n.prototype.comment = function(r, m) {
              return this.space(m) + "<!-- " + r.text + " -->" + this.newline;
            }, n.prototype.declaration = function(r, m) {
              var T;
              return T = this.space(m), T += '<?xml version="' + r.version + '"', r.encoding != null && (T += ' encoding="' + r.encoding + '"'), r.standalone != null && (T += ' standalone="' + r.standalone + '"'), T += this.spacebeforeslash + "?>", T += this.newline, T;
            }, n.prototype.docType = function(r, m) {
              var T, z, I, A, O;
              if (m || (m = 0), A = this.space(m), A += "<!DOCTYPE " + r.root().name, r.pubID && r.sysID ? A += ' PUBLIC "' + r.pubID + '" "' + r.sysID + '"' : r.sysID && (A += ' SYSTEM "' + r.sysID + '"'), r.children.length > 0) {
                for (A += " [", A += this.newline, O = r.children, z = 0, I = O.length; z < I; z++)
                  T = O[z], A += (function() {
                    switch (!1) {
                      case !(T instanceof a):
                        return this.dtdAttList(T, m + 1);
                      case !(T instanceof g):
                        return this.dtdElement(T, m + 1);
                      case !(T instanceof p):
                        return this.dtdEntity(T, m + 1);
                      case !(T instanceof u):
                        return this.dtdNotation(T, m + 1);
                      case !(T instanceof M):
                        return this.cdata(T, m + 1);
                      case !(T instanceof E):
                        return this.comment(T, m + 1);
                      case !(T instanceof d):
                        return this.processingInstruction(T, m + 1);
                      default:
                        throw new Error("Unknown DTD node type: " + T.constructor.name);
                    }
                  }).call(this);
                A += "]";
              }
              return A += this.spacebeforeslash + ">", A += this.newline, A;
            }, n.prototype.element = function(r, m) {
              var T, z, I, A, O, B, k, W, ee, F, Y, x, K;
              m || (m = 0), K = !1, this.textispresent ? (this.newline = "", this.pretty = !1) : (this.newline = this.newlinedefault, this.pretty = this.prettydefault), x = this.space(m), W = "", W += x + "<" + r.name, ee = r.attributes;
              for (k in ee)
                _.call(ee, k) && (T = ee[k], W += this.attribute(T));
              if (r.children.length === 0 || r.children.every(function(pe) {
                return pe.value === "";
              }))
                this.allowEmpty ? W += "></" + r.name + ">" + this.newline : W += this.spacebeforeslash + "/>" + this.newline;
              else if (this.pretty && r.children.length === 1 && r.children[0].value != null)
                W += ">", W += r.children[0].value, W += "</" + r.name + ">" + this.newline;
              else {
                if (this.dontprettytextnodes) {
                  for (F = r.children, I = 0, O = F.length; I < O; I++)
                    if (z = F[I], z.value != null) {
                      this.textispresent++, K = !0;
                      break;
                    }
                }
                for (this.textispresent && (this.newline = "", this.pretty = !1, x = this.space(m)), W += ">" + this.newline, Y = r.children, A = 0, B = Y.length; A < B; A++)
                  z = Y[A], W += (function() {
                    switch (!1) {
                      case !(z instanceof M):
                        return this.cdata(z, m + 1);
                      case !(z instanceof E):
                        return this.comment(z, m + 1);
                      case !(z instanceof s):
                        return this.element(z, m + 1);
                      case !(z instanceof v):
                        return this.raw(z, m + 1);
                      case !(z instanceof w):
                        return this.text(z, m + 1);
                      case !(z instanceof d):
                        return this.processingInstruction(z, m + 1);
                      default:
                        throw new Error("Unknown XML node type: " + z.constructor.name);
                    }
                  }).call(this);
                K && this.textispresent--, this.textispresent || (this.newline = this.newlinedefault, this.pretty = this.prettydefault), W += x + "</" + r.name + ">" + this.newline;
              }
              return W;
            }, n.prototype.processingInstruction = function(r, m) {
              var T;
              return T = this.space(m) + "<?" + r.target, r.value && (T += " " + r.value), T += this.spacebeforeslash + "?>" + this.newline, T;
            }, n.prototype.raw = function(r, m) {
              return this.space(m) + r.value + this.newline;
            }, n.prototype.text = function(r, m) {
              return this.space(m) + r.value + this.newline;
            }, n.prototype.dtdAttList = function(r, m) {
              var T;
              return T = this.space(m) + "<!ATTLIST " + r.elementName + " " + r.attributeName + " " + r.attributeType, r.defaultValueType !== "#DEFAULT" && (T += " " + r.defaultValueType), r.defaultValue && (T += ' "' + r.defaultValue + '"'), T += this.spacebeforeslash + ">" + this.newline, T;
            }, n.prototype.dtdElement = function(r, m) {
              return this.space(m) + "<!ELEMENT " + r.name + " " + r.value + this.spacebeforeslash + ">" + this.newline;
            }, n.prototype.dtdEntity = function(r, m) {
              var T;
              return T = this.space(m) + "<!ENTITY", r.pe && (T += " %"), T += " " + r.name, r.value ? T += ' "' + r.value + '"' : (r.pubID && r.sysID ? T += ' PUBLIC "' + r.pubID + '" "' + r.sysID + '"' : r.sysID && (T += ' SYSTEM "' + r.sysID + '"'), r.nData && (T += " NDATA " + r.nData)), T += this.spacebeforeslash + ">" + this.newline, T;
            }, n.prototype.dtdNotation = function(r, m) {
              var T;
              return T = this.space(m) + "<!NOTATION " + r.name, r.pubID && r.sysID ? T += ' PUBLIC "' + r.pubID + '" "' + r.sysID + '"' : r.pubID ? T += ' PUBLIC "' + r.pubID + '"' : r.sysID && (T += ' SYSTEM "' + r.sysID + '"'), T += this.spacebeforeslash + ">" + this.newline, T;
            }, n.prototype.openNode = function(r, m) {
              var T, z, I, A;
              if (m || (m = 0), r instanceof s) {
                I = this.space(m) + "<" + r.name, A = r.attributes;
                for (z in A)
                  _.call(A, z) && (T = A[z], I += this.attribute(T));
                return I += (r.children ? ">" : "/>") + this.newline, I;
              } else
                return I = this.space(m) + "<!DOCTYPE " + r.rootNodeName, r.pubID && r.sysID ? I += ' PUBLIC "' + r.pubID + '" "' + r.sysID + '"' : r.sysID && (I += ' SYSTEM "' + r.sysID + '"'), I += (r.children ? " [" : ">") + this.newline, I;
            }, n.prototype.closeNode = function(r, m) {
              switch (m || (m = 0), !1) {
                case !(r instanceof s):
                  return this.space(m) + "</" + r.name + ">" + this.newline;
                case !(r instanceof e):
                  return this.space(m) + "]>" + this.newline;
              }
            }, n;
          })(y);
        }).call(this);
      }, { "./XMLCData": 70, "./XMLComment": 71, "./XMLDTDAttList": 72, "./XMLDTDElement": 73, "./XMLDTDEntity": 74, "./XMLDTDNotation": 75, "./XMLDeclaration": 76, "./XMLDocType": 77, "./XMLElement": 80, "./XMLProcessingInstruction": 82, "./XMLRaw": 83, "./XMLText": 87, "./XMLWriterBase": 88 }], 86: [function(P, se, R) {
        (function() {
          var M = function(a, g) {
            return function() {
              return a.apply(g, arguments);
            };
          }, E = {}.hasOwnProperty;
          se.exports = (function() {
            function a(g) {
              this.assertLegalChar = M(this.assertLegalChar, this);
              var p, u, i;
              g || (g = {}), this.noDoubleEncoding = g.noDoubleEncoding, u = g.stringify || {};
              for (p in u)
                E.call(u, p) && (i = u[p], this[p] = i);
            }
            return a.prototype.eleName = function(g) {
              return g = "" + g || "", this.assertLegalChar(g);
            }, a.prototype.eleText = function(g) {
              return g = "" + g || "", this.assertLegalChar(this.elEscape(g));
            }, a.prototype.cdata = function(g) {
              return g = "" + g || "", g = g.replace("]]>", "]]]]><![CDATA[>"), this.assertLegalChar(g);
            }, a.prototype.comment = function(g) {
              if (g = "" + g || "", g.match(/--/))
                throw new Error("Comment text cannot contain double-hypen: " + g);
              return this.assertLegalChar(g);
            }, a.prototype.raw = function(g) {
              return "" + g || "";
            }, a.prototype.attName = function(g) {
              return g = "" + g || "";
            }, a.prototype.attValue = function(g) {
              return g = "" + g || "", this.attEscape(g);
            }, a.prototype.insTarget = function(g) {
              return "" + g || "";
            }, a.prototype.insValue = function(g) {
              if (g = "" + g || "", g.match(/\?>/))
                throw new Error("Invalid processing instruction value: " + g);
              return g;
            }, a.prototype.xmlVersion = function(g) {
              if (g = "" + g || "", !g.match(/1\.[0-9]+/))
                throw new Error("Invalid version number: " + g);
              return g;
            }, a.prototype.xmlEncoding = function(g) {
              if (g = "" + g || "", !g.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/))
                throw new Error("Invalid encoding: " + g);
              return g;
            }, a.prototype.xmlStandalone = function(g) {
              return g ? "yes" : "no";
            }, a.prototype.dtdPubID = function(g) {
              return "" + g || "";
            }, a.prototype.dtdSysID = function(g) {
              return "" + g || "";
            }, a.prototype.dtdElementValue = function(g) {
              return "" + g || "";
            }, a.prototype.dtdAttType = function(g) {
              return "" + g || "";
            }, a.prototype.dtdAttDefault = function(g) {
              return g != null ? "" + g || "" : g;
            }, a.prototype.dtdEntityValue = function(g) {
              return "" + g || "";
            }, a.prototype.dtdNData = function(g) {
              return "" + g || "";
            }, a.prototype.convertAttKey = "@", a.prototype.convertPIKey = "?", a.prototype.convertTextKey = "#text", a.prototype.convertCDataKey = "#cdata", a.prototype.convertCommentKey = "#comment", a.prototype.convertRawKey = "#raw", a.prototype.assertLegalChar = function(g) {
              var p;
              if (p = g.match(/[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/), p)
                throw new Error("Invalid character in string: " + g + " at index " + p.index);
              return g;
            }, a.prototype.elEscape = function(g) {
              var p;
              return p = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, g.replace(p, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
            }, a.prototype.attEscape = function(g) {
              var p;
              return p = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g, g.replace(p, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
            }, a;
          })();
        }).call(this);
      }, {}], 87: [function(P, se, R) {
        (function() {
          var M, E = function(g, p) {
            for (var u in p)
              a.call(p, u) && (g[u] = p[u]);
            function i() {
              this.constructor = g;
            }
            return i.prototype = p.prototype, g.prototype = new i(), g.__super__ = p.prototype, g;
          }, a = {}.hasOwnProperty;
          M = P("./XMLNode"), se.exports = (function(g) {
            E(p, g);
            function p(u, i) {
              if (p.__super__.constructor.call(this, u), i == null)
                throw new Error("Missing element text. " + this.debugInfo());
              this.value = this.stringify.eleText(i);
            }
            return p.prototype.clone = function() {
              return Object.create(this);
            }, p.prototype.toString = function(u) {
              return this.options.writer.set(u).text(this);
            }, p;
          })(M);
        }).call(this);
      }, { "./XMLNode": 81 }], 88: [function(P, se, R) {
        (function() {
          var M = {}.hasOwnProperty;
          se.exports = (function() {
            function E(a) {
              var g, p, u, i, e, s, d, v, w;
              a || (a = {}), this.pretty = a.pretty || !1, this.allowEmpty = (p = a.allowEmpty) != null ? p : !1, this.pretty ? (this.indent = (u = a.indent) != null ? u : "  ", this.newline = (i = a.newline) != null ? i : `
`, this.offset = (e = a.offset) != null ? e : 0, this.dontprettytextnodes = (s = a.dontprettytextnodes) != null ? s : 0) : (this.indent = "", this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = (d = a.spacebeforeslash) != null ? d : "", this.spacebeforeslash === !0 && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, this.prettydefault = this.pretty, v = a.writer || {};
              for (g in v)
                M.call(v, g) && (w = v[g], this[g] = w);
            }
            return E.prototype.set = function(a) {
              var g, p, u;
              a || (a = {}), "pretty" in a && (this.pretty = a.pretty), "allowEmpty" in a && (this.allowEmpty = a.allowEmpty), this.pretty ? (this.indent = "indent" in a ? a.indent : "  ", this.newline = "newline" in a ? a.newline : `
`, this.offset = "offset" in a ? a.offset : 0, this.dontprettytextnodes = "dontprettytextnodes" in a ? a.dontprettytextnodes : 0) : (this.indent = "", this.newline = "", this.offset = 0, this.dontprettytextnodes = 0), this.spacebeforeslash = "spacebeforeslash" in a ? a.spacebeforeslash : "", this.spacebeforeslash === !0 && (this.spacebeforeslash = " "), this.newlinedefault = this.newline, this.prettydefault = this.pretty, p = a.writer || {};
              for (g in p)
                M.call(p, g) && (u = p[g], this[g] = u);
              return this;
            }, E.prototype.space = function(a) {
              var g;
              return this.pretty ? (g = (a || 0) + this.offset + 1, g > 0 ? new Array(g).join(this.indent) : "") : "";
            }, E;
          })();
        }).call(this);
      }, {}], 89: [function(P, se, R) {
        (function() {
          var M, E, a, g, p, u, i;
          i = P("./Utility"), p = i.assign, u = i.isFunction, M = P("./XMLDocument"), E = P("./XMLDocumentCB"), g = P("./XMLStringWriter"), a = P("./XMLStreamWriter"), se.exports.create = function(e, s, d, v) {
            var w, y;
            if (e == null)
              throw new Error("Root element needs a name.");
            return v = p({}, s, d, v), w = new M(v), y = w.element(e), v.headless || (w.declaration(v), (v.pubID != null || v.sysID != null) && w.doctype(v)), y;
          }, se.exports.begin = function(e, s, d) {
            var v;
            return u(e) && (v = [e, s], s = v[0], d = v[1], e = {}), s ? new E(e, s, d) : new M(e);
          }, se.exports.stringWriter = function(e) {
            return new g(e);
          }, se.exports.streamWriter = function(e, s) {
            return new a(e, s);
          };
        }).call(this);
      }, { "./Utility": 68, "./XMLDocument": 78, "./XMLDocumentCB": 79, "./XMLStreamWriter": 84, "./XMLStringWriter": 85 }] }, {}, [21])(21);
    });
  })(Ft)), Ft.exports;
}
var mn = dn();
const vn = /* @__PURE__ */ pn(mn);
export {
  vn as default
};
