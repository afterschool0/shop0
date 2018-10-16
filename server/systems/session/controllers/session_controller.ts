/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SessionModule {

    const _: any = require('lodash');
    const path: any = require('path');

    const config: any = require('config').get("systems");

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

    export class Session {

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_session(request: any, response: any): void {
            let self: any = request.session.req.user;
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
                    //auth: self.auth,
                    username: self.username,
                    groupid: self.groupid,
                    userid: self.userid,
                    local: self.local,
                    enabled: self.enabled,
                    role: LocalAccount.Role(self.auth),
                    entry:entry_point,
                    exit:exit_point,
                    data: self.data
                };
                Wrapper.SendSuccess(response, result);
            } else {
                Wrapper.SendSuccess(response, {});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_session(request: any, response: any): void {
            let user: any = request.session.req.user;
            if (user) {
                if (!user.data) {
                    user.data = {};
                }
                user.data = _.merge(user.data, request.body.data);
                request.session.save();
                Wrapper.SendSuccess(response, user.data);
            } else {
                Wrapper.SendError(response, 2, "not found", {code: 2, message: "not found"});
            }
        }
    }
}

module.exports = SessionModule;
