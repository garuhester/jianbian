var Article = require('../schemas/article');
var Follow = require('../schemas/follow');
var Collect = require('../schemas/collect');
var User = require('../schemas/user');

var getArticle = function(userid, sid, articleid) {
    return new Promise(function(resolve, reject) {
        var data = {};
        User.findById(userid, function(err, user) {
            data.user = user;
            if (sid != 'no') {
                Follow.find({ 'userId': sid, 'followList': { '$elemMatch': { 'followId': userid, 'followType': 0 } } }, function(err, result) {
                    if (result != 0) {
                        data.isFollow = true;
                    } else {
                        data.isFollow = false;
                    }
                    Collect.find({ 'userId': sid, 'collectList': { '$elemMatch': { 'articleId': articleid, 'collectType': 1 } } }, function(err, likeResult) {
                        if (likeResult != 0) {
                            data.isLike = true;
                        } else {
                            data.isLike = false;
                        }
                        Collect.find({ 'userId': sid, 'collectList': { '$elemMatch': { 'articleId': articleid, 'collectType': 0 } } }, function(err, collectResult) {
                            if (collectResult != 0) {
                                data.isCollect = true;
                            } else {
                                data.isCollect = false;
                            }
                            if (sid != userid) {
                                Article.findByIdAndUpdate(articleid, { '$inc': { 'lookNum': 1 } }, function(err, article) {
                                    data.article = article;
                                    resolve(data);
                                });
                            } else {
                                Article.findById(articleid, function(err, article) {
                                    data.article = article;
                                    resolve(data);
                                });
                            }
                        });
                    });
                });
            } else {
                Article.findByIdAndUpdate(articleid, { '$inc': { 'lookNum': 1 } }, function(err, article) {
                    data.article = article;
                    resolve(data);
                });
            }
        });
    });
}

var doArticle = function(req, res) {
    var user = req.session.user || 'no';
    if (user != 'no') {
        var userid = user.id;
        var aid = req.body.aid;
        var type = req.body.type;
        var updateStr = {
            articleId: aid,
            collectType: type
        }
        if (type == 1) {
            //喜欢文章
            Collect.findOneAndUpdate({ 'userId': userid }, { '$push': { 'collectList': updateStr }, '$inc': { 'likeNum': 1 } }, function(err, collect) {
                Article.findByIdAndUpdate(aid, { '$inc': { 'likeNum': 1 } }, function(err, result) {
                    res.json({ result: 1 });
                });
            });
        } else if (type == 0) {
            //收藏文章
            Collect.findOneAndUpdate({ 'userId': userid }, { '$push': { 'collectList': updateStr }, '$inc': { 'collectNum': 1 } }, function(err, collect) {
                Article.findByIdAndUpdate(aid, { '$inc': { 'collectNum': 1 } }, function(err, result) {
                    res.json({ result: 2 });
                });
            });
        }
    } else {
        res.json({ result: 0 });
    }
}

var undoArticle = function(req, res) {
    var userid = req.session.user.id;
    var aid = req.body.aid;
    var type = req.body.type;
    var updateStr = {
        articleId: aid,
        collectType: type
    }
    if (type == 1) {
        //喜欢文章
        Collect.findOneAndUpdate({ 'userId': userid }, { '$pull': { 'collectList': updateStr }, '$inc': { 'likeNum': -1 } }, function(err, collect) {
            Article.findByIdAndUpdate(aid, { '$inc': { 'likeNum': -1 } }, function(err, result) {
                res.json({ result: 1 });
            });
        });
    } else if (type == 0) {
        //收藏文章
        Collect.findOneAndUpdate({ 'userId': userid }, { '$pull': { 'collectList': updateStr }, '$inc': { 'collectNum': -1 } }, function(err, collect) {
            Article.findByIdAndUpdate(aid, { '$inc': { 'collectNum': -1 } }, function(err, result) {
                res.json({ result: 2 });
            });
        });
    }
}

module.exports = {
    getArticle,
    doArticle,
    undoArticle,
}