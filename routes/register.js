var User = require('../schemas/user');
var Article = require('../schemas/article');
var Follow = require('../schemas/follow');
var Collect = require('../schemas/collect');

var doRegister = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var apassword = req.body.apassword;
    var whereStr = { 'name': username };
    User.find(whereStr, function (err, user) {
        if (err) {
            console.log(err);
            return err;
        }
        if (user.length != 0) {
            //用户名已经存在
            res.json({ result: 0 });
        } else {
            var u = new User({
                name: username,
                password,
            });
            u.save(function (err, r) {
                var f = new Follow({
                    userId: r._id,
                });
                f.save(function (err, f) {
                    var c = new Collect({
                        userId: r._id,
                    });
                    c.save(function (err, c) {
                        User.findByIdAndUpdate(r._id, {
                            $push: {
                                categoryList: {
                                    categoryName: 'nocate'
                                }
                            }
                        }, function (err, cate) {
                            //注册成功
                            res.json({ result: 1 });
                        });
                    });
                });
            });
        }
    });
}

module.exports = {
    doRegister,
}