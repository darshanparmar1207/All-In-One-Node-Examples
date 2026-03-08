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

app.get('/profile', isLoggedIn,  async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}).populate('posts')
    res.render('profile', {user})
});

// Like Post
app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post = await Postmodel.findById(req.params.id);
    let userId = req.user.userid;

    // agar like nahi hai to add karo
    if (post.likes.indexOf(userId) === -1) {
        post.likes.push(userId);
    } 
    // agar like hai to remove karo
    else {
        post.likes.splice(post.likes.indexOf(userId), 1);
    }

    await post.save();
    res.redirect('/profile');
});

// Edit Post
app.get('/edit/:id', isLoggedIn, async (req, res) => {
  let post = await Postmodel.findById(req.params.id).populate('user');

  res.render('edit')
});

// Create Post
app.post('/post', isLoggedIn,  async (req, res) => {
    let user = await userModel.findOne({email: req.user.email})
    let {content} = req.body
   let post = await Postmodel.create({
        user: user._id,
        content
    })

    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
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
        if(result) 
            {
                let token = jwt.sign({email : email, userid: user._id}, "secretkey",)
                res.cookie("token", token)
                res.status(200).redirect('/profile')
            }
        else res.redirect('/login')
    })
})

// Logout User
app.get('/logout', (req, res) => {
    res.cookie("token","")
    res.redirect('/login')
})

// middleware to check if user is authenticated or not
function isLoggedIn(req, res, next) {
    if(req.cookies.token === "") res.redirect('/login') 
        else {
           let data = jwt.verify(req.cookies.token, "secretkey")
           req.user = data
           next()
        }
}



app.listen(3000)