/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace PublicKeyServicesModule {

    let PublicKeyServices: angular.IModule = angular.module('PublicKeyServices', []);

    PublicKeyServices.service('PublicKeyService', [
        function (): void {

            this.Fixed = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/publickey/fixed", options).then((res) => res.json()).then(
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

            this.Dynamic = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/publickey/dynamic", options).then((res) => res.json()).then(
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

            this.Token = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/publickey/token", options).then((res) => res.json()).then(
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

        }]);

}