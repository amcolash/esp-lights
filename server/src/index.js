const cron = require('node-cron');
const express = require('express');
const { join } = require('path');

require('dotenv').config({ path: join(__dirname, '../.env') });

const { getToken, runScene, getDevices, adjustDevice } = require('./tuya');
const { scenes, urls } = require('./values');

const port = 8266;

// On start, refresh token if expired
getToken();

// Refresh token at every 4 hours (not sure how long token is good for?)
cron.schedule('0 */4 * * *', getToken);

const app = express();
app.get('/on', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state [on], switch [${req.query.switch}]`);
  turnOn();
  res.sendStatus(200);
});

app.get('/off', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state [off], switch [${req.query.switch}]`);
  turnOff();
  res.sendStatus(200);
});

app.post('/device/:id', (req, res) => {
  adjustDevice(req.params.id, 'turnOnOff', 'value', req.query.value);
  res.sendStatus(200);
});

app.get('/devices', async (req, res) => {
  const devices = await getDevices();
  res.send(devices);
});

app.listen(port, () => {
  console.log(`ESP-lights listening on port ${port}`);
});

function turnOn() {
  runScene(scenes.lightsOn.id);
  // fetch(urls.fish.on);
  // fetch(urls.pingpong.on);
}

function turnOff() {
  runScene(scenes.lightswitchOff.id);
  // fetch(urls.sunset.off);
  // fetch(urls.fish.off);
  // fetch(urls.pingpong.off);
}
