var webduino = require('webduino-js'),
  utils = require('./utils');

module.exports = function (RED) {
  'use strict';

  function Relay(n) {
    var node = this,
      boardNode, relay;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      relay = new webduino.module.Relay(board, board.getDigitalPin(node.pin));
    });

    node.on('input', function (msg) {
      utils.invokeNumeric(relay, msg, function () {
        node.send({
          payload: relay._pin.value
        });
      });
    });
  }

  RED.nodes.registerType("relay", Relay);
};
