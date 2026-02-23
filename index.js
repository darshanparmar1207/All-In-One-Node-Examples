const express = require('express')
const app = express()
const userModel = require('./models/user')
const CookieParser = require('cookie-parser')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(CookieParser())

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(3000)