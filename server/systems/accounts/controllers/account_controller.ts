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
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1, LocalAccount, query, {}, option, (response: any, accounts: any): any => {
                let result:any[] = [];
                accounts.forEach(account => {
                    result.push(account.local);
                });
                Wrapper.SendRaw(response, result);
            });
        }

        public account_count(request: any, response: any): void {
            let query: any = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 1, LocalAccount, query,  (response: any, count: any) => {
                Wrapper.SendSuccess(response, count);
            });
        }

        public get_account(request: any, response: any): void {
            Wrapper.FindOne(response, 1, LocalAccount,  {username: request.params.username}, (response: any, account: any): void => {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        public put_account(request: any, response: any): void {
            Wrapper.FindOne(response, 1, LocalAccount, {username: request.params.username}, (response: any, account: any): void => {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, 2, account, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                } else {
                    Wrapper.SendWarn(response, 3, "not found", {code: 2, message: "not found"});
                }
            });
        }

        public delete_account(request: any, response: any): void {
            Wrapper.FindOne(response, 1, LocalAccount, {username: request.params.username}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, 2, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 3, "not found", {code: 2, message: "not found"});
                }
            });
        }

    }
}

module.exports = AccountModule;
