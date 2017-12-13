var Article = require('../schemas/article');
var User = require('../schemas/user');

var saveArticle = function(req, res) {
    var data = req.body;
    var id = req.session.user.id;
    //用户文章数+1
    User.findByIdAndUpdate(id, { '$inc': { 'articleNum': 1 } }, function(err, val) {
        if (err) {
            console.log(err);
            return err;
        }
    });

    //插入新的文章
    var a = new Article({
        authorId: id,
        title: data.title,
        tag: data.tag,
        content: data.content,
        text: data.text
    });
    a.save(function(err, a) {
        User.findByIdAndUpdate(id, { '$push': { 'articleList': { 'articleId': a._id } } }, function(err, art) {
            res.json({ result: 'ok' });
        });
    });
}

var getArticle = function (userid, articleid){
    return new Promise(function(resolve,reject){
        var data = [];
        if (articleid){
            User.findById(userid, function (err, user) {
                data.user = user;
                Article.find({ "authorId": userid }).sort({ "createTime": -1 }).exec(function (err, arti) {
                    data.article = arti;
                    Article.findById(articleid,function(err,singlearticle){
                        data.singlearticle = singlearticle;
                        resolve(data);
                    });
                });
            });
        }else{
            User.findById(userid, function (err, user) {
                data.user = user;
                Article.find({ "authorId": userid }).sort({"createTime":-1}).exec(function (err, arti) {
                    data.article = arti;
                    data.singlearticle = "";
                    resolve(data);
                });
            });
        }
    });
}

module.exports = {
    saveArticle,
    getArticle,
}