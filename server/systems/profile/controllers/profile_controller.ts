/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as ConfigModule from 'config';

import * as mongoose from 'mongoose';

import * as Wrapper from "../../../../server/systems/common/wrapper";
import * as LocalAccount from "../../../../models/systems/accounts/account";

mongoose.Promise = global.Promise;

const config: any = ConfigModule.get("systems");

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

export class Profile {

    /**
     * @param request
     * @returns userid
     */
    static userid(request): string {
        return request.user.userid;
    }

    /**
     * @param request
     * @param response
     * @returns none
     */
    public get_profile(request: any, response: any): void {
        let user = request.user;
        if (user) {
            wrapper.FindOne(LocalAccount, {username: user.username}, (error: any, self: any): void => {
                if (!error) {
                    if (self) {

                        let entry_point = "";
                        if (config.entry_point) {
                            entry_point = config.entry_point;
                        }

                        let exit_point = "";
                        if (config.exit_point) {
                            exit_point = config.exit_point;
                        }

                        let result: any = {
                            create: self.create,
                            modify: self.modify,
                            provider: self.provider,
                            username: self.username,
                            groupid: self.groupid,
                            userid: self.userid,
                            local: self.local,
                            enabled: self.enabled,
                            role: LocalAccount.Role(self),
                            entry: entry_point,
                            exit: exit_point
                        };
                        wrapper.SendSuccess(response, result);
                    } else {
                        wrapper.SendWarn(response, {code: 2, message: "profile not found"});
                    }
                } else {
                    wrapper.SendError(response, error);
                }
            });
        } else {
            wrapper.SendSuccess(response, {});
        }
    }

    /**
     * @param request
     * @param response
     * @returns none
     */
    public put_profile(request: any, response: any): void {
        wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, self: any): void => {
            if (!error) {
                if (self) {
                    self.local = request.body.local;
                    self.open = true;
                    wrapper.Save(self, (error: any, object: any): void => {
                        if (!error) {
                            wrapper.SendSuccess(response, object.local);
                        } else {
                            wrapper.SendError(response, error);
                        }
                    });
                } else {
                    wrapper.SendWarn(response, {code: 2, message: "profile not found"});
                }
            } else {
                wrapper.SendError(response, error);
            }
        });
    }

}

module.exports = Profile;
