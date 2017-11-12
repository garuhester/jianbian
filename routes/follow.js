var User = require('../schemas/user');
var Article = require('../schemas/article');
var Follow = require('../schemas/follow');
var eventproxy = require('eventproxy');
var ep = new eventproxy();

var getFollowAllData = function(selfid, id, currentPage) {
    return new Promise(function(resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        Follow.find({ 'userId': selfid }).populate({
            path: 'followList.followId',
            select: 'name headImage'
        }).exec(function(err, follow) {
            follow.currentPage = currentPage;
            follow.id = id;
            if (id == 'all') {
                var arr = [];
                follow[0].followList.forEach(function(f) {
                    var aid = f.followId._id + '';
                    arr.push(aid);
                });
                var updateStr = { 'authorId': { '$in': arr } };
                Article.find(updateStr).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function(err, art) {
                    Article.count(updateStr, function(err, a) {
                        follow.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        follow.art = art;
                        resolve(follow);
                    });
                });
            } else {
                Article.find({ 'authorId': id }).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function(err, art) {
                    Article.count({ 'authorId': id }, function(err, a) {
                        follow.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        follow.art = art;
                        resolve(follow);
                    });
                });
            }
        });
    });
}

module.exports = {
    getFollowAllData,
}