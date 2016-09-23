var webduino = require('webduino-js'),
  utils = require('./utils');

module.exports = function (RED) {
  'use strict';

  function Led(n) {
    var node = this,
      boardNode, led;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      led = new webduino.module.Led(board, board.getDigitalPin(node.pin));
    });

    node.on('input', function (msg) {
      utils.invokeNumeric(led, msg, function () {
        node.send({
          payload: led._pin.value
        });
      });
    });
  }

  RED.nodes.registerType("led", Led);
};
