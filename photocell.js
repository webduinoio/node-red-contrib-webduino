module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  function Photocell(n) {
    var node = this,
      board, photocell;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.action = n.action;
    board = RED.nodes.getNode(n.board).board;

    board.on('ready', function () {
      photocell = getPhotocell(board, parseInt(node.pin));
    });

    node.on('input', function (msg) {
      if (photocell) {
        photocell[node.action].apply(photocell, [function (evt) {
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

  RED.nodes.registerType("photocell", Photocell);
};
