const { existsSync, readFileSync, writeFileSync } = require('fs');
const fetch = require('node-fetch');
const { join } = require('path');

// Based off of: https://raw.githubusercontent.com/ndg63276/smartlife/master/functions.js

const baseurl = 'https://px1.tuyaus.com/homeassistant/';

let auth = {
  accessToken: undefined,
  refreshToken: undefined,
  expires: undefined,
};

const authFile = join(__dirname, '../auth/auth.json');
readAuth();

function readAuth() {
  if (existsSync(authFile)) {
    auth = JSON.parse(readFileSync(authFile).toString());
  }
}

function writeAuth(data) {
  auth.accessToken = data.access_token;
  auth.refreshToken = data.refresh_token;
  auth.expires = Date.now() + data.expires_in; // unsure if we need to multiply by 1000 to convert to ms?

  writeFileSync(authFile, JSON.stringify(auth));
}

function getToken() {
  console.log(new Date().toLocaleString() + ': Getting Token');
  // if (!auth.accessToken || Date.now() > auth.expires) {
  if (auth.refreshToken) {
    return refresh();
  } else {
    return login();
  }
  // }

  // return new Promise((resolve, reject) => resolve());
}

function revokeAuth() {
  console.log(new Date().toLocaleString() + ': Revoke Auth');
  writeAuth({});
}

function login() {
  console.log(new Date().toLocaleString() + ': Logging In');

  const url = baseurl + 'auth.do';

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const data = {
    userName: process.env.TUYA_USER,
    password: process.env.TUYA_PASS,
    countryCode: 'us',
    bizType: 'smart_life',
    from: 'tuya',
  };

  const formData = Object.entries(data)
    .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
    .join('&');

  return fetch(url, { body: formData, headers, method: 'post' })
    .then((res) => res.json())
    .then((data) => {
      if (data.access_token) writeAuth(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

function refresh() {
  console.log(new Date().toLocaleString() + ': Refreshing Token');

  const data = { grant_type: 'refresh_token', refresh_token: auth.refreshToken };
  const formData = Object.entries(data)
    .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
    .join('&');

  const url = baseurl + 'access.do?' + formData;

  return fetch(url, {
    method: 'get',
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.access_token) writeAuth(data);
    })
    .catch((err) => console.error(err));
}

function getDevices() {
  const url = baseurl + 'skill';

  const data = {
    header: {
      name: 'Discovery',
      namespace: 'discovery',
      payloadVersion: 1,
    },
    payload: {
      accessToken: auth.accessToken,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    body: JSON.stringify(data),
    headers,
    method: 'post',
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
}

function adjustDevice(device, action, value_name, new_state) {
  const url = baseurl + 'skill';

  const data = {
    header: {
      name: action,
      namespace: 'control',
      payloadVersion: 1,
    },
    payload: {
      accessToken: auth.accessToken,
      devId: device,
      [value_name]: new_state,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    body: JSON.stringify(data),
    headers,
    method: 'post',
  })
    .then((res) => {
      console.log(res);
      console.log(res.headers);
      return res.json();
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.error(err));
}

function runScene(sceneId) {
  return adjustDevice(sceneId, 'turnOnOff', 'value', 1);
}

module.exports = { runScene, adjustDevice, getToken, getDevices, revokeAuth };
