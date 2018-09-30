/**!
 Copyright (c) 2018 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AuthServicesModule;
(function (AuthServicesModule) {
    var AuthServices = angular.module('AuthServices', []);
    AuthServices.service('AuthService', ["PublicKeyService",
        function (PublicKeyService) {
            var POST = "POST";
            var default_header = {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                "x-requested-with": "XMLHttpRequest"
            };
            var publickey_encrypt = function (key, plain, error) {
                var result = "";
                var username_encrypted = cryptico.encrypt(plain, key);
                if (username_encrypted.status === "success") {
                    result = username_encrypted.cipher;
                }
                else {
                    error(username_encrypted.status);
                }
                return result;
            };
            var public_key = function (key, username, password) {
                var result = { username: "", password: "" };
                result.username = username;
                result.password = password;
                if (key) {
                    result.username = publickey_encrypt(key, username, function (status) { });
                    result.password = publickey_encrypt(key, password, function (status) { });
                }
                return result;
            };
            var access = function (url, option, callback, error) {
                fetch(url, option).then(function (res) { return res.json(); }).then(function (account) {
                    if (account) {
                        if (account.code === 0) {
                            callback(account.value);
                        }
                        else {
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
            this.Regist = function (username, password, displayName, metadata, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var regist = public_key(key, username, password);
                    regist.displayName = displayName;
                    regist.metadata = metadata;
                    var body = JSON.stringify(regist);
                    access("/auth/local/register", { method: POST, headers: default_header, body: body }, callback, error);
                });
            };
            this.Member = function (username, password, displayName, metadata, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var regist = public_key(key, username, password);
                    regist.displayName = displayName;
                    regist.metadata = metadata;
                    var body = JSON.stringify(regist);
                    access("/auth/local/register", { method: POST, headers: default_header, body: body }, callback, error);
                });
            };
            this.Login = function (username, password, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var login = public_key(key, username, password);
                    var body = JSON.stringify(login);
                    access("/auth/local/login", { method: POST, headers: default_header, body: body }, callback, error);
                });
            };
            this.Logout = function (callback, error) {
                access("/auth/logout", { method: "GET", cache: "no-cache", headers: default_header }, callback, error);
            };
            this.Password = function (username, password, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var pass = public_key(key, username, password);
                    var body = JSON.stringify(pass);
                    access("/auth/local/password", { method: POST, headers: default_header, body: body }, callback, error);
                });
            };
        }]);
    AuthServices.service('ProfileService', [
        function () {
            this.Get = function (callback, error) {
                var self = {};
                var options = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                fetch("/profile/api", options).then(function (res) { return res.json(); }).then(function (account) {
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
            this.Put = function (content, callback, error) {
                var self = {};
                self.local = content;
                var method = "PUT";
                var body = JSON.stringify(self);
                var headers = {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    "x-requested-with": "XMLHttpRequest"
                };
                fetch("/profile/api", { method: method, headers: headers, body: body }).then(function (res) { return res.json(); }).then(function (account) {
                    if (account) {
                        if (account.code === 0) {
                            callback(account.value);
                        }
                        else {
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
})(AuthServicesModule || (AuthServicesModule = {}));
//# sourceMappingURL=auth_services.js.map