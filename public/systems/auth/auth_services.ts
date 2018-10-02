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
                let username_encrypted = cryptico.encrypt(plain, key);
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

            this.Regist = (username: string, password: string, displayName: string, metadata: any, callback: (result: any) => void, error_callback: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((key) => {
                    let regist: any = new Register();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            regist.username = username;
                            regist.password = password;
                            regist.displayName = displayName;
                            regist.metadata = metadata;
                            regist.$regist((account: any): void => {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    } else {
                                        error_callback(account.code, account.message);
                                    }
                                } else {
                                    error_callback(10000, "network error");
                                }
                            });
                        }
                    });
                });
            };

            this.Login = (username: string, password: string, callback: (result: any) => void, error_callback: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((key) => {
                    let login = new Login();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            login.username = username;
                            login.password = password;
                            login.$login((account: any): void => {  //ログイン
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    } else {
                                        error_callback(account.code, account.message);
                                    }
                                } else {
                                    error_callback(10000, "network error");
                                }
                            });
                        }
                    });
                });
            };

            this.Password = (username: string, password: string, callback: (result: any) => void, error_callback: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((key) => {
                    let pass: any = new Password();
                    username_and_password_encrypt(key, username, password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            pass.username = username;
                            pass.password = password;
                            pass.$change((account: any): void => {
                                if (account) {
                                    if (account.code === 0) {
                                        callback(account.value);
                                    } else {
                                        error_callback(account.code, account.message);
                                    }
                                } else {
                                    error_callback(10000, "network error");
                                }
                            });
                        }
                    });
                });
            };

            this.Logout = (callback: (result: any) => void): void => {
                let logout: any = new Logout();
                logout.$logout((account: any): void => {
                    if (account) {
                        if (account.code === 0) {
                            callback(account.value);
                        }
                    }
                });
            };

        }]);

    AuthServices.service('ProfileService', ["Profile",
        function (Self: any): void {

            this.Get = (callback: (result: any) => void, error_callback: (code: number, message: string) => void): void => {
                Self.get({}, (result: any): void => {
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
                    } else {
                        error_callback(10000, "network error");
                    }
                });
            };

            this.Put = (content: any, callback: (result: any) => void, error_callback: (code: number, message: string) => void): void => {
                let self = new Self();
                self.local = content;
                self.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error_callback(result.code, result.message);
                        }
                    } else {
                        error_callback(10000, "network error");
                    }
                });
            };

        }]);
}