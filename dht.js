var webduino = require('webduino-js');

module.exports = function (RED) {
  'use strict';

  function Dht(n) {
    var node = this,
      boardNode, dht;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      dht = new webduino.module.Dht(board, board.getDigitalPin(node.pin));
    });

    node.on('input', function (msg) {
      var payload = getPayload(msg.payload);

      payload.params = payload.params.map(function (val) {
        return parseInt(val)
      });

      if (dht && payload) {
        dht[payload.method].apply(dht, [function (evt) {
          if (evt) {
            node.send({
              payload: evt
            });
          }
        }].concat(payload.params));
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

  RED.nodes.registerType("dht", Dht);
};
