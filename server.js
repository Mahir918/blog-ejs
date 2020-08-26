const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const logger = require('morgan')
const path = require('path');
const app = express()

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))

 app.use(express.static('public'))

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


app.use('/sayem/admin',require('./routes/backed'))

app.use('/',require('./routes/client'))

const port = process.env.PORT || 3000
app.listen(port,()=> {
    mongoose.connect(`mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@cluster0-qzv1e.mongodb.net/blog-app?retryWrites=true&w=majority`,{
        useNewUrlParser:true,
        useCreateIndex:true, 
        useUnifiedTopology: true
    })
})