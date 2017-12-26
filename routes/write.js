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
                    User.findByIdAndUpdate(id, {
                        $pull: {
                            categoryList: {
                                categoryName: data.category
                            }
                        }
                    }, function (err, art) {
                        var newNum;
                        var cl = art.categoryList.find((cl) => cl.categoryName == data.category);
                        newNum = cl.categoryNum + 1;
                        User.findByIdAndUpdate(id, {
                            $push: {
                                categoryList: {
                                    categoryName: data.category,
                                    categoryNum: newNum
                                }
                            }
                        }, function (err, art2) {
                            res.json({
                                result: type == 0 ? 'save' : 'publish'
                            });
                        });
                    });
                } else {//保存
                    res.json({
                        result: type == 0 ? 'save' : 'publish'
                    });
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
                        //分类个数+1
                        User.findByIdAndUpdate(id, {
                            $pull: {
                                categoryList: {
                                    categoryName: data.category
                                }
                            }
                        }, function (err, art) {
                            var newNum;
                            var cl = art.categoryList.find((cl) => cl.categoryName == data.category);
                            newNum = cl.categoryNum + 1;
                            User.findByIdAndUpdate(id, {
                                $push: {
                                    categoryList: {
                                        categoryName: data.category,
                                        categoryNum: newNum
                                    }
                                }
                            }, function (err, art2) {
                                Article.findByIdAndUpdate(data.art_id, {
                                    title: data.title,
                                    tag: data.tag,
                                    category: data.category,
                                    content: data.content,
                                    text: data.text,
                                    status: type
                                }, function (err, art) {
                                    res.json({
                                        result: type == 0 ? 'save' : 'publish',
                                        aid: data.art_id
                                    });
                                });
                            });
                        });
                    } else {//发布-发布
                        Article.findByIdAndUpdate(data.art_id, {
                            title: data.title,
                            tag: data.tag,
                            category: data.category,
                            content: data.content,
                            text: data.text,
                            status: type
                        }, function (err, art) {
                            res.json({
                                result: type == 0 ? 'save' : 'publish',
                                aid: data.art_id
                            });
                        });
                    }
                } else {//保存-保存
                    Article.findByIdAndUpdate(data.art_id, {
                        title: data.title,
                        tag: data.tag,
                        category: data.category,
                        content: data.content,
                        text: data.text,
                        status: type
                    }, function (err, art) {
                        res.json({
                            result: type == 0 ? 'save' : 'publish',
                            aid: data.art_id
                        });
                    });
                }
            } else {//分类改变
                if (findart.status == 1) {
                    type = 1;
                }
                if (type == 1) {
                    if (findart.status != 1) {//保存-发布
                        //分类个数+1
                        User.findByIdAndUpdate(id, {
                            $pull: {
                                categoryList: {
                                    categoryName: data.category
                                }
                            }
                        }, function (err, art) {
                            var newNum;
                            var cl = art.categoryList.find((cl) => cl.categoryName == data.category);
                            newNum = cl.categoryNum + 1;
                            User.findByIdAndUpdate(id, {
                                $push: {
                                    categoryList: {
                                        categoryName: data.category,
                                        categoryNum: newNum
                                    }
                                }
                            }, function (err, art2) {
                                Article.findByIdAndUpdate(data.art_id, {
                                    title: data.title,
                                    tag: data.tag,
                                    category: data.category,
                                    content: data.content,
                                    text: data.text,
                                    status: type
                                }, function (err, art) {
                                    res.json({
                                        result: type == 0 ? 'save' : 'publish',
                                        aid: data.art_id
                                    });
                                });
                            });
                        });
                    } else {//发布-发布
                        //原有的分类数量-1
                        User.findByIdAndUpdate(id, {
                            $pull: {
                                categoryList: {
                                    categoryName: findart.category
                                }
                            }
                        }, function (err, art) {
                            var newNum;
                            var cl = art.categoryList.find((cl) => cl.categoryName == findart.category);
                            newNum = cl.categoryNum - 1;
                            User.findByIdAndUpdate(id, {
                                $push: {
                                    categoryList: {
                                        categoryName: findart.category,
                                        categoryNum: newNum
                                    }
                                }
                            }, function (err, art2) {
                                //新的分类数量+1
                                User.findByIdAndUpdate(id, {
                                    $pull: {
                                        categoryList: {
                                            categoryName: data.category
                                        }
                                    }
                                }, function (err, art3) {
                                    var newNum;
                                    var cl = art.categoryList.find((cl) => cl.categoryName == data.category);
                                    newNum = cl.categoryNum + 1;
                                    User.findByIdAndUpdate(id, {
                                        $push: {
                                            categoryList: {
                                                categoryName: data.category,
                                                categoryNum: newNum
                                            }
                                        }
                                    }, function (err, art4) {
                                        Article.findByIdAndUpdate(data.art_id, {
                                            title: data.title,
                                            tag: data.tag,
                                            category: data.category,
                                            content: data.content,
                                            text: data.text,
                                            status: type
                                        }, function (err, art) {
                                            res.json({
                                                result: type == 0 ? 'save' : 'publish',
                                                aid: data.art_id
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                } else {//保存-保存
                    Article.findByIdAndUpdate(data.art_id, {
                        title: data.title,
                        tag: data.tag,
                        category: data.category,
                        content: data.content,
                        text: data.text,
                        status: type
                    }, function (err, art) {
                        res.json({
                            result: type == 0 ? 'save' : 'publish',
                            aid: data.art_id
                        });
                    });
                }
            }
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