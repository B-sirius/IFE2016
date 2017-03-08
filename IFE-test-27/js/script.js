'use strict'
//===========================一些常量===================================
//画布绘制所用常量
var PLANET_RADIUS = 140;
var SCREEN_WIDTH = 500;
var SCREEN_HEIGHT = 500;
var CENTER_X = SCREEN_WIDTH / 2;
var CENTER_Y = SCREEN_HEIGHT / 2;
var ORBIT_0_RADIUS = 180;
var ORBIT_1_RADIUS = 230;
var POWER_STRIP_FULL_COLOR = 'rgb(19, 240, 88)';
var POWER_STRIP_MEDIUM_COLOR = 'rgb(251, 185, 87)';
var POWER_STRIP_LOW_COLOR = 'rgb(255, 5, 5)';
var POWER_STRIP_WIDTH = 3;
var POWER_STRIP_OFFSET = 7;

//飞船设置所用常量
var SPACESHIP_WIDTH = 30;
var SPACESHIP_HEIGHT = 30;
var SLOW_SPEED = 1;
var FAST_SPEED = 1.5;
var SLOW_CONSUME = 0.5;
var FAST_CONSUME = 1;
var SLOW_CHARGE_SPEED = 0.5;
var FAST_CHARGE_SPEED = 1;

//介质传输所用常量
var FAILURE_RATE = 0.1;
var BROADCAST_SPEED = 300;

//========================canvas绘制星球以及轨道========================

var renderPlanet = function(ctx) {
    //绘制大圈
    drawBall(ctx, "rgb(142, 13, 195)", CENTER_X, CENTER_Y, PLANET_RADIUS);
    //绘制三个小圈
    ctx.globalCompositeOperation = 'source-atop';
    drawBall(ctx, "rgb(116, 9, 159)", 150, 150, 40);
    drawBall(ctx, "rgb(116, 9, 159)", 250, 260, 40);
    drawBall(ctx, "rgb(116, 9, 159)", 330, 360, 40);
    //绘制轨道
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    drawCircle("rgba(214, 214, 214, 0.3)", ctx, CENTER_X, CENTER_Y, ORBIT_0_RADIUS);
    drawCircle("rgba(214, 214, 214, 0.3)", ctx, CENTER_X, CENTER_Y, ORBIT_1_RADIUS);
};

var drawBall = function(ctx, style, x, y, radius) {
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
};

var drawCircle = function(style, ctx, x, y, radius) {
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
};

//绘制背景
(function() {
    var canvas = document.getElementById('background');
    var context = canvas.getContext('2d');
    background.width = SCREEN_WIDTH;
    background.height = SCREEN_HEIGHT;
    renderPlanet(context);
})();

//=========================飞船的绘制=======================
window.requestAnimFrame = function() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function */ callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

var checkSpaceShips = function(ctx, spaceShips) {
    //如果spaceShips已定义且spaceShips中有不是undefined的元素，则执行下面的函数
    if (!(spaceShips === undefined || spaceShips.every(function(element, index, array) {
            return element === undefined;
        }))) {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //清空画布，前两个参数是所清除矩形左上角的位置
        for (var i = 0; i < spaceShips.length; i++) {
            if (spaceShips[i] !== undefined) {
                drawSpaceShip(ctx, spaceShips[i]);
            }
        }
    } else {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
};

var drawSpaceShip = function(ctx, spaceShip) {
    var deg = -spaceShip.angle * Math.PI / 180; //转换为弧度制
    var spaceShipImg = new Image();
    spaceShipImg.src = "img/rocket.svg";
    ctx.save();
    ctx.translate(CENTER_X, CENTER_Y); //改变当前绘制的相对起点到画布中心
    ctx.rotate(deg); //rotate的旋转中心是canvas的起点（可用translate改变）
    ctx.beginPath();
    if (spaceShip.power > 70) {
        ctx.strokeStyle = POWER_STRIP_FULL_COLOR;
    } else if (spaceShip.power >= 30) {
        ctx.strokeStyle = POWER_STRIP_MEDIUM_COLOR;
    } else {
        ctx.strokeStyle = POWER_STRIP_LOW_COLOR;
    }
    ctx.lineWidth = POWER_STRIP_WIDTH;
    ctx.moveTo(spaceShip.flyRadius - SPACESHIP_WIDTH / 2, -POWER_STRIP_OFFSET);
    ctx.lineTo(spaceShip.flyRadius + SPACESHIP_WIDTH * (spaceShip.power / 100) - SPACESHIP_WIDTH / 2, -POWER_STRIP_OFFSET);
    ctx.stroke();

    ctx.drawImage(spaceShipImg, spaceShip.flyRadius - SPACESHIP_WIDTH / 2, 0, SPACESHIP_WIDTH, SPACESHIP_HEIGHT);
    ctx.restore();
};

//========================调用方法============================
var chooseEngine = function(engineType) {
    var speed = null;
    var consume = null;
    if (engineType === 'slow') {
        speed = SLOW_SPEED;
        consume = SLOW_CONSUME;
    } else {
        var speed = FAST_SPEED;
        consume = FAST_CONSUME;
    };
    var getSpeed = function() {
        return speed;
    };
    var getConsume = function() {
        return consume;
    };
    return {
        getFlySpeed: getSpeed,
        getConsume: getConsume
    };
};

var chooseChargeSource = function(chargeType) {
    var chargeSpeed = null;
    if (chargeType === 'slow') {
        chargeSpeed = SLOW_CHARGE_SPEED;
    } else {
        chargeSpeed = FAST_CHARGE_SPEED;
    };
    var getChargeSpeed = function() {
        return chargeSpeed;
    };

    return {
        getChargeSpeed: getChargeSpeed
    };
};

var consoleLog = function(information) {
    var innerHtml = document.getElementById('console').innerHTML;
    innerHtml += "<p class='out-put'>>" + information + "</p>";
    document.getElementById('console').innerHTML = innerHtml;
};

//========================构建spaceShip对象===================
var spaceShip = function(orbitId, flySpeed, consume, chargeSpeed) {
    this.id = orbitId;
    if (this.id === 0) {
        this.flyRadius = ORBIT_0_RADIUS;
    } else if (this.id === 1) {
        this.flyRadius = ORBIT_1_RADIUS;
    } else {
        this.flyRadius = undefined;
    }
    this.angle = 0;
    this.deg = 0;
    this.flySpeed = flySpeed;
    this.consume = consume;
    this.chargeSpeed = chargeSpeed;
    this.state = 'stop';
    this.timer = null; //用于更新飞船状态
    this.power = 100;
}

spaceShip.prototype.powerManager = function() {
    var self = this;
    var charge = function() {
        var timer = setInterval(function() {
            if (self.state === 'fly' || self.state === 'destroy') {
                clearInterval(timer);
                return false;
            }
            if (self.power > 100) {
                clearInterval(timer);
                self.power = 100;
                return false;
            }
            self.power += self.chargeSpeed;
            return true;
        }, 20);
    }

    var discharge = function() {
        var timer = setInterval(function() {
            //若飞船停止或者被销毁则不会放电
            if (self.state === 'stop' || self.state === 'destroy') {
                clearInterval(timer);
                return false;
            }
            if (self.power < 0) {
                clearInterval(timer);
                self.power = 0;
                self.stateManager().changeState('stop');
                return false;
            }
            self.power -= self.consume;
        }, 20);
    }

    return {
        charge: charge,
        discharge: discharge
    }
}

spaceShip.prototype.stateManager = function() { //飞船状态控制器
    var self = this;
    var states = {
        fly: function() {
            self.state = "fly";
            self.dynamicManager().fly();
            self.powerManager().discharge();
        },
        stop: function() {
            self.state = "stop";
            self.dynamicManager().stop();
            self.powerManager().charge();
        },
        destroy: function() {
            self.state = "destroy";
            self.media.remove(self);
        }
    };

    var changeState = function(state) { //动力控制器，由状态控制器直接控制
        if (state === self.state) {
            consoleLog('No.' + self.id + ' spaceShip already ' + state);
            return false;
        }
        consoleLog("change No." + self.id + " spaceShip\'s state to " + state);
        states[state]();
    };

    return {
        changeState: changeState
    }
};

spaceShip.prototype.dynamicManager = function() {
    var self = this;
    var fly = function() {
        self.timer = setInterval(function() {
            self.angle += self.flySpeed;
            if (self.angle > 360) {
                self.angle = 0;
            }
        }, 10);
        consoleLog("No." + self.id + " spaceShip is flying");
    };
    var stop = function() {
        clearInterval(self.timer);
        consoleLog("No." + self.id + " spaceShip has stopped");
    };

    return {
        fly: fly,
        stop: stop
    }
}

spaceShip.prototype.singalManger = function() {
    var self = this;
    var target = null;
    var cmd = null;
    var translateCodeToMsg = function(code) {
        var arr = code.split(' ');
        if (arr[0] === '00') {
            target = 0;
        } else if (arr[0] === '01') {
            target = 1;
        } else {
            consoleLog('translateCodeToMsg failed');
            return false;
        };
        if (arr[1] === '00') {
            cmd = "fly";
        } else if (arr[1] === '01') {
            cmd = 'stop';
        } else if (arr[1] === '11') {
            cmd = 'destroy';
        } else {
            consoleLog('translateCodeToMsg failed');
            return false;
        };
        return new message(target, cmd);
    };
    var receive = function(code) {
        var msg = translateCodeToMsg(code);
        if (msg.target === self.id) {
            self.stateManager().changeState(msg.cmd);
        };
    };

    return {
        receive: receive
    }
}

//========================构建message对象=========================
var message = function(target, cmd) {
    this.target = target;
    this.cmd = cmd;
}

//========================构建commander对象===========================
var commander = function() {
    this.id = "sirius";
    this.cmds = [];
    this.media = null;
}

commander.prototype.translateMsgToCode = function(msg) {
    this.cmds.push(msg);
    var orbitCode = null;
    var cmdCode = null;
    if (msg.target === 0) {
        orbitCode = "00";
    } else if (msg.target === 1) {
        orbitCode = "01";
    } else {
        consoleLog('translateMsgToCode failed');
    };
    if (msg.cmd === "fly") {
        cmdCode = "00";
    } else if (msg.cmd === "stop") {
        cmdCode = "01";
    } else if (msg.cmd === "destroy") {
        cmdCode = "11";
    } else {
        consoleLog('translateMsgToCode failed')
    }
    var code = orbitCode + ' ' + cmdCode;
    return code;
}

commander.prototype.sendMsg = function(msg) {
    var code = sirius.translateMsgToCode(msg);
    this.media.send(code);
}

//========================构建media对象===============================
var media = function() {
    var spaceShips = [];
    var commanders = null;
    var register = function(obj) {
        if (obj instanceof spaceShip) {
            spaceShips[obj.id] = obj;
            obj.media = this;
            consoleLog('register No.' + obj.id + ' spaceShip successfully');
        } else if (obj instanceof commander) {
            commander = obj;
            obj.media = this;
            consoleLog('register ' + commander.id + " successfully")
        } else {
            return false;
        };
    };

    var send = function(code) {
        var success = Math.random() > FAILURE_RATE ? true : false;
        if (success) {
            for (var key in spaceShips) {
                spaceShips[key].singalManger().receive(code);
            }
        } else {
            consoleLog('sending msg failed, retrying')
            send(code);
            return false;
        }
    };

    var remove = function(obj) {
        if (obj instanceof spaceShip) {
            consoleLog("No." + obj.id + 'spaceShip has booooom!!!!!!');
            spaceShips.splice(obj.id);
        }
    };

    return {
        register: register,
        send: send,
        remove: remove,
        spaceShips: spaceShips
    }
};


//========================绑定按钮事件============================
$('#create-spaceShip').click(function() { //一键上天按钮
    //验证是否对配置进行了选择
    var engineVal = $('input[type="radio"][name="speed"]:checked').val();
    var chargeVal = $('input[type="radio"][name="charge"]:checked').val();
    var orbit = $('input[type="radio"][name="orbit"]:checked').val();
    var orbitId = null;
    if (engineVal === undefined) {
        alert("请选择动力系统");
        return false;
    };
    if (chargeVal === undefined) {
        alert("请选择能源系统");
        return false;
    };
    if (orbit === undefined) {
        alert("请选择发射轨道");
        return false;
    } else if (orbit === 'inside') {
        orbitId = 0;
    } else {
        orbitId = 1;
    }
    //验证该轨道是否被占据
    if (bus.spaceShips[orbitId]) {
        consoleLog('error, No.' + orbitId + ' spaceShip has been launched');
        return false;
    }
    //如果选择完成，创建飞船
    var flySpeed = chooseEngine(engineVal).getFlySpeed();
    var consume = chooseEngine(engineVal).getConsume();
    var chargeSpeed = chooseChargeSource(chargeVal).getChargeSpeed();
    var newSpaceShip = new spaceShip(orbitId, flySpeed, consume, chargeSpeed);
    bus.register(newSpaceShip);
});

var flyBtns = document.getElementsByClassName('fly');
var stopBtns = document.getElementsByClassName('stop');
var destroyBtns = document.getElementsByClassName('destroy');

flyBtns[0].addEventListener('click', function() {
    var msg = new message(0, 'fly');
    sirius.sendMsg(msg);
});
flyBtns[1].addEventListener('click', function() {
    var msg = new message(1, 'fly');
    sirius.sendMsg(msg);
});

stopBtns[0].addEventListener('click', function() {
    var msg = new message(0, 'stop');
    sirius.sendMsg(msg);
});
stopBtns[1].addEventListener('click', function() {
    var msg = new message(1, 'stop');
    sirius.sendMsg(msg);
});

destroyBtns[0].addEventListener('click', function() {
    var msg = new message(0, 'destroy');
    sirius.sendMsg(msg);
});
destroyBtns[1].addEventListener('click', function() {
    var msg = new message(1, 'destroy');
    sirius.sendMsg(msg);
});

//===================页面刷新时加载事件=================================
window.onload = function() {
    var frontCanvas = document.getElementById('spaceShip');
    frontCanvas.width = SCREEN_WIDTH;
    frontCanvas.height = SCREEN_HEIGHT;
    var context = frontCanvas.getContext('2d');
    (function spaceShipAnimation() {
        requestAnimFrame(spaceShipAnimation);
        checkSpaceShips(context, bus.spaceShips);
    })();
};

var sirius = new commander();
var bus = new media();
bus.register(sirius);
