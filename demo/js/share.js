(function(){
	var MP = function() {
        var that = {};
        that.register = function(ns, maker) {
            var NSList = ns.split(".");
            var step = that;
            var k = null;
            while (k = NSList.shift()) {
                if (NSList.length) {
                    if (step[k] === undefined) {
                        step[k] = {};
                    }
                    step = step[k];
                } else {
                    if (step[k] === undefined) {
                        try {
                            step[k] = maker(that);
                        } catch (exp) {}
                    }
                }
            }
        };
        that.IE = /msie/i.test(navigator.userAgent);
        that.E = function(id) {
            if (typeof id === "string") {
                return document.getElementById(id);
            } else {
                return id;
            }
        };
        that.C = function(tagName) {
            var dom;
            tagName = tagName.toUpperCase();
            if (tagName == "TEXT") {
                dom = document.createTextNode("");
            } else {
                if (tagName == "BUFFER") {
                    dom = document.createDocumentFragment();
                } else {
                    dom = document.createElement(tagName);
                }
            }
            return dom;
        };
        return that;
    }();
    MP.register("core.func.getType", function($) {
        return function(oObject) {
            var _t;
            return ((_t = typeof oObject) == "object" ? oObject == null && "null" || Object.prototype.toString.call(oObject).slice(8, -1) : _t).toLowerCase();
        };
    });
    MP.register("core.util.browser", function($) {
        var ua = navigator.userAgent.toLowerCase();
        var external = window.external || "";
        var core, m, extra, version, os;
        var numberify = function(s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function() {
                return c++ == 1 ? "" : ".";
            }));
        };
        try {
            if (/windows|win32/i.test(ua)) {
                os = "windows";
            } else {
                if (/macintosh/i.test(ua)) {
                    os = "macintosh";
                } else {
                    if (/rhino/i.test(ua)) {
                        os = "rhino";
                    }
                }
            }
            if ((m = ua.match(/applewebkit\/([^\s]*)/)) && m[1]) {
                core = "webkit";
                version = numberify(m[1]);
            } else {
                if ((m = ua.match(/presto\/([\d.]*)/)) && m[1]) {
                    core = "presto";
                    version = numberify(m[1]);
                } else {
                    if (m = ua.match(/msie\s([^;]*)/)) {
                        core = "trident";
                        version = 1;
                        if ((m = ua.match(/trident\/([\d.]*)/)) && m[1]) {
                            version = numberify(m[1]);
                        }
                    } else {
                        if (/gecko/.test(ua)) {
                            core = "gecko";
                            version = 1;
                            if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                                version = numberify(m[1]);
                            }
                        }
                    }
                }
            }
            if (/world/.test(ua)) {
                extra = "world";
            } else {
                if (/360se/.test(ua)) {
                    extra = "360";
                } else {
                    if (/maxthon/.test(ua) || typeof external.max_version == "number") {
                        extra = "maxthon";
                    } else {
                        if (/tencenttraveler\s([\d.]*)/.test(ua)) {
                            extra = "tt";
                        } else {
                            if (/se\s([\d.]*)/.test(ua)) {
                                extra = "sogou";
                            }
                        }
                    }
                }
            }
        } catch (e) {}
        var IE11 = ua.indexOf("trident/7.0") != -1 && (ua.indexOf("rv 11.0") != -1 || ua.indexOf("rv:11.0") != -1);
        var ret = {
            OS: os,
            CORE: core,
            Version: version,
            EXTRA: extra ? extra : false,
            IE: /msie/.test(ua) || IE11,
            OPERA: /opera/.test(ua),
            MOZ: /gecko/.test(ua) && !/(compatible|webkit)/.test(ua),
            IE5: /msie 5 /.test(ua),
            IE55: /msie 5.5/.test(ua),
            IE6: /msie 6/.test(ua),
            IE7: /msie 7/.test(ua),
            IE8: /msie 8/.test(ua),
            IE9: /msie 9/.test(ua),
            IE11: IE11,
            SAFARI: !/chrome\/([\d.]*)/.test(ua) && /\/([\d.]*) safari/.test(ua),
            CHROME: /chrome\/([\d.]*)/.test(ua),
            IPAD: /\(ipad/i.test(ua),
            IPHONE: /\(iphone/i.test(ua),
            ITOUCH: /\(itouch/i.test(ua),
            MOBILE: /mobile/i.test(ua)
        };
        return ret;
    });
    MP.register("core.evt.addEvent", function($) {
        return function(sNode, sEventType, oFunc) {
            var oElement = $.E(sNode);
            if (oElement == null) {
                return false;
            }
            sEventType = sEventType || "click";
            if ((typeof oFunc).toLowerCase() != "function") {
                return;
            }
            if (oElement.attachEvent) {
                oElement.attachEvent("on" + sEventType, oFunc);
            } else {
                if (oElement.addEventListener) {
                    oElement.addEventListener(sEventType, oFunc, false);
                } else {
                    oElement["on" + sEventType] = oFunc;
                }
            }
            return true;
        };
    });
    MP.register("core.evt.removeEvent", function($) {
        return function(g, j, h, f) {
            var m = $.E(g);
            if (m == null) {
                return false;
            }
            if (typeof h != "function") {
                return false;
            }
            if (m.removeEventListener) {
                m.removeEventListener(j, h, f);
            } else {
                if (m.detachEvent) {
                    m.detachEvent("on" + j, h);
                } else {
                    m["on" + j] = null;
                }
            }
            return true;
        };
    });
    MP.register("core.dom.ready", function($) {
        var funcList = [];
        var inited = false;
        var getType = $.core.func.getType;
        var browser = $.core.util.browser;
        var addEvent = $.core.evt.addEvent;
        var checkReady = function() {
            if (!inited) {
                if (document.readyState === "complete") {
                    return true;
                }
            }
            return inited;
        };
        var execFuncList = function() {
            if (inited == true) {
                return;
            }
            inited = true;
            for (var i = 0, len = funcList.length; i < len; i++) {
                if (getType(funcList[i]) === "function") {
                    try {
                        funcList[i].call();
                    } catch (exp) {}
                }
            }
            funcList = [];
        };
        var scrollMethod = function() {
            if (checkReady()) {
                execFuncList();
                return;
            }
            try {
                document.documentElement.doScroll("left");
            } catch (e) {
                setTimeout(arguments.callee, 25);
                return;
            }
            execFuncList();
        };
        var readyStateMethod = function() {
            if (checkReady()) {
                execFuncList();
                return;
            }
            setTimeout(arguments.callee, 25);
        };
        var domloadMethod = function() {
            addEvent(document, "DOMContentLoaded", execFuncList);
        };
        var windowloadMethod = function() {
            addEvent(window, "load", execFuncList);
        };
        if (!checkReady()) {
            if ($.IE && window === window.top) {
                scrollMethod();
            }
            domloadMethod();
            readyStateMethod();
            windowloadMethod();
        }
        return function(oFunc) {
            if (checkReady()) {
                if (getType(oFunc) === "function") {
                    oFunc.call();
                }
            } else {
                funcList.push(oFunc);
            }
        };
    });
    var $ = MP;
    MP.register("conf.api.init", function($) {
		window.MP1 = window.MP1||{};
        return function() {
            var initCustomTag = function() {
//              var widgetList = [];
//              var oTag = {tagName: "share-button",widgetName: "iframeWidget"};
//              var tagName = oTag.tagName;
//              var widget = oTag.widgetName;
//              widgetList.push({
//                  tag: tagName,
//                  widget: widget
//              });
                var oBtn = $.E('kuaidianshare');
                if (!oBtn) {
	                throw "no avaliable dom element found.";
	            }
	            var config = window.MP1._config||{
	                title: '',
	                img: '',
	                disc: '',
	                appkey: ''
	            };
                $.widget.social.share(oBtn, config);
//              setTimeout(function() {
//                  widgetObject[0];
//              }, i * 50);
				
            };
            MP1.initCustomTag = initCustomTag;
            $.core.dom.ready(function() {
                initCustomTag();
            });
        };
    });
	MP.register("widget.social.share", function(n) {
        var t = {};
        return function(u, v) {
            var openShare = function() {
                window.open("http://service.fast5.com/share/share.php?appkey=1_blank", "width=615,height=505");
            };
            var bindEvent = function() {
                $.core.evt.addEvent(u, 'click', openShare);
            };
            bindEvent();
            return t;
        };
    });
    $.conf.api.init();
	window.MP1 = window.MP1||{};
    MP1._config = MP1._config || {};
})()
