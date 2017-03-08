'use strict';
//获取表单对象
var registerForm = document.getElementById('register-form');

//=======================信息提示栏=========================
var alertMsg = {
    correct: function(obj, msg) {
        obj.innerHTML = '<span class="correct">' + msg + '</span>';
    },

    wrong: function(obj,msg) {
        obj.innerHTML = '<span class="wrong">' + msg + '</span>';
    },
    tip: function(obj, msg) {
        obj.innerHTML = '<span class="tip">' + msg + '</span>';
    }
}

//=========================处理方法=====================
var strategies = {
    alertTip: function(obj, tip) {
        alertMsg.tip(obj, tip);
    },
    checkName: function(key, obj, value, correctMsg, wrongMsg) {
        var reg = new RegExp('^[a-zA-Z0-9_]{5,17}$');
        if (value.length < 4 || value.length > 16 || !reg.test(value)) {
            alertMsg.wrong(obj, wrongMsg);
            registerInputs[key].isPassed = false;
            return false;
        }
        alertMsg.correct(obj, correctMsg);
        registerInputs[key].isPassed = true;
    },
    checkPassword: function(key, obj, value, correctMsg, wrongMsg) {
        if (value.length < 4) {
            alertMsg.wrong(obj, wrongMsg);
            registerInputs[key].isPassed = false;
            return false;
        }
        alertMsg.correct(obj, correctMsg);
        registerInputs[key].isPassed = true;

    },
    checkConfirmPassword: function(key, obj, value, correctMsg, wrongMsg1, wrongMsg2) {
        if(value !== registerForm.password.value) {
            alertMsg.wrong(obj, wrongMsg1);
            registerInputs[key].isPassed = false;

            return false;
        }
        if (value.length === 0) {
            alertMsg.wrong(obj, wrongMsg2);
            registerInputs[key].isPassed = false;
            return false;
        }
        alertMsg.correct(obj, correctMsg);
        registerInputs[key].isPassed = true;
    },
    checkEmail: function(key, obj, value, correctMsg, wrongMsg) {
        var reg = new RegExp('^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$');
        if (!reg.test(value) || value.length === 0) {
            alertMsg.wrong(obj, wrongMsg);
            registerInputs[key].isPassed = false;
            return false;
        }
        alertMsg.correct(obj, correctMsg);
        registerInputs[key].isPassed = true;
    },
    checkPhone: function(key, obj, value, correctMsg, wrongMsg) {
        var reg = new RegExp('^(1[0-9]{10})$');
        if (!reg.test(value) || value.length === 0) {
            alertMsg.wrong(obj, wrongMsg);
            registerInputs[key].isPassed = false;
            return false;
        }
        alertMsg.correct(obj, correctMsg);
        registerInputs[key].isPassed = true;
    }
}
//=======================对于不同输入框事件的委托器=========================
var inputCheckHandler = {
    'userName': function(obj, value) {
        var correctMsg = '名称可以使用';
        var wrongMsg = '名称为4-16个英文或下划线字符';
        strategies.checkName('userName', obj, value, correctMsg, wrongMsg);
    },
    'password': function(obj, value) {
        var correctMsg = '密码可以使用';
        var wrongMsg = '密码不得少于4位';
        strategies.checkPassword('password', obj, value, correctMsg, wrongMsg);
    },
    'confirmPassword': function(obj, value) {
        var correctMsg = '两次输入一致';
        var wrongMsg1 = '两次输入不一致';
        var wrongMsg2 = '密码不能为空';
        strategies.checkConfirmPassword('confirmPassword', obj, value, correctMsg, wrongMsg1, wrongMsg2);
    },
    'email' : function(obj, value) {
        var correctMsg = '邮箱地址有效';
        var wrongMsg = '邮箱地址错误';
        strategies.checkEmail('email', obj, value, correctMsg, wrongMsg);
    },
    'phone' : function(obj, value) {
        var correctMsg = '手机号有效';
        var wrongMsg = '手机号错误';
        strategies.checkPhone('phone', obj, value, correctMsg, wrongMsg);
    },
};

var inputTipHandler = {
    'userName': function(obj) {
        var tip = '4-16个英文或下划线字符';
        strategies.alertTip(obj, tip);
    },
    'password': function(obj) {
        var tip = '不得少于4位';
        strategies.alertTip(obj, tip);
    },
    'confirmPassword': function(obj) {
        var tip = '请确认密码';
        strategies.alertTip(obj, tip);
    },
    'email': function(obj) {
        var tip = '请输入邮箱地址';
        strategies.alertTip(obj, tip);
    },
    'phone': function(obj) {
        var tip = '请输入手机号';
        strategies.alertTip(obj, tip);
    }
};

//=======================输入框组=========================
var registerInputs = {
    'userName': registerForm.userName,
    'password': registerForm.password,
    'confirmPassword': registerForm.confirmPassword,
    'email': registerForm.email,
    'phone': registerForm.phone
}

//=======================针对单个表单项的事件======================
var makeCheckCallBack = function(key, obj) {
    return function() {
        var value = registerInputs[key].value;
        inputCheckHandler[key](obj, value);
    }
};

var makeTipCallBack = function(key, obj) {
    return function() {
        inputTipHandler[key](obj);
    }
};

for (var key in registerInputs) {
    var obj = registerInputs[key].parentNode.getElementsByClassName('warn')[0];
    registerInputs[key].onblur = makeCheckCallBack(key, obj);
    registerInputs[key].onfocus = makeTipCallBack(key, obj);
}

//===================注册按钮点击事件=====================
var registerBtn = document.getElementById('register-btn');

registerBtn.onclick = function() {
    var isPassed = true;
    for (var key in registerInputs) {
        var obj = registerInputs[key].parentNode.getElementsByClassName('warn')[0];
        var value = registerInputs[key].value;
        inputCheckHandler[key](obj, value);
        if (!registerInputs[key].isPassed) {
            isPassed = false;
        }
    }
    if (!isPassed) {
        alert('请正确填写信息');
        return false;
    }
    alert('提交成功');
    return true;
}
