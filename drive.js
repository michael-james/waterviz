
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({ io: new Raspi() });

///////////////////////////////////////////////////
// set global variables
///////////////////////////////////////////////////

var count = 10;        // number of servos
var gMin = 35;         // global minimum degrees
var gMax = 135;        // global maximum degrees
var tDur = 24000;      // duration of movement in ms
var tDly = 5000;       // duration of delay in ms
var constRate = false;  // movement always at same speed?
var randOrder = false;  // moves servos alone out of order
var fakeMax = false;		// <<<<<<<<force water to go full range instead of random values
var custom = true; // <<<<<<<<use my own data instead of random

// 0 = number, 1 = min offset, 2 = max offset
var offsets = [
    [ 0, 0, 0], [ 1, 0, 0], [ 2, 0, 0], [ 3, 0, 0], [ 4, 0, 0], [ 5, 0, 0],
    [ 6, 0, 0], [ 7, 0, 0], [ 8, 0, 0], [ 9, 0, 0], [10, 0, 0], [11, 0, 0]
];

// var customData = [0.7, 0.6, 0.5, 0.7, 0.01,
//                   0.01, 0.3, 0.01, 0.3, 0.01];

// var customData = [0.5, 0.5, 0.5, 0.5, 0.5,
//                   0.5, 0.5, 0.5, 0.5, 0.5];

// var customData = [1.0, 1.0, 1.0, 1.0, 1.0,
//                   1.0, 1.0, 1.0, 1.0, 1.0];

var customData = [0.4, 0.4, 0.4, 0.4, 0.4,
                  0.4, 0.4, 0.4, 0.4, 0.4];

///////////////////////////////////////////////////
// default global variables
///////////////////////////////////////////////////

var tTot = tDur + tDly;   // duration of delay in ms
var s = []; // servos
var zero = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var valMax = false;   // game variable (used to switch between max and min)
var stop = false;   // used for emergency stop sequence

///////////////////////////////////////////////////
// control actuators
///////////////////////////////////////////////////

board.on("ready", () => {
  console.log("Connected");

  // create servo instances
  for (var i = 0; i < count; i++) {
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];

    s.push(new five.Servo({
      controller: "PCA9685",
      pin: i,
      startAt: 0,})); // sets the location all motors go to on startup
  }

  // set to relative "zero" (gMin + offset)
  console.log("\n=== move all to myMin ===");
  for (var e = 0; e < s.length; e++) {
    var myMin = gMin + offsets[e][1];
    var myDur = tDur / 2;

    s[e].to(myMin, myDur); // moves servo to myMin degrees over myDur ms
    console.log("servo " + e + " to " + myMin + " degrees in " + myDur + "ms");
  }

  setTimeout(function() {
    // moveAlone(newData()); // constant rate
    // moveAlone(newData(), false); // constant time
    // moveTogether(newData()); setInterval(function() {console.log(); moveTogether(newData());}, tTot);
    moveAll(1, false);
    setTimeout(function() {
      moveAll(0, false);
    }, tDur * 4 + tDly);
  }, tDur);
});

function moveTogether(data, literal) {
  // iterate through servos
  for (var i = 0; i < s.length; i++) {
    // apply offsets to global range
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];
    var myDur = tDur * 4; // when things are moved together, they are twice as slow
    
    // convert data to my degrees then move to
    var degrees = myMin + Math.floor(data[i] * (myMax - myMin));
    if (literal) {degrees = data[i]};

    s[i].to(degrees, myDur); // moves servo to degrees over myDur ms
    console.log("servo " + i + " to " + degrees + " degrees in " + myDur + "ms");
  }
  setTimeout(function() {
      console.log("done!");
    }, myDur);
}

function moveAlone(data) {
  console.log("\n=== move separately ===");
  if (randOrder) var myOrder = makeOrder();

  function delayWrapper(i) {
  	// if movement has not been stopped, move next servo
    if (!stop) {
    	// if randOrder true, uses random order
      var j = i;
      if (randOrder) {
        j = myOrder[i];
      }

      // my variables
      var myMin = gMin + offsets[j][1];
      var myMax = gMax + offsets[j][2];
      var myArc = myMax - myMin;
      var myAngle = Math.floor(data[j] * (myMax - myMin));
      var degrees = myMin + myAngle;
      var myDur = tDur;
      if (constRate) {
        myDur = Math.floor(myAngle / myArc * tDur)
      };
      // if servo set to 0, double duration of movement (makes it slower when moving down to zero)
      if (data[j] == 0) {myDur = myDur * 4;}
      
      console.log("servo " + j + " to " + degrees + " degrees in " + myDur + "ms");
      s[j].to(degrees, myDur); // moves servo to degrees over myDur ms

      // determines whether to continue looping
      setTimeout(function () {
        // if this is the last servo, stop looping
        if (i < (s.length - 1)) {          // If i > 0, keep going
          i = i + 1;
          // omits servos 1 and 7
          if (i == 1 || i == 7) {
            i = i + 1;
          }
          delayWrapper(i);       // Call the loop again, and passes it the next servo
        } 
        else {
        	// start another full loop after tDly
          // setTimeout(function() {
          //   moveAlone(newData());
          // }, tDly);
          moveAll(0, false);
        }
      }, myDur);
    }
  };

  // starts the recursion
  delayWrapper(0);
}

// wrapper for moveTogether; moves all servos to val
function moveAll(val, literal) {
  var data = [];
  for (var i = 0; i < s.length; i++) {
    data.push(val);
  }

  console.log("\n=== move all to " + val + "% ===");
  moveTogether(data, literal);
}

// generates new array of random data (or fake values)
function newData(zero) {
  var data = [];
  // switches the valMax variable between 0 and 1 during fakeMax
  valMax = !valMax;
  var my = valMax * 1.0;

  // creates array
  for (var i = 0; i < s.length; i++) {
    var val = Math.random();
  	// if fakeMax is off, random value, else use values from above
    if (custom) {val = customData[i];}
    if (fakeMax) {val = my;}
    data.push(val);
  }
  return data;
}

// create an array with randomly ordered consecutive indexes for randomizing servo order
function makeOrder() {
// first make a new array
  var order = [];
  for(var idx = 0; idx < s.length; idx++)
  {
      order.push(idx);
  }

  // then proceed to shuffle the order array      
  for(var idx = 0; idx < order.length; idx++)
  {
    var swpIdx = idx + Math.floor(Math.random() * (order.length - idx));
    // now swap elements at idx and swpIdx
    var tmp = order[idx];
    order[idx] = order[swpIdx];
    order[swpIdx] = tmp;
  }
  // here order[] will have been randomly shuffled (permuted)
  console.log(order);
  return order;
}

/////////////////////////////////////////////////
// keypress
/////////////////////////////////////////////////

var keypress = require('keypress');

var timePressed = 0;
var delta = 1000; // amount of delay for debouncing
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  // console.log('got "keypress"', key);
  console.log('got "keypress"', key.name);
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }

  // if 'h' key is pressed, start exit procedure
  if (key && key.name == 'h') {

  	// debouncer
    var now = new Date().getTime();
    console.log(timePressed, now, now - timePressed);

    if ((now - timePressed) > delta) {
      console.log("stopping...");
      stop = true; // set stop variable to stop loops
      // send stop command to servos
      for (var i = 0; i < s.length; i++) {
        s[i].stop();
      }

      console.log("resetting to home... waiting to exit...");
      setTimeout(function() {moveAll(0, true);}, (tDly)); // move all to zero
      setTimeout(function() {
        for (var i = 0; i < s.length; i++) {
          s[i].stop();
        }
        process.stdin.pause();
      }, (tDur * 4 + tDly)); // end process
    }

    timePressed = new Date().getTime();
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();

