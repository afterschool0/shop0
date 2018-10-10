/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountServicesModule {

    let AccountServices: angular.IModule = angular.module('AccountServices', []);

    AccountServices.factory('Account', ['$resource',
        ($resource: any): any => {
            return $resource('/accounts/api/:username', {username: "@username"}, {
                get: {method: 'GET'},
                put: {method: 'PUT'},
                delete: {method: 'DELETE'}
            });
        }]);

    AccountServices.factory('AccountQuery', ['$resource',
        ($resource: any): any => {
            return $resource('/accounts/api/query/:query/:option', {query: '@query', option: '@option'}, {
                query: {method: 'GET', isArray: true}
            });
        }]);

    AccountServices.factory('AccountCount', ['$resource',
        ($resource: any): any => {
            return $resource('/accounts/api/count/:query', {query: "@query"}, {
                count: {method: 'GET'}
            });
        }]);

    AccountServices.service('AccountService', ['Account', 'AccountQuery', 'AccountCount',
        function (Account: any, AccountQuery: any, AccountCount:any): void {

            this.Query = (query:any,option:any, callback: (result: any[]) => void, error: (code: number, message: string) => void): void => {
                AccountQuery.query({query: JSON.stringify(query)},{option: JSON.stringify(option)}, (result: any[]): void => {
                    if (result) {
                        callback(result);
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Count = (query: any, callback: (result: any[]) => void, error: (code: number, message: string) => void): void => {
                AccountCount.count({query: JSON.stringify(query)}, (result: any): void => {
                    if (result) {
                        callback(result);
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Get = (username: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                Account.get({username: username}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (username: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let account = new Account();
                account.content = content;
                account.$put({
                    username: username
                }, (result: any): void => {
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
                });
            };

            this.Delete = (username: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                Account.delete({username: username}, (result: any): void => {
                    if (result) {
                        callback(result);
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);
}