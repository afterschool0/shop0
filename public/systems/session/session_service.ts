/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace SessionServicesModule {

    let SessionServices: angular.IModule = angular.module('SessionServices', []);

    SessionServices.factory('Session', ['$resource',
        ($resource: any): any => {
            return $resource('/session/api', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'},
            });
        }]);

    SessionServices.service("SessionService", ['Session', function (Session: any): void {

        this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Session.get({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let self = new Session();
            self.data = content;
            self.$put({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

    }]);

}
