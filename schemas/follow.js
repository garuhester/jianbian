var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户关注和被关注表
var FollowSchema = new Schema({
    userId: { type: String, ref: 'User' },
    followList: [{
        followId: { type: String, ref: 'User' },
        followType: Number, //0表示用户关注，1表示用户被关注
        followTime: { type: Date, default: Date.now }
    }],
    followNum: { type: Number, default: 0 }, //关注数
    fansNum: { type: Number, default: 0 }, //粉丝数
    createTime: { type: Date, default: Date.now } //创建时间
});

module.exports = mongoose.model('Follow', FollowSchema);