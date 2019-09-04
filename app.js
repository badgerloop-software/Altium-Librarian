require('dotenv').config();
const express = require('express');
const request = require('request');
const qs = require('qs');
const server = express();
const webhookURL = process.env.URL;
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`The Party has started on port ${PORT}`);
});
let currentLibrarian;

server.get('/', (req, res) => {
  res.json({message: `${currentLibrarian}`});
});

server.get('/checkin', (req, res) => {
  let json = qs.parse(req);
  currentLibrarian = json.user_name;
  sendCheckIn(json.user_name);
  console.log(currentLibrarian);
});


function sendCheckIn(username) {
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
  request(options, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      console.log(body);
    }
  })
}
