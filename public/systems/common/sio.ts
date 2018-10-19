/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let Services = angular.module('Sockets', []);

Services.factory('Socket', ["$rootScope", ($rootScope: any): any => {
    let socket: any = io.connect();
    return {
        on: (responseName: any, callback: any): void => {
            socket.on(responseName, (data): void => {
                let args: any = [data];
                $rootScope.$apply((): void => {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        emit: (requestName:string, requestData:{response:{name:string, id:string}, payload:{message:string}}): void => {
            let response = requestData;
            socket.emit(requestName, response);
        }
    };
}]);