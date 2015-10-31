module.exports = function (RED) {
  'use strict';

  require('webduino-blockly');

  function Led(n) {
    var node = this,
      board, led;

    RED.nodes.createNode(this, n);

    node.pin = n.pin;
    node.action = n.action;
    board = RED.nodes.getNode(n.board).board;

    board.on('ready', function () {
      led = getLed(board, parseInt(node.pin));
    });

    node.on('input', function (msg) {
      if (led) {
        led[node.action].apply(led, [function () {
          node.send({
            payload: led._pin.value
          });
        }]);
      }
    });

    node.on('close', function () {
      if (led) {
        led.off();
      }
    });
  }

  RED.nodes.registerType("led", Led);
};
