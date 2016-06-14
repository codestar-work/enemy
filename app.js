var express = require('express')
var app     = express()
var multer  = require('multer')
var upload  = multer({dest: 'uploads/'})
var crypto  = require('crypto')
var mongo   = require('mongodb').MongoClient
var fs      = require('fs')

app.use(token)
app.use(express.static('public'))
app.use(express.static('uploads'))
app.engine('html', require('ejs').renderFile)
app.get ('/', home)
app.get ('/login', showLogin)
app.post('/login', upload.array(), checkLogin)
app.get ('/register', register)
app.post('/register', upload.array(), registerNewUser)
app.get ('/profile', showProfile)
app.post('/save-photo', upload.single('photo'))
app.post('/save-photo', savePhoto)
app.get ('/logout', logout)
app.get ('/airport', searchAirport)
app.get ('/search', search)
app.listen(8000)

function searchAirport(req, res) {
	res.render('airport.html')
}

function search(req, res) {
    var pattern = new RegExp(req.query.name, "i")
    mongo.connect("mongodb://127.0.0.1/airport", 
        (error, db) => db.collection('airport')
        .find({name: pattern}).toArray(
            (error, data) => res.send(data)
        )
    )
}

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
		res.set('Set-Cookie', 'token=' + req.token)
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

function savePhoto(req, res) {
	var data = req.file.originalname.split('.')
	var ext  = data[data.length - 1]
	if (ext == 'jpg' || ext == 'png' || ext == 'gif') {
	} else {
		ext = 'png'
	}
	fs.renameSync(req.file.path, req.file.path + '.' + ext)
	
	var user = granted[req.token];
	user.photo = req.file.filename + '.' + ext
	mongo.connect('mongodb://127.0.0.1/enemy',
		(error, db) => {
			var x = {}
			x._id = user._id
			db.collection('user').update(x, user)
			res.redirect('/profile')
		}	
	)
}

function logout(req, res) {
	delete granted[req.token]
	res.render('logout.html')
}