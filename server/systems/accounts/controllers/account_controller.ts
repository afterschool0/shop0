/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AccountModule {

    const _: any = require('lodash');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;
    const path: any = require('path');

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

    export class Accounts {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        public account_query(request: any, response: any): void {
            let params = request.params;
            let query: any = Wrapper.Decode(params.query);
            let option: any = Wrapper.Decode(params.option);
            Wrapper.Find(LocalAccount, query, {}, option, (error: any, accounts: any): any => {
                if (!error) {
                    let result: any[] = [];
                    accounts.forEach(account => {
                        result.push(account.local);
                    });
                    Wrapper.SendRaw(response, result);
                } else {
                    Wrapper.SendRaw(response, []);
                }
            });
        }

        public account_count(request: any, response: any): void {
            let params = request.params;
            let query: any = Wrapper.Decode(params.query);
            Wrapper.Count(LocalAccount, query, (error: any, count: any) => {
                if (!error) {
                    Wrapper.SendSuccess(response, count);
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }

        public get_account(request: any, response: any): void {
            let params = request.params;
            Wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, account: any): void => {
                if (!error) {
                    if (account) {
                        Wrapper.SendSuccess(response, account.local);
                    } else {
                        Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                    }
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }

            });
        }

        public put_account(request: any, response: any): void {
            let params = request.params;
            Wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, account: any): void => {
                if (!error) {
                    if (account) {
                        account.local = request.body.local;
                        account.open = true;
                        Wrapper.Save(account, (error: any, object: any): void => {
                            if (!error) {
                                Wrapper.SendSuccess(response, object.local);
                            } else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    } else {
                        Wrapper.SendWarn(response, 3, "not found", {code: 2, message: "not found"});
                    }
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }

        public delete_account(request: any, response: any): void {
            let params = request.params;
            Wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, page: any): void => {
                if (!error) {
                    if (page) {
                        Wrapper.Remove(page, (error: any, obj:any): void => {
                            Wrapper.SendSuccess(response, {});
                        });
                    } else {
                        Wrapper.SendWarn(response, 3, "not found", {code: 2, message: "not found"});
                    }
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }

    }
}

module.exports = AccountModule;
