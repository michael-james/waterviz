
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({ io: new Raspi() });

///////////////////////////////////////////////////
// set variables
///////////////////////////////////////////////////

var count = 10;        // number of servos
var gMin = 0;         // global minimum degrees
// var gMax = 180;        // global maximum degrees
// var gMin = 50;         // global minimum degrees
var gMax = 120;        // global maximum degrees
var tDur = 24000;      // duration of movement in ms
var tDly = 5000;       // duration of delay in ms
var constRate = false;  // movement always at same speed?
var randOrder = false;  // set values out of order
var fakeMax = true;
var valMax = false;
var stop = false;

var offsets = [
    [ 0, 0, 0], [ 1, 0, 0], [ 2, 0, 0], [ 3, 0, 0], [ 4, 0, 0], [ 5, 0, 0],
    [ 6, 0, 0], [ 7, 0, 0], [ 8, 0, 0], [ 9, 0, 0], [10, 0, 0], [11, 0, 0]
];

///////////////////////////////////////////////////
// control actuators
///////////////////////////////////////////////////

var tTot = tDur + tDly;   // duration of delay in ms
var s = []; // servos
var zero = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

board.on("ready", () => {
  console.log("Connected");

  // create servo instances
  for (var i = 0; i < count; i++) {
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];

    s.push(new five.Servo({
      controller: "PCA9685",
      pin: i,
      // range: [myMin, myMax],
      startAt: 0,}));
  }

  // get current positions
  // for (var i = 0; i < s.length; i++) {
  //   console.log(i + " = " + s[i].position);
  // }

  // set to relative "zero"
  for (var e = 0; e < s.length; e++) {
    var myMin = gMin + offsets[e][1];
    s[e].to(myMin, tDur / 2);
  }

  setTimeout(function() {
    moveAlone(newData()); // constant rate
    // moveAlone(newData(), false); // constant time
    // moveTogether(newData()); setInterval(function() {console.log(); moveTogether(newData());}, tTot);
    // moveAll(0);
  }, tDly);
});

function moveTogether(data) {
  // iterate through servos
  for (var i = 0; i < s.length; i++) {
    // apply offsets to global range
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];
    
    // convert data to my degrees then move to
    var degrees = myMin + Math.floor(data[i] * (myMax - myMin));
    s[i].to(degrees, tDur);
    console.log("servo " + i + " to " + degrees + " degrees in " + tDur + "ms");
  }
}

function moveAlone(data) {
  console.log("\n=== move separately ===");
  if (randOrder) var myOrder = makeOrder();

  function delayWrapper(i) {
    if (!stop) {
      // console.log(i);
      var j = i;
      if (randOrder) {
        j = myOrder[i];
      }
      var dly = 0;
      var myMin = gMin + offsets[j][1];
      var myMax = gMax + offsets[j][2];
      var myArc = myMax - myMin;
      var myAngle = Math.floor(data[j] * (myMax - myMin));
      var degrees = myMin + myAngle;
      var myDur = tDur;
      if (constRate) {
        myDur = Math.floor(myAngle / myArc * tDur)
      };
      
      console.log("servo " + j + " to " + degrees + " degrees in " + myDur + "ms");
      s[j].to(degrees, myDur);

      setTimeout(function () {
        if (i < (s.length - 1)) {          // If i > 0, keep going
          i = i + 1;
          delayWrapper(i);       // Call the loop again, and pass it the current value of i
        } 
        else {
          // moveAll(0);

          // var zero = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          // console.log(zero);
          // moveAlone(zero);

          // randOrder = !randOrder;

          // setTimeout(function() {
          //   moveAlone(newData());
          // }, tTot);

          // setTimeout(function() {
            // moveAlone(newData());
          // }, tDly);
        }
      }, myDur);
    }
  };

  delayWrapper(0);
}

function moveAll(val) {
  var data = [];
  for (var i = 0; i < s.length; i++) {
    data.push(val);
  }

  console.log("\n=== move all to " + val + "% ===");
  moveTogether(data);
}

function newData(zero) {
  var data = [];
  valMax = !valMax;
  var val = valMax * 1.0;
  if (zero) {
    val = 0;
  }
  for (var i = 0; i < s.length; i++) {
    if (!fakeMax) {val = Math.random();}
    data.push(val);
  }
  return data;
}

// create an array with randomly ordered consecutive indexes
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

///////////////////////////////////////////////////
// exit
///////////////////////////////////////////////////

// process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) moveAll(0);
    if (err) console.log(err.stack);
    if (options.exit) moveAll(0);
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

/////////////////////////////////////////////////
// keypress
/////////////////////////////////////////////////

var keypress = require('keypress');

var timePressed = 0;
var delta = 1000;
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  // console.log('got "keypress"', key);
  console.log('got "keypress"', key.name);
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
  if (key && key.name == 'h') {
    // moveAlone(zero);

    var now = new Date().getTime();
    console.log(timePressed, now, now - timePressed);

    if ((now - timePressed) > delta) {
      console.log("stopping...");
      stop = true;
      // stop servos
      for (var i = 0; i < s.length; i++) {
        s[i].stop();
      }

      console.log("resetting to home... waiting to exit...");
      setTimeout(function() {moveAll(0);}, (tDly));
      setTimeout(function() {process.stdin.pause();}, (tDur * 2));
    }

    timePressed = new Date().getTime();
  }
});
 
process.stdin.setRawMode(true);
process.stdin.resume();


///////////////////////////////////////////////////
// junk
///////////////////////////////////////////////////

/*
  // loop (period is duration of movement + duration of delay)
  setInterval(function() {
    process.stdout.write("new!");
    
    // console.log(); // print info to new line
  }, (1000 * 10));
*/


