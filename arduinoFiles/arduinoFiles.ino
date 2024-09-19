#include <Servo.h>
Servo myservo;
Servo myservo2;

int servo1pin = 9; 
int servo2pin = 10;
String hello= ""; 
void setup() {
  Serial.begin(9600);
  digitalWrite(servo1pin, OUTPUT); 
  digitalWrite(servo2pin, OUTPUT); 
  myservo.attach(servo1pin);
  myservo2.attach(servo2pin); 
  myservo.write(90); 
  myservo2.write(90); 
  // put your setup code here, to run once:

}

void loop() {
  /*myservo.write(90); 
  myservo2.write(90);
  delay(1000);  
  myservo.write(180); 
  myservo2.write(0);
  delay(1000);  
  */
  if (Serial.available() > 0) {
    // read the incoming byte:
    char incomingByte = Serial.read();
    if(incomingByte == '!'){
      //setting y orientation of camera module
      Serial.println(hello); 
      int angle = hello.toInt();
      myservo.write(angle);
      myservo2.write(180-angle); 
      hello = "";
    }else if(incomingByte == '@'){
      //setting x orientation of camera module
      Serial.println(hello); 
      hello = "";
    }else{
      hello += incomingByte; 
    }
    
   }
  // put your main code here, to run repeatedly:

}
