var User = require('../schemas/user.js');
var Article = require('../schemas/article.js');
var Follow = require('../schemas/follow');
var eventproxy = require('eventproxy');
var moment = require('moment');

var ep = new eventproxy();

var getData = function(id, currentPage, articleName) {
    return new Promise(function(resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        var data = {};
        data.page = '';
        data.currentPage = currentPage;
        User.find({}).limit(5).sort({ 'fansNum': -1 }).exec(function(err, user) {
            ep.after('next', user.length, function(user) {
                data.user = user;
                var updateStr;
                if (articleName == 'nosearch') {
                    updateStr = {};
                } else {
                    var re = new RegExp(articleName, "i");
                    updateStr = { 'title': { '$regex': re } };
                }
                Article.find(updateStr).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function(err, article) {
                    Article.count({}, function(err, a) {
                        data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        data.article = article;
                        resolve(data);
                    });
                });
            });
            user.forEach(function(item) {
                Follow.find({ 'userId': id, 'followList': { '$elemMatch': { 'followId': item._id, 'followType': 0 } } }, function(err, result) {
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
}

var followPerson = function(req, res) {
    if (req.session.user) {
        var otherid = req.body.otherid;
        var id = req.session.user.id;
        if (otherid == id) {
            //不能关注自己
            res.json({ result: 1 });
        } else {
            //followList是否有otherid
            Follow.find({ 'userId': id, 'followList': { '$elemMatch': { 'followId': otherid, 'followType': 0 } } }, function(err, result) {
                //没有关注过
                if (result.length == 0) {
                    //关注的用户增加
                    var updateStr = {
                        followId: otherid,
                        followType: 0,
                    }
                    Follow.findOneAndUpdate({ 'userId': id }, { '$push': { 'followList': updateStr }, '$inc': { 'followNum': 1 } }, function(err, follow) {
                        User.findByIdAndUpdate(id, { '$inc': { 'followNum': 1 } }, function() {
                            //关注的用户的粉丝增加
                            var updateStr2 = {
                                followId: id,
                                followType: 1,
                            }
                            Follow.findOneAndUpdate({ 'userId': otherid }, { '$push': { 'followList': updateStr2 }, '$inc': { 'fansNum': 1 } }, function(err, follow) {
                                User.findByIdAndUpdate(otherid, { '$inc': { 'fansNum': 1 } }, function() {
                                    //关注成功
                                    res.json({ result: 3 });
                                })
                            });
                        })
                    });
                } else {
                    //已经关注
                    res.json({ result: 2 });
                }
            });
        }
    } else {
        res.json({ result: 0 });
    }
}

var unFollowPerson = function(req, res) {
    if (req.session.user) {
        var otherid = req.body.otherid;
        var id = req.session.user.id;
        Follow.find({ 'userId': id, 'followList': { '$elemMatch': { 'followId': otherid, 'followType': 0 } } }, function(err, result) {
            //关注过
            if (result.length != 0) {
                //删除关注用户和关注数
                var updateStr = {
                    followId: otherid,
                    followType: 0,
                }
                Follow.findOneAndUpdate({ 'userId': id }, { '$pull': { 'followList': updateStr }, '$inc': { 'followNum': -1 } }, function(err, r) {
                    User.findByIdAndUpdate(id, { '$inc': { 'followNum': -1 } }, function() {
                        //删除关注用户的粉丝和粉丝数
                        var updateStr2 = {
                            followId: id,
                            followType: 1,
                        }
                        Follow.findOneAndUpdate({ 'userId': otherid }, { '$pull': { 'followList': updateStr2 }, '$inc': { 'fansNum': -1 } }, function(err, r) {
                            User.findByIdAndUpdate(otherid, { '$inc': { 'fansNum': -1 } }, function() {
                                res.json({ result: 1 });
                            });
                        });
                    });
                });
            }
        });
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    getData,
    followPerson,
    unFollowPerson,
}