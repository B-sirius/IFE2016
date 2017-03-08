'use strict';

var g = function(id) {
		return document.getElementById(id);
	}
	//===========================配置表单的选项切换====================
var inputTypeSelectBtn = g('input-type-select');
var formSetBox = g('form-set');
//获得各个配置项的实例对象
var setTypes = {
		'radio': g('radio-set-box'),
		'checkbox': g('checkbox-set-box'),
		'select': g('select-set-box'),
		'text': g('text-set-box'),
		'textarea': g('textarea-set-box')
	}
	//获得下拉框选中的value值
var getSelectContent = function(select) {
	var index = select.selectedIndex;
	return select.options[index].value;
}

var currSelectedType = getSelectContent(inputTypeSelectBtn); //当前配置框选中内容

//依据下拉框文字改变类型的托管函数
var changeType = function(type) {
		showSetBox(type);
	}
	//改变内容
var showSetBox = function(type) {
		for (var key in setTypes) {
			setTypes[key].style.display = 'none';
		}
		setTypes[type].style.display = 'block';
	}
	//配置表单的下拉框切换时
inputTypeSelectBtn.onchange = function() {
	currSelectedType = getSelectContent(inputTypeSelectBtn);
	changeType(currSelectedType);
}

//========================配置项选项添加以及删除功能==========================
//option对象
var Option = function(type, value, deleteBtn, selfElement) {
	this.type = type;
	this.value = value;
	this.deleteBtn = deleteBtn;
	this.deleteBtn.self = this;
	this.selfElement = selfElement;
	this.selfElement.self = this;
}

var options = []; //存放所有的选项

//获得添加选项按钮的实例对象
var addOptionsBtns = {
	'radio': setTypes['radio'].getElementsByClassName('add-btn')[0],
	'checkbox': setTypes['checkbox'].getElementsByClassName('add-btn')[0],
	'select': setTypes['select'].getElementsByClassName('add-btn')[0],
}

var addOptionsInputs = {
	'radio': setTypes['radio'].getElementsByClassName('add-option')[0],
	'checkbox': setTypes['checkbox'].getElementsByClassName('add-option')[0],
	'select': setTypes['select'].getElementsByClassName('add-option')[0],
}

var addOption = function(setTypes, key, value) {
	var type = key;
	var optionsWrap = setTypes.getElementsByClassName('options-wrap')[0];
	var optionWrap = document.createElement('div');
	optionWrap.className = 'option-wrap';
	optionWrap.innerHTML = '<div class="delete-mask">删除</div> <span class="option-set">' + value + '</span>';
	optionsWrap.appendChild(optionWrap);
	var deleteBtn = optionWrap.getElementsByClassName('delete-mask')[0];
	var selfElement = optionWrap;
	var option = new Option(type, value, deleteBtn, selfElement);
	options.push(option);
	deleteBtn.addEventListener('click', function() {
		deleteOption(deleteBtn);
	});
}

//删除单个按钮的操作
var deleteOption = function(btn) {
	for (var i = 0; i < options.length; i++) {
		if (options[i] === btn.self) { //会删除遇到的第一个匹配选项
			options.splice(i, 1);
			break;
		}
	}
	btn.self.selfElement.parentNode.removeChild(btn.self.selfElement);
	delete btn.self;
}

//为按钮捆绑事件以及为输入框绑定回车确认事件
for (var key in addOptionsBtns) {
	(function(e) {
		//添加选项
		addOptionsBtns[e].onclick = function() {
			var value = setTypes[e].getElementsByClassName('add-option')[0].value
			if (value.replace(/\s + /g, '') === '') {
				return false;
			}
			addOption(setTypes[e], e, value);
			setTypes[e].getElementsByClassName('add-option')[0].value = '';
			window.scrollTo(0, document.body.scrollHeight);
		}
	})(key)
}
for (var key in addOptionsInputs) {
	(function(e) {
		addOptionsInputs[e].addEventListener('keyup', function() {
			if (event.keyCode === 13) {
				addOptionsBtns[e].click();
			}
		});
	})(key)
}

//======================点击添加问题按钮，添加问题===================
var form = g('form');
var addQuestionBtn = g('submit-btn');

addQuestionBtn.onclick = function() {
	var isOptions;
	var questionText = setTypes[currSelectedType].getElementsByClassName('set-question')[0].value;
	if (currSelectedType === 'radio' || currSelectedType === 'checkbox' || currSelectedType === 'select') {
		isOptions = 'haveOptions';
	} else {
		isOptions = 'noOptions';
	}
	if (questionReady[isOptions](questionText)) {
		renderQuestion(questionData(questionText));
		resetSetBox();
		moveSetBox();
		window.scrollTo(0, document.body.scrollHeight);
	}
}

var questionReady = {
	'haveOptions': function(questionText) {
		if (questionText.replace(/\s + /g, '') !== '') { //此处检验时去掉了文本的所有空格，确保不是只有空格
			for (var i = 0; i < options.length; i++) {
				if (options[i].type === currSelectedType) {
					return true;
				}
			}
		}
		return false;
	},
	'noOptions': function(questionText) {
		if (questionText.replace(/\s + /g, '') !== '') {
			return true;
		}
		return false;
	}
}

var questionData = function(questionText) {
	var optionsValue = [];
	for (var i = 0; i < options.length; i++) {
		if (options[i].type === currSelectedType) {
			optionsValue.push(options[i].value);
		}
	}
	var data = {
		type: currSelectedType,
		questionValue: questionText,
		optionsValue: optionsValue
	};
	return data;
}

var renderQuestion = function(data) {
	var questionBox = document.createElement('div');
	questionBox.className = 'question-wrap ' + data.type + '-type';
	var date = Date.now();
	switch (data.type) {
		case 'radio':
		case 'checkbox':
			(function() {
				var optionsBox = "<div class='options-box'>";
				for (var i = 0; i < data.optionsValue.length; i++) {
					optionsBox += "<div class='option'> <input class=" + data.type + " type=" + data.type + " name=" + date + " value=" + data.optionsValue[i] + ">" + data.optionsValue[i] + "</div>";
				}
				optionsBox += "</div>";
				questionBox.innerHTML = "<div class='question'> <span>" + data.questionValue + "</span> </div>" + optionsBox;
				form.appendChild(questionBox);
			})();
			break;
		case 'select':
			(function() {
				var selectBox = "<div class='select-box'> <select class='select' name=" + date + ">";
				for (var i = 0; i < data.optionsValue.length; i++) {
					selectBox += "<option>" + data.optionsValue[i] + "</option>";
				}
				selectBox += "</select> </div>";
				questionBox.innerHTML = "<div class='question'> <span>" + data.questionValue + "</span> </div>" + selectBox;
				form.appendChild(questionBox);
			})()
			break;
		case 'text':
			(function() {
				var textBox = "<div class='input-box'> <input class='input' type='text' name=" + date + " value=''> </div>";
				questionBox.innerHTML = "<div class='question'> <span>" + data.questionValue + "</span> </div>" + textBox;
				form.appendChild(questionBox);
			})()
			break;
		case 'textarea':
			(function() {
				var textareaBox = "<div class='textarea-box'> <textarea class='textarea' name=" + date + "></textarea> </div>";
				questionBox.innerHTML = "<div class='question'> <span>" + data.questionValue + "</span> </div>" + textareaBox;
				form.appendChild(questionBox);
			})()
			break;
		default:
			console.log('表单生成失败');
	}
}

var resetSetBox = function() {
		for (var key in setTypes) {
			var input = setTypes[key].getElementsByClassName('set-question')[0];
			input.value = '';
		}
		for (var i = options.length - 1; i >= 0; i--) {
			deleteOption(options[i].deleteBtn);
		}
	}
	//添加选项后移动配置框位置
var formBox = g('form-box');
var moveSetBox = function() {
	var questionElements = formBox.getElementsByClassName('question-wrap');
	var topPosition = formBox.offsetHeight - questionElements[questionElements.length - 1].offsetHeight;
	startMove(formSetBox, topPosition, 10);
}

//缓动动画
var timer = null;
var startMove = function(element, target, interval) {
	clearInterval(timer);
	timer = setInterval(function() {
		var speed = (target - element.offsetTop) / 10;
		speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //防止速度为负或小叔而产生bug
		if (element.offsetTop === target) {
			clearInterval(timer);
		} else {
			element.style.top = element.offsetTop + speed + 'px';
		}
	}, interval)
}

window.onload = function() {
	showSetBox(getSelectContent(inputTypeSelectBtn));
}