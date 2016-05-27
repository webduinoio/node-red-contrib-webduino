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
    node.nodes = [];
    node.onInits = [];

    node.mount = function (node, initFunc) {
      this.nodes.push(node);
      this.onInits.push(initFunc);
      setDisconnected(this);
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
      setConnected(node);
      doInit(node.onInits, board);
    });

    node.board.on(webduino.BoardEvent.ERROR, function () {
      setDisconnected(node);
    });

    node.board.on(webduino.BoardEvent.DISCONNECT, function () {
      setDisconnected(node);
    });
  }

  function setConnected(boardNode) {
    setStatus(boardNode.nodes, {
      fill: 'green',
      shape: 'dot',
      text: 'connected'
    });
  }

  function setDisconnected(boardNode) {
    setStatus(boardNode.nodes, {
      fill: 'yellow',
      shape: 'ring',
      text: 'disconnected'
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
