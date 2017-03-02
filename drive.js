
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({ io: new Raspi() });

///////////////////////////////////////////////////
// set variables
///////////////////////////////////////////////////

var count = 2;         // number of servos
var gMin = 20;         // global minimum degrees
var gMax = 140;        // global maximum degrees
var tDur = 10000;      // duration of movement in ms
var tDly = 1000;       // duration of delay in ms
var constRate = true;  // movement always at same speed?

var offsets = [
    [ 0, 0, 0], [ 1, 0, 0], [ 2, 0, 0], [ 3, 0, 0], [ 4, 0, 0], [ 5, 0, 0],
    [ 6, 0, 0], [ 7, 0, 0], [ 8, 0, 0], [ 9, 0, 0], [10, 0, 0], [11, 0, 0]
];

///////////////////////////////////////////////////
// control actuators
///////////////////////////////////////////////////

var tTot = tDur + tDly;   // duration of delay in ms
var s = []; // servos

board.on("ready", () => {
  console.log("Connected");

  // create servo instances
  for (var i = 0; i < count; i++) {
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];

    s.push(new five.Servo({
      controller: "PCA9685",
      pin: i,
      range: [myMin, myMax],
      startAt: 0,}));
  }

  // get current positions
  // for (var i = 0; i < s.length; i++) {
  //   console.log(i + " = " + s[i].position);
  // }

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

  function delayWrapper (i) {
    var dly = 0;
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];
    var myArc = myMax - myMin;
    var myAngle = Math.floor(data[i] * (myMax - myMin));
    var degrees = myMin + myAngle;
    var myDur = tDur;
    if (constRate) {
      myDur = Math.floor(myAngle / myArc * tDur)
    };
    
    console.log("servo " + i + " to " + degrees + " degrees in " + myDur + "ms");
    s[i].to(degrees, myDur);

    setTimeout(function () {
      if (i < (s.length - 1)) {          // If i > 0, keep going
        delayWrapper(++i);       // Call the loop again, and pass it the current value of i
      } else {
        moveAll(0);

        setTimeout(function() {
          moveAlone(newData());
        }, tTot);
      }
    }, myDur);
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

function newData() {
  var data = [];
  for (var i = 0; i < s.length; i++) {
    data.push(Math.random());
  }
  return data;
}


///////////////////////////////////////////////////
// exit
///////////////////////////////////////////////////

// process.stdin.resume();//so the program will not close instantly

// function exitHandler(options, err) {
//     if (options.cleanup) moveAll(0);
//     if (err) console.log(err.stack);
//     if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


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


