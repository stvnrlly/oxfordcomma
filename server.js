var express = require('express')
var Twit = require('twit')
var fs = require('fs')

var app = express()
app.use(express.static(__dirname + '/public'))

var twit = new Twit({
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET
});

var count = JSON.parse(fs.readFileSync('./public/count.json', 'utf8'))

app.get('/', function (req, res) {
  res.render('index')
})

app.listen(process.env.PORT || 8080)

var stream = twit.stream('statuses/sample')
var yes = /\w+,\s\w+,\sand\s\w+/
var no = /\w+,\s\w+\sand\s\w+/

stream.on('tweet', function (tweet) {
  if (yes.test(tweet['text'])) {
    count['yes'] += 1
    console.log(tweet['text'])
    console.log(count)
    fs.writeFileSync('./public/count.json', JSON.stringify(count))
  } else if (no.test(tweet['text'])) {
    count['no'] += 1
    console.log(tweet['text'])
    console.log(count)
    fs.writeFileSync('./public/count.json', JSON.stringify(count))
  }
})