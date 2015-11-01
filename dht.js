module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  function Dht(n) {
    var node = this,
      board, dht;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.action = n.action;
    board = RED.nodes.getNode(n.board).board;

    board.on('ready', function () {
      dht = getDht(board, parseInt(node.pin));
      node.status({
        fill: "green",
        shape: "dot",
        text: "connected"
      });
    });

    board.on('close', function () {
      node.status({
        fill: "red",
        shape: "ring",
        text: "disconnected"
      });
    });

    node.on('input', function (msg) {
      if (dht) {
        dht[node.action].apply(dht, [function (evt) {
          node.send({
            payload: evt
          });
        }, 2000]);
      }
    });

    node.on('close', function () {
      if (dht) {
        dht.stopRead();
      }
    });
  }

  RED.nodes.registerType("dht", Dht);
};
