var Article = require("../schemas/article");
var User = require("../schemas/user");

var publishArticle = function (req, res) {
    var data = req.body;
    var id = req.session.user.id;
    //用户文章数+1
    User.findByIdAndUpdate(id, {
        $inc: {
            articleNum: 1
        }
    }, function (err, val) {
        if (err) {
            console.log(err);
            return err;
        }
    });

    if (!data.art_id) {
        //插入新的文章
        var a = new Article({
            authorId: id,
            title: data.title,
            tag: data.tag,
            category: data.category,
            content: data.content,
            text: data.text
        });
        a.save(function (err, a) {
            User.findByIdAndUpdate(id, {
                $push: {
                    articleList: {
                        articleId: a._id
                    }
                },
                $pull: {
                    categoryList: {
                        categoryName: data.category
                    }
                }
            }, function (err, art) {
                var newNum;
                for (let i = 0; i < art.categoryList.length; i++) {
                    var cl = art.categoryList[i];
                    if (cl.categoryName == data.category) {
                        newNum = cl.categoryNum + 1;
                        break;
                    }
                }
                User.findByIdAndUpdate(id, {
                    $push: {
                        categoryList: {
                            categoryName: data.category,
                            categoryNum: newNum
                        }
                    }
                }, function (err, art2) {
                    res.json({
                        result: "ok"
                    });
                });
            });
        });
    } else {
        Article.findByIdAndUpdate(data.art_id, {
            title: data.title,
            tag: data.tag,
            category: data.category,
            content: data.content,
            text: data.text
        }, function (err, art) {
            res.json({
                result: "publish",
                aid: data.art_id
            });
        });
    }
};

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

module.exports = {
    publishArticle,
    getArticle,
    addCategory
};