/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountServicesModule {

    let AccountServices: angular.IModule = angular.module('AccountServices', []);

    //AccountServices.factory('Account', ['$resource',
    //    ($resource: any): any => {
    //        return $resource('/accounts/api/:username', {username: "@username"}, {
    //            get: {method: 'GET'},
    //            put: {method: 'PUT'},
    //            delete: {method: 'DELETE'}
    //        });
    //    }]);
//
    //AccountServices.factory('AccountQuery', ['$resource',
    //    ($resource: any): any => {
    //        return $resource('/accounts/api/query/:query/:option', {query: '@query', option: '@option'}, {
    //            query: {method: 'GET', isArray: true}
    //        });
    //    }]);
//
    //AccountServices.factory('AccountCount', ['$resource',
    //    ($resource: any): any => {
    //        return $resource('/accounts/api/count/:query', {query: "@query"}, {
    //            count: {method: 'GET'}
    //        });
    //    }]);

    AccountServices.service('AccountService', [
        function (): void {

            this.Query = (query:any,option:any, callback: (result: any[]) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/accounts/api/query/" + query + "/" + option, options).then((res) => res.json()).then(
                    (result) => {
                        if (result) {
                            callback(result);
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });

            };

            this.Count = (query: any, callback: (result: any[]) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/accounts/api/count/" + query, options).then((res) => res.json()).then(
                    (result) => {
                        if (result) {
                            callback(result);
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });

            };

            this.Get = (username: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/accounts/api/" + username, options).then((res) => res.json()).then(
                    (result) => {
                        if (result) {
                            if (result.code === 0) {
                                callback(result.value);
                            } else {
                                error(result.code, result.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });

            };

            this.Put = (username: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "PUT",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/accounts/api/" + username, options).then((res) => res.json()).then(
                    (result: any): void => {
                        if (result) {
                            if (result.code === 0) {
                                callback(result.value);
                                this.dirty = false;
                            } else {
                                error(result.code, result.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    }
                ).catch(() => {
                    error(10000, "network error")
                });

            };

            this.Delete = (username: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                let options: any = {
                    method: "DELETE",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };

                fetch("/accounts/api/" + username, options).then((res) => res.json()).then(
                    (result: any): void => {
                        if (result) {
                            callback(result);
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