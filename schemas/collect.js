var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户收藏和喜欢的文章表
var CollectSchema = new Schema({
    userId: { type: String, ref: 'User' },
    collectList: [{
        articleId: { type: String, ref: 'Article' },
        collectType: Number, //0代表收藏的文章，1代表喜欢的文章
        collectTime: { type: Date, default: Date.now }
    }],
    collectNum: { type: Number, default: 0 }, //收藏的文章数
    likeNum: { type: Number, default: 0 }, //喜欢的文章数
    createTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collect', CollectSchema);