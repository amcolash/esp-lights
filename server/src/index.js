const cron = require('node-cron');
const fetch = require('node-fetch');
const express = require('express');
const { join } = require('path');

require('dotenv').config({ path: join(__dirname, '../.env') });

const { getToken, runScene, getDevices } = require('./tuya');
const { scenes, urls } = require('./values');

const port = 8266;

// On start, refresh token if expired
getToken();

// Refresh token every hour
cron.schedule('0 0/1 * * *', getToken);

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
