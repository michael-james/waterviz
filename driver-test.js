
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi()
});

var count = 12; // number of servos
var yMin = 20; // global minimum degrees
var yMax = 140; // global maximum degrees
var tDur = 1000; // duration of movement in ms
var tDly = 500; // duration of delay in ms

var offsets = [
    [ 0, 0, 0],
    [ 1, 0, 0],
    [ 2, 0, 0],
    [ 3, 0, 0],
    [ 4, 0, 0],
    [ 5, 0, 0],
    [ 6, 0, 0],
    [ 7, 0, 0],
    [ 8, 0, 0],
    [ 9, 0, 0],
    [10, 0, 0],
    [11, 0, 0]
];

board.on("ready", () => {
  console.log("Connected");

  var s = [];

  // create servo instances
  for (var i = 0; i < count; i++) {
    s.push(new five.Servo({
      controller: "PCA9685",
      pin: i,
      startAt: 0,}));
  }

  // loop ever tDly ms
  setInterval(function() {
    process.stdout.write("new!");

    var data = [];
    for (var i = 0; i < s.length; i++) {
      data.push(Math.random());
    }

    // iterate through servos
    for (var i = 0; i < s.length; i++) {
      var myMin = yMin + offsets[i][1];
      var myMax = yMax + offsets[i][2];
      
      // generate random degree then go to it over time tDur
      var degrees = myMin + Math.floor(data[i] * (myMax - myMin));
      process.stdout.write(" " + (data[i] * 100) + "/" + degrees);
      s[i].to(degrees, tDur);
    }
    console.log();
  }, (tDur + tDly));
});