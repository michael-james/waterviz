// var five = require("johnny-five");
// var board = new five.Board();

const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi()
});

board.on("ready", () => {
  console.log("Connected");

  // Initialize the servo instance
  var a = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    range: [0, 180],
    pin: 2,
  });

  var b = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    range: [0, 180],
    pin: 3,
  });

  var degrees = 90;

  // a.to(degrees).delay(1000).to(0);
  // b.to(degrees).delay(1000).to(0);

  setInterval(function() {
    degrees = Math.floor(Math.random() * 100);
    a.to(degrees);
    b.to(degrees);
  }, 1000);
});