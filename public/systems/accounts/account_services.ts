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
        function (Account: any, AccountQuery: any, AccountCount: any): void {

            this.Query = (query: any, option: any, callback: (error, result: any[]) => void): void => {
                AccountQuery.query({query: JSON.stringify(query)}, {option: JSON.stringify(option)}, (result: any[]): void => {
                    if (result) {
                        callback(null, result);
                    } else {
                        callback({code: 10000, message: "network error"}, []);
                    }
                });
            };

            this.Count = (query: any, callback: (error:any, result: number) => void): void => {
                AccountCount.count({query: JSON.stringify(query)}, (result: any): void => {
                    if (result) {
                        callback(null, result);
                    } else {
                        callback({code: 10000, message: "network error"}, 0);
                    }
                });
            };

            this.Get = (username: string, callback: (error:any, result: any) => void): void => {
                Account.get({username: username}, (result: any): void => {
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
            };

            this.Put = (username: any, content: any, callback: (error:any, result: any) => void): void => {
                let account = new Account();
                account.content = content;
                account.$put({
                    username: username
                }, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(null, result);
                            this.dirty = false;
                        } else {
                            callback(result, null);
                        }
                    } else {
                        callback({code: 10000, message: "network error"}, null);
                    }
                });
            };

            this.Delete = (username: string, callback: (error:any, result: any) => void): void => {
                Account.delete({username: username}, (result: any): void => {
                    if (result) {
                        callback(null, result);
                    } else {
                        callback({code: 10000, message: "network error"}, null);
                    }
                });
            };

        }]);
}