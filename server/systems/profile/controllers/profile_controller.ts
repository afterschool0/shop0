/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ProfileModule {

    const _: any = require('lodash');
    const path: any = require('path');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const _config: any = require('config');
    const config: any = _config.get("systems");

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper2"));
    const Wrapper: any = new PromisedModule.Wrapper();

    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

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
        public put_profile(request: any, response: any): void {
            Wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, self: any): void => {
                if (!error) {
                    if (self) {
                        self.local = request.body.local;
                        self.open = true;
                        Wrapper.Save(self, (error: any, object: any): void => {
                            if (!error) {
                                Wrapper.SendSuccess(response, object.local);
                            } else {
                                Wrapper.SendError(response, error.code,error.message, error);
                            }
                        });
                    } else {
                        Wrapper.SendWarn(response, 2, "profile not found", {code: 2, message: "profile not found"});
                    }
                } else {
                    Wrapper.SendError(response, error.code,error.message, error);
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_profile(request: any, response: any): void {
            let user = request.user;
            if (user) {
                Wrapper.FindOne(LocalAccount, {username: user.username}, (error: any, self: any): void => {
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

                            Wrapper.SendSuccess(response, {
                                provider: self.provider,
                                auth: self.auth,
                                username: self.username,
                                groupid: self.groupid,
                                userid: self.userid,
                                local: self.local,
                                role: self.Role(),
                                entry:entry_point,
                                exit:exit_point
                            });
                        } else {
                            Wrapper.SendWarn(response, 2, "profile not found", {code: 2, message: "profile not found"});
                        }
                    } else {
                        Wrapper.SendError(response, error.code,error.message, error);
                    }
                });
            } else {
                Wrapper.SendSuccess(response, {});
            }

        }
    }
}

module.exports = ProfileModule;
