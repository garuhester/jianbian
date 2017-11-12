var User = require('../schemas/user')

var doLogin = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var whereStr = { 'name': username };
    User.find(whereStr, function(err, user) {
        if (err) {
            console.log(err);
            return err;
        }
        if (user.length == 0) {
            //没有该用户
            res.json({ result: 0 });
        } else {
            var p = user[0].password;
            if (p == password) {
                var u = {
                    "id": user[0]._id,
                    "name": user[0].name
                }
                req.session.user = u;
                res.json({ result: 2, u: { name: user[0].name, pwd: user[0].password } });
            } else {
                //密码错误
                res.json({ result: 1 });
            }
        }
    });
}

module.exports = {
    doLogin,
}