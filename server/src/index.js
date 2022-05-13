const express = require('express');
const app = express();
const GoogleAssistant = require('./googleassistant');

const port = 8266;

// Set up the google assistant
const deviceCredentials = require(`${__dirname}/../auth/devicecredentials.json`);
const CREDENTIALS = {
  client_id: deviceCredentials.client_id,
  client_secret: deviceCredentials.client_secret,
  refresh_token: deviceCredentials.refresh_token,
  type: 'authorized_user',
};
const assistant = new GoogleAssistant(CREDENTIALS);

// List of commands to run in certain scenarios
const turnOn = ['run lights on scene', 'turn on fish', 'turn on ping pong'];
const turnOff = ['run lightswitch off scene', 'turn off fish', 'turn off ping pong'];

// Helper to run a list of commands with assistant
function runCommands(commands) {
  // Reverse the order as things seem to run LIFO
  commands.reverse().forEach((c) => {
    assistant
      .assist(c)
      .then((res) => {
        console.log(c, res);
      })
      .catch((err) => console.error(err));
  });
}

app.get('/on', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state[on]`);

  runCommands(turnOn);
  res.sendStatus(200);
});

app.get('/off', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state[off]`);

  runCommands(turnOff);
  res.sendStatus(200);
});

// app.get('/custom', (req, res) => {
//   console.log(`${new Date().toLocaleString()}: ${req.query.cmd}`);

//   runCommands([req.query.cmd]);
//   res.sendStatus(200);
// });

app.listen(port, () => {
  console.log(`ESP-lights listening on port ${port}`);
});
