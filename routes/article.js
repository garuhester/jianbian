var Article = require('../schemas/article');
var User = require('../schemas/user');

var getArticle = function(userid, articleid) {
    return new Promise(function(resolve, reject) {
        var data = {};
        User.findById(userid, function(err, user) {
            data.user = user;
            Article.findByIdAndUpdate(articleid, { '$inc': { 'lookNum': 1 } }, function(err, article) {
                data.article = article;
                resolve(data);
            });
        });
    });
}

module.exports = {
    getArticle,
}