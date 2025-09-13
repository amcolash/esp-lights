const cron = require('node-cron');
const express = require('express');
const { join } = require('path');

require('dotenv').config({ path: join(__dirname, '../.env') });

const { getToken, runScene, getDevices, adjustDevice, revokeAuth } = require('./tuya');
const { scenes } = require('./values');

const port = 8266;

// On start, refresh token if expired
getToken();

// Refresh token at every 4 hours (not sure how long token is good for?)
cron.schedule('0 */4 * * *', getToken);

// Logout once a week just in case (sun @ 5am)
cron.schedule('0 5 * * 0', () => {
  revokeAuth();
  getToken();
});

const app = express();
app.get('/on', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state [on], switch [${req.query.switch}]`);
  turnOn(Number.parseInt(req.query.switch));
  res.sendStatus(200);
});

app.get('/off', (req, res) => {
  console.log(`${new Date().toLocaleString()}: state [off], switch [${req.query.switch}]`);
  turnOff(Number.parseInt(req.query.switch));
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

app.get('/reauth', (req, res) => {
  revokeAuth();
  getToken();

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`ESP-lights listening on port ${port}`);
});

function turnOn(id) {
  if (id === undefined || id === 0) runScene(scenes.lightsOn.id);
  if (id === 1) runScene(scenes.upstairsOn.id);
  // fetch(urls.fish.on);
  // fetch(urls.pingpong.on);
}

function turnOff(id) {
  if (id === undefined || id === 0) runScene(scenes.lightsOff.id);
  if (id === 1) runScene(scenes.upstairsOff.id);
  // fetch(urls.sunset.off);
  // fetch(urls.fish.off);
  // fetch(urls.pingpong.off);
}
