
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({ io: new Raspi() });

///////////////////////////////////////////////////
// set variables
///////////////////////////////////////////////////

var count = 2;   // number of servos
var gMin = 20;    // global minimum degrees
var gMax = 140;   // global maximum degrees
var tDur = 4000;  // duration of movement in ms
var tDly = 1000;   // duration of delay in ms

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
    s.push(new five.Servo({
      controller: "PCA9685",
      pin: i,}));
  }

  // loop (period is duration of movement + duration of delay)
  setInterval(function() {
    process.stdout.write("new!");

    // create array of random values (0.0 - 1.0)
    var data = [];
    for (var i = 0; i < s.length; i++) {
      data.push(Math.random());
    }

    // moveTogether(data);
    moveAll(0);
    setTimeout(function () {moveAlone(data);}, tTot + 5000);
    
    
    // console.log(); // print info to new line
  }, (1000 * 10));
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
    process.stdout.write(" " + Math.floor(data[i] * 100) + "(" + degrees + ")");
  }
  console.log();
}

function moveAlone(data) {
  console.log();

  function delayWrapper (i) {
    var dly = 0;
    var myMin = gMin + offsets[i][1];
    var myMax = gMax + offsets[i][2];
    var myArc = myMax - myMin;
    var myAngle = Math.floor(data[i] * (myMax - myMin));
    var degrees = myMin + myAngle;
    var myDur = Math.floor(myAngle / myArc * tDur);
    
    console.log(" " + i + ":" + Math.floor(data[i] * 100) + ":" + degrees + "(" + myDur + ")");
    s[i].to(degrees, myDur);

    setTimeout(function () {
      if (i < (s.length - 1)) {          // If i > 0, keep going
        delayWrapper(++i);       // Call the loop again, and pass it the current value of i
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

  moveTogether(data);
}