/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as socketio from 'socket.io';
import * as _ from "lodash";

export class IO {

    public io: any = null;

    public list: {} = {};

    constructor(server: any) {
        this.io = socketio.listen(server);
        this.list = {};
    }

    public wait(config, event: any): void {

        this.io.sockets.on('connection', (socket) => {

            socket.on('request', (request: { response: { name: string, id: string, method: string, from: string }, payload: { message: string } }) => {

                let response = request.response;

                event.emitter.emit('socket', request);

                let from = response.from;
                switch (response.method) {
                    case "enter": {
                        if (!this.list[socket.id]) {
                            this.list[socket.id] = from;
                        }

                        request.response.id = socket.id;
                        this.io.sockets.connected[socket.id].emit(request.response.name, request);
                    }
                        break;
                    case "leave": {
                        if (this.list[socket.id]) {
                            delete this.list[socket.id];
                        }

                        request.response.id = socket.id;
                        this.io.sockets.connected[socket.id].emit(request.response.name, request);
                    }
                        break;
                    case "broadcast": {
                        _.forEach(this.io.sockets.connected, (client: any, id: string): void => {
                            request.response.id = id;
                            client.emit(request.response.name, request);
                        });
                    }
                }

                // callback
                // this.io.sockets.connected[socket.id].emit('client', {value: socket.id});
            });

            socket.on("disconnect", () => {

                //   if (this.list[socket.id]) {
                //       delete this.list[socket.id];
                //   }

                //    socket = null;
            });
        });

    }
}

module.exports = IO;
