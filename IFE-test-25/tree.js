// =====================封装TreeNode============================
function TreeNode(obj) {
    this.parent = obj.parent;
    this.childs = obj.childs || [];
    this.data = obj.data || "";
    this.selfElement = obj.selfElement; //selfElement对应的是绑定操作的节点
    this.selfElement.TreeNode = this;
}
//原型模式封装公共操作
/* 
    sir: 石乐志一般的做法
*/
TreeNode.prototype = {
    constructor: TreeNode,
    mark: function () {
        var lastMarked = document.getElementsByClassName('marked')[0];
        if (lastMarked !== undefined) {
            lastMarked.className = 'to-mark';
            if (lastMarked == this.selfElement.getElementsByClassName('to-mark')[0]) {
                return;
            }
        }
        this.selfElement.getElementsByClassName('to-mark')[0].className = "marked";
    },
    //参数表示是否改变箭头，是否改变可见性，因此传入的都是布尔值
    render: function (arrow, visibility, found, clearFound) {
        if (arrow) {
            if (this.isEmpty()) { // 如果是文件节点是空节点
                this.selfElement.getElementsByClassName('arrow')[0].className = "arrow empty-arrow";
            } else if (this.isFolded()) { //如果节点是折叠状态，默认箭头（左）
                // this.selfElement.getElementsByClassName("node-header")[0].className = "node-header";
                this.selfElement.getElementsByClassName('arrow')[0].className = "arrow arrow-right";
                //否则，是展开状态（下箭头）
            } else {
                // this.selfElement.getElementsByClassName("node-header")[0].className = "node-header";
                this.selfElement.getElementsByClassName('arrow')[0].className = "arrow arrow-down";
            }
        }
        if (visibility) {
            if (this.selfElement.classList.contains('hidden')) { //本不可见，改为可见
                this.selfElement.classList.remove('hidden');
            } else { // 本可见，设为不可见
                this.selfElement.classList.add('hidden');
            }
        }
        if (found) {
            this.selfElement.getElementsByTagName('label')[0].classList.add('found');
        }
        if (clearFound) {
            if (this.selfElement.getElementsByTagName('label')[0].classList.contains('found')) {
                this.selfElement.getElementsByTagName('label')[0].classList.remove('found');
            }
        }
    },
    //判断节点子节点是否为空
    isEmpty: function () {
        return (this.childs.length == 0);
    },
    //判断是否为折叠状态
    isFolded: function () {
        if (this.childs[0].selfElement.className == "node-body") return false;
        return true;
    },
    //折叠展开功能
    toggleFold: function () {
        //对于每个子节点，不改变箭头，改变可见性
        if (this.isEmpty()) {
            return this;
        }
        for (var i = 0; i < this.childs.length; i++) {
            this.childs[i].render(false, true);
        }
        //渲染此节点的箭头
        this.render(true, false);
        return;
    },
    //添加文件夹
    addFile: function (name) {
        //name合法性验证
        if (name.trim() == "") {
            alert("文件名不能为空")
            return;
        }
        //若当前节点关闭，先展开
        //节点不为空且节点闭合，则展开
        if (!this.isEmpty() && this.isFolded()) {
            this.toggleFold();
        }
        //创建新文件夹
        var newFile = document.createElement('div');
        newFile.className = "node-body";
        newFile.innerHTML = "<label class='node-header'> <img class='arrow arrow-right' src='imgs/arrow.svg' /> <img class='folder' src='imgs/folder.svg' /> <span>" + name + "</span> <span>&nbsp;</span> <span>&nbsp;</span> <div class='to-mark'></div></label>";
        this.selfElement.appendChild(newFile);
        // 创建对应的TreeNode对象并添加到子节点队列
        this.childs.push(new TreeNode({
            parent: this,
            childs: [],
            data: name,
            selfElement: newFile
        }));
        this.render(true, false);
        this.childs[this.childs.length - 1].render(true, false);
        return this; // 返回自身，链式操作;
    },
    //添加文件
    addDocument: function (name) {
        //name合法性验证
        if (name.trim() == "") {
            alert("文件名不能为空")
            return;
        }
        //若当前节点关闭，先展开
        if (!this.isEmpty() && this.isFolded()) {
            this.toggleFold();
        }
        //创建新文件
        var newDocument = document.createElement('div');
        newDocument.className = "node-body";
        newDocument.innerHTML = "<label class='node'> <img class='file' src='imgs/file.svg' /> <span>" + name + "</span> <span>&nbsp;</span> <span>&nbsp;</span> <div class='to-mark'></div> </label>";
        this.selfElement.appendChild(newDocument);
        // 创建对应的TreeNode对象并将其添加到子节点队列
        this.childs.push(new TreeNode({
            parent: this,
            childs: [],
            data: name,
            selfElement: newDocument
        }));
        this.render(true, false);
        return this; // 返回自身，链式操作;
    },
}
console.log(TreeNode.prototype);
//==========================以上是对TreeNode的封装=====================
//===========================事件绑定区域===============================
//创建根节点对应的TreeNode对象
var root = new TreeNode({
    parent: null,
    childs: [],
    data: "",
    selfElement: document.getElementsByClassName("node-body")[0],
});
// 查创建按钮对象
var addFileBtn = document.getElementsByClassName('add-folder-btn')[0];
var addDocumentBtn = document.getElementsByClassName('add-file-btn')[0];
var searchBtn = document.getElementsByClassName('search-btn')[0];
var deleteBtn = document.getElementsByClassName('delete-btn')[0];

// 为root绑定事件代理，处理所有节点的点击事件
addEvent(root.selfElement, "click", function (e) {
    var target = e.target;
    var domNode = target;
    while (!domNode.classList.contains('node-body')) {
        domNode = domNode.parentNode; //若触发事件的对象并非 node-body,一层层往上渗透直到 node-body 为止
    }
    selectedNode = domNode.TreeNode; //获取 dom 对象对应的 TreeNode 对象
    //如果点击在箭头上
    if (target.classList.contains('arrow')) {
        selectedNode.toggleFold(); //将对应的节点进行展开（关闭）
    } else if (target.classList.contains('node-header') || target.classList.contains('node') || target.classList.contains('marked') || target.classList.contains('to-mark') || target.tagName === "span" || target.tagName === "SPAN") { //如果点击label区域
        while (target.classList.contains('marked') || target.classList.contains('to-mark') || target.tagName === "span" || target.tagName === "SPAN") { //当点击到的是label的子元素时
            target = target.parentNode;
        }
        var targetNode = target.parentNode.TreeNode;
        targetNode.mark();
    }
});

//节点搜索
root.search = function (query) {
    var resultList = [];
    var quque = [];
    var current = this;
    for (var i = 0; i < current.childs.length; i++) {
        quque.push(current.childs[i]);
    }
    while (quque.length > 0) {
        current = quque.shift();
        current.render(false, false, false, true)
        if (current.data === query) {
            resultList.push(current);
        }
        for (var i = 0; i < current.childs.length; i++) {
            quque.push(current.childs[i]);
        }
    }
    return resultList;
}
//左侧工具栏点击事件
addFileBtn.onclick = function () {
    var target = document.getElementsByClassName('marked')[0];
    if (target !== undefined) {
        if (target.parentNode.classList.contains === 'node') {
            alert('请选中文件夹');
            return;
        }
        var targetNode = target.parentNode.parentNode.TreeNode;
        targetNode.addFile(prompt("请输入添加的文件夹名称："));
    } else {
        root.addFile(prompt("请输入添加的文件夹名称："));
    }
}
addDocumentBtn.onclick = function () {
    var target = document.getElementsByClassName('marked')[0];
    if (target !== undefined) {
        if (target.parentNode.classList.contains === 'node') {
            alert('请选中文件夹');
            return;
        }
        var targetNode = target.parentNode.parentNode.TreeNode;
        targetNode.addDocument(prompt("请输入添加的文件名称："));
    } else {
        root.addDocument(prompt("请输入添加的文件名称："));
    }
}
deleteBtn.onclick = function () {
    var target = document.getElementsByClassName('marked')[0];
    if (target !== undefined) {
        var targetBody = target.parentNode.parentNode;
        targetBody.parentNode.removeChild(targetBody);
    } else {
        alert("目前无选中文件");
    }
}
searchBtn.onclick = function () {
    var text = prompt("请输入想搜索的文件名称：");
    if (text.trim() === "") {
        alert("请输入搜索内容┐(´д`)┌");
    }
    //执行搜索
    var resultList = root.search(text);
    //处理搜索结果
    if (resultList.length === 0) {
        alert("没有查询到符合条件的节点┐(´д`)┌");
    } else {
        var pathNode;
        for (var i = 0; i < resultList.length; i++) {
            pathNode = resultList[i];
            pathNode.render(false, false, true, false);
            while (pathNode.parent != null) {
                //如果这层节点被收束，则一层层展开
                if (pathNode.selfElement.classList.contains("hidden"))
                    pathNode.parent.toggleFold();
                pathNode = pathNode.parent;
            }
        }
    }
}
//==============================demo展示================================
//=====================动态生成demo树================
root.addFile('科幻（伪）作品');
root.childs[0].addFile('小说').addFile('电影').addFile('游戏');
root.childs[0].childs[0].addDocument('银河系漫游指南').addDocument('献给阿尔吉侬的花束').addDocument('三体');
root.childs[0].childs[1].addDocument('2001太空漫游').addFile('黑客帝国系列').addDocument('银翼杀手');
root.childs[0].childs[1].childs[1].addDocument('黑客帝国').addDocument('黑客帝国2：重装上阵').addDocument('黑客帝国3：矩阵革命');
root.childs[0].childs[2].addDocument('BIOSHOCK').addDocument('Life Is Strange');

//========跨浏览器兼容的工具函数=============
function addEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler);
    } else if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
}