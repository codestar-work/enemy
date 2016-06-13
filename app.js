var express = require('express')
var app     = express()
var multer  = require('multer')
var upload  = multer({dest: 'uploads/'})
var crypto  = require('crypto')
var mongo   = require('mongodb').MongoClient

app.use(token)
app.use(express.static('public'))
app.engine('html', require('ejs').renderFile)
app.get ('/', home)
app.get ('/login', showLogin)
app.post('/login', upload.array(), checkLogin)
app.get ('/register', register)
app.post('/register', upload.array(), registerNewUser)
app.get ('/profile', showProfile)
app.listen(8000)

function home(req, res) {
	res.render('index.html')
}

function register(req, res) {
	res.render('register.html')
}

function registerNewUser(req, res) {
	var data = {}
	data.fullname = req.body.fullname
	data.email    = req.body.email
	data.password = encode(req.body.password)
	mongo.connect("mongodb://127.0.0.1/enemy",
		(e, db) => {
			db.collection('user').find({email: data.email})
			.toArray(
				(e, d) => {
					if (d.length == 0) {
						db.collection('user').insert(data)
						res.redirect('/login')
					} else {
						res.redirect('/register?Duplicated')
					}
				}
			)
		}	
	)
}

function encode(password) {
	return crypto.createHmac('sha512', password)
			.update('I miss you').digest('hex')
}

function showLogin(req, res) {
	res.render('login.html')
}

function checkLogin(req, res) {
	var e = req.body.email
	var p = encode(req.body.password)

	mongo.connect('mongodb://127.0.0.1/enemy',
		(error, db) => {
			db.collection('user').find({email:e, password:p})
			.toArray(
				(error, data) => {
					if (data.length == 0) {
						res.redirect('/login?Incorrect Password')
					} else {
						granted[req.token] = data[0]
						res.redirect('/profile')
					}
				}
			)
		}
	)
}

var granted = [ ]
function token(req, res, next) {
	// Cookie: token=123456789;data=value;
	if (req.headers.cookie == null) {
		req.headers.cookie = ''
	}
	var item = req.headers.cookie.split(';')
	for (var v of item) {
		// token=123456789
		var d = v.split('=')
		if (d[0] == 'token') {
			req.token = d[1]
		}
	}

	if (req.token == null) {
		req.token = parseInt(Math.random() * 1000000000)
					+ '-' +
					parseInt(Math.random() * 1000000000)
		res.set('Set-Cookie: token=' + req.token)
	}

	next()
}

function showProfile(req, res) {
	if (granted[req.token] == null) {
		res.redirect('/login')
	} else {
		res.render('profile.html', {user: granted[req.token]})
	}
}