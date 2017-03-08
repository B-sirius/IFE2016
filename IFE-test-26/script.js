"use strict";
//================== 一些常量 ==================
var SEND_FAILURE_RATE = 0.3; //消息发送失败率
var RADIUS_1 = 170;
var RADIUS_2 = 240;
var RADIUS_3 = 300;
var RADIUS_4 = 350;

window.onload = function() {
    var sirius = new commander();
    var space = new mediator();
    space.register(sirius);
    butttonHandler(sirius);
}

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})(); //动画兼容

//==================飞船拥有的属性==============
var spaceShip = function(id, obj) {
    this.id = id;
    this.power = 100;
    this.chargeSpeed = 10;
    this.currState = "stop";
    this.mediator = null; //所在介质
    this.angle = null;
    this.x = null;
    this.y = null;
    this.speed = 1;
    this.selfElement = new Image();
    this.selfElement.spaceShip = this;
};

//====================飞船拥有的功能===============
// 飞船动力控制器
spaceShip.prototype.dynamicManager = function() {
    var self = this;
    var fly = function() {
        consoleLog(self.id + "正在飞行");
        (function flyAnimation() {
            requestAnimFrame(flyAnimation);
            renderFly();
        })();
    };

    var renderFly = function() {
        self.angle += 1;
        if (self.id === 1) {
            self.x = Math.cos(self.angle * Math.PI / 180) * RADIUS_1;
            self.y = Math.sin(self.angle * Math.PI / 180) * RADIUS_1;
        } else if (self.id === 2) {
            self.x = Math.cos(self.angle * Math.PI / 180) * RADIUS_2;
            self.y = Math.sin(self.angle * Math.PI / 180) * RADIUS_2;
        } else if (self.id === 3) {
            self.x = Math.cos(self.angle * Math.PI / 180) * RADIUS_3;
            self.y = Math.sin(self.angle * Math.PI / 180) * RADIUS_3;
        } else {
            self.x = Math.cos(self.angle * Math.PI / 180) * RADIUS_4;
            self.y = Math.sin(self.angle * Math.PI / 180) * RADIUS_4;
        }
        self.selfElement.style.left = self.x + "px";
        self.selfElement.style.top = -self.y + "px";
        self.selfElement.style.transform =  "rotate(" + (-self.angle) + "deg)";
    }

    var stop = function() {
        consoleLog(self.id + "停止飞行");
    };

    return {
        fly: fly,
        stop: stop
    }
};

// 飞船状态控制器
spaceShip.prototype.stateManager = function() {
    var self = this;
    var states = {
        fly: function(state) {
            if (self.currState === "stop") {
                self.currState = "fly";
                self.dynamicManager().fly();
            } else {
                consoleWarning("飞船" + self.id + "号正在飞行");
            }
        },
        stop: function(state) {
            self.currState = "stop";
            self.dynamicManager().stop();
        },
        destroy: function(state) {
            self.currState = "destroy";
            self.mediator.remove(self); //此处的mediator在Mediator中进行了注册
        }
    }

    var changeState = function(state) {
        states[state] && states[state](); //如果存在飞船，则切换状态
        consoleLog(self.id + "号飞船状态为" + state);
    }

    return {
        changeState: changeState
    }
};

// 飞船信号接受器
spaceShip.prototype.signalManager = function() {
    var self = this;
    return {
        receive: function(msg, from) {
            if (self.id == msg.id) { //鉴别信息id
                self.stateManager().changeState(msg.cmd);
            }
        }
    };
};

//====================指挥官，单向发送指令，无法得知飞船的真正情况=======
var commander = function() {
    var self = this;
    this.id = "Sirius";
    this.cmds = [];
    this.mediator = null;
    this.theoreticalSpaceShips = ["empty", "empty", "empty", "empty"];
};

commander.prototype.send = function(msg) {
    this.mediator.send(msg, this);
    this.cmds.push(msg);
};

//====================介质，介质中的发送者与接受者都要在存在于介质中（注册）===
var mediator = function() {
    var spaceShips = [];
    var commanders = null;
    return {
        register: function(obj) { //介质中的注册
            if (obj instanceof commander) { //如果对象存在于commander的原型链中
                commanders = obj;
                obj.mediator = this; //进行注册
                consoleLog("指挥官" + obj.id + "成功注册");
                return true;
            } else if (obj instanceof spaceShip) {
                obj.mediator = this;
                spaceShips.push(obj);
                consoleLog("飞船" + obj.id + "成功注册");
            } else {
                return false;
            }
        },

        create: function(msg) {
            if (spaceShips) {
                var newSpaceShip = new spaceShip(msg.id);
                newSpaceShip.selfElement.src = "img/rocket.svg";
                newSpaceShip.selfElement.className = "spaceShipImg";
                newSpaceShip.y = 0;
                newSpaceShip.angle = 0;
                if (msg.id === 1) {
                    newSpaceShip.selfElement.style.left = RADIUS_1 + "px";
                    newSpaceShip.x = RADIUS_1;
                } else if (msg.id === 2) {
                    newSpaceShip.selfElement.style.left = RADIUS_2 + "px";
                    newSpaceShip.x = RADIUS_2;
                } else if (msg.id === 3) {
                    newSpaceShip.selfElement.style.left = RADIUS_3 + "px";
                    newSpaceShip.x = RADIUS_3;
                } else {
                    newSpaceShip.selfElement.style.left = RADIUS_4 + "px";
                    newSpaceShip.x = RADIUS_4;
                }
                var circleCentre = document.getElementById("circle-centre");
                circleCentre.appendChild(newSpaceShip.selfElement);
                this.register(newSpaceShip);
                return true;
            }
        },

        remove: function(obj) {
            if (obj instanceof spaceShip) {
                for (var i = 0; i < spaceShips.length; i++) {
                    if (spaceShips[i].id = obj.id) {
                        $(spaceShips[i].selfElement).remove();
                        delete spaceShips[i];
                    }
                };
                consoleLog("飞船" + obj.id + "号已自爆hhhh！！")
            }
        },

        send: function(msg, sender) {
            if (msg.cmd === "launch" || msg.cmd === "destroy") {
                if (msg.cmd === "launch") {
                    if (sender.theoreticalSpaceShips[msg.id - 1] === "empty") {
                        sender.theoreticalSpaceShips[msg.id - 1] = "launched";
                    } else {
                        consoleLog("飞船" + msg.id + "号下达过发射指令");
                        return;
                    }
                } else {
                    if (sender.theoreticalSpaceShips[msg.id - 1] === "launched") {
                        sender.theoreticalSpaceShips[msg.id - 1] = "empty";
                    } else {
                        consoleLog("已向飞船" + msg.id + "号下达过摧毁指令");
                    }
                }
            } //指挥官视角
            var success = Math.random() > SEND_FAILURE_RATE ? true : false;
            if (success) {
                if (msg.cmd == "launch") {
                    this.create(msg);
                }
                for (var i = 0; i < spaceShips.length; i++) {
                    spaceShips[i].signalManager().receive(msg, sender);
                }
            } else {
                consoleWarning("信息发送失败");
            }
        }
    }
};

//信息发送
var message = function(target, command) {
    this.id = target;
    this.cmd = command;
};

var butttonHandler = function(commander) {
    var id = null;
    var cmd = null;
    $(".btn").on("click", function() {
        var cmdName = $(this).attr("name");
        id = $(this).parent().index();
        cmd = cmdName;
        var msg = new message(id, cmd);
        commander.send(msg);
        return true;
    })
};

var console = $("#console ul")[0];

var consoleLog = function(text) {
    console.innerHTML += "<li>>" + text + "</li>";
}
var consoleWarning = function(text) {
        console.innerHTML += "<li class = 'warning'>>" + text + "</li>";
    }
    //===================控制信号发送=========================
