/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var PublicKeyServicesModule;
(function (PublicKeyServicesModule) {
    var PublicKeyServices = angular.module('PublicKeyServices', []);
    PublicKeyServices.factory('FixedPublicKey', ['$resource',
        function ($resource) {
            return $resource('/publickey/fixed', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.factory('DynamicPublicKey', ['$resource',
        function ($resource) {
            return $resource('/publickey/dynamic', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.factory('Token', ['$resource',
        function ($resource) {
            return $resource('/publickey/token', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.service('PublicKeyService', ["FixedPublicKey", "DynamicPublicKey", "Token",
        function (FixedPublicKey, DynamicPublicKey, Token) {
            this.Fixed = function (callback) {
                FixedPublicKey.get({}, function (result) {
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
                    }
                    else {
                        callback({ code: 10000, message: "network error" }, null);
                    }
                });
            };
            this.Dynamic = function (callback) {
                DynamicPublicKey.get({}, function (result) {
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
                    }
                    else {
                        callback({ code: 10000, message: "network error" }, null);
                    }
                });
            };
            this.Token = function (callback) {
                Token.get({}, function (result) {
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
                    }
                    else {
                        callback({ code: 10000, message: "network error" }, null);
                    }
                });
            };
        }]);
})(PublicKeyServicesModule || (PublicKeyServicesModule = {}));
//# sourceMappingURL=publickey_services.js.map