'use strict'
//===========================拖拉框====================================
//自动居中函数
var defaultPosition = function(el) {
    //获取浏览器可视宽高
    var contentW = document.getElementById('content').clientWidth;
    var contentH = document.getElementById('content').clientHeight;
    //获取浮层宽高
    var elW = el.offsetWidth;
    var elH = el.offsetHeight;
    //居中
    el.style.left = (contentW - elW) + 'px';
    el.style.top = '0px';
};

//鼠标偏移值
var mouseOffsetX = 0;
var mouseOffsetY = 0;
var isDraging = false; //标记浮层是否可拖动
//鼠标矮标题栏按下时的事件，得到鼠标按下时鼠标位置相当于浮动层左上角的坐标
document.getElementById('dialog-title').addEventListener('mousedown', function(e) {
    var e = e || e.window.event; //兼容ie
    mouseOffsetX = e.pageX - document.getElementById('dialog').offsetLeft;
    mouseOffsetY = e.pageY - document.getElementById('dialog').offsetTop;
    isDraging = true;
});

//鼠标移动事件（即使不点击也会执行此函数，所以才有必要设置 isDraging来判断是否是点击状态）
document.onmousemove = function(e) {
    e = e || e.window.event;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    var moveX = 0;
    var moveY = 0;
    if (isDraging === true) {
        moveX = mouseX - mouseOffsetX; //在鼠标移动的一瞬间，mouseX会改变，mouseOffsetX还没有变，减去后得到的就是左上角新的坐标
        moveY = mouseY - mouseOffsetY;
        //对拖动范围的限制
        var pageWidth = document.documentElement.clientWidth;
        var pageHeight = document.documentElement.clientHeight;
        var dialogWidth = document.getElementById('dialog').offsetWidth;
        var dialogHeight = document.getElementById('dialog').offsetHeight;
        var maxWidth = pageWidth - dialogWidth;
        var maxHeight = pageHeight - dialogHeight;
        moveX = Math.max(0, moveX);
        moveX = Math.min(maxWidth, moveX)
        moveY = Math.max(0, moveY);
        moveY = Math.min(maxHeight, moveY)

        document.getElementById('dialog').style.left = moveX + 'px';
        document.getElementById('dialog').style.top = moveY + 'px';
    }
}

//鼠标松开事件
document.onmouseup = function() {
    isDraging = false;
}

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
var SLOW_CONSUME = 0.2;
var FAST_CONSUME = 0.4;
var SLOW_CHARGE_SPEED = 0.3;
var FAST_CHARGE_SPEED = 0.5;

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

var checkSpaceShips = function(ctx, spaceships) {
    //如果spaceships已定义且spaceships中有不是undefined的元素，则执行下面的函数
    if (!(spaceships === undefined || spaceships.every(function(element, index, array) {
            return element === undefined;
        }))) {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //清空画布，前两个参数是所清除矩形左上角的位置
        for (var i = 0; i < spaceships.length; i++) {
            if (spaceships[i] !== undefined) {
                drawSpaceShip(ctx, spaceships[i]);
            }
        }
    } else {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
};

var drawSpaceShip = function(ctx, spaceship) {
    var deg = -spaceship.angle * Math.PI / 180; //转换为弧度制
    var spaceShipImg = new Image();
    spaceShipImg.src = "img/rocket.svg";
    ctx.save();
    ctx.translate(CENTER_X, CENTER_Y); //改变当前绘制的相对起点到画布中心
    ctx.rotate(deg); //rotate的旋转中心是canvas的起点（可用translate改变）
    //绘制电量条
    ctx.beginPath();
    if (spaceship.power > 70) {
        ctx.strokeStyle = POWER_STRIP_FULL_COLOR;
    } else if (spaceship.power >= 30) {
        ctx.strokeStyle = POWER_STRIP_MEDIUM_COLOR;
    } else {
        ctx.strokeStyle = POWER_STRIP_LOW_COLOR;
    }
    ctx.lineWidth = POWER_STRIP_WIDTH;
    ctx.moveTo(spaceship.flyRadius - SPACESHIP_WIDTH / 2, -POWER_STRIP_OFFSET);
    ctx.lineTo(spaceship.flyRadius + SPACESHIP_WIDTH * (spaceship.power / 100) - SPACESHIP_WIDTH / 2, -POWER_STRIP_OFFSET);
    ctx.stroke();
    //绘制飞船
    ctx.drawImage(spaceShipImg, spaceship.flyRadius - SPACESHIP_WIDTH / 2, 0, SPACESHIP_WIDTH, SPACESHIP_HEIGHT);
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

//=========================构建DC(数据处理中心)对象================
var DC = function() {
    var codeAdapter = function(code) {
        var msg = new message();
        //接收或目标飞船id
        switch (code.substr(0, 2)) {
            case '00': msg.id = 0; break;
            case '01': msg.id = 1; break;
            default: consoleLog('get id msg failed');
        }
        //指令
        switch (code.substr(2, 2)) {
            case '00': msg.cmd = 'fly'; break;
            case '01': msg.cmd = 'stop'; break;
            case '10': msg.cmd = 'destroy'; break;
            case '11': msg.cmd = 'broadcast'; break;
            default: consoleLog('get cmd msg failed');
        }
        //状态
        switch (code.substr(4, 2)) {
            case '00': break;
            case '01': msg.currState = 'fly'; break;
            case '10': msg.currState = 'stop'; break;
            case '11': msg.currState = 'destroy'; break;
            default: consoleLog('get state msg failed');
        }
        //动力系统型号
        switch (code.substr(6, 2)) {
            case '00': break;
            case '01': msg.dynamicType = 'slow'; break;
            case '10': msg.dynamicType = 'fast'; break;
            default: consoleLog('get dynamicType msg failed');
        }
        //能源回复系统型号
        switch (code.substr(8, 2)) {
            case '00': break;
            case '01': msg.powerType = 'slow'; break;
            case '10': msg.powerType = 'fast'; break;
            default: consoleLog('get powerType msg failed');
        }
        msg.powerLeft = parseInt(code.substr(10, 7), 2); //二进制转十进制
        return msg;
    };

    var msgAdapter = function(msg) {
        var code = '';
        switch (msg.id) {
            case 0: code += '00'; break;
            case 1: code += '01'; break;
            default: consoleLog('get id code failed');
        }
        switch (msg.cmd) {
            case 'fly': code += '00'; break;
            case 'stop': code += '01'; break;
            case 'destroy': code += '10'; break;
            case 'broadcast': code += '11'; break;
            default: consoleLog('get id code failed');
        }
        switch (msg.currState) {
            case undefined: code += '00'; break;
            case 'fly': code += '01'; break;
            case 'stop': code += '10'; break;
            case 'destroy': code += '11'; break;
            default: consoleLog('get state code failed');
        }
        switch (msg.dynamicType) {
            case undefined: code += '00'; break;
            case 'slow': code += '01'; break;
            case 'fast': code += '10'; break;
            default: consoleLog('get dynamicType code failed');
        }
        switch (msg.powerType) {
            case undefined: code += '00'; break;
            case 'slow': code += '01'; break;
            case 'fast': code += '10'; break;
            default: consoleLog('get powerType code failed');
        }
        //将剩余能量转换为二进制
        if (msg.powerLeft === undefined) {
            code += '1111111';
        } else {
            code += Math.floor(msg.powerLeft).toString(2).substr(-7); //substr确保最后的二进制会是7位
        }
        return code;
    };

    var refreshMonitor = function(msg) {
        if (msg.id === 0) {
            no0Dynamic.innerHTML = msg.dynamicType;
            no0Power.innerHTML = msg.powerType;
            no0State.innerHTML = msg.currState;
            no0Left.innerHTML = msg.powerLeft + '%';
        } else if (msg.id === 1) {
            no1Dynamic.innerHTML = msg.dynamicType;
            no1Power.innerHTML = msg.powerType;
            no1State.innerHTML = msg.currState;
            no1Left.innerHTML = msg.powerLeft + '%';
        }
    };

    return {
        codeAdapter: codeAdapter,
        msgAdapter: msgAdapter,
        refreshMonitor: refreshMonitor
    }
}


//========================构建spaceship对象===================
var spaceship = function(orbitId, flySpeed, consume, chargeSpeed) {
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

spaceship.prototype.powerManager = function() {
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

spaceship.prototype.stateManager = function() { //飞船状态控制器
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
            consoleLog('No.' + self.id + ' spaceship already ' + state);
            return false;
        }
        consoleLog("change No." + self.id + " spaceship\'s state to " + state);
        states[state]();
    };

    return {
        changeState: changeState
    }
};

spaceship.prototype.dynamicManager = function() {
    var self = this;
    var fly = function() {
        self.timer = setInterval(function() {
            self.angle += self.flySpeed;
            if (self.angle > 360) {
                self.angle = 0;
            }
        }, 10);
        consoleLog("No." + self.id + " spaceship is flying");
    };
    var stop = function() {
        clearInterval(self.timer);
        consoleLog("No." + self.id + " spaceship has stopped");
    };

    return {
        fly: fly,
        stop: stop
    }
}

spaceship.prototype.singalManger = function() {
    var self = this;
    var receive = function(code) {
        var msg = DC().codeAdapter(code);
        if (msg.id === self.id) {
            self.stateManager().changeState(msg.cmd);
        };
    };
    return {
        receive: receive
    }
}

spaceship.prototype.broadcast = function() {
    var self = this;
    var timer = setInterval(function() {
        if (self.state === 'destroy') {
            clearInterval(timer);
            resetMonitor(self.id);
            return false;
        }
        var dynamicType = undefined;
        var powerType = undefined;
        if (self.flySpeed === SLOW_SPEED) {
            dynamicType = 'slow';
        } else {
            dynamicType = 'fast';
        }
        if (self.consume === SLOW_CONSUME) {
            powerType = 'slow';
        } else {
            powerType = 'fast';
        }
        var msg = new message(self.id, 'broadcast', dynamicType, powerType, self.state, self.power);
        var code = DC().msgAdapter(msg);
        self.media.receive(code);
    }, 500)
}
//========================构建message对象=========================
var message = function(id, cmd, dynamicType, powerType, currState, powerLeft) {
    this.id = id;
    this.cmd = cmd;
    this.dynamicType = dynamicType;
    this.powerType = powerType;
    this.currState = currState;
    this.powerLeft = powerLeft;
}

//========================构建commander对象===========================
var commander = function() {
    this.id = "sirius";
    this.media = null;
}

commander.prototype.sendMsg = function(msg) {
    var code = DC().msgAdapter(msg);
    this.media.send(code);
}

//========================构建media对象===============================
var media = function() {
    var spaceships = [];
    var commanders = null;
    var register = function(obj) {
        if (obj instanceof spaceship) {
            spaceships[obj.id] = obj;
            obj.media = this;
            obj.broadcast();
            consoleLog('register No.' + obj.id + ' spaceship successfully');
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
            for (var key in spaceships) {
                spaceships[key].singalManger().receive(code);
            }
        } else {
            consoleLog('sending msg failed, retrying')
            send(code);
            return false;
        }
    };

    var remove = function(obj) {
        if (obj instanceof spaceship) {
            consoleLog("No." + obj.id + 'spaceship has booooom!!!!!!');
            delete spaceships[obj.id];
        }
    };

    var receive = function(code) {
        var msg = DC().codeAdapter(code);
        DC().refreshMonitor(msg);
    };

    return {
        register: register,
        send: send,
        remove: remove,
        spaceships: spaceships,
        receive: receive
    }
};


//========================绑定按钮事件============================
$('#create-spaceship').click(function() { //一键上天按钮
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
    } else if (orbit === 'outside') {
        orbitId = 1;
    }
    //验证该轨道是否被占据
    if (bus.spaceships[orbitId]) {
        consoleLog('error, No.' + orbitId + ' spaceship has been launched');
        return false;
    }
    //如果选择完成，创建飞船
    var flySpeed = chooseEngine(engineVal).getFlySpeed();
    var consume = chooseEngine(engineVal).getConsume();
    var chargeSpeed = chooseChargeSource(chargeVal).getChargeSpeed();
    var newSpaceShip = new spaceship(orbitId, flySpeed, consume, chargeSpeed);
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
//=================================刷新状态显示框所用实例=====================
var spaceship0 = document.getElementById('no0');
var spaceship1 = document.getElementById('no1');
var no0Dynamic = spaceship0.getElementsByClassName('dynamic-manager')[0];
var no0Power = spaceship0.getElementsByClassName('power-manager')[0];
var no0State = spaceship0.getElementsByClassName('currstate')[0];
var no0Left = spaceship0.getElementsByClassName('power-left')[0];
var no1Dynamic = spaceship1.getElementsByClassName('dynamic-manager')[0];
var no1Power = spaceship1.getElementsByClassName('power-manager')[0];
var no1State = spaceship1.getElementsByClassName('currstate')[0];
var no1Left = spaceship1.getElementsByClassName('power-left')[0];

var resetMonitor = function(id) {
    if (id === 0) {
        no0Dynamic.innerHTML = '?';
        no0Power.innerHTML = '?';
        no0State.innerHTML = '?';
        no0Left.innerHTML = '?';
    } else if (id === 1) {
        no1Dynamic.innerHTML = '?';
        no1Power.innerHTML = '?';
        no1State.innerHTML = '?';
        no1Left.innerHTML = '?';
    }
};
//===================页面刷新时加载事件=================================
window.onload = function() {
    //拖拉框定位
    defaultPosition(document.getElementById('dialog'));
    //绘制
    var frontCanvas = document.getElementById('spaceship');
    frontCanvas.width = SCREEN_WIDTH;
    frontCanvas.height = SCREEN_HEIGHT;
    var context = frontCanvas.getContext('2d');
    (function spaceShipAnimation() {
        requestAnimFrame(spaceShipAnimation);
        checkSpaceShips(context, bus.spaceships);
    })();
};

var sirius = new commander();
var bus = new media();
bus.register(sirius);
