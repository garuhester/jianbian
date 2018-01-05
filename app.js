var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var mongodb = require('./ConnectMongodb');

var ueditor = require('ueditor');
var path = require('path');

//初始化路由
var route = require('./routes/index');

//初始化express
var app = express();

//初始化ejs
app.set('views', './views/pages'); //设置视图根目录
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

//初始化静态资源
app.use(express.static('./static'));

//初始化body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//初始化session和cookie
app.use(cookieParser('hesterblog'));
app.use(session({
    secret: 'hesterblog',
    name: 'hesterblog',
    resave: true,
    cookie: { maxAge: 3600000 },
    saveUninitalized: true,
}));

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'static'), {
    qn: {
        accessKey: '4pcaQd1rA-L03YGdc9DfsMhQDwHV-XM4_NAXwevF',
        secretKey: '5DfkfIcoQxUUDuxQLP2VrLFhFSqI-3ea7n_hOAMw',
        bucket: 'blog',
        origin: 'http://oyoi2e46i.bkt.clouddn.com'
    }
}, function (req, res, next) {
    //客户端上传文件设置  
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = '/image/ueditor/'; //默认图片上传地址  
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件  
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频  
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做  
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求  
    else if (req.query.action === 'listimage') {
        var dir_url = '/image/ueditor/';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片  
    }
    // 客户端发起其它请求  
    else {
        // console.log('config.json')  
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));

//连接数据库
mongodb.connect();

app.listen(8080, function (err) {
    if (err) return err;
    console.log("http://localhost:8080");
});

route(app);