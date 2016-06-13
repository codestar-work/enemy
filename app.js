var express = require('express')
var app = express()
app.engine('html', require('ejs').renderFile)
app.get('/', home)
app.get('/register', register)
app.listen(80)

function home(req, res) {
	res.render('index.html')
}

function register(req, res) {
	res.render('register.html')
}