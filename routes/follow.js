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
            //所有关注人的文章
            if (id == 'all') {
                var arr = [];
                follow[0].followList.forEach(function(f) {
                    if (f.followType == 0) {
                        var aid = f.followId._id + '';
                        arr.push(aid);
                    }
                });
                var updateStr = { 'authorId': { '$in': arr } };
                Article.find(updateStr).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function(err, art) {
                    Article.count(updateStr, function(err, a) {
                        follow.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        follow.art = art;
                        resolve(follow);
                    });
                });
            } else if (id == 'add') {
                User.find({}).skip(skipNum).limit(pageSize).sort({ 'fansNum': -1 }).exec(function(err, user) {
                    User.count({}, function(err, a) {
                        follow.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        ep.after('next', user.length, function(user) {
                            follow.user = user[0];
                            resolve(follow);
                        });
                        user.forEach(function(item) {
                            Follow.find({ 'userId': selfid, 'followList': { '$elemMatch': { 'followId': item._id, 'followType': 0 } } }, function(err, result) {
                                //已经关注
                                if (result != 0) {
                                    item.isFollow = true;
                                } else {
                                    item.isFollow = false;
                                }
                                ep.emit('next', user);
                            });
                        });
                    });
                });
            } else {
                //单个关注人的文章
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