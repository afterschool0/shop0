/**!
 Copyright (c) 2018 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AuthServicesModule {

    let AuthServices: angular.IModule = angular.module('AuthServices', []);

    interface Encoded {
        status: string,
        cipher: string
    }

    AuthServices.service('AuthService', ["PublicKeyService",
        function (PublicKeyService): void {

            const POST = "POST";
            const default_header = {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                "x-requested-with": "XMLHttpRequest"
            };

            let publickey_encrypt = (key:string, plain:string, error:(status:string)=> void) => {
                let result :string = "";
                let username_encrypted :Encoded = cryptico.encrypt(plain, key);
                if (username_encrypted.status === "success") {
                    result = username_encrypted.cipher;
                } else {
                    error(username_encrypted.status);
                }
                return result;
            };

            let public_key = (key:string, username:string, password:string):{username:string,password:string} => {
                let result:{username:string,password:string} = {username:"",password:""};

                result.username = username;
                result.password = password;

                if (key) {
                    result.username = publickey_encrypt(key, username, (status) => {});
                    result.password = publickey_encrypt(key, password, (status) => {});
                }
                return result;
            };

            let access = (url: string, option: any, callback, error_callback): void => {
                fetch(url, option).then((res) => res.json()).then(
                    (account) => {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error_callback(account.code, account.message);
                            }
                        } else {
                            error_callback(10000, "network error");
                        }
                    }
                ).catch((error) => {
                    error_callback(10000, "network error")
                });
            };

            this.Regist = (username: string, password: string, metadata: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((error,key) => {
                    let regist:any = public_key(key, username, password);
                    regist.metadata = metadata;
                    const body = JSON.stringify(regist);
                    access("/auth/local/register", {method:POST, headers:default_header,body: body}, callback, error);
                });
            };

            this.Login = (username: string, password: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((error,key) => {
                    let login: { username: string, password: string } = public_key(key, username, password);
                    const body = JSON.stringify(login);
                    access("/auth/local/login", {method:POST, headers:default_header,body: body}, callback, error);
                });
            };

            this.Logout = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                access("/auth/logout", {method: "GET", cache: "no-cache", headers: default_header}, callback, error);
            };

            this.Password = (username: string, password: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((error,key) => {
                    let pass: { username: string, password: string } = public_key(key, username, password);
                    const body = JSON.stringify(pass);
                    access("/auth/local/password", {method:POST, headers:default_header,body: body}, callback, error);
                });
            };

        }]);

    AuthServices.service('ProfileService', [
        function (): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let self: any = {};

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/profile/api", options).then((res) => res.json()).then(
                    (account) => {
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
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });
            };

            this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let self: any = {};
                self.local = content;

                const method = "PUT";
                const body = JSON.stringify(self);
                const headers = {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    "x-requested-with": "XMLHttpRequest"
                };

                fetch("/profile/api", {method, headers, body}).then((res) => res.json()).then(
                    (account) => {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error(account.code, account.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });

            };

        }]);

}

