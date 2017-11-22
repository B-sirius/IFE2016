'use strict';
const _ = {
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

// 文件夹状态
const expanded = Symbol('expanded');
const collapsed = Symbol('collapsed');

// 基本节点
const Node = {
    _init(data, type) {
        this.data = data;
        this.type = type;
        this.marked = false;
    },
    toggleMark() {
        this.marked = !this.marked;
    },
};

// 叶子节点
const FileNode = Object.create(Node);
Object.assign(FileNode, {
    build(data = '新文件') {
        this._init(data, file);
        this.nodeEls = null;
    },
    setNodeEls({
        nodeBodyEl,
        markBtn,
        markEl
    }) {
        this.nodeEls = {
            nodeBodyEl,
            markBtn,
            markEl
        }
    }
});

// 分支节点
const FolderNode = Object.create(Node);
Object.assign(FolderNode, {
    build(data = '新文件夹', childList = []) { // 初始化
        this._init(data, folder);
        this.childList = [];
        this.expanded = true;
        this.nodeEls = null;
        this.add(childList);
    },
    search(compareFn) {
        const quque = [this];

        while (quque.length) {
            let current = quque.pop();

            if (compareFn(current))
                return current;

            if (current.childList) {
                for (let item of current.childList)
                    quque.push(item);
            }
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
    setNodeEls({
        nodeBodyEl,
        markBtn,
        markEl,
        switchBtn
    }) {
        this.nodeEls = {
            nodeBodyEl,
            markBtn,
            markEl,
            switchBtn
        }
    },
    toggleExpand() {
        this.expanded = !this.expanded;
    },
});

const render = {
    [folder]: function (node) {
        let nodeBody = _.newEL('div', 'node-body');
        let nodeHeader = _.newEL('label', 'node-header');
        let arrBtn = _.newEL('a', 'arrow arrow-down', {
            href: 'javascript:'
        });
        let folderImg = _.newEL('img', 'folder', {
            src: './imgs/folder.svg'
        });
        let nameEl = _.newEL('span', undefined, {
            textContent: node.data
        });
        let markEl = _.newEL('div', 'mark');

        nodeBody.appendChild(nodeHeader);
        nodeHeader.appendChild(arrBtn);
        nodeHeader.appendChild(folderImg);
        nodeHeader.appendChild(nameEl);
        nodeHeader.appendChild(markEl);

        // 与状态切换直接相关的元素
        let nodeEls = {
            nodeBodyEl: nodeBody,
            switchBtn: arrBtn,
            markBtn: nodeHeader,
            markEl: markEl,
        }
        // 与节点关联
        node.setNodeEls(nodeEls);

        for (let item of node.childList) {
            let childNodeBody = render[item.type](item);

            nodeBody.appendChild(childNodeBody);
        }

        nodeEls.switchBtn.addEventListener('click', () => {
            nodeController.toggleExpand(node);
        });

        nodeEls.markBtn.addEventListener('click', (e) => {
            // 如果点击的是箭头
            if (e.target === nodeEls.switchBtn)
                return;

            let lastMarkedNode = nodeController.getLastMarkedNode();
            if (lastMarkedNode !== null) {
                nodeController.toggleMark(lastMarkedNode);
                // 重复点击自身
                if (lastMarkedNode === node) {
                    nodeController.setLastMarkedNode(null);
                    return;
                }
            }

            nodeController.toggleMark(node);
            nodeController.setLastMarkedNode(node);
        });

        return nodeBody;
    },
    [file]: function (node) {
        let nodeBody = _.newEL('div', 'node-body');
        let nodeContent = _.newEL('label', 'node');
        let fileImg = _.newEL('img', 'file', {
            src: './imgs/file.svg'
        });
        let nameEl = _.newEL('span', undefined, {
            textContent: node.data
        });
        let markEl = _.newEL('div', 'mark');

        // 与状态切换直接相关的元素
        let nodeEls = {
            nodeBodyEl: nodeBody,
            markBtn: nodeContent,
            markEl: markEl,
        }
        // 与节点关联
        node.setNodeEls(nodeEls);

        nodeBody.appendChild(nodeContent);
        nodeContent.appendChild(fileImg);
        nodeContent.appendChild(nameEl);
        nodeContent.appendChild(markEl);

        nodeEls.markBtn.addEventListener('click', () => {
            let lastMarkedNode = nodeController.getLastMarkedNode();
            if (lastMarkedNode !== null) {
                nodeController.toggleMark(lastMarkedNode);
                // 重复点击自身
                if (lastMarkedNode === node) {
                    nodeController.setLastMarkedNode(null);
                    return;
                }
            }

            nodeController.toggleMark(node);
            nodeController.setLastMarkedNode(node);
        });

        return nodeBody;
    }
}

//=============demo代码==================
let root = Object.create(FolderNode);
root.build('科幻作品');
let folder1 = Object.create(FolderNode);
folder1.build('小说');
let child1 = Object.create(FileNode);
child1.build('银河帝国系列');

folder1.add(child1);
root.add(folder1);

let rootBody = render[folder](root);
const rootEl = document.querySelector('#js-root');
rootEl.appendChild(rootBody);

//=============功能================
let nodeController = {
    createFile(data) {
        let node = Object.create(FileNode);
        node.build(data);
        return node;
    },
    createFolder(data) {
        let node = Object.create(FolderNode);
        node.build(data);
        return node;
    },
    toggleMark(node) {
        node.toggleMark();
        node.nodeEls.markEl.classList.toggle('marked');

        // 记录当前被选中的节点
        this.lastMarkedNode = node;
    },
    toggleExpand(node) {
        node.toggleExpand();
        node.nodeEls.switchBtn.classList.toggle('arrow-down');
        node.nodeEls.switchBtn.classList.toggle('arrow-right');
        for (let item of node.childList) {
            item.nodeEls.nodeBodyEl.classList.toggle('hidden');
        }
    },
    addTo(toNode, newNode) {
        toNode.add(newNode);

        let newNodeBody = render[newNode.type](newNode);
        toNode.nodeEls.nodeBodyEl.appendChild(newNodeBody);
    },
    setLastMarkedNode(node) {
        this._lastMarkedNode = node;
    },
    getLastMarkedNode() {
        return this._lastMarkedNode;
    },
    _lastMarkedNode: null,
}

let addToRoot = (() => {
    let createNode = {
        [file]: function (data) {
            return nodeController.createFile(data);
        },
        [folder]: function (data) {
            return nodeController.createFolder(data);
        }
    }

    return (type) => {
        let node = root.search((node) => {
            return node.marked;
        });

        if (node === undefined) {
            alert('未选择目录');
            return;
        }

        if (node.type !== folder) {
            alert('只可向文件夹内添加文件');
            return;
        }

        let data = prompt('请输入的名称');
        if (data.trim() === '') {
            alert('名称不可为空');
            return;
        }

        if (!node.expanded) {
            nodeController.toggleExpand(node);
        }

        let newNode = createNode[type](data);
        nodeController.addTo(node, newNode);
    
    }
})();

const addFileBtn = document.querySelector('#js-addFile');
const addFolderBtn = document.querySelector('#js-addFolder');
const searchBtn = document.querySelector('#js-search');
const deleteBtn = document.querySelector('#js-delete');

addFileBtn.onclick = () => {
    addToRoot(file);
}

addFolderBtn.onclick = () => {
    addToRoot(folder);
}

searchBtn.onclick = () => {
    let data = prompt('请输入的名称');
    if (data.trim() === '') {
        alert('名称不可为空');
        return;
    }

    let node = root.search((node) => {
        return node.data === data;
    });

    if (node === undefined) {
        alert('无符合条件节点');
        return;
    }

    if (node.marked)
        return;
    
    nodeController.toggleMark(node);
}