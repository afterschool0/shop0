/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socketio = require("socket.io");
var _ = require("lodash");
var IO = /** @class */ (function () {
    function IO(server) {
        this.io = null;
        this.list = {};
        this.io = socketio.listen(server);
        this.list = {};
    }
    IO.prototype.wait = function (config, event) {
        var _this = this;
        this.io.sockets.on('connection', function (socket) {
            socket.on('request', function (request) {
                var response = request.response;
                event.emitter.emit('socket', request);
                var from = response.from;
                switch (response.method) {
                    case "enter":
                        {
                            if (!_this.list[socket.id]) {
                                _this.list[socket.id] = from;
                            }
                            request.response.id = socket.id;
                            _this.io.sockets.connected[socket.id].emit(request.response.name, request);
                        }
                        break;
                    case "leave":
                        {
                            if (_this.list[socket.id]) {
                                delete _this.list[socket.id];
                            }
                            request.response.id = socket.id;
                            _this.io.sockets.connected[socket.id].emit(request.response.name, request);
                        }
                        break;
                    case "broadcast": {
                        _.forEach(_this.io.sockets.connected, function (client, id) {
                            request.response.id = id;
                            client.emit(request.response.name, request);
                        });
                    }
                }
                // callback
                // this.io.sockets.connected[socket.id].emit('client', {value: socket.id});
            });
            socket.on("disconnect", function () {
                //   if (this.list[socket.id]) {
                //       delete this.list[socket.id];
                //   }
                //    socket = null;
            });
        });
    };
    return IO;
}());
exports.IO = IO;
module.exports = IO;
//# sourceMappingURL=sio.js.map