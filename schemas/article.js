var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//文章表
var ArticleSchema = new Schema({
    authorId: { type: String, ref: 'User' },
    title: String, //标题
    content: String, //内容
    text: String,
    tag: String, //文章标签
    lookNum: { type: Number, default: 0 }, //浏览数量
    msgNum: { type: Number, default: 0 }, //评论数
    likeNum: { type: Number, default: 0 }, //喜欢数量
    collectNum: { type: Number, default: 0 }, //收藏数量
    createTime: { type: Date, default: Date.now } //创建时间
});

module.exports = mongoose.model('Article', ArticleSchema);