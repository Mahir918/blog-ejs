const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var multer = require('multer')
const path = require('path');
const fs = require('fs');
const route = express.Router()


//userModule
var User = require('../model/User')
var Category = require('../model/Category')
var Blog = require('../model/Blog')

route.use(express.static(__dirname+ "./public/"))

//MiddleWare
const login = require('../middleware/token')

/* MiddleWare */ /* Image */
var storage = multer.diskStorage({
    destination: "./public/uploads" ,
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

var upload = multer({
    storage: storage
}).array('files',2)



//Token Save in Local-Storage
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}


//Start Login Form

route.get('/login', (req, res) => {
    if (localStorage.getItem('token')) {
        res.redirect('/sayem/admin/home')
    } else {
        res.render('backend/login', { title: 'Login', msg: '' })
    }
})

route.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var cheackMAil = User.findOne({ email: email })
    cheackMAil.exec((err, result) => {
        if (err) throw err
        var id = result._id;
        var getPassword = result.password;
        if (bcrypt.compareSync(password, getPassword)) {
            var token = jwt.sign({ userId: id }, 'loginToken')
            localStorage.setItem('token', token)
            res.redirect('/sayem/admin/home')
        } else {
            res.render('backend/login', { title: 'Login', msg: 'Invalid Email and Password' })
        }

    })

})
//Finish Log in Form

/* Log * Out Option */
route.get('/logout', (req, res) => {
    localStorage.removeItem('token')
    res.redirect('/sayem/admin/login')
})
/* Log * Out Done */

//Start Registration Form

route.get('/sam', (req, res) => {
    if (localStorage.getItem('token')) {
        res.redirect('/sayem/admin/home')
    } else {
        res.render('backend/register', { title: 'Registration Form', msg: '' })
    }
})

function checkEmail(req, res, next) {
    var email = req.body.email;
    var cheack = User.findOne({ email: email })
    cheack.exec((err, data) => {
        if (err) throw err
        if (data) {
            return res.render('backend/register', { title: 'Registration Form', msg: 'Email Already Exits!😭' })
        }
        next()
    })
}

route.post('/sam', checkEmail, (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    if (password.length >= 6) {
        if (password !== password2) {
            res.render('backend/register', { title: 'Registration Form', msg: "Password Doesn't match" })
        } else {
            password = bcrypt.hashSync(password, 10)
            var user = new User({
                name: name,
                email: email,
                password: password
            })
            user.save((err, data) => {
                if (err) throw err
                res.render('backend/register', { title: 'Registration Form', msg: 'User Register Successfully 😎| Now You can Login' })
            })
        }
    } else {
        res.render('backend/register', { title: 'Registration Form', msg: 'Password Mast Be Greater Than or Equal 6!' })
    }
})

//Finish Registration Form

//Statrt Home
route.get('/home', login, (req, res) => {
    res.render('backend/Home', { title: 'Home', msg: '' })
})


function category(req, res, next) {
    var category = req.body.category;
    var cheack = Category.findOne({ category: category })
    cheack.exec((err, data) => {
        if (err) throw err
        if (data) {
            return res.render('backend/home', { title: 'Registration Form', msg: 'Category Already Exits!😭' })
        }
        next()
    })
}

route.post('/home', category, login, (req, res) => {
    var category = req.body.category
    var slug = req.body.category.toLowerCase()

    let newCategory = new Category({
        category: category,
        slug: slug,
        posts: []
    })
    newCategory.save((err, data) => {
        if (err) throw err
        res.redirect('/sayem/admin/category')
    })
})




//Start Category 
route.get('/category', login, (req, res) => {
    Category.find()
        .exec((err, data) => {
            if (err) throw err
            res.render('backend/category', { title: 'Category', data: data })
        })
})

route.get('/category/delete/:id', login, (req, res) => {
    let id = req.params.id;
    Category.findByIdAndRemove(id)
        .then(result => {
            res.redirect('/sayem/admin/category')
        })
        .catch(err => {
            res.render('backend/category', { title: 'Category' })
        })
})

route.get('/category/edit/:id', login, (req, res) => {
    let id = req.params.id;
    let edit = Category.findById(id)
    edit.exec((err, data) => {
        if (err) throw err;
        res.render('backend/edit-cat', { title: 'Category', id: id, data: data })
    })
})

route.post('/category/edit/',login, (req, res) => {
    let id = req.body.id;
    let editCategory = req.body.category;
    var slug = req.body.category.toLowerCase()
    let update = Category.findByIdAndUpdate(id, { category: editCategory, slug: slug })
    update.exec((err, data) => {
        if (err) throw err;
        res.redirect('/sayem/admin/category')
    })
})


//Blog Options

route.get('/category/post/:id', login,(req, res) => {
    let id = req.params.id;
    res.render('backend/blog', { title: "Post", id: id })
})


route.post('/category/post/',upload, login,(req, res) => {
    const reqFiles = [];
    for(var i = 0; i<req.files.length; i++){
        reqFiles.push(req.files[i].filename)
    }

    var heading = req.body.heading
    var category = req.body.id
    var description = req.body.editor1

    var post = new Blog({
        heading:heading,
        image:reqFiles,
        category: category,
        description:description,
    })
    post.save()
    .then((cat)=>{
        return Category.findOneAndUpdate({_id:req.body.id},{$push:{posts: cat._id}},{new:true})
    })
    .then(result=>{
        res.redirect('/sayem/admin/category')
    })
})

//Display Blog
route.get('/all-post',login,(req,res)=>{
    Blog.find()
    .exec((err,data)=>{
        if(err) throw err
        
        res.render('backend/display',{title: 'All Post', data:data})
    })
})

route.get('/all-post/:id',(req,res)=>{
    let id = req.params.id;
    Blog.findById(id)
        .populate('category')
        .exec((err,data)=>{
            if(err) throw err
            res.render('backend/read',{title: 'All Post', data:data})
        })
})

route.get('/all-post/delete/:id',login,(req,res)=>{
    var id = req.params.id;
    Blog.findByIdAndRemove(id)
    .then((result)=>{
        res.redirect('/sayem/admin/all-post')
    })
    .catch((err)=>{
        res.render('backend/display',{title: 'All Post', data:data})
    })
    
})




module.exports = route