require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const qs = require('qs');
const server = express();
const webhookURL = process.env.URL;
const PORT = process.env.PORT;
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
  console.log(json.body);
  currentLibrarian = json.body.user_name;
  sendCheckIn(json.body.response_url, json.body.user_name);
  console.log(currentLibrarian);
  res.status(200);
  res.send();
});


function sendCheckIn(url,username) {
  let options = {
    uri: webhookURL,
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
