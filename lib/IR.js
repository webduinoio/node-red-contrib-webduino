'use strict';

var webduino = require('webduino-js');

var proto;
var sendLen = 32;
var lastSendIR = false;
var isDebug = true;

function log(obj) {
  if (isDebug) {
    console.log(obj);
  }
}

/**
 * A utility that IR controller...
 * @since 0.1
 * @class IR
 * @constructor
 */
function IR(board, irSend, irRecv) {
  this._board = board;
  this.pinSendIR = irSend;
  this.pinRecvIR = irRecv;
  this.irSendCallback = function () {};
  this.irRecvCallback = function () {};
  var pin = board.getDigitalPin(irRecv);
  if (pin) {
    pin.setMode(0);
  }

  var self = this;
  board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
    var m = event.message;
    //send IR data to Board
    if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0B) {
      log("send IR data to Board callback");
      if (lastSendIR) {
        //store OK
        lastSendIR = false;
        log("store OK");
        log("send pin:", self.pinSendIR);
        board.send([0xf0, 0x04, 0x09, 0x0C, self.pinSendIR, 0xF7]);
      }
    }
    //trigger IR send
    else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0C) {
      log("trigger IR send callback...");
      self.irSendCallback();
    }
    //record IR data
    else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0D) {
      log("record IR callback...");
      var strInfo = '';
      for (var i = 3; i < m.length; i++) {
        strInfo += String.fromCharCode(m[i]);
      }
      self.irRecvCallback(strInfo.substring(4));
    } else {
      log(event);
    }
  });
}

function send(board, startPos, data) {
  var CMD = [0xf0, 0x04, 0x09, 0x0A];
  var raw = [];
  raw = raw.concat(CMD);
  var n = '0000' + startPos.toString(16);
  n = n.substring(n.length - 4);
  for (var i = 0; i < 4; i++) {
    raw.push(n.charCodeAt(i));
  }
  raw.push(0xf7);
  // send Data //  
  CMD = [0xf0, 0x04, 0x09, 0x0B];
  raw = raw.concat(CMD);
  for (i = 0; i < data.length; i++) {
    raw.push(data.charCodeAt(i));
  }
  raw.push(0xf7);
  board.send(raw);
}

function sendIRCmd(board, cmd, len) {
  for (var i = 0; i < cmd.length; i = i + len) {
    var data = cmd.substring(i, i + len);
    send(board, i / 8, data);
  }
  lastSendIR = true;
}

IR.prototype = proto = Object.create(Object.prototype, {
  constructor: {
    value: IR
  },
  isDebug: {
    get: function () {
      return isDebug;
    },
    set: function (val) {
      isDebug = val;
    }
  }
});

/**
 * Receiver Remote Controller Data to JS
 * @method recv
 * @param {Callback function}
 */
proto.recv = function (callback) {
  this.irRecvCallback = callback;
  this._board.send([0xF0, 0x04, 0x09, 0x0D, this.pinRecvIR, 0xF7]);
};

/**
 * Send IR Data to Webduino board
 * @method send
 * @param {String} IR Data
 * @param {callback} after send IR data
 */
proto.send = function (data, callback) {
  sendIRCmd(this._board, data, sendLen);
  this.irSendCallback = callback;
}

module.exports = IR;
