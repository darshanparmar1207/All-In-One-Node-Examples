const express = require('express')
const app = express()
const userModel = require('./models/user')
const CookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(CookieParser())

app.get('/', (req, res) => {
    res.render('index')
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
        })
    })
})

app.listen(3000)