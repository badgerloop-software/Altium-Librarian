require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const qs = require('qs');
//const db = require('diskdb');
const server = express();
const webhookURL = process.env.URL;
const PORT = process.env.PORT;

db.connect('/apps/Altium-Librarian/data', ['librarian']);

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


/**
 * Checks in a user as the librarain
 */
server.post('/checkin', (req, res) => {
  let json = qs.parse(req); // Parse the API request, returns a json
  let librarians = db.librarian.find(); // Get all librarians in the DB (should only be one at all times, so we can assume this will be either 1 or 0)
  if (librarians.length) { // If there are 1+ (since we assume 1 or 0, this means **A** librarian)
      res.status(200); // Good status
      res.type('json'); // Prep to send a json
    return res.send({"response":`${db.librarian.findOne().name} is already the librarian`}); // Send response
  } else { // Else there are 0 librarians
  const currLibrarian = {name: `${json.body.user_name}`, current: true}; // Create json to save
    db.librarian.save(currLibrarian); // Save it to DB (which will become write to file
  console.log(db.librarian.find()); // For logging purposes
  res.status(200); // Good status
  res.type('json'); // Prep to send a json
  res.send({ // Response
  	"response_type": "in_channel",
  	"response": `${json.body.user_name} is now the librarian`
  });
  }
});

/**
 * Checks a user out of the the librarian role
 */
server.post('/checkout', (req, res) => {
  let json = qs.parse(req); // Gets json from API request
  let currentLibrarian = db.librarian.findOne(); // Fuck it get librarian
    if (currentLibrarian) { // If there is a librarian
        if (currentLibrarian.name === json.body.user_name) { // And user checking out IS the librarian
    db.librarian.remove({current: true}); // checkout (remove from DB)
  res.status(200); 
  res.type('json');
  res.send({
	  "response_type": "in_channel",
	  "response": `${json.body.user_name} is no longer the librarian`
  });
        } else { // There is librarian but it's not the user checking out res.status(200);
        res.type('json');
        res.send('You can not check out of librarian, someone is already checked in');
        }
} else { // No librarian
    res.status(200);
    res.type('json');
    res.send('No one is currently the librarian, you can check in to the position');
}
});

/**
 * Standard query to see who is libararian
 */
server.post('/whois', (req, res) => {
    console.log(db.librarian.find()); // find all librarians
    if (db.librarian.count() === 1) {
        res.status(200);
        res.type('json');
        res.send({
            "response_type": "in_channel",
            "response": `${db.librarian.findOne().name} is currently the librarian`
        });
    } else {
        res.status(200);
        res.type('json');
        res.send({
            "response_type": "in_channel",
            "response": 'No one is currently the librarian'
        });
    }
});
// Test func for slack messages
function sendCheckIn(url,username) {
  let options = {
    uri: url,
    method: 'POST',
    json: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "response": `${username} is now the librarian`
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
