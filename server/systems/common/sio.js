/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Socket;
(function (Socket) {
    // Socket.IO
    var socketio = require('socket.io');
    var _ = require("lodash");
    var IO = /** @class */ (function () {
        function IO(server) {
            this.sio = null;
            this.socket = null;
            this.clients = [];
            this.sio = socketio.listen(server);
        }
        IO.prototype.wait = function (event) {
            var _this = this;
            this.sio.sockets.on('connection', function (socket) {
                _this.socket = socket;
                _.forEach(_this.sio.sockets.connected, function (client, id) {
                    _this.clients.push(client);
                });
                socket.on('server', function (data) {
                    event.emitter.emit('socket', data);
                    // all client except self
                    // socket.broadcast.emit('client', {value: data.value});
                    // callback
                    _this.sio.sockets.connected[socket.id].emit('client', { value: socket.id });
                });
                socket.on("disconnect", function () {
                    _this.socket = null;
                });
            });
        };
        return IO;
    }());
    Socket.IO = IO;
})(Socket = exports.Socket || (exports.Socket = {}));
module.exports = Socket;
//# sourceMappingURL=sio.js.map