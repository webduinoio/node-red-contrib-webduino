var webduino = require('webduino-js'),
  utils = require('./utils'),
  IR = require('./lib/IR');

module.exports = function (RED) {
  'use strict';

  function IRRaw(n) {
    var node = this,
      boardNode, irraw;

    RED.nodes.createNode(this, n);

    node.autostartRecv = n.autostartRecv;
    node.sendPin = parseInt(n.sendPin);
    node.recvPin = parseInt(n.recvPin);

    boardNode = RED.nodes.getNode(n.board);
    boardNode.mount(node, function (board) {
      irraw = new IR(board, node.sendPin, node.recvPin);
      if (node.autostartRecv) {
        irraw.recv(function (evt) {
          node.send({
            payload: evt
          });
        });
      }
    });

    node.on('input', function (msg) {
      utils.invoke(irraw, msg, function (evt) {
        node.send({
          payload: evt
        });
      });
    });
  }

  RED.nodes.registerType("irraw", IRRaw);
};
