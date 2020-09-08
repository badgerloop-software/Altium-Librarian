require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const qs = require('qs');
const db = require('diskdb');
const server = express();
const webhookURL = process.env.URL;
const PORT = process.env.PORT;

db.connect('./data', ['librarian']);

server.use(bodyParser.urlencoded({
  extended:false
}));
server.listen(PORT, () => {
  console.log(`The Party has started on port ${PORT}`);
});
let currentLibrarian;

server.get('/', (req, res) => {
  res.json({message: `${currentLibrarian}`});
});

server.post('/checkin', (req, res) => {
  let json = qs.parse(req);
  let librarians = db.librarian.find();
  if (librarians.length) {
      res.status(200);
      res.type('json');
    return res.send(`${db.librarian.findOne().name} is already the librarian`);
  } else {
  const currLibrarian = {name: `${json.body.user_name}`, current: true};
    db.librarian.save(currLibrarian);
  console.log(db.librarian.find());
  res.status(200);
  res.type('json');
  res.send({
  	"response_type": "in_channel",
  	"text": `${json.body.user_name} is now the librarian`
  });
  }
});


server.post('/checkout', (req, res) => {
  let json = qs.parse(req);
  let currentLibrarian = db.librarian.findOne();
    if (currentLibrarian) {
        if (currentLibrarian.name === json.body.user_name) {
    db.librarian.remove({current: true});
  res.status(200);
  res.type('json');
  res.send({
	  "response_type": "in_channel",
	  "text": `${json.body.user_name} is no longer the librarian`
  });
} else {
    res.status(200);
    res.type('json');
    res.send('You can not check out of librarian, someone is already checked in');
}
} else {
    res.status(200);
    res.type('json');
    res.send('No one is currently the librarian, you can check in to the position');
}
});

server.post('/whois', (req, res) => {
    console.log(db.librarian.find());
    if (db.librarian.count() === 1) {
        res.status(200);
        res.type('json');
        res.send({
            "response_type": "in_channel",
            "text": `${db.librarian.findOne().name} is currently the librarian`
        });
    } else {
        res.status(200);
        res.type('json');
        res.send({
            "response_type": "in_channel",
            "text": 'No one is currently the librarian'
        });
    }
});

function sendCheckIn(url,username) {
  let options = {
    uri: url,
    method: 'POST',
    json: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${username} is now the librarian`
        }
      }
    ]
  }
  console.log('Sending');
  request(options, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      console.log(body);
    }
    console.log('Sent')
  })
}
