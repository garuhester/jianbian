var login = require('./login');
var register = require('./register');
var getIndexData = require('./getIndexData');
var setting = require('./setting');
var write = require('./write');
var personal = require('./personal');
var follow = require('./follow');
var article = require('./article');

//日期插件
var moment = require('moment');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: 'static/headimage',
    filename: function(req, file, cb) {
        var id = req.session.user.id;
        var end = file.originalname.split('.')[1];
        cb(null, `${id}.${end}`);
    }
});
var upload = multer({ storage });

module.exports = function(app) {

    //ejs中使用的函数
    app.locals.dateFormat = function(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }

    app.use(upload.array('headimage'));

    //登录
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '登录博客'
        });
    });
    //登录请求
    app.post('/login', login.doLogin);

    //注册
    app.get('/register', function(req, res) {
        res.render('register', {
            title: '注册博客'
        });
    });
    //注册请求
    app.post('/register', register.doRegister);

    //首页 
    app.get('/', function(req, res) {
        var currentPage = req.query.page || 1;
        var articleName = req.query.articlename || 'nosearch';
        if (req.session.user) {
            getIndexData.getData(req.session.user.id, currentPage, articleName).then(function(data) {
                res.render('index', {
                    title: '渐变-首页',
                    user: req.session.user,
                    data,
                });
            });
        } else {
            getIndexData.getData(null, currentPage, articleName).then(function(data) {
                res.render('index', {
                    title: '渐变-首页',
                    user: 'no',
                    data,
                });
            });
        }
    });

    //关注
    app.get('/follow/:id', function(req, res) {
        if (req.session.user) {
            var selfid = req.session.user.id;
            var id = req.params.id;
            var currentPage = req.query.page || 1;
            follow.getFollowAllData(selfid, id, currentPage).then(function(data) {
                //渐变圈
                if (id == 'add') {
                    res.render('follow-add', {
                        title: '渐变-添加关注',
                        user: req.session.user,
                        data,
                    });
                } else {
                    res.render('follow', {
                        title: '渐变-关注',
                        user: req.session.user,
                        data,
                    });
                }
            });
        } else {
            res.redirect('/login');
        }
    });

    //消息
    app.get('/message', function(req, res) {
        if (req.session.user) {
            res.render('message', {
                title: '渐变-消息',
                user: req.session.user
            });
        } else {
            res.redirect('/login');
        }
    });

    //个人中心
    app.get('/personal/:type/:id', function(req, res) {
        if (req.session.user) {
            var title;
            //个人中心类型
            var type = req.params.type;
            var id = req.params.id; //其他用户个人中心的id
            var goto = req.params.id; //其他用户个人中心跳转参数
            var isSelf; //是否是自己的个人中心
            if (id == req.session.user.id) {
                id = req.session.user.id;
                isSelf = true;
            } else {
                isSelf = false;
            }
            var currentPage = req.query.page || 1;
            if (type != 'setting') {
                if (type == 'article') {
                    title = '渐变-文章';
                    personal.getPersonalArticle(id, currentPage).then(function(data) {
                        res.render('personal-article', {
                            goto,
                            title,
                            user: req.session.user,
                            data,
                            isSelf,
                        });
                    });
                } else if (type == 'follow' || type == 'fans') {
                    if (type == 'follow') title = '渐变-关注';
                    else title = '渐变-粉丝';
                    personal.getPersonalFollowAndFans(id, currentPage, type).then(function(data) {
                        res.render('personal-' + type, {
                            goto,
                            title,
                            user: req.session.user,
                            data,
                            isSelf,
                        });
                    });
                } else if (type == 'collectarticle') {
                    title = '渐变-收藏的文章';
                    res.render('personal-collectarticle', {
                        goto,
                        title,
                        user: req.session.user,
                        isSelf,
                    });
                } else if (type == 'likearticle') {
                    title = '渐变-喜欢的文章';
                    res.render('personal-likearticle', {
                        goto,
                        title,
                        user: req.session.user,
                        isSelf,
                    });
                }
            } else {
                setting.getProfile(id).then(function(data) {
                    res.render('personal-setting', {
                        title: '渐变-设置',
                        user: req.session.user,
                        data,
                    });
                });
            }
        } else {
            res.redirect('/login');
        }
    });

    //写文章
    app.get('/write', function(req, res) {
        if (req.session.user) {
            res.render('write', {
                title: '写文章',
                user: req.session.user
            });
        } else {
            res.redirect('/login');
        }
    });

    app.get('/article/:userid/:articleid', function(req, res) {
        if (req.session.user) {
            var userid = req.params.userid;
            var articleid = req.params.articleid;
            article.getArticle(userid, articleid).then(function(data) {
                res.render('article', {
                    title: '文章',
                    user: req.session.user,
                    data,
                });
            });
        } else {
            var userid = req.params.userid;
            var articleid = req.params.articleid;
            article.getArticle(userid, articleid).then(function(data) {
                res.render('article', {
                    title: '文章',
                    user: 'no',
                    data,
                });
            });
        }
    });

    //保存文章
    app.post('/savearticle', write.saveArticle);

    //删除文章
    app.post('/deletearticle', personal.deleteArticle);

    //存储头像
    app.post('/saveHeadImage', setting.saveHeadImage);

    //保存资料
    app.post('/saveprofile', setting.saveProfile);

    //修改密码
    app.post('/changepassword', setting.changepassword);

    //关注用户
    app.post('/followperson', getIndexData.followPerson);

    //取消关注用户
    app.post('/unfollowperson', getIndexData.unFollowPerson);

    //退出登录
    app.post('/logout', function(req, res) {
        req.session.destroy();
        res.json({});
    });
}