var webduino = require('webduino-js');

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
      var payload = getPayload(msg.payload);

      payload.params = payload.params.map(function (val) {
        return parseInt(val)
      });

      if (led && payload) {
        led[payload.method].apply(led, payload.params.concat(function () {
          node.send({
            payload: led._pin.value
          });
        }));
      }
    });
  }

  function getPayload(payloadString) {
    try {
      return JSON.parse(payloadString);
    } catch (e) {
      var list = payloadString.split(',');
      return {
        method: list[0],
        params: list.slice(1)
      };
    }
  }

  RED.nodes.registerType("led", Led);
};
