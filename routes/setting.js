var User = require('../schemas/user');

var getProfile = function(id) {
    return new Promise(function(resolve, reject) {
        User.findById(id, function(err, user) {
            if (err) {
                console.log(err);
                return err;
            }
            resolve(user);
        });
    });
}

var saveProfile = function(req, res) {
    var id = req.session.user.id;
    var postdata = req.body;
    var updateStr = { 'name': postdata.name, 'headImage': postdata.headImage, 'gender': postdata.gender, 'age': postdata.age, 'tel': postdata.tel, 'email': postdata.email, 'content': postdata.content };
    User.findByIdAndUpdate(id, updateStr, function(err, data) {
        if (err) {
            console.log(err);
            return err;
        }
        res.json({ result: 'success' });
    });
}

var changepassword = function(req, res) {
    var id = req.session.user.id;
    var pos = { 'password': 1 };
    var postdata = req.body;
    User.findById(id, pos, function(err, user) {
        if (err) {
            console.log(err);
            return err;
        }
        if (postdata.nowpwd != user.password) {
            res.json({ result: 'samenowpwd' });
        } else {
            var updateStr = { 'password': postdata.newpwd };
            User.findByIdAndUpdate(id, updateStr, function(err, r) {
                if (err) {
                    console.log(err);
                    return err;
                }
                req.session.destroy();
                res.json({ result: 'changepasswordsuccess' });
            });
        }
    });
}

var saveHeadImage = function(req, res) {
    var path = req.files[0].path;
    path = path.replace('static', '');
    var id = req.session.user.id;
    User.findByIdAndUpdate(id, { 'headImage': path }, function(err, ok) {
        if (ok) {
            res.json({ result: path });
        }
    });
}

module.exports = {
    getProfile,
    saveProfile,
    changepassword,
    saveHeadImage,
}