var login = require("./login");
var register = require("./register");
var getIndexData = require("./getIndexData");
var setting = require("./setting");
var write = require("./write");
var personal = require("./personal");
var follow = require("./follow");
var article = require("./article");

//日期插件
var moment = require("moment");

var multer = require("multer");
var storage = multer.diskStorage({
    destination: "static/headimage",
    filename: function (req, file, cb) {
        var id = req.session.user.id;
        var end = file.originalname.split(".")[1];
        cb(null, `${id}.${end}`);
    }
});
var upload = multer({
    storage
});

module.exports = function (app) {
    //ejs中使用的函数
    app.locals.dateFormat = function (date) {
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
    };

    app.locals.dateFormat2 = function (date) {
        return moment(date).format("YYYY-MM-DD");
    };

    app.use(upload.array("headimage"));

    //登录
    app.get("/login", function (req, res) {
        res.render("login", {
            title: "登录博客"
        });
    });
    //登录请求
    app.post("/login", login.doLogin);

    //注册
    app.get("/register", function (req, res) {
        res.render("register", {
            title: "注册博客"
        });
    });
    //注册请求
    app.post("/register", register.doRegister);

    //首页
    app.get("/", function (req, res) {
        var currentPage = req.query.page || 1;
        var articleName = req.query.articlename || "nosearch";
        if (req.session.user) {
            getIndexData
                .getData(req.session.user.id, currentPage, articleName)
                .then(function (data) {
                    res.render("index", {
                        title: "渐变-首页",
                        user: req.session.user,
                        data
                    });
                });
        } else {
            getIndexData
                .getData(null, currentPage, articleName)
                .then(function (data) {
                    res.render("index", {
                        title: "渐变-首页",
                        user: "no",
                        data
                    });
                });
        }
    });

    //关注
    app.get("/follow/:id", function (req, res) {
        if (req.session.user) {
            var selfid = req.session.user.id;
            var id = req.params.id;
            var currentPage = req.query.page || 1;
            follow
                .getFollowAllData(selfid, id, currentPage)
                .then(function (data) {
                    //渐变圈
                    if (id == "add") {
                        res.render("follow-add", {
                            title: "渐变-添加关注",
                            user: req.session.user,
                            data
                        });
                    } else {
                        res.render("follow", {
                            title: "渐变-关注",
                            user: req.session.user,
                            data
                        });
                    }
                });
        } else {
            res.redirect("/login");
        }
    });

    //消息
    app.get("/message", function (req, res) {
        if (req.session.user) {
            res.render("message", {
                title: "渐变-消息",
                user: req.session.user
            });
        } else {
            res.redirect("/login");
        }
    });

    //个人中心
    app.get("/personal/:type/:id", function (req, res) {
        if (req.session.user) {
            var title;
            //个人中心类型
            var type = req.params.type;
            var id = req.params.id; //其他用户个人中心的id
            var goto = req.params.id; //其他用户个人中心跳转参数
            var isSelf; //是否是自己的个人中心
            var sid = req.session.user.id;
            if (id == req.session.user.id) {
                isSelf = true;
            } else {
                isSelf = false;
            }
            var currentPage = req.query.page || 1;// 当前页面页数
            var category = req.query.category || "none";//当前分类
            var search = req.query.search || "none";//搜索内容
            var timeline = req.query.timeline || "none";//当前存档
            if (type != "setting") {
                if (type == "article") {
                    title = "渐变-文章";
                    personal
                        .getPersonalArticle(id, sid, currentPage, category, search, timeline)
                        .then(function (data) {
                            if (data == "error") {
                                res.redirect("/nopage");
                            } else {
                                res.render("personal-article", {
                                    goto,
                                    title,
                                    user: req.session.user,
                                    data,
                                    isSelf,
                                    category,
                                    search,
                                    timeline,
                                });
                            }
                        });
                } else if (type == "follow" || type == "fans") {
                    title = type == "follow" ? "渐变-关注" : "渐变-粉丝";
                    personal
                        .getPersonalFollowAndFans(id, sid, currentPage, type)
                        .then(function (data) {
                            res.render("personal-" + type, {
                                goto,
                                title,
                                user: req.session.user,
                                data,
                                isSelf
                            });
                        });
                } else if (type == "collectarticle" || type == "likearticle") {
                    title =
                        type == "collectarticle" ?
                            "渐变-收藏的文章" :
                            "渐变-喜欢的文章";
                    personal
                        .getPersonalLikeAndCollect(id, sid, currentPage, type)
                        .then(function (data) {
                            res.render("personal-" + type, {
                                goto,
                                title,
                                user: req.session.user,
                                data,
                                isSelf
                            });
                        });
                } else if (type == "morearticle") {
                    title = "渐变-更多推荐文章";
                    personal
                        .getPersonalMoreArticle(id, sid, currentPage, type)
                        .then(function (data) {
                            res.render("personal-" + type, {
                                goto,
                                title,
                                user: req.session.user,
                                data,
                                isSelf
                            });
                        });
                } else {
                    res.redirect("/nopage");
                }
            } else {
                if (isSelf) {
                    setting.getProfile(id).then(function (data) {
                        res.render("personal-setting", {
                            title: "渐变-设置",
                            user: req.session.user,
                            data
                        });
                    });
                } else {
                    res.redirect("/is-not-your-setting");
                }
            }
        } else {
            res.redirect("/login");
        }
    });

    //写文章
    app.get("/write", function (req, res) {
        if (req.session.user) {
            write.getArticle(req.session.user.id).then(function (data) {
                res.render("write", {
                    title: "写文章",
                    user: req.session.user,
                    data
                });
            });
        } else {
            res.redirect("/login");
        }
    });

    app.get("/write/:articleid", function (req, res) {
        if (req.session.user) {
            var articleid = req.params.articleid;
            write
                .getArticle(req.session.user.id, articleid)
                .then(function (data) {
                    if (!data.singlearticle) {
                        res.redirect("/you-don't-have-this-article");
                    } else {
                        res.render("write", {
                            title: "写文章",
                            user: req.session.user,
                            data
                        });
                    }
                });
        } else {
            res.redirect("/login");
        }
    });

    //文章浏览
    app.get("/article/:userid/:articleid", function (req, res) {
        var userid = req.params.userid;
        var articleid = req.params.articleid;
        var sid = req.session.user ? req.session.user.id : "no";
        article.getArticle(userid, sid, articleid).then(function (data) {
            res.render("article", {
                title: "文章",
                user: req.session.user || "no",
                data
            });
        });
    });

    app.get("/about", function (req, res) {
        res.render("about", {
            title: "关于",
            user: req.session.user || "no"
        });
    });

    //发布文章
    app.post("/recommend", write.recommend);

    //发布文章
    app.post("/publisharticle", write.publishArticle);

    //添加文章分类
    app.post("/addcategory", write.addCategory);

    //删除文章
    app.post("/deletearticle", personal.deleteArticle);

    //存储头像
    app.post("/saveHeadImage", setting.saveHeadImage);

    //保存资料
    app.post("/saveprofile", setting.saveProfile);

    //修改密码
    app.post("/changepassword", setting.changepassword);

    //关注用户
    app.post("/followperson", getIndexData.followPerson);

    //取消关注用户
    app.post("/unfollowperson", getIndexData.unFollowPerson);

    //喜欢收藏文章
    app.post("/doarticle", article.doArticle);

    //取消喜欢收藏文章
    app.post("/undoarticle", article.undoArticle);

    //退出登录
    app.post("/logout", function (req, res) {
        req.session.destroy();
        res.json({});
    });

    //404页面
    app.get("*", function (req, res) {
        res.render("404");
    });
};