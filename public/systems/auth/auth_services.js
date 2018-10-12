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
            this.Regist = function (username, password, groupid, metadata, callback, error_callback) {
                PublicKeyService.Fixed(function (key) {
                    var regist = new Register();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            regist.username = username;
                            regist.password = password;
                            regist.groupid = groupid;
                            regist.metadata = metadata;
                            regist.$regist(function (account) {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    }
                                    else {
                                        error_callback(account.code, account.message);
                                    }
                                }
                                else {
                                    error_callback(10000, "network error");
                                }
                            });
                        }
                    });
                });
            };
            this.Login = function (username, password, groupid, callback, error_callback) {
                PublicKeyService.Fixed(function (key) {
                    var login = new Login();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            login.username = username;
                            login.password = password;
                            login.groupid = groupid;
                            login.$login(function (account) {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    }
                                    else {
                                        error_callback(account.code, account.message);
                                    }
                                }
                                else {
                                    error_callback(10000, "network error");
                                }
                            });
                        }
                    });
                });
            };
            this.Password = function (username, password, groupid, callback, error_callback) {
                PublicKeyService.Fixed(function (key) {
                    var pass = new Password();
                    username_and_password_encrypt(key, username, password, function (error, username, password) {
                        if (!error) {
                            pass.username = username;
                            pass.password = password;
                            pass.groupid = groupid;
                            pass.$change(function (account) {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    }
                                    else {
                                        error_callback(account.code, account.message);
                                    }
                                }
                                else {
                                    error_callback(10000, "network error");
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
                            callback(account.value);
                        }
                    }
                });
            };
        }]);
    AuthServices.service('ProfileService', ["Profile",
        function (Profile) {
            this.Get = function (callback, error_callback) {
                Profile.get({}, function (result) {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error_callback(result.code, result.message);
                        }
                    }
                    else {
                        error_callback(10000, "network error");
                    }
                });
            };
            this.Put = function (content, callback, error_callback) {
                var self = new Profile();
                self.local = content;
                self.$put({}, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error_callback(result.code, result.message);
                        }
                    }
                    else {
                        error_callback(10000, "network error");
                    }
                });
            };
        }]);
})(AuthServicesModule || (AuthServicesModule = {}));
//# sourceMappingURL=auth_services.js.map