#!/bin/sh

# You will need your client secret to get the device credentials

google-oauthlib-tool --client-secrets client_secret*.json \
  --credentials devicecredentials.json \
  --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
  --save