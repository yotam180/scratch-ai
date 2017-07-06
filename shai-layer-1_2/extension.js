"use strict"; var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (a) { return typeof a } : function (a) { return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a };
//! annyang
//! version : 2.6.0
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/
!function (a, b) { "function" == typeof define && define.amd ? define([], function () { return a.annyang = b(a) }) : "object" === ("undefined" == typeof module ? "undefined" : _typeof(module)) && module.exports ? module.exports = b(a) : a.annyang = b(a) }("undefined" != typeof window ? window : void 0, function (a, b) { var c, d = a.SpeechRecognition || a.webkitSpeechRecognition || a.mozSpeechRecognition || a.msSpeechRecognition || a.oSpeechRecognition; if (!d) return null; var e, f, g = [], h = { start: [], error: [], end: [], soundstart: [], result: [], resultMatch: [], resultNoMatch: [], errorNetwork: [], errorPermissionBlocked: [], errorPermissionDenied: [] }, i = 0, j = 0, k = !1, l = "font-weight: bold; color: #00f;", m = !1, n = !1, o = /\s*\((.*?)\)\s*/g, p = /(\(\?:[^)]+\))\?/g, q = /(\(\?)?:\w+/g, r = /\*\w+/g, s = /[\-{}\[\]+?.,\\\^$|#]/g, t = function (a) { return a = a.replace(s, "\\$&").replace(o, "(?:$1)?").replace(q, function (a, b) { return b ? a : "([^\\s]+)" }).replace(r, "(.*?)").replace(p, "\\s*$1?\\s*"), new RegExp("^" + a + "$", "i") }, u = function (a) { for (var b = arguments.length, c = Array(b > 1 ? b - 1 : 0), d = 1; d < b; d++) c[d - 1] = arguments[d]; a.forEach(function (a) { a.callback.apply(a.context, c) }) }, v = function () { return e !== b }, w = function (a, b) { a.indexOf("%c") !== -1 || b ? console.log(a, b || l) : console.log(a) }, x = function () { v() || c.init({}, !1) }, y = function (a, b, c) { g.push({ command: a, callback: b, originalPhrase: c }), k && w("Command successfully loaded: %c" + c, l) }, z = function (a) { u(h.result, a); for (var b, c = 0; c < a.length; c++) { b = a[c].trim(), k && w("Speech recognized: %c" + b, l); for (var d = 0, e = g.length; d < e; d++) { var f = g[d], i = f.command.exec(b); if (i) { var j = i.slice(1); return k && (w("command matched: %c" + f.originalPhrase, l), j.length && w("with parameters", j)), f.callback.apply(this, j), void u(h.resultMatch, b, f.originalPhrase, a) } } } u(h.resultNoMatch, a) }; return c = { init: function (l) { var o = !(arguments.length > 1 && arguments[1] !== b) || arguments[1]; e && e.abort && e.abort(), e = new d, e.maxAlternatives = 5, e.continuous = "http:" === a.location.protocol, e.lang = "en-US", e.onstart = function () { n = !0, u(h.start) }, e.onsoundstart = function () { u(h.soundstart) }, e.onerror = function (a) { switch (u(h.error, a), a.error) { case "network": u(h.errorNetwork, a); break; case "not-allowed": case "service-not-allowed": f = !1, (new Date).getTime() - i < 200 ? u(h.errorPermissionBlocked, a) : u(h.errorPermissionDenied, a) } }, e.onend = function () { if (n = !1, u(h.end), f) { var a = (new Date).getTime() - i; j += 1, j % 10 === 0 && k && w("Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips."), a < 1e3 ? setTimeout(function () { c.start({ paused: m }) }, 1e3 - a) : c.start({ paused: m }) } }, e.onresult = function (a) { if (m) return k && w("Speech heard, but annyang is paused"), !1; for (var b = a.results[a.resultIndex], c = [], d = 0; d < b.length; d++) c[d] = b[d].transcript; z(c) }, o && (g = []), l.length && this.addCommands(l) }, start: function (a) { x(), a = a || {}, m = a.paused !== b && !!a.paused, f = a.autoRestart === b || !!a.autoRestart, a.continuous !== b && (e.continuous = !!a.continuous), i = (new Date).getTime(); try { e.start() } catch (a) { k && w(a.message) } }, abort: function () { f = !1, j = 0, v() && e.abort() }, pause: function () { m = !0 }, resume: function () { c.start() }, debug: function () { var a = !(arguments.length > 0 && arguments[0] !== b) || arguments[0]; k = !!a }, setLanguage: function (a) { x(), e.lang = a }, addCommands: function (b) { var c; x(); for (var d in b) if (b.hasOwnProperty(d)) if (c = a[b[d]] || b[d], "function" == typeof c) y(t(d), c, d); else { if (!("object" === ("undefined" == typeof c ? "undefined" : _typeof(c)) && c.regexp instanceof RegExp)) { k && w("Can not register command: %c" + d, l); continue } y(new RegExp(c.regexp.source, "i"), c.callback, d) } }, removeCommands: function (a) { a === b ? g = [] : (a = Array.isArray(a) ? a : [a], g = g.filter(function (b) { for (var c = 0; c < a.length; c++) if (a[c] === b.originalPhrase) return !1; return !0 })) }, addCallback: function (c, d, e) { var f = a[d] || d; "function" == typeof f && h[c] !== b && h[c].push({ callback: f, context: e || this }) }, removeCallback: function (a, c) { var d = function (a) { return a.callback !== c }; for (var e in h) h.hasOwnProperty(e) && (a !== b && a !== e || (c === b ? h[e] = [] : h[e] = h[e].filter(d))) }, isListening: function () { return n && !m }, getSpeechRecognizer: function () { return e }, trigger: function (a) { return c.isListening() ? (Array.isArray(a) || (a = [a]), void z(a)) : void (k && w(n ? "Speech heard, but annyang is paused" : "Cannot trigger while annyang is aborted")) } } });


(function(ext) {
    
    var last_thing_said = null;
    var has_said_something = false;
    var wait_listen_callbacks = [];

    if (annyang) {
        var cmds = {
            "*tg": function(phrase) {
                last_thing_said = phrase;
                console.log("user said : " + phrase);
                has_said_something = true;
                for (var i = 0; i < wait_listen_callbacks.length; i++) {
                    wait_listen_callbacks[i]();
                }
                wait_listen_callbacks.length = 0; // Using splice is performance costly ;)
            }
        };
        annyang.addCommands(cmds);
        annyang.start();
    }
    else {
        console.log("Annyang library is not available");
    }

    ext._getStatus = function() {
        return { status: 2, message: "Ready!" };
    };

    ext._shutdown = function() {
        annyang.abort();
    };

    ext.wait_listen = function(callback) {
        wait_listen_callbacks.push(callback);
    };

    ext.wait_speak = function(text, lang, callback) {
        var msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.onend = callback;
        speechSynthesis.speak(msg);
    };

    ext.speak = function(text, lang) {
        var msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        speechSynthesis.speak(msg);
    };

    ext.check_phrase = function(phrase) {
        console.log("Checking " + phrase.toLowerCase().replace(/[^a-z]/g, "") + " against " + last_thing_said.toLowerCase().replace(/[^a-z]/g, ""));
        if (has_said_something && last_thing_said.toLowerCase().replace(/[^a-z]/g, "") == phrase.toLowerCase().replace(/[^a-z]/g, "")) {
            has_said_something = false;
            return true;
        }
        return false;
    };

    ext.last_thing_said = function() {
        return last_thing_said;
    };

    ext.is_listening = function() {
        return annyang.isListening();
    };

    ext.start_listen = function() {
        annyang.start();
    };

    var descriptor = {
        blocks: [
            ['w', 'Speak %s language %d.language and wait', 'wait_speak', 'hello', 'en'],
            [' ', 'Speak %s language %d.language', 'speak', 'hello', 'en'],
            ['w', 'Listen ...', 'wait_listen'],
            ['r', 'Last thing said', 'last_thing_said'],
            ['h', 'When user says %s', 'check_phrase', 'phrase'],
            ['-'],
            ['b', 'Is listening?', 'is_listening'],
            [' ', 'Start listening', 'start_listen']
        ],
        menus: {
            "language": (function() {
                var temp = speechSynthesis.getVoices();
                var langs = [];
                for (i = 0; i < temp.length; i++) {
                    langs[langs.length] = temp[i]["lang"];
                }
                return langs
            })()
        }
    };

    ScratchExtensions.register("Voice extension", descriptor, ext)
})({});