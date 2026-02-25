const express = require('express')
const app = express()
const userModel = require('./models/user')
const Postmodel = require('./models/post')
const CookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(CookieParser())

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/profile', isLoggedIn, (req, res) => {
    console.log(req.user)
    res.render('login')
});

// Create Account
app.post('/register', async (req, res) => {
    let {username, name, age, email, password} = req.body

    // that is check if user already exists or not
   let user = await userModel.findOne({email})
    if(user) return res.status(500).send('User already exists')

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
           let user = await userModel.create({
                username,
                name,
                age,
                email,
                password: hash
            })

           let token = jwt.sign({email : email, userid: user._id}, "secretkey",)
           res.cookie("token", token)
           res.send('User created successfully')
        })
    })
})

// Login User
app.post('/login', async (req, res) => {
    let {email, password} = req.body

    // that is check if user already exists or not
   let user = await userModel.findOne({email})
    if(!user) return res.status(500).send('Something went wrong')

    bcrypt.compare(password, user.password, (err, result) => {
        if(result) res.status(200).send('Login successfully')
        else res.redirect('login').send('Invalid credentials')
    })
})

// Logout User
app.get('/logout', (req, res) => {
    res.cookie("token","")
    res.redirect('/login')
})

// middleware to check if user is authenticated or not
function isLoggedIn(req, res, next) {
    if(req.cookies.token === "") res.send('You are not authenticated') 
        else {
           let data = jwt.verify(req.cookies.token, "secretkey")
           req.user = data
           next()
        }
    }


app.listen(3000)