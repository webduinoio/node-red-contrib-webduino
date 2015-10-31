module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  function Servo(n) {
    var node = this,
      board, servo;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.init = n.init;
    board = RED.nodes.getNode(n.board).board;

    board.on('ready', function () {
      servo = getServo(board, parseInt(node.pin));
      servo.angle = parseInt(node.init);
    });

    node.on('input', function (msg) {
      if (servo) {
        var agl = parseInt(msg.payload.angle);
        if (!isNaN(agl)) {
          servo.angle = agl;
        }
      }
    });
  }

  RED.nodes.registerType('servo', Servo);
};
