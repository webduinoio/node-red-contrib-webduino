'use strict';

function getPayload(payloadString) {
  try {
    return JSON.parse(payloadString);
  } catch (e) {
    var list = payloadString.split(',');
    return {
      method: list[0],
      params: list.slice(1)
    };
  }
}

function invoke(comp, msg, callback) {
  var payload = getPayload(msg.payload);

  if (comp && payload) {
    comp[payload.method].apply(comp, payload.params.concat(callback));
  }
}

function invokeNumeric(comp, msg, callback) {
  var payload = getPayload(msg.payload);

  payload.params = payload.params.map(function (val) {
    return parseInt(val);
  });

  if (comp && payload) {
    comp[payload.method].apply(comp, payload.params.concat(callback));
  }
}

module.exports = {
  getPayload: getPayload,
  invoke: invoke,
  invokeNumeric: invokeNumeric
};
