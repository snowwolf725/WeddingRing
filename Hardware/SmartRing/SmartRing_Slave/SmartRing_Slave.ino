#define SerialBaud   9600
#define Serial1Baud  9600
#include <stdio.h>
#include <Wire.h>
#include <SeeedOLED.h>

#include "xadow.h"

String myName = "";
String opName = "";
String myAttr = "";
String opAttr = "";
String remoteAttr = "";

void vibrate(unsigned char OnOff)
{
    if(OnOff)
    {
        PORTB |= 0x04;
        PORTF |= 0x01;
    }
    else
    {
        PORTB &=~ 0x04;
        PORTF &=~ 0x01;
    }
}

void refreshOLed()
{
    String msg = "";
    char* buf = (char*) malloc(sizeof(char)*20);
    SeeedOled.setTextXY(0,0);
    SeeedOled.putString("                ");
    SeeedOled.setTextXY(1,0);
    msg = "My Name:" + myName;
    msg.toCharArray(buf, 20);
    SeeedOled.putString(buf);
    SeeedOled.setTextXY(2,0);
    msg = "My Attr:" + myAttr;
    msg.toCharArray(buf, 20);
    SeeedOled.putString(buf);
    SeeedOled.setTextXY(3,0);
    msg = "Op Attr:" + opAttr;
    msg.toCharArray(buf, 20);
    SeeedOled.putString(buf);
    SeeedOled.setTextXY(4,0);
    msg = "Match:" + opName;
    msg.toCharArray(buf, 20);
    SeeedOled.putString(buf);
    SeeedOled.setTextXY(0,0);
}

void parseCMD(String data)
{
  int index = data.indexOf(':');
  if(index != -1)
  {
    String cmd = data.substring(0, index);
    String value = data.substring(index + 1, data.length());
    Serial.println(cmd);
    Serial.println(value);
    if(cmd == "MYNAME")
    {
      myName = value;
    } else if(cmd == "MYATTR")
    {
      myAttr = value;
    } else if(cmd == "OPATTR")
    {
      opAttr = value;
    } else if(cmd == "OPNAME")
    {
      opName = value;
    } else if(cmd == "GETNAME")
    {
      Serial1.println("OPNAME:" + myName);
    } else if(cmd == "GETATTR")
    {
      Serial1.println("ATTR:" + myAttr);
    } else if(cmd == "ATTR")
    {
      Serial1.println("ATTR:" + remoteAttr);
    }
  }
}

void setup()
{
    Wire.begin();
    SeeedOled.init();  //initialze SEEED OLED display
    Xadow.init();
    // OLED init
    DDRB|=0x21;        //digital pin 8, LED glow indicates Film properly Connected .
    PORTB |= 0x21;

    SeeedOled.clearDisplay();          //clear the screen and set start position to top left corner
    SeeedOled.setNormalDisplay();      //Set display to normal mode (i.e non-inverse mode)
    SeeedOled.setPageMode();           //Set addressing mode to Page Mode
    SeeedOled.setTextXY(0,0);          //Set the cursor to Xth Page, Yth Column  
    SeeedOled.putString("               "); //Print the String
    // Vibrate init
    DDRF |= 0x01;                   // init IO
    DDRB |= 0x04;
  
    Serial.begin(SerialBaud);
    Serial1.begin(Serial1Baud);
    // set slave 
    Serial1.print("AT+ROLE0");
    delay(1000);
    Serial1.print("AT+RENEW");
    delay(1000);
    while(Serial1.available()) {
      Serial1.read();
    }
    delay(1000);
    refreshOLed();
}

void loop()
{
    while(Serial.available()){
      Serial1.write(Serial.read());
    }
    while(Serial1.available()){
      String data = Serial1.readStringUntil('\n');
      parseCMD(data);
      SeeedOled.putString("               ");
      if(data == "MATCH") {
        vibrate(1);
        delay(5000);
        vibrate(0);
      } else {
        vibrate(0);
      }
      Serial.println(data);
      SeeedOled.setTextXY(0,0);
      char* buf = (char*) malloc(sizeof(char)*data.length()+1);
      data.toCharArray(buf, data.length()+1);
      SeeedOled.putString(buf); //Print the String
      refreshOLed();
    }
}
