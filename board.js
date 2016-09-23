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

    boardReady(node, true, function () {
      setConnected(node);
      doInit(node.onInits, node.board);
    });

    node.on('close', function () {
      if (node.board) {
        node.board.disconnect();
      }
    });
  }

  function boardReady(node, autoReconnect, callback) {
    var callback = (typeof autoReconnect === 'function' ? autoReconnect : callback),
      board = createBoard(node.opts),
      terminate = function () {
        node.board = null;
        delete node.board;

        if (autoReconnect === true) {
          setTimeout(function () {
            boardReady(node, autoReconnect, callback);
          }, 5000);
        }
      };

    node.board = board;

    board.once(webduino.BoardEvent.ERROR, function (err) {
      if (board.isConnected) {
        board.once(webduino.BoardEvent.DISCONNECT, terminate);
        board.disconnect();
      } else {
        terminate();
      }
    });

    board.once(webduino.BoardEvent.READY, callback);

    board.on(webduino.BoardEvent.ERROR, function () {
      setDisconnected(node);
    });

    board.on(webduino.BoardEvent.DISCONNECT, function () {
      setDisconnected(node);
    });
  }

  function createBoard(opts) {
    if (opts.transport === 'mqtt') {
      opts.multi = true;
      return new webduino.WebArduino(opts);
    } else {
      return new webduino.Arduino(opts);
    }
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
