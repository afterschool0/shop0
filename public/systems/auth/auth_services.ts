/**!
 Copyright (c) 2018 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AuthServicesModule {

    let AuthServices: angular.IModule = angular.module('AuthServices', []);

    AuthServices.factory('Profile', ['$resource',
        ($resource: any): any => {
            return $resource('/profile/api', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'},
            });
        }]);

    AuthServices.factory('Register', ['$resource',
        ($resource: any): any => {
            return $resource('/auth/local/register', {}, {
                regist: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Login', ['$resource',
        ($resource: any): any => {
            return $resource('/auth/local/login', {}, {
                login: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Password', ['$resource',
        ($resource: any): any => {
            return $resource('/auth/local/password', {}, {
                change: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Logout', ['$resource',
        ($resource: any): any => {
            return $resource('/auth/logout', {}, {
                logout: {method: 'GET'}
            });
        }]);

    AuthServices.service('AuthService', ["Register", "Login", "Logout", "Password", "PublicKeyService",
        function (Register: any, Login: any, Logout: any, Password: any, PublicKeyService): void {

            let publickey_encrypt = (key: string, plain: string, callback: (error: any, result: string) => void) => {
                let username_encrypted = cryptico.encrypt(encodeURIComponent(plain), key); // encrypt漢字
                if (username_encrypted.status === "success") {
                    callback(null, username_encrypted.cipher);
                } else {
                    callback({code: 1, message: username_encrypted.status}, "");
                }
            };

            let username_and_password_encrypt = (systempassphrase: string, username: string, password: string, callback: (error: any, username: string, password: string) => void) => {
                if (systempassphrase) {
                    publickey_encrypt(systempassphrase, username, (error, encrypted_username): void => {
                        if (!error) {
                            publickey_encrypt(systempassphrase, password, (error, encrypted_password): void => {
                                if (!error) {
                                    callback(null, encrypted_username, encrypted_password);
                                } else {
                                    callback(error, "", "");
                                }
                            });
                        } else {
                            callback(error, "", "");
                        }
                    });
                } else {
                    callback(null, username, password);
                }
            };

            this.Regist = (username: string, password: string, metadata: any, callback: (error: any, result: any) => void): void => {
                PublicKeyService.Fixed((error, key) => {
                    let regist: any = new Register();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            regist.username = username;
                            regist.password = password;
                            regist.metadata = metadata;
                            regist.$regist((account: any): void => {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(null, account.value);
                                    } else {
                                        callback(account, null);
                                    }
                                } else {
                                    callback({code: 10000, message: "network error"}, null);
                                }
                            });
                        }
                    });
                });
            };

            this.Login = (username: string, password: string, callback: (error: any, result: any) => void): void => {
                PublicKeyService.Fixed((error, key) => {
                    let login = new Login();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            login.username = username;
                            login.password = password;
                            login.$login((result: any): void => {  //ログイン
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
                        }
                    });
                });
            };

            this.Password = (username: string, password: string, callback: (error: any, result: any) => void): void => {
                PublicKeyService.Fixed((error, key) => {
                    let pass: any = new Password();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            pass.username = username;
                            pass.password = password;
                            pass.$change((result: any): void => {
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
                        }
                    });
                });
            };

            this.Logout = (callback: (error: any, result: any) => void): void => {
                let logout: any = new Logout();
                logout.$logout((account: any): void => {
                    if (account) {
                        if (account.code === 0) {
                            callback(null, account.value);
                        }
                    } else {
                        callback({code: 10000, message: "network error"}, null);
                    }
                });
            };

        }]);
}