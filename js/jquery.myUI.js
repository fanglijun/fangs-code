$.extend({
    Tabs: function (tabs, contents, event) {
        event = event || "click";
        tabs.each(function (i) {
            $(this)[event](function () {
                tabs.removeClass("current");
                $(this).addClass("current");
                contents.hide().eq(i).show();
            });
        });
    },
    Resize: function (target, handler, callback) {
        handler.mousedown(function (oEvent) {
            var oX = oEvent.pageX, oY = oEvent.pageY;
            function tmp(nEvent) {
                var dX = nEvent.pageX - oX,
                dY = nEvent.pageY - oY;
                oX = nEvent.pageX;
                oY = nEvent.pageY;
                target.each(function () {
                    if (this.width) {
                        this.setAttribute("width", parseInt(this.getAttribute("width")) + dX);
                        this.setAttribute("height", parseInt(this.getAttribute("height")) + dY);
                        //this.width = parseInt(this.width) + dX;
                        //this.height = parseInt(this.height) + dY;
                    } else {
                        var o = $(this);
                        o.width(o.width() + dX).height(o.height() + dY);
                    }
                });
                if (handler.css("top") != "auto") {
                    handler.css({ top: parseInt(handler.css("top")) + dY, left: parseInt(handler.css("left")) + dX });
                }
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
    },
    Drag: function (target, handler, ago, callback) {
		handler = handler || target;
		//target.css("position","absolute");
        handler.mousedown(function (oEvent) {
			// 在移动前添加一个判断函数
			// 可用作过滤 handler 
			// 比如handler设为父元素，那么它的所有子元素也都
			// 能移动target，如果不想让子元素也可移动，只需在
			// ago函数里判断e.target，然后返回false
			if(ago && !ago(oEvent)){
				return;
			}
            var oX = oEvent.pageX, oY = oEvent.pageY,
				isTop = target.css("top") !== "auto",
				isLeft = target.css("left") !== "auto";
            function tmp(nEvent) {
                var dX = nEvent.pageX - oX,
                dY = nEvent.pageY - oY;
                oX = nEvent.pageX;
                oY = nEvent.pageY;
				if(isTop){
					target.css("top",parseInt(target.css("top"))+dY);					
				}else{
					target.css("bottom",parseInt(target.css("bottom"))-dY);
				}
				if(isLeft){
					target.css("left",parseInt(target.css("left"))+dX);					
				}else{
					target.css("right",parseInt(target.css("right"))-dX);
				}
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
    },
    /* 参数：
    * list: <ul> Element 或 <ol> Element, 必须是jQuery对象
    * dir: direction,"v"(vertical) 或 "h"(horizontal), 默认vertical
    * delay: 滑动间隔,以毫秒为单位
    * speed: 滑动速度
    */
    Slides: function (list, dir, delay, speed) {
        var len = list.children().length,  // <li> 的个数
            iSize = list.parent().height(),   // 垂直滑动时是父元素高度，水平滑动时是宽度
            cur_num = 1,
            last_num = 0,
            cur_dir = 1,    // 为1时正向滑动,为-1时负向滑动
            nums = $("<ul>"),   // 编号 ul
            i, temp,
            isH = false,    // 是否是水平滑动
            timer = 0;
        // 默认值
        delay = delay || 2000;
        speed = speed || 600;

        if (dir && dir == "h") {
            iSize = list.parent().width();
            list.width(iSize * len);    // 设置list的宽度为所有li之和
            isH = true;
        }
        // 编号
        nums.addClass("slides_nums");
        for (i = 0; i < len; ++i) {
            temp = $("<li>" + (i + 1) + "</li>");
            (function (i) {
                temp.mouseover(function () {
                    stop();
                    slide(i);
                }).mouseout(function () {
                    run();
                });
            })(i);
            temp.appendTo(nums);
        }
        nums.appendTo(list.parent());
        temp = nums.children();

        function slide(n) {
            if (n !== undefined) {
                cur_num = n;
            }
            if (cur_num === len) {
                cur_num -= 2;
                cur_dir = -1;
            } else if (cur_num === -1) {
                cur_num += 2;
                cur_dir = 1;
            }
            var t = -cur_num * iSize;
            if (isH) {
                list.animate({ left: t }, speed);
            } else {
                list.animate({ top: t }, speed);
            }
            // add class
            temp.eq(cur_num).addClass("current");
            temp.eq(last_num).removeClass("current");
            last_num = cur_num;

            cur_num += cur_dir;
        }
        function run() {
            timer = setInterval(function () {
                slide();
            }, delay);
        }
        function stop() {
            clearInterval(timer);
            list.stop(true);
        }
        run();
    }
});
