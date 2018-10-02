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

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
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
            Wrapper.FindOne(response, 1, LocalAccount, {username: request.user.username}, (response: any, self: any): void => {
                if (self) {
                    self.local = request.body.local;
                    self.open = true;
                    Wrapper.Save(response, 1, self, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "profile not found", {code: 2, message: "profile not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_profile(request: any, response: any): void {
            Wrapper.FindOne(response, 1, LocalAccount, {username: request.user.username}, (response: any, self: any): void => {
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
            });
        }
    }
}

module.exports = ProfileModule;
