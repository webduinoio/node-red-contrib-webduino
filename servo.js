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
      node.status({
        fill: "green",
        shape: "dot",
        text: "connected"
      });
      servo.angle = parseInt(node.init);
    });

    board.on('close', function () {
      node.status({
        fill: "red",
        shape: "ring",
        text: "disconnected"
      });
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
