var webduino = require('webduino-js'),
  utils = require('./utils');

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
      utils.invoke(photocell, msg, function (evt) {
        node.send({
          payload: evt
        });
      });
    });

    node.on('close', function () {
      if (photocell && photocell.state === 'on') {
        photocell.off();
      }
    });
  }

  RED.nodes.registerType('photocell', Photocell);
};
