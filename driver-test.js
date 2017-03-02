
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

    // iterate through servos
    for (var i = s.length - 1; i >= 0; i--) {
      
      // generate random degree then go to it over time tDur
      var degrees = yMin + Math.floor(Math.random() * (yMax - yMin));
      process.stdout.write(" " + degrees);
      s[i].to(degrees, tDur);
    }
    console.log();
  }, (tDur + tDly));
});