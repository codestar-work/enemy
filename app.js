var express = require('express')
var app     = express()
var multer  = require('multer')
var upload  = multer({dest: 'uploads/'})
var crypto  = require('crypto')

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

function encode(password) {
	return crypto.createHmac('sha512', password)
			.update('I miss you').digest('hex')
}