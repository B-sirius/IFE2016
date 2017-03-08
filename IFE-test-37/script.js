"use strict";
(function() {
    //用于函数节流，防止短时间多次调用函数
    var throttleV2 = function(fn, delay, mustRunDelay) {
        var timer = null;
        var t_start;
        return function() {
            var context = this, //保存当前引用
                args = arguments,
                t_curr = +new Date();
            clearTimeout(timer); //清除上一次的定时器
            if (!t_start) {
                t_start = t_curr;
            }
            if (t_curr - t_start >= mustRunDelay) {
                fn.apply(context, args);
                t_start = t_curr;
            } else {
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            }
        };
    };

    var $logInBtn = $("#log-in-btn");

    $logInBtn.click(function() {
        showLogWindow();
    });

    var showLogWindow = function() {
        var $logWindow = createSingleLogWindow();
        $logWindow.show();
    }

    // 惰性单例模式关键，
    var getSingle = function(fn) {
        var result;
        return function() {
            return result || (result = fn.apply(this, arguments));
        }
    }

    //由于采用了惰性单例模式，这段代码只会执行一次
    var createLogWindow = function() {
        var sourceCode =
            "<div class='mask'>" + "<form id='log-in-form' class='log-in-form'>" + "<div id='form-header' class='form-header'>" + "<button id='close-form-btn' class='close-form-btn'>×</button>" + "<h4>登录</h4>" + "</div>" + "<div class='form-content'>" + "</div>" + "</form>" + "<div>";
        var $logWindow = $(sourceCode);
        $("#content").prepend($logWindow);

        var dragableLogBox = new dragableBox($("#log-in-form"), $("#form-header"), $("#close-form-btn"), $logWindow);
        dragableLogBox.addListeners();
        return $logWindow;
    }

    var createSingleLogWindow = getSingle(createLogWindow);

    var dragableBox = function(ele, dragEle, closeBtn, mask) {
        this.element = ele;
        this.dragPosition = dragEle;
        this.dragPosition.self = this;
        this.closeBtn = closeBtn;
        this.closeBtn.self = this;
        this.mask = mask;
    }

    //
    dragableBox.prototype = {
        addListeners: function() {
            var self = this;
            self.dragPosition.mousedown(function(e) {
                //记录原先鼠标的xy值
                var mouseStartX = e.pageX;
                var mouseStartY = e.pageY;
                var boxStartX = self.dragPosition.offset().left;
                var boxStartY = self.dragPosition.offset().top;

                self.dragPosition.bind("mousemove", {
                    mouseStartX: mouseStartX,
                    mouseStartY: mouseStartY,
                    boxStartX: boxStartX,
                    boxStartY: boxStartY
                }, moveBoxCallback);
            });

            var moveBoxCallback = throttleV2(function(e) {
                self.moveBox.apply(self, [e]);
            }, 10, 15);

            $("body").mouseup(function() {
                self.dragPosition.unbind("mousemove", moveBoxCallback);
            });

            self.closeBtn.click(function() {
                self.mask.hide();
                return false;
            });
        },

        moveBox: function(e) {
            var distanceX = e.pageX - e.data.mouseStartX;
            var distanceY = e.pageY - e.data.mouseStartY;

            var toX = e.data.boxStartX + distanceX;
            var toY = e.data.boxStartY + distanceY;

            this.element.offset({
                left: toX,
                top: toY
            });
        },
    }
})();
