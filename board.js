module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  var map = {
    mqtt: 'device',
    serial: 'path',
    bluetooth: 'address'
  };

  function Board(n) {
    var node = this;

    RED.nodes.createNode(node, n);

    node.transport = n.transport;
    node.device = n.device;
    node.path = n.path;
    node.address = n.address;

    node.opts = {
      transport: node.transport,
      multi: true
    };
    node.opts[map[node.transport]] = node[map[node.transport]];

    node.board = (n.transport === 'mqtt' ? new webduino.WebArduino(node.opts) : new webduino.Arduino(node.opts));

    node.on('close', function () {
      if (node.board) {
        setTimeout(function () {
          node.board.close();
        }, 2000);
      }
    });
  }

  RED.nodes.registerType('board', Board);
};
