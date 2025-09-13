#include "creds.h"
#include "ClickButton.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>

#define ON_PIN D5
#define OFF_PIN D7

ClickButton onButton(ON_PIN, LOW, CLICKBTN_PULLUP);
ClickButton offButton(OFF_PIN, LOW, CLICKBTN_PULLUP);

void setupSerial() {
  Serial.begin(19200);

  delay(200);
  Serial.println("\n-----------------");
  Serial.println("Turning On");
}

void setupWifi() {
  //WiFiManager, Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wm;

  bool res = wm.autoConnect("ESP-Lights");
  if (!res) {
    Serial.println("Failed to connect");
    ESP.restart();
  }

  Serial.print("Connected, IP Address: ");
  Serial.println(WiFi.localIP());
}

void updateState(uint8_t state) {
  Serial.println("Sending data to server [" + String(state) + "]");

  // WiFiClientSecure wifiClient;
  // wifiClient.setInsecure();
  WiFiClient wifiClient;

  HTTPClient http;

  if (state == 1) http.begin(wifiClient, String(SERVER) + String(WEBHOOK_ON));
  else if (state == 2) http.begin(wifiClient, String(SERVER) + String(WEBHOOK_ON_2));
  else http.begin(wifiClient, String(SERVER) + String(WEBHOOK_OFF));

  int status = http.GET();
  if (status == HTTP_CODE_OK) Serial.println("Success");
  else Serial.println("Something went wrong" + String(status));
  
  http.end();
}

void setup() {
  setupSerial();
  setupWifi();
}

void loop() {
  onButton.Update();
  offButton.Update();

  if (offButton.clicks > 0) updateState(0);

  if (onButton.clicks == 1) updateState(1);
  if (onButton.clicks == 2) updateState(2);
}
