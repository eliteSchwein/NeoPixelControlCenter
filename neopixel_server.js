"use strict";

const defaultBrightness = 10;
const redColor = rgb2Int(255,0,0);
var NUM_LED = 45;
const PORT = 8083;

var ws281x = require('rpi-ws281x-native');
var express = require('express');

var ledIdInit = 0;
var initTimes = 4 * 8;
var app = express();

var NUM_LEDS = parseInt(process.argv[2], 10) || NUM_LED,
	pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

var timer;

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

app.get('/switchAllOff', function (req, res) {
	switchAllLedOff();
	res.type("application/json");
	res.send('{"status":"ok"}');
});

app.get('/updateLeds', function (req, res) {
	var amount  = req.query.amount;
	if(amount == null ||typeof(amount) === undefined || amount < 1){
		res.send("{}");
		return;
	}
	switchAllLedOff();
	setTimeout(function(){
		var newws281x = require('rpi-ws281x-native');
		NUM_LEDS = parseInt(process.argv[2], 10) || NUM_LED,
			      pixelData = new Uint32Array(NUM_LEDS);
		newws281x.init(NUM_LEDS);
		newws281x.reset();
		ws281x = newws281x;
		res.type("application/json");
		res.send('{"status":"ok"}');
	},1000);
});

app.get('/changeLedInRange',function (req,res){
	var from = req.query.from;
	var to  = req.query.to;
	var red = req.query.red;
	var green = req.query.green;
	var blue = req.query.blue;
	var brightness = req.query.brightness;
	if(
			( from == null || typeof(from) === undefined || from < 0 || from > NUM_LEDS-1 ) ||
			( to == null || typeof(to) === undefined || to < 0 || to > NUM_LEDS-1 ) ||
			( from >= to ) ||
			( red == null || typeof(red) === undefined || red < 0 || red > 255 ) ||
			( green == null || typeof(green) === undefined || green < 0 || green > 255 ) ||
			( blue == null || typeof(blue) === undefined || blue < 0 || blue > 255 ) ||
			( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 )) {
			res.send("{}");
			return;
	}

	ws281x.setBrightness(parseInt(brightness));
	for(var ledId = parseInt(from);ledId<=parseInt(to);ledId++) {
			var color = rgb2Int(red,green,blue);
			pixelData[ledId] = color;
	}
	ws281x.render(pixelData);
	res.type("application/json");
	res.send('{"status": "ok"}');
	return;
});

app.get('/changeLed',function (req,res){
	var ledId = req.query.ledId;
	var red = req.query.red;
	var green = req.query.green;
	var blue = req.query.blue;
	var brightness = req.query.brightness;
	if( ( ledId == null || typeof(ledId)===undefined || ledId < 0 || ledId > NUM_LEDS-1 ) ||
		( red == null || typeof(red) === undefined || red < 0 || red > 255 ) ||
		( green == null || typeof(green) === undefined || green < 0 || green > 255 ) ||
		( blue == null || typeof(blue) === undefined || blue < 0 || blue > 255 ) ||
		( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 )) {
		res.send("{}");
		return;
	}
	
	var conf = new Object();
	conf.ledId = ledId;
	conf.color = rgb2Int(red,green,blue);
	conf.brightness = brightness;
	console.log("LedId " + ledId);
	console.log("Color " + red + ";" + green + ";"+blue );
	console.log("Brightness " + brightness);
	res.type("application/json");
	res.send(JSON.stringify(conf));
	changeLed(parseInt(ledId),conf.color,parseInt(conf.brightness));
	return;
});

app.get('/pattern',function (req,res){
	var pattern = req.query.id;
	var conf = new Object();
	switch(pattern){
			case "iterate":
					var red = req.query.red;
					var green = req.query.green;
					var blue = req.query.blue;
					var brightness = req.query.brightness;
					var speed = req.query.speed;
					if( ( red == null || typeof(red) === undefined || red < 0 || red > 255 ) ||
						( green == null || typeof(green) === undefined || green < 0 || green > 255 ) ||
						( blue == null || typeof(blue) === undefined || blue < 0 || blue > 255 ) ||
						( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 ) || 
						( speed == null || typeof(speed) === undefined || speed < 0 || speed > 100 )) {
						res.send("{}");
						return;
					}
					conf.pattern = "iterate";
					conf.color = rgb2Int(red,green,blue);
					conf.brightness = brightness;
					conf.speed = speed;
					res.type("application/json");
					res.send(JSON.stringify(conf))
					switchAllLedOff();
					setTimeout(function(){iterate(rgb2Int(red,green,blue), parseInt(brightness), parseFloat(speed))}, 100);
					break;
			case "rainbow-cycle-2":
					var brightness = req.query.brightness;
					var speed = req.query.speed;
					if( ( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 ) || 
						( speed == null || typeof(speed) === undefined || speed < 1 || speed > 20 )) {
						res.send("{}");
						return;
					}
					conf.pattern = "rainbow-cycle-2";
					conf.brightness = brightness;
					conf.speed = speed;
					res.type("application/json");
					res.send(JSON.stringify(conf));
					switchAllLedOff();
					setTimeout(function(){rainbow(1,parseInt(brightness),parseInt(speed))}, 100);
					break;
			case "rainbow-cycle":
				var brightness = req.query.brightness;
				var speed = req.query.speed;
				if( ( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 ) || 
					( speed == null || typeof(speed) === undefined || speed < 1 || speed > 20 )) {
					res.send("{}");
					return;
				}
				conf.pattern = "rainbow-cycle";
				conf.brightness = brightness;
				conf.speed = speed;
				res.type("application/json");
				res.send(JSON.stringify(conf));
				switchAllLedOff();
				setTimeout(function(){rainbow(3,parseInt(brightness),parseInt(speed))}, 100);
				break;
			case "rainbow-full":
				var brightness = req.query.brightness;
				var speed = req.query.speed;
				if( ( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 ) || 
					( speed == null || typeof(speed) === undefined || speed < 1 || speed > 20 )) {
					res.send("{}");
					return;
				}
				conf.pattern = "rainbow-full";
				conf.brightness = brightness;
				conf.speed = speed;
				res.type("application/json");
				res.send(JSON.stringify(conf));
				switchAllLedOff();
				setTimeout(function(){rainbow(35,parseInt(brightness),parseInt(speed))}, 100);
				break;
			case "rainbow-custom":
				var brightness = req.query.brightness;
				var speed = req.query.speed;
				var iterations = req.query.iterations;
				if( ( iterations == null || typeof(iterations) === undefined || iterations < 1 || iterations > 35 ) ||
					( brightness == null || typeof(brightness) === undefined || brightness < 5 || brightness > 100 ) || 
					( speed == null || typeof(speed) === undefined || speed < 1 || speed > 20 )) {
					res.send("{}");
					return;
				}
				conf.pattern = "rainbow-custom";
				conf.brightness = brightness;
				conf.speed = speed;
				conf.iterations = iterations;
				res.type("application/json");
				res.send(JSON.stringify(conf));
				switchAllLedOff();
				setTimeout(function(){rainbow(parseFloat(iterations),parseInt(brightness),parseInt(speed))}, 100);
				break;
			default:
				res.type("application/json");
				res.send('{"pattern": "Not Found"}')
				break;
	}
	return;
});

defBrightness();

setTimeout(startupSequence, 200);

function startupSequence() {
	rainbow(1,100,0);
	setTimeout(startServer, 2000);
}
function startServer() {
	switchAllLedOff();
	app.listen(PORT, () => {
		console.log(`Started listening on port 8083`);
	});
}

function changeLed(ledId,color,brightness) {
	ws281x.setBrightness(brightness);
    	pixelData[ledId] = color;
  	ws281x.render(pixelData);
}


function switchAllLedOff() {
	clearInterval(timer);
	ws281x.setBrightness(0);
	var noColor = rgb2Int(0,0,0);
  	for (var i = 0; i < NUM_LEDS; i++) {
    		pixelData[i] = noColor;
  	}

  	ws281x.render(pixelData);
}


function defBrightness(){
	ws281x.setBrightness(defaultBrightness);
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

//Iterate over all of the LEDs with a given color and brightness
function iterate(color, brightness, speed){
	var offset = 0;
	ws281x.setBrightness(brightness);
	timer=setInterval(function () {
	  var i=NUM_LEDS;
	  while(i--) {
		  pixelData[i] = 0;
	  }
	  pixelData[offset] = color;

	  offset = (offset + 1) % NUM_LEDS;
	  ws281x.render(pixelData);
	}, speed*10);
};

//Continually change colors smoothly. Should be set to a timeout.
function rainbow(iterations,brightness,speed){
	ws281x.setBrightness(brightness);
	var offset = 0;
	timer=setInterval(function () {
		for (var j = 0; j < 256*speed+offset+iterations; j++){
			for (var i = 0; i < NUM_LEDS; i++) {
				pixelData[i] = colorwheel(((i * 256 / NUM_LEDS / iterations) + j) & 255);
			  }
		}
		offset = (offset + 1) % 256;
	  	ws281x.render(pixelData);
	}, 1);
	// rainbow-colors, taken from http://goo.gl/Cs3H0v
	function colorwheel(pos) {
	  pos = 255 - pos;
	  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
	  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
	  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
	}
};
