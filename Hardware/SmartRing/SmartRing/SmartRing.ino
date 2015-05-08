#define baud 9600

void setup()  
{
  // Open serial communications and wait for port to open:
  Serial.begin(baud);
  Serial1.begin(baud);
  
  Serial1.write("AT"); // check if working, always returns OK
  Serial1.write("AT+ROLE1"); // select master = central
  delay(1000);
  Serial1.write("AT+RESET"); // actually more a restart than a reset .. needed after ROLE
  delay(1000);
  Serial1.write("AT+SHOW1"); // include Bluetooth name in response
  delay(1000);
  Serial1.write("AT+IMME1"); // "work immediately", not sure what this does
  delay(1000);
  Serial1.write("AT+FILT0"); // show all BLE devices, not only HM ones
  delay(1000); // wait a bit, NECESSARY!!
  //Serial1.print("AT+DISC?"); // here comes the magic
  Serial1.write("AT+CON20CD39B12630");
  delay(1000);
  Serial1.write("MATCH\n");
}

void at(char* cmd) {
  Serial1.write(cmd);
  Serial.print(cmd);
  while(!Serial1.find("OK")) Serial.print(".");
  
  Serial.println(" .. OK");
}


void loop() // run over and over
{
  if (Serial1.available()) {
    Serial.write(Serial1.read());
    //String data = Serial1.readStringUntil('\n');
    //Serial.println(data);
  }
  if (Serial.available())
    Serial1.write(Serial.read());   
}
