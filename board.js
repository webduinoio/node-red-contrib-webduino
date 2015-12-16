var webduino = require('webduino-js'),
  undef = void 0;

module.exports = function (RED) {
  'use strict';

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
    node.mounted = [];
    node.onInits = [];

    node.mount = function (node, initFunc) {
      this.mounted.push(node);
      this.onInits.push(initFunc);
    };

    node.opts = {
      transport: node.transport
    };
    node.opts[map[node.transport]] = node[map[node.transport]];

    node.board = (n.transport === 'mqtt' ? new webduino.WebArduino(node.opts) : new webduino.Arduino(node.opts));

    node.on('close', function () {
      if (node.board) {
        node.board.disconnect();
      }
    });

    node.board.on(webduino.BoardEvent.READY, function (board) {
      setStatus(node.mounted, {
        fill: 'green',
        shape: 'dot',
        text: 'connected'
      });
      doInit(node.onInits, board);
    });

    node.board.on(webduino.BoardEvent.ERROR, function () {
      setStatus(node.mounted, {
        fill: 'red',
        shape: 'ring',
        text: 'error'
      });
    });

    node.board.on(webduino.BoardEvent.DISCONNECT, function () {
      setStatus(node.mounted, {
        fill: 'yellow',
        shape: 'ring',
        text: 'disconnect'
      });
    });
  }

  function setStatus(nodes, status) {
    nodes.forEach(function (n) {
      n.status(status);
    });
  }

  function doInit(onInits, board) {
    onInits.forEach(function (initFunc) {
      initFunc.apply(undef, [board]);
    });
  }

  RED.nodes.registerType('board', Board);
};
