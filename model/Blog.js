const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    heading:{
        type:String
    },
    image:{
        type:Array,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'categories'
    },
    description:{
        type:String,
    },
    zip:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const Blog  = mongoose.model('posts', blogSchema)
module.exports = Blog
