var User = require('../schemas/user.js');
var Message = require('../schemas/message');
var eventproxy = require('eventproxy');
var ep = new eventproxy();

var getMessage = function (selfid, type, currentPage) {
    return new Promise(function (resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        var data = {};
        data.currentPage = currentPage;
        data.page = '/message/' + type + '/?';
        var t = type == "collect" ? 0 : (type == "like" ? 1 : (type == "follow" ? 2 : -1));
        var updateStr = { 'userId': selfid };
        Message.find(updateStr).populate({
            path: 'messageList.otherUserId',
            select: 'name headImage'
        }).exec(function (err, msgs) {
            if (msgs[0].messageList.length != 0) {
                msgs[0].messageList = msgs[0].messageList.filter((item) => {
                    switch (type) {
                        case "collect":
                            return item.msgType == 0;
                            break;
                        case "like":
                            return item.msgType == 1;
                            break;
                        case "follow":
                            return item.msgType == 2;
                            break;
                    }
                });
                msgs[0].messageList.sort((a, b) => new Date(b.msgTime) - new Date(a.msgTime));
                var c = msgs[0].messageList;
                var a = c.length;
                data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                msgs[0].messageList = pagination(pageSize, skipNum, c);
                data.msgs = msgs;
            }
            resolve(data);
        });
    });
}

//数组分页
var pagination = function (pageSize, skipNum, arr) {
    return (skipNum + pageSize >= arr.length) ? arr.slice(skipNum, arr.length) : arr.slice(skipNum, skipNum + pageSize);
}

module.exports = {
    getMessage,
}