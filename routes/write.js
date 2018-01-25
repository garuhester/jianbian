var Article = require("../schemas/article");
var User = require("../schemas/user");

var publishArticle = function (req, res) {
    var data = req.body;
    var id = req.session.user.id;
    var type = data.type;//0为草稿即保存，1为发布

    if (!data.art_id) {//新建文章
        //插入新的文章
        var a = new Article({
            authorId: id,
            title: data.title,
            tag: data.tag,
            category: data.category,
            content: data.content,
            text: data.text,
            status: type
        });
        a.save(function (err, a) {
            User.findByIdAndUpdate(id, {
                $push: {
                    articleList: {
                        articleId: a._id
                    }
                },
                $inc: {//用户文章数+1
                    articleNum: 1
                }
            }, function (err, an) {
                //发布
                if (type == 1) {
                    //分类个数+1
                    categoryNumAdd(id, data.category, function () {
                        resJson(res, type);
                    });
                } else {//保存
                    resJson(res, type);
                }
            });
        });
    } else {//更新文章
        Article.findById(data.art_id, function (err, findart) {
            if (data.category == findart.category) {//分类不变
                if (findart.status == 1) {
                    type = 1;
                }
                if (type == 1) {
                    if (findart.status != 1) {//保存-发布
                        categoryNumAdd(id, data.category, function () {
                            articleUpdate2(data, type, res);
                        });
                    } else {//发布-发布
                        articleUpdate(data, type, res);
                    }
                } else {//保存-保存
                    articleUpdate(data, type, res);
                }
            } else {//分类改变
                if (findart.status == 1) {
                    type = 1;
                }
                if (type == 1) {
                    if (findart.status != 1) {//保存-发布
                        categoryNumAdd(id, data.category, function () {
                            articleUpdate2(data, type, res);
                        });
                    } else {//发布-发布
                        categoryNumReduce(id, findart.category, function () {
                            categoryNumAdd(id, data.category, function () {
                                articleUpdate(data, type, res);
                            });
                        });
                    }
                } else {//保存-保存
                    articleUpdate(data, type, res);
                }
            }
        });
    }
};

//分类个数+1
var categoryNumAdd = function (id, categoryName, callback) {
    User.findById(id, function (err, art) {
        var cl = art.categoryList.find((cl) => cl.categoryName == categoryName);
        var newNum = cl.categoryNum + 1;
        User.update({ '_id': id, 'categoryList.categoryName': categoryName }, {
            '$set': {
                'categoryList.$.categoryNum': newNum
            }
        }, function (err, art2) {
            callback();
        });
    });
}

//分类个数-1
var categoryNumReduce = function (id, categoryName, callback) {
    User.findById(id, function (err, art) {
        var cl = art.categoryList.find((cl) => cl.categoryName == categoryName);
        var newNum = cl.categoryNum - 1;
        User.update({ '_id': id, 'categoryList.categoryName': categoryName }, {
            '$set': {
                'categoryList.$.categoryNum': newNum
            }
        }, function (err, art2) {
            callback();
        });
    });
}

//文章更新
var articleUpdate = function (data, type, res) {
    Article.findByIdAndUpdate(data.art_id, {
        title: data.title,
        tag: data.tag,
        category: data.category,
        content: data.content,
        text: data.text,
        status: type
    }, function (err, art) {
        resJson(res, type);
    });
}
//文章更新（日期）
var articleUpdate2 = function (data, type, res) {
    Article.findByIdAndUpdate(data.art_id, {
        title: data.title,
        tag: data.tag,
        category: data.category,
        content: data.content,
        text: data.text,
        status: type,
        createTime: new Date()
    }, function (err, art) {
        resJson(res, type);
    });
}

//返回结果
var resJson = function (res, type) {
    res.json({
        result: type == 0 ? 'save' : 'publish'
    });
}

var getArticle = function (userid, articleid) {
    return new Promise(function (resolve, reject) {
        var data = [];
        if (articleid) {
            User.findById(userid, function (err, user) {
                data.user = user;
                Article.find({
                    authorId: userid
                }).sort({
                    createTime: -1
                }).exec(function (err, arti) {
                    data.article = arti;
                    Article.find({
                        _id: articleid,
                        authorId: userid
                    }, function (err, singlearticle) {
                        if (singlearticle.length != 0) {
                            data.singlearticle = singlearticle;
                        }
                        resolve(data);
                    });
                });
            });
        } else {
            User.findById(userid, function (err, user) {
                data.user = user;
                Article.find({
                    authorId: userid
                }).sort({
                    createTime: -1
                }).exec(function (err, arti) {
                    data.article = arti;
                    data.singlearticle = [{ category: "", content: "" }];
                    resolve(data);
                });
            });
        }
    });
};

var addCategory = function (req, res) {
    var newCategoryName = req.body.newCategoryName;
    var userid = req.session.user.id;
    User.findByIdAndUpdate(userid, {
        $push: {
            categoryList: {
                categoryName: newCategoryName
            }
        }
    }, function (err, user) {
        res.json({
            result: "ok"
        });
    });
};

var recommend = function (req, res) {
    var uid = req.session.user.id;
    var aid = req.body.aid;
    var type = req.body.type;
    if (type == 0) {
        Article.findByIdAndUpdate(aid, { 'isRecommend': 0 }, function (err, art) {
            if (art != null) {
                res.json({ result: 1 });
            }
        });
    } else if (type == 1) {
        Article.findByIdAndUpdate(aid, { 'isRecommend': 1 }, function (err, art) {
            if (art != null) {
                res.json({ result: 1 });
            }
        });
    }
};

module.exports = {
    publishArticle,
    getArticle,
    addCategory,
    recommend,
};