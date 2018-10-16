/**!
 Copyright (c) 2018 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ProfileServicesModule {

    let ProfileServices: angular.IModule = angular.module('ProfileServices', []);

    ProfileServices.factory('Profile', ['$resource',
        ($resource: any): any => {
            return $resource('/profile/api', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'},
            });
        }]);

    ProfileServices.service('ProfileService', ["Profile", function (Profile: any): void {

        this.Get = (callback: (error: any, result: any) => void): void => {
            Profile.get({}, (result: any): void => {
                if (result) {
                    switch (result.code) {
                        case 0:
                            callback(null, result.value);
                            break;
                        case 1:
                            callback(null, null);
                            break;
                        default:
                            callback(result, null);
                    }
                } else {
                    callback({code: 10000, message: "network error"}, null);
                }
            });
        };

        this.Put = (content: any, callback: (error: any, result: any) => void): void => {
            let self = new Profile();
            self.local = content;
            self.$put({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(null, result.value);
                    } else {
                        callback(result, null);
                    }
                } else {
                    callback({code: 10000, message: "network error"}, null);
                }
            });
        };

    }]);
}