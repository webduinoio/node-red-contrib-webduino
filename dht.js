var webduino = require('webduino-js'),
  utils = require('./utils');

module.exports = function (RED) {
  'use strict';

  function Dht(n) {
    var node = this,
      boardNode, dht;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.autostartInterval = parseInt(n.autostartInterval);

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      dht = new webduino.module.Dht(board, board.getDigitalPin(node.pin));
      if (node.autostartInterval && !isNaN(node.autostartInterval)) {
        board.autostartInterval = node.autostartInterval;
        if (board.autostartInterval > 0) {
          dht.read(function (evt) {
            if (evt) {
              node.send({
                payload: evt
              });
            }
          }, board.autostartInterval * 1000);
        }
      }
    });

    node.on('input', function (msg) {
      var payload = utils.getPayload(msg.payload);

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

    node.on('close', function () {
      if (dht) {
        dht.stopRead();
      }
    });
  }

  RED.nodes.registerType("dht", Dht);
};
