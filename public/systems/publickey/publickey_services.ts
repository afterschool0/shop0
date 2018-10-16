/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace PublicKeyServicesModule {

    let PublicKeyServices: angular.IModule = angular.module('PublicKeyServices', []);

    PublicKeyServices.factory('FixedPublicKey', ['$resource',
        ($resource: any): any => {
            return $resource('/publickey/fixed', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.factory('DynamicPublicKey', ['$resource',
        ($resource: any): any => {
            return $resource('/publickey/dynamic', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.factory('Token', ['$resource',
        ($resource: any): any => {
            return $resource('/publickey/token', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.service('PublicKeyService', ["FixedPublicKey", "DynamicPublicKey", "Token",
        function (FixedPublicKey: any, DynamicPublicKey, Token): void {

            this.Fixed = (callback: (error, result: any) => void): void => {
                FixedPublicKey.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(null, result.value);
                                break;
                            case 1:
                                callback(null,null);
                                break;
                            default:
                                callback(result,null);
                        }
                    } else {
                        callback({code:10000, message:"network error"},null);
                    }
                });
            };

            this.Dynamic = (callback: (error,result: any) => void): void => {
                DynamicPublicKey.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(null, result.value);
                                break;
                            case 1:
                                callback(null,null);
                                break;
                            default:
                                callback(result,null);
                        }
                    } else {
                        callback({code:10000, message:"network error"},null);
                    }
                });
            };

            this.Token = (callback: (error, result: any) => void): void => {
                Token.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(null, result.value);
                                break;
                            case 1:
                                callback(null,null);
                                break;
                            default:
                                callback(result,null);
                        }
                    } else {
                        callback({code:10000, message:"network error"},null);
                    }
                });
            };

        }]);

}