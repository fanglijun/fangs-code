var jx = (function () {

    var rnotwhite = /\S/,
        trimLeft = /^\s+/,
        trimRight = /\s+$/;
    if (rnotwhite.test("\xA0")) {
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
    }

    var rdashAlpha = /-([a-z])/ig;
    function camelCase(str) {
        return str.replace(rdashAlpha, function (all, letter) {
            return letter.toUpperCase();
        });
    }

    // Save a reference to some core methods
    var slice = Array.prototype.slice,
        trim = String.prototype.trim;

    var jx = function (selector, parent, tag) {
        return new jx.fn.init(selector, parent, tag);
    };
    jx.fn = jx.prototype = {
        constructor: jx,
        init: function (selector, parent, tag) {
            // 保存查询结果
            var elem;

            // Handle $(""), $(null), or $(undefined)
            if (!selector) {
                return this;
            }

            // Handle $($(expr))
            if (selector.constructor === jx) {
                return selector;
            }

            // Handle $(DOMElement)
            if (selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            }

            // The body element only exists once, optimize finding it
            if (selector === "body" && !context && document.body) {
                this[0] = document.body;
                this.length = 1;
                return this;
            }

            // Handle strings
            if (typeof selector === "string") {

                // Handle: $("#id")
                if (/^#/.test(selector)) {
                    selector = selector.substr(1);
                    elem = document.getElementById(selector);
                    this.length = 1;
                    this[0] = elem;
                    return this;

                    // Handle: $(".className")
                } else if (/^\./.test(selector)) {
                    selector = selector.substr(1);
                    elem = jx.byClass(selector, parent, tag);

                    // Handle: $("HTML")
                } else if (/^</.test(selector)) {
                    var div = document.createElement("div");
                    div.innerHTML = selector;
                    elem = div.childNodes;

                    // Handle: $("tag")
                } else {
                    parent = parent || document;
                    elem = parent.getElementsByTagName(selector);
                }

                for (var i = 0, eLen = elem.length; i < eLen; ++i) {
                    this[i] = elem[i];
                }
                this.length = eLen;
                return this;
            }
            return this;
        },
        // public attributes and methods
        length: 0,
        get: function (num) {
            return num == null ?
            slice.call(this, 0) :
            (num < 0 ? this[this.length + num] : this[num]);
        },
        each: function (fn) {
            return jx.each(this, fn);
        },
        attr: function () {
            var argLen = arguments.length;
            var element = this[0];
            switch (argLen) {
                case 1:
                    var arg = arguments[0];
                    if (typeof arg === "string") {
                        return element[arg];
                    } else if (typeof arg === "object") {
                        for (var key in arg) {
                            this.each(function () {
                                this[key] = arg[key];
                            });
                        }
                        return this;
                    }
                    break;
                case 2:
                    var key = arguments[0], value = arguments[1];
                    return this.each(function () {
                        this[key] = value;
                    });
                    break;
                default:
                    return undefined;
            }
        },
        removeAttr: function (name) {
            return this.each(function () {
                $(this).attr(name, "");
                if (this.nodeType === 1) {
                    this.removeAttribute(name);
                }
            });
        },
        addClass: function (name) {
            return this.each(function () {
                var oClass = jx.trim(this.className);
                var pattern = new RegExp("(^|\\s)" + name + "(\\s|$)");
                if (!pattern.test(oClass)) {
                    oClass += " " + name;
                    this.className = oClass;
                }
            });
        },
        removeClass: function (name) {
            return this.each(function () {
                var oClass = jx.trim(this.className);
                var pattern = new RegExp("(^|\\s)" + name + "(\\s|$)");
                if (pattern.test(oClass)) {
                    this.className = oClass.replace(name, "");
                }
            });
        },
        toggleClass: function (name, b) {
            var isBool = typeof b === "boolean";
            var pattern = new RegExp("(^|\\s)" + name + "(\\s|$)");
            if (isBool) {
                if (b) {
                    return this.addClass(name);
                } else {
                    return this.removeClass(name);
                }
            }
            if (b && typeof b === "function") {
                return this.each(function () {
                    var temp = b.call(this),
                        jelem = $(this);
                    if (temp) {
                        jelem.addClass(name);
                    } else {
                        jelem.removeClass(name);
                    }
                });
            } else {
                return this.each(function () {
                    var oClass = this.className,
                        jelem = $(this);
                    var hasClass = pattern.test(oClass);
                    if (hasClass) {
                        jelem.removeClass(name);
                    } else {
                        jelem.addClass(name);
                    }
                });
            }
        },
        html: function (val) {
            if (val !== undefined && typeof val === "string") {
                return this.each(function () {
                    this.innerHTML = val;
                });
            }
            return this[0].innerHTML;
        },
        text: (document.textContent !== undefined) ?
            function (val) {
                if (val && typeof val === "string") {
                    return this.each(function () {
                        this.textContent = val;
                    });
                }
                return this[0].textContent;
            } : function (val) {
                if (val && typeof val === "string") {
                    return this.each(function () {
                        this.innerText = val;
                    });
                }
                return this[0].innerText;
            },
        val: function (val) {
            // set value
            if (val !== undefined) {
                return this.each(function () {
                    var type = this.nodeName.toUpperCase();
                    if (type === "SELECT") {
                        var options = this.options;
                        for (var opt in options) {
                            if (typeof val === "array" && this.multiple) {
                                for (var i = 0, len = val.length; i < len; ++i) {
                                    if (opt.value == val[i]) {
                                        opt.selected = true;
                                    }
                                }
                            } else {
                                if (opt.value == val) {
                                    opt.selected = true;
                                }
                            }
                        }
                    } else {
                        this.value = val;
                    }
                });
                // get value
            } else {
                var elem = this[0],
                    type = elem.nodeName.toUpperCase();
                if (type === "OPTION") {
                    var attrs = elem.attributes;
                    return (attrs.value && attrs.value.specified) ? elem.value : elem.text;
                } else if (type === "SELECT") {
                    if (elem.multiple) {
                        var options = elem.options,
                            values = [];
                        for (var opt in options) {
                            values.push($(opt).val());
                        }
                        return values;
                    } else {
                        var selectedOpt = elem.options[elem.selectedIndex];
                        return $(selectedOpt).val();
                    }
                } else {
                    return elem.value;
                }
            }
        },
        next: function () {
            var t = this[0].nextSibling;
            while (t && t.nodeType != 1) {
                t = t.nextSibling || null;
            }
            return $(t);
        },
        prev: function () {
            var t = this[0].previousSibling;
            while (t && t.nodeType != 1) {
                t = t.previousSibling || null;
            }
            return $(t);
        },
        parent: function () {
            return $(this[0].parentNode);
        },
        children: function () {
            var nodes = this[0].childNodes;
            var rets = [];
            for (var i = 0, j = 0, len = nodes.length; j < len; ++j) {
                if (nodes[j].nodeType == 1) {
                    rets[i++] = nodes[j];
                }
            }
        },
        insertBefore: function (refNode) {
            refNode = $(refNode)[0];
            this.each(function () {
                refNode.parentNode.insertBefore(this, refNode);
            });
        },
        appendTo: function (parent) {
            parent = $(parent)[0];
            this.each(function () {
                parent.appendChild(this);
            });
        },
        append: function (html) {
            // 只支持向一个节点中追加子节点
            var parent = this[0];
            $(html).appendTo(parent);
        },
        replaceWith: function (newNode) {
            // 只支持将一个节点替换
            var oldNode = this[0];
            $(newNode).insertBefore(oldNode);
            $(oldNode).remove();
        },
        remove: function () {
            this.each(function () {
                this.parentNode.removeChild(this);
            });
        },
        css: function () {
            var argLen = arguments.length;
            switch (argLen) {
                case 1:
                    var arg = arguments[0];
                    if (typeof arg === "string") {
                        arg = camelCase(arg);
                        return this[0].style[arg];
                    } else if (typeof arg === "object") {
                        for (var name in arg) {
                            this.css(name, arg[name]);
                        }
                        return this;
                    }
                    break;
                case 2:
                    var name = camelCase(arguments[0]), value = arguments[1];
                    return this.each(function () {
                        this.style[name] = value;
                    });
                    break;
                default:
                    return this;
                    break;
            }
        },
        bind: function (type, fn) {
            type = type.replace(/^on/, "");
            return this.each(function () {
                if (document.all) {
                    this.attachEvent("on" + type, fn);
                } else {
                    this.addEventListener(type, fn, false);
                }
            });
        },
        unbind: function (type, fn) {
            type = type.replace(/^on/, "");
            return this.each(function () {
                if (document.all) {
                    this.detachEvent("on" + type, fn);
                } else {
                    this.removeEvenListener(type, fn, false);
                }
            });
        }
    };
    // important! 
    jx.fn.init.prototype = jx.fn;

    // static methods
    jx.isFunction = function (o) {
        return typeof o === "function";
    };
    jx.byClass = function (searchClass, node, tag) {
        var classElements = new Array();
        if (node == null)
            node = document;
        if (tag == null)
            tag = '*';
        var els = node.getElementsByTagName(tag);
        var elsLen = els.length;
        var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
        for (var i = 0, j = 0; i < elsLen; ++i) {
            if (pattern.test(els[i].className)) {
                classElements[j] = els[i];
                ++j;
            }
        }
        return classElements;
    };
    jx.each = function (object, callback) {
        var name, i = 0,
            length = object.length,
            isObj = length == undefined || jx.isFunction(object);
        if (isObj) {
            for (name in object) {
                if (callback.call(object[name], name, object[name]) === false) {
                    break;
                }
            }
        } else {
            for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) { }
        }
        return object;
    };
    jx.trim = trim ?
        function (text) {
            return text == null ? "" : trim.call(text);
        } :
        function (text) {
            return text == null ? "" :
                text.toString().replace(trimLeft, "").replace(trimRight, "");
        };
    jx.initEvent = function (e) {

        e.stopPropagation = e.stopPropagation || e.cancelBuble;
        e.target = e.target || e.srcElement;
        e.preventDefault = e.preventDefault || function () { this.returnValue = false; };

        return e;
    };
    jx.noop = function () { };
    // ajax
    jx.get = function (url, callback) {
        callback = callback || {};
        callback.success = callback.success || jx.noop;
        callback.failure = callback.failure || jx.noop;
        jx.ajaxHandler.request("GET", url, callback);
    };
    jx.post = function (url, data, callback) {
        callback = callback || {};
        callback.success = callback.success || jx.noop;
        callback.failure = callback.failure || jx.noop;
        jx.ajaxHandler.request("POST", url, callback, data);
    };

    jx.ajaxHandler = {
        request: function (method, url, callback, postVars) {
            var xhr = this.createXhrObject();
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                (xhr.status === 200) ? callback.success(xhr.responseText, xhr.responseXML) : callback.failure(xhr.status);
            };
            xhr.open(method, url, true);
            if (method !== 'POST') postVars = null;
            xhr.send(postVars);
        },
        createXhrObject: function () { // Factory method.
            var methods = [function () {
                return new XMLHttpRequest();
            }, function () {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function () {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } ];
            for (var i = 0, len = methods.length; i < len; i++) {
                try {
                    methods[i]();
                } catch (e) {
                    continue;
                }
                // If we reach this point, method[i] worked.
                this.createXhrObject = methods[i]; // Memoize the method.
                return methods[i];
            }
            // If we reach this point, none of the methods worked.
            throw new Error('SimpleHandler: Could not create an XHR object.');
        }
    };

    return $ = jx;
})();