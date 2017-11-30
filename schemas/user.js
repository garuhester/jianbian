var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户基本信息表
var UserSchema = new Schema({
    name: String, //姓名
    password: String, //密码
    headImage: { type: String, default: '/headimage/no.png' }, //头像
    gender: String, //性别
    age: Number, //年龄
    tel: String, //电话
    email: String, //邮箱
    content: String, //个人介绍
    articleNum: { type: Number, default: 0 }, //文章数
    followNum: { type: Number, default: 0 }, //关注数
    fansNum: { type: Number, default: 0 }, //粉丝数
    articleList: [{
        articleId: { type: String, ref: 'Article' }
    }],
    categoryList: [{
        categoryName: String, //分类名称
        categoryNum: { type: Number, default: 0 }
    }],
    createTime: { type: Date, default: Date.now } //创建时间
});

module.exports = mongoose.model('User', UserSchema);