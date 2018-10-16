/**!
 Copyright (c) 2018 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AuthServicesModule;
(function (AuthServicesModule) {
    var AuthServices = angular.module('AuthServices', []);
    AuthServices.factory('Profile', ['$resource',
        function ($resource) {
            return $resource('/profile/api', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
            });
        }]);
    AuthServices.factory('Register', ['$resource',
        function ($resource) {
            return $resource('/auth/local/register', {}, {
                regist: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Login', ['$resource',
        function ($resource) {
            return $resource('/auth/local/login', {}, {
                login: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Password', ['$resource',
        function ($resource) {
            return $resource('/auth/local/password', {}, {
                change: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Logout', ['$resource',
        function ($resource) {
            return $resource('/auth/logout', {}, {
                logout: { method: 'GET' }
            });
        }]);
    AuthServices.service('AuthService', ["Register", "Login", "Logout", "Password", "PublicKeyService",
        function (Register, Login, Logout, Password, PublicKeyService) {
            var publickey_encrypt = function (key, plain, callback) {
                var username_encrypted = cryptico.encrypt(encodeURIComponent(plain), key); // encrypt漢字
                if (username_encrypted.status === "success") {
                    callback(null, username_encrypted.cipher);
                }
                else {
                    callback({ code: 1, message: username_encrypted.status }, "");
                }
            };
            var username_and_password_encrypt = function (systempassphrase, username, password, callback) {
                if (systempassphrase) {
                    publickey_encrypt(systempassphrase, username, function (error, encrypted_username) {
                        if (!error) {
                            publickey_encrypt(systempassphrase, password, function (error, encrypted_password) {
                                if (!error) {
                                    callback(null, encrypted_username, encrypted_password);
                                }
                                else {
                                    callback(error, "", "");
                                }
                            });
                        }
                        else {
                            callback(error, "", "");
                        }
                    });
                }
                else {
                    callback(null, username, password);
                }
            };
            this.Regist = function (username, password, metadata, callback) {
                PublicKeyService.Fixed(function (error, key) {
                    var regist = new Register();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            regist.username = username;
                            regist.password = password;
                            regist.metadata = metadata;
                            regist.$regist(function (account) {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(null, account.value);
                                    }
                                    else {
                                        callback(account, null);
                                    }
                                }
                                else {
                                    callback({ code: 10000, message: "network error" }, null);
                                }
                            });
                        }
                    });
                });
            };
            this.Login = function (username, password, callback) {
                PublicKeyService.Fixed(function (error, key) {
                    var login = new Login();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            login.username = username;
                            login.password = password;
                            login.$login(function (result) {
                                if (result) {
                                    if (result.code === 0) {
                                        callback(null, result.value);
                                    }
                                    else {
                                        callback(result, null);
                                    }
                                }
                                else {
                                    callback({ code: 10000, message: "network error" }, null);
                                }
                            });
                        }
                    });
                });
            };
            this.Password = function (username, password, callback) {
                PublicKeyService.Fixed(function (error, key) {
                    var pass = new Password();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            pass.username = username;
                            pass.password = password;
                            pass.$change(function (result) {
                                if (result) {
                                    if (result.code === 0) {
                                        callback(null, result.value);
                                    }
                                    else {
                                        callback(result, null);
                                    }
                                }
                                else {
                                    callback({ code: 10000, message: "network error" }, null);
                                }
                            });
                        }
                    });
                });
            };
            this.Logout = function (callback) {
                var logout = new Logout();
                logout.$logout(function (account) {
                    if (account) {
                        if (account.code === 0) {
                            callback(null, account.value);
                        }
                    }
                    else {
                        callback({ code: 10000, message: "network error" }, null);
                    }
                });
            };
        }]);
})(AuthServicesModule || (AuthServicesModule = {}));
//# sourceMappingURL=auth_services.js.map