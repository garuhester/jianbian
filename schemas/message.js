var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    userId: String,
    messageList: [{
        otherUserId: { type: String, ref: 'User' },
        artId: String,
        msgContent: String,
        msgType: Number, // 0: 收藏 1: 喜欢 2: 关注
        msgTime: { type: Date, default: Date.now }
    }],
    createTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);