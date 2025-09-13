#include "creds.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>

#define ON_BUTTON D5
#define OFF_BUTTON D7

int state = -1;

void setupSerial() {
  Serial.begin(115200);

  delay(200);
  Serial.println("\n-----------------");
  Serial.println("Turning On");
}


void IRAM_ATTR turnOn() { state = 1; }
void IRAM_ATTR turnOff() { state = 0; }

void setupPins() {
  pinMode(ON_BUTTON, INPUT_PULLUP);
  pinMode(OFF_BUTTON, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(ON_BUTTON), turnOn, FALLING);
  attachInterrupt(digitalPinToInterrupt(OFF_BUTTON), turnOff, FALLING);
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

void updateState() {
  Serial.println("Sending data to server [" + String(state) + "]");

  // WiFiClientSecure wifiClient;
  // wifiClient.setInsecure();
  WiFiClient wifiClient;

  HTTPClient http;

  if (state == 1) http.begin(wifiClient, String(SERVER) + String(WEBHOOK_ON));
  else http.begin(wifiClient, String(SERVER) + String(WEBHOOK_OFF));

  int status = http.GET();
  if (status == HTTP_CODE_OK) Serial.println("Success");
  else Serial.println("Something went wrong");
  
  http.end();

  state = -1;
}

void setup() {
  setupSerial();
  setupPins();
  setupWifi();
}

long nextPossibleUpdate = 0;
void loop() {
  if (millis() < nextPossibleUpdate) {
    state = -1;
  }    

  if (state != -1) {
    updateState();
    nextPossibleUpdate = millis() + 1000;
  }
}
