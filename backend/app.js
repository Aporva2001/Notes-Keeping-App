const express= require('express')
const bodyParser= require('body-parser')
const path= require('path')

const mongoose= require('mongoose');

const feedRoutes= require('./routes/feed');
const authRoutes= require('./routes/auth');
require('dotenv').config()

const multer= require('multer');
const { v4: uuidv4 } = require('uuid');

const app= express();

const fileStorage= multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images');
    },
    filename: (req, file, cb)=>{
        cb(null, uuidv4())
    }
})

const fileFilter= (req, file, cb)=>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()) // This is used for url encoded data that is passed through forms.
app.use(bodyParser.json()) // This is used for parsing the json data. It parses the incoming requests and convert it to json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use('/images',express.static(path.join(__dirname, 'images')))
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin','*') // * is a wildcard, which means that access can be made from any domain.
    // Only allowing origins does not work, we need to specify what operations can be done on the data which is sent to the server.

    res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, DELETE, PATCH')
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')
    next();
})
app.use('/feed',feedRoutes)
app.use('/auth',authRoutes);

app.use((error, req, res, next) =>{
    console.log(error);
    const status= error.statusCode; 
    const message= error.message // This property is available by default in the error handler.
    const data= error.data;
    res.status(status).json({message: message, data: data})
})

mongoose.connect(`${process.env.MONGODB_URI}`).then(res =>{
    console.log('Database connected successfully');
    app.listen(process.env.PORT);
}).catch(err => console.log('Database connection failed'))