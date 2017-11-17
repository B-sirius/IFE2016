'use strict';
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

let Node = {
    init(parentNode = null, type = folder) {
        this.parentNode = parentNode;
        this.type = type;
        this.markState = unmarked;
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

let FileNode = Object.create(Node);

let FolderNode = Object.create(Node);
Object.assign(FolderNode, {
    build(parentNode = null, type = folder, childList = []) {
        this.init(parentNode, type);
        this.childList = childList;
        this.folderState = expanded;
    },
    expanded() {
        this.folderState = expanded;
    },
    collapsed() {
        this.folderState = collapsed;
    },
})


