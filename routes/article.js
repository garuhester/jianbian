var Article = require('../schemas/article');
var Follow = require('../schemas/follow');
var User = require('../schemas/user');

var getArticle = function(userid, sid, articleid) {
    return new Promise(function(resolve, reject) {
        var data = {};
        User.findById(userid, function(err, user) {
            data.user = user;
            if (sid != 'no') {
                Follow.find({ 'userId': sid, 'followList': { '$elemMatch': { 'followId': userid, 'followType': 0 } } }, function(err, result) {
                    if (result != 0) {
                        data.isFollow = true;
                    } else {
                        data.isFollow = false;
                    }
                    Article.findByIdAndUpdate(articleid, { '$inc': { 'lookNum': 1 } }, function(err, article) {
                        data.article = article;
                        resolve(data);
                    });
                });
            } else {
                Article.findByIdAndUpdate(articleid, { '$inc': { 'lookNum': 1 } }, function(err, article) {
                    data.article = article;
                    resolve(data);
                });
            }
        });
    });
}

module.exports = {
    getArticle,
}