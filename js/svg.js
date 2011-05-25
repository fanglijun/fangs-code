var SVG = {
    SVG_NS: "http://www.w3.org/2000/svg",
    XLINK_NS: "http://www.w3.org/1999/xlink",

    css: function (elem, name, value) {
        if (value !== undefined) {
            // 最后的空字符串参数是优先级
            // 不加它在 firefox 下出问题
            elem.style.setProperty(i, name[i], "");
        } else {
            if (typeof name == "string") {
                return elem.style.getPropertyValue(name);
            } else {
                for (var i in name) {
                    elem.style.setProperty(i, name[i], "");

                    // 我也不知道为什么用下面的一句会出错
                    // this.css(elem, i, name[i]);

                    // 而且这个地方如果name中有三个属性在IE9中只会设置一个
                    // 忽略后两个，IE9的bug                    
                }
            }
        }
        return this;
    },
    attr: function (elem, name, value) {
        if (value !== undefined) {
            if (name == "href") {
                elem.setAttributeNS(this.XLINK_NS, name, value);
            } else if (name == "textContent") {
                elem['textContent'] = value;
            } else {
                elem.setAttribute(name, value);
            }
        } else {
            if (typeof name == "string") {
                if (name == "href") {
                    return elem.getAttributeNS(this.XLINK_NS, name);
                } else {
                    return elem.getAttribute(name);
                }
            } else {
                for (var i in name) {
                    this.attr(elem, i, name[i]);
                }
            }
        }
        return this;
    },
    plot: function (parent, tag, attrs) {
        var elem = parent.ownerDocument.createElementNS(this.SVG_NS, tag);
        this.attr(elem, attrs);
        parent.appendChild(elem);
        return elem;
    },
    bind: function (elem, type, fn, useCapture) {
        var bfn = fn;
        fn = function () {
            return bfn.apply(elem, arguments);
        };
        if (document.addEventListener) {
            elem.addEventListener(type, fn, useCapture || false);
        } else {
            elem.attachEvent(type, fn);
        }
        return this;
    },
    unbind: function (elem, type, fn, useCapture) {
        if (document.removeEventListener) {
            elem.removeEventListener(type, fn, useCapture || false);
        } else {
            elem.detachEvent(type, fn);
        }
        return this;
    },
    Drag: function (target, handler, callback) {
        handler.mousedown(function (oEvent) {
            var oX = oEvent.pageX, oY = oEvent.pageY;
            function tmp(nEvent) {
                var dX = nEvent.pageX - oX,
                    dY = nEvent.pageY - oY,
                    x, y, trans, temp;
                oX = nEvent.pageX;
                oY = nEvent.pageY;
                trans = target[0].getAttribute("transform");
                if (trans && (temp = trans.match(/translate\([^)]+\)/))) {
                    trans = temp[0];
                    x = parseInt(trans.match(/([\d-]+),/)[1]);
                    y = parseInt(trans.match(/,([\d-]+)/)[1]);
                } else {
                    x = y = 0;
                }
                target[0].setAttribute("transform", "translate(" + (x + dX) + "," + (y + dY) + ")");
            }
            $(document).mousemove(tmp).mouseup(function () {
                if (callback) {
                    callback.call();
                }
                $(this).unbind("mousemove", tmp).unbind("mouseup", arguments.callee);
                $("body").unbind("selectstart");
            });
            $("body").bind("selectstart", function () { return false; });
        });
    }
};

var SVGContext = (function () {

    var mR = Math.round;

    var SVGContext = function (svgContainer, docElemId) {
        return new SVGContext.fn.init(svgContainer, docElemId);
    };

    SVGContext.fn = SVGContext.prototype = {
        constructor: SVGContext,
        init: function (svgContainer, docElemId) {
            if (svgContainer.constructor == SVGSVGElement) {
                this.doc = svgContainer.ownerDocument;
                this.docElem = svgContainer;
            } else {
                this.doc = svgContainer.getSVGDocument();
                this.docElem = this.doc.documentElement();
            }
            this.docElem = docElemId ? this.doc.getElementById(docElemId) : this.docElem;
            this.canvas = this.svgContainer = svgContainer;

            // for plot path
            this.curPath = [];
            return this;
        },

        // default style
        fillStyle: "Black",
        strokeStyle: "Black",
        lineWidth: 1,
        fontFamily: "sans-serif",
        fontSize: "14px",

        // transform
        translate: function (x, y) {
            this.docElem.setAttribute("transform", "translate(" + x + "," + y + ")");
        },

        // line
        beginPath: function () {
            this.curPath = [];
        },
        moveTo: function (x, y) {
            this.curPath.push("M" + mR(x) + " " + mR(y));
        },
        lineTo: function (x, y) {
            this.curPath.push("L" + mR(x) + " " + mR(y));
        },
        archTo: function (rx, ry, x, y, sweepflag, xRotation) {
            this.curPath.push("A" + rx + "," + ry + " " + (xRotation || 0) + " 0," + (sweepflag === 0 ? 0 : 1) + " " + x + "," + y);
        },
        closePath: function () {
            this.curPath.push("Z");
        },
        stroke: function () {
            var elem = SVG.plot(this.docElem, 'path', {
                d: this.curPath.join(" ")
            });
            SVG.css(elem, {
                "stroke": this.strokeStyle,
                "stroke-width": this.lineWidth,
                "fill": "none"
            });
            return elem;
        },
        fill: function () {
            var elem = this.stroke();
            SVG.css(elem, {
                "stroke": "none",
                "stroke-width": 0,
                "fill": this.fillStyle
            });
            return elem;
        },
        line: function (x1, y1, x2, y2) {
            this.beginPath();
            this.moveTo(x1, y1);
            this.lineTo(x2, y2);
            return this.stroke();
        },

        // rect
        strokeRect: function (x, y, width, height) {
            var elem = SVG.plot(this.docElem, 'rect', {
                x: mR(x),
                y: mR(y),
                width: width,
                height: height
            });
            SVG.css(elem, {
                "stroke": this.strokeStyle,
                "stroke-width": this.lineWidth,
                "fill": "none"
            });
            return elem;
        },
        fillRect: function (x, y, width, height) {
            var elem = this.strokeRect(x, y, width, height);
            SVG.css(elem, {
                "stroke": "none",
                "stroke-width": 0,
                "fill": this.fillStyle
            });
            return elem;
        },
        clearRect: function (x, y, width, height) {
            var elem = this.fillRect(x, y, width, height);
            SVG.css(elem, {
                "fill": "Black",
                "opacity": 0
            });
            return elem;
        },

        // clear canvas
        clear: function () {
            var f = null;
            while (f = this.docElem.firstElementChild || this.docElem.firstChild) {
                this.docElem.removeChild(f);
            }
            return this;
        },

        // text
        measureText: function (text) {
            var elem = this.fillText(text, 0, 0);
            var m = elem.getBBox();
            this.docElem.removeChild(elem);
            return m;
        },
        // 此处 text 为第一参数！
        fillText: function (text, x, y) {
            var elem = SVG.plot(this.docElem, 'text', {
                x: x,
                y: y,
                textContent: text
            });
            SVG.css(elem, {
                "stroke": "none",
                "stroke-width": 0,
                "fill": this.fillStyle,
                "font-size": this.fontSize,
                "font-family": this.fontFamily
            });
            return elem;
        },

        // 画扇形  // 不能用于Canvas
        sector: function (cx, cy, alpha, delta, r, r2, fill) {
            var p1, p2, p3, p4, alpha2 = alpha + delta;
            p1 = {
                x: cx + r * Math.sin(alpha),
                y: cy - r * Math.cos(alpha)
            };
            p2 = {
                x: cx + r * Math.sin(alpha2),
                y: cy - r * Math.cos(alpha2)
            };
            if (r2) {
                p3 = {
                    x: cx + r2 * Math.sin(alpha),
                    y: cy - r2 * Math.cos(alpha)
                };
                p4 = {
                    x: cx + r2 * Math.sin(alpha2),
                    y: cy - r2 * Math.cos(alpha2)
                };
            }
            this.beginPath();
            this.moveTo(cx, cy);
            if (r2) {
                this.moveTo(p3.x, p3.y);
            }
            this.lineTo(p1.x, p1.y);
            this.archTo(r, r, p2.x, p2.y, 1, 0);
            if (r2) {
                this.lineTo(p4.x, p4.y);
                this.archTo(r, r, p3.x, p3.y, 0, 0);
            } else {
                this.closePath();
            }
            if (fill === false) {
                return this.stroke();
            } else {
                return this.fill();
            }
        },

        // drawImage
        drawImage: function (x, y, w, h, href) {
            var elem = SVG.plot(this.docElem, 'image', {
                x: x,
                y: y,
                width: w,
                height: h,
                href: href
            });
            return elem;
        },

        // 删除一个元素
        remove: function (elem) {
            this.docElem.removeChild(elem);
            return this;
        },

        // group
        group: function (fn) {
            if (fn) {
                var oldElem = this.docElem,
                    elem = SVG.plot(oldElem, 'g', {});
                this.docElem = elem;
                fn.call(this);
                this.docElem = oldElem;
                return elem;
            } else {
                return SVG.plot(this.docElem, 'g', {});
            }
        }
    };
    SVGContext.fn.init.prototype = SVGContext.fn;

    return SVGContext;
})();