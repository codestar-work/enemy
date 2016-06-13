var express = require('express')
var app = express()
var multer = require('multer')
var upload = multer({dest: 'uploads/'})

app.use(express.static('public'))
app.engine('html', require('ejs').renderFile)
app.get('/', home)
app.get ('/register', register)
app.post('/register', upload.array(), registerNewUser)
app.listen(8000)

function home(req, res) {
	res.render('index.html')
}

function register(req, res) {
	res.render('register.html')
}

function registerNewUser(req, res) {
	console.log(req.body)
	res.redirect('/')
}