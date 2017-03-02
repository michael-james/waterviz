// var five = require("johnny-five");
// var board = new five.Board();

const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi()
});

var count = 12;
var yMin = 20;
var yMax = 140;
var tDur = 1000;
var tDly = 500;

board.on("ready", () => {
  console.log("Connected");

  var s = [];
  for (var i = 0; i < count; i++) {
    s.push(new five.Servo({controller: "PCA9685", pin: i, startAt: 0,}));
  }

  for (var i = s.length - 1; i >= 0; i--) {
    // s[i].min();
  }

  setInterval(function() {
    process.stdout.write("new!");
    for (var i = s.length - 1; i >= 0; i--) {
      
      var degrees = yMin + Math.floor(Math.random() * (yMax - yMin));
      process.stdout.write(" " + degrees);
      s[i].to(degrees, tDur);
    }
    console.log();
  }, (tDur + tDly));

    // Initialize the servo instance
  // var a = new five.Servo({controller: "PCA9685", pin: 0,});
  // var b = new five.Servo({controller: "PCA9685", pin: 1,});
  // var a = new five.Servo({controller: "PCA9685", pin: 2,});
  // var b = new five.Servo({controller: "PCA9685", pin: 3,});
  // var a = new five.Servo({controller: "PCA9685", pin: 4,});
  // var b = new five.Servo({controller: "PCA9685", pin: 5,});
  // var a = new five.Servo({controller: "PCA9685", pin: 6,});
  // var b = new five.Servo({controller: "PCA9685", pin: 7,});
  // var a = new five.Servo({controller: "PCA9685", pin: 8,});
  // var b = new five.Servo({controller: "PCA9685", pin: 9,});
  // var a = new five.Servo({controller: "PCA9685", pin: 10,});
  // var b = new five.Servo({controller: "PCA9685", pin: 11,});


  // var degrees = 0;

  // degrees = Math.floor(Math.random() * 180);
  //   a.to(degrees, 10000);
  //   degrees = Math.floor(Math.random() * 180);
  //   b.to(degrees, 10000);

  // a.min();
  // b.min();
  // // b.to(0);

  // a.sweep({
  //   range: [20, 140], 
  //   interval: 10000,
  //   // step: 10
  // })

  // b.sweep({
  //   range: [20, 140], 
  //   interval: 10000,
  //   // step: 10
  // })

  // a.to(degrees).delay(1000).to(0);
  // b.to(degrees).delay(1000).to(0);

  // setInterval(function() {
  //   degrees = Math.floor(Math.random() * 180);
  //   a.to(degrees, 10000);
  //   degrees = Math.floor(Math.random() * 180);
  //   b.to(degrees, 10000);
  // }, 12000);
});