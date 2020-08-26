const express = require('express');
const route = express.Router()

const Blog = require('../model/Blog')
const Category = require('../model/Category')


// route.get('/category/:category',(req,res)=>{
//     Category.find({category:req.params.category})
//     .populate('posts.post')
//     .exec((err,data)=>{
//         if(err) throw err
//         console.log(data)
//         res.render('client/category',{title:"Home",data:data})
//     })
   
// })


route.get('/',(req,res)=>{
    var perPage = 15;
    var page = req.params.page || 1;
    Blog.find()
    .populate('category')
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err,data)=>{
        if(err) throw err
        Blog.countDocuments({}).exec((err,count)=>{
           res.render('client/index',{title:"Home",data:data,category:'',current: page,
           pages: Math.ceil(count / perPage)}) 
        })
        
    })
})  

route.get('/category/:page',(req,res)=>{
    var perPage = 15;
    var page = req.params.page || 1;
    Blog.find()
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err,data)=>{
        if(err) throw err
        Blog.countDocuments({}).exec((err,count)=>{
            res.render('client/index',{title:"Home",data:data,category:'',current: page,
            pages: Math.ceil(count / perPage)}) 
        })
    })
})

route.get('/:id',(req,res)=>{
    let id = req.params.id;
    Blog.findById(id)
    .populate('category')
        .exec((err,data)=>{
            if(err) throw err
            res.render('client/saw',{title: data.heading ,data:data})
        })
})

module.exports = route;