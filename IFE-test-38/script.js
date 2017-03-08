"use strict";
(function() {
    //表单样式解耦
    let TABLE_CLASS = {
        table: "table",
        header: "table-header",
        tr: "tr",
        th: "th",
        td: "td",
        sortBtn: "sort-btn"
    };

    //测试用json数据
    let TEST_DATA = {
        sortList: [0, 1, 1, 1, 1],
        header: [{
            name: "姓名",
        }, {
            name: "语文",
        }, {
            name: "数学",
        }, {
            name: "英语",
        }, {
            name: "总分",
        }, ],
        students: [{
            name: "伊丽莎白",
            score: [89, 23, 85, 197],
        }, {
            name: "莎士比亚",
            score: [98, 45, 99, 242],
        }, {
            name: "赫鲁晓夫",
            score: [23, 56, 67, 146],
        }, {
            name: "蒙娜丽莎",
            score: [56, 56, 56, 168],
        }, {
            name: "小天狼星",
            score: [45, 73, 73, 191],
        }, {
            name: "诸葛村夫",
            score: [96, 63, 35, 194],
        }]
    };

    let Table = function(tableData, appendEle, tableClass) {
        this.style = tableClass;
        this.data = tableData;
        this.dataMap = []; //用于存取二位数组形式的数据
        this.appendTo = appendEle;
        this.sortTag = [];
    }

    Table.prototype = {
        createTbody: function() {
            let self = this;
            let $table = $("<table class=" + self.style.table + "><tbody></tbody></table>");
            return $table;
        },

        createHeader: function() {
            let self = this;

            let thHTML = "";
            for (let i = 0; i < self.data.header.length; i++) {
                if (self.data.sortList[i]) {
                    thHTML += ("<th class=" + self.style.th + ">" + self.data.header[i].name + "<span class=" + self.style.sortBtn + "></span></th>");
                } else {
                    thHTML += ("<th class=" + self.style.th + ">" + self.data.header[i].name + "</th>");
                }
            }
            let tableHeaderHTML = ("<tr class=" + self.style.header + ">" + thHTML + "</tr>");
            let $tableHeader = $(tableHeaderHTML);
            self.dataMap[0] = [];
            for (let i = 0; i < self.data.header.length; i++) {
                self.dataMap[0][i] = $tableHeader.find("th").eq(i);
            }
            return $tableHeader;
        },

        createContent: function() {
            let self = this;
            let tableContentHTML = "";
            for (let i = 0; i < self.data.students.length; i++) {
                let tdHTML = ("<td class=" + self.style.td + ">" + self.data.students[i].name + "</td>");
                for (let j = 0; j < self.data.students[i].score.length; j++) {
                    tdHTML += ("<td class=" + self.style.td + ">" + self.data.students[i].score[j] + "</td>");
                }
                tableContentHTML += ("<tr class=" + self.style.tr + ">" + tdHTML + "</tr>");
            }
            let $tableContent = $(tableContentHTML);

            for (let i = 0; i < self.data.students.length; i++) {
                self.dataMap[1 + i] = [];
                for (let j = 0; j < self.data.students[i].score.length; j++) {
                    self.dataMap[1 + i][j] = $tableContent.eq(i).find("td").eq(j);
                }
            }
            return $tableContent;
        },

        addListener: function() {
            let self = this;
            //为按钮绑定排序事件
            for (let i = self.data.sortList.length - 1; i >= 0; i--) {
                (function(e) {
                    if (self.data.sortList[e]) {
                        self.sortTag[e] = 'up';
                        self.dataMap[0][e].find(".sort-btn").eq(0).click(function() {
                            if (self.sortTag[e] === 'up') {
                                self.sortListUp(e);
                                self.renderTable();
                                self.addListener();
                                self.sortTag[e] = 'down';
                            } else if (self.sortTag[e] === 'down') {
                                self.sortListDown(e);
                                self.renderTable();
                                self.addListener();
                                self.sortTag[e] = 'up';
                            } else {
                                return false;
                            }
                        });
                    }
                })(i);
            }
        },

        //升序
        sortListUp: function(index) {
            var self = this;
            let newArr = self.data.students;
            newArr.sort(function(a, b) {
                return (a.score[index - 1] - b.score[index - 1]);
            });
            self.data.students = newArr;
        },

        sortListDown: function(index) {
            var self = this;
            let newArr = self.data.students;
            newArr.sort(function(a, b) {
                return (b.score[index - 1] - a.score[index - 1]);
            });
            self.data.students = newArr;
        },

        renderTable: function() {
            var self = this;
            let $scoreTable = self.createTbody();
            $scoreTable.append(self.createHeader());
            $scoreTable.append(self.createContent());
            self.appendTo.empty();
            self.appendTo.append($scoreTable);
        }
    };

    let scoreTable = new Table(TEST_DATA, $("#table-wrap"), TABLE_CLASS);
    scoreTable.renderTable();
    scoreTable.addListener();
})();
