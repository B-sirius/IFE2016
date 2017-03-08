'use strict'
//=================================获取相关按钮=======================
var switchBtns = document.getElementById('related-radio').getElementsByClassName('switch-btn');
var schoolContent = document.getElementById('school-wrap');
var companyContent = document.getElementById('company-wrap');
var parentSelect = document.getElementById('parent-select'); //联动选择器中的父级
var childrenSelect = document.getElementById('children-select'); //...的子级
//=================================功能性函数==========================
//获取select选中内容
var selectContent = function(select) {
    var index = select.selectedIndex;
    return select.options[index].value;
}

//===============================显示各输入的方法=====================
var showInputs = {
    school: function() {
        companyContent.className = 'hide';
        schoolContent.className = 'school-wrap';
    },
    company: function() {
        schoolContent.className = 'hide';
        companyContent.className = 'company-wrap';
    }
}

//============================单选框点击事件======================
for (var i = 0; i < switchBtns.length; i++) {
    (function(e) {
        switchBtns[e].onclick = function() {
            if (switchBtns[e].checked) {
                switch (switchBtns[e].value) {
                    case 'student': showInputs.school(); break;
                    case 'notStudent': showInputs.company(); break;
                    default: console.log('选项卡切换错误');
                }
            }
        }
    })(i)
}

//==========================从数据中通过数据组成父表单和子表单=================
var fillParentSelect = function(select, list) {
    for (var i = 0; i < list.length; i++) {
        select.innerHTML += "<option value=" + list[i].parent + ">" + list[i].parent + "</option>";
    }
}

var fillChildrenSelect = function(select, list, parentContent) {
    select.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
        if (list[i].parent === parentContent) {
            for (var j = 0; j < list[i].children.length; j++) {
                select.innerHTML += "<option value=" + list[i].children[j] + ">" + list[i].children[j] + "</option>";
            }
            return false; //一旦匹配成功，停止继续匹配
        }
    }
}



//==========================表单联动事件============================
parentSelect.onchange = function() {
    var content = selectContent(parentSelect);
    fillChildrenSelect(childrenSelect, SchoolList, content);
}


//==========================下拉菜单联动=============================
var SchoolList = [
    {
        parent: '魔都',
        children: [
            '孵蛋大学',
            '膜法交易大学',
            '膜法菜鸡大学'
        ]
    },
    {
        parent: '妖都',
        children: [
            '妖姬大学',
            '不知名大学',
            '药丸大学'
        ]
    },
    {
        parent: '帝都',
        children: [
            '帝都大学',
            '清华帝都大学',
            '帝都师范大学'
        ]
    }
];

//加载项
window.onload = function() {
    fillParentSelect(parentSelect, SchoolList);
    fillChildrenSelect(childrenSelect, SchoolList, SchoolList[0].parent);
}
