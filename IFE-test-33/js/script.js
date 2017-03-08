'use strict';
var g = function(id) {
    return document.getElementById(id);
}

//==========================svg框线图绘制=====================
//一个框的宽高
var RECT_WIDTH = 36;
var RECT_HEIGHT = 36;
//横纵轴上的框框个数
var RECT_X_NUM = 20;
var RECT_Y_NUM = 20;

var GLOBAL = {};

var svg = g('svg');
var xAxis = g('x-axis');
var yAxis = g('y-axis');var renderMap = function() {
    var boxsHTML = '';
    var xAxisHTML = '';
    var yAxisHTML = '';
    for (var i = 0; i < RECT_X_NUM; i++) {
        xAxisHTML += "<span>" + (i + 1) + "</span>";
        for (var j = 0; j < RECT_Y_NUM; j++) {
            boxsHTML += "<rect x=" + i * RECT_WIDTH + " y=" + j * RECT_HEIGHT + " width=" + RECT_WIDTH + " height=" + RECT_HEIGHT + " stroke='#36cf3c' stroke-width='1' stroke-opacity='0.8' fill='#36cf3c' fill-opacity='0'></rect> ";
        }
    }
    for (var i = 0; i < RECT_Y_NUM; i++) {
        yAxisHTML += "<span>" + (i + 1) + "</span>";
    }
    svg.innerHTML = boxsHTML;
    xAxis.innerHTML = xAxisHTML;
    yAxis.innerHTML = yAxisHTML;
}

//=====================svg运动方块对象===================
var robotWrap = g('robot-wrap');
var Robot = function(x, y, angle, url) {
    this.position_x = x;
    this.position_y = y;
    this.angle = angle;
    this.url = url;
}

Robot.prototype.create = function() {
    var robotImg = new Image();
    robotImg.src = this.url;
    var left = (this.position_x - 1) * RECT_WIDTH;
    var top = (this.position_y - 1) * RECT_HEIGHT;
    robotImg.className = 'robot';
    robotImg.style.padding = '2px';
    robotImg.style.left = left + 'px';
    robotImg.style.top = top + 'px';
    robotImg.style.transform = 'rotate(' + this.angle + 'deg)';
    robotWrap.appendChild(robotImg);
    this.selfElement = robotImg;
    robotImg.self = this;
}

Robot.prototype.changeDirection = function(angle) {
    this.angle += angle;
    this.selfElement.style.transform = 'rotate(' + this.angle + 'deg)';
}

Robot.prototype.moveForward = function(stepLen) {
    var toPosition_x = this.position_x; //用于比较预定要移动到的位置是否合法
    var toPosition_y = this.position_y;
    var pre_x,pre_y;
    for (var i = 0; i < stepLen; i++) {
        pre_x = toPosition_x;
        pre_y = toPosition_y;
        toPosition_x += Math.round(1 * Math.sin(this.angle / 180 * Math.PI));
        toPosition_y -= Math.round(1 * Math.cos(this.angle / 180 * Math.PI));
        if (this.hitWall(toPosition_x, toPosition_y)) {
            this.renderMove(pre_x, pre_y);
            return false;
        }
    }
    this.renderMove(toPosition_x, toPosition_y);
}

//平移，方向不改变
Robot.prototype.traMove = function(direction, stepLen) {
    var toPosition_x = this.position_x; //用于比较预定要移动到的位置是否合法
    var toPosition_y = this.position_y;
    var pre_x,pre_y;

    for (var i = 0; i < stepLen; i++)
    {
        pre_x = toPosition_x;
        pre_y = toPosition_y;
        switch (direction) {
            case 'top':
                toPosition_y -= 1;
                break;
            case 'bottom':
                toPosition_y += 1;
                break;
            case 'left':
                toPosition_x -= 1;
                break;
            case 'right':
                toPosition_x += 1;
                break;
            default:
                console.log('平移发生错误');
        }
        if (this.hitWall(toPosition_x, toPosition_y)) {
            this.renderMove(pre_x, pre_y);
            return false;
        }
    }
    this.renderMove(toPosition_x, toPosition_y);
}

Robot.prototype.renderMove = function(x, y) {
    this.position_x = x;
    this.position_y = y;
    var left = (this.position_x - 1) * RECT_WIDTH;
    var top = (this.position_y - 1) * RECT_HEIGHT;
    this.selfElement.style.left = left + 'px';
    this.selfElement.style.top = top + 'px';
}

Robot.prototype.hitWall = function(x, y) {
    if (x < 1 || x > 20 || y < 1 || y > 20) { //边界检查
        return true;
    }
    for (var i = 0; i < GLOBAL.wallList.length; i++) {
        if (x === GLOBAL.wallList[i].x && y === GLOBAL.wallList[i].y) {
            return true;
        }
    }
    return false;
}

//=====================对网格每个小方块进行注册以及方法构建=========================
GLOBAL.blockList = [];
GLOBAL.wallList = [];
GLOBAL.openList = [];
GLOBAL.closedList = [];
GLOBAL.getPath = false;

var Block = function(x, y, selfElement) {
    this.x = x;
    this.y = y;
    this.isWall = false;
    this.open = false; //是否为待检查状态
    this.closed = false; //是否已经检查
    this.selfElement = selfElement;
    this.selfElement.self = this;
    this.G = 0;
}
Block.prototype.turnWall = function() {
    this.isWall = true;
    this.selfElement.setAttribute('fill-opacity', '1');
    GLOBAL.wallList.push(this);
}
Block.prototype.turnPath = function() {
    this.isWall = false;
    this.selfElement.setAttribute('fill-opacity', '0');
    for (var i = 0; i < GLOBAL.wallList.length; i++) {
        if (this.id === GLOBAL.wallList[i].id) {
            GLOBAL.wallList.splice(i, 1);
        }
    }
}
Block.prototype.getH = function(targetX, targetY) {
    return (Math.abs(this.x - targetX) + Math.abs(this.y - targetY));
}
Block.prototype.checkBlock = function(childNode, targetX, targetY) {
    if (childNode && !childNode.isWall && !childNode.closed) {
        childNode.H = childNode.getH(targetX, targetY);
        if (childNode.open) {
            if (this.G + 1 < childNode.G) {
                childNode.parentNode = this;
                childNode.G = this.G + 1;
            }
        } else {
            childNode.parentNode = this;
            childNode.G = this.G + 1;
            childNode.F = childNode.H + childNode.G;
            GLOBAL.openList.push(childNode);
        }
        if (childNode.x === targetX && childNode.y === targetY) {
            GLOBAL.getPath = true;
            renderPath(childNode);
        }
    }
}
Block.prototype.checkNeighbors = function(targetX, targetY) {
    this.checkBlock(GLOBAL.blockList[this.x-1][this.y], targetX, targetY);
    this.checkBlock(GLOBAL.blockList[this.x+1][this.y], targetX, targetY);
    this.checkBlock(GLOBAL.blockList[this.x][this.y-1], targetX, targetY);
    this.checkBlock(GLOBAL.blockList[this.x][this.y+1], targetX, targetY);
}
Block.prototype.findPath = function(targetX, targetY) {
    GLOBAL.openList.splice(getIndex(this, GLOBAL.openList), 1);
    this.open = false;
    this.closed = true;
    this.checkNeighbors(targetX, targetY);
    GLOBAL.closedList.push(this);
    if (GLOBAL.openList.length === 0 || GLOBAL.getPath) {
        return;
    }
    var j = GLOBAL.openList.length - 1;
    for (var i = GLOBAL.openList.length - 2; i >= 0; i--) {
        if (GLOBAL.openList[i].F < GLOBAL.openList[j].F) {
            j = i;
        }
    }
    GLOBAL.openList[j].findPath(targetX, targetY);
}

var renderPath = function(target) {
    if(target.parentNode) {
        target.parentNode.selfElement.setAttribute('fill-opacity', '0.5');
        renderPath(target.parentNode);
    }
    return true;
}

var registerBlocks = function() {
    var blockElements = svg.getElementsByTagName('rect');
    for (var i = 0; i <= RECT_X_NUM; i++) {
        GLOBAL.blockList[i] = [];
    }
    for (var i = 0; i < blockElements.length; i++) {
        var x = blockElements[i].getBBox().x / blockElements[i].getBBox().width + 1;
        var y = blockElements[i].getBBox().y / blockElements[i].getBBox().height + 1;
        var block = new Block(x, y, blockElements[i]);
        block.selfElement.addEventListener('click', function() {
            if (this.self.isWall) {
                this.self.turnPath();
            }else {
                this.self.turnWall();
            }
        });
        GLOBAL.blockList[x][y] = block;
    };
}

var getIndex = function(obj, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (obj === arr[i]) {
            return i;
        }
    }
    return;
}


//============================控制台===============================
GLOBAL.editor = {};
GLOBAL.editor.CommandList = [
    {
        test: function(command) {
            return /GO( \d*)?/.test(command.toUpperCase());
        },
        run: function(command) {
            var steps = parseInt(command.toUpperCase().split(" ")[1]) || 1; //如果go后无匹配条件，不存在count,返回 1,
            if (!isNaN(steps)) {
                sirius.moveForward(steps);
            } else {
                console.log('error with Go');
                return false;
            }
        }
    },
    {
        test: function(command) {
            return /TUN (LEF|TOP|RIG|BOT)/.test(command.toUpperCase());
        },
        run: function(command) {
            var matchGroup = command.toUpperCase().split(" ");
            var direction = matchGroup[1];
            switch (direction) {
                case 'LEF':
                    sirius.changeDirection(-90);
                    break;
                case 'TOP':
                    sirius.changeDirection(0);

                    break;
                case 'RIG':
                    sirius.changeDirection(90);
                    break;
                case 'BOT':
                    sirius.changeDirection(180);
                    break;
                default:
                    console.log('error with traMove');
                    return false;
            }
        }
    },
    {
        test: function(command) {
            return /TRA (LEF|TOP|RIG|BOT)(\d*)/.test(command.toUpperCase());
        },
        run: function(command) {
            var matchGroup = command.toUpperCase().split(" ");
            var direction = matchGroup[1];
            var steps = parseInt(matchGroup[2]) || 1;
            if (!isNaN(steps)) {
                switch (direction) {
                    case 'LEF':
                        sirius.traMove('left', steps);
                        break;
                    case 'TOP':
                        sirius.traMove('top', steps);
                        break;
                    case 'RIG':
                        sirius.traMove('right', steps);
                        break;
                    case 'BOT':
                        sirius.traMove('bottom', steps);
                        break;
                    default:
                        console.log('error with traMove');
                        return false;
                }
            } else {
                console.log('error with traMove');
                return false;
            }
        }
    },
    {
        test: function(command) {
            return /MOV (LEF|TOP|RIG|BOT)( \d*)?/.test(command.toUpperCase());
        },
        run: function(command) {
            var matchGroup = command.toUpperCase().split(" ");
            var direction = matchGroup[1];
            var steps = parseInt(matchGroup[2]) || 1;
            if (!isNaN(steps)) {
                switch (direction) {
                    case 'LEF':
                        directionStrategis['left'](sirius);
                        sirius.moveForward(steps);
                        break;
                    case 'TOP':
                        directionStrategis['top'](sirius);
                        sirius.moveForward(steps);
                        break;
                    case 'RIG':
                        directionStrategis['right'](sirius);
                        sirius.moveForward(steps);
                        break;
                    case 'BOT':
                        directionStrategis['bottom'](sirius);
                        sirius.moveForward(steps);
                        break;
                    default:
                        console.log('error with Move');
                        return false;
                }
            } else {
                console.log('error with Move');
                return false;
            }
        }
    },
    {
        test: function(command) {
            return /MOVTO/.test(command.toUpperCase());
        },
        run: function(command) {
            var matchGroup = command.toUpperCase().split(" ");
            var targetX = parseInt(matchGroup[1].split(",")[0]);
            var targetY = parseInt(matchGroup[1].split(",")[1]);
            var startBlock = GLOBAL.blockList[sirius.position_x][sirius.position_y];
            if (startBlock.isWall === true) {
                return false;
            }
            for (var i = 0; i < GLOBAL.openList.length; i++) {
                GLOBAL.openList[i].open = false;
            }
            GLOBAL.openList = [];
            for (var i = 0; i < GLOBAL.closedList.length; i++) {
                if (GLOBAL.closedList[i].isWall) {
                    GLOBAL.closedList[i].selfElement.setAttribute('fill-opacity', '1');
                } else {
                    GLOBAL.closedList[i].selfElement.setAttribute('fill-opacity', '0');
                }
                GLOBAL.closedList[i].closed = false;
            }
            GLOBAL.closedList = [];
            GLOBAL.openList.push(startBlock);
            GLOBAL.getPath = false;
            startBlock.findPath(targetX, targetY);
        }
    }
]
GLOBAL.editor.commands = [];

//元素旋转的托管函数
var directionStrategis = {
    'left': function(element) {
        element.changeDirection(-90);
    },
    'right': function(element) {
        element.changeDirection(90);
    },
    'bottom': function(element) {
        element.changeDirection(180);
    },
    'top': function(element) {
        element.changeDirection(0);
    }
}

var runCommands = function() {
    if (GLOBAL.editor.commands) {
        var command = GLOBAL.editor.commands.shift();
        for (var i = 0; i < GLOBAL.editor.CommandList.length; i++) {
            if (GLOBAL.editor.CommandList[i].test(command)) {
                GLOBAL.editor.CommandList[i].run(command);
            }
        }
        if (GLOBAL.editor.commands.length !== 0) {
            setTimeout(function() {
                runCommands(GLOBAL.editor.commands);
            }, 1000);
        }
    }
}

//输入框具体操作部分
var editor = g('editor');
var startBtn = g('start');
var resetBtn = g('reset');

startBtn.onclick = function() {
    if (GLOBAL.editor.commands.length) { //在上一次运行的指令全部执行完之前，禁止下一次运行
        return false;
    }
    GLOBAL.editor.commands = editor.value.split('\n');
    runCommands();
}
resetBtn.onclick = function() {
    editor.value = '';
}

var sirius = new Robot(1, 1, 0, 'img/robot.svg');
sirius.create();

window.onload = function() {
    renderMap();
    registerBlocks();
    var defaultCommands = 'mov rig 9\ntra bot 6\ntun rig\ngo 4';
    editor.value = defaultCommands;
    //键盘操作
    document.addEventListener('keydown', function(e) {
        if (document.activeElement === editor) {
            return false;
        }
        switch (e.keyCode) {
            case 37:
                directionStrategis['left'](sirius);
                break;
            case 38:
                directionStrategis['top'](sirius);
                sirius.moveForward(1);
                break;
            case 39:
                directionStrategis['right'](sirius);
                break;
            case 40:
                directionStrategis['bottom'](sirius);
                break;
            default:
                return false;
        }
    });
}
