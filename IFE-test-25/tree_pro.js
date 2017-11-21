'use strict';
let _ = {
    newEL(elType, className = '', option = {}) {
        let el = document.createElement(elType);
        el.className = className;
        
        for (let item of Object.keys(option)) {
            el[item] = option[item];
        }
        return el;
    },
}

// 文件类型
const file = Symbol('file');
const folder = Symbol('folder');

// 标记状态
const marked = Symbol('marked');
const toBeMarked = Symbol('toBeMarked');
const unmarked = Symbol('unmarked');

// 文件夹状态
const expanded = Symbol('expanded');
const collapsed = Symbol('collapsed');

// 基本节点
let Node = {
    _init(data, type) {
        this.data = data;
        this.type = type;
        this.markState = unmarked;
    },
    setParent(p) {
        if (Object.getPrototypeOf(p) === FolderNode) {
            this.parent = p;
        }
    },
    marked() {
        this.markState = marked;
    },
    toBeMarked() {
        this.markState = toBeMarked;
    },
    unmarked() {
        this.markState = unmarked;
    },
};

// 叶子节点
let FileNode = Object.create(Node);
Object.assign(FileNode, {
    build(data = '新文件') {
        this._init(data, file);
        this.parent = null;
    },
});

// 分支节点
let FolderNode = Object.create(Node);
Object.assign(FolderNode, {
    build(data = '新文件夹', childList = []) { // 初始化
        this._init(data, folder);
        this.parent = null;
        this.childList = [];
        this.expended = true;
        this.add(childList);
        this._contactChildList();
    },
    _contactChildList() { // 建立子节点与父节点的联系
        for (let child of this.childList) {
            child.setParent(this);
        }
    },
    isNode(f) { // 判断是否是节点
        let t = Object.getPrototypeOf(f);
        if (t === FileNode || t === FolderNode)
            return true;
        return false;
    },
    add(f) {
        let t = Object.getPrototypeOf(f);
        if (this.isNode(f)) // 单节点
            this.childList.push(f);
        else if (t === Array.prototype) { // 纯节点数组
            for (let item of f) {
                if (!isNode(item)) {
                    console.warn(`${item}不是有效的数据`);
                    continue;
                }
                this.childList.push(item);
            }
        } else {
            console.warn(`${t}不是有效的数据`);
            return;
        }
    },
    toggle() {
        this.expended = !this.expanded;
    }
});

let render = {
    [folder]: function(node) {
        let nodeBody = _.newEL('div', 'node-body');
        let nodeHeader = _.newEL('label', 'node-header');
        let arrBtn = _.newEL('img', 'arrow arrow-right', {src: './imgs/arrow.svg'});
        let folderImg = _.newEL('img', 'folder', {src: './imgs/folder.svg'});
        let nameEl = _.newEL('span', undefined, {textContent: node.data});
        let markEl = _.newEL('div', 'to-mark');

        nodeBody.appendChild(nodeHeader);
        nodeHeader.appendChild(arrBtn);
        nodeHeader.appendChild(folderImg);
        nodeHeader.appendChild(nameEl);
        nodeHeader.appendChild(markEl);
        
        arrBtn.addEventListener('click', node.toggle);
        
        for (let item of node.childList) {
            let childNodeBody = render[item.type](item);
            nodeBody.appendChild(childNodeBody);
        }

        return nodeBody;
    },
    [file]: function(node) {
        let nodeBody = _.newEL('div', 'node-body');
        let nodeContent = _.newEL('label', 'node');
        let fileImg = _.newEL('img', 'file', {src: './imgs/file.svg'});
        let nameEl = _.newEL('span', undefined, {textContent: node.data});
        let markEl = _.newEL('div', 'to-mark');

        nodeBody.appendChild(nodeContent);
        nodeContent.appendChild(fileImg);
        nodeContent.appendChild(nameEl);
        nodeContent.appendChild(markEl);

        return nodeBody;
    }
}

let root = Object.create(FolderNode);
root.build('科幻作品');
let folder1 = Object.create(FolderNode);
folder1.build('小说');
let child1 = Object.create(FileNode);
child1.build('银河帝国系列');

folder1.add(child1);
root.add(folder1);

let rootBody = render[folder](root);
let rootEl = document.querySelector('#js-root');
rootEl.appendChild(rootBody);