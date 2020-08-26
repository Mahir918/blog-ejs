const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    category:{
        type:String,
        required:true,
        unique:true
    },
    slug:{
        type:String,
        trim:true
    },
    posts:[
        {
            post:{
                type:Schema.Types.ObjectId,
                ref: 'posts' 
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
})

const Category  = mongoose.model('categories', categorySchema)
module.exports = Category