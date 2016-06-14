var express  = require('express')
var app      = express()
var mongo    = require('mongodb').MongoClient
var mongoUrl = "mongodb://127.0.0.1/airport"
app.get('/', sendStatus)
app.get('/list', list)
app.get('/search', search)
app.listen(8100)

function search(req, res) {
    // req.query.name -> su
    var pattern = new RegExp(req.query.name)
    mongo.connect(mongoUrl, 
        (error, db) => db.collection('airport')
        .find({name: pattern}).toArray(
            (error, data) => res.send(data)
        )
    )
}

function sendStatus(req, res) {
    res.send({status: 'OK'})
}

function list(req, res) {
    mongo.connect(mongoUrl,
        (error, db) => {
            db.collection('airport').find().toArray(
                (error, data) => res.send(data)
            )
        }
    )
}