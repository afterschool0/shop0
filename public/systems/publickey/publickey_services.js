/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var PublicKeyServicesModule;
(function (PublicKeyServicesModule) {
    var PublicKeyServices = angular.module('PublicKeyServices', []);
    PublicKeyServices.service('PublicKeyService', [
        function () {
            this.Fixed = function (callback, error) {
                var options = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                fetch("/publickey/fixed", options).then(function (res) { return res.json(); }).then(function (account) {
                    if (account) {
                        switch (account.code) {
                            case 0:
                                callback(account.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(account.code, account.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                }).catch(function () {
                    error(10000, "network error");
                });
            };
            this.Dynamic = function (callback, error) {
                var options = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                fetch("/publickey/dynamic", options).then(function (res) { return res.json(); }).then(function (account) {
                    if (account) {
                        switch (account.code) {
                            case 0:
                                callback(account.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(account.code, account.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                }).catch(function () {
                    error(10000, "network error");
                });
            };
            this.Token = function (callback, error) {
                var options = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                fetch("/publickey/token", options).then(function (res) { return res.json(); }).then(function (account) {
                    if (account) {
                        switch (account.code) {
                            case 0:
                                callback(account.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(account.code, account.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                }).catch(function () {
                    error(10000, "network error");
                });
            };
        }
    ]);
})(PublicKeyServicesModule || (PublicKeyServicesModule = {}));
//# sourceMappingURL=publickey_services.js.map