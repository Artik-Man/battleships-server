"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require('net');
function getOpenPort(callback, host = 'localhost', start = 1025, end = 65534) {
    const timeout = 2000;
    while (start <= end) {
        const port = start;
        (function (port) {
            var s = new net.Socket();
            s.setTimeout(timeout, function () { s.destroy(); });
            s.connect(port, host, function () {
                callback(port);
                return;
            });
            s.on('data', function (data) {
                console.log(port + ': ' + data);
                s.destroy();
            });
            s.on('error', function (e) {
                s.destroy();
            });
        })(port);
        start++;
    }
}
exports.default = getOpenPort;
