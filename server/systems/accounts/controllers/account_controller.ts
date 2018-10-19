/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as Mongoose from 'mongoose';
import * as LocalAccount from "../../../../models/systems/accounts/account";
import * as Wrapper from "../../../../server/systems/common/wrapper";

Mongoose.Promise = global.Promise;

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

export class Accounts {

    constructor() {

    }

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
        let query: any = wrapper.Decode(params.query);
        let option: any = wrapper.Decode(params.option);
        wrapper.Find(LocalAccount, query, {}, option, (error: any, accounts: any): any => {
            if (!error) {
                let result: any[] = [];
                accounts.forEach(account => {
                    result.push(account.local);
                });
                wrapper.SendRaw(response, result);
            } else {
                wrapper.SendRaw(response, []);
            }
        });
    }

    public account_count(request: any, response: any): void {
        let params = request.params;
        let query: any = wrapper.Decode(params.query);
        wrapper.Count(LocalAccount, query, (error: any, count: any) => {
            if (!error) {
                wrapper.SendSuccess(response, count);
            } else {
                wrapper.SendError(response, error);
            }
        });
    }

    public get_account(request: any, response: any): void {
        let params = request.params;
        wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, account: any): void => {
            if (!error) {
                if (account) {
                    wrapper.SendSuccess(response, account.local);
                } else {
                    wrapper.SendWarn(response, {code: 2, message: "not found"});
                }
            } else {
                wrapper.SendError(response, error);
            }
        });
    }

    public put_account(request: any, response: any): void {
        let params = request.params;
        wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, account: any): void => {
            if (!error) {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    wrapper.Save(account, (error: any, object: any): void => {
                        if (!error) {
                            wrapper.SendSuccess(response, object.local);
                        } else {
                            wrapper.SendError(response, error);
                        }
                    });
                } else {
                    wrapper.SendWarn(response, {code: 2, message: "not found"});
                }
            } else {
                wrapper.SendError(response, error);
            }
        });
    }

    public delete_account(request: any, response: any): void {
        let params = request.params;
        wrapper.FindOne(LocalAccount, {username: params.username}, (error: any, page: any): void => {
            if (!error) {
                if (page) {
                    wrapper.Remove(page, (error: any, obj: any): void => {
                        wrapper.SendSuccess(response, {});
                    });
                } else {
                    wrapper.SendWarn(response, {code: 2, message: "not found"});
                }
            } else {
                wrapper.SendError(response, error);
            }
        });
    }

}

module.exports = Accounts;
