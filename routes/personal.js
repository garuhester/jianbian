var Article = require('../schemas/article');
var User = require('../schemas/user');
var Follow = require('../schemas/follow');
var Collect = require('../schemas/collect');
var eventproxy = require('eventproxy');
var ep = new eventproxy();

var getPersonalArticle = function (id, sid, currentPage) {
    return new Promise(function (resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        var data = {};
        data.page = '/personal/article/' + id + '/?';
        data.currentPage = currentPage;
        User.findById(id, function (err, user) {
            Follow.find({ 'userId': sid, 'followList': { '$elemMatch': { 'followId': id, 'followType': 0 } } }, function (err, result) {
                if (result != 0) {
                    data.isFollow = true;
                } else {
                    data.isFollow = false;
                }
                data.user = user;
                Article.find({ 'authorId': id, 'status': 1 }).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function (err, article) {
                    //用户文章数
                    Article.count({ 'authorId': id, 'status': 1 }, function (err, a) {
                        data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                        data.article = article;
                        data.an = a;
                        resolve(data);
                    });
                });
            });
        });
    });
}

var deleteArticle = function (req, res) {
    var aid = req.body.aid;
    var id = req.session.user.id;

    //删除文章

    Article.findById(aid, function (err, article) {
        Article.remove({ '_id': aid }, function (err, result) {
            if (result) {
                //用户文章数-1
                User.findByIdAndUpdate(id, { '$pull': { 'articleList': { 'articleId': aid } }, '$inc': { 'articleNum': -1 } }, function (err, val) {
                    //原有的分类数量-1
                    User.findByIdAndUpdate(id, {
                        $pull: {
                            categoryList: {
                                categoryName: article.category
                            }
                        }
                    }, function (err, art) {
                        var newNum;
                        var cl = art.categoryList.find((cl) => cl.categoryName == article.category);
                        newNum = cl.categoryNum - 1;
                        User.findByIdAndUpdate(id, {
                            $push: {
                                categoryList: {
                                    categoryName: article.category,
                                    categoryNum: newNum
                                }
                            }
                        }, function (err, art2) {
                            res.json({ result: 'ok' });
                        });
                    });
                });
            }
        });
    });
}

var getPersonalFollowAndFans = function (id, sid, currentPage, type) {
    return new Promise(function (resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        var data = {};
        data.currentPage = currentPage;
        User.findById(id, function (err, user) {
            Follow.find({ 'userId': sid, 'followList': { '$elemMatch': { 'followId': id, 'followType': 0 } } }, function (err, result) {
                if (result != 0) {
                    data.isFollow = true;
                } else {
                    data.isFollow = false;
                }
                data.user = user;
                // var followType = type == 'follow' ? 0 : 1;
                Follow.find({ 'userId': id }).populate('followList.followId', 'name content headImage articleNum followNum fansNum').exec(function (err, follow) {
                    follow[0].followList = follow[0].followList.filter((item) => {
                        if (type == 'follow') {
                            data.page = '/personal/follow/' + id + '/?';
                            return item.followType == 0;
                        } else {
                            data.page = '/personal/fans/' + id + '/?';
                            return item.followType == 1;
                        }
                    });
                    follow[0].followList.sort((a, b) => new Date(b.followTime) - new Date(a.followTime));
                    var f = follow[0].followList;
                    var a = f.length;
                    data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                    follow[0].followList = pagination(pageSize, skipNum, f);

                    ep.after('next', f.length, function (follow) {
                        data.follow = follow;
                        //用户文章数
                        Article.count({ 'authorId': id, 'status': 1 }, function (err, a) {
                            data.an = a;
                            resolve(data);
                        });
                    })
                    f.forEach(function (item) {
                        Follow.find({ 'userId': id, 'followList': { '$elemMatch': { 'followId': item.followId._id, 'followType': 0 } } }, function (err, result) {
                            //已经关注
                            if (result != 0) {
                                item.isFollow = true;
                            } else {
                                item.isFollow = false;
                            }
                            ep.emit('next', follow);
                        });
                    });
                });
            });
        });
    });
}

var getPersonalLikeAndCollect = function (id, sid, currentPage, type) {
    return new Promise(function (resolve, reject) {
        var pageSize = 20;
        var skipNum = (currentPage - 1) * pageSize;
        var data = {};
        data.currentPage = currentPage;
        User.findById(id, function (err, user) {
            data.user = user;
            // var collectType = type == 'collectarticle' ? 1 : 0;
            Collect.find({ 'userId': id }).populate({
                path: 'collectList.articleId',
                select: '_id authorId title text tag lookNum msgNum likeNum collectNum createTime',
                module: 'Article',
                populate: {
                    path: 'authorId',
                    select: 'name headImage',
                    module: 'User'
                }
            }).exec(function (err, article) {
                article[0].collectList = article[0].collectList.filter((item) => {
                    if (type == 'collectarticle') {
                        data.page = '/personal/collectarticle/' + id + '/?';
                        return item.collectType == 0;
                    }
                    else {
                        data.page = '/personal/likearticle/' + id + '/?';
                        return item.collectType == 1;
                    }
                });
                article[0].collectList.sort((a, b) => new Date(b.collectTime) - new Date(a.collectTime));
                var c = article[0].collectList;
                var a = c.length;
                data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                article[0].collectList = pagination(pageSize, skipNum, c);
                data.article = article[0];
                //用户文章数
                Article.count({ 'authorId': id, 'status': 1 }, function (err, a) {
                    data.an = a;
                    resolve(data);
                });
            });
        });
    })
}

var pagination = function (pageSize, skipNum, arr) {
    return (skipNum + pageSize >= arr.length) ? arr.slice(skipNum, arr.length) : arr.slice(skipNum, skipNum + pageSize);
}

module.exports = {
    getPersonalArticle,
    deleteArticle,
    getPersonalFollowAndFans,
    getPersonalLikeAndCollect,
}