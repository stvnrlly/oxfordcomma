var express = require('express')
var Twit = require('twit')
var http = require('http')

// Retrieve
var mongo = require('mongodb').MongoClient;
var MONGODB_URI = process.env.MONGOLAB_URI || "mongodb://localhost"

// Twitter credentials
var twit = new Twit({
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET
});

var app = express()
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
  res.render('index')
})

var server = http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
});
var io = require('socket.io').listen(server);

// Connect to the db
mongo.connect(MONGODB_URI, function(err, db) {
    if(!err) {
        console.log("Connected to MongoDB");
    }
    var collection = db.collection('oxford');
    collection.findOne({'type':'yes'}, function(err, doc){
        if(doc == null){
            collection.insert({'type':'yes','count':0}, {w:1}, function(err, result) {})
        }
    })
    collection.findOne({'type':'no'}, function(err, doc){
        if(doc == null){
            collection.insert({'type':'no','count':0}, {w:1}, function(err, result) {})
        }
    })

    var stream = twit.stream('statuses/sample')
    var yes = /\w+,\s\w+,\sand\s\w+/
    var no = /\w+,\s\w+\sand\s\w+/

    stream.on('tweet', function (tweet) {
        if (yes.test(tweet['text'])) {
            console.log(tweet['text'])
            collection.findAndModify({'type':'yes'},[[ '_id', 1]], {$inc:{'count':1}}, {new:true}, function(err, result) {
                io.emit('yes', result['count'])
                console.log(result['count'])
            })
        } else if (no.test(tweet['text'])) {
            console.log(tweet['text'])
            collection.findAndModify({'type':'no'},[[ '_id', 1]], {$inc:{'count':1}}, {new:true}, function(err, result) {
                io.emit('no', result['count'])
                console.log(result['count'])
            })
        }
    })

    io.on('connection', function(socket){
        socket.on('ready', function(data){
            collection.findOne({'type':'yes'}, {'count':true}, function(err, doc){
                socket.emit('yes', doc['count'])
            })
            collection.findOne({'type':'no'}, {'count':true}, function(err, doc){
                socket.emit('no', doc['count'])
            })
        });
    })
});
