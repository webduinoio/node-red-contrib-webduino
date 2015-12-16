var webduino = require('webduino-js');

module.exports = function (RED) {
  'use strict';

  function Photocell(n) {
    var node = this,
      boardNode, photocell;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.autoStart = n.autoStart;
    node.samplingInterval = parseInt(n.samplingInterval);

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      photocell = new webduino.module.Photocell(board, node.pin);

      if (node.samplingInterval && !isNaN(node.samplingInterval)) {
        board.samplingInterval = node.samplingInterval;
      }

      if (node.autoStart) {
        photocell.on(function (evt) {
          node.send({
            payload: evt
          });
        });
      }
    });

    node.on('input', function (msg) {
      var payload = getPayload(msg.payload);

      if (photocell && payload) {
        photocell[payload.method].apply(photocell, [function (evt) {
          if (evt) {
            node.send({
              payload: evt
            });
          }
        }]);
      }
    });

    node.on('close', function () {
      if (photocell) {
        photocell.off();
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

  RED.nodes.registerType('photocell', Photocell);
};
