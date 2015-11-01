module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  function Photocell(n) {
    var node = this,
      board, photocell;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.autoStart = n.autoStart;
    node.samplingInterval = parseInt(n.samplingInterval);
    board = RED.nodes.getNode(n.board).board;

    board.on('ready', function () {
      photocell = getPhotocell(board, parseInt(node.pin));
      node.status({
        fill: 'green',
        shape: 'dot',
        text: 'connected'
      });
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

    board.on('error', function () {
      node.status({
        fill: 'yellow',
        shape: 'ring',
        text: 'error'
      });
    });

    board.on('close', function () {
      node.status({
        fill: 'red',
        shape: 'ring',
        text: 'disconnected'
      });
    });

    node.on('input', function (msg) {
      if (photocell) {
        photocell[msg.payload].apply(photocell, [function (evt) {
          node.send({
            payload: evt
          });
        }]);
      }
    });

    node.on('close', function () {
      if (photocell) {
        photocell.off();
      }
    });
  }

  RED.nodes.registerType('photocell', Photocell);
};
