#define baud 9600

void setup()  
{
  // Open serial communications and wait for port to open:
  Serial.begin(baud);
  Serial1.begin(baud);
  
  at("AT"); // check if working, always returns OK
  at("AT+ROLE1"); // select master = central
  at("AT+RESET"); // actually more a restart than a reset .. needed after ROLE
  at("AT+SHOW1"); // include Bluetooth name in response
  at("AT+IMME1"); // "work immediately", not sure what this does
  at("AT+FILT0"); // show all BLE devices, not only HM ones
  delay(1000); // wait a bit, NECESSARY!!
  Serial1.print("AT+DISC?"); // here comes the magic
  
}

void at(char* cmd) {
  Serial1.write(cmd);
  Serial.print(cmd);
  while(!Serial1.find("OK")) Serial.print(".");
  
  Serial.println(" .. OK");
}


void loop() // run over and over
{
  if (Serial1.available())
    Serial.write(Serial1.read());
  if (Serial.available())
    Serial1.write(Serial.read());   
}
