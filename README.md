# NeoPixelControlCenter
This project helps anyone to control LEDS on a NeoPixel Led Strip, thanks to 2 simple  HTTP Get / API:
- http://ip:8083/switchAllOff? will switch off all the leds
- http://ip:8083/changeLed?ledId=[0-7]&red=[0-255]&green=[0-255]&blue=[0-255]&brightness=[0-100] will change the ledId selected with the color (red,green,blue) and the brightness passed.
- http://ip:8083/changeLedInRange?from=[0-7]&to=[0-7]&red=[0-255]&green=[0-255]&blue=[0-255]&brightness=[0-100] will change the ledId in the range [from,to] with the color provided.
- http://ip:8083/pattern?id=iterate&red=[0-255]&green=[0-255]&blue=[0-255]&brightness=[0-100]&speed=[0-100] will animate 1 Led with the color (red,green,blue), speed and the brightness passed.
- http://ip:8083/pattern?id=rainbow-cycle-2&brightness=[0-100]&speed=[1-20] will animate Rainbow Wave with speed and the brightness passed.
- http://ip:8083/pattern?id=rainbow-cycle&brightness=[0-100]&speed=[1-20] will animate Rainbow Wave with speed and the brightness passed.
- http://ip:8083/pattern?id=rainbow-full&brightness=[0-100]&speed=[1-20] will animate Rainbow Wave with speed and the brightness passed.
- http://ip:8083/pattern?id=rainbow-custom&iterations=[1-35]&brightness=[0-100]&speed=[1-20] will animate Rainbow Wave with speed, iterations and the brightness passed.

This allows easy integrations with other applications running on the RPI.

The project works on Raspberry Pi Boards.
It must be run as root: sudo node neopixel_server.js.
The server listen on all interface: it's easy to change the code in order to run the server only on localhost; search and replace the code:

--> app.listen(8083);

with		

--> app.listen(8083,'localhost');
		
# Schematics
Configuration tested with a Raspberry Pi Zero W
![Alt text](rpi_neopixel_stripled.png?raw=true "Schematic")

