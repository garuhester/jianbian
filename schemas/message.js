var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    userId: String,
    messageList: [{
        otherUserId: String,
        messageContent: String
    }],
    createTime: { type: Date, default: Date.now }
});

module.exports = mongoose.Model('Message', Message);