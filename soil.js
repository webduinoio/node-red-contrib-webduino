var webduino = require('webduino-js'),
  utils = require('./utils');

module.exports = function (RED) {
  'use strict';

  function Soil(n) {
    var node = this,
      boardNode, soil;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.autoStart = n.autoStart;
    node.samplingInterval = parseInt(n.samplingInterval);

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      soil = new webduino.module.Soil(board, node.pin);

      if (node.samplingInterval && !isNaN(node.samplingInterval)) {
        board.samplingInterval = node.samplingInterval;
      }

      if (node.autoStart) {
        soil.on(function (evt) {
          node.send({
            payload: evt
          });
        });
      }
    });

    node.on('input', function (msg) {
      utils.invoke(soil, msg, function (evt) {
        node.send({
          payload: evt
        });
      });
    });

    node.on('close', function () {
      if (soil && soil.state === 'on') {
        soil.off();
      }
    });
  }

  RED.nodes.registerType('soil', Soil);
};
