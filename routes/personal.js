var Article = require('../schemas/article');
var User = require('../schemas/user');
var Follow = require('../schemas/follow');
var Collect = require('../schemas/collect');
var eventproxy = require('eventproxy');
var ep = new eventproxy();
var moment = require("moment");

//获取文章推荐和文章存档列表
function getMain(data, id, callback) {
    Article.find({ 'authorId': id, 'status': 1, 'isRecommend': 1 }, function (err, iscom) {
        data.iscom = iscom;
        Article.find({ 'authorId': id, 'status': 1 }).sort({ 'createTime': -1 }).exec(function (err, allart) {
            var showArr = [];
            for (var i = 0; i < allart.length; i++) {
                var art = allart[i];
                var d = moment(art.createTime).format("YYYY-MM-DD");
                if (sameObj(showArr, d)) {
                    showArr.push({
                        date: d
                    });
                }
            }
            for (var i = 0; i < showArr.length; i++) {
                var ele1 = showArr[i].date;
                var count = 0;
                for (var j = 0; j < allart.length; j++) {
                    var ele2 = moment(allart[j].createTime).format("YYYY-MM-DD").toString();
                    if (ele2.indexOf(ele1) != -1) {
                        count++;
                    }
                }
                showArr[i].count = count;
            }
            data.showArr = showArr;
            callback(data);
        });
    });
}

//获取个人中心文章页数据
var getPersonalArticle = function (id, sid, currentPage, category, search, timeline) {
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
                if (timeline == "none") {
                    if (category == "none" && search == "none") {
                        data.page = '/personal/article/' + id + '/?';
                        Article.find({ 'authorId': id, 'status': 1 }).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function (err, article) {
                            //用户文章数
                            Article.count({ 'authorId': id, 'status': 1 }, function (err, a) {
                                data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                                data.article = article;
                                data.an = a;
                                getMain(data, id, function (data) {
                                    resolve(data);
                                });
                            });
                        });
                    } else if (category != "none" && search == "none") {
                        data.page = '/personal/article/' + id + '/?category=' + category + "&";
                        Article.find({ 'authorId': id, 'status': 1, 'category': category }).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function (err, article) {
                            //用户文章数
                            Article.count({ 'authorId': id, 'status': 1, 'category': category }, function (err, a) {
                                data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                                data.article = article;
                                data.an = a;
                                getMain(data, id, function (data) {
                                    resolve(data);
                                });
                            });
                        });
                    } else if (category == "none" && search != "none") {
                        data.page = '/personal/article/' + id + '/?search=' + search + "&";

                        var re = new RegExp(search, "i");
                        var updateStr = { 'authorId': id, 'status': 1, 'title': { '$regex': re } };

                        Article.find(updateStr).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function (err, article) {
                            //用户文章数
                            Article.count(updateStr, function (err, a) {
                                data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                                data.article = article;
                                data.an = a;
                                getMain(data, id, function (data) {
                                    resolve(data);
                                });
                            });
                        });
                    } else {
                        resolve("error");
                    }
                } else if (timeline != "none" && category == "none" && search == "none") {
                    data.page = '/personal/article/' + id + '/?timeline=' + timeline + "&";

                    var updateStr = { 'authorId': id, 'status': 1 };

                    Article.find(updateStr, function (err, article) {
                        var sArr = [];
                        for (var i = 0; i < article.length; i++) {
                            var art = article[i];
                            sArr.push({
                                id: art._id,
                                date: moment(art.createTime).format("YYYY-MM-DD").toString()
                            });
                        }
                        var rArr = [];
                        for (var i = 0; i < sArr.length; i++) {
                            if (sArr[i].date.indexOf(timeline) != -1) {
                                rArr.push(sArr[i].id);
                            }
                        }

                        updateStr = { '_id': { "$in": rArr } };

                        Article.find(updateStr).populate('authorId', 'name headImage').skip(skipNum).limit(pageSize).sort({ 'createTime': -1 }).exec(function (err, article2) {
                            //用户文章数
                            var a = rArr.length;
                            data.allPage = (a % pageSize == 0) ? ~~(a / pageSize) : ~~((a / pageSize) + 1);
                            data.article = article2;
                            data.an = a;
                            getMain(data, id, function (data) {
                                resolve(data);
                            });
                        });
                    });
                } else {
                    resolve("error");
                }
            });
        });
    });
}

//判断数组中的对象的字段是否重复
function sameObj(arr, obj) {
    arr = arr.filter(function (item) {
        return item.date.indexOf(obj) != -1
    });

    return arr.length == 0 ? true : false;
}

//删除文章
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

//获取个人中心关注和粉丝页数据
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
                            getMain(data, id, function (data) {
                                resolve(data);
                            });
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

//获取个人中心喜欢和收藏页数据
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
                    getMain(data, id, function (data) {
                        resolve(data);
                    });
                });
            });
        });
    })
}

//数组分页
var pagination = function (pageSize, skipNum, arr) {
    return (skipNum + pageSize >= arr.length) ? arr.slice(skipNum, arr.length) : arr.slice(skipNum, skipNum + pageSize);
}

module.exports = {
    getPersonalArticle,
    deleteArticle,
    getPersonalFollowAndFans,
    getPersonalLikeAndCollect,
}